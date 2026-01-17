import type { MetadataRoute } from "next";
import { destinations } from "@/lib/trips";

const BASE_URL = "https://www.jblinguistics.com";

// Fetch public staff profiles directly from Supabase for sitemap generation
async function getPublicStaffForSitemap(): Promise<{ slug: string; roles: string[] }[]> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("Sitemap: Supabase credentials not available, using fallback staff");
    return [
      { slug: "jonathan-brooks", roles: ["teacher", "translator"] },
      { slug: "lauren-allen", roles: ["teacher"] },
      { slug: "michelle-brooks", roles: ["teacher"] },
      { slug: "daniela-leonhardt", roles: ["translator"] },
    ];
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/public_staff_profiles?visibility=eq.visible&select=slug,roles`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Accept: "application/json",
        },
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!res.ok) {
      console.warn(`Sitemap: Failed to fetch staff profiles (${res.status})`);
      return [];
    }

    const profiles = await res.json();
    return profiles.map((p: { slug: string; roles?: string[] }) => ({
      slug: p.slug,
      roles: p.roles || [],
    }));
  } catch (err) {
    console.warn("Sitemap: Error fetching staff profiles", err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // Services
    {
      url: `${BASE_URL}/services/linguistic-learning`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services/translation-localization`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services/certified-document-translation`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services/simultaneous-interpretation`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    // Staff directories
    {
      url: `${BASE_URL}/teachers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/translators`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // Learning trips index
    {
      url: `${BASE_URL}/trips`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // Careers
    {
      url: `${BASE_URL}/careers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/apply`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Static booking page
    {
      url: `${BASE_URL}/teachers/book-with-jb`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic staff profile pages
  const staffProfiles = await getPublicStaffForSitemap();

  const teacherPages: MetadataRoute.Sitemap = staffProfiles
    .filter((p) => p.roles.includes("teacher"))
    .map((profile) => ({
      url: `${BASE_URL}/teachers/${profile.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const translatorPages: MetadataRoute.Sitemap = staffProfiles
    .filter((p) => p.roles.includes("translator"))
    .map((profile) => ({
      url: `${BASE_URL}/translators/${profile.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  // Dynamic trip destination pages
  const tripPages: MetadataRoute.Sitemap = destinations.map((dest) => ({
    url: `${BASE_URL}/trips/${dest.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Trip pricing pages
  const tripPricingPages: MetadataRoute.Sitemap = destinations.map((dest) => ({
    url: `${BASE_URL}/trips/${dest.slug}/pricing`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...teacherPages,
    ...translatorPages,
    ...tripPages,
    ...tripPricingPages,
  ];
}
