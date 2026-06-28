import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAppRole, ROLE_HOME } from "@/lib/roles";

/**
 * /dashboard — universal entry point after login.
 * Immediately redirects to the role-specific dashboard.
 * Protected by middleware; unauthenticated users are sent to /login.
 */
export default async function DashboardPage() {
  const session = await auth();

  const role = session?.user?.role;

  if (role && isAppRole(role)) {
    redirect(ROLE_HOME[role]);
  }

  // Fallback: no role (shouldn't happen in normal flow)
  redirect("/login");
}
