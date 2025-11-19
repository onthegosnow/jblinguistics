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
