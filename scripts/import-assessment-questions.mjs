/**
 * Import assessment questions from ChatGPT-generated JSON files
 *
 * Usage: node scripts/import-assessment-questions.mjs <path-to-json-file>
 *
 * Example: node scripts/import-assessment-questions.mjs "/Users/Ryan1/Downloads/files 2/Language Tests/English/english_A1_2000.json"
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map ChatGPT types to your modalities
function mapTypeToModality(type) {
  switch (type.toLowerCase()) {
    case "grammar":
    case "sentence":
      return "grammar";
    case "vocabulary":
    case "reading":
    case "listening":
      return "verbal";
    case "writing":
      return "writing";
    default:
      return "grammar"; // Default fallback
  }
}

function convertQuestion(q, level, language) {
  // Prepend passage to prompt for reading questions
  let prompt = q.prompt;
  if (q.passage) {
    prompt = `[Reading] ${q.passage}\n\n${q.prompt}`;
  }

  return {
    id: `${language}-${q.id}`,
    level,
    modality: mapTypeToModality(q.type),
    prompt,
    options: q.options,
    answerIndex: q.correctIndex,
    explanation: q.explanation,
  };
}

function convertQuestionBank(data) {
  const questions = [];
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  for (const level of levels) {
    const levelData = data.levels[level];
    if (!levelData) continue;

    for (const q of levelData.questions) {
      questions.push(convertQuestion(q, level, data.language));
    }
  }

  return questions;
}

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.error("Usage: node scripts/import-assessment-questions.mjs <path-to-json-file>");
    console.error('Example: node scripts/import-assessment-questions.mjs "/path/to/english_A1_2000.json"');
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`Reading: ${inputPath}`);
  const rawData = fs.readFileSync(inputPath, "utf-8");
  const data = JSON.parse(rawData);

  console.log(`Language: ${data.languageDisplay}`);
  console.log(`Total questions in file: ${data.totalQuestions}`);

  const questions = convertQuestionBank(data);
  console.log(`Converted ${questions.length} questions`);

  // Count by level
  const byLevel = {};
  for (const q of questions) {
    byLevel[q.level] = (byLevel[q.level] || 0) + 1;
  }
  console.log("By level:", byLevel);

  // Count by modality
  const byModality = {};
  for (const q of questions) {
    byModality[q.modality] = (byModality[q.modality] || 0) + 1;
  }
  console.log("By modality:", byModality);

  // Output file path - go up from scripts dir
  const projectRoot = path.resolve(__dirname, "..");
  const outputDir = path.join(projectRoot, "src", "lib", "assessment-questions");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFileName = `${data.language}-questions.json`;
  const outputPath = path.join(outputDir, outputFileName);

  fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
  console.log(`\nSaved to: ${outputPath}`);

  // Also generate a TypeScript file for type-safe imports
  // Uses 'as const' pattern to avoid TypeScript "union type too complex" error with large arrays
  const tsOutputPath = path.join(outputDir, `${data.language}-questions.ts`);
  const tsContent = `// Auto-generated from ${path.basename(inputPath)}
// Generated: ${new Date().toISOString()}

import type { AssessmentQuestion } from "../assessments";

// Use 'as const' to avoid complex union type error with large arrays
const ${data.language}Questions = ${JSON.stringify(questions, null, 2)} as const;

// Export with type assertion to satisfy consumers expecting AssessmentQuestion[]
export { ${data.language}Questions };
export default ${data.language}Questions as unknown as AssessmentQuestion[];
`;

  fs.writeFileSync(tsOutputPath, tsContent);
  console.log(`Saved TypeScript module to: ${tsOutputPath}`);
}

main().catch(console.error);
