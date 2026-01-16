import { NextResponse } from "next/server";
import { createSupabaseAdminClient, RESUME_BUCKET } from "@/lib/supabase-server";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

const isImage = (path?: string | null, mime?: string | null, filename?: string | null) => {
  if ((mime ?? "").toLowerCase().startsWith("image/")) return true;
  const name = path || filename || "";
  return /\.(png|jpe?g|webp|gif)$/i.test(name);
};

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("public_staff_profiles")
    .select("*")
    .eq("visibility", "visible")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // Collect all user IDs for batch lookup
  const userIds = (data ?? []).map((p) => p.user_id).filter(Boolean);

  // Batch fetch all uploads and portal_users for these users
  const userUploadsMap = new Map<string, any[]>();
  const employeeUploadsMap = new Map<string, any[]>();
  const portalUsersMap = new Map<string, any>();

  if (userIds.length > 0) {
    const [userUploadsRes, employeeUploadsRes, portalUsersRes] = await Promise.all([
      supabase
        .from("portal_user_uploads")
        .select("user_id, path, kind, mime_type, filename, created_at")
        .in("user_id", userIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("portal_employee_uploads")
        .select("user_id, path, kind, mime_type, filename, created_at")
        .in("user_id", userIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("portal_users")
        .select("id, photo_url")
        .in("id", userIds),
    ]);

    // Group uploads by user_id
    for (const upload of userUploadsRes.data ?? []) {
      const existing = userUploadsMap.get(upload.user_id) ?? [];
      existing.push(upload);
      userUploadsMap.set(upload.user_id, existing);
    }
    for (const upload of employeeUploadsRes.data ?? []) {
      const existing = employeeUploadsMap.get(upload.user_id) ?? [];
      existing.push(upload);
      employeeUploadsMap.set(upload.user_id, existing);
    }
    // Map portal users by id
    for (const portalUser of portalUsersRes.data ?? []) {
      portalUsersMap.set(portalUser.id, portalUser);
    }
  }

  // Process profiles and generate signed URLs
  const profiles = await Promise.all(
    (data ?? []).map(async (profile) => {
      // First try to find photo from uploads (like admin preview does)
      if (profile.user_id) {
        const userUploads = userUploadsMap.get(profile.user_id) ?? [];
        const employeeUploads = employeeUploadsMap.get(profile.user_id) ?? [];
        const allUploads = [...userUploads, ...employeeUploads].filter((u) =>
          isImage(u.path, u.mime_type, u.filename)
        );

        // Prefer explicit photo kind, else latest image
        const preferred = allUploads.find((u) => u.kind === "photo");
        const chosen =
          preferred ??
          allUploads.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];

        if (chosen?.path) {
          const signed = await supabase.storage
            .from(RESUME_BUCKET)
            .createSignedUrl(chosen.path, 60 * 60 * 24 * 365);
          if (!signed.error && signed.data?.signedUrl) {
            return { ...profile, photo_url: signed.data.signedUrl };
          }
        }

        // Try portal_users.photo_url (storage path set when photo is uploaded)
        const portalUser = portalUsersMap.get(profile.user_id);
        if (portalUser?.photo_url && portalUser.photo_url.startsWith("portal_user_uploads/")) {
          const signed = await supabase.storage
            .from(RESUME_BUCKET)
            .createSignedUrl(portalUser.photo_url, 60 * 60 * 24 * 365);
          if (!signed.error && signed.data?.signedUrl) {
            return { ...profile, photo_url: signed.data.signedUrl };
          }
        }
      }

      // Fallback to existing photo_url processing
      if (!profile.photo_url) {
        return profile;
      }

      // If it's an external URL (http/https but not supabase), return unchanged
      if (
        (profile.photo_url.startsWith("http://") || profile.photo_url.startsWith("https://")) &&
        !profile.photo_url.includes("supabase")
      ) {
        return profile;
      }

      try {
        let storagePath = profile.photo_url;

        // Extract path from full Supabase signed URL
        if (storagePath.includes("/storage/v1/object/")) {
          // Match pattern: .../storage/v1/object/sign/resumes/path/to/file.jpg?token=...
          const match = storagePath.match(/\/resumes\/(.+?)(\?|$)/);
          if (match) {
            storagePath = match[1];
          }
        }

        // If it's already a storage path (starts with portal_user_uploads/ or employee_uploads/), use as is
        // Otherwise, skip (might be external URL or broken)
        if (
          !storagePath.startsWith("portal_user_uploads/") &&
          !storagePath.startsWith("employee_uploads/")
        ) {
          return profile;
        }

        // Generate fresh signed URL (1 year expiry)
        const { data: signedData, error: signError } = await supabase.storage
          .from(RESUME_BUCKET)
          .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

        if (!signError && signedData?.signedUrl) {
          return { ...profile, photo_url: signedData.signedUrl };
        }
      } catch (err) {
        console.error(`Failed to generate signed URL for ${profile.slug}:`, err);
      }

      return profile;
    })
  );

  return NextResponse.json(
    {
      source: "supabase-service",
      profiles,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
