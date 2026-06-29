import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAppRole, ROLE_HOME } from "@/lib/roles";
import type { AppRole } from "@/lib/roles";

const PROTECTED: { prefix: string; roles: AppRole[] }[] = [
  { prefix: "/dashboard",           roles: ["CREATOR", "BRAND", "ADMIN"] },
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

  if (isLoggedIn && role && isAppRole(role)) {
    const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));
    if (isAuthRoute) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], nextUrl.origin));
    }
  }

  const match = PROTECTED.find((p) => path.startsWith(p.prefix));
  if (!match) return NextResponse.next();

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (!role || !match.roles.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
