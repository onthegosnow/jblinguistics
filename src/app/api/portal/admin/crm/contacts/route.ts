import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { listContacts, upsertContact, fetchInquiryById, promoteInquiryToContact } from "@/lib/server/crm-supabase";

export async function GET(request: Request) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const contacts = await listContacts();
  return NextResponse.json({ contacts });
}

export async function POST(request: Request) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const body = (await request.json().catch(() => ({}))) as {
    inquiryId?: string;
    contactType?: string;
    serviceInterest?: string;
    status?: string;
    name?: string;
    email?: string;
    organization?: string;
    phone?: string;
    roleTitle?: string;
    marketingOptIn?: boolean;
    source?: string;
    tags?: string[];
    nextFollowupAt?: string | null;
    initialMessage?: string;
    notes?: string;
  };

  if (body.inquiryId) {
    const inquiry = await fetchInquiryById(body.inquiryId);
    if (!inquiry) return NextResponse.json({ message: "Inquiry not found" }, { status: 404 });
    const contact = await promoteInquiryToContact({
      inquiry,
      contactType: body.contactType,
      serviceInterest: body.serviceInterest,
      status: body.status,
    });
    return NextResponse.json({ contact });
  }

  if (!body.name || !body.email) {
    return NextResponse.json({ message: "Name and email are required." }, { status: 400 });
  }

  const contact = await upsertContact({
    name: body.name,
    email: body.email,
    organization: body.organization ?? null,
    phone: body.phone ?? null,
    role_title: body.roleTitle ?? null,
    contact_type: body.contactType ?? null,
    service_interest: body.serviceInterest ?? null,
    status: body.status ?? "lead",
    marketing_opt_in: body.marketingOptIn ?? null,
    source: body.source ?? "manual",
    tags: body.tags ?? null,
    next_followup_at: body.nextFollowupAt ?? null,
    initial_message: body.initialMessage ?? null,
    notes: body.notes ?? null,
  });

  return NextResponse.json({ contact });
}
