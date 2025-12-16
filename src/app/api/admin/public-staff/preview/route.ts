import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, RESUME_BUCKET } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/server/storage";

const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
const esc = (s: string) => (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = request.headers.get("x-admin-token") ?? searchParams.get("token") ?? undefined;
    requireAdmin(token);
    const slug = searchParams.get("slug") ?? "";
    const userId = searchParams.get("userId") ?? "";
    if (!slug && !userId) return NextResponse.json({ message: "slug or userId required" }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    let profile: any = null;
    let portal: any = null;
    let emp: any = null;

    // public_staff_profiles lookup
    if (slug || userId) {
      const query = supabase.from("public_staff_profiles").select("*");
      if (userId && isUuid(userId)) {
        const { data } = await query.eq("user_id", userId).maybeSingle();
        profile = data;
      }
      if (!profile && slug) {
        if (isUuid(slug)) {
          const { data } = await query.or(`slug.eq.${slug},user_id.eq.${slug}`).maybeSingle();
          profile = data;
        } else {
          const { data } = await query.eq("slug", slug).maybeSingle();
          profile = data;
        }
      }
    }

    // portal + employee data
    const portalIds: string[] = [];
    if (profile?.user_id) portalIds.push(profile.user_id);
    if (userId && isUuid(userId)) portalIds.push(userId);
    const uniqPortalIds = Array.from(new Set(portalIds)).filter(Boolean);
    if (!portal && uniqPortalIds.length) {
      const { data: portals } = await supabase.from("portal_users").select("*").in("id", uniqPortalIds);
      portal = portals?.[0];
      const { data: emps } = await supabase.from("portal_employees").select("*").in("user_id", uniqPortalIds);
      emp = emps?.[0];
    }

    // Fallback: if no public profile, build from portal
    if (!profile && portal) {
      profile = {
        user_id: portal.id,
        slug: portal.email?.split("@")[0],
        name: portal.name || portal.email,
        photo_url: portal.photo_url || null,
        visibility: emp?.staff_visibility ?? "pending",
        overview: portal.bio ? [portal.bio] : [],
        tagline: portal.bio ? portal.bio.split("\n")[0] : "",
        languages_display: Array.isArray(portal.languages) ? portal.languages.join(", ") : portal.languages ?? "",
        location: [portal.city, portal.state, portal.country].filter(Boolean).join(", "),
        roles: [
          ...(emp?.teacher_role ? ["teacher"] : []),
          ...(emp?.translator_role ? ["translator"] : []),
        ],
        teaching_languages: emp?.teaching_languages ?? [],
        translating_languages: emp?.translating_languages ?? [],
        specialties: emp?.certifications ?? [],
        educational_background: emp?.educational_background ?? [],
        linguistic_focus: emp?.linguistic_focus ?? [],
      };
    }

    if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

    // hydrate with portal/employee if missing pieces
    if (portal) {
      profile.photo_url = profile.photo_url || portal.photo_url || null;
      if (!profile.overview || profile.overview.length === 0) {
        profile.overview = portal.bio ? [portal.bio] : [];
      }
      profile.tagline = profile.tagline || (portal.bio ? portal.bio.split("\n")[0] : "");
      profile.languages_display =
        profile.languages_display ||
        (Array.isArray(portal.languages) ? portal.languages.join(", ") : portal.languages ?? "");
      profile.location = profile.location || [portal.city, portal.state, portal.country].filter(Boolean).join(", ");
    }
    if (emp) {
      profile.roles = profile.roles?.length
        ? profile.roles
        : [
            ...(emp.teacher_role ? ["teacher"] : []),
            ...(emp.translator_role ? ["translator"] : []),
          ];
      profile.teaching_languages = profile.teaching_languages?.length ? profile.teaching_languages : emp.teaching_languages ?? [];
      profile.translating_languages = profile.translating_languages?.length
        ? profile.translating_languages
        : emp.translating_languages ?? [];
      profile.specialties = profile.specialties?.length ? profile.specialties : emp.certifications ?? [];
      profile.educational_background = profile.educational_background ?? emp.educational_background ?? [];
      profile.linguistic_focus = profile.linguistic_focus ?? emp.linguistic_focus ?? [];
      profile.visibility = profile.visibility ?? emp.staff_visibility ?? "pending";
    }

    // Photo fallback: latest portal photo upload
    if (!profile.photo_url && profile.user_id) {
      const { data: uploads } = await supabase
        .from("portal_user_uploads")
        .select("path")
        .eq("user_id", profile.user_id)
        .eq("kind", "photo")
        .order("created_at", { ascending: false })
        .limit(1);
      const path = uploads?.[0]?.path;
      if (path) {
        const signed = await supabase.storage.from(RESUME_BUCKET).createSignedUrl(path, 60 * 60);
        if (!signed.error && signed.data?.signedUrl) {
          profile.photo_url = signed.data.signedUrl;
        }
      }
    }

    // Derive structured sections from overview text if needed
    const teachingLanguages = profile.teaching_languages ?? [];
    const translatingLanguages = profile.translating_languages ?? [];
    const tagline = profile.tagline || "";
    const languagesLine = profile.languages_display || "";

    // Try to parse bullets from overview paragraphs if separate fields are empty
    const parseSection = (label: string, nextLabels: string[]) => {
      const text = (Array.isArray(profile.overview) ? profile.overview.join(" ") : profile.overview || "") as string;
      const lower = text.toLowerCase();
      const start = lower.indexOf(label.toLowerCase() + ":");
      if (start === -1) return [];
      const nextIdx = nextLabels
        .map((l) => lower.indexOf(l.toLowerCase() + ":"))
        .filter((i) => i !== -1 && i > start);
      const end = nextIdx.length ? Math.min(...nextIdx) : text.length;
      const slice = text.slice(start + label.length + 1, end).trim();
      return slice
        .split(" - ")
        .flatMap((s) => s.split(". "))
        .map((s) => s.trim().replace(/^[.-]\s*/, ""))
        .filter(Boolean);
    };

    const eduBullets =
      profile.educational_background && profile.educational_background.length
        ? profile.educational_background
        : parseSection("Educational & Professional Background", ["Linguistic Focus", "Certifications", "Specialties"]);
    const focusBullets =
      profile.linguistic_focus && profile.linguistic_focus.length
        ? profile.linguistic_focus
        : parseSection("Linguistic Focus", ["Certifications", "Specialties"]);
    const certBullets =
      profile.specialties && profile.specialties.length
        ? profile.specialties
        : parseSection("Certifications", ["Specialties"]);

    // Overview paragraphs (if provided separately)
    const overviewParas =
      eduBullets.length || focusBullets.length || certBullets.length
        ? []
        : Array.isArray(profile.overview)
          ? profile.overview
          : profile.overview
            ? [profile.overview]
            : [];
    const overviewHtml = overviewParas
      .map((p: string) => `<p style="margin:8px 0;color:#334155;line-height:1.6;">${esc(p)}</p>`)
      .join("");

    const pillRow = (items?: string[], title?: string) =>
      items && items.length
        ? `<div style="margin:12px 0;">
            ${title ? `<div style="font-weight:600;color:#0b1727;margin-bottom:6px;">${esc(title)}</div>` : ""}
            <div style="display:flex;flex-wrap:wrap;gap:8px;">${items
              .map(
                (a) =>
                  `<span style="padding:6px 10px;border-radius:999px;background:#e0f2fe;color:#0f172a;font-size:12px;border:1px solid #cbd5e1;">${esc(
                    a
                  )}</span>`
              )
              .join("")}</div>
          </div>`
        : "";

    const bullets = (items?: string[], title?: string) =>
      items && items.length
        ? `<div style="margin-top:12px;">
            ${title ? `<div style="font-weight:700;color:#0f172a;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.15em;font-size:13px;">${esc(
              title
            )}</div>` : ""}
            <ul style="padding-left:18px;margin:8px 0;color:#334155;line-height:1.6;">
              ${items.map((i) => `<li style="margin:6px 0;">${esc(i)}</li>`).join("")}
            </ul>
          </div>`
        : "";
    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Preview – ${esc(profile.name || "")}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#f8fafc; color:#0f172a; padding:24px; }
          .card { max-width:980px; margin:0 auto; background:#fff; border:1px solid #e2e8f0; border-radius:18px; overflow:hidden; }
          .hero { padding:0; }
          img { width:100%; max-height:520px; object-fit:contain; object-position:center 35%; display:block; background:#0b1220; }
          .body { padding:20px 24px; }
          h1 { margin:0 0 4px 0; font-size:26px; }
          .roles { display:flex; gap:8px; margin:6px 0; flex-wrap:wrap; }
          .pill { padding:6px 10px; border-radius:999px; background:#0ea5e9; color:#0b1727; font-weight:600; font-size:12px; }
          h2 { margin:18px 0 6px 0; font-size:14px; letter-spacing:0.2em; color:#0f172a; text-transform:uppercase; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="hero">
            ${profile.photo_url ? `<img src="${profile.photo_url}" alt="${esc(profile.name || "")}">` : ""}
          </div>
          <div class="body">
            <h1>${esc(profile.name || "")}</h1>
            <div style="color:#475569;font-size:13px;margin-bottom:4px;">${esc(profile.visibility || "pending")}</div>
            <div class="roles">
              ${(profile.roles || []).map((r: string) => `<span class="pill">${esc(r)}</span>`).join("")}
            </div>
            ${tagline ? `<div style="color:#0f172a;font-weight:500;margin:2px 0;">${esc(tagline)}</div>` : ""}
            ${languagesLine ? `<div style="color:#475569;font-size:13px;">${esc(languagesLine)}</div>` : ""}
            <div class="section">
              <div style="font-weight:700;color:#0f172a;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.15em;font-size:13px;">Teaching languages</div>
              ${pillRow(teachingLanguages)}
            </div>
            <div class="section">
              <div style="font-weight:700;color:#0f172a;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.15em;font-size:13px;">Translating languages</div>
              ${pillRow(translatingLanguages)}
            </div>
            <div class="section">
              <div style="font-weight:700;color:#0f172a;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.15em;font-size:13px;">Overview</div>
              ${overviewHtml}
            </div>
            ${bullets(eduBullets, "Educational & Professional Background")}
            ${bullets(certBullets, "Certifications")}
            ${bullets(focusBullets, "Linguistic Focus")}
          </div>
        </div>
      </body>
    </html>`;

    return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html" } });
  } catch (err) {
    const status =
      typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode?: number }).statusCode!
        : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Unable to load preview." }, { status });
  }
}
