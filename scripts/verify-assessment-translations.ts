import { teacherAssessmentLanguages, __questionBank, getTeacherAssessment } from "@/lib/teacher-assessment";

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");

async function verifyLanguage(langId: string) {
  const localized = getTeacherAssessment(langId as typeof teacherAssessmentLanguages[number]["id"], {
    seed: 1234,
    sampleSize: __questionBank.length,
  });
  const map = new Map(localized.map((question) => [question.id, question]));
  const missing: string[] = [];
  const identicalPrompts: string[] = [];
  const identicalOptions: string[] = [];

  __questionBank.forEach((question) => {
    const translated = map.get(question.id);
    if (!translated) {
      missing.push(question.id);
      return;
    }
    if (normalize(translated.prompt) === normalize(question.prompt)) {
      identicalPrompts.push(question.id);
    }
    translated.options.forEach((option, index) => {
      if (normalize(option) === normalize(question.options[index])) {
        identicalOptions.push(`${question.id}:${index}`);
      }
    });
  });

  return { langId, missing, identicalPrompts, identicalOptions };
}

async function main() {
  const results = [];
  for (const lang of teacherAssessmentLanguages) {
    if (lang.id === "english") continue;
    results.push(await verifyLanguage(lang.id));
  }

  const issues = results.filter(
    (result) => result.missing.length > 0 || result.identicalPrompts.length > 0 || result.identicalOptions.length > 0
  );

  if (issues.length === 0) {
    console.log("All translated assessments differ from the English source.");
    return;
  }

  console.error("Found translation issues:");
  for (const issue of issues) {
    if (issue.missing.length) {
      console.error(`- ${issue.langId}: missing ${issue.missing.length} prompts`);
    }
    if (issue.identicalPrompts.length) {
      console.error(`- ${issue.langId}: ${issue.identicalPrompts.length} prompts identical to English`);
    }
    if (issue.identicalOptions.length) {
      console.error(`- ${issue.langId}: ${issue.identicalOptions.length} options identical to English`);
    }
  }
  process.exitCode = 1;
}

main().catch((err) => {
  console.error("Unable to verify translation files", err);
  process.exit(1);
});
