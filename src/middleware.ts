import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { AppRole } from "@/lib/roles";

// Map each protected path prefix to the roles allowed to access it.
const PROTECTED_PREFIXES: { prefix: string; roles: AppRole[] }[] = [
  { prefix: "/creator", roles: ["CREATOR", "ADMIN"] },
  { prefix: "/brand", roles: ["BRAND", "ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN"] },
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role as AppRole | undefined;

  const match = PROTECTED_PREFIXES.find((p) => nextUrl.pathname.startsWith(p.prefix));
  if (!match) return NextResponse.next();

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!role || !match.roles.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin));
  }

  return NextResponse.next();
});

// Avoid running middleware on static assets / API auth routes.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
