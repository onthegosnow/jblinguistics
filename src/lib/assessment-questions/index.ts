// Assessment question banks - auto-loaded from imported JSON
import type { AssessmentQuestion, AssessmentLevel, AssessmentModality } from "../assessments";

// Lazy-load question banks to avoid bundling all at once
const questionBanks: Record<string, AssessmentQuestion[] | null> = {};

// Available languages with imported question banks
export const availableLanguages = ["english", "german"] as const;
export type AssessmentLanguage = (typeof availableLanguages)[number];

// Dynamic import for question banks
async function loadQuestionBank(language: string): Promise<AssessmentQuestion[]> {
  if (questionBanks[language] !== undefined) {
    return questionBanks[language] || [];
  }

  try {
    // Dynamic import based on language
    let questions: AssessmentQuestion[] = [];

    switch (language.toLowerCase()) {
      case "english":
        const englishModule = await import("./english-questions");
        questions = englishModule.default || englishModule.englishQuestions;
        break;
      case "german":
        const germanModule = await import("./german-questions");
        questions = germanModule.default || germanModule.germanQuestions;
        break;
      default:
        console.warn(`No question bank for language: ${language}`);
        questionBanks[language] = null;
        return [];
    }

    questionBanks[language] = questions;
    return questions;
  } catch (err) {
    console.error(`Failed to load question bank for ${language}:`, err);
    questionBanks[language] = null;
    return [];
  }
}

// Get all questions for a language
export async function getQuestionsForLanguage(language: string): Promise<AssessmentQuestion[]> {
  return loadQuestionBank(language);
}

// Get questions filtered by level
export async function getQuestionsByLevel(
  language: string,
  level: AssessmentLevel
): Promise<AssessmentQuestion[]> {
  const all = await loadQuestionBank(language);
  return all.filter((q) => q.level === level);
}

// Get questions filtered by modality
export async function getQuestionsByModality(
  language: string,
  modality: AssessmentModality
): Promise<AssessmentQuestion[]> {
  const all = await loadQuestionBank(language);
  return all.filter((q) => q.modality === modality);
}

// Get random sample of questions for a test
export async function getRandomQuestions(
  language: string,
  count: number,
  options?: {
    level?: AssessmentLevel;
    modality?: AssessmentModality;
  }
): Promise<AssessmentQuestion[]> {
  let pool = await loadQuestionBank(language);

  if (options?.level) {
    pool = pool.filter((q) => q.level === options.level);
  }
  if (options?.modality) {
    pool = pool.filter((q) => q.modality === options.modality);
  }

  // Shuffle and take count
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get a balanced set of questions across all levels (for placement test)
export async function getPlacementTestQuestions(
  language: string,
  questionsPerLevel: number = 30
): Promise<AssessmentQuestion[]> {
  const all = await loadQuestionBank(language);
  const levels: AssessmentLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  const selected: AssessmentQuestion[] = [];

  for (const level of levels) {
    const levelQuestions = all.filter((q) => q.level === level);
    const shuffled = [...levelQuestions].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, questionsPerLevel));
  }

  // Final shuffle to mix levels
  return selected.sort(() => Math.random() - 0.5);
}

// Stats about loaded question banks
export async function getQuestionBankStats(language: string): Promise<{
  total: number;
  byLevel: Record<AssessmentLevel, number>;
  byModality: Record<AssessmentModality, number>;
} | null> {
  const questions = await loadQuestionBank(language);
  if (!questions.length) return null;

  const byLevel: Record<AssessmentLevel, number> = {
    A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0
  };
  const byModality: Record<AssessmentModality, number> = {
    grammar: 0, verbal: 0, writing: 0
  };

  for (const q of questions) {
    byLevel[q.level]++;
    byModality[q.modality]++;
  }

  return {
    total: questions.length,
    byLevel,
    byModality,
  };
}
