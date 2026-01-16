import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/storage";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const { id } = await context.params;

  const supabase = createSupabaseAdminClient();

  // Get user info
  const { data: user } = await supabase
    .from("portal_users")
    .select("id, name, email, photo_url")
    .eq("id", id)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Get all uploads for this user
  const { data: uploads, error } = await supabase
    .from("portal_user_uploads")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ user, uploads: uploads ?? [] });
}

export async function POST(request: NextRequest, context: RouteContext) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const { id } = await context.params;
  const body = await request.json();

  const { uploadId, action } = body as {
    uploadId?: string;
    action?: "set_as_photo" | "delete";
  };

  if (!uploadId || !action) {
    return NextResponse.json({ message: "uploadId and action required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (action === "set_as_photo") {
    // Get the upload details
    const { data: upload } = await supabase
      .from("portal_user_uploads")
      .select("path")
      .eq("id", uploadId)
      .eq("user_id", id)
      .maybeSingle();

    if (!upload) {
      return NextResponse.json({ message: "Upload not found" }, { status: 404 });
    }

    // Store the storage path instead of signed URL
    // This allows us to generate fresh signed URLs on-demand
    const { error: updateError } = await supabase
      .from("portal_users")
      .update({ photo_url: upload.path })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    // Also update the upload record to mark it as photo
    await supabase
      .from("portal_user_uploads")
      .update({ kind: "photo" })
      .eq("id", uploadId);

    // Sync to public_staff_profiles if this user has a public profile
    // This ensures the photo appears on the public website
    await supabase
      .from("public_staff_profiles")
      .update({ photo_url: upload.path })
      .eq("user_id", id);

    return NextResponse.json({ success: true, photo_url: upload.path });
  }

  if (action === "delete") {
    // Get the upload to delete from storage
    const { data: upload } = await supabase
      .from("portal_user_uploads")
      .select("path")
      .eq("id", uploadId)
      .eq("user_id", id)
      .maybeSingle();

    if (upload) {
      // Delete from storage
      await supabase.storage.from("resumes").remove([upload.path]);
    }

    // Delete the record
    const { error } = await supabase
      .from("portal_user_uploads")
      .delete()
      .eq("id", uploadId)
      .eq("user_id", id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}
