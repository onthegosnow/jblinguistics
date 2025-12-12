import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, createPortalPasswordHash } from "@/lib/server/storage";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { generateTempPassword } from "@/lib/server/portal-supabase";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: userId } = await context.params;
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  if (!userId) {
    return NextResponse.json({ message: "User id is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const tempPassword = generateTempPassword();
  const { error } = await supabase
    .from("portal_users")
    .update({
      password_hash: createPortalPasswordHash(tempPassword),
      must_reset: true,
      active: true,
    })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ tempPassword });
}
