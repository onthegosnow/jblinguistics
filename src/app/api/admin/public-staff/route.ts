import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/server/storage";
import { RESUME_BUCKET } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  requireAdmin(request.headers.get("x-admin-token") ?? undefined);
  const supabase = createSupabaseAdminClient();
  const [{ data: profiles, error }, { data: portalUsers }, { data: portalEmployees }, { data: photoUploads }] = await Promise.all([
    supabase.from("public_staff_profiles").select("*").order("updated_at", { ascending: false }),
    supabase.from("portal_users").select("id,email,name,photo_url,bio,languages,address,city,state,country"),
    supabase.from("portal_employees").select(
      "user_id,teacher_role,translator_role,teaching_languages,translating_languages,certifications,staff_visibility,updated_at"
    ),
    supabase
      .from("portal_user_uploads")
      .select("user_id, kind, path, created_at")
      .order("created_at", { ascending: false }),
  ]);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const profileMap = new Map<string, any>();
  (profiles ?? []).forEach((p) => {
    if (p.user_id) profileMap.set(p.user_id, p);
    else if (p.slug) profileMap.set(p.slug, p);
  });

  const empByUser = new Map<string, any>();
  (portalEmployees ?? []).forEach((e: any) => empByUser.set(e.user_id, e));
  const preferredPhotoByUser = new Map<string, any>();
  const fallbackImageByUser = new Map<string, any>();
  const isImage = (path?: string) => (path || "").match(/\.(png|jpe?g|webp)$/i);
  for (const u of photoUploads ?? []) {
    if (!u.user_id) continue;
    const currentTime = u.created_at ? new Date(u.created_at).getTime() : 0;
    if (u.kind === "photo" && isImage(u.path)) {
      const existing = preferredPhotoByUser.get(u.user_id);
      const existingTime = existing?.created_at ? new Date(existing.created_at).getTime() : 0;
      if (!existing || currentTime > existingTime) {
        preferredPhotoByUser.set(u.user_id, u);
      }
    } else if (isImage(u.path)) {
      const existing = fallbackImageByUser.get(u.user_id);
      const existingTime = existing?.created_at ? new Date(existing.created_at).getTime() : 0;
      if (!existing || currentTime > existingTime) {
        fallbackImageByUser.set(u.user_id, u);
      }
    }
  }
  const signedPhotoByUser = new Map<string, string>();
  const chooseUploads = (uid: string) => preferredPhotoByUser.get(uid) || fallbackImageByUser.get(uid);
  for (const u of photoUploads ?? []) {
    const uid = u.user_id;
    if (!uid) continue;
    const chosen = chooseUploads(uid);
    if (!chosen?.path) continue;
    if (signedPhotoByUser.has(uid)) continue;
    const signed = await supabase.storage.from(RESUME_BUCKET).createSignedUrl(chosen.path, 60 * 60);
    if (!signed.error && signed.data?.signedUrl) {
      signedPhotoByUser.set(uid, signed.data.signedUrl);
    }
  }

  (portalUsers ?? []).forEach((p: any) => {
    const emp = empByUser.get(p.id) || {};
    const key = p.id;
    const hasRole = emp.teacher_role || emp.translator_role;
    const visRaw = emp.staff_visibility || "pending";
    const visibility = String(visRaw || "pending").toLowerCase();
    let photoUrl = signedPhotoByUser.get(p.id) || p.photo_url || null;
    const existingProfile = profileMap.get(key);
    const mergedVisibility =
      existingProfile?.visibility === "visible"
        ? "visible"
        : hasRole
          ? visibility
          : existingProfile?.visibility || "pending";
    const base = {
      user_id: p.id,
      slug: (p.email || p.id || "").toString().split("@")[0],
      name: p.name || p.email || "Profile",
      photo_url: photoUrl,
      roles: [
        ...(emp.teacher_role ? ["teacher"] : []),
        ...(emp.translator_role ? ["translator"] : []),
      ],
      teaching_languages: emp.teaching_languages ?? [],
      translating_languages: emp.translating_languages ?? [],
      languages_display: Array.isArray(p.languages) ? p.languages.join(", ") : p.languages ?? "",
      tagline: (p.bio || "").split(".")[0] || "",
      overview: p.bio ? [p.bio] : [],
      specialties: emp.certifications ?? [],
      location: [p.city, p.state, p.country].filter(Boolean).join(", "),
      visibility: mergedVisibility,
      updated_at: emp.updated_at ?? new Date().toISOString(),
    };
    if (existingProfile) {
      profileMap.set(key, {
        ...existingProfile,
        ...base,
        visibility: existingProfile.visibility === "visible" ? "visible" : base.visibility || "pending",
        updated_at: base.updated_at || existingProfile.updated_at,
      });
    } else {
      profileMap.set(key, base);
    }
  });

  return NextResponse.json({ profiles: Array.from(profileMap.values()) });
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request.headers.get("x-admin-token") ?? undefined);
    const body = (await request.json().catch(() => ({}))) as {
      slug?: string;
      userId?: string;
      action?: "approve" | "hide" | "delete";
    };
    if (!body.slug && !body.userId) {
      return NextResponse.json({ message: "slug or userId required" }, { status: 400 });
    }
    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();
    if (body.action === "delete") {
      const del = await supabase
        .from("public_staff_profiles")
        .delete()
        .or(`slug.eq.${body.slug ?? ""},user_id.eq.${body.userId ?? ""}`);
      if (del.error) {
        return NextResponse.json({ message: del.error.message }, { status: 500 });
      }
      if (body.userId) {
        await supabase.from("portal_employees").update({ staff_visibility: "hidden" }).eq("user_id", body.userId);
      }
    } else {
      const visibility = body.action === "approve" ? "visible" : "hidden";
      let profilePayload: any = {
        slug: body.slug ?? null,
        user_id: body.userId ?? null,
        visibility,
        updated_at: now,
      };

      // If we have a userId, hydrate from portal tables to create the profile if missing
      if (body.userId) {
        const [{ data: portalUser }, { data: empRow }] = await Promise.all([
          supabase
            .from("portal_users")
            .select("id,email,name,photo_url,languages,bio,city,state,country")
            .eq("id", body.userId)
            .maybeSingle(),
          supabase
            .from("portal_employees")
            .select("teacher_role,translator_role,teaching_languages,translating_languages,certifications")
            .eq("user_id", body.userId)
            .maybeSingle(),
        ]);
        const roles = [
          ...(empRow?.teacher_role ? ["teacher"] : []),
          ...(empRow?.translator_role ? ["translator"] : []),
        ];
        const slug = body.slug || (portalUser?.email ? String(portalUser.email).split("@")[0] : body.userId);
        profilePayload = {
          ...profilePayload,
          slug,
          name: portalUser?.name || portalUser?.email || slug,
          photo_url: portalUser?.photo_url || null,
          roles,
          teaching_languages: empRow?.teaching_languages ?? [],
          translating_languages: empRow?.translating_languages ?? [],
          languages_display: Array.isArray(portalUser?.languages)
            ? portalUser.languages.join(", ")
            : portalUser?.languages ?? "",
          overview: portalUser?.bio ? [portalUser.bio] : [],
          tagline: portalUser?.bio ? portalUser.bio.split("\n")[0] : "",
          specialties: empRow?.certifications ?? [],
          location: [portalUser?.city, portalUser?.state, portalUser?.country].filter(Boolean).join(", "),
        };
      }

      const upsert = await supabase
        .from("public_staff_profiles")
        .upsert(profilePayload, { onConflict: "user_id" });
      if (upsert.error) {
        return NextResponse.json({ message: upsert.error.message }, { status: 500 });
      }

      if (body.userId) {
        await supabase.from("portal_employees").update({ staff_visibility: visibility }).eq("user_id", body.userId);
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const status =
      typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode?: number }).statusCode!
        : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to update profile." }, { status });
  }
}
