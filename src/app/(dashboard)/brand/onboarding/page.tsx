import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { BrandOnboardingForm } from "./brand-onboarding-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set Up Your Brand – Content Creators Hub",
};

export default async function BrandOnboardingPage() {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const profile = await prisma.brandProfile.findUnique({
    where: { userId: user.id },
    select: { slug: true },
  });

  if (profile?.slug) {
    redirect("/brand/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <div className="mx-auto max-w-2xl px-4 py-14">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg">
            B
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Content Creators Hub</h1>
          <p className="mt-3 text-muted-foreground">
            Tell us about your brand so creators can discover and connect with you.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">1</span>
          <span className="h-px w-8 bg-border" />
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px]">2</span>
          <span className="h-px w-8 bg-border" />
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px]">3</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <BrandOnboardingForm />
        </div>
      </div>
    </div>
  );
}
