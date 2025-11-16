import { promises as fs } from "fs";
import path from "path";
import { teacherAssessmentLanguages, __assessmentSource } from "@/lib/teacher-assessment";

async function main() {
  const outputPath = path.join(process.cwd(), "tmp", "assessment-source.json");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(__assessmentSource, null, 2), "utf8");
  console.log(`Exported assessment source phrases to ${outputPath}`);
  console.log("Languages to translate:", teacherAssessmentLanguages.map((lang) => `${lang.id} (${lang.label})`).join(", "));
}

main().catch((err) => {
  console.error("Unable to export assessment phrases", err);
  process.exit(1);
});
