import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { createPortalPasswordHash } from "@/lib/server/storage";
import { generateTempPassword, sendPortalCredentials } from "@/lib/server/portal-supabase";

export async function POST(request: NextRequest) {
  const { email } = (await request.json().catch(() => ({}))) as { email?: string };
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }
  const normalized = email.trim().toLowerCase();

  const supabase = createSupabaseAdminClient();
  const { data: user } = await supabase.from("portal_users").select("id, name, email, active").ilike("email", normalized).maybeSingle();

  // Always respond 200 to avoid account enumeration
  if (!user) {
    return NextResponse.json({ success: true });
  }
  // If user is inactive/locked, do not issue reset
  if (user.active === false) {
    return NextResponse.json({ success: true });
  }

  const tempPassword = generateTempPassword();
  const { error } = await supabase
    .from("portal_users")
    .update({
      password_hash: createPortalPasswordHash(tempPassword),
      must_reset: true,
      active: true,
    })
    .eq("id", user.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  await sendPortalCredentials(user.email, user.name ?? user.email, tempPassword, { reset: true });
  return NextResponse.json({ success: true });
}
