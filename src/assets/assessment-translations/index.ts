import danish from "./danish.json";
import dutch from "./dutch.json";
import french from "./french.json";
import german from "./german.json";
import italian from "./italian.json";
import japanese from "./japanese.json";
import korean from "./korean.json";
import mandarin from "./mandarin.json";
import portuguese from "./portuguese.json";
import spanish from "./spanish.json";
import swedish from "./swedish.json";

export type AssessmentTranslationFile = {
  questions: Record<string, { prompt: string; options: [string, string, string, string] }>;
  reflections: { conflict: string; attendance: string };
  fragments?: Record<string, string>;
};

function asTranslation(data: unknown): AssessmentTranslationFile {
  return data as AssessmentTranslationFile;
}

export const assessmentTranslations: Partial<Record<string, AssessmentTranslationFile>> = {
  german: asTranslation(german),
  french: asTranslation(french),
  dutch: asTranslation(dutch),
  danish: asTranslation(danish),
  swedish: asTranslation(swedish),
  spanish: asTranslation(spanish),
  portuguese: asTranslation(portuguese),
  italian: asTranslation(italian),
  mandarin: asTranslation(mandarin),
  japanese: asTranslation(japanese),
  korean: asTranslation(korean),
};
