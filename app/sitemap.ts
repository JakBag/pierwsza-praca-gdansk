import type { MetadataRoute } from "next";
import { getPublishedJobs } from "@/lib/jobsDb";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getPublishedJobs();

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/oferty`,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const offerUrls: MetadataRoute.Sitemap = jobs.map(job => ({
    url: `${siteUrl}/oferty/${job.id}`,
    lastModified: job.created_at,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticUrls, ...offerUrls];
}
