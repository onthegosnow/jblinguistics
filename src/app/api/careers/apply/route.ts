import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { CareerApplicationRecord } from "@/lib/server/storage";
import { saveCareerApplicationToSupabase } from "@/lib/server/careers-supabase";
import {
  getTeacherAssessment,
  scoreTeacherAssessment,
  teacherAssessmentLanguages,
  type TeacherAssessmentAnswer,
  type TeacherAssessmentLanguage,
} from "@/lib/teacher-assessment";
import {
  scoreTranslatorSubmission,
  translatorLanguages,
  type TranslatorExerciseLanguage,
} from "@/lib/translator-exercise";
import { analyzeResume } from "@/lib/resume-analysis";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const teacherLanguageSet = new Set(teacherAssessmentLanguages.map((lang) => lang.id));
const translatorLanguageSet = new Set(translatorLanguages.map((lang) => lang.id));

function isTeacherAssessmentLanguage(value: string): value is TeacherAssessmentLanguage {
  return teacherLanguageSet.has(value as TeacherAssessmentLanguage);
}

function isTranslatorLanguage(value: string): value is TranslatorExerciseLanguage {
  return translatorLanguageSet.has(value as TranslatorExerciseLanguage);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const languages = String(formData.get("languages") || "").trim();
    const experience = String(formData.get("experience") || "").trim();
    const availability = String(formData.get("availability") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const landing = String(formData.get("landing") || "").trim() || undefined;
    const roles = formData.getAll("roles").map((value) => String(value));
    const teacherAssessmentsRaw = String(formData.get("teacherAssessments") || "").trim();
    const workingLanguagesRaw = String(formData.get("workingLanguages") || "[]");
    const translatorLanguageRaw = String(formData.get("translatorLanguage") || "").trim();
    const translatorText = String(formData.get("translatorText") || "").trim();

    const resume = formData.get("resume");
    if (!name || !email || !(resume instanceof File)) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }
    if (resume.size === 0) {
      return NextResponse.json({ message: "Resume file is empty." }, { status: 400 });
    }
    if (resume.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Resume exceeds 5 MB limit." }, { status: 400 });
    }

    const needsTeacherAssessment = roles.includes("educator") || roles.includes("both");
    const needsTranslatorExercise = roles.includes("translator") || roles.includes("both");

    let parsedWorkingLanguages: TeacherAssessmentLanguage[] = [];
    try {
      const parsed = JSON.parse(workingLanguagesRaw);
      if (Array.isArray(parsed)) {
        parsedWorkingLanguages = parsed
          .map((value) => String(value))
          .filter((value): value is TeacherAssessmentLanguage => isTeacherAssessmentLanguage(value));
      }
    } catch {
      parsedWorkingLanguages = [];
    }

    let teacherAssessments:
      | Array<{
          language: TeacherAssessmentLanguage;
          seed: number;
          answers: TeacherAssessmentAnswer[];
          responses: { conflict: string; attendance: string };
          score: ReturnType<typeof scoreTeacherAssessment>;
        }>
      | undefined;

    if (needsTeacherAssessment) {
      if (!teacherAssessmentsRaw) {
        return NextResponse.json({ message: "Teacher assessment is required for educator roles." }, { status: 400 });
      }
      let parsedGroup: unknown;
      try {
        parsedGroup = JSON.parse(teacherAssessmentsRaw);
      } catch {
        return NextResponse.json({ message: "Unable to read teacher assessment submission." }, { status: 400 });
      }
      if (!Array.isArray(parsedGroup) || parsedGroup.length === 0) {
        return NextResponse.json({ message: "Teacher assessment is required for educator roles." }, { status: 400 });
      }
      const results: NonNullable<typeof teacherAssessments> = [];
      for (const entry of parsedGroup) {
        const language = String(entry?.language || "");
        const seed = Number(entry?.seed);
        const rawAnswers = entry?.answers;
        const rawResponses = entry?.responses;
        if (!isTeacherAssessmentLanguage(language) || !Number.isFinite(seed) || !Array.isArray(rawAnswers)) {
          return NextResponse.json({ message: "Invalid teacher assessment payload." }, { status: 400 });
        }
        const sanitizedAnswers = (rawAnswers as TeacherAssessmentAnswer[]).filter(
          (answer) => answer && typeof answer.questionId === "string" && typeof answer.selected === "number"
        );
        const questions = getTeacherAssessment(language, { seed, sampleSize: sanitizedAnswers.length });
        const expectedIds = new Set(questions.map((question) => question.id));
        const answeredIds = new Set(sanitizedAnswers.map((answer) => answer.questionId));
        if (sanitizedAnswers.length !== questions.length || expectedIds.size !== answeredIds.size) {
          return NextResponse.json({ message: "All teacher assessment questions must be answered." }, { status: 400 });
        }
        const conflict = String(rawResponses?.conflict ?? "").trim();
        const attendance = String(rawResponses?.attendance ?? "").trim();
        if (!conflict || !attendance) {
          return NextResponse.json({ message: "Teacher assessment written responses are required." }, { status: 400 });
        }
        const score = scoreTeacherAssessment(language, seed, sanitizedAnswers);
        results.push({
          language,
          seed,
          answers: sanitizedAnswers,
          responses: { conflict, attendance },
          score,
        });
      }
      teacherAssessments = results;
    }

    let translatorExercise:
      | {
          language: TranslatorExerciseLanguage;
          submission: string;
          score: number | null;
          missingTokens: string[];
        }
      | undefined;
    if (needsTranslatorExercise) {
      if (!translatorLanguageRaw || !isTranslatorLanguage(translatorLanguageRaw) || !translatorText) {
        return NextResponse.json({ message: "Translator exercise is required for translator roles." }, { status: 400 });
      }
      const evaluation = scoreTranslatorSubmission(translatorLanguageRaw, translatorText);
      translatorExercise = {
        language: translatorLanguageRaw,
        submission: translatorText,
        score: evaluation.score,
        missingTokens: evaluation.missingTokens,
      };
    }

    const resumeFilename = resume.name || "resume.pdf";
    const resumeMimeType = resume.type || "application/octet-stream";
    const buffer = Buffer.from(await resume.arrayBuffer());
    let resumeInsights;
    try {
      resumeInsights = await analyzeResume(buffer, {
        mimeType: resume.type,
        filename: resume.name,
        workingLanguages: parsedWorkingLanguages,
      });
    } catch (err) {
      console.warn("Resume analysis failed", err);
    }
    const record = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      name,
      email,
      location: location || undefined,
      languages: languages || undefined,
      workingLanguages: parsedWorkingLanguages.length ? parsedWorkingLanguages : undefined,
      experience: experience || undefined,
      availability: availability || undefined,
      message: message || undefined,
      landing,
      roles: roles.length ? roles : ["translator"],
      resume: {
        filename: resumeFilename,
        mimeType: resumeMimeType,
        size: resume.size,
        data: buffer.toString("base64"),
      },
      resumeInsights,
      teacherAssessments,
      translatorExercise,
    };

    await saveCareerApplicationToSupabase({
      record,
      resumeBuffer: buffer,
      resumeFilename,
      resumeMimeType,
    });
    await sendApplicationEmail({
      record,
      resumeBuffer: buffer,
      resumeFilename,
      resumeMimeType,
    });

    return NextResponse.json({ success: true, message: "Application received." });
  } catch (err) {
    console.error("Careers application error", err);
    return NextResponse.json({ message: "Unable to submit application." }, { status: 500 });
  }
}

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
const APPLICATION_INBOX = process.env.CAREER_APPLICATION_EMAIL ?? "jblinguisticsllc@gmail.com";

