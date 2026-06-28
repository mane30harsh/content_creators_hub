import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAppRole, ROLE_HOME } from "@/lib/roles";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Already logged in → bounce to their dashboard
  const session = await auth();
  if (session?.user?.role && isAppRole(session.user.role)) {
    redirect(ROLE_HOME[session.user.role]);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/40 to-background">
      {/* Minimal header */}
      <header className="flex h-14 items-center border-b border-border bg-background/80 px-6 backdrop-blur">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            C
          </span>
          <span>Content Creators Hub</span>
        </Link>
      </header>

      {/* Page content */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Content Creators Hub · All rights reserved
      </footer>
    </div>
  );
}
