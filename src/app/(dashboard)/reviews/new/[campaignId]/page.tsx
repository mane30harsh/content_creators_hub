import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkReviewEligibility } from "@/lib/actions/review";
import { ReviewForm } from "@/components/reviews/review-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ campaignId: string }>;
}

export default async function NewReviewPage({ params }: Props) {
  const { campaignId } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { title: true },
  });

  if (!campaign) notFound();

  const eligibility = await checkReviewEligibility(campaignId);

  if (!eligibility.eligible) {
    redirect(`/campaigns/${campaignId}?error=${encodeURIComponent(eligibility.reason)}`);
  }

  const subjectName = eligibility.authorRole === "BRAND"
    ? (await prisma.user.findUnique({
        where: { id: eligibility.subjectId },
        select: {
          creatorProfile: { select: { displayName: true, username: true } },
        },
      }))?.creatorProfile
    : await prisma.brandProfile.findUnique({
        where: { userId: eligibility.subjectId },
        select: { companyName: true },
      });

  const displayName = eligibility.authorRole === "BRAND"
    ? (subjectName as { displayName?: string | null; username?: string | null } | undefined)?.displayName
      ?? (subjectName as { username?: string | null } | undefined)?.username
      ?? "Creator"
    : (subjectName as { companyName?: string | null } | undefined)?.companyName ?? "Brand";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href={`/campaigns/${campaignId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaign
      </Link>

      <h1 className="text-2xl font-bold mb-1">Write a Review</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {campaign.title}
      </p>

      <div className="rounded-xl border border-border bg-card p-6">
        <ReviewForm
          campaignId={campaignId}
          subjectId={eligibility.subjectId}
          authorRole={eligibility.authorRole}
          subjectName={displayName}
        />
      </div>
    </main>
  );
}
