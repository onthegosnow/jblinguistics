import { NextResponse } from "next/server";
import { listOnboardingEnvelopes } from "@/lib/server/onboarding-supabase";
import { requireAdmin } from "@/lib/server/storage";

export async function GET(request: Request) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const envelopes = await listOnboardingEnvelopes();
  return NextResponse.json({ envelopes });
}
