import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAppRole, ROLE_HOME, ROLE_LABELS } from "@/lib/roles";
import { UserNav } from "@/components/shared/user-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const roleHome = isAppRole(role) ? ROLE_HOME[role] : "/";

  const navLinks =
    role === "ADMIN"
      ? [
          { href: "/admin/dashboard", label: "Overview" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/campaigns", label: "Campaigns" },
        ]
      : role === "BRAND"
      ? [
          { href: "/brand/dashboard", label: "Dashboard" },
          { href: "/brand/profile/edit", label: "Profile" },
          { href: "/brand/onboarding", label: "Campaigns" },
        ]
      : [
          { href: "/creator/dashboard", label: "Dashboard" },
          { href: "/creator/profile/edit", label: "Profile" },
          { href: "/creator/onboarding", label: "Campaigns" },
        ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {/* Logo + nav */}
          <div className="flex items-center gap-6">
            <Link
              href={roleHome}
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                C
              </span>
              <span className="hidden sm:inline">Content Creators Hub</span>
            </Link>

            <nav className="hidden items-center gap-1 sm:flex">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* User menu */}
          <UserNav
            name={session.user.name ?? undefined}
            email={session.user.email ?? undefined}
            image={session.user.image ?? undefined}
            role={isAppRole(role) ? role : "CREATOR"}
          />
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
