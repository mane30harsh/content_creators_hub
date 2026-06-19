import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { AppRole } from "@/lib/roles";

/**
 * Ensures a session exists; redirects to /login otherwise.
 * Use at the top of any protected Server Component or Route Handler.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

/**
 * Ensures a session exists AND the user's role is in `allowed`.
 * Redirects to /login if unauthenticated, /unauthorized if wrong role.
 */
export async function requireRole(allowed: AppRole[]) {
  const user = await requireUser();
  if (!allowed.includes(user.role as AppRole)) {
    redirect("/unauthorized");
  }
  return user;
}
