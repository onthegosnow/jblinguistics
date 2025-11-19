import { createClient } from "@supabase/supabase-js";
import { __questionBank } from "@/lib/teacher-assessment";
import type { TeacherAssessmentQuestion } from "@/lib/teacher-assessment";

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  const rows = (__questionBank as TeacherAssessmentQuestion[]).map((question) => ({
    id: question.id,
    level: question.level,
    prompt: question.prompt,
    options: question.options,
    answer_index: question.answerIndex,
    prompt_translations: question.promptByLang ?? null,
    options_translations: question.optionsByLang ?? null,
  }));

  console.log(`Preparing to upsert ${rows.length} questions…`);

  const batches = chunk(rows, 500);
  for (const batch of batches) {
    const { error } = await supabase.from("teacher_questions").upsert(batch, { onConflict: "id" });
    if (error) {
      throw error;
    }
  }

  console.log("Teacher questions synced successfully.");
}

main().catch((error) => {
  console.error("Failed to seed teacher questions", error);
  process.exit(1);
});
