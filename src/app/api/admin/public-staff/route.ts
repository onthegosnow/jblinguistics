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
      .eq("kind", "photo")
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
  const photoByUser = new Map<string, any>();
  for (const u of photoUploads ?? []) {
    if (!u.user_id) continue;
    const existing = photoByUser.get(u.user_id);
    const existingTime = existing?.created_at ? new Date(existing.created_at).getTime() : 0;
    const currentTime = u.created_at ? new Date(u.created_at).getTime() : 0;
    if (!existing || currentTime > existingTime) {
      photoByUser.set(u.user_id, u);
    }
  }
  const signedPhotoByUser = new Map<string, string>();
  for (const [uid, upload] of photoByUser.entries()) {
    if (upload?.path) {
      const signed = await supabase.storage.from(RESUME_BUCKET).createSignedUrl(upload.path, 60 * 60);
      if (!signed.error && signed.data?.signedUrl) {
        signedPhotoByUser.set(uid, signed.data.signedUrl);
      }
    }
  }

  (portalUsers ?? []).forEach((p: any) => {
    const emp = empByUser.get(p.id) || {};
    const hasRole = emp.teacher_role || emp.translator_role;
    const visRaw = emp.staff_visibility || "pending";
    const visibility = String(visRaw).toLowerCase();
    const key = p.id;
    let photoUrl = p.photo_url || signedPhotoByUser.get(p.id) || null;
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
      visibility: hasRole ? visibility : "pending",
      updated_at: emp.updated_at ?? new Date().toISOString(),
    };
    const existing = profileMap.get(key);
    if (existing) {
      profileMap.set(key, {
        ...existing,
        ...base,
        visibility: base.visibility || existing.visibility || "pending",
        updated_at: base.updated_at || existing.updated_at,
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
    if (body.action === "delete") {
      const del = await supabase
        .from("public_staff_profiles")
        .delete()
        .or(`slug.eq.${body.slug ?? ""},user_id.eq.${body.userId ?? ""}`);
      if (del.error) {
        return NextResponse.json({ message: del.error.message }, { status: 500 });
      }
    } else {
      const visibility = body.action === "approve" ? "visible" : "hidden";
      const update = await supabase
        .from("public_staff_profiles")
        .update({ visibility, updated_at: new Date().toISOString() })
        .or(`slug.eq.${body.slug ?? ""},user_id.eq.${body.userId ?? ""}`);
      if (update.error) {
        return NextResponse.json({ message: update.error.message }, { status: 500 });
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
