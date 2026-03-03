import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, parseCookieHeader, verifyAdminSessionToken } from "@/lib/adminSession";

const PRIMARY_ORIGIN = "https://pierwsza-praca-gdansk.pl";

function getAllowedOrigins() {
  const origins = new Set<string>([PRIMARY_ORIGIN]);
  const envOrigin = String(
    process.env.APP_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? ""
  ).trim();
  if (envOrigin) {
    origins.add(envOrigin);
  }
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  return origins;
}

function addCorsHeaders(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();
  const allowOrigin = origin && allowedOrigins.has(origin) ? origin : PRIMARY_ORIGIN;

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
    if (origin && !getAllowedOrigins().has(origin)) {
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
