import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from "@/lib/adminSession";
import { requireRateLimit } from "@/lib/security";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function POST(req: Request) {
  const limited = await requireRateLimit(req, "admin-login", 5, 10 * 60);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

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
  return res;
}
