import type { MetadataRoute } from "next";
import { getPublishedJobs } from "@/lib/jobsDb";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierwszapracatrojmiasto.pl";

function toDateOnly(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return undefined;
  return new Date(ms).toISOString().slice(0, 10);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getPublishedJobs();
  const latestJobDate = toDateOnly(jobs[0]?.created_at);
  const fallbackDate = new Date().toISOString().slice(0, 10);
  const lastmod = latestJobDate ?? fallbackDate;

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: lastmod,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/praca-dla-studenta-gdansk`,
      lastModified: lastmod,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/praca-dla-studenta-gdynia`,
      lastModified: lastmod,
      changeFrequency: "hourly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/praca-dla-studenta-sopot`,
      lastModified: lastmod,
      changeFrequency: "hourly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: fallbackDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const offerUrls: MetadataRoute.Sitemap = jobs.map(job => ({
    url: `${siteUrl}/praca-dla-studentow-gdansk/${job.id}`,
    lastModified: toDateOnly(job.created_at) ?? fallbackDate,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticUrls, ...offerUrls];
}
