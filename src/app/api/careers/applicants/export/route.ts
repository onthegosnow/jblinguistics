import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

const HEADERS = [
  "id",
  "submitted_at",
  "name",
  "email",
  "location",
  "languages",
  "working_languages",
  "experience",
  "availability",
  "message",
  "roles",
  "hire_sent_at",
  "interview_notes",
  "resume_filename",
  "resume_mime_type",
  "resume_size",
  "resume_insights",
  "translator_language",
  "translator_score",
] as const;

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("career_applications")
    .select(
      "id, submitted_at, name, email, location, languages, working_languages, experience, availability, message, landing, roles, hire_sent_at, resume_filename, resume_mime_type, resume_size, resume_insights, interview_notes"
    )
    .order("submitted_at", { ascending: false });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const rows = data ?? [];

  const translatorScores = await supabase
    .from("translator_exercises")
    .select("application_id, language, score");

  const translatorMap = new Map<string, { language?: string; score?: number | null }>();
  if (!translatorScores.error && translatorScores.data) {
    for (const row of translatorScores.data) {
      translatorMap.set(row.application_id, { language: row.language, score: row.score });
    }
  }

  const csvLines = [
    HEADERS.join(","),
    ...rows.map((row) => {
      const translator = translatorMap.get(row.id) ?? {};
      const values: Record<(typeof HEADERS)[number], string | number | null | undefined> = {
        id: row.id,
        submitted_at: row.submitted_at,
        name: row.name,
        email: row.email,
        location: row.location,
        languages: row.languages,
        working_languages: row.working_languages,
        experience: row.experience,
        availability: row.availability,
        message: row.message,
        roles: Array.isArray(row.roles) ? row.roles.join(";") : row.roles,
        hire_sent_at: row.hire_sent_at,
        interview_notes: row.interview_notes,
        resume_filename: row.resume_filename,
        resume_mime_type: row.resume_mime_type,
        resume_size: row.resume_size,
        resume_insights: row.resume_insights ? JSON.stringify(row.resume_insights) : null,
        translator_language: translator.language ?? null,
        translator_score: translator.score ?? null,
      };
      return HEADERS.map((key) => {
        const raw = values[key];
        if (raw === null || raw === undefined) return "";
        const str = String(raw);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",");
    }),
  ].join("\n");

  return new NextResponse(csvLines, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="career_applicants.csv"`,
    },
  });
}

