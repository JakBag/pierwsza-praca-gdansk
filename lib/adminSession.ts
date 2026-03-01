import crypto from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_SEC = 8 * 60 * 60;

type AdminSessionPayload = {
  u: string;
  exp: number;
};

function toBase64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${pad}`, "base64");
}

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

function sign(value: string) {
  const secret = getSecret();
  if (!secret) return "";
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

export function createAdminSessionToken(username: string) {
  const payload: AdminSessionPayload = {
    u: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  if (!signature) return null;
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) return null;
  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) return null;

  const expected = sign(encodedPayload);
  if (!expected || !safeEqual(encodedSignature, expected)) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload).toString("utf8")) as AdminSessionPayload;
    if (!payload || typeof payload.u !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookieHeader(cookieHeader: string | null) {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;

  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const sep = trimmed.indexOf("=");
    if (sep <= 0) continue;
    const k = trimmed.slice(0, sep).trim();
    const v = trimmed.slice(sep + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

export function getAdminSessionFromRequest(req: Request) {
  const cookies = parseCookieHeader(req.headers.get("cookie"));
  return verifyAdminSessionToken(cookies[ADMIN_SESSION_COOKIE]);
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_SEC,
  };
}
