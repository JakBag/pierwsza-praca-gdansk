import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from "@/lib/adminSession";
import {
  ADMIN_CSRF_COOKIE,
  createAdminCsrfToken,
  getAdminCsrfCookieOptions,
  requireAllowedBrowserOrigin,
  requireRateLimit,
} from "@/lib/security";
import { adminLoginSchema, parseBody } from "@/lib/validation";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function POST(req: Request) {
  const originGuard = requireAllowedBrowserOrigin(req);
  if (originGuard) return originGuard;

  const limited = await requireRateLimit(req, "admin-login", 5, 10 * 60);
  if (limited) return limited;

  const parsed = await parseBody(req, adminLoginSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const username = parsed.data.username;
  const password = parsed.data.password;

  const expectedUser = process.env.ADMIN_LOGIN_USER ?? "";
  const expectedPass = process.env.ADMIN_LOGIN_PASS ?? "";
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "";

  if (!expectedUser || !expectedPass || !sessionSecret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (!safeEqual(username, expectedUser) || !safeEqual(password, expectedPass)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createAdminSessionToken(username);
  if (!token) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());
  res.cookies.set(ADMIN_CSRF_COOKIE, createAdminCsrfToken(), getAdminCsrfCookieOptions());
  return res;
}
