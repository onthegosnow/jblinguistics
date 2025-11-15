import { promises as fs } from "fs";
import path from "path";

const RESULTS_FILE = process.env.ASSESSMENT_RESULTS_FILE ?? path.join(process.cwd(), "tmp", "assessment-results.json");
const ACCESS_FILE = process.env.ASSESSMENT_ACCESS_FILE ?? path.join(process.cwd(), "tmp", "assessment-access-codes.json");
const APPLICATIONS_FILE = process.env.CAREER_APPLICATIONS_FILE ?? path.join(process.cwd(), "tmp", "career-applications.json");
const ADMIN_SECRET = process.env.ASSESSMENT_ADMIN_SECRET ?? "jb-assessment-admin";

export type AssessmentSubmissionRecord = {
  id: string;
  submittedAt: string;
  candidateName: string;
  candidateEmail?: string;
  proctorEmail: string;
  testLanguage: string;
  summary: {
    totalCorrect: number;
    totalQuestions: number;
    percentage: number;
    breakdown: Record<string, { correct: number; incorrect: number; unanswered: number; total: number }>;
  };
  accessMeta?: { mode: string; code?: string; label?: string };
};

export type AccessCodeRecord = {
  code: string;
  label: string;
  candidateName?: string;
  candidateEmail?: string;
  maxUses: number;
  uses: number;
  active: boolean;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  notes?: string;
};

type StoredResume = {
  filename: string;
  mimeType: string;
  size: number;
  data: string;
};

export type CareerApplicationRecord = {
  id: string;
  submittedAt: string;
  name: string;
  email?: string;
  location?: string;
  languages?: string;
  experience?: string;
  availability?: string;
  message?: string;
  roles: string[];
  landing?: string;
  resume: StoredResume;
};

async function ensureDir(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }
    throw err;
  }
}

async function writeJsonFile(filePath: string, data: unknown) {
  await ensureDir(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function appendSubmission(record: AssessmentSubmissionRecord) {
  const current = await readJsonFile<AssessmentSubmissionRecord[]>(RESULTS_FILE, []);
  current.push(record);
  await writeJsonFile(RESULTS_FILE, current);
}

export async function listSubmissions(): Promise<AssessmentSubmissionRecord[]> {
  return readJsonFile<AssessmentSubmissionRecord[]>(RESULTS_FILE, []);
}

export async function listAccessCodes(): Promise<AccessCodeRecord[]> {
  return readJsonFile<AccessCodeRecord[]>(ACCESS_FILE, []);
}

export async function saveAccessCodes(codes: AccessCodeRecord[]) {
  await writeJsonFile(ACCESS_FILE, codes);
}

export async function appendApplication(record: CareerApplicationRecord) {
  const current = await readJsonFile<CareerApplicationRecord[]>(APPLICATIONS_FILE, []);
  current.push(record);
  await writeJsonFile(APPLICATIONS_FILE, current);
}

export async function listApplications(): Promise<CareerApplicationRecord[]> {
  return readJsonFile<CareerApplicationRecord[]>(APPLICATIONS_FILE, []);
}

export async function getApplicationById(id: string): Promise<CareerApplicationRecord | undefined> {
  const applications = await listApplications();
  return applications.find((app) => app.id === id);
}

export function requireAdmin(headerValue?: string) {
  if (!headerValue || headerValue.trim() !== ADMIN_SECRET) {
    const error = new Error("Unauthorized");
    (error as NodeJS.ErrnoException).statusCode = 401;
    throw error;
  }
}

export function getAdminSecretHint() {
  return ADMIN_SECRET;
}
