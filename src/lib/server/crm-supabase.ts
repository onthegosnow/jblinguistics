import { createSupabaseAdminClient } from "@/lib/supabase-server";
import type { InquiryRecord } from "./inquiries-supabase";

export type CRMContact = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  role_title?: string | null;
  contact_type?: string | null;
  service_interest?: string | null;
  source?: string | null;
  status?: string | null;
  tags?: string[] | null;
  marketing_opt_in?: boolean | null;
  initial_message?: string | null;
  inquiry_id?: string | null;
  next_followup_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const CONTACTS_TABLE = "crm_contacts";
const INTERACTIONS_TABLE = "crm_interactions";

export async function listContacts(): Promise<CRMContact[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(CONTACTS_TABLE).select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as CRMContact[];
}

export async function upsertContact(contact: Partial<CRMContact>) {
  const supabase = createSupabaseAdminClient();
  const payload = {
    name: contact.name,
    email: contact.email,
    phone: contact.phone ?? null,
    organization: contact.organization ?? null,
    role_title: contact.role_title ?? null,
    contact_type: contact.contact_type ?? null,
    service_interest: contact.service_interest ?? null,
    source: contact.source ?? null,
    status: contact.status ?? null,
    tags: contact.tags ?? null,
    marketing_opt_in: contact.marketing_opt_in ?? null,
    initial_message: contact.initial_message ?? null,
    inquiry_id: contact.inquiry_id ?? null,
    next_followup_at: contact.next_followup_at ?? null,
    notes: contact.notes ?? null,
  };
  const { error, data } = await supabase.from(CONTACTS_TABLE).upsert(payload).select().maybeSingle();
  if (error) throw new Error(error.message);
  return data as CRMContact | null;
}

export async function promoteInquiryToContact(opts: { inquiry: InquiryRecord; contactType?: string; serviceInterest?: string; status?: string }) {
  const { inquiry } = opts;
  return upsertContact({
    name: inquiry.name,
    email: inquiry.email,
    organization: inquiry.organization ?? inquiry.metadata?.organization ?? null,
    service_interest: opts.serviceInterest ?? inquiry.service_type ?? inquiry.metadata?.serviceType ?? null,
    contact_type: opts.contactType ?? null,
    source: inquiry.source,
    status: opts.status ?? "lead",
    marketing_opt_in: inquiry.metadata?.marketingOptIn === "true",
    initial_message: inquiry.details ?? null,
    inquiry_id: inquiry.id,
    notes: inquiry.metadata?.referral ? `Referral: ${inquiry.metadata.referral}` : null,
  });
}

export async function fetchInquiryById(id: string): Promise<InquiryRecord | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("inquiries").select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return data as InquiryRecord | null;
}

export async function addInteraction(params: { contactId: string; kind?: string; summary?: string; nextFollowupAt?: string | null }) {
  const supabase = createSupabaseAdminClient();
  const { error, data } = await supabase
    .from(INTERACTIONS_TABLE)
    .insert({
      contact_id: params.contactId,
      kind: params.kind ?? "note",
      summary: params.summary ?? null,
      next_followup_at: params.nextFollowupAt ?? null,
    })
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function listInteractions(contactId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(INTERACTIONS_TABLE)
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
