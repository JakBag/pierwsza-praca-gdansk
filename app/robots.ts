import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierwszapracatrojmiasto.pl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/praca-dla-studentow-gdansk", "/praca-dla-studentow-gdansk/*", "/oferty", "/oferty/*"],
      disallow: ["/admin", "/api/*"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