async function sendApplicationEmail({
  record,
  resumeBuffer,
  resumeFilename,
  resumeMimeType,
}: {
  record: CareerApplicationRecord;
  resumeBuffer: Buffer;
  resumeFilename: string;
  resumeMimeType: string;
}) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP credentials not configured; skipping applicant email.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const summaryLines = [
    `Name: ${record.name}`,
    `Email: ${record.email ?? "n/a"}`,
    `Roles: ${record.roles.join(", ")}`,
    `Location: ${record.location ?? "n/a"}`,
    `Languages: ${record.languages ?? "n/a"}`,
    `Working languages: ${record.workingLanguages?.join(", ") ?? "n/a"}`,
    `Availability: ${record.availability ?? "n/a"}`,
    `Message: ${record.message ?? "n/a"}`,
    record.translatorExercise
      ? `Translator exercise: ${record.translatorExercise.language}, score ${record.translatorExercise.score ?? "pending"}`
      : undefined,
  ].filter(Boolean) as string[];

  try {
    await transporter.sendMail({
      from: SMTP_FROM ?? APPLICATION_INBOX ?? SMTP_USER,
      to: APPLICATION_INBOX,
      subject: `New JB Linguistics application — ${record.name}`,
      text: summaryLines.join("\n"),
      attachments: [
        {
          filename: resumeFilename,
          content: resumeBuffer,
          contentType: resumeMimeType,
        },
      ],
    });
  } catch (err) {
    console.error("Unable to send application email", err);
  }
}
