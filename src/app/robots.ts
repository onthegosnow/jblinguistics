import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/portal/",
          "/org/",
          "/api/",
          "/student/",
          "/assessments/",
          "/placement/",
          "/verify/",
        ],
      },
    ],
    sitemap: "https://www.jblinguistics.com/sitemap.xml",
  };
}
