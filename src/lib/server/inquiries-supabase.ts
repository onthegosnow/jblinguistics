import { createSupabaseAdminClient } from "@/lib/supabase-server";

export type InquiryPayload = {
  name: string;
  email: string;
  organization?: string;
  serviceType?: string;
  languages?: string;
  details?: string;
  budget?: string;
  timeline?: string;
  source: string;
  metadata?: Record<string, string>;
};

const INQUIRIES_TABLE = "inquiries";

export type InquiryRecord = {
  id: string;
  created_at?: string;
  name: string;
  email: string;
  organization?: string | null;
  service_type?: string | null;
  languages?: string | null;
  details?: string | null;
  budget?: string | null;
  timeline?: string | null;
  source: string;
  metadata?: Record<string, string> | null;
};

export async function saveInquiryToSupabase(payload: InquiryPayload) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from(INQUIRIES_TABLE).insert({
    name: payload.name,
    email: payload.email,
    organization: payload.organization ?? null,
    service_type: payload.serviceType ?? null,
    languages: payload.languages ?? null,
    details: payload.details ?? null,
    budget: payload.budget ?? null,
    timeline: payload.timeline ?? null,
    source: payload.source,
    metadata: payload.metadata ?? null,
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function listInquiriesFromSupabase(): Promise<InquiryRecord[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(INQUIRIES_TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}
