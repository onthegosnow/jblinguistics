import { NextRequest, NextResponse } from "next/server";
import {
  requireOrgAdminFromToken,
  getOrgTrainingHoursSummary,
  logAuditEvent,
} from "@/lib/server/organization-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

// GET /api/org/reports - Get training hours summary and reports
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "summary";

    // Default to current month
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    const startDate = searchParams.get("startDate") || defaultStart;
    const endDate = searchParams.get("endDate") || defaultEnd;

    if (reportType === "summary") {
      const summary = await getOrgTrainingHoursSummary(
        adminWithOrg.organizationId,
        startDate,
        endDate
      );

      // Also get contract info for comparison
      const org = adminWithOrg.organization;

      return NextResponse.json({
        period: { startDate, endDate },
        contract: {
          hoursPerMonth: org.contractedHoursPerMonth,
          billingRate: org.billingRateHourly,
        },
        summary: {
          ...summary,
          estimatedCost: org.billingRateHourly
            ? Math.round(summary.billableHours * Number(org.billingRateHourly) * 100) / 100
            : null,
          hoursRemaining: org.contractedHoursPerMonth
            ? org.contractedHoursPerMonth - summary.billableHours
            : null,
        },
      });
    }

    if (reportType === "detailed") {
      // Get all sessions with full details for export
      const supabase = createSupabaseAdminClient();
      const { data: sessions } = await supabase
        .from("training_sessions")
        .select(`
          id,
          session_date,
          start_time,
          end_time,
          duration_minutes,
          session_type,
          topics_covered,
          status,
          approved_by_teacher,
          approved_by_org,
          billable,
          students!student_id (name, email),
          portal_users!teacher_id (name, email)
        `)
        .eq("organization_id", adminWithOrg.organizationId)
        .gte("session_date", startDate)
        .lte("session_date", endDate)
        .order("session_date", { ascending: true });

      // Also get employee info for context
      const { data: employees } = await supabase
        .from("organization_employees")
        .select(`
          student_id,
          employee_id,
          department,
          job_title
        `)
        .eq("organization_id", adminWithOrg.organizationId);

      const employeeMap = new Map(
        (employees || []).map((e: any) => [e.student_id, e])
      );

      const detailedSessions = (sessions || []).map((s: any) => {
        const emp = employeeMap.get(s.student_id) as any;
        return {
          date: s.session_date,
          startTime: s.start_time,
          endTime: s.end_time,
          durationMinutes: s.duration_minutes,
          durationHours: Math.round((s.duration_minutes / 60) * 100) / 100,
          sessionType: s.session_type,
          topicsCovered: s.topics_covered,
          status: s.status,
          teacherApproved: s.approved_by_teacher,
          orgApproved: s.approved_by_org,
          billable: s.billable,
          studentName: s.students?.name,
          studentEmail: s.students?.email,
          teacherName: s.portal_users?.name,
          employeeId: emp?.employee_id,
          department: emp?.department,
          jobTitle: emp?.job_title,
        };
      });

      // Audit log for detailed report access
      await logAuditEvent({
        organizationId: adminWithOrg.organizationId,
        actorType: "org_admin",
        actorId: adminWithOrg.id,
        actorName: adminWithOrg.name,
        action: "report_exported",
        details: { reportType: "detailed", startDate, endDate, sessionCount: detailedSessions.length },
      });

      return NextResponse.json({
        period: { startDate, endDate },
        sessions: detailedSessions,
      });
    }

    if (reportType === "employee") {
      // Per-employee breakdown
      const summary = await getOrgTrainingHoursSummary(
        adminWithOrg.organizationId,
        startDate,
        endDate
      );

      // Enrich with employee info
      const supabase = createSupabaseAdminClient();
      const { data: employees } = await supabase
        .from("organization_employees")
        .select(`
          student_id,
          employee_id,
          department,
          job_title,
          allocated_hours_per_month,
          status
        `)
        .eq("organization_id", adminWithOrg.organizationId);

      const employeeMap = new Map(
        (employees || []).map((e: any) => [e.student_id, e])
      );

      const employeeReport = summary.byStudent.map((s) => {
        const emp = employeeMap.get(s.studentId) as any;
        return {
          studentId: s.studentId,
          studentName: s.studentName,
          employeeId: emp?.employee_id,
          department: emp?.department,
          jobTitle: emp?.job_title,
          allocatedHours: emp?.allocated_hours_per_month,
          actualHours: s.hours,
          sessions: s.sessions,
          status: emp?.status,
          variance: emp?.allocated_hours_per_month
            ? Math.round((s.hours - emp.allocated_hours_per_month) * 100) / 100
            : null,
        };
      });

      return NextResponse.json({
        period: { startDate, endDate },
        employees: employeeReport,
      });
    }

    return NextResponse.json({ message: "Invalid report type." }, { status: 400 });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to generate report." },
      { status }
    );
  }
}
