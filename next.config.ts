import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/oferty",
        destination: "/praca-dla-studentow-gdansk",
        permanent: true,
      },
      {
        source: "/oferty/:id",
        destination: "/praca-dla-studentow-gdansk/:id",
        permanent: true,
      },
    ];
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      ...(isProd ? [] : ["'unsafe-eval'"]),
    ];
    const cspParts = [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      `script-src ${scriptSrc.join(" ")}`,
      "connect-src 'self' https:",
      "form-action 'self'",
    ];
    if (isProd) {
      cspParts.push("upgrade-insecure-requests");
    }

    const baseHeaders = {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
        },
        {
          key: "Content-Security-Policy",
          value: cspParts.join("; "),
        },
      ],
    };

    const hstsHeader = {
      source: "/:path*",
      headers: [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }],
    };

    return isProd ? [baseHeaders, hstsHeader] : [baseHeaders];
  },
};

export default nextConfig;
