import { promises as fs } from "fs";
import crypto from "crypto";
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

const PORTAL_USERS_FILE = process.env.PORTAL_USERS_FILE ?? path.join(process.cwd(), "tmp", "portal-users.json");
const PORTAL_ASSIGNMENTS_FILE = process.env.PORTAL_ASSIGNMENTS_FILE ?? path.join(process.cwd(), "tmp", "portal-assignments.json");
const PORTAL_TIME_FILE = process.env.PORTAL_TIME_FILE ?? path.join(process.cwd(), "tmp", "portal-time-entries.json");
const PORTAL_ATTENDANCE_FILE = process.env.PORTAL_ATTENDANCE_FILE ?? path.join(process.cwd(), "tmp", "portal-attendance-records.json");
const PORTAL_UPLOADS_FILE = process.env.PORTAL_UPLOADS_FILE ?? path.join(process.cwd(), "tmp", "portal-assignment-uploads.json");
const PORTAL_SESSIONS_FILE = process.env.PORTAL_SESSIONS_FILE ?? path.join(process.cwd(), "tmp", "portal-sessions.json");

export type PortalUserRole = "teacher" | "translator";

export type PortalUserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  roles: PortalUserRole[];
  languages?: string[];
  active: boolean;
  createdAt: string;
};

export type PortalAssignmentRecord = {
  id: string;
  title: string;
  assignmentType: "class" | "translation";
  description?: string;
  client?: string;
  languagePair?: string;
  hoursAssigned: number;
  startDate?: string;
  dueDate?: string;
  status: "assigned" | "in_progress" | "submitted" | "completed";
  assignedTo: string[];
  participants: string[];
  createdAt: string;
  updatedAt: string;
};

export type AssignmentTimeEntry = {
  id: string;
  assignmentId: string;
  userId: string;
  date: string;
  hours: number;
  notes?: string;
  issues?: string;
  extraHoursRequested?: boolean;
  extraHoursNote?: string;
  createdAt: string;
};

export type AssignmentAttendanceRecord = {
  id: string;
  assignmentId: string;
  userId: string;
  sessionDate: string;
  sessionLabel?: string;
  participants: Array<{ name: string; attended: boolean; notes?: string }>;
  createdAt: string;
};

export type AssignmentUploadRecord = {
  id: string;
  assignmentId: string;
  userId: string;
  category: "original" | "final" | "worksheet" | "support";
  filename: string;
  mimeType: string;
  size: number;
  data: string;
  uploadedAt: string;
};

type PortalSessionRecord = {
  token: string;
  userId: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
};

function hashPortalPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function createPortalPasswordHash(password: string) {
  return hashPortalPassword(password);
}

export function verifyPortalPassword(password: string, user: PortalUserRecord) {
  return hashPortalPassword(password) === user.passwordHash;
}

export async function listPortalUsers(): Promise<PortalUserRecord[]> {
  return readJsonFile<PortalUserRecord[]>(PORTAL_USERS_FILE, []);
}

export async function savePortalUsers(users: PortalUserRecord[]) {
  await writeJsonFile(PORTAL_USERS_FILE, users);
}

