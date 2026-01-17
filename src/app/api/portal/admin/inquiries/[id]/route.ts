import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/server/storage";
import { syncInquiryToHubSpot, isHubSpotConfigured } from "@/lib/server/hubspot";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as { metadata?: Record<string, string>; status?: string };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("inquiries")
    .update({
      metadata: body.metadata ?? null,
      source: body.status ?? undefined,
    })
    .eq("id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// POST: Sync inquiry to HubSpot
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

  if (!isHubSpotConfigured()) {
    return NextResponse.json({ message: "HubSpot is not configured. Add HUBSPOT_ACCESS_TOKEN to environment." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !inquiry) {
    return NextResponse.json({ message: "Inquiry not found" }, { status: 404 });
  }

  const result = await syncInquiryToHubSpot({
    name: inquiry.name,
    email: inquiry.email,
    organization: inquiry.organization,
    serviceType: inquiry.service_type,
    languages: inquiry.languages,
    details: inquiry.details,
    budget: inquiry.budget,
    timeline: inquiry.timeline,
    source: inquiry.source,
    metadata: inquiry.metadata,
  });

  if (!result.success) {
    return NextResponse.json({ message: result.error || "Failed to sync to HubSpot" }, { status: 500 });
  }

  // Mark as synced in metadata
  await supabase
    .from("inquiries")
    .update({
      metadata: {
        ...(inquiry.metadata || {}),
        hubspot_synced: "true",
        hubspot_contact_id: result.contactId,
        hubspot_synced_at: new Date().toISOString(),
      },
    })
    .eq("id", id);

  return NextResponse.json({ success: true, contactId: result.contactId });
}
