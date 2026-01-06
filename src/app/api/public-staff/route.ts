import { NextResponse } from "next/server";
import { createSupabaseAdminClient, RESUME_BUCKET } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const [{ data, error }, { data: uploads }, { data: portalUsers }, { data: portalEmps }] = await Promise.all([
    supabase
      .from("public_staff_profiles")
      .select("*")
      .or("visibility.eq.visible,visibility.is.null")
      .order("updated_at", { ascending: false }),
    supabase
      .from("portal_user_uploads")
      .select("user_id, path, kind, mime_type, filename, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("portal_users")
      .select("id,name,email,bio,languages,photo_url,city,state,country"),
    supabase
      .from("portal_employees")
      .select("user_id,teacher_role,translator_role,teaching_languages,translating_languages,certifications,staff_visibility"),
  ]);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const isImage = (path?: string | null, mime?: string | null, filename?: string | null) => {
    if ((mime ?? "").toLowerCase().startsWith("image/")) return true;
    const name = path || filename || "";
    return /\.(png|jpe?g|webp|gif)$/i.test(name);
  };

  // Sign latest photo per user (prefer kind=photo)
  const latestPhotoByUser = new Map<string, any>();
  for (const u of uploads ?? []) {
    if (!u.user_id) continue;
    if (!isImage(u.path, u.mime_type, u.filename)) continue;
    const current = latestPhotoByUser.get(u.user_id);
    const currentTime = current?.created_at ? new Date(current.created_at).getTime() : 0;
    const newTime = u.created_at ? new Date(u.created_at).getTime() : 0;
    if (!current || (u.kind === "photo" && current.kind !== "photo") || newTime > currentTime) {
      latestPhotoByUser.set(u.user_id, u);
    }
  }

  const signedPhotoByUser = new Map<string, string>();
  const SIGN_TTL_SECONDS = 60 * 60 * 24 * 180; // 180 days
  for (const [uid, upload] of latestPhotoByUser.entries()) {
    if (!upload?.path) continue;
    const signed = await supabase.storage.from(RESUME_BUCKET).createSignedUrl(upload.path, SIGN_TTL_SECONDS);
    if (!signed.error && signed.data?.signedUrl) {
      signedPhotoByUser.set(uid, signed.data.signedUrl);
    }
  }

  const userById = new Map<string, any>();
  (portalUsers ?? []).forEach((u: any) => {
    if (u?.id) userById.set(u.id, u);
  });
  const empById = new Map<string, any>();
  (portalEmps ?? []).forEach((e: any) => {
    if (e?.user_id) empById.set(e.user_id, e);
  });

  const profileByUser = new Map<string, any>();
  const enriched =
    data?.map((row) => {
      const signedPhoto = row.user_id ? signedPhotoByUser.get(row.user_id) : null;
      const portalUser = row.user_id ? userById.get(row.user_id) : null;
      const emp = row.user_id ? empById.get(row.user_id) : null;

      const bio = portalUser?.bio || row.bio || "";
      const taglineFromBio = bio ? bio.split("\n").filter(Boolean)[0] : "";
      const overviewFromBio = bio ? [bio] : row.overview;
      const roles =
        Array.isArray(row.roles) && row.roles.length
          ? row.roles
          : [
              ...(emp?.teacher_role ? ["teacher"] : []),
              ...(emp?.translator_role ? ["translator"] : []),
            ];
      const teaching_languages = Array.isArray(emp?.teaching_languages) ? emp.teaching_languages : row.teaching_languages;
      const translating_languages = Array.isArray(emp?.translating_languages) ? emp.translating_languages : row.translating_languages;
      const specialties = Array.isArray(emp?.certifications) && emp.certifications.length ? emp.certifications : row.specialties;
      const visibility = row.visibility || emp?.staff_visibility || "pending";
      const languages_display =
        row.languages_display ||
        (Array.isArray(portalUser?.languages) ? portalUser.languages.join(", ") : portalUser?.languages || row.languages_display);
      const location =
        row.location ||
        [portalUser?.city, portalUser?.state, portalUser?.country].filter(Boolean).join(", ");

      const merged = {
        ...row,
        photo_url: signedPhoto || row.photo_url || portalUser?.photo_url || row.photo_url,
        name: portalUser?.name || row.name,
        tagline: row.tagline || taglineFromBio || "",
        overview: overviewFromBio ?? [],
        roles,
        teaching_languages,
        translating_languages,
        specialties,
        languages_display,
        location,
        visibility,
      };
      if (row.user_id) {
        profileByUser.set(row.user_id, merged);
      }
      return merged;
    }) ?? [];

  // Add portal employees marked visible even if they don't have a row in public_staff_profiles yet
  (portalEmps ?? []).forEach((emp: any) => {
    if (!emp?.user_id || profileByUser.has(emp.user_id)) return;
    const vis = (emp.staff_visibility || "").toLowerCase() || "pending";
    // Only surface if explicitly visible AND flagged for publish on at least one role
    const publishFlag = emp.publish_teacher || emp.publish_translator;
    if (vis !== "visible" || !publishFlag) return;
    const portalUser = userById.get(emp.user_id);
    if (!portalUser) return;
    const bio = portalUser.bio || "";
    const taglineFromBio = bio ? bio.split("\n").filter(Boolean)[0] : "";
    const slug = emp.staff_slug || (portalUser.email ? String(portalUser.email).split("@")[0] : portalUser.id);
    const signedPhoto = signedPhotoByUser.get(emp.user_id);
    enriched.push({
      user_id: emp.user_id,
      slug,
      name: portalUser.name || portalUser.email || slug,
      photo_url: signedPhoto || portalUser.photo_url || null,
      roles: [
        ...(emp.teacher_role ? ["teacher"] : []),
        ...(emp.translator_role ? ["translator"] : []),
      ],
      teaching_languages: emp.teaching_languages ?? [],
      translating_languages: emp.translating_languages ?? [],
      languages_display: Array.isArray(portalUser.languages) ? portalUser.languages.join(", ") : portalUser.languages ?? "",
      tagline: taglineFromBio || "",
      overview: bio ? [bio] : [],
      specialties: emp.certifications ?? [],
      location: [portalUser.city, portalUser.state, portalUser.country].filter(Boolean).join(", "),
      visibility: "visible",
    });
  });

  return NextResponse.json(
    {
      source: "supabase-service",
      profiles: enriched,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