export async function addPortalUser(user: Omit<PortalUserRecord, "id" | "createdAt"> & { id?: string }): Promise<PortalUserRecord> {
  const users = await listPortalUsers();
  const record: PortalUserRecord = {
    ...user,
    id: user.id ?? crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  users.push(record);
  await savePortalUsers(users);
  return record;
}

export async function listPortalAssignments(): Promise<PortalAssignmentRecord[]> {
  return readJsonFile<PortalAssignmentRecord[]>(PORTAL_ASSIGNMENTS_FILE, []);
}

export async function savePortalAssignments(assignments: PortalAssignmentRecord[]) {
  await writeJsonFile(PORTAL_ASSIGNMENTS_FILE, assignments);
}

export async function addPortalAssignment(data: Omit<PortalAssignmentRecord, "id" | "createdAt" | "updatedAt">): Promise<PortalAssignmentRecord> {
  const assignments = await listPortalAssignments();
  const now = new Date().toISOString();
  const record: PortalAssignmentRecord = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  assignments.push(record);
  await savePortalAssignments(assignments);
  return record;
}

export async function updatePortalAssignment(id: string, updater: (assignment: PortalAssignmentRecord) => PortalAssignmentRecord) {
  const assignments = await listPortalAssignments();
  const idx = assignments.findIndex((a) => a.id === id);
  if (idx === -1) {
    throw new Error("Assignment not found");
  }
  assignments[idx] = { ...updater(assignments[idx]), updatedAt: new Date().toISOString() };
  await savePortalAssignments(assignments);
  return assignments[idx];
}

export async function listAssignmentTimeEntries(): Promise<AssignmentTimeEntry[]> {
  return readJsonFile<AssignmentTimeEntry[]>(PORTAL_TIME_FILE, []);
}

export async function appendAssignmentTimeEntry(entry: AssignmentTimeEntry) {
  const entries = await listAssignmentTimeEntries();
  entries.push(entry);
  await writeJsonFile(PORTAL_TIME_FILE, entries);
}

export async function listAttendanceRecords(): Promise<AssignmentAttendanceRecord[]> {
  return readJsonFile<AssignmentAttendanceRecord[]>(PORTAL_ATTENDANCE_FILE, []);
}

export async function appendAttendanceRecord(record: AssignmentAttendanceRecord) {
  const entries = await listAttendanceRecords();
  entries.push(record);
  await writeJsonFile(PORTAL_ATTENDANCE_FILE, entries);
}

export async function listAssignmentUploads(): Promise<AssignmentUploadRecord[]> {
  return readJsonFile<AssignmentUploadRecord[]>(PORTAL_UPLOADS_FILE, []);
}

export async function appendAssignmentUpload(record: AssignmentUploadRecord) {
  const uploads = await listAssignmentUploads();
  uploads.push(record);
  await writeJsonFile(PORTAL_UPLOADS_FILE, uploads);
}

async function listPortalSessions(): Promise<PortalSessionRecord[]> {
  return readJsonFile<PortalSessionRecord[]>(PORTAL_SESSIONS_FILE, []);
}

async function savePortalSessions(sessions: PortalSessionRecord[]) {
  await writeJsonFile(PORTAL_SESSIONS_FILE, sessions);
}

export async function createPortalSession(userId: string) {
  const sessions = await listPortalSessions();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const record: PortalSessionRecord = {
    token: crypto.randomUUID(),
    userId,
    createdAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
  const filtered = sessions.filter((session) => new Date(session.expiresAt).getTime() > Date.now());
  filtered.push(record);
  await savePortalSessions(filtered);
  return record;
}

export async function getPortalSession(token?: string): Promise<PortalSessionRecord | undefined> {
  if (!token) return undefined;
  const sessions = await listPortalSessions();
  const session = sessions.find((s) => s.token === token);
  if (!session) return undefined;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await savePortalSessions(sessions.filter((s) => s.token !== token));
    return undefined;
  }
  session.lastUsedAt = new Date().toISOString();
  await savePortalSessions(sessions);
  return session;
}

export async function requirePortalUserFromToken(token?: string): Promise<PortalUserRecord> {
  const session = await getPortalSession(token);
  if (!session) {
    const error = new Error("Unauthorized");
    (error as NodeJS.ErrnoException).statusCode = 401;
    throw error;
  }
  const users = await listPortalUsers();
  const user = users.find((u) => u.id === session.userId && u.active);
  if (!user) {
    const error = new Error("Unauthorized");
    (error as NodeJS.ErrnoException).statusCode = 401;
    throw error;
  }
  return user;
}

export async function invalidatePortalSession(token?: string) {
  if (!token) return;
  const sessions = await listPortalSessions();
  const next = sessions.filter((s) => s.token !== token);
  await savePortalSessions(next);
}
