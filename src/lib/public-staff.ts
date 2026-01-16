import type { StaffMember } from "./staff";
import { staff } from "./staff";

export type PublicStaff = Omit<StaffMember, 'overview'> & {
  overview: string[]; // Override: string[] instead of string
  visibility?: string;
  user_id?: string;
  photo_url?: string;
  teaching_languages?: string[];
  translating_languages?: string[];
};
type PublicStaffStatus = { source: "supabase" | "static" | "unavailable"; reason?: string };

let publicStaffStatus: PublicStaffStatus = { source: "unavailable", reason: "Not loaded" };
export function getPublicStaffStatus() {
  return publicStaffStatus;
}

// Priority profiles to use as emergency fallback if Supabase is unavailable
// These are key staff members that should always be visible
const PRIORITY_PROFILE_SLUGS = [
  "jonathan-brooks",
  "lauren-allen",
  "michelle-brooks",
  "daniela-leonhardt"
];

// Minimal supabase fetcher using environment creds (client/server)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const normalizeBaseUrl = (raw?: string) => {
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
};
const splitTokens = (value: string) =>
  value
    .split(/[,/|;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
const toDisplayString = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(", ");
  }
  if (typeof value === "string") return value;
  return "";
};
const toStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") return splitTokens(value);
  return [];
};

// Get emergency fallback profiles from static data
function getEmergencyFallbackProfiles(): PublicStaff[] {
  const priorityProfiles = staff.filter(member =>
    PRIORITY_PROFILE_SLUGS.includes(member.slug)
  );

  // Convert StaffMember to PublicStaff format
  // StaffMember.overview is string, PublicStaff.overview is string[]
  return priorityProfiles.map(member => ({
    slug: member.slug,
    name: member.name,
    role: member.role,
    roles: member.roles,
    languages: member.languages,
    langs: member.langs,
    image: member.image,
    imageFocus: member.imageFocus,
    imageFit: member.imageFit,
    tagline: member.tagline,
    overview: [member.overview], // Convert string to string[]
    background: member.background,
    linguistics: member.linguistics,
    region: member.region,
    location: member.location,
    specialties: member.specialties,
    expertise: member.expertise,
    profilePath: member.profilePath,
    visibility: "visible",
  }));
}

const normalizeProfiles = (rows: any[]): PublicStaff[] =>
  rows.map((row) => {
    const languagesDisplay = toDisplayString(row.languages_display) || toDisplayString(row.languages);
    const langList = toStringArray(row.langs);
    const teachingLangs = toStringArray(row.teaching_languages);
    const translatingLangs = toStringArray(row.translating_languages);

    // Handle background and linguistics - they might be null with data in overview
    const background = Array.isArray(row.background) && row.background.length > 0
      ? row.background
      : row.background && typeof row.background === 'string'
      ? [row.background]
      : [];

    const linguistics = Array.isArray(row.linguistics) && row.linguistics.length > 0
      ? row.linguistics
      : row.linguistics && typeof row.linguistics === 'string'
      ? [row.linguistics]
      : [];

    return {
      slug: row.slug,
      name: row.name,
      role: (row.roles?.[0] as any) || "teacher",
      roles: row.roles ?? [],
      languages: languagesDisplay || "",
      langs: langList.length ? langList : teachingLangs.length ? teachingLangs : translatingLangs,
      image: row.photo_url || "",
      tagline: row.tagline || "",
      overview: Array.isArray(row.overview) ? row.overview : row.overview ? [row.overview] : [],
      background,
      linguistics,
      specialties: toStringArray(row.specialties),
      expertise: toStringArray(row.expertise),
      region: row.region || row.location || "",
      location: row.location || "",
      profilePath: row.profile_path || undefined,
      visibility: row.visibility || "visible",
      user_id: row.user_id || undefined,
      teaching_languages: teachingLangs.length ? teachingLangs : undefined,
      translating_languages: translatingLangs.length ? translatingLangs : undefined,
    };
  }) as PublicStaff[];

async function fetchFromSupabase(): Promise<PublicStaff[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    publicStaffStatus = { source: "unavailable", reason: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY" };
    return [];
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/public_staff_profiles?visibility=eq.visible&select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) {
      publicStaffStatus = { source: "unavailable", reason: `Supabase request failed (${res.status})` };
      return [];
    }
    const data = (await res.json()) as any[];
    if (!data.length) {
      publicStaffStatus = { source: "unavailable", reason: "No published profiles found." };
      return [];
    }
    publicStaffStatus = { source: "supabase" };
    return normalizeProfiles(data);
  } catch (err) {
    publicStaffStatus = { source: "unavailable", reason: "Supabase request errored" };
    return [];
  }
}

export async function getPublicStaff(): Promise<PublicStaff[]> {
  const browserOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
  const baseUrl =
    normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    (browserOrigin ? browserOrigin : undefined) ||
    (typeof process !== "undefined" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const apiUrl = `${baseUrl}/api/public-staff`;
    const res = await fetch(apiUrl, { next: { revalidate: 0 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.profiles) && data.profiles.length) {
        publicStaffStatus = { source: "supabase" };
        return normalizeProfiles(data.profiles);
      }
      if (Array.isArray(data.profiles) && data.profiles.length === 0) {
        publicStaffStatus = { source: "unavailable", reason: "No published profiles yet." };
      } else if (data.message) {
        publicStaffStatus = { source: "unavailable", reason: data.message };
      }
    } else {
      publicStaffStatus = { source: "unavailable", reason: `Internal API failed (${res.status})` };
    }
  } catch (err) {
    publicStaffStatus = { source: "unavailable", reason: "Internal API error" };
  }

  // Then try direct Supabase
  const supa = await fetchFromSupabase();
  if (supa.length) return supa;

  // Emergency fallback: use priority profiles from static data
  // This ensures the site remains functional even if Supabase is down
  console.warn("⚠️  Supabase unavailable - using emergency fallback profiles");
  publicStaffStatus = {
    source: "static",
    reason: "Using emergency fallback profiles (Supabase unavailable)"
  };
  return getEmergencyFallbackProfiles();
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
