import { NextResponse } from "next/server";
import { createSupabaseAdminClient, RESUME_BUCKET } from "@/lib/supabase-server";

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

  // Regenerate fresh signed URLs for photos that are stored in Supabase storage
  const profiles = await Promise.all(
    (data ?? []).map(async (profile) => {
      // Skip if no photo_url
      if (!profile.photo_url) {
        return profile;
      }

      // If it's an external URL (http/https but not supabase), return unchanged
      if ((profile.photo_url.startsWith('http://') || profile.photo_url.startsWith('https://')) &&
          !profile.photo_url.includes('supabase')) {
        return profile;
      }

      try {
        let storagePath = profile.photo_url;

        // Extract path from full Supabase signed URL
        if (storagePath.includes('/storage/v1/object/')) {
          // Match pattern: .../storage/v1/object/sign/resumes/path/to/file.jpg?token=...
          const match = storagePath.match(/\/resumes\/(.+?)(\?|$)/);
          if (match) {
            storagePath = match[1];
          }
        }

        // If it's already a storage path (starts with portal_user_uploads/), use as is
        // Otherwise, skip (might be external URL or broken)
        if (!storagePath.startsWith('portal_user_uploads/')) {
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
