import { NextRequest, NextResponse } from "next/server";
import {
  requireOrgAdminFromToken,
  listTrainingSessions,
  logAuditEvent,
} from "@/lib/server/organization-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

// GET /api/org/sessions - List training sessions for the organization
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") ?? undefined;
    const teacherId = searchParams.get("teacherId") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100;

    const sessions = await listTrainingSessions(adminWithOrg.organizationId, {
      studentId,
      teacherId,
      startDate,
      endDate,
      status,
      limit,
    });

    return NextResponse.json({ sessions });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to list sessions." },
      { status }
    );
  }
}

// POST /api/org/sessions/[id]/approve - Approve or dispute a session (for orgs with approval workflow)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);

    // Only admins and managers can approve sessions
    if (adminWithOrg.role === "viewer") {
      return NextResponse.json({ message: "Not authorized to approve sessions." }, { status: 403 });
    }

    const body = await request.json();
    const { sessionId, approved, disputeReason } = body;

    if (!sessionId) {
      return NextResponse.json({ message: "Session ID required." }, { status: 400 });
    }

    if (approved === undefined) {
      return NextResponse.json({ message: "Approval status required." }, { status: 400 });
    }

    if (!approved && !disputeReason) {
      return NextResponse.json({ message: "Dispute reason required when rejecting." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Verify session belongs to this org
    const { data: session } = await supabase
      .from("training_sessions")
      .select("id, student_id")
      .eq("id", sessionId)
      .eq("organization_id", adminWithOrg.organizationId)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("training_sessions")
      .update({
        approved_by_org: approved,
        org_approved_at: now,
        org_approved_by: adminWithOrg.id,
        dispute_reason: approved ? null : disputeReason,
        updated_at: now,
      })
      .eq("id", sessionId);

    if (error) throw new Error(error.message);

    // Audit log
    await logAuditEvent({
      organizationId: adminWithOrg.organizationId,
      actorType: "org_admin",
      actorId: adminWithOrg.id,
      actorName: adminWithOrg.name,
      action: approved ? "session_approved" : "session_disputed",
      resourceType: "training_session",
      resourceId: sessionId,
      details: approved ? {} : { disputeReason },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to update session." },
      { status }
    );
  }
}
