import { staff, type StaffMember } from "./staff";

export type PublicStaff = StaffMember & { visibility?: string; user_id?: string; photo_url?: string };
type PublicStaffStatus = { source: "supabase" | "static"; reason?: string };

let publicStaffStatus: PublicStaffStatus = { source: "static", reason: "Not loaded" };
export function getPublicStaffStatus() {
  return publicStaffStatus;
}

// Minimal supabase fetcher using environment creds (client/server)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fetchFromSupabase(): Promise<PublicStaff[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    publicStaffStatus = { source: "static", reason: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY" };
    return [];
  }
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
    if (!res.ok) {
    publicStaffStatus = { source: "static", reason: `Supabase request failed (${res.status})` };
    return [];
  }
  const data = (await res.json()) as any[];
  publicStaffStatus = { source: "supabase" };
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
    publicStaffStatus = { source: "static", reason: "Supabase request errored" };
    return [];
  }
}

export async function getPublicStaff(): Promise<PublicStaff[]> {
  // First try direct Supabase
  const supa = await fetchFromSupabase();
  if (supa.length) return supa;

  // Fallback: hit our own API (uses service role server-side)
  try {
    const res = await fetch("/api/public-staff", { next: { revalidate: 0 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.profiles) && data.profiles.length) {
        publicStaffStatus = { source: "supabase" };
        return data.profiles as PublicStaff[];
      }
      if (data.message) {
        publicStaffStatus = { source: "static", reason: data.message };
      }
    } else {
      publicStaffStatus = { source: "static", reason: `Internal API failed (${res.status})` };
    }
  } catch (err) {
    publicStaffStatus = { source: "static", reason: "Internal API error" };
  }

  publicStaffStatus = { source: "static", reason: publicStaffStatus.reason || "Supabase returned no rows" };
  // fallback to static staff
  return staff;
}

export async function getPublicStaffByRole(role: "teacher" | "translator") {
  const all = await getPublicStaff();
  return all.filter((m) => (m.roles?.length ? m.roles.includes(role) : m.role === role));
}

export function getPublicStaffSource() {
  return publicStaffStatus;
}

export async function getPublicStaffMap() {
  const all = await getPublicStaff();
  const map = new Map<string, PublicStaff>();
  all.forEach((m) => map.set(m.slug, m));
  return map;
}
