import type { MetadataRoute } from "next";

const ACADEMY_URL = "https://training.dmechservices.ng";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${ACADEMY_URL}/sitemap.xml`,
  };
}
