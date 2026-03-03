export const ADMIN_CSRF_COOKIE = "admin_csrf";

export function getCookieValue(name: string) {
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export function withAdminCsrfHeader(headers?: HeadersInit) {
  const out = new Headers(headers ?? {});
  const token = getCookieValue(ADMIN_CSRF_COOKIE);
  if (token) {
    out.set("x-csrf-token", token);
  }
  return out;
}
