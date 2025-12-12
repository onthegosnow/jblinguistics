import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient, RESUME_BUCKET } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/server/storage";

const sanitizeFilename = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, "_");

export async function POST(request: Request) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const form = await request.formData();
  const name = (form.get("name") as string | null)?.trim();
  const email = (form.get("email") as string | null)?.trim();
  const rolesRaw = (form.get("roles") as string | null) ?? "";
  const languagesRaw = (form.get("languages") as string | null) ?? "";
  const resume = form.get("resume");

  if (!name || !email) {
    return NextResponse.json({ message: "Name and email are required." }, { status: 400 });
  }
  if (!(resume instanceof File)) {
    return NextResponse.json({ message: "Resume PDF is required." }, { status: 400 });
  }

  const roles = rolesRaw
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const languages = languagesRaw
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

  const supabase = createSupabaseAdminClient();
  const safeFilename = sanitizeFilename(resume.name || "resume.pdf");
  const applicantId = crypto.randomUUID();
  const resumePath = `applications/${applicantId}/${Date.now()}-${safeFilename}`;

  const buffer = Buffer.from(await resume.arrayBuffer());
  const upload = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(resumePath, buffer, { contentType: resume.type || "application/pdf", upsert: true });
  if (upload.error) {
    return NextResponse.json({ message: upload.error.message }, { status: 500 });
  }

  const { error } = await supabase.from("career_applications").insert({
    id: applicantId,
    submitted_at: new Date().toISOString(),
    name,
    email,
    roles: roles.length ? roles : ["translator"],
    working_languages: languages.length ? languages : null,
    resume_filename: safeFilename,
    resume_mime_type: resume.type || "application/pdf",
    resume_size: buffer.length,
    resume_path: resumePath,
  });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
