import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierwszapracatrojmiasto.pl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/praca-dla-studenta-gdansk",
        "/praca-bez-doswiadczenia-gdansk",
        "/praca-weekendowa-student-gdansk",
        "/praca-dorywcza-gdansk-student",
        "/praca-zdalna-student-gdansk",
        "/praca-dla-studenta-gdynia",
        "/praca-dla-studenta-sopot",
        "/praca-dla-studentow-gdansk/*",
        "/oferty",
        "/oferty/*",
      ],
      disallow: ["/admin", "/api/*"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

