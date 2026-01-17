/**
 * Import assessment questions from ChatGPT-generated JSON files
 *
 * Usage: npx ts-node scripts/import-assessment-questions.ts <path-to-json-file>
 *
 * Example: npx ts-node scripts/import-assessment-questions.ts "/Users/Ryan1/Downloads/files 2/Language Tests/English/english_A1_2000.json"
 */

import * as fs from "fs";
import * as path from "path";

// ChatGPT format
interface ChatGPTQuestion {
  type: string; // "grammar" | "vocabulary" | "reading" | "sentence" | "listening"
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  id: string;
  passage?: string; // for reading questions
}

interface ChatGPTLevel {
  description: string;
  questionCount: number;
  questions: ChatGPTQuestion[];
}

interface ChatGPTQuestionBank {
  language: string;
  languageDisplay: string;
  totalQuestions: number;
  levels: {
    A1?: ChatGPTLevel;
    A2?: ChatGPTLevel;
    B1?: ChatGPTLevel;
    B2?: ChatGPTLevel;
    C1?: ChatGPTLevel;
    C2?: ChatGPTLevel;
  };
}

// Your system's format
type AssessmentLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type AssessmentModality = "grammar" | "verbal" | "writing";

interface AssessmentQuestion {
  id: string;
  level: AssessmentLevel;
  modality: AssessmentModality;
  prompt: string;
  options: string[];
  answerIndex: number;
  passage?: string; // For reading comprehension
  explanation?: string; // Keep for reference
}

// Map ChatGPT types to your modalities
function mapTypeToModality(type: string): AssessmentModality {
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

function convertQuestion(
  q: ChatGPTQuestion,
  level: AssessmentLevel,
  language: string
): AssessmentQuestion {
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

function convertQuestionBank(data: ChatGPTQuestionBank): AssessmentQuestion[] {
  const questions: AssessmentQuestion[] = [];
  const levels: AssessmentLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

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
    console.error("Usage: npx ts-node scripts/import-assessment-questions.ts <path-to-json-file>");
    console.error('Example: npx ts-node scripts/import-assessment-questions.ts "/path/to/english_A1_2000.json"');
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`Reading: ${inputPath}`);
  const rawData = fs.readFileSync(inputPath, "utf-8");
  const data: ChatGPTQuestionBank = JSON.parse(rawData);

  console.log(`Language: ${data.languageDisplay}`);
  console.log(`Total questions in file: ${data.totalQuestions}`);

  const questions = convertQuestionBank(data);
  console.log(`Converted ${questions.length} questions`);

  // Count by level
  const byLevel: Record<string, number> = {};
  for (const q of questions) {
    byLevel[q.level] = (byLevel[q.level] || 0) + 1;
  }
  console.log("By level:", byLevel);

  // Count by modality
  const byModality: Record<string, number> = {};
  for (const q of questions) {
    byModality[q.modality] = (byModality[q.modality] || 0) + 1;
  }
  console.log("By modality:", byModality);

  // Output file path
  const outputDir = path.join(process.cwd(), "src", "lib", "assessment-questions");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFileName = `${data.language}-questions.json`;
  const outputPath = path.join(outputDir, outputFileName);

  fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
  console.log(`\nSaved to: ${outputPath}`);

  // Also generate a TypeScript file for type-safe imports
  const tsOutputPath = path.join(outputDir, `${data.language}-questions.ts`);
  const tsContent = `// Auto-generated from ${path.basename(inputPath)}
// Generated: ${new Date().toISOString()}

import type { AssessmentQuestion } from "../assessments";

export const ${data.language}Questions: AssessmentQuestion[] = ${JSON.stringify(questions, null, 2)};

export default ${data.language}Questions;
`;

  fs.writeFileSync(tsOutputPath, tsContent);
  console.log(`Saved TypeScript module to: ${tsOutputPath}`);
}

main().catch(console.error);
