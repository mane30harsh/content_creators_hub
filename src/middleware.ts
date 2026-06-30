import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAppRole, ROLE_HOME } from "@/lib/roles";
import type { AppRole } from "@/lib/roles";

const PROTECTED: { prefix: string; roles: AppRole[] }[] = [
  { prefix: "/dashboard",           roles: ["CREATOR", "BRAND", "ADMIN"] },
  { prefix: "/feed",                roles: ["CREATOR", "BRAND", "ADMIN"] },
  { prefix: "/notifications",       roles: ["CREATOR", "BRAND", "ADMIN"] },
  { prefix: "/posts",               roles: ["CREATOR", "BRAND", "ADMIN"] },
  { prefix: "/messages",            roles: ["CREATOR", "BRAND", "ADMIN"] },
  { prefix: "/reviews",             roles: ["CREATOR", "BRAND", "ADMIN"] },
  { prefix: "/creator/onboarding",  roles: ["CREATOR", "ADMIN"] },
  { prefix: "/creator/profile",     roles: ["CREATOR", "ADMIN"] },
  { prefix: "/creator/dashboard",   roles: ["CREATOR", "ADMIN"] },
  { prefix: "/creator/campaigns",   roles: ["CREATOR", "ADMIN"] },
  { prefix: "/brand/onboarding",    roles: ["BRAND", "ADMIN"] },
  { prefix: "/brand/profile",       roles: ["BRAND", "ADMIN"] },
  { prefix: "/brand/dashboard",     roles: ["BRAND", "ADMIN"] },
  { prefix: "/brand/campaigns",     roles: ["BRAND", "ADMIN"] },
  { prefix: "/admin",               roles: ["ADMIN"] },
];

const AUTH_ROUTES = ["/login", "/signup", "/register", "/forgot-password", "/reset-password"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role as AppRole | undefined;
  const path = nextUrl.pathname;

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && role && isAppRole(role)) {
    const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));
    if (isAuthRoute) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], nextUrl.origin));
    }
  }

  // Check if path requires protection
  const match = PROTECTED.find((p) => path.startsWith(p.prefix));
  if (!match) {
    // Add security headers even to public pages
    return addSecurityHeaders(NextResponse.next());
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", path);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // Redirect users without required role
  if (!role || !match.roles.includes(role)) {
    return addSecurityHeaders(NextResponse.redirect(new URL("/unauthorized", nextUrl.origin)));
  }

  return addSecurityHeaders(NextResponse.next());
});

function addSecurityHeaders(res: NextResponse): NextResponse {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "0");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Content-Security-Policy", csp);

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
