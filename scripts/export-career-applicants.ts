#!/usr/bin/env tsx

import { createSupabaseAdminClient } from "../src/lib/supabase-server";

type Row = {
  id: string;
  submitted_at: string;
  name: string;
  email: string | null;
  location: string | null;
  languages: string | null;
  working_languages: string[] | null;
  experience: string | null;
  availability: string | null;
  message: string | null;
  landing: string | null;
  roles: string[] | null;
  resume_filename: string;
  resume_mime_type: string;
  resume_size: number | null;
  resume_insights: unknown;
};

const headers = [
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
  "landing",
  "roles",
  "resume_filename",
  "resume_mime_type",
  "resume_size",
  "resume_insights",
];

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = typeof value === "string" ? value : Array.isArray(value) || typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("career_applications")
    .select(
      "id, submitted_at, name, email, location, languages, working_languages, experience, availability, message, landing, roles, resume_filename, resume_mime_type, resume_size, resume_insights",
    )
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error.message);
    process.exit(1);
  }

  const rows = data ?? [];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.id,
        row.submitted_at,
        row.name,
        row.email,
        row.location,
        row.languages,
        row.working_languages,
        row.experience,
        row.availability,
        row.message,
        row.landing,
        row.roles,
        row.resume_filename,
        row.resume_mime_type,
        row.resume_size ?? "",
        row.resume_insights,
      ]
        .map(escapeCsv)
        .join(","),
    );
  }

  process.stdout.write(lines.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
