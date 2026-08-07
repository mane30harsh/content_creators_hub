import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAppRole, ROLE_HOME } from "@/lib/roles";
import { BrridgeLogo } from "@/components/shared/brridge-logo";
import { ArrowRight, Clapperboard, Heart } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  // Logged-in users go directly to their dashboard
  if (session?.user?.role && isAppRole(session.user.role)) {
    redirect(ROLE_HOME[session.user.role]);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-[#E60067] selection:text-white">
      {/* ── Navbar ── */}
      <header className="relative z-20 flex h-20 items-center justify-between px-6 max-w-7xl mx-auto">
        <BrridgeLogo />

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-neutral-800 bg-neutral-900/80 px-5 py-1.5 text-xs font-semibold text-neutral-200 transition-all hover:border-neutral-500 hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-neutral-800 bg-neutral-900/80 px-5 py-1.5 text-xs font-semibold text-neutral-200 transition-all hover:border-neutral-500 hover:text-white"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-12 pb-20">
        {/* Ambient Gradient Glows (matching Figma background) */}
        <div className="pointer-events-none absolute left-1/4 top-10 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#E60067]/40 to-[#990045]/20 blur-[120px]" />
        <div className="pointer-events-none absolute right-1/4 top-10 h-[350px] w-[350px] translate-x-1/2 rounded-full bg-gradient-to-l from-[#EAB308]/30 to-[#856404]/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          {/* Main Hero Headline */}
          <h1 className="text-5xl font-extrabold italic tracking-tight text-white sm:text-7xl lg:text-8xl">
            Beyond your DM
          </h1>

          <p className="mt-4 text-sm font-medium text-neutral-300 sm:text-base">
            Get discovered for your influence, by Brridge.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#E60067] px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-all duration-200 hover:bg-[#FF0066] hover:scale-105"
            >
              Create Your Profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#E60067] px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-all duration-200 hover:bg-[#FF0066] hover:scale-105"
            >
              Browse Brand Deals <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Curved Image Carousel Banner ── */}
        <div className="relative mt-16 mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Image 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900 shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80"
                alt="Creator outdoor lifestyle"
                className="h-64 sm:h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            </div>

            {/* Image 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900 shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                alt="Creator mirror selfie"
                className="h-64 sm:h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            </div>

            {/* Image 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900 shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80"
                alt="Creators co-creating"
                className="h-64 sm:h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* ── About Us Section ── */}
      <section className="relative bg-[#050505] py-24 border-t border-neutral-900">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            About Us
          </p>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.25] text-white">
            A platform built{" "}
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E60067] text-white align-middle mx-1 shadow-md">
              🎬
            </span>{" "}
            for creators
            <br />
            to find brand deals & co-create
            <br />
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E60067] text-white align-middle mx-1 shadow-md">
              💖
            </span>{" "}
            <span className="text-neutral-500 font-bold">with other creators.</span>
          </h2>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-900 py-8 text-xs text-neutral-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <BrridgeLogo />
            <span className="ml-2 text-neutral-600">
              © {new Date().getFullYear()} Brridge. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="transition-colors hover:text-white underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-white underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
