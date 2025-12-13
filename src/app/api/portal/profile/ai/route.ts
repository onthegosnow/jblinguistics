import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import { createSupabaseAdminClient, RESUME_BUCKET } from "@/lib/supabase-server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MAX_TEXT_CHARS = 60000;

async function getPdfParse() {
  const mod: any = await import("pdf-parse");
  const fn = mod?.default ?? mod;
  if (typeof fn !== "function") throw new Error("pdf-parse module did not export a function");
  return fn as (buffer: Buffer) => Promise<{ text?: string }>;
}

async function getMammoth() {
  const mod: any = await import("mammoth");
  return mod.default ?? mod;
}

async function fetchResumeBuffer(supabase: ReturnType<typeof createSupabaseAdminClient>, path: string) {
  const { data, error } = await supabase.storage.from(RESUME_BUCKET).download(path);
  if (error || !data) throw new Error(error?.message || "Unable to download resume");
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function extractTextFromResume(buffer: Buffer, mimeType?: string | null, filename?: string | null) {
  const lowerMime = (mimeType || "").toLowerCase();
  const lowerName = (filename || "").toLowerCase();

  // Try PDF first
  if (lowerMime.includes("pdf") || lowerName.endsWith(".pdf")) {
    try {
      const pdfParse = await getPdfParse();
      const parsed = await pdfParse(buffer);
      const text = parsed.text?.replace(/\s+/g, " ").trim();
      if (text) return { text, truncated: text.length > MAX_TEXT_CHARS };
    } catch (err) {
      console.warn("pdf-parse failed; falling back to base64 chunk", err);
    }
  }

  // Try DOCX/Word
  if (lowerMime.includes("officedocument") || lowerMime.includes("msword") || lowerName.endsWith(".docx") || lowerName.endsWith(".doc")) {
    try {
      const mammoth = await getMammoth();
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value?.replace(/\s+/g, " ").trim();
      if (text) return { text, truncated: text.length > MAX_TEXT_CHARS };
    } catch (err) {
      console.warn("mammoth docx parse failed; falling back to base64 chunk", err);
    }
  }

  // Try plain text
  if (lowerMime.includes("text")) {
    const text = buffer.toString("utf8").replace(/\s+/g, " ").trim();
    if (text) return { text, truncated: text.length > MAX_TEXT_CHARS };
  }

  // Fallback: base64 chunk
  const b64 = buffer.toString("base64");
  const chunk = b64.slice(0, MAX_TEXT_CHARS);
  return { text: chunk, truncated: b64.length > chunk.length, isBase64: true };
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  if (!OPENAI_API_KEY) return NextResponse.json({ message: "OPENAI_API_KEY not set" }, { status: 500 });

  const body = (await request.json().catch(() => ({}))) as {
    prompt?: string;
    current?: { tagline?: string; overview?: string; background?: string[]; focus?: string[] };
  };
  const userPrompt = body.prompt?.trim();
  const current = body.current ?? {};

  const supabase = createSupabaseAdminClient();

  // Pick resume source: override -> career_applications resume -> latest user upload
  const [{ data: emp }, applicantRes, uploadsRes, profileRes] = await Promise.all([
    supabase
      .from("portal_employees")
      .select(
        "resume_override_path, resume_override_name, teacher_role, translator_role, teaching_languages, translating_languages, certifications"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("career_applications").select("resume_path, resume_filename").eq("email", user.email ?? "").maybeSingle(),
    supabase
      .from("portal_user_uploads")
      .select("path, filename, mime_type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("portal_users").select("name, languages").eq("id", user.id).maybeSingle(),
  ]);

  let resumePath: string | null = emp?.resume_override_path ?? applicantRes.data?.resume_path ?? null;
  let resumeName: string | null = emp?.resume_override_name ?? applicantRes.data?.resume_filename ?? null;
  let resumeMime: string | null = null;

  // fallback to most recent PDF/Word upload
  if (!resumePath && uploadsRes.data?.length) {
    const preferred = uploadsRes.data.find(
      (u) => (u.mime_type || "").includes("pdf") || (u.mime_type || "").includes("msword") || (u.mime_type || "").includes("officedocument"),
    );
    if (preferred) {
      resumePath = preferred.path;
      resumeName = preferred.filename;
      resumeMime = preferred.mime_type ?? null;
    }
  } else if (resumePath && uploadsRes.data?.length) {
    // If we matched an upload path above, try to match mime
    const found = uploadsRes.data.find((u) => u.path === resumePath);
    if (found) resumeMime = found.mime_type ?? null;
  }

  if (!resumePath) {
    return NextResponse.json({ message: "No resume found. Please upload a PDF or Word resume (no Pages)." }, { status: 400 });
  }

  let resumeBuffer: Buffer;
  try {
    resumeBuffer = await fetchResumeBuffer(supabase, resumePath);
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to read resume." }, { status: 500 });
  }

  let resumeContent: { text: string; truncated?: boolean; isBase64?: boolean };
  try {
    resumeContent = await extractTextFromResume(resumeBuffer, resumeMime, resumeName);
  } catch (err) {
    console.error("Resume parse failed", err);
    return NextResponse.json({
      message: "Could not read your resume. Try re-uploading as PDF/Word (no images) and try again.",
    }, { status: 500 });
  }

  const { text, truncated, isBase64 } = resumeContent;
  const summaryNotice = truncated
    ? isBase64
      ? "Resume base64 was truncated to fit model limits."
      : "Resume text was truncated to fit model limits."
    : "";

  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const profileName = profileRes.data?.name || user.email || "JB Linguistics contractor";
    const roleLabels = [];
    if (emp?.teacher_role) roleLabels.push("teacher");
    if (emp?.translator_role) roleLabels.push("translator");
    const teachingLangs = Array.isArray(emp?.teaching_languages) ? emp?.teaching_languages : [];
    const translatingLangs = Array.isArray(emp?.translating_languages) ? emp?.translating_languages : [];
    const profileLangs = Array.isArray(profileRes.data?.languages) ? profileRes.data?.languages : [];

    const metadataBlock = [
      `Name: ${profileName}`,
      roleLabels.length ? `Roles: ${roleLabels.join(", ")}` : null,
      teachingLangs.length ? `Teaching languages: ${teachingLangs.join(", ")}` : null,
      translatingLangs.length ? `Translating languages: ${translatingLangs.join(", ")}` : null,
      profileLangs.length ? `Other languages: ${profileLangs.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const systemPrompt = [
      "You are helping write a concise, compelling bio for a JB Linguistics contractor (teacher/translator).",
      "Tailor the bio to language teaching/translation services, highlight experience, specialties, certifications.",
      "Keep it professional and warm. Use the provided name and roles if present; do not leave placeholders.",
      "Structure the output clearly:",
      "- Tagline: 1 sentence (concise) after the name and languages.",
      "- OVERVIEW: 2-3 sentences, paragraph.",
      "- EDUCATIONAL & PROFESSIONAL BACKGROUND: bullet list, 4-7 bullets.",
      "- LINGUISTIC FOCUS: bullet list, 3-6 bullets.",
      "Return plain text without Markdown or asterisks; no bold, no headings markup—just readable text and bullet lines prefixed with '-'.",
      isBase64
        ? "The resume was provided as a truncated base64 string; infer best you can from it."
        : "The resume text may be truncated; focus on clear highlights and specialties.",
      "Start from the provided current bio fields; improve them per the user request, don’t discard them.",
      "If current bullets exist, keep them unless the user explicitly asks to change them; only refine wording.",
      "If the user asks to add something, integrate it into the appropriate section (e.g., overview) while preserving existing content.",
      "Never leave the linguistic focus empty; if none is requested, keep the current focus bullets.",
      "If the user request mentions a theme (e.g., hosting language learning trips), add a concise sentence about it in the OVERVIEW.",
    ].join(" ");

    const finalPrompt = [
      `Contractor metadata: ${metadataBlock}`,
      current.tagline ? `Current tagline: ${current.tagline}` : "",
      current.overview ? `Current overview: ${current.overview}` : "",
      current.background?.length ? `Current background bullets:\n- ${current.background.join("\n- ")}` : "",
      current.focus?.length ? `Current linguistic focus bullets:\n- ${current.focus.join("\n- ")}` : "",
      userPrompt ? `User request: ${userPrompt}` : "",
      summaryNotice ? `Note: ${summaryNotice}` : "",
      isBase64 ? "Resume file (base64-encoded, possibly truncated):" : "Resume text (possibly truncated):",
      text,
    ]
      .filter(Boolean)
      .join("\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: finalPrompt },
      ],
    });

    const draft = completion.choices[0]?.message?.content?.trim();
    if (!draft) return NextResponse.json({ message: "No draft generated. Try again with a shorter prompt." }, { status: 500 });

    await supabase
      .from("portal_employees")
      .upsert({ user_id: user.id, ai_bio_draft: draft, ai_bio_prompt: userPrompt ?? null, ai_bio_updated_at: new Date().toISOString() });

    return NextResponse.json({ draft, resumeName, truncated: Boolean(truncated), isBase64: Boolean(isBase64) });
  } catch (err) {
    console.error("AI bio error", err);
    const message =
      err instanceof Error
        ? err.message
        : "Unable to generate bio. If this keeps happening, try re-uploading your resume as PDF/Word and shorten the prompt.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
