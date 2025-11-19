import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!rawSupabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!/^https?:\/\//i.test(rawSupabaseUrl)) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL must be the full https URL from your Supabase project settings (e.g. https://xyz.supabase.co)."
  );
}

if (!rawServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

const supabaseUrl: string = rawSupabaseUrl;
const serviceRoleKey: string = rawServiceRoleKey;

export const RESUME_BUCKET = process.env.SUPABASE_RESUME_BUCKET ?? "resumes";

export function createSupabaseAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}
