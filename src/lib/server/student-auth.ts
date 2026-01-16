import crypto from "crypto";
import { createSupabaseAdminClient } from "../supabase-server";

// CEFR Levels
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CEFRLevel = (typeof CEFR_LEVELS)[number];

// Student record type
export type StudentRecord = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  preferredLanguage?: string;
  active: boolean;
  mustReset: boolean;
  googleClassroomId?: string;
  createdAt: string;
  updatedAt: string;
};

// Student enrollment type
export type StudentEnrollment = {
  id: string;
  studentId: string;
  teacherId: string | null;
  teacherName?: string;
  language: string;
  currentLevel: CEFRLevel;
  targetLevel?: CEFRLevel;
  startDate?: string;
  status: "active" | "completed" | "paused" | "cancelled";
  googleClassroomCourseId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// Student progress record
export type StudentProgress = {
  id: string;
  studentId: string;
  enrollmentId: string;
  language: string;
  level: CEFRLevel;
  completedAt?: string;
  assessedBy?: string;
  assessorName?: string;
  assessmentScore?: number;
  notes?: string;
  createdAt: string;
};

// Student certificate
export type StudentCertificate = {
  id: string;
  studentId: string;
  enrollmentId?: string;
  language: string;
  level: CEFRLevel;
  certificateNumber: string;
  issuedDate: string;
  issuedBy?: string;
  issuerName?: string;
  pdfPath?: string;
  valid: boolean;
  createdAt: string;
};

// Session type
type StudentSessionRecord = {
  token: string;
  studentId: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
};

// Password hashing (same pattern as portal)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function createStudentPasswordHash(password: string): string {
  return hashPassword(password);
}

export function verifyStudentPassword(password: string, passwordHash: string): boolean {
  return hashPassword(password) === passwordHash;
}

// Generate temporary password
export function generateTempPassword(): string {
  return crypto.randomBytes(8).toString("base64").replace(/[+/=]/g, "").slice(0, 10);
}

// Create student session
export async function createStudentSession(studentId: string): Promise<StudentSessionRecord> {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const token = crypto.randomUUID();
  const record: StudentSessionRecord = {
    token,
    studentId,
    createdAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // Clean up expired sessions first
  await supabase.from("student_sessions").delete().lte("expires_at", now.toISOString());

  // Insert new session
  await supabase.from("student_sessions").insert({
    token: record.token,
    student_id: record.studentId,
    created_at: record.createdAt,
    last_used_at: record.lastUsedAt,
    expires_at: record.expiresAt,
  });

  return record;
}

// Get student session
export async function getStudentSession(token?: string): Promise<StudentSessionRecord | null> {
  if (!token) return null;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("student_sessions")
    .select("token, student_id, created_at, last_used_at, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return null;

  // Check if expired
  if (new Date(data.expires_at).getTime() <= Date.now()) {
    await supabase.from("student_sessions").delete().eq("token", token);
    return null;
  }

  // Update last_used_at
  await supabase.from("student_sessions").update({ last_used_at: new Date().toISOString() }).eq("token", token);

  return {
    token: data.token,
    studentId: data.student_id,
    createdAt: data.created_at,
    lastUsedAt: data.last_used_at ?? data.created_at,
    expiresAt: data.expires_at,
  };
}

// Invalidate student session
export async function invalidateStudentSession(token?: string): Promise<void> {
  if (!token) return;
  const supabase = createSupabaseAdminClient();
  await supabase.from("student_sessions").delete().eq("token", token);
}

// Get student by ID
export async function getStudentById(id: string): Promise<StudentRecord | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  return mapStudentRow(data);
}

// Get student by email
export async function getStudentByEmail(email: string): Promise<(StudentRecord & { passwordHash: string }) | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...mapStudentRow(data),
    passwordHash: data.password_hash,
  };
}

// Require student from token (middleware)
export async function requireStudentFromToken(token?: string): Promise<StudentRecord> {
  const session = await getStudentSession(token);
  if (!session) {
    const error = new Error("Unauthorized") as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }

  const student = await getStudentById(session.studentId);
  if (!student || !student.active) {
    const error = new Error("Unauthorized") as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }

  return student;
}

// List all students
export async function listStudents(): Promise<StudentRecord[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map(mapStudentRow);
}

