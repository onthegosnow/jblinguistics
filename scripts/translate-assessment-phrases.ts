import { promises as fs } from "fs";
import path from "path";
import { __questionBank, teacherAssessmentLanguages, getReflectionPrompts } from "@/lib/teacher-assessment";

const LANGUAGE_TARGETS: Record<string, string> = {
  german: "de",
  french: "fr",
  dutch: "nl",
  danish: "da",
  swedish: "sv",
  spanish: "es",
  portuguese: "pt",
  italian: "it",
  mandarin: "zh",
  japanese: "ja",
  korean: "ko",
};

const BASE_URL = process.env.LIBRETRANSLATE_URL || "http://127.0.0.1:5000";
type TranslationFile = {
  questions: Record<string, { prompt: string; options: [string, string, string, string] }>;
  reflections: { conflict: string; attendance: string };
};

async function translateRaw(text: string, target: string) {
  const body = { q: text, source: "en", target, format: "text" };
  const response = await fetch(`${BASE_URL}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Translation failed (${response.status}): ${errorText}`);
  }
  const data = (await response.json()) as { translatedText: string };
  return data.translatedText;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function cleanTranslation(text: string, target: string) {
  const segments = Array.from(new Set(text.match(/[A-Za-z][A-Za-z\s,'-]*/g) ?? []));
  let current = text;
  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const translatedSegment = await translateRaw(trimmed, target);
    current = current.replace(new RegExp(escapeRegExp(segment), "g"), translatedSegment);
  }
  return current;
}

async function translateSingle(text: string, target: string) {
  const raw = await translateRaw(text, target);
  return cleanTranslation(raw, target);
}

async function translateQuestionsForLanguage(langId: string, targetCode: string): Promise<TranslationFile> {
  const output: TranslationFile = { questions: {}, reflections: { conflict: "", attendance: "" } };
  for (const question of __questionBank) {
    const translatedPrompt = await translateSingle(question.prompt, targetCode);
    const translatedOptions = await Promise.all(
      question.options.map((option) => translateSingle(option, targetCode))
    );
    output.questions[question.id] = {
      prompt: translatedPrompt,
      options: translatedOptions as [string, string, string, string],
    };
  }
  const englishReflections = getReflectionPrompts("english");
  output.reflections = {
    conflict: await translateSingle(englishReflections.conflict, targetCode),
    attendance: await translateSingle(englishReflections.attendance, targetCode),
  };
  return output;
}

async function main() {
  const outputDir = path.join(process.cwd(), "src/assets/assessment-translations");
  await fs.mkdir(outputDir, { recursive: true });
  for (const lang of teacherAssessmentLanguages) {
    if (lang.id === "english") {
      continue;
    }
    const target = LANGUAGE_TARGETS[lang.id];
    if (!target) {
      console.warn(`Skipping ${lang.id} — no target language code defined.`);
      continue;
    }
    console.log(`Translating ${lang.label} (${lang.id}) using ${BASE_URL}...`);
    const translations = await translateQuestionsForLanguage(lang.id, target);
    const filePath = path.join(outputDir, `${lang.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(translations, null, 2), "utf8");
    console.log(`Saved ${filePath}`);
  }
  console.log("Translation complete.");
}

main().catch((err) => {
  console.error("Assessment translation failed", err);
  process.exit(1);
});
