import { staff, type StaffMember } from "./staff";

export type PublicStaff = StaffMember & { visibility?: string; user_id?: string };

// Minimal supabase fetcher using environment creds (client/server)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fetchFromSupabase(): Promise<PublicStaff[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/public_staff_profiles?or=(visibility.eq.visible,visibility.is.null)&select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as any[];
    return data.map((row) => ({
      slug: row.slug,
      name: row.name,
      role: (row.roles?.[0] as any) || "teacher",
      roles: row.roles ?? [],
      languages: row.languages_display || row.languages || "",
      langs: row.langs || row.teaching_languages || row.translating_languages || [],
      image: row.photo_url || "",
      tagline: row.tagline || "",
      overview: Array.isArray(row.overview) ? row.overview : row.overview ? [row.overview] : [],
      background: Array.isArray(row.background) ? row.background : [],
      linguistics: Array.isArray(row.linguistics) ? row.linguistics : [],
      specialties: Array.isArray(row.specialties) ? row.specialties : [],
      expertise: Array.isArray(row.expertise) ? row.expertise : [],
      region: row.region || row.location || "",
      location: row.location || "",
      profilePath: row.profile_path || undefined,
      visibility: row.visibility || "visible",
      user_id: row.user_id || undefined,
    })) as PublicStaff[];
  } catch (err) {
    return [];
  }
}

export async function getPublicStaff(): Promise<PublicStaff[]> {
  const supa = await fetchFromSupabase();
  if (supa.length) return supa;
  // fallback to static staff
  return staff;
}

export async function getPublicStaffByRole(role: "teacher" | "translator") {
  const all = await getPublicStaff();
  return all.filter((m) => (m.roles?.length ? m.roles.includes(role) : m.role === role));
}

export async function getPublicStaffMap() {
  const all = await getPublicStaff();
  const map = new Map<string, PublicStaff>();
  all.forEach((m) => map.set(m.slug, m));
  return map;
}
