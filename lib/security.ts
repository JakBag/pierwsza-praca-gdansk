import crypto from "crypto";
import { NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/adminSession";
import { logSecurityEvent } from "@/lib/monitoring";

const DEFAULT_WINDOW_SEC = 10 * 60;
const memoryRateLimitStore = new Map<string, number[]>();

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
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xrip = req.headers.get("x-real-ip");
  if (xrip) return xrip.trim();
  return "unknown";
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

export function internalError(label: string, error: unknown) {
  console.error(`${label}:`, error);
  logSecurityEvent({ status: 500, route: "internal", ip: "-", tag: label });
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
