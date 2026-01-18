import { promises as fs } from "fs";
import crypto from "crypto";
import path from "path";
import type {
  TeacherAssessmentAnswer,
  TeacherAssessmentLanguage,
  TeacherAssessmentScore,
} from "../teacher-assessment";
import type { TranslatorExerciseLanguage } from "../translator-exercise";
import type { ResumeInsights } from "../resume-analysis";
import { createSupabaseAdminClient } from "../supabase-server";

const STORAGE_ROOT =
  process.env.JB_STORAGE_DIR ??
  (process.env.VERCEL ? path.join("/tmp", "jb-linguistics") : path.join(process.cwd(), "tmp"));

const RESULTS_FILE =
  process.env.ASSESSMENT_RESULTS_FILE ?? path.join(STORAGE_ROOT, "assessment-results.json");
const ACCESS_FILE =
  process.env.ASSESSMENT_ACCESS_FILE ?? path.join(STORAGE_ROOT, "assessment-access-codes.json");
const APPLICATIONS_FILE =
  process.env.CAREER_APPLICATIONS_FILE ?? path.join(STORAGE_ROOT, "career-applications.json");
const ADMIN_SECRET = process.env.ASSESSMENT_ADMIN_SECRET ?? "jb-admin-foj94553";

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
  data?: string;
};

export type CareerApplicationRecord = {
  id: string;
  submittedAt: string;
  name: string;
  email?: string;
  status?: "active" | "rejected";
  rejectedAt?: string | null;
  location?: string;
  languages?: string;
  workingLanguages?: TeacherAssessmentLanguage[];
  experience?: string;
  availability?: string;
  message?: string;
  roles: string[];
  landing?: string;
  resume: StoredResume;
  resumeInsights?: ResumeInsights;
  teacherAssessments?: Array<{
    language: TeacherAssessmentLanguage;
    seed: number;
    answers: TeacherAssessmentAnswer[];
    responses: { conflict: string; attendance: string };
    score: TeacherAssessmentScore;
  }>;
  translatorExercise?: {
    language: TranslatorExerciseLanguage;
    submission: string;
    score: number | null;
    missingTokens: string[];
  };
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

export async function deleteApplicationById(id: string): Promise<boolean> {
  const applications = await listApplications();
  const next = applications.filter((app) => app.id !== id);
  if (next.length === applications.length) {
    return false;
  }
  await writeJsonFile(APPLICATIONS_FILE, next);
  return true;
}

export async function getApplicationById(id: string): Promise<CareerApplicationRecord | undefined> {
  const applications = await listApplications();
  return applications.find((app) => app.id === id);
}

export function requireAdmin(headerValue?: string) {
  if (!headerValue || headerValue.trim() !== ADMIN_SECRET) {
    const error = new Error("Unauthorized") as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }
}

export function getAdminSecretHint() {
  return ADMIN_SECRET;
}

const PORTAL_USERS_FILE = process.env.PORTAL_USERS_FILE ?? path.join(STORAGE_ROOT, "portal-users.json");
const PORTAL_ASSIGNMENTS_FILE =
  process.env.PORTAL_ASSIGNMENTS_FILE ?? path.join(STORAGE_ROOT, "portal-assignments.json");
const PORTAL_TIME_FILE =
  process.env.PORTAL_TIME_FILE ?? path.join(STORAGE_ROOT, "portal-time-entries.json");
const PORTAL_ATTENDANCE_FILE =
  process.env.PORTAL_ATTENDANCE_FILE ?? path.join(STORAGE_ROOT, "portal-attendance-records.json");
const PORTAL_UPLOADS_FILE =
  process.env.PORTAL_UPLOADS_FILE ?? path.join(STORAGE_ROOT, "portal-assignment-uploads.json");
const PORTAL_SESSIONS_FILE =
  process.env.PORTAL_SESSIONS_FILE ?? path.join(STORAGE_ROOT, "portal-sessions.json");

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
  mustReset?: boolean;
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
  // Prefer Supabase portal_users
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("portal_users")
      .select("id, name, email, roles, languages, password_hash, active, created_at, must_reset")
      .order("created_at", { ascending: false });
    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        roles: ((row.roles as string[]) ?? []).filter((r): r is PortalUserRole => r === "teacher" || r === "translator"),
        languages: (row.languages as string[] | undefined) ?? undefined,
        passwordHash: row.password_hash,
        active: row.active ?? true,
        createdAt: row.created_at ?? new Date().toISOString(),
        // mustReset is not part of PortalUserRecord shape; handled in login
      }));
    }
  } catch (err) {
    // fall back to file-based users
  }
  return [];
}

