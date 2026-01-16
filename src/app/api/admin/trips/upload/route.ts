import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function requireAdmin(token: string | undefined) {
  if (!token || token !== ADMIN_SECRET) {
    throw new Error("Unauthorized");
  }
}

function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase config");
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tripSlug = formData.get("tripSlug") as string | null;
    const imageType = formData.get("imageType") as string | null; // hero_image, hero_split_left, hero_split_right

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!tripSlug) {
      return NextResponse.json({ error: "No trip slug provided" }, { status: 400 });
    }

    if (!imageType) {
      return NextResponse.json({ error: "No image type provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 10MB allowed." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const storagePath = `trips/${tripSlug}/${imageType}_${timestamp}.${ext}`;

    // Upload to Supabase storage (using 'resumes' bucket which we already have)
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Generate signed URL (1 year expiry)
    const { data: signedData, error: signedError } = await supabase.storage
      .from("resumes")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    if (signedError || !signedData?.signedUrl) {
      console.error("Signed URL error:", signedError);
      return NextResponse.json({ error: "Failed to generate URL" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: signedData.signedUrl,
      storagePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
