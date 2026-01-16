import { NextRequest, NextResponse } from "next/server";
import { requireOrgAdminFromToken, logAuditEvent } from "@/lib/server/organization-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

// GET /api/org/services - List organization service requests
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const serviceType = searchParams.get("type");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;

    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("organization_services")
      .select(`
        *,
        portal_users!assigned_to (name, email)
      `)
      .eq("organization_id", adminWithOrg.organizationId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) query = query.eq("status", status);
    if (serviceType) query = query.eq("service_type", serviceType);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    const services = (data || []).map((s: any) => ({
      id: s.id,
      serviceType: s.service_type,
      title: s.title,
      description: s.description,
      sourceLanguage: s.source_language,
      targetLanguage: s.target_language,
      sourceFiles: s.source_files,
      deliveredFiles: s.delivered_files,
      requestedAt: s.requested_at,
      deadline: s.deadline,
      deliveredAt: s.delivered_at,
      status: s.status,
      quotedPrice: s.quoted_price ? Number(s.quoted_price) : null,
      finalPrice: s.final_price ? Number(s.final_price) : null,
      wordCount: s.word_count,
      assignedTo: s.portal_users?.name,
      notes: s.notes,
      createdAt: s.created_at,
    }));

    return NextResponse.json({ services });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to list services." },
      { status }
    );
  }
}

// POST /api/org/services - Request a new service
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-org-token") ?? undefined;
    const adminWithOrg = await requireOrgAdminFromToken(token);

    // Only admins and managers can request services
    if (adminWithOrg.role === "viewer") {
      return NextResponse.json({ message: "Not authorized to request services." }, { status: 403 });
    }

    // Check if services are in contract
    const contractedServices = adminWithOrg.organization.contractedServices || [];
    const body = await request.json();
    const { serviceType, title, description, sourceLanguage, targetLanguage, deadline, notes } = body;

    if (!serviceType || !title) {
      return NextResponse.json({ message: "Service type and title are required." }, { status: 400 });
    }

    // Map service type to contract type
    const serviceToContractMap: Record<string, string> = {
      translation: "translation",
      interpretation: "interpretation",
      localization: "localization",
      transcription: "translation",
      proofreading: "translation",
    };

    const contractType = serviceToContractMap[serviceType] || serviceType;
    if (!contractedServices.includes(contractType) && !contractedServices.includes("all")) {
      return NextResponse.json(
        { message: `Your contract does not include ${serviceType} services.` },
        { status: 403 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("organization_services")
      .insert({
        organization_id: adminWithOrg.organizationId,
        service_type: serviceType,
        title,
        description: description || null,
        source_language: sourceLanguage || null,
        target_language: targetLanguage || null,
        deadline: deadline || null,
        status: "requested",
        requested_at: now,
        notes: notes || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Audit log
    await logAuditEvent({
      organizationId: adminWithOrg.organizationId,
      actorType: "org_admin",
      actorId: adminWithOrg.id,
      actorName: adminWithOrg.name,
      action: "service_requested",
      resourceType: "organization_service",
      resourceId: data.id,
      details: { serviceType, title },
    });

    return NextResponse.json({
      service: {
        id: data.id,
        serviceType: data.service_type,
        title: data.title,
        status: data.status,
        requestedAt: data.requested_at,
      },
    });
  } catch (err) {
    const status = typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to request service." },
      { status }
    );
  }
}
