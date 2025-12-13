import { createSupabaseAdminClient, RESUME_BUCKET } from "@/lib/supabase-server";
import type { CareerApplicationRecord } from "@/lib/server/storage";

export type CareerApplicantSummary = Omit<CareerApplicationRecord, "resume"> & {
  resume: {
    filename: string;
    mimeType: string;
    size: number;
  };
};

export type CareerApplicantStatus = "active" | "rejected";
export type CareerApplicantWithStatus = CareerApplicantSummary & {
  status: CareerApplicantStatus;
  rejectedAt?: string | null;
};

type CareerApplicationRow = {
  id: string;
  submitted_at: string;
  name: string;
  email: string | null;
  location: string | null;
  languages: string | null;
  working_languages: string[] | null;
  experience: string | null;
  availability: string | null;
  message: string | null;
  landing: string | null;
  roles: string[] | null;
  hire_sent_at: string | null;
  invite_sent_at: string | null;
  invite_sent_at: string | null;
  resume_filename: string;
  resume_mime_type: string;
  resume_size: number | null;
  resume_path: string | null;
  resume_insights: CareerApplicationRecord["resumeInsights"] | null;
  status?: CareerApplicantStatus | null;
  rejected_at?: string | null;
};

type TeacherAssessmentRow = {
  id: string;
  application_id: string;
  language: CareerApplicationRecord["teacherAssessments"] extends Array<infer Item>
    ? Item extends { language: infer L }
      ? L
      : never
    : never;
  seed: number;
  answers: NonNullable<CareerApplicationRecord["teacherAssessments"]>[number]["answers"];
  responses: NonNullable<CareerApplicationRecord["teacherAssessments"]>[number]["responses"];
  score: NonNullable<CareerApplicationRecord["teacherAssessments"]>[number]["score"];
};

type TranslatorExerciseRow = {
  id: string;
  application_id: string;
  language: NonNullable<CareerApplicationRecord["translatorExercise"]>["language"];
  submission: NonNullable<CareerApplicationRecord["translatorExercise"]>["submission"];
  score: NonNullable<CareerApplicationRecord["translatorExercise"]>["score"] | null;
  missing_tokens: NonNullable<CareerApplicationRecord["translatorExercise"]>["missingTokens"] | null;
};

const APPLICATION_TABLE = "career_applications";
const TEACHER_TABLE = "teacher_assessments";
const TRANSLATOR_TABLE = "translator_exercises";

const sanitizeFilename = (value: string) => {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
};

export async function saveCareerApplicationToSupabase(args: {
  record: CareerApplicationRecord;
  resumeBuffer: Buffer;
  resumeFilename: string;
  resumeMimeType: string;
}) {
  const { record, resumeBuffer, resumeFilename, resumeMimeType } = args;
  const supabase = createSupabaseAdminClient();
  const safeFilename = sanitizeFilename(resumeFilename || "resume.pdf");
  const resumePath = `applications/${record.id}/${Date.now()}-${safeFilename}`;

  const { error: uploadError } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(resumePath, resumeBuffer, { contentType: resumeMimeType, upsert: true });

  if (uploadError) {
    throw new Error(`Unable to upload resume: ${uploadError.message}`);
  }

  const cleanup = async () => {
    await supabase.storage.from(RESUME_BUCKET).remove([resumePath]);
    await supabase.from(APPLICATION_TABLE).delete().eq("id", record.id);
    await supabase.from(TEACHER_TABLE).delete().eq("application_id", record.id);
    await supabase.from(TRANSLATOR_TABLE).delete().eq("application_id", record.id);
  };

  try {
    const sanitizeValue = (value: unknown): unknown => {
      if (typeof value === "string") {
        return value.replace(/\u0000/g, "");
      }
      if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item));
      }
      if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>).map(([key, val]) => [key, sanitizeValue(val)]);
        return Object.fromEntries(entries);
      }
      return value;
    };

    const sanitizedInsights =
      record.resumeInsights && typeof record.resumeInsights === "object"
        ? sanitizeValue(JSON.parse(JSON.stringify(record.resumeInsights)))
        : null;

    const { error: insertError } = await supabase.from(APPLICATION_TABLE).insert({
      id: record.id,
      submitted_at: record.submittedAt,
      name: record.name,
      email: record.email ?? null,
      location: record.location ?? null,
      languages: record.languages ?? null,
      working_languages: record.workingLanguages ?? null,
      experience: record.experience ?? null,
      availability: record.availability ?? null,
      message: record.message ?? null,
      landing: record.landing ?? null,
      roles: record.roles ?? ["translator"],
      resume_filename: resumeFilename,
      resume_mime_type: resumeMimeType,
      resume_size: record.resume.size,
      resume_path: resumePath,
      resume_insights: sanitizedInsights,
    });
    if (insertError) {
      console.error("Supabase career_applications insert error", insertError);
      throw new Error(insertError.message);
    }

    if (record.teacherAssessments?.length) {
      const teacherRows = record.teacherAssessments.map((assessment) => ({
        application_id: record.id,
        language: assessment.language,
        seed: assessment.seed,
        answers: assessment.answers,
        responses: assessment.responses,
        score: assessment.score,
        submitted_at: record.submittedAt,
      }));
      const { error: teacherError } = await supabase.from(TEACHER_TABLE).insert(teacherRows);
      if (teacherError) {
        throw new Error(teacherError.message);
      }
    }

    if (record.translatorExercise) {
      const { error: translatorError } = await supabase.from(TRANSLATOR_TABLE).insert({
        application_id: record.id,
        language: record.translatorExercise.language,
        submission: record.translatorExercise.submission,
        score: record.translatorExercise.score,
        missing_tokens: record.translatorExercise.missingTokens,
        submitted_at: record.submittedAt,
      });
      if (translatorError) {
        throw new Error(translatorError.message);
      }
    }
  } catch (err) {
    await cleanup().catch(() => undefined);
    throw err;
  }
}

