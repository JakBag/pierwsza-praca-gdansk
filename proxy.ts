import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  const hasAdminSessionCookie = cookieHeader.includes("admin_session=");
  if (!hasAdminSessionCookie) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
