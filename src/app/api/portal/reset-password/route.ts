import { NextRequest, NextResponse } from "next/server";
import { createPortalPasswordHash, requirePortalUserFromToken } from "@/lib/server/storage";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  const body = (await request.json().catch(() => ({}))) as { newPassword?: string };
  if (!body.newPassword || body.newPassword.length < 8) {
    return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("portal_users")
    .update({ password_hash: createPortalPasswordHash(body.newPassword), must_reset: false })
    .eq("id", user.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
