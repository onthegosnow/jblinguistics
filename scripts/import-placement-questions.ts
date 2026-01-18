/**
 * Import placement test questions from JSON files
 *
 * Usage: npx tsx scripts/import-placement-questions.ts [path-to-json]
 *
 * JSON Format expected:
 * {
 *   "language": "english",
 *   "levels": {
 *     "A1": { "questions": [...] },
 *     "A2": { "questions": [...] },
 *     ...
 *   }
 * }
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

interface JsonQuestion {
  type: string; // grammar, vocabulary, reading, sentence
  prompt: string;
  passage?: string; // for reading questions
  options: string[];
  correctIndex: number;
  explanation: string;
  id: string;
}

interface JsonLevel {
  description: string;
  questionCount: number;
  questions: JsonQuestion[];
}

interface JsonFile {
  language: string;
  languageDisplay: string;
  totalQuestions: number;
  levels: Record<string, JsonLevel>;
}

function mapSkillArea(type: string): string | null {
  const mapping: Record<string, string> = {
    grammar: "grammar",
    vocabulary: "vocabulary",
    reading: "reading",
    sentence: "grammar", // sentence construction is grammar
    listening: "listening",
    writing: "writing",
  };
  return mapping[type.toLowerCase()] || null;
}

function mapCorrectAnswer(index: number): string {
  const answers = ["A", "B", "C", "D"];
  return answers[index] || "A";
}

async function importFile(filePath: string): Promise<{ imported: number; errors: string[] }> {
  console.log(`\nReading ${filePath}...`);

  const content = fs.readFileSync(filePath, "utf-8");
  const json: JsonFile = JSON.parse(content);

  console.log(`Language: ${json.languageDisplay}`);
  console.log(`Total questions in file: ${json.totalQuestions}`);

  const now = new Date().toISOString();
  const allRows: any[] = [];
  const errors: string[] = [];

  // Process each level
  for (const [level, levelData] of Object.entries(json.levels)) {
    if (!["A1", "A2", "B1", "B2", "C1", "C2"].includes(level)) {
      console.log(`  Skipping unknown level: ${level}`);
      continue;
    }

    console.log(`  Processing ${level}: ${levelData.questions.length} questions`);

    for (const q of levelData.questions) {
      try {
        // Build question text - include passage for reading questions
        let questionText = q.prompt;
        if (q.passage) {
          questionText = `${q.passage}\n\n${q.prompt}`;
        }

        const row = {
          language: json.language.toLowerCase(),
          cefr_level: level as CEFRLevel,
          question_text: questionText,
          question_type: "multiple_choice",
          option_a: q.options[0] || null,
          option_b: q.options[1] || null,
          option_c: q.options[2] || null,
          option_d: q.options[3] || null,
          correct_answer: mapCorrectAnswer(q.correctIndex),
          explanation: q.explanation || null,
          skill_area: mapSkillArea(q.type),
          topic: null,
          difficulty_weight: 1,
          source: `imported-${q.id}`,
          created_by: null,
          active: true,
          times_shown: 0,
          times_correct: 0,
          created_at: now,
          updated_at: now,
        };

        allRows.push(row);
      } catch (err) {
        errors.push(`Question ${q.id}: ${err instanceof Error ? err.message : "Invalid data"}`);
      }
    }
  }

  console.log(`\nPrepared ${allRows.length} questions for import`);

  // Insert in batches
  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < allRows.length; i += batchSize) {
    const batch = allRows.slice(i, i + batchSize);
    const { error } = await supabase.from("placement_questions").insert(batch);

    if (error) {
      errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      console.log(`  Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message}`);
    } else {
      imported += batch.length;
      console.log(`  Imported batch ${Math.floor(i / batchSize) + 1}: ${batch.length} questions`);
    }
  }

  return { imported, errors };
}

async function main() {
  const args = process.argv.slice(2);

  // Default to the Language Tests folder
  const defaultFolder = "/Users/Ryan1/Downloads/files 2/Language Tests/English";

  let filesToImport: string[] = [];

  if (args.length > 0) {
    // Specific file or folder provided
    const target = args[0];
    if (fs.statSync(target).isDirectory()) {
      filesToImport = fs.readdirSync(target)
        .filter(f => f.endsWith(".json"))
        .map(f => path.join(target, f));
    } else {
      filesToImport = [target];
    }
  } else {
    // Use default folder
    if (fs.existsSync(defaultFolder)) {
      filesToImport = fs.readdirSync(defaultFolder)
        .filter(f => f.endsWith(".json"))
        .map(f => path.join(defaultFolder, f));
    }
  }

  if (filesToImport.length === 0) {
    console.log("No JSON files found to import.");
    console.log("Usage: npx tsx scripts/import-placement-questions.ts [path-to-json-or-folder]");
    process.exit(1);
  }

  console.log(`Found ${filesToImport.length} JSON files to import:`);
  filesToImport.forEach(f => console.log(`  - ${path.basename(f)}`));

  let totalImported = 0;
  let totalErrors: string[] = [];

  for (const file of filesToImport) {
    const { imported, errors } = await importFile(file);
    totalImported += imported;
    totalErrors = totalErrors.concat(errors);
  }

  console.log("\n========================================");
  console.log(`Total imported: ${totalImported} questions`);
  if (totalErrors.length > 0) {
    console.log(`Errors: ${totalErrors.length}`);
    totalErrors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    if (totalErrors.length > 10) {
      console.log(`  ... and ${totalErrors.length - 10} more`);
    }
  }
}

main().catch(err => {
  console.error("Import failed:", err);
  process.exit(1);
});
