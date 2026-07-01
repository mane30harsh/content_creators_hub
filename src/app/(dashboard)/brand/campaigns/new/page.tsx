import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { BackButton } from "@/components/shared/back-button";

export const metadata = { title: "New Campaign – Content Creators Hub" };

export default async function NewCampaignPage() {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, slug: true },
  });

  if (!brandProfile?.slug) {
    redirect("/brand/onboarding");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <BackButton label="Back to campaigns" href="/brand/campaigns" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create a campaign</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details below. You can save as a draft and publish later.
        </p>
      </div>
      <CampaignForm mode="create" />
    </main>
  );
}
