import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import { createSupabaseAdminClient, RESUME_BUCKET } from "@/lib/supabase-server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function fetchResumeBuffer(supabase: ReturnType<typeof createSupabaseAdminClient>, path: string) {
  const { data, error } = await supabase.storage.from(RESUME_BUCKET).download(path);
  if (error || !data) throw new Error(error?.message || "Unable to download resume");
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  if (!OPENAI_API_KEY) return NextResponse.json({ message: "OPENAI_API_KEY not set" }, { status: 500 });

  const body = (await request.json().catch(() => ({}))) as { prompt?: string };
  const userPrompt = body.prompt?.trim();

  const supabase = createSupabaseAdminClient();

  // Pick resume source: override -> career_applications resume -> latest user upload
  const [{ data: emp }, applicantRes, uploadsRes] = await Promise.all([
    supabase.from("portal_employees").select("resume_override_path, resume_override_name").eq("user_id", user.id).maybeSingle(),
    supabase.from("career_applications").select("resume_path, resume_filename").eq("email", user.email ?? "").maybeSingle(),
    supabase
      .from("portal_user_uploads")
      .select("path, filename, mime_type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  let resumePath: string | null = emp?.resume_override_path ?? applicantRes.data?.resume_path ?? null;
  let resumeName: string | null = emp?.resume_override_name ?? applicantRes.data?.resume_filename ?? null;

  // fallback to most recent PDF/Word upload
  if (!resumePath && uploadsRes.data?.length) {
    const preferred = uploadsRes.data.find(
      (u) => (u.mime_type || "").includes("pdf") || (u.mime_type || "").includes("msword") || (u.mime_type || "").includes("officedocument"),
    );
    if (preferred) {
      resumePath = preferred.path;
      resumeName = preferred.filename;
    }
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

  const resumeText = resumeBuffer.toString("base64"); // we’ll send base64 and let the model know

  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const systemPrompt = [
      "You are helping write a concise, compelling bio for a JB Linguistics contractor (teacher/translator).",
      "Tailor the bio to language teaching/translation services, highlight experience, specialties, certifications.",
      "Keep it professional, friendly, 120-200 words.",
      "You receive the resume as base64; infer content accordingly.",
    ].join(" ");

    const finalPrompt = [userPrompt ? `User preference: ${userPrompt}` : "", "Resume file (base64-encoded):", resumeText].join("\n\n");

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

    return NextResponse.json({ draft, resumeName });
  } catch (err) {
    console.error("AI bio error", err);
    const message =
      err instanceof Error
        ? err.message
        : "Unable to generate bio. If this keeps happening, try re-uploading your resume as PDF/Word and shorten the prompt.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
