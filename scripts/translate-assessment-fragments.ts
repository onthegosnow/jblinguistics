import { promises as fs } from "fs";
import path from "path";
import { __assessmentSource, teacherAssessmentLanguages } from "@/lib/teacher-assessment";

const BASE_URL = process.env.LIBRETRANSLATE_URL || "http://127.0.0.1:5000";
const LANG_FILTER = (process.env.LANGS || process.env.LANG || "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

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

const fragmentTexts = [
  ...__assessmentSource.modalSubjects,
  ...Object.values(__assessmentSource.modalNeeds).flat(),
  ...Object.values(__assessmentSource.conditionalConditions).flat(),
  ...Object.values(__assessmentSource.conditionalResults).flat(),
  ...__assessmentSource.inversionFocuses,
  ...__assessmentSource.idiomPhrases,
];

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
    throw new Error(`Expected ${texts.length} translations, received ${translated.length}`);
  }
  return translated;
}

async function translateFragmentsForLanguage(langId: string, targetCode: string) {
  const filePath = path.join(process.cwd(), "src/assets/assessment-translations", `${langId}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(raw) as {
    questions: unknown;
    reflections: unknown;
    fragments?: Record<string, string>;
  };

  const fragments = data.fragments ?? {};
  const missing = fragmentTexts.filter((text) => !fragments[text]);
  if (missing.length === 0) {
    console.log(`Fragments already translated for ${langId}.`);
    return;
  }

  console.log(`Translating ${missing.length} fragments into ${langId}...`);
  const chunkSize = 200;
  for (let i = 0; i < missing.length; i += chunkSize) {
    const chunk = missing.slice(i, i + chunkSize);
    const translated = await translateChunk(chunk, targetCode);
    chunk.forEach((original, index) => {
      fragments[original] = translated[index];
    });
  }

  const orderedFragments = Object.fromEntries(Object.entries(fragments).sort(([a], [b]) => a.localeCompare(b)));
  const updated = { ...data, fragments: orderedFragments };
  await fs.writeFile(filePath, JSON.stringify(updated, null, 2), "utf8");
  console.log(`Updated fragments for ${langId} in ${filePath}`);
}

async function main() {
  for (const lang of teacherAssessmentLanguages) {
    if (lang.id === "english") continue;
    if (LANG_FILTER.length > 0 && !LANG_FILTER.includes(lang.id)) continue;
    const target = LANGUAGE_TARGETS[lang.id];
    if (!target) {
      console.warn(`Skipping ${lang.id} — no target language code defined.`);
      continue;
    }
    await translateFragmentsForLanguage(lang.id, target);
  }
}

main().catch((err) => {
  console.error("Unable to translate fragments", err);
  process.exit(1);
});
