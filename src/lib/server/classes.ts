import { createSupabaseAdminClient } from "../supabase-server";

// Types
export type Class = {
  id: string;
  name: string;
  description: string | null;
  teacher_id: string | null;
  language: string;
  level: string;
  max_students: number;
  status: "active" | "archived" | "cancelled";
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  teacher?: { id: string; name: string; email: string } | null;
  student_count?: number;
  next_session?: ClassSession | null;
};

export type ClassEnrollment = {
  id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
  enrolled_by: string | null;
  status: "active" | "dropped" | "completed";
  // Joined fields
  student?: { id: string; name: string; email: string };
};

export type ClassSession = {
  id: string;
  class_id: string;
  title: string | null;
  description: string | null;
  start_time: string;
  end_time: string;
  recurring_pattern: string | null;
  recurring_end_date: string | null;
  meeting_url: string | null;
  meeting_id: string | null;
  meeting_provider: string | null;
  location: string | null;
  session_type: "regular" | "makeup" | "exam" | "orientation";
  cancelled: boolean;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  class?: Class;
  attendance?: SessionAttendance[];
};

export type SessionAttendance = {
  id: string;
  session_id: string;
  student_id: string;
  status: "scheduled" | "present" | "absent" | "excused" | "late";
  joined_at: string | null;
  left_at: string | null;
  notes: string | null;
  marked_by: string | null;
  marked_at: string | null;
  // Joined fields
  student?: { id: string; name: string; email: string };
};

// ============ Class CRUD ============

