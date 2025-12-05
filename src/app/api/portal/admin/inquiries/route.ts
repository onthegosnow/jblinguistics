import { NextResponse } from "next/server";
import { listInquiriesFromSupabase } from "@/lib/server/inquiries-supabase";
import { requireAdmin } from "@/lib/server/storage";

export async function GET(request: Request) {
  // Protect with the same admin token used for other portal admin endpoints
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);

  const inquiries = await listInquiriesFromSupabase();
  const normalized = inquiries.map((item) => ({
    id: item.id,
    createdAt: item.created_at ?? null,
    name: item.name,
    email: item.email,
    organization: item.organization ?? item.metadata?.organization ?? null,
    serviceType: item.service_type ?? item.metadata?.serviceType ?? null,
    languages: item.languages ?? item.metadata?.languages ?? null,
    budget: item.budget ?? null,
    timeline: item.timeline ?? null,
    details: item.details ?? null,
    source: item.source,
    metadata: item.metadata ?? null,
  }));

  return NextResponse.json({ inquiries: normalized });
}
