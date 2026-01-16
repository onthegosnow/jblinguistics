import { NextRequest, NextResponse } from "next/server";
import { requireOrgAdminFromToken, logAuditEvent } from "@/lib/server/organization-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

// GET /api/org/employees/[id] - Get employee details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);
    const { id } = await params;

    const supabase = createSupabaseAdminClient();
    const { data: employee, error } = await supabase
      .from("organization_employees")
      .select(`
        *,
        students!student_id (id, name, email, phone)
      `)
      .eq("id", id)
      .eq("organization_id", adminWithOrg.organizationId)
      .maybeSingle();

    if (error || !employee) {
      return NextResponse.json({ message: "Employee not found." }, { status: 404 });
    }

    // Get their enrollments
    const { data: enrollments } = await supabase
      .from("student_enrollments")
      .select("id, language, current_level, target_level, status, start_date, teacher_id, portal_users!teacher_id(name)")
      .eq("student_id", employee.student_id);

    // Get recent training sessions
    const { data: recentSessions } = await supabase
      .from("training_sessions")
      .select("id, session_date, duration_minutes, status, topics_covered, portal_users!teacher_id(name)")
      .eq("organization_id", adminWithOrg.organizationId)
      .eq("student_id", employee.student_id)
      .order("session_date", { ascending: false })
      .limit(10);

    return NextResponse.json({
      employee: {
        id: employee.id,
        studentId: employee.student_id,
        studentName: (employee as any).students?.name,
        studentEmail: (employee as any).students?.email,
        studentPhone: (employee as any).students?.phone,
        employeeId: employee.employee_id,
        department: employee.department,
        jobTitle: employee.job_title,
        managerName: employee.manager_name,
        managerEmail: employee.manager_email,
        allocatedHoursPerMonth: employee.allocated_hours_per_month,
        status: employee.status,
        startDate: employee.start_date,
        endDate: employee.end_date,
        notes: employee.notes,
      },
      enrollments: (enrollments || []).map((e: any) => ({
        id: e.id,
        language: e.language,
        currentLevel: e.current_level,
        targetLevel: e.target_level,
        status: e.status,
        startDate: e.start_date,
        teacherName: e.portal_users?.name,
      })),
      recentSessions: (recentSessions || []).map((s: any) => ({
        id: s.id,
        sessionDate: s.session_date,
        durationMinutes: s.duration_minutes,
        status: s.status,
        topicsCovered: s.topics_covered,
        teacherName: s.portal_users?.name,
      })),
    });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to get employee." },
      { status }
    );
  }
}

// PATCH /api/org/employees/[id] - Update employee details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);
    const { id } = await params;

    // Only admins and managers can update
    if (adminWithOrg.role === "viewer") {
      return NextResponse.json({ message: "Not authorized to update employees." }, { status: 403 });
    }

    const body = await request.json();
    const { employeeId, department, jobTitle, managerName, managerEmail, allocatedHoursPerMonth, status, notes } = body;

    const supabase = createSupabaseAdminClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from("organization_employees")
      .select("id")
      .eq("id", id)
      .eq("organization_id", adminWithOrg.organizationId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ message: "Employee not found." }, { status: 404 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (employeeId !== undefined) updates.employee_id = employeeId || null;
    if (department !== undefined) updates.department = department || null;
    if (jobTitle !== undefined) updates.job_title = jobTitle || null;
    if (managerName !== undefined) updates.manager_name = managerName || null;
    if (managerEmail !== undefined) updates.manager_email = managerEmail || null;
    if (allocatedHoursPerMonth !== undefined) updates.allocated_hours_per_month = allocatedHoursPerMonth || null;
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes || null;

    // If terminating, set end date
    if (status === "terminated" && !body.endDate) {
      updates.end_date = new Date().toISOString().split("T")[0];
    }

    const { error } = await supabase
      .from("organization_employees")
      .update(updates)
      .eq("id", id);

    if (error) throw new Error(error.message);

    // Audit log
    await logAuditEvent({
      organizationId: adminWithOrg.organizationId,
      actorType: "org_admin",
      actorId: adminWithOrg.id,
      actorName: adminWithOrg.name,
      action: "employee_updated",
      resourceType: "organization_employee",
      resourceId: id,
      details: { fieldsUpdated: Object.keys(updates).filter((k) => k !== "updated_at") },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to update employee." },
      { status }
    );
  }
}
