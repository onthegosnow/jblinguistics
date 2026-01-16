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

    // Only use photo_url if it's a full URL (not a storage path)
    const photoUrl = row.photo_url && row.photo_url.startsWith('http') ? row.photo_url : undefined;

    return {
      slug: row.slug,
      name: row.name,
      role: (row.roles?.[0] as any) || "teacher",
      roles: row.roles ?? [],
      languages: languagesDisplay || "",
      langs: langList.length ? langList : teachingLangs.length ? teachingLangs : translatingLangs,
      image: photoUrl,
      photo_url: photoUrl,
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

const isImage = (path?: string | null, mime?: string | null, filename?: string | null) => {
  if ((mime ?? "").toLowerCase().startsWith("image/")) return true;
  const name = path || filename || "";
  return /\.(png|jpe?g|webp|gif)$/i.test(name);
};

async function fetchFromSupabase(): Promise<PublicStaff[]> {
  // Use service role key for server-side operations (can generate signed URLs)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authKey = serviceKey || SUPABASE_ANON;

  if (!SUPABASE_URL || !authKey) {
    publicStaffStatus = { source: "unavailable", reason: "Missing Supabase credentials" };
    return [];
  }

  try {
    // Fetch profiles
    const profilesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/public_staff_profiles?visibility=eq.visible&select=*&order=updated_at.desc`,
      {
        headers: {
          apikey: authKey,
          Authorization: `Bearer ${authKey}`,
          Accept: "application/json",
        },
      }
    );
    if (!profilesRes.ok) {
      publicStaffStatus = { source: "unavailable", reason: `Supabase request failed (${profilesRes.status})` };
      return [];
    }
    const profiles = (await profilesRes.json()) as any[];
    if (!profiles.length) {
      publicStaffStatus = { source: "unavailable", reason: "No published profiles found." };
      return [];
    }

    // If we have service key, fetch uploads and generate signed URLs
    if (serviceKey) {
      const userIds = profiles.map(p => p.user_id).filter(Boolean);

      if (userIds.length > 0) {
        // Fetch uploads for all users
        const [userUploadsRes, portalUsersRes] = await Promise.all([
          fetch(
            `${SUPABASE_URL}/rest/v1/portal_user_uploads?user_id=in.(${userIds.map(id => `"${id}"`).join(',')})&select=user_id,path,kind,mime_type,filename,created_at&order=created_at.desc`,
            {
              headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                Accept: "application/json",
              },
            }
          ),
          fetch(
            `${SUPABASE_URL}/rest/v1/portal_users?id=in.(${userIds.map(id => `"${id}"`).join(',')})&select=id,photo_url`,
            {
              headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                Accept: "application/json",
              },
            }
          ),
        ]);

        const userUploads = userUploadsRes.ok ? await userUploadsRes.json() : [];
        const portalUsers = portalUsersRes.ok ? await portalUsersRes.json() : [];

        // Build maps
        const userUploadsMap = new Map<string, any[]>();
        for (const upload of userUploads) {
          const existing = userUploadsMap.get(upload.user_id) ?? [];
          existing.push(upload);
          userUploadsMap.set(upload.user_id, existing);
        }
        const portalUsersMap = new Map<string, any>();
        for (const user of portalUsers) {
          portalUsersMap.set(user.id, user);
        }

        // Generate signed URLs for each profile
        for (const profile of profiles) {
          if (!profile.user_id) continue;

          const uploads = userUploadsMap.get(profile.user_id) ?? [];
          const imageUploads = uploads.filter(u => isImage(u.path, u.mime_type, u.filename));
          const preferred = imageUploads.find(u => u.kind === "photo");
          const chosen = preferred ?? imageUploads[0];

          let storagePath = chosen?.path;

          // Fallback to portal_users.photo_url if no upload found
          if (!storagePath) {
            const portalUser = portalUsersMap.get(profile.user_id);
            if (portalUser?.photo_url?.startsWith("portal_user_uploads/")) {
              storagePath = portalUser.photo_url;
            }
          }

          if (storagePath) {
            // Generate signed URL using storage API
            const signRes = await fetch(
              `${SUPABASE_URL}/storage/v1/object/sign/resumes/${storagePath}`,
              {
                method: "POST",
                headers: {
                  apikey: serviceKey,
                  Authorization: `Bearer ${serviceKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 365 }), // 1 year
              }
            );
            if (signRes.ok) {
              const signData = await signRes.json();
              if (signData.signedURL) {
                profile.photo_url = `${SUPABASE_URL}/storage/v1${signData.signedURL}`;
              }
            }
          }
        }
      }
    }

    publicStaffStatus = { source: "supabase" };
    return normalizeProfiles(profiles);
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
    const res = await fetch(apiUrl, { cache: "no-store", next: { revalidate: 0 } });
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
