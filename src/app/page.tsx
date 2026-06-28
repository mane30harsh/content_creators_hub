import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAppRole, ROLE_HOME } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Sparkles, BarChart2 } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  // Logged-in users go directly to their dashboard
  if (session?.user?.role && isAppRole(session.user.role)) {
    redirect(ROLE_HOME[session.user.role]);
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Minimal header */}
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            C
          </span>
          Content Creators Hub
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3 w-3" /> Creator–Brand Partnerships Platform
        </div>

        <h1 className="text-5xl font-bold tracking-tight leading-tight sm:text-6xl">
          Where creators and<br />
          <span className="text-primary">brands meet.</span>
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground">
          Discover the right partners, run campaigns that convert, and grow your audience — all in one place.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup">
              Start for free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {[
            { icon: Users, label: "Creator profiles" },
            { icon: BarChart2, label: "Campaign analytics" },
            { icon: Sparkles, label: "Brand partnerships" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
