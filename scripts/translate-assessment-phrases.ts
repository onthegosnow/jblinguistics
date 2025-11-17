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
const LANG_FILTER = (process.env.LANGS || process.env.LANG || "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);
type TranslationFile = {
  questions: Record<string, { prompt: string; options: [string, string, string, string] }>;
  reflections: { conflict: string; attendance: string };
};

type TranslateResponse = { translatedText: string | string[] };

async function translateChunk(texts: string[], target: string) {
  const body = { q: texts, source: "en", target, format: "text" };
  const response = await fetch(`${BASE_URL}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Translation failed (${response.status}): ${errorText}`);
  }
  const data = (await response.json()) as TranslateResponse;
  const translated = Array.isArray(data.translatedText) ? data.translatedText : [data.translatedText];
  if (translated.length !== texts.length) {
    throw new Error(`Translation length mismatch. Expected ${texts.length}, received ${translated.length}.`);
  }
  return translated;
}

async function translateQuestionsForLanguage(langId: string, targetCode: string): Promise<TranslationFile> {
  const output: TranslationFile = { questions: {}, reflections: { conflict: "", attendance: "" } };
  const uniqueTexts = new Map<string, string>();
  const textsToTranslate: string[] = [];
  const enqueue = (text: string) => {
    if (!uniqueTexts.has(text)) {
      uniqueTexts.set(text, "");
      textsToTranslate.push(text);
    }
  };

  __questionBank.forEach((question) => {
    enqueue(question.prompt);
    question.options.forEach((option) => enqueue(option));
  });
  const englishReflections = getReflectionPrompts("english");
  enqueue(englishReflections.conflict);
  enqueue(englishReflections.attendance);

  const chunkSize = 400;
  for (let i = 0; i < textsToTranslate.length; i += chunkSize) {
    if (i === 0) {
      console.log(`Translating ${textsToTranslate.length} strings into ${langId}...`);
    }
    const chunk = textsToTranslate.slice(i, i + chunkSize);
    const translated = await translateChunk(chunk, targetCode);
    chunk.forEach((original, index) => {
      uniqueTexts.set(original, translated[index]);
    });
  }

  __questionBank.forEach((question) => {
    const translatedOptions = question.options.map((option) => uniqueTexts.get(option) ?? option) as [
      string,
      string,
      string,
      string,
    ];
    output.questions[question.id] = {
      prompt: uniqueTexts.get(question.prompt) ?? question.prompt,
      options: translatedOptions,
    };
  });

  output.reflections = {
    conflict: uniqueTexts.get(englishReflections.conflict) ?? englishReflections.conflict,
    attendance: uniqueTexts.get(englishReflections.attendance) ?? englishReflections.attendance,
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
    if (LANG_FILTER.length > 0 && !LANG_FILTER.includes(lang.id)) {
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
