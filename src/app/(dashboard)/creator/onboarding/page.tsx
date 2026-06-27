import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "./onboarding-form";

export const metadata = { title: "Complete Your Profile – Content Creators Hub" };

export default async function OnboardingPage() {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  // Already onboarded → redirect to edit
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
    select: { username: true },
  });
  if (profile?.username) {
    redirect("/creator/dashboard");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to the Hub 👋</h1>
        <p className="mt-2 text-muted-foreground">
          Let's get your creator profile set up in just a few steps.
        </p>
      </div>
      <OnboardingForm />
    </main>
  );
}