export async function listCareerApplicantsFromSupabase(): Promise<{
  active: CareerApplicantWithStatus[];
  rejected: CareerApplicantWithStatus[];
}> {
  const supabase = createSupabaseAdminClient();
  const [{ data, error }, hiredUsers] = await Promise.all([
    supabase
      .from(APPLICATION_TABLE)
      .select("*")
      .order("submitted_at", { ascending: false }),
    supabase.from("portal_users").select("email"),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Array<CareerApplicationRow & { status?: CareerApplicantStatus | null; rejected_at?: string | null }>;
  const hiredEmailSet = new Set<string>((hiredUsers.data ?? []).map((u: any) => (u.email ?? "").toLowerCase()).filter(Boolean));
  const ids = rows.map((row) => row.id);

  const teacherMap = new Map<string, NonNullable<CareerApplicationRecord["teacherAssessments"]>>();
  const translatorMap = new Map<string, CareerApplicationRecord["translatorExercise"]>();

  if (ids.length) {
    const { data: teacherData, error: teacherError } = await supabase
      .from(TEACHER_TABLE)
      .select("application_id, language, seed, answers, responses, score")
      .in("application_id", ids);
    if (teacherError) {
      throw new Error(teacherError.message);
    }
    if (teacherData) {
      for (const row of teacherData as TeacherAssessmentRow[]) {
        const current = teacherMap.get(row.application_id) ?? [];
        current.push({
          language: row.language,
          seed: row.seed,
          answers: row.answers,
          responses: row.responses,
          score: row.score,
        });
        teacherMap.set(row.application_id, current);
      }
    }

    const { data: translatorData, error: translatorError } = await supabase
      .from(TRANSLATOR_TABLE)
      .select("application_id, language, submission, score, missing_tokens")
      .in("application_id", ids);
    if (translatorError) {
      throw new Error(translatorError.message);
    }
    if (translatorData) {
      for (const row of translatorData as TranslatorExerciseRow[]) {
        translatorMap.set(row.application_id, {
          language: row.language,
          submission: row.submission,
          score: row.score,
          missingTokens: row.missing_tokens ?? [],
        });
      }
    }
  }

  const mapped: CareerApplicantWithStatus[] = rows
    .filter((row) => !hiredEmailSet.has((row.email ?? "").toLowerCase()))
    .map((row) => {
      const status: CareerApplicantStatus = row.status === "rejected" ? "rejected" : "active";
      return {
        id: row.id,
        submittedAt: row.submitted_at,
        name: row.name,
        email: row.email ?? undefined,
        status,
        rejectedAt: row.rejected_at ?? null,
        location: row.location ?? undefined,
        languages: row.languages ?? undefined,
        workingLanguages: (row.working_languages ?? undefined) as CareerApplicationRecord["workingLanguages"],
        experience: row.experience ?? undefined,
        availability: row.availability ?? undefined,
        message: row.message ?? undefined,
        landing: row.landing ?? undefined,
        interviewNotes: (row as any).interview_notes ?? undefined,
        roles: row.roles ?? ["translator"],
        inviteSentAt: row.invite_sent_at ?? undefined,
        hireSentAt: row.hire_sent_at ?? undefined,
        inviteSentAt: row.invite_sent_at ?? undefined,
        resume: {
          filename: row.resume_filename,
          mimeType: row.resume_mime_type,
          size: row.resume_size ?? 0,
        },
        resumeInsights: row.resume_insights ?? undefined,
        teacherAssessments: teacherMap.get(row.id),
        translatorExercise: translatorMap.get(row.id),
      };
    });

  const active = mapped.filter((row) => row.status === "active");
  const rejected = mapped.filter((row) => row.status === "rejected");
  return { active, rejected };
}

export async function deleteCareerApplicantFromSupabase(id: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(APPLICATION_TABLE)
    .select("resume_path")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return false;
  }

  await supabase.from(TEACHER_TABLE).delete().eq("application_id", id);
  await supabase.from(TRANSLATOR_TABLE).delete().eq("application_id", id);
  const { error: deleteError } = await supabase.from(APPLICATION_TABLE).delete().eq("id", id);
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (data.resume_path) {
    await supabase.storage.from(RESUME_BUCKET).remove([data.resume_path]).catch(() => undefined);
  }

  return true;
}

export async function downloadCareerApplicantResume(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(APPLICATION_TABLE)
    .select("resume_filename, resume_mime_type, resume_size, resume_path")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Application not found");
  }

  if (!data.resume_path) {
    throw new Error("Resume file missing");
  }

  const download = await supabase.storage.from(RESUME_BUCKET).download(data.resume_path);
  if (download.error || !download.data) {
    throw new Error(download.error?.message ?? "Unable to download resume");
  }

  const buffer = Buffer.from(await download.data.arrayBuffer());
  return {
    filename: data.resume_filename,
    mimeType: data.resume_mime_type,
    size: data.resume_size ?? buffer.length,
    buffer,
  };
}

export async function fetchLatestApplicationByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(APPLICATION_TABLE)
    .select("id, name, email, roles, working_languages, resume_path, resume_filename, resume_mime_type")
    .ilike("email", email)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data ?? null;
}