export async function createClass(params: {
  name: string;
  description?: string;
  teacherId?: string;
  language: string;
  level: string;
  maxStudents?: number;
  createdBy?: string;
}): Promise<Class> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("classes")
    .insert({
      name: params.name,
      description: params.description ?? null,
      teacher_id: params.teacherId ?? null,
      language: params.language,
      level: params.level,
      max_students: params.maxStudents ?? 10,
      status: "active",
      created_by: params.createdBy ?? null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create class");
  return data as Class;
}

export async function updateClass(params: {
  id: string;
  updates: {
    name?: string;
    description?: string;
    teacherId?: string | null;
    language?: string;
    level?: string;
    maxStudents?: number;
    status?: "active" | "archived" | "cancelled";
  };
}): Promise<Class> {
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (params.updates.name !== undefined) updateData.name = params.updates.name;
  if (params.updates.description !== undefined) updateData.description = params.updates.description;
  if (params.updates.teacherId !== undefined) updateData.teacher_id = params.updates.teacherId;
  if (params.updates.language !== undefined) updateData.language = params.updates.language;
  if (params.updates.level !== undefined) updateData.level = params.updates.level;
  if (params.updates.maxStudents !== undefined) updateData.max_students = params.updates.maxStudents;
  if (params.updates.status !== undefined) updateData.status = params.updates.status;

  const { data, error } = await supabase
    .from("classes")
    .update(updateData)
    .eq("id", params.id)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update class");
  return data as Class;
}

export async function deleteClass(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getClass(id: string): Promise<Class | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  // Get teacher info
  if (data.teacher_id) {
    const { data: teacher } = await supabase
      .from("portal_users")
      .select("id, name, email")
      .eq("id", data.teacher_id)
      .maybeSingle();
    (data as Class).teacher = teacher;
  }

  // Get student count
  const { count } = await supabase
    .from("class_enrollments")
    .select("*", { count: "exact", head: true })
    .eq("class_id", id)
    .eq("status", "active");
  (data as Class).student_count = count ?? 0;

  // Get next session
  const { data: nextSession } = await supabase
    .from("class_sessions")
    .select("*")
    .eq("class_id", id)
    .eq("cancelled", false)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(1)
    .maybeSingle();
  (data as Class).next_session = nextSession;

  return data as Class;
}

export async function listClasses(options: {
  teacherId?: string;
  studentId?: string;
  status?: "active" | "archived" | "cancelled";
  includeStudentCount?: boolean;
}): Promise<Class[]> {
  const supabase = createSupabaseAdminClient();

  let query = supabase.from("classes").select("*");

  if (options.teacherId) {
    query = query.eq("teacher_id", options.teacherId);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let classes = (data ?? []) as Class[];

  // Filter by student enrollment if needed
  if (options.studentId) {
    const { data: enrollments } = await supabase
      .from("class_enrollments")
      .select("class_id")
      .eq("student_id", options.studentId)
      .eq("status", "active");

    const enrolledClassIds = new Set((enrollments ?? []).map((e) => e.class_id));
    classes = classes.filter((c) => enrolledClassIds.has(c.id));
  }

  // Get teacher info and student counts
  for (const cls of classes) {
    if (cls.teacher_id) {
      const { data: teacher } = await supabase
        .from("portal_users")
        .select("id, name, email")
        .eq("id", cls.teacher_id)
        .maybeSingle();
      cls.teacher = teacher;
    }

    if (options.includeStudentCount) {
      const { count } = await supabase
        .from("class_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("class_id", cls.id)
        .eq("status", "active");
      cls.student_count = count ?? 0;
    }
  }

  return classes;
}

// ============ Class Enrollments ============

export async function enrollStudent(params: {
  classId: string;
  studentId: string;
  enrolledBy?: string;
}): Promise<ClassEnrollment> {
  const supabase = createSupabaseAdminClient();

  // Check max students
  const { data: cls } = await supabase
    .from("classes")
    .select("max_students")
    .eq("id", params.classId)
    .single();

  const { count } = await supabase
    .from("class_enrollments")
    .select("*", { count: "exact", head: true })
    .eq("class_id", params.classId)
    .eq("status", "active");

  if (cls && count !== null && count >= cls.max_students) {
    throw new Error("Class is full");
  }

  const { data, error } = await supabase
    .from("class_enrollments")
    .upsert(
      {
        class_id: params.classId,
        student_id: params.studentId,
        enrolled_by: params.enrolledBy ?? null,
        status: "active",
        enrolled_at: new Date().toISOString(),
      },
      { onConflict: "class_id,student_id" }
    )
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to enroll student");
  return data as ClassEnrollment;
}

export async function unenrollStudent(params: {
  classId: string;
  studentId: string;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("class_enrollments")
    .update({ status: "dropped" })
    .eq("class_id", params.classId)
    .eq("student_id", params.studentId);

  if (error) throw new Error(error.message);
}

export async function getClassEnrollments(classId: string): Promise<ClassEnrollment[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("class_enrollments")
    .select("*")
    .eq("class_id", classId)
    .eq("status", "active")
    .order("enrolled_at", { ascending: true });

  if (error) throw new Error(error.message);

  // Get student info
  const enrollments = (data ?? []) as ClassEnrollment[];
  for (const enrollment of enrollments) {
    const { data: student } = await supabase
      .from("portal_users")
      .select("id, name, email")
      .eq("id", enrollment.student_id)
      .maybeSingle();
    enrollment.student = student ?? undefined;
  }

  return enrollments;
}

// ============ Class Sessions ============

export async function createSession(params: {
  classId: string;
  title?: string;
  description?: string;
  startTime: string;
  endTime: string;
  recurringPattern?: string;
  recurringEndDate?: string;
  meetingUrl?: string;
  meetingProvider?: string;
  location?: string;
  sessionType?: "regular" | "makeup" | "exam" | "orientation";
}): Promise<ClassSession> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("class_sessions")
    .insert({
      class_id: params.classId,
      title: params.title ?? null,
      description: params.description ?? null,
      start_time: params.startTime,
      end_time: params.endTime,
      recurring_pattern: params.recurringPattern ?? null,
      recurring_end_date: params.recurringEndDate ?? null,
      meeting_url: params.meetingUrl ?? null,
      meeting_provider: params.meetingProvider ?? null,
      location: params.location ?? null,
      session_type: params.sessionType ?? "regular",
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create session");

  // Create attendance records for all enrolled students
  const enrollments = await getClassEnrollments(params.classId);
  if (enrollments.length > 0) {
    await supabase.from("session_attendance").insert(
      enrollments.map((e) => ({
        session_id: data.id,
        student_id: e.student_id,
        status: "scheduled",
      }))
    );
  }

  return data as ClassSession;
}

export async function updateSession(params: {
  id: string;
  updates: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    meetingUrl?: string;
    meetingProvider?: string;
    location?: string;
    sessionType?: "regular" | "makeup" | "exam" | "orientation";
    cancelled?: boolean;
    cancelledReason?: string;
  };
}): Promise<ClassSession> {
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (params.updates.title !== undefined) updateData.title = params.updates.title;
  if (params.updates.description !== undefined) updateData.description = params.updates.description;
  if (params.updates.startTime !== undefined) updateData.start_time = params.updates.startTime;
  if (params.updates.endTime !== undefined) updateData.end_time = params.updates.endTime;
  if (params.updates.meetingUrl !== undefined) updateData.meeting_url = params.updates.meetingUrl;
  if (params.updates.meetingProvider !== undefined) updateData.meeting_provider = params.updates.meetingProvider;
  if (params.updates.location !== undefined) updateData.location = params.updates.location;
  if (params.updates.sessionType !== undefined) updateData.session_type = params.updates.sessionType;
  if (params.updates.cancelled !== undefined) updateData.cancelled = params.updates.cancelled;
  if (params.updates.cancelledReason !== undefined) updateData.cancelled_reason = params.updates.cancelledReason;

  const { data, error } = await supabase
    .from("class_sessions")
    .update(updateData)
    .eq("id", params.id)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update session");
  return data as ClassSession;
}

export async function deleteSession(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("class_sessions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getClassSessions(params: {
  classId?: string;
  teacherId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  includeCancelled?: boolean;
}): Promise<ClassSession[]> {
  const supabase = createSupabaseAdminClient();

  let query = supabase.from("class_sessions").select("*");

  if (params.classId) {
    query = query.eq("class_id", params.classId);
  }

  if (!params.includeCancelled) {
    query = query.eq("cancelled", false);
  }

  if (params.startDate) {
    query = query.gte("start_time", params.startDate);
  }

  if (params.endDate) {
    query = query.lte("start_time", params.endDate);
  }

  query = query.order("start_time", { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let sessions = (data ?? []) as ClassSession[];

  // Filter by teacher if needed
  if (params.teacherId) {
    const { data: classes } = await supabase
      .from("classes")
      .select("id")
      .eq("teacher_id", params.teacherId);
    const classIds = new Set((classes ?? []).map((c) => c.id));
    sessions = sessions.filter((s) => classIds.has(s.class_id));
  }

  // Filter by student enrollment if needed
  if (params.studentId) {
    const { data: enrollments } = await supabase
      .from("class_enrollments")
      .select("class_id")
      .eq("student_id", params.studentId)
      .eq("status", "active");
    const classIds = new Set((enrollments ?? []).map((e) => e.class_id));
    sessions = sessions.filter((s) => classIds.has(s.class_id));
  }

  // Get class info for each session
  for (const session of sessions) {
    const { data: cls } = await supabase
      .from("classes")
      .select("*")
      .eq("id", session.class_id)
      .maybeSingle();
    session.class = cls as Class | undefined;
  }

  return sessions;
}

// ============ Attendance ============

export async function markAttendance(params: {
  sessionId: string;
  studentId: string;
  status: "present" | "absent" | "excused" | "late";
  markedBy?: string;
  notes?: string;
}): Promise<SessionAttendance> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("session_attendance")
    .upsert(
      {
        session_id: params.sessionId,
        student_id: params.studentId,
        status: params.status,
        marked_by: params.markedBy ?? null,
        marked_at: new Date().toISOString(),
        notes: params.notes ?? null,
        joined_at: params.status === "present" || params.status === "late" ? new Date().toISOString() : null,
      },
      { onConflict: "session_id,student_id" }
    )
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to mark attendance");
  return data as SessionAttendance;
}

export async function getSessionAttendance(sessionId: string): Promise<SessionAttendance[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("session_attendance")
    .select("*")
    .eq("session_id", sessionId);

  if (error) throw new Error(error.message);

  const attendance = (data ?? []) as SessionAttendance[];

  // Get student info
  for (const record of attendance) {
    const { data: student } = await supabase
      .from("portal_users")
      .select("id, name, email")
      .eq("id", record.student_id)
      .maybeSingle();
    record.student = student ?? undefined;
  }

  return attendance;
}

// ============ Calendar Export ============

export function generateICalEvent(session: ClassSession & { class?: Class }): string {
  const formatDate = (date: string) => {
    return new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };

  const className = session.class?.name ?? "Class Session";
  const title = session.title ? `${className}: ${session.title}` : className;

  let description = session.description ?? "";
  if (session.meeting_url) {
    description += `\\n\\nJoin meeting: ${session.meeting_url}`;
  }
  if (session.location) {
    description += `\\n\\nLocation: ${session.location}`;
  }

  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JB Linguistics//Class Schedule//EN",
    "BEGIN:VEVENT",
    `UID:${session.id}@jblinguistics.com`,
    `DTSTAMP:${formatDate(new Date().toISOString())}`,
    `DTSTART:${formatDate(session.start_time)}`,
    `DTEND:${formatDate(session.end_time)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    session.location ? `LOCATION:${session.location}` : "",
    session.meeting_url ? `URL:${session.meeting_url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return ical;
}

export function generateGoogleCalendarUrl(session: ClassSession & { class?: Class }): string {
  const className = session.class?.name ?? "Class Session";
  const title = session.title ? `${className}: ${session.title}` : className;

  const formatDate = (date: string) => {
    return new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };

  let details = session.description ?? "";
  if (session.meeting_url) {
    details += `\n\nJoin meeting: ${session.meeting_url}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatDate(session.start_time)}/${formatDate(session.end_time)}`,
    details: details,
    location: session.location ?? "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ============ Dashboard Stats ============

export async function getTeacherDashboardStats(teacherId: string): Promise<{
  totalClasses: number;
  totalStudents: number;
  upcomingSessions: number;
  todaySessions: ClassSession[];
}> {
  const supabase = createSupabaseAdminClient();

  // Get teacher's classes
  const { data: classes, count: totalClasses } = await supabase
    .from("classes")
    .select("id", { count: "exact" })
    .eq("teacher_id", teacherId)
    .eq("status", "active");

  const classIds = (classes ?? []).map((c) => c.id);

  // Get total students
  let totalStudents = 0;
  if (classIds.length > 0) {
    const { count } = await supabase
      .from("class_enrollments")
      .select("*", { count: "exact", head: true })
      .in("class_id", classIds)
      .eq("status", "active");
    totalStudents = count ?? 0;
  }

  // Get upcoming sessions count
  const now = new Date().toISOString();
  let upcomingSessions = 0;
  if (classIds.length > 0) {
    const { count } = await supabase
      .from("class_sessions")
      .select("*", { count: "exact", head: true })
      .in("class_id", classIds)
      .gte("start_time", now)
      .eq("cancelled", false);
    upcomingSessions = count ?? 0;
  }

  // Get today's sessions
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  let todaySessions: ClassSession[] = [];
  if (classIds.length > 0) {
    const { data } = await supabase
      .from("class_sessions")
      .select("*")
      .in("class_id", classIds)
      .gte("start_time", todayStart.toISOString())
      .lte("start_time", todayEnd.toISOString())
      .eq("cancelled", false)
      .order("start_time", { ascending: true });
    todaySessions = (data ?? []) as ClassSession[];

    // Get class info for each session
    for (const session of todaySessions) {
      const { data: cls } = await supabase
        .from("classes")
        .select("*")
        .eq("id", session.class_id)
        .maybeSingle();
      session.class = cls as Class | undefined;
    }
  }

  return {
    totalClasses: totalClasses ?? 0,
    totalStudents,
    upcomingSessions,
    todaySessions,
  };
}

export async function getStudentDashboardStats(studentId: string): Promise<{
  enrolledClasses: number;
  upcomingSessions: number;
  todaySessions: ClassSession[];
}> {
  const supabase = createSupabaseAdminClient();

  // Get student's enrolled classes
  const { data: enrollments, count: enrolledClasses } = await supabase
    .from("class_enrollments")
    .select("class_id", { count: "exact" })
    .eq("student_id", studentId)
    .eq("status", "active");

  const classIds = (enrollments ?? []).map((e) => e.class_id);

  // Get upcoming sessions count
  const now = new Date().toISOString();
  let upcomingSessions = 0;
  if (classIds.length > 0) {
    const { count } = await supabase
      .from("class_sessions")
      .select("*", { count: "exact", head: true })
      .in("class_id", classIds)
      .gte("start_time", now)
      .eq("cancelled", false);
    upcomingSessions = count ?? 0;
  }

  // Get today's sessions
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  let todaySessions: ClassSession[] = [];
  if (classIds.length > 0) {
    const { data } = await supabase
      .from("class_sessions")
      .select("*")
      .in("class_id", classIds)
      .gte("start_time", todayStart.toISOString())
      .lte("start_time", todayEnd.toISOString())
      .eq("cancelled", false)
      .order("start_time", { ascending: true });
    todaySessions = (data ?? []) as ClassSession[];

    // Get class info for each session
    for (const session of todaySessions) {
      const { data: cls } = await supabase
        .from("classes")
        .select("*")
        .eq("id", session.class_id)
        .maybeSingle();
      session.class = cls as Class | undefined;
    }
  }

  return {
    enrolledClasses: enrolledClasses ?? 0,
    upcomingSessions,
    todaySessions,
  };
}
