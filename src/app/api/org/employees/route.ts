import { NextRequest, NextResponse } from "next/server";
import {
  requireOrgAdminFromToken,
  listOrgEmployees,
  addOrgEmployee,
  logAuditEvent,
} from "@/lib/server/organization-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

// GET /api/org/employees - List organization employees (students)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);

    const employees = await listOrgEmployees(adminWithOrg.organizationId);

    // Also get their enrollment info
    const supabase = createSupabaseAdminClient();
    const studentIds = employees.map((e) => e.studentId);

    let enrollments: any[] = [];
    if (studentIds.length > 0) {
      const { data } = await supabase
        .from("student_enrollments")
        .select("id, student_id, language, current_level, status, teacher_id, portal_users!teacher_id(name)")
        .in("student_id", studentIds)
        .eq("status", "active");

      enrollments = data || [];
    }

    // Map enrollments to employees
    const employeesWithEnrollments = employees.map((emp) => ({
      ...emp,
      enrollments: enrollments
        .filter((e: any) => e.student_id === emp.studentId)
        .map((e: any) => ({
          id: e.id,
          language: e.language,
          currentLevel: e.current_level,
          status: e.status,
          teacherName: e.portal_users?.name,
        })),
    }));

    return NextResponse.json({ employees: employeesWithEnrollments });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to list employees." },
      { status }
    );
  }
}

// POST /api/org/employees - Add an employee to the organization
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);

    // Only admins and managers can add employees
    if (adminWithOrg.role === "viewer") {
      return NextResponse.json({ message: "Not authorized to add employees." }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, employeeId, department, jobTitle, managerName, managerEmail, allocatedHoursPerMonth } = body;

    if (!studentId) {
      return NextResponse.json({ message: "Student ID is required." }, { status: 400 });
    }

    // Verify student exists
    const supabase = createSupabaseAdminClient();
    const { data: student } = await supabase
      .from("students")
      .select("id, name, email")
      .eq("id", studentId)
      .maybeSingle();

    if (!student) {
      return NextResponse.json({ message: "Student not found." }, { status: 404 });
    }

    // Check if already linked
    const { data: existing } = await supabase
      .from("organization_employees")
      .select("id")
      .eq("organization_id", adminWithOrg.organizationId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: "This student is already linked to your organization." }, { status: 400 });
    }

    const employee = await addOrgEmployee({
      organizationId: adminWithOrg.organizationId,
      studentId,
      employeeId,
      department,
      jobTitle,
      managerName,
      managerEmail,
      allocatedHoursPerMonth,
    });

    // Audit log
    await logAuditEvent({
      organizationId: adminWithOrg.organizationId,
      actorType: "org_admin",
      actorId: adminWithOrg.id,
      actorName: adminWithOrg.name,
      action: "employee_added",
      resourceType: "organization_employee",
      resourceId: employee.id,
      details: { studentId, studentName: student.name },
    });

    return NextResponse.json({
      employee: {
        ...employee,
        studentName: student.name,
        studentEmail: student.email,
      },
    });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to add employee." },
      { status }
    );
  }
}