export async function savePortalUsers(users: PortalUserRecord[]) {
  await writeJsonFile(PORTAL_USERS_FILE, users);
}

export async function addPortalUser(user: Omit<PortalUserRecord, "id" | "createdAt"> & { id?: string }): Promise<PortalUserRecord> {
  const record: PortalUserRecord = {
    ...user,
    id: user.id ?? crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("portal_users").upsert({
      id: record.id,
      name: record.name,
      email: record.email,
      roles: record.roles,
      languages: record.languages ?? [],
      password_hash: record.passwordHash,
      active: record.active,
      created_at: record.createdAt,
      must_reset: true,
    });
    if (!error) return record;
  } catch (err) {
    // fall back to file-based
  }

  const users = await listPortalUsers();
  users.push(record);
  await savePortalUsers(users);
  return record;
}

export async function listPortalAssignments(): Promise<PortalAssignmentRecord[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("portal_assignments")
      .select(
        "id, title, assignment_type, description, client, language_pair, hours_assigned, start_date, due_date, status, assigned_to, participants, created_at, updated_at"
      )
      .order("created_at", { ascending: false });
    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        title: row.title,
        assignmentType: row.assignment_type,
        description: row.description ?? undefined,
        client: row.client ?? undefined,
        languagePair: row.language_pair ?? undefined,
        hoursAssigned: Number(row.hours_assigned ?? 0),
        startDate: row.start_date ?? undefined,
        dueDate: row.due_date ?? undefined,
        status: row.status ?? "assigned",
        assignedTo: (row.assigned_to as string[]) ?? [],
        participants: (row.participants as string[]) ?? [],
        createdAt: row.created_at ?? new Date().toISOString(),
        updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
      }));
    }
  } catch (err) {
    // fall back to file storage
  }
  return [];
}

export async function savePortalAssignments(assignments: PortalAssignmentRecord[]) {
  // Supabase only; no-op for legacy JSON
  return;
}

export async function addPortalAssignment(data: Omit<PortalAssignmentRecord, "id" | "createdAt" | "updatedAt">): Promise<PortalAssignmentRecord> {
  const now = new Date().toISOString();
  const record: PortalAssignmentRecord = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  // Try Supabase first
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("portal_assignments").insert({
      id: record.id,
      title: record.title,
      assignment_type: record.assignmentType,
      description: record.description ?? null,
      client: record.client ?? null,
      language_pair: record.languagePair ?? null,
      hours_assigned: record.hoursAssigned,
      start_date: record.startDate ?? null,
      due_date: record.dueDate ?? null,
      status: record.status ?? "assigned",
      assigned_to: record.assignedTo ?? [],
      participants: record.participants ?? [],
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    });
    if (!error) {
      return record;
    }
  } catch (err) {
    // fall back to file storage
  }

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

export async function deletePortalAssignment(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  // First delete any related time entries
  await supabase.from("portal_time_entries").delete().eq("assignment_id", id);

  // Delete any related uploads
  await supabase.from("assignment_uploads").delete().eq("assignment_id", id);

  // Delete the assignment
  const { error } = await supabase.from("portal_assignments").delete().eq("id", id);
  if (error) {
    throw new Error("Failed to delete assignment");
  }
}

export async function listAssignmentTimeEntries(): Promise<AssignmentTimeEntry[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("portal_time_entries")
      .select("id, assignment_id, user_id, hours, notes, logged_at")
      .order("logged_at", { ascending: false });
    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        assignmentId: row.assignment_id,
        userId: row.user_id,
        date: row.logged_at ?? new Date().toISOString(),
        hours: Number(row.hours ?? 0),
        notes: row.notes ?? undefined,
        createdAt: row.logged_at ?? new Date().toISOString(),
      }));
    }
  } catch (err) {
    // fallback to file
  }
  return [];
}

export async function appendAssignmentTimeEntry(entry: AssignmentTimeEntry) {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("portal_time_entries").insert({
      id: entry.id ?? crypto.randomUUID(),
      assignment_id: entry.assignmentId,
      user_id: entry.userId,
      hours: entry.hours,
      notes: entry.notes ?? null,
      logged_at: entry.date ?? entry.createdAt ?? new Date().toISOString(),
    });
    if (!error) return;
  } catch (err) {
    // fallback
  }
  return;
}

