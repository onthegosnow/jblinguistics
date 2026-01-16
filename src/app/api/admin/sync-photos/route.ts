import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function requireAdmin(token: string | undefined) {
  if (!token || token !== ADMIN_SECRET) {
    throw new Error("Unauthorized");
  }
}

/**
 * Syncs photo_url from portal_users to public_staff_profiles
 * This fixes cases where the public profile has incorrect/outdated photo URLs
 */
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  // Get all portal_users with their photo_url
  const { data: portalUsers, error: portalError } = await supabase
    .from("portal_users")
    .select("id, name, photo_url")
    .not("photo_url", "is", null);

  if (portalError) {
    return NextResponse.json({ error: portalError.message }, { status: 500 });
  }

  const results: Array<{ name: string; status: string; photo_url?: string }> = [];

  for (const user of portalUsers ?? []) {
    if (!user.photo_url) continue;

    // Update public_staff_profiles with the correct photo_url
    const { error: updateError } = await supabase
      .from("public_staff_profiles")
      .update({ photo_url: user.photo_url })
      .eq("user_id", user.id);

    if (updateError) {
      results.push({ name: user.name, status: `Error: ${updateError.message}` });
    } else {
      results.push({ name: user.name, status: "Synced", photo_url: user.photo_url });
    }
  }

  return NextResponse.json({
    message: `Synced ${results.filter(r => r.status === "Synced").length} photos`,
    results,
  });
}
