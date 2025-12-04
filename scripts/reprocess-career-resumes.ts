#!/usr/bin/env tsx

import { analyzeResume } from "@/lib/resume-analysis";
import { downloadCareerApplicantResume } from "@/lib/server/careers-supabase";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

type Row = {
  id: string;
  resume_insights: unknown;
};

const MIN_SUMMARY_LENGTH = 50;

function needsReprocess(insights: unknown): boolean {
  if (!insights || typeof insights !== "object") return true;
  const summary = (insights as { summary?: string }).summary ?? "";
  if (!summary || summary.trim().length < MIN_SUMMARY_LENGTH) return true;
  return false;
}

async function main() {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.from("career_applications").select("id, resume_insights");
  if (error) {
    console.error("Supabase fetch error:", error.message);
    process.exit(1);
  }
  const rows = data ?? [];
  const targets = rows.filter((row) => needsReprocess(row.resume_insights));
  console.log(`Found ${targets.length} applications needing reprocess out of ${rows.length}.`);

  let updated = 0;
  for (const row of targets) {
    try {
      const resume = await downloadCareerApplicantResume(row.id);
      const insights = await analyzeResume(resume.buffer, {
        mimeType: resume.mimeType,
        filename: resume.filename,
      });
      const { error: updateError } = await supabase
        .from("career_applications")
        .update({ resume_insights: insights })
        .eq("id", row.id);
      if (updateError) {
        console.warn(`Failed to update ${row.id}: ${updateError.message}`);
        continue;
      }
      updated += 1;
      console.log(`Reprocessed ${row.id} (${resume.filename})`);
    } catch (err) {
      console.warn(`Reprocess failed for ${row.id}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`Reprocess complete. Updated ${updated}/${targets.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
