import crypto from "crypto";
import net from "net";
import { NextResponse } from "next/server";
import { getAdminSessionFromRequest, parseCookieHeader } from "@/lib/adminSession";
import { logSecurityEvent } from "@/lib/monitoring";

const DEFAULT_WINDOW_SEC = 10 * 60;
const memoryRateLimitStore = new Map<string, number[]>();
let rateLimitOps = 0;
const ADMIN_SESSION_TTL_SEC = 8 * 60 * 60;
const PRIMARY_ORIGIN = "https://pierwszapracatrojmiasto.pl";
export const ADMIN_CSRF_COOKIE = "admin_csrf";

function normalizeIp(raw: string | null) {
  if (!raw) return "";
  const value = raw.trim();
  if (!value) return "";

  // Handle RFC7239-like tokens: for="1.2.3.4" or for="[2001:db8::1]"
  const unquoted = value.replace(/^for=/i, "").replace(/^"|\"$/g, "").trim();
  const unbracketed = unquoted.startsWith("[") && unquoted.endsWith("]")
    ? unquoted.slice(1, -1)
    : unquoted;

  const ipv4WithPort = unbracketed.match(/^(\d{1,3}(?:\.\d{1,3}){3}):(\d{1,5})$/);
  const candidate = ipv4WithPort ? ipv4WithPort[1] : unbracketed;
  return net.isIP(candidate) ? candidate : "";
}

function toBytes(value: string) {
  return Buffer.from(value, "utf8");
}

function safeEqual(a: string, b: string) {
  const aa = toBytes(a);
  const bb = toBytes(b);
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

export function getClientIp(req: Request) {
  const directHeaders = [
    req.headers.get("x-real-ip"),
    req.headers.get("cf-connecting-ip"),
    req.headers.get("x-vercel-forwarded-for"),
  ];

  for (const raw of directHeaders) {
    const ip = normalizeIp(raw);
    if (ip) return ip;
  }

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    // Use the right-most valid entry: with common proxy appending behavior,
    // spoofed client-injected values stay on the left.
    const parts = xff.split(",");
    for (let i = parts.length - 1; i >= 0; i -= 1) {
      const ip = normalizeIp(parts[i] ?? "");
      if (ip) return ip;
    }
  }

  return "unknown";
}

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

export function isAllowedBrowserOrigin(origin: string) {
  return getAllowedOrigins().has(origin);
}

type OriginGuardOptions = {
  requireHeader?: boolean;
};

export function requireAllowedBrowserOrigin(req: Request, options: OriginGuardOptions = {}) {
  const origin = req.headers.get("origin");
  if (!origin) {
    if (!options.requireHeader) return null;
    const route = new URL(req.url).pathname;
    const ip = getClientIp(req);
    logSecurityEvent({ status: 403, route, ip, tag: "origin_missing" });
    return NextResponse.json({ error: "Missing Origin header" }, { status: 403 });
  }
  if (isAllowedBrowserOrigin(origin)) return null;

  const route = new URL(req.url).pathname;
  const ip = getClientIp(req);
  logSecurityEvent({ status: 403, route, ip, tag: "origin_not_allowed" });
  return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
}

function pruneRateLimitStore(nowMs: number) {
  const maxWindowMs = DEFAULT_WINDOW_SEC * 1000;
  for (const [key, values] of memoryRateLimitStore) {
    if (!values.length) {
      memoryRateLimitStore.delete(key);
      continue;
    }
    const recent = values.filter(ts => nowMs - ts < maxWindowMs);
    if (!recent.length) {
      memoryRateLimitStore.delete(key);
    } else if (recent.length !== values.length) {
      memoryRateLimitStore.set(key, recent);
    }
  }
}

function hashRateLimitKey(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

type RateLimitParams = {
  bucket: string;
  key: string;
  limit: number;
  windowSec?: number;
  increment?: number;
};

export async function checkRateLimit(params: RateLimitParams) {
  const windowSec = params.windowSec ?? DEFAULT_WINDOW_SEC;
  const increment = Number.isFinite(params.increment) && (params.increment ?? 0) > 0
    ? Math.floor(params.increment as number)
    : 1;
  const hashed = hashRateLimitKey(params.key);
  const key = `rl:${params.bucket}:${hashed}`;
  const nowMs = Date.now();
  const windowMs = windowSec * 1000;
  const recent = (memoryRateLimitStore.get(key) ?? []).filter(ts => nowMs - ts < windowMs);

  for (let i = 0; i < increment; i += 1) {
    recent.push(nowMs);
  }
  memoryRateLimitStore.set(key, recent);
  rateLimitOps += 1;
  if (rateLimitOps % 200 === 0) {
    pruneRateLimitStore(nowMs);
  }

  const count = recent.length;
  const oldest = recent[0] ?? nowMs;
  const ttl = Math.max(1, Math.ceil((windowMs - (nowMs - oldest)) / 1000));
  const allowed = Number.isFinite(count) && count <= params.limit;

  return {
    allowed,
    remaining: Math.max(0, params.limit - count),
    retryAfterSec: allowed ? 0 : Math.max(1, Number.isFinite(ttl) ? ttl : windowSec),
    skipped: false,
  };
}

export async function requireRateLimit(
  req: Request,
  bucket: string,
  limit: number,
  windowSec = DEFAULT_WINDOW_SEC,
  increment = 1
) {
  const ip = getClientIp(req);
  const result = await checkRateLimit({ bucket, key: ip, limit, windowSec, increment });
  if (result.allowed) return null;
  const route = new URL(req.url).pathname;
  logSecurityEvent({ status: 429, route, ip, tag: `rate_limit_${bucket}` });

  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSec) },
    }
  );
}

