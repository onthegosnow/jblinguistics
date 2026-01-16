import { NextRequest, NextResponse } from "next/server";
import { requireOrgAdminFromToken, logAuditEvent } from "@/lib/server/organization-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

// GET /api/org/services/[id] - Get service request details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);
    const { id } = await params;

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("organization_services")
      .select(`
        *,
        portal_users!assigned_to (name, email)
      `)
      .eq("id", id)
      .eq("organization_id", adminWithOrg.organizationId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ message: "Service request not found." }, { status: 404 });
    }

    return NextResponse.json({
      service: {
        id: data.id,
        serviceType: data.service_type,
        title: data.title,
        description: data.description,
        sourceLanguage: data.source_language,
        targetLanguage: data.target_language,
        sourceFiles: data.source_files,
        deliveredFiles: data.delivered_files,
        requestedAt: data.requested_at,
        deadline: data.deadline,
        deliveredAt: data.delivered_at,
        status: data.status,
        quotedPrice: data.quoted_price ? Number(data.quoted_price) : null,
        finalPrice: data.final_price ? Number(data.final_price) : null,
        wordCount: data.word_count,
        assignedTo: (data as any).portal_users?.name,
        assignedToEmail: (data as any).portal_users?.email,
        approvedAt: data.approved_at,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to get service." },
      { status }
    );
  }
}

// PATCH /api/org/services/[id] - Update service request (approve quote, cancel, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);
    const { id } = await params;

    // Only admins and managers can update services
    if (adminWithOrg.role === "viewer") {
      return NextResponse.json({ message: "Not authorized to update services." }, { status: 403 });
    }

    const body = await request.json();
    const { action, notes } = body;

    const supabase = createSupabaseAdminClient();

    // Get current service
    const { data: service } = await supabase
      .from("organization_services")
      .select("id, status, quoted_price")
      .eq("id", id)
      .eq("organization_id", adminWithOrg.organizationId)
      .maybeSingle();

    if (!service) {
      return NextResponse.json({ message: "Service request not found." }, { status: 404 });
    }

    const now = new Date().toISOString();
    const updates: Record<string, any> = { updated_at: now };
    let auditAction = "";

    if (action === "approve_quote") {
      // Approve a quoted service
      if (service.status !== "quoted") {
        return NextResponse.json({ message: "Service is not in quoted status." }, { status: 400 });
      }
      updates.status = "approved";
      updates.approved_by = adminWithOrg.id;
      updates.approved_at = now;
      auditAction = "service_quote_approved";
    } else if (action === "cancel") {
      // Cancel a pending service
      if (!["requested", "quoted", "approved"].includes(service.status)) {
        return NextResponse.json({ message: "Cannot cancel a service in this status." }, { status: 400 });
      }
      updates.status = "cancelled";
      auditAction = "service_cancelled";
    } else if (action === "mark_completed") {
      // Mark delivered service as completed (accepted by org)
      if (service.status !== "delivered") {
        return NextResponse.json({ message: "Service is not in delivered status." }, { status: 400 });
      }
      updates.status = "completed";
      auditAction = "service_completed";
    } else {
      return NextResponse.json({ message: "Invalid action." }, { status: 400 });
    }

    if (notes) updates.notes = notes;

    const { error } = await supabase
      .from("organization_services")
      .update(updates)
      .eq("id", id);

    if (error) throw new Error(error.message);

    // Audit log
    await logAuditEvent({
      organizationId: adminWithOrg.organizationId,
      actorType: "org_admin",
      actorId: adminWithOrg.id,
      actorName: adminWithOrg.name,
      action: auditAction,
      resourceType: "organization_service",
      resourceId: id,
    });

    return NextResponse.json({ success: true, newStatus: updates.status });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to update service." },
      { status }
    );
  }
}
