import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { ProfileEditForm } from "./profile-edit-form";

export const metadata = { title: "Edit Profile – Content Creators Hub" };

export default async function ProfileEditPage() {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile?.username) {
    redirect("/creator/onboarding");
  }

  const portfolioItems = await prisma.portfolioItem.findMany({
    where: { creatorProfileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
          <p className="mt-1 text-muted-foreground">
            Keep your profile fresh to attract the right brand partnerships.
          </p>
        </div>
        <a
          href={`/creator/${profile.username}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          target="_blank"
        >
          View public profile →
        </a>
      </div>
      <ProfileEditForm profile={profile} portfolioItems={portfolioItems} />
    </main>
  );
}
