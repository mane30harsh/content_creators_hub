import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "./onboarding-form";

export const metadata = { title: "Complete Your Profile – Brridge" };

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
      <div className="mb-10 text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
          Setup yourself with <span className="text-[#EAB308]">Brridge</span>
        </h1>
        <p className="text-sm font-medium text-neutral-400">
          Let&apos;s get your creator profiles set up in just a few steps.
        </p>
      </div>
      <OnboardingForm />
    </main>
  );
}
