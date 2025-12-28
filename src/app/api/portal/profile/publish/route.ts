import { NextRequest, NextResponse } from "next/server";
import { requirePortalUserFromToken } from "@/lib/server/storage";
import { createSupabaseAdminClient, RESUME_BUCKET } from "@/lib/supabase-server";

const placeholderPhoto =
  "https://placehold.co/400x400?text=Profile";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-portal-token") ?? undefined;
    const user = await requirePortalUserFromToken(token);
    const supabase = createSupabaseAdminClient();

    const [{ data: employee }, { data: portalUser }] = await Promise.all([
      supabase
        .from("portal_employees")
        .select("teacher_role, translator_role, teaching_languages, translating_languages, certifications")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("portal_users")
        .select("id, name, email, bio, photo_url, languages, address, city, state, country")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    const teacherRole = employee?.teacher_role ?? false;
    const translatorRole = employee?.translator_role ?? false;
    if (!teacherRole && !translatorRole) {
      return NextResponse.json({ message: "No approved role to publish." }, { status: 400 });
    }

    const roles: string[] = [];
    if (teacherRole) roles.push("teacher");
    if (translatorRole) roles.push("translator");
    // Publishing from the user sets to pending; admin can flip to visible later.
    const visibility = "pending";

    // Reuse existing profile if present to keep photo/slug stable
    const { data: existing } = await supabase
      .from("public_staff_profiles")
      .select("slug, photo_url")
      .eq("user_id", user.id)
      .maybeSingle();

    const baseSlug =
      existing?.slug ||
      slugify(portalUser?.name || portalUser?.email || user.email || "profile") ||
      `user-${String(user.id).slice(0, 8)}`;
    const slug = baseSlug || `user-${String(user.id).slice(0, 8)}`;
    // Prefer latest uploaded photo (user or employee upload), then existing/profile photo
    const isImage = (path?: string | null, mime?: string | null, filename?: string | null) => {
      if ((mime ?? "").toLowerCase().startsWith("image/")) return true;
      const name = path || filename || "";
      return /\.(png|jpe?g|webp|gif)$/i.test(name);
    };
    const [userUploadsRes, employeeUploadsRes] = await Promise.all([
      supabase
        .from("portal_user_uploads")
        .select("path, kind, mime_type, filename, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("portal_employee_uploads")
        .select("path, kind, mime_type, filename, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    const uploads = [...(userUploadsRes.data ?? []), ...(employeeUploadsRes.data ?? [])].filter((u) =>
      isImage((u as any).path, (u as any).mime_type, (u as any).filename)
    );
    const preferred = uploads.find((u) => (u as any).kind === "photo");
    const chosen =
      preferred ??
      uploads.sort(
        (a, b) =>
          (new Date((b as any).created_at).getTime() || 0) - (new Date((a as any).created_at).getTime() || 0)
      )[0];
    let photoUrl = portalUser?.photo_url || existing?.photo_url || placeholderPhoto;
    if (chosen?.path) {
      const signed = await supabase.storage.from(RESUME_BUCKET).createSignedUrl(chosen.path, 60 * 60 * 24 * 365); // 1 year
      if (!signed.error && signed.data?.signedUrl) {
        photoUrl = signed.data.signedUrl;
        // keep portal_users in sync so the dashboard preview shows the fresh link
        await supabase.from("portal_users").update({ photo_url: photoUrl }).eq("id", user.id);
      }
    }
    const locationParts = [portalUser?.city, portalUser?.state, portalUser?.country].filter(Boolean);
    const location = locationParts.join(", ");

    await supabase
      .from("portal_employees")
      .upsert({
        user_id: user.id,
        teacher_role: teacherRole,
        translator_role: translatorRole,
        teaching_languages: employee?.teaching_languages ?? [],
        translating_languages: employee?.translating_languages ?? [],
        certifications: employee?.certifications ?? [],
        publish_teacher: teacherRole,
        publish_translator: translatorRole,
        staff_visibility: visibility,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    await supabase
      .from("public_staff_profiles")
      .upsert({
        user_id: user.id,
        slug,
        name: portalUser?.name || user.email || "Profile",
        photo_url: photoUrl,
        roles,
        teaching_languages: employee?.teaching_languages ?? [],
        translating_languages: employee?.translating_languages ?? [],
        languages_display: Array.isArray(portalUser?.languages) ? portalUser?.languages.join(", ") : portalUser?.languages ?? "",
        langs: Array.isArray(portalUser?.languages) ? portalUser?.languages : [],
        tagline: (portalUser?.bio || "").split(".")[0] || "",
        overview: portalUser?.bio ? [portalUser.bio] : [],
        specialties: employee?.certifications ?? [],
        location,
        region: portalUser?.state || portalUser?.country || "",
        visibility,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    await supabase.from("portal_employee_notes").insert({
      user_id: user.id,
      note: `Profile submitted for publish at ${new Date().toISOString()}`,
      created_by: user.email ?? "system",
    });

    return NextResponse.json({ success: true, status: "pending" });
  } catch (err) {
    const status =
      typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode?: number }).statusCode!
        : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to publish profile." }, { status });
  }
}