export async function listAttendanceRecords(): Promise<AssignmentAttendanceRecord[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("portal_attendance")
      .select("id, assignment_id, user_id, session_date, attended, notes")
      .order("session_date", { ascending: false });
    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        assignmentId: row.assignment_id,
        userId: row.user_id,
        sessionDate: row.session_date ?? new Date().toISOString(),
        sessionLabel: undefined,
        participants: [
          { name: "self", attended: row.attended ?? true, notes: row.notes ?? undefined },
        ],
        createdAt: row.session_date ?? new Date().toISOString(),
      }));
    }
  } catch (err) {
    // fallback
  }
  return [];
}

export async function appendAttendanceRecord(record: AssignmentAttendanceRecord) {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("portal_attendance").insert({
      id: record.id ?? crypto.randomUUID(),
      assignment_id: record.assignmentId,
      user_id: record.userId,
      session_date: record.sessionDate ?? record.createdAt ?? new Date().toISOString(),
      attended: record.participants?.[0]?.attended ?? true,
      notes: record.participants?.[0]?.notes ?? null,
    });
    if (!error) return;
  } catch (err) {
    // fallback
  }
  return;
}

export async function listAssignmentUploads(): Promise<AssignmentUploadRecord[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("portal_assignment_uploads")
      .select("id, assignment_id, user_id, category, filename, mime_type, size, data, uploaded_at")
      .order("uploaded_at", { ascending: false });
    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        assignmentId: row.assignment_id,
        userId: row.user_id,
        category: row.category ?? "support",
        filename: row.filename,
        mimeType: row.mime_type ?? undefined,
        size: Number(row.size ?? 0),
        data: row.data ?? undefined,
        uploadedAt: row.uploaded_at ?? new Date().toISOString(),
        createdAt: row.uploaded_at ?? new Date().toISOString(),
      }));
    }
  } catch (err) {
    // fallback
  }
  return [];
}

export async function appendAssignmentUpload(record: AssignmentUploadRecord) {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("portal_assignment_uploads").insert({
      id: record.id ?? crypto.randomUUID(),
      assignment_id: record.assignmentId,
      user_id: record.userId,
      category: record.category ?? "support",
      filename: record.filename,
      mime_type: record.mimeType ?? null,
      size: record.size ?? null,
      data: record.data ?? null,
      uploaded_at: record.uploadedAt ?? new Date().toISOString(),
    });
    if (!error) return;
  } catch (err) {
    // fallback
  }
  return;
}

async function listPortalSessions(): Promise<PortalSessionRecord[]> {
  // Prefer Supabase sessions table if present
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("portal_sessions")
      .select("token, user_id, created_at, last_used_at, expires_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error && data) {
      return data.map((row) => ({
        token: row.token,
        userId: row.user_id,
        createdAt: row.created_at,
        lastUsedAt: row.last_used_at ?? row.created_at,
        expiresAt: row.expires_at,
      }));
    }
  } catch (err) {
    // fall back to file-based sessions
  }
  return readJsonFile<PortalSessionRecord[]>(PORTAL_SESSIONS_FILE, []);
}

async function savePortalSessions(sessions: PortalSessionRecord[]) {
  // try Supabase; if fails, fall back to file
  try {
    const supabase = createSupabaseAdminClient();
    const payload = sessions.map((s) => ({
      token: s.token,
      user_id: s.userId,
      created_at: s.createdAt,
      last_used_at: s.lastUsedAt,
      expires_at: s.expiresAt,
    }));
    // replace all by deleting expired and upserting current
    // simple approach: delete expired in supabase; upsert current
    await supabase.from("portal_sessions").delete().lte("expires_at", new Date().toISOString());
    if (payload.length) {
      await supabase.from("portal_sessions").upsert(payload, { onConflict: "token" });
    }
    return;
  } catch (err) {
    // fall back to file-based
  }
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
    const error = new Error("Unauthorized") as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }
  // try file-based users first
  const users = await listPortalUsers();
  let user = users.find((u) => u.id === session.userId && u.active);
  if (!user) {
    // fallback to Supabase
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("portal_users")
      .select("id, name, email, roles, languages, password_hash, active, created_at")
      .eq("id", session.userId)
      .maybeSingle();
    if (data && (data.active ?? true)) {
      user = {
        id: data.id,
        name: data.name,
        email: data.email,
        roles: ((data.roles as string[]) ?? []).filter((r): r is PortalUserRole => r === "teacher" || r === "translator"),
        languages: (data.languages as string[] | undefined) ?? undefined,
        passwordHash: data.password_hash,
        active: data.active ?? true,
        createdAt: data.created_at ?? new Date().toISOString(),
      };
    }
  }
  if (!user || !user.active) {
    const error = new Error("Unauthorized") as Error & { statusCode?: number };
    error.statusCode = 401;
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