export function requireHeaderSecret(req: Request, headerName: string, envName: string) {
  const expected = process.env[envName];
  const route = new URL(req.url).pathname;
  const ip = getClientIp(req);
  if (!expected) {
    logSecurityEvent({ status: 500, route, ip, tag: `missing_env_${envName}` });
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const provided = req.headers.get(headerName) ?? "";
  if (!safeEqual(provided, expected)) {
    const tag = headerName === "x-admin-key" ? "admin_auth_fail" : `header_secret_fail_${headerName}`;
    logSecurityEvent({ status: 401, route, ip, tag });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function requireAdminRequest(req: Request) {
  const session = getAdminSessionFromRequest(req);
  if (session) return null;
  const route = new URL(req.url).pathname;
  const ip = getClientIp(req);
  logSecurityEvent({ status: 401, route, ip, tag: "admin_session_missing_or_invalid" });
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function createAdminCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function getAdminCsrfCookieOptions() {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SEC,
  };
}

export function requireAdminCsrf(req: Request) {
  const cookies = parseCookieHeader(req.headers.get("cookie"));
  const tokenFromCookie = String(cookies[ADMIN_CSRF_COOKIE] ?? "");
  const tokenFromHeader = String(req.headers.get("x-csrf-token") ?? "").trim();

  if (!tokenFromCookie || !tokenFromHeader || !safeEqual(tokenFromCookie, tokenFromHeader)) {
    const route = new URL(req.url).pathname;
    const ip = getClientIp(req);
    logSecurityEvent({ status: 403, route, ip, tag: "admin_csrf_failed" });
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  return null;
}

export async function requireAdminMutation(req: Request) {
  const originGuard = requireAllowedBrowserOrigin(req, { requireHeader: true });
  if (originGuard) return originGuard;

  const authGuard = await requireAdminRequest(req);
  if (authGuard) return authGuard;

  return requireAdminCsrf(req);
}

export function requireSubmissionTiming(req: Request, startedAtMs: number, minMs = 1200, maxMs = 2 * 60 * 60 * 1000) {
  if (!Number.isFinite(startedAtMs)) {
    return NextResponse.json({ error: "Invalid form timing" }, { status: 400 });
  }
  const now = Date.now();
  const elapsedMs = now - Math.floor(startedAtMs);
  if (elapsedMs < minMs || elapsedMs > maxMs) {
    const route = new URL(req.url).pathname;
    const ip = getClientIp(req);
    logSecurityEvent({ status: 403, route, ip, tag: "invalid_submission_timing" });
    return NextResponse.json({ error: "Form validation failed" }, { status: 403 });
  }
  return null;
}

export function internalError(label: string, error: unknown) {
  console.error(`${label}:`, error);
  logSecurityEvent({ status: 500, route: "internal", ip: "-", tag: label });
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