// Create student
export async function createStudent(input: {
  email: string;
  name: string;
  password?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  preferredLanguage?: string;
}): Promise<{ student: StudentRecord; tempPassword: string }> {
  const supabase = createSupabaseAdminClient();
  const tempPassword = input.password || generateTempPassword();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("students")
    .insert({
      email: input.email.toLowerCase().trim(),
      name: input.name.trim(),
      password_hash: createStudentPasswordHash(tempPassword),
      phone: input.phone || null,
      city: input.city || null,
      state: input.state || null,
      country: input.country || null,
      preferred_language: input.preferredLanguage || null,
      active: true,
      must_reset: !input.password, // Must reset if using temp password
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    student: mapStudentRow(data),
    tempPassword,
  };
}

// Update student
export async function updateStudent(
  id: string,
  updates: Partial<{
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    timezone: string;
    preferredLanguage: string;
    active: boolean;
  }>
): Promise<StudentRecord | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("students")
    .update({
      name: updates.name,
      phone: updates.phone,
      address: updates.address,
      city: updates.city,
      state: updates.state,
      country: updates.country,
      timezone: updates.timezone,
      preferred_language: updates.preferredLanguage,
      active: updates.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;

  return mapStudentRow(data);
}

// Update student password
export async function updateStudentPassword(id: string, newPassword: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("students")
    .update({
      password_hash: createStudentPasswordHash(newPassword),
      must_reset: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return !error;
}

// Get student enrollments
export async function getStudentEnrollments(studentId: string): Promise<StudentEnrollment[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("student_enrollments")
    .select(`
      *,
      portal_users!teacher_id (name)
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    studentId: row.student_id,
    teacherId: row.teacher_id,
    teacherName: row.portal_users?.name ?? undefined,
    language: row.language,
    currentLevel: row.current_level as CEFRLevel,
    targetLevel: row.target_level as CEFRLevel | undefined,
    startDate: row.start_date ?? undefined,
    status: row.status,
    googleClassroomCourseId: row.google_classroom_course_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// Create enrollment
export async function createEnrollment(input: {
  studentId: string;
  teacherId?: string;
  language: string;
  currentLevel?: CEFRLevel;
  targetLevel?: CEFRLevel;
  startDate?: string;
  notes?: string;
}): Promise<StudentEnrollment> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("student_enrollments")
    .insert({
      student_id: input.studentId,
      teacher_id: input.teacherId || null,
      language: input.language,
      current_level: input.currentLevel || "A1",
      target_level: input.targetLevel || null,
      start_date: input.startDate || null,
      status: "active",
      notes: input.notes || null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    studentId: data.student_id,
    teacherId: data.teacher_id,
    language: data.language,
    currentLevel: data.current_level as CEFRLevel,
    targetLevel: data.target_level as CEFRLevel | undefined,
    startDate: data.start_date ?? undefined,
    status: data.status,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Update enrollment
export async function updateEnrollment(
  id: string,
  updates: Partial<{
    teacherId: string;
    currentLevel: CEFRLevel;
    targetLevel: CEFRLevel;
    status: "active" | "completed" | "paused" | "cancelled";
    notes: string;
  }>
): Promise<StudentEnrollment | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("student_enrollments")
    .update({
      teacher_id: updates.teacherId,
      current_level: updates.currentLevel,
      target_level: updates.targetLevel,
      status: updates.status,
      notes: updates.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    studentId: data.student_id,
    teacherId: data.teacher_id,
    language: data.language,
    currentLevel: data.current_level as CEFRLevel,
    targetLevel: data.target_level as CEFRLevel | undefined,
    startDate: data.start_date ?? undefined,
    status: data.status,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Get student progress
export async function getStudentProgress(studentId: string): Promise<StudentProgress[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("student_progress")
    .select(`
      *,
      portal_users!assessed_by (name)
    `)
    .eq("student_id", studentId)
    .order("completed_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    studentId: row.student_id,
    enrollmentId: row.enrollment_id,
    language: row.language,
    level: row.level as CEFRLevel,
    completedAt: row.completed_at ?? undefined,
    assessedBy: row.assessed_by ?? undefined,
    assessorName: row.portal_users?.name ?? undefined,
    assessmentScore: row.assessment_score ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  }));
}

// Record level completion (progress)
export async function recordLevelCompletion(input: {
  studentId: string;
  enrollmentId: string;
  language: string;
  level: CEFRLevel;
  assessedBy?: string;
  assessmentScore?: number;
  notes?: string;
}): Promise<StudentProgress> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("student_progress")
    .insert({
      student_id: input.studentId,
      enrollment_id: input.enrollmentId,
      language: input.language,
      level: input.level,
      completed_at: now,
      assessed_by: input.assessedBy || null,
      assessment_score: input.assessmentScore ?? null,
      notes: input.notes || null,
      created_at: now,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Also update enrollment current_level
  await supabase
    .from("student_enrollments")
    .update({ current_level: input.level, updated_at: now })
    .eq("id", input.enrollmentId);

  return {
    id: data.id,
    studentId: data.student_id,
    enrollmentId: data.enrollment_id,
    language: data.language,
    level: data.level as CEFRLevel,
    completedAt: data.completed_at ?? undefined,
    assessedBy: data.assessed_by ?? undefined,
    assessmentScore: data.assessment_score ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
  };
}

// Get student certificates
export async function getStudentCertificates(studentId: string): Promise<StudentCertificate[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("student_certificates")
    .select(`
      *,
      portal_users!issued_by (name)
    `)
    .eq("student_id", studentId)
    .order("issued_date", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    studentId: row.student_id,
    enrollmentId: row.enrollment_id ?? undefined,
    language: row.language,
    level: row.level as CEFRLevel,
    certificateNumber: row.certificate_number,
    issuedDate: row.issued_date,
    issuedBy: row.issued_by ?? undefined,
    issuerName: row.portal_users?.name ?? undefined,
    pdfPath: row.pdf_path ?? undefined,
    valid: row.valid,
    createdAt: row.created_at,
  }));
}

// Issue certificate
export async function issueCertificate(input: {
  studentId: string;
  enrollmentId?: string;
  language: string;
  level: CEFRLevel;
  issuedBy?: string;
  pdfPath?: string;
}): Promise<StudentCertificate> {
  const supabase = createSupabaseAdminClient();

  // Generate certificate number
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("student_certificates")
    .select("*", { count: "exact", head: true });

  const seq = String((count ?? 0) + 1).padStart(6, "0");
  const certificateNumber = `JBL-${year}-${seq}`;

  const { data, error } = await supabase
    .from("student_certificates")
    .insert({
      student_id: input.studentId,
      enrollment_id: input.enrollmentId || null,
      language: input.language,
      level: input.level,
      certificate_number: certificateNumber,
      issued_date: new Date().toISOString().split("T")[0],
      issued_by: input.issuedBy || null,
      pdf_path: input.pdfPath || null,
      valid: true,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    studentId: data.student_id,
    enrollmentId: data.enrollment_id ?? undefined,
    language: data.language,
    level: data.level as CEFRLevel,
    certificateNumber: data.certificate_number,
    issuedDate: data.issued_date,
    issuedBy: data.issued_by ?? undefined,
    pdfPath: data.pdf_path ?? undefined,
    valid: data.valid,
    createdAt: data.created_at,
  };
}

// Get certificate by ID
export async function getCertificateById(id: string): Promise<StudentCertificate | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("student_certificates")
    .select(`
      *,
      portal_users!issued_by (name),
      students!student_id (name, email)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    studentId: data.student_id,
    enrollmentId: data.enrollment_id ?? undefined,
    language: data.language,
    level: data.level as CEFRLevel,
    certificateNumber: data.certificate_number,
    issuedDate: data.issued_date,
    issuedBy: data.issued_by ?? undefined,
    issuerName: (data as any).portal_users?.name ?? undefined,
    pdfPath: data.pdf_path ?? undefined,
    valid: data.valid,
    createdAt: data.created_at,
  };
}

// Verify certificate by number
export async function verifyCertificate(certificateNumber: string): Promise<{
  valid: boolean;
  certificate?: StudentCertificate;
  studentName?: string;
} | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("student_certificates")
    .select(`
      *,
      students!student_id (name)
    `)
    .eq("certificate_number", certificateNumber)
    .maybeSingle();

  if (error || !data) return null;

  return {
    valid: data.valid,
    studentName: (data as any).students?.name,
    certificate: {
      id: data.id,
      studentId: data.student_id,
      enrollmentId: data.enrollment_id ?? undefined,
      language: data.language,
      level: data.level as CEFRLevel,
      certificateNumber: data.certificate_number,
      issuedDate: data.issued_date,
      issuedBy: data.issued_by ?? undefined,
      pdfPath: data.pdf_path ?? undefined,
      valid: data.valid,
      createdAt: data.created_at,
    },
  };
}

// Helper to map database row to StudentRecord
function mapStudentRow(row: any): StudentRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    country: row.country ?? undefined,
    timezone: row.timezone ?? undefined,
    preferredLanguage: row.preferred_language ?? undefined,
    active: row.active ?? true,
    mustReset: row.must_reset ?? false,
    googleClassroomId: row.google_classroom_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
