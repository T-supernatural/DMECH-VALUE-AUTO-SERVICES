import type { MetadataRoute } from "next";
import { PROGRAMMES } from "../lib/programmes";

const ACADEMY_URL = "https://training.dmechservices.ng";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages: MetadataRoute.Sitemap = [
    { url: ACADEMY_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${ACADEMY_URL}/programmes`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${ACADEMY_URL}/technician-standard`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${ACADEMY_URL}/how-its-taught`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${ACADEMY_URL}/corporate-training`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${ACADEMY_URL}/register-interest`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const programmePages: MetadataRoute.Sitemap = PROGRAMMES.map((programme) => ({
    url: `${ACADEMY_URL}/programmes/${programme.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...publicPages, ...programmePages];
}
