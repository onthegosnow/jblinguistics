import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

/**
 * Syncs photo_url from uploads (kind='photo') to public_staff_profiles
 * Uses the same logic as admin portal: prioritize uploads marked as 'photo'
 */
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  // Get all portal users with public profiles
  const { data: portalUsers, error: portalError } = await supabase
    .from("portal_users")
    .select("id, name");

  if (portalError) {
    return NextResponse.json({ error: portalError.message }, { status: 500 });
  }

  // Get all uploads with kind='photo' from both tables (same logic as admin portal)
  const [portalUploadsRes, employeeUploadsRes] = await Promise.all([
    supabase
      .from("portal_user_uploads")
      .select("user_id, path, created_at")
      .eq("kind", "photo")
      .order("created_at", { ascending: false }),
    supabase
      .from("portal_employee_uploads")
      .select("user_id, path, created_at")
      .eq("kind", "photo")
      .order("created_at", { ascending: false }),
  ]);

  // Build map of user_id -> most recent photo path
  const photoPathByUser = new Map<string, string>();

  // Process portal uploads
  for (const upload of portalUploadsRes.data ?? []) {
    if (!upload.path || photoPathByUser.has(upload.user_id)) continue;
    photoPathByUser.set(upload.user_id, upload.path);
  }

  // Process employee uploads (may override if more recent, but we're already sorted desc)
  for (const upload of employeeUploadsRes.data ?? []) {
    if (!upload.path || photoPathByUser.has(upload.user_id)) continue;
    photoPathByUser.set(upload.user_id, upload.path);
  }

  const results: Array<{ name: string; status: string; photo_url?: string }> = [];

  for (const user of portalUsers ?? []) {
    const photoPath = photoPathByUser.get(user.id);

    if (!photoPath) {
      results.push({ name: user.name, status: "No photo upload found" });
      continue;
    }

    // Update public_staff_profiles with the storage path
    const { error: updateError } = await supabase
      .from("public_staff_profiles")
      .update({ photo_url: photoPath })
      .eq("user_id", user.id);

    if (updateError) {
      results.push({ name: user.name, status: `Error: ${updateError.message}` });
    } else {
      results.push({ name: user.name, status: "Synced", photo_url: photoPath });
    }
  }

  return NextResponse.json({
    message: `Synced ${results.filter(r => r.status === "Synced").length} photos`,
    results,
  });
}
