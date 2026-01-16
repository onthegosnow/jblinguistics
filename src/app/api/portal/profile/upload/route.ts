import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import { RESUME_BUCKET } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? undefined;
  const user = await requirePortalUserFromToken(token);
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ message: "multipart/form-data required" }, { status: 400 });
  }

  const form = await request.formData();
  const kind = (form.get("kind") as string | null)?.trim() || "credential";
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "file is required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const safeName = (file.name || "upload").replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `portal_user_uploads/${user.id}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const upload = await supabase.storage.from(RESUME_BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (upload.error) return NextResponse.json({ message: upload.error.message }, { status: 500 });

  const { error } = await supabase.from("portal_user_uploads").insert({
    user_id: user.id,
    kind,
    filename: safeName,
    mime_type: file.type || "application/octet-stream",
    size: file.size,
    path,
  });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  // If this is a resume replacement, mirror it into portal_employees for downstream AI/bio use
  if (kind === "resume_override") {
    await supabase
      .from("portal_employees")
      .upsert({
        user_id: user.id,
        resume_override_path: path,
        resume_override_name: safeName,
        resume_override_mime: file.type || "application/octet-stream",
        resume_override_size: file.size,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
  }

  // If this is a photo upload, store the storage path (not signed URL)
  // This allows us to generate fresh signed URLs on-demand
  if (kind === "photo") {
    await supabase.from("portal_users").update({ photo_url: path }).eq("id", user.id);
  }

  return NextResponse.json({ success: true });
}
