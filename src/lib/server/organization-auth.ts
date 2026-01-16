import crypto from "crypto";
import { createSupabaseAdminClient } from "../supabase-server";

// ============================================
// TYPES
// ============================================

export type Organization = {
  id: string;
  name: string;
  slug: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  billingEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractedHoursPerMonth?: number;
  contractedServices?: string[];
  billingRateHourly?: number;
  billingCycle?: string;
  paymentTermsDays?: number;
  requireAttendanceApproval?: boolean;
  allowEmployeeSelfRegister?: boolean;
  logoUrl?: string;
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationAdmin = {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "viewer";
  phone?: string;
  active: boolean;
  mustReset: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationEmployee = {
  id: string;
  organizationId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  employeeId?: string;
  department?: string;
  jobTitle?: string;
  managerName?: string;
  managerEmail?: string;
  allocatedHoursPerMonth?: number;
  status: "active" | "on_leave" | "terminated";
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TrainingSession = {
  id: string;
  organizationId: string;
  studentId: string;
  studentName?: string;
  enrollmentId?: string;
  teacherId?: string;
  teacherName?: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  sessionType: "individual" | "group" | "self_study" | "assessment";
  topicsCovered?: string;
  materialsUsed?: string;
  homeworkAssigned?: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  cancellationReason?: string;
  approvedByTeacher: boolean;
  teacherApprovedAt?: string;
  approvedByOrg?: boolean;
  orgApprovedAt?: string;
  orgApprovedBy?: string;
  disputeReason?: string;
  billable: boolean;
  billed: boolean;
  invoiceId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationService = {
  id: string;
  organizationId: string;
  serviceType: "translation" | "interpretation" | "localization" | "transcription" | "proofreading" | "other";
  title: string;
  description?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  sourceFiles?: string[];
  deliveredFiles?: string[];
  requestedAt: string;
  deadline?: string;
  deliveredAt?: string;
  status: "requested" | "quoted" | "approved" | "in_progress" | "review" | "delivered" | "completed" | "cancelled";
  quotedPrice?: number;
  finalPrice?: number;
  wordCount?: number;
  assignedTo?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type OrgAdminSession = {
  token: string;
  adminId: string;
  organizationId: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
};

// ============================================
// PASSWORD UTILITIES
// ============================================

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function createOrgAdminPasswordHash(password: string): string {
  return hashPassword(password);
}

export function verifyOrgAdminPassword(password: string, passwordHash: string): boolean {
  return hashPassword(password) === passwordHash;
}

export function generateTempPassword(): string {
  return crypto.randomBytes(8).toString("base64").replace(/[+/=]/g, "").slice(0, 10);
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export async function createOrgAdminSession(adminId: string, organizationId: string): Promise<OrgAdminSession> {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const token = crypto.randomUUID();
  const record: OrgAdminSession = {
    token,
    adminId,
    organizationId,
    createdAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // Clean up expired sessions
  await supabase.from("organization_admin_sessions").delete().lte("expires_at", now.toISOString());

  // Insert new session
  await supabase.from("organization_admin_sessions").insert({
    token: record.token,
    admin_id: record.adminId,
    organization_id: record.organizationId,
    created_at: record.createdAt,
    last_used_at: record.lastUsedAt,
    expires_at: record.expiresAt,
  });

  return record;
}

export async function getOrgAdminSession(token?: string): Promise<OrgAdminSession | null> {
  if (!token) return null;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("organization_admin_sessions")
    .select("token, admin_id, organization_id, created_at, last_used_at, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return null;

  if (new Date(data.expires_at).getTime() <= Date.now()) {
    await supabase.from("organization_admin_sessions").delete().eq("token", token);
    return null;
  }

  // Update last_used_at
  await supabase.from("organization_admin_sessions").update({ last_used_at: new Date().toISOString() }).eq("token", token);

  return {
    token: data.token,
    adminId: data.admin_id,
    organizationId: data.organization_id,
    createdAt: data.created_at,
    lastUsedAt: data.last_used_at ?? data.created_at,
    expiresAt: data.expires_at,
  };
}

export async function invalidateOrgAdminSession(token?: string): Promise<void> {
  if (!token) return;
  const supabase = createSupabaseAdminClient();
  await supabase.from("organization_admin_sessions").delete().eq("token", token);
}

// ============================================
// ORG ADMIN AUTH
// ============================================

export async function getOrgAdminByEmail(email: string, organizationId?: string): Promise<(OrganizationAdmin & { passwordHash: string; organizationName?: string }) | null> {
  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("organization_admins")
    .select(`
      *,
      organizations!organization_id (name)
    `)
    .eq("email", email.toLowerCase().trim());

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    organizationId: data.organization_id,
    email: data.email,
    name: data.name,
    role: data.role as "admin" | "manager" | "viewer",
    phone: data.phone ?? undefined,
    active: data.active ?? true,
    mustReset: data.must_reset ?? false,
    lastLoginAt: data.last_login_at ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    passwordHash: data.password_hash,
    organizationName: (data as any).organizations?.name,
  };
}

export async function getOrgAdminById(id: string): Promise<OrganizationAdmin | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("organization_admins")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  return mapOrgAdminRow(data);
}

export async function requireOrgAdminFromToken(token?: string): Promise<OrganizationAdmin & { organization: Organization }> {
  const session = await getOrgAdminSession(token);
  if (!session) {
    const error = new Error("Unauthorized") as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }

  const admin = await getOrgAdminById(session.adminId);
  if (!admin || !admin.active) {
    const error = new Error("Unauthorized") as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }

  const org = await getOrganizationById(session.organizationId);
  if (!org || !org.active) {
    const error = new Error("Organization not active") as Error & { statusCode?: number };
    error.statusCode = 403;
    throw error;
  }

  return { ...admin, organization: org };
}

// ============================================
// ORGANIZATION CRUD
// ============================================

export async function listOrganizations(): Promise<Organization[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapOrganizationRow);
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapOrganizationRow(data);
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();

  if (error || !data) return null;
  return mapOrganizationRow(data);
}

export async function createOrganization(input: {
  name: string;
  slug?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  billingEmail?: string;
  city?: string;
  country?: string;
  contractedHoursPerMonth?: number;
  contractedServices?: string[];
  billingRateHourly?: number;
  notes?: string;
}): Promise<Organization> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  // Generate slug if not provided
  const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name: input.name,
      slug,
      primary_contact_name: input.primaryContactName || null,
      primary_contact_email: input.primaryContactEmail || null,
      primary_contact_phone: input.primaryContactPhone || null,
      billing_email: input.billingEmail || input.primaryContactEmail || null,
      city: input.city || null,
      country: input.country || null,
      contracted_hours_per_month: input.contractedHoursPerMonth || null,
      contracted_services: input.contractedServices || ["language_training"],
      billing_rate_hourly: input.billingRateHourly || null,
      active: true,
      notes: input.notes || null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapOrganizationRow(data);
}

export async function updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .update({
      name: updates.name,
      primary_contact_name: updates.primaryContactName,
      primary_contact_email: updates.primaryContactEmail,
      primary_contact_phone: updates.primaryContactPhone,
      billing_email: updates.billingEmail,
      address: updates.address,
      city: updates.city,
      state: updates.state,
      country: updates.country,
      postal_code: updates.postalCode,
      contract_start_date: updates.contractStartDate,
      contract_end_date: updates.contractEndDate,
      contracted_hours_per_month: updates.contractedHoursPerMonth,
      contracted_services: updates.contractedServices,
      billing_rate_hourly: updates.billingRateHourly,
      billing_cycle: updates.billingCycle,
      payment_terms_days: updates.paymentTermsDays,
      require_attendance_approval: updates.requireAttendanceApproval,
      allow_employee_self_register: updates.allowEmployeeSelfRegister,
      logo_url: updates.logoUrl,
      active: updates.active,
      notes: updates.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return mapOrganizationRow(data);
}

// ============================================
// ORGANIZATION ADMIN CRUD
// ============================================

export async function createOrgAdmin(input: {
  organizationId: string;
  email: string;
  name: string;
  role?: "admin" | "manager" | "viewer";
  phone?: string;
  password?: string;
}): Promise<{ admin: OrganizationAdmin; tempPassword: string }> {
  const supabase = createSupabaseAdminClient();
  const tempPassword = input.password || generateTempPassword();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("organization_admins")
    .insert({
      organization_id: input.organizationId,
      email: input.email.toLowerCase().trim(),
      name: input.name,
      password_hash: createOrgAdminPasswordHash(tempPassword),
      role: input.role || "admin",
      phone: input.phone || null,
      active: true,
      must_reset: !input.password,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { admin: mapOrgAdminRow(data), tempPassword };
}

export async function listOrgAdmins(organizationId: string): Promise<OrganizationAdmin[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("organization_admins")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapOrgAdminRow);
}

// ============================================
// ORGANIZATION EMPLOYEES
// ============================================

export async function listOrgEmployees(organizationId: string): Promise<OrganizationEmployee[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("organization_employees")
    .select(`
      *,
      students!student_id (name, email)
    `)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    organizationId: row.organization_id,
    studentId: row.student_id,
    studentName: row.students?.name,
    studentEmail: row.students?.email,
    employeeId: row.employee_id ?? undefined,
    department: row.department ?? undefined,
    jobTitle: row.job_title ?? undefined,
    managerName: row.manager_name ?? undefined,
    managerEmail: row.manager_email ?? undefined,
    allocatedHoursPerMonth: row.allocated_hours_per_month ?? undefined,
    status: row.status as "active" | "on_leave" | "terminated",
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function addOrgEmployee(input: {
  organizationId: string;
  studentId: string;
  employeeId?: string;
  department?: string;
  jobTitle?: string;
  managerName?: string;
  managerEmail?: string;
  allocatedHoursPerMonth?: number;
}): Promise<OrganizationEmployee> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("organization_employees")
    .insert({
      organization_id: input.organizationId,
      student_id: input.studentId,
      employee_id: input.employeeId || null,
      department: input.department || null,
      job_title: input.jobTitle || null,
      manager_name: input.managerName || null,
      manager_email: input.managerEmail || null,
      allocated_hours_per_month: input.allocatedHoursPerMonth || null,
      status: "active",
      start_date: new Date().toISOString().split("T")[0],
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    organizationId: data.organization_id,
    studentId: data.student_id,
    employeeId: data.employee_id ?? undefined,
    department: data.department ?? undefined,
    jobTitle: data.job_title ?? undefined,
    managerName: data.manager_name ?? undefined,
    managerEmail: data.manager_email ?? undefined,
    allocatedHoursPerMonth: data.allocated_hours_per_month ?? undefined,
    status: data.status,
    startDate: data.start_date ?? undefined,
    endDate: data.end_date ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// ============================================
// TRAINING SESSIONS
// ============================================

export async function listTrainingSessions(
  organizationId: string,
  options?: {
    studentId?: string;
    teacherId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
  }
): Promise<TrainingSession[]> {
  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("training_sessions")
    .select(`
      *,
      students!student_id (name),
      portal_users!teacher_id (name)
    `)
    .eq("organization_id", organizationId)
    .order("session_date", { ascending: false });

  if (options?.studentId) query = query.eq("student_id", options.studentId);
  if (options?.teacherId) query = query.eq("teacher_id", options.teacherId);
  if (options?.startDate) query = query.gte("session_date", options.startDate);
  if (options?.endDate) query = query.lte("session_date", options.endDate);
  if (options?.status) query = query.eq("status", options.status);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map(mapTrainingSessionRow);
}

export async function logTrainingSession(input: {
  organizationId: string;
  studentId: string;
  enrollmentId?: string;
  teacherId?: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  sessionType?: "individual" | "group" | "self_study" | "assessment";
  topicsCovered?: string;
  materialsUsed?: string;
  homeworkAssigned?: string;
  notes?: string;
}): Promise<TrainingSession> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("training_sessions")
    .insert({
      organization_id: input.organizationId,
      student_id: input.studentId,
      enrollment_id: input.enrollmentId || null,
      teacher_id: input.teacherId || null,
      session_date: input.sessionDate,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      duration_minutes: input.durationMinutes,
      session_type: input.sessionType || "individual",
      topics_covered: input.topicsCovered || null,
      materials_used: input.materialsUsed || null,
      homework_assigned: input.homeworkAssigned || null,
      status: "completed",
      approved_by_teacher: true,
      teacher_approved_at: now,
      billable: true,
      billed: false,
      notes: input.notes || null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapTrainingSessionRow(data);
}

export async function getOrgTrainingHoursSummary(
  organizationId: string,
  startDate: string,
  endDate: string
): Promise<{
  totalHours: number;
  billableHours: number;
  sessionCount: number;
  byStudent: Array<{ studentId: string; studentName: string; hours: number; sessions: number }>;
  byTeacher: Array<{ teacherId: string; teacherName: string; hours: number; sessions: number }>;
}> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("training_sessions")
    .select(`
      id,
      student_id,
      teacher_id,
      duration_minutes,
      billable,
      students!student_id (name),
      portal_users!teacher_id (name)
    `)
    .eq("organization_id", organizationId)
    .eq("status", "completed")
    .gte("session_date", startDate)
    .lte("session_date", endDate);

  if (error || !data) {
    return {
      totalHours: 0,
      billableHours: 0,
      sessionCount: 0,
      byStudent: [],
      byTeacher: [],
    };
  }

  let totalMinutes = 0;
  let billableMinutes = 0;
  const studentMap = new Map<string, { name: string; minutes: number; sessions: number }>();
  const teacherMap = new Map<string, { name: string; minutes: number; sessions: number }>();

  for (const session of data) {
    totalMinutes += session.duration_minutes;
    if (session.billable) billableMinutes += session.duration_minutes;

    // By student
    const studentName = (session as any).students?.name || "Unknown";
    const studentStats = studentMap.get(session.student_id) || { name: studentName, minutes: 0, sessions: 0 };
    studentStats.minutes += session.duration_minutes;
    studentStats.sessions += 1;
    studentMap.set(session.student_id, studentStats);

    // By teacher
    if (session.teacher_id) {
      const teacherName = (session as any).portal_users?.name || "Unknown";
      const teacherStats = teacherMap.get(session.teacher_id) || { name: teacherName, minutes: 0, sessions: 0 };
      teacherStats.minutes += session.duration_minutes;
      teacherStats.sessions += 1;
      teacherMap.set(session.teacher_id, teacherStats);
    }
  }

  return {
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    billableHours: Math.round((billableMinutes / 60) * 100) / 100,
    sessionCount: data.length,
    byStudent: Array.from(studentMap.entries()).map(([studentId, stats]) => ({
      studentId,
      studentName: stats.name,
      hours: Math.round((stats.minutes / 60) * 100) / 100,
      sessions: stats.sessions,
    })),
    byTeacher: Array.from(teacherMap.entries()).map(([teacherId, stats]) => ({
      teacherId,
      teacherName: stats.name,
      hours: Math.round((stats.minutes / 60) * 100) / 100,
      sessions: stats.sessions,
    })),
  };
}

// ============================================
// AUDIT LOGGING
// ============================================

export async function logAuditEvent(input: {
  organizationId: string;
  actorType: "org_admin" | "jbl_admin" | "teacher" | "student" | "system";
  actorId?: string;
  actorName?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("organization_audit_log").insert({
    organization_id: input.organizationId,
    actor_type: input.actorType,
    actor_id: input.actorId || null,
    actor_name: input.actorName || null,
    action: input.action,
    resource_type: input.resourceType || null,
    resource_id: input.resourceId || null,
    details: input.details || null,
    ip_address: input.ipAddress || null,
    user_agent: input.userAgent || null,
    created_at: new Date().toISOString(),
  });
}

// ============================================
// MAPPING HELPERS
// ============================================

function mapOrganizationRow(row: any): Organization {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    primaryContactName: row.primary_contact_name ?? undefined,
    primaryContactEmail: row.primary_contact_email ?? undefined,
    primaryContactPhone: row.primary_contact_phone ?? undefined,
    billingEmail: row.billing_email ?? undefined,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    country: row.country ?? undefined,
    postalCode: row.postal_code ?? undefined,
    contractStartDate: row.contract_start_date ?? undefined,
    contractEndDate: row.contract_end_date ?? undefined,
    contractedHoursPerMonth: row.contracted_hours_per_month ?? undefined,
    contractedServices: row.contracted_services ?? undefined,
    billingRateHourly: row.billing_rate_hourly ? Number(row.billing_rate_hourly) : undefined,
    billingCycle: row.billing_cycle ?? undefined,
    paymentTermsDays: row.payment_terms_days ?? undefined,
    requireAttendanceApproval: row.require_attendance_approval ?? false,
    allowEmployeeSelfRegister: row.allow_employee_self_register ?? false,
    logoUrl: row.logo_url ?? undefined,
    active: row.active ?? true,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrgAdminRow(row: any): OrganizationAdmin {
  return {
    id: row.id,
    organizationId: row.organization_id,
    email: row.email,
    name: row.name,
    role: row.role as "admin" | "manager" | "viewer",
    phone: row.phone ?? undefined,
    active: row.active ?? true,
    mustReset: row.must_reset ?? false,
    lastLoginAt: row.last_login_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTrainingSessionRow(row: any): TrainingSession {
  return {
    id: row.id,
    organizationId: row.organization_id,
    studentId: row.student_id,
    studentName: row.students?.name ?? undefined,
    enrollmentId: row.enrollment_id ?? undefined,
    teacherId: row.teacher_id ?? undefined,
    teacherName: row.portal_users?.name ?? undefined,
    sessionDate: row.session_date,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    durationMinutes: row.duration_minutes,
    sessionType: row.session_type,
    topicsCovered: row.topics_covered ?? undefined,
    materialsUsed: row.materials_used ?? undefined,
    homeworkAssigned: row.homework_assigned ?? undefined,
    status: row.status,
    cancellationReason: row.cancellation_reason ?? undefined,
    approvedByTeacher: row.approved_by_teacher ?? false,
    teacherApprovedAt: row.teacher_approved_at ?? undefined,
    approvedByOrg: row.approved_by_org ?? undefined,
    orgApprovedAt: row.org_approved_at ?? undefined,
    orgApprovedBy: row.org_approved_by ?? undefined,
    disputeReason: row.dispute_reason ?? undefined,
    billable: row.billable ?? true,
    billed: row.billed ?? false,
    invoiceId: row.invoice_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
