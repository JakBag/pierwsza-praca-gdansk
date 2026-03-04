import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, parseCookieHeader, verifyAdminSessionToken } from "@/lib/adminSession";

const DEFAULT_PRIMARY_ORIGIN = "https://pierwszapracatrojmiasto.pl";

function getRequestOrigin(req: NextRequest) {
  return req.nextUrl.origin;
}

function getAllowedOrigins(req: NextRequest) {
  const origins = new Set<string>();
  const requestOrigin = getRequestOrigin(req);
  if (requestOrigin) origins.add(requestOrigin);

  const primaryOrigin = String(
    process.env.APP_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_PRIMARY_ORIGIN
  ).trim();
  if (primaryOrigin) origins.add(primaryOrigin);

  const extraOrigins = String(process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);
  for (const origin of extraOrigins) {
    origins.add(origin);
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  return origins;
}

function addCorsHeaders(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get("origin");
  const allowedOrigins = getAllowedOrigins(req);
  const fallbackOrigin = getRequestOrigin(req) || String(
    process.env.APP_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_PRIMARY_ORIGIN
  ).trim();
  const allowOrigin = origin && allowedOrigins.has(origin) ? origin : fallbackOrigin;

  res.headers.set("Access-Control-Allow-Origin", allowOrigin);
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-submit-key, x-admin-key, x-csrf-token"
  );
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Vary", "Origin");
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin");
    if (origin && !getAllowedOrigins(req).has(origin)) {
      const blocked = NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
      addCorsHeaders(req, blocked);
      return blocked;
    }

    if (req.method === "OPTIONS") {
      const preflight = new NextResponse(null, { status: 204 });
      addCorsHeaders(req, preflight);
      return preflight;
    }

    const apiResponse = NextResponse.next();
    addCorsHeaders(req, apiResponse);
    return apiResponse;
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const cookies = parseCookieHeader(req.headers.get("cookie"));
  const sessionToken = cookies[ADMIN_SESSION_COOKIE];
  const session = verifyAdminSessionToken(sessionToken);
  if (!session) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};

