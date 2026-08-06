import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar, Users, DollarSign, Globe, Languages,
  ArrowLeft, Building2, CheckCircle2, Clock
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getPublicCampaignDetail } from "@/lib/actions/campaign";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeliverableBadge } from "@/components/campaigns/deliverable-badge";
import { ApplyForm } from "@/components/campaigns/apply-form";
import { ApplicationStatusBadge } from "@/components/campaigns/application-status-badge";
import { MessageUserButton } from "@/components/messages/message-user-button";
import { checkReviewEligibility } from "@/lib/actions/review";

function fmtBudget(min?: number | null, max?: number | null) {
  const fmt = (n: number) => `$${(n / 100).toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (max) return `Up to ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return "Negotiable";
}

function fmtDate(d?: Date | string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function fmtFollowers(n?: number | null) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const campaign = await getPublicCampaignDetail(id);
  if (!campaign) return { title: "Campaign Not Found" };
  return { title: `${campaign.title} – Content Creators Hub` };
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;
  const [campaign, session] = await Promise.all([
    getPublicCampaignDetail(id),
    auth(),
  ]);

  if (!campaign) notFound();

  const isCreator = session?.user?.role === "CREATOR";
  const isBrand   = session?.user?.role === "BRAND";

  // Check if creator already applied
  let existingApplication = null;
  if (isCreator && session?.user?.id) {
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (creatorProfile) {
      existingApplication = await prisma.campaignApplication.findUnique({
        where: {
          campaignId_creatorProfileId: {
            campaignId: id,
            creatorProfileId: creatorProfile.id,
          },
        },
        select: { status: true, createdAt: true },
      });
    }
  }

  // Check review eligibility
  let canReview = false;
  if (session?.user?.id && campaign.status === "COMPLETED") {
    const eligibility = await checkReviewEligibility(id);
    canReview = eligibility.eligible;
  }

  const deadline = campaign.applicationDeadline ? new Date(campaign.applicationDeadline) : null;
  const daysLeft = deadline
    ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isDeadlinePassed = daysLeft !== null && daysLeft < 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Back */}
      <Link
        href="/campaigns"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left — campaign detail */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            {campaign.brandProfile && (
              <div className="mb-3 flex items-center gap-2">
                {campaign.brandProfile.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={campaign.brandProfile.logo}
                    alt={campaign.brandProfile.companyName ?? "Brand"}
                    className="h-8 w-8 rounded object-cover border"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-sm font-bold">
                    {campaign.brandProfile.companyName?.[0] ?? "B"}
                  </div>
                )}
                <div>
                  <Link
                    href={`/brand/${campaign.brandProfile.slug}`}
                    className="text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    {campaign.brandProfile.companyName}
                    {campaign.brandProfile.isVerified && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
                    )}
                  </Link>
                  {campaign.brandProfile.industry && (
                    <p className="text-xs text-muted-foreground">{campaign.brandProfile.industry}</p>
                  )}
                </div>
              </div>
            )}

            <h1 className="text-2xl font-bold">{campaign.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <DeliverableBadge type={campaign.deliverableType} count={campaign.deliverableCount} />
              {campaign.isFeatured && <Badge variant="default">Featured</Badge>}
              <span className="text-xs text-muted-foreground">
                {campaign._count.applications} application{campaign._count.applications !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Cover image */}
          {campaign.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={campaign.coverImage}
              alt={campaign.title}
              className="w-full rounded-xl object-cover max-h-64"
            />
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About this campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {campaign.description}
              </p>
              {campaign.deliverableNotes && (
                <>
                  <Separator className="my-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Deliverable requirements
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {campaign.deliverableNotes}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Who they&apos;re looking for</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.niche.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Niches</p>
                  <div className="flex flex-wrap gap-1.5">
                    {campaign.niche.map((n) => (
                      <span key={n} className="rounded-full border px-2.5 py-0.5 text-xs">{n}</span>
                    ))}
                  </div>
                </div>
              )}

              {(campaign.minFollowers || campaign.maxFollowers) && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {campaign.minFollowers && campaign.maxFollowers
                      ? `${fmtFollowers(campaign.minFollowers)} – ${fmtFollowers(campaign.maxFollowers)} followers`
                      : campaign.minFollowers
                      ? `${fmtFollowers(campaign.minFollowers)}+ followers`
                      : `Up to ${fmtFollowers(campaign.maxFollowers)} followers`}
                  </span>
                </div>
              )}

              {campaign.country.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{campaign.country.join(", ")}</span>
                </div>
              )}

              {campaign.language.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Languages className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{campaign.language.join(", ")}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brand info */}
          {campaign.brandProfile?.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> About the brand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{campaign.brandProfile.bio}</p>
                {campaign.brandProfile.websiteUrl && (
                  <a
                    href={campaign.brandProfile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-primary hover:underline"
                  >
                    {campaign.brandProfile.websiteUrl}
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — sidebar */}
        <div className="space-y-4">
          {/* Budget + timeline card */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-semibold">
                    {fmtBudget(campaign.budgetMinCents, campaign.budgetMaxCents)}
                  </p>
                </div>
              </div>

              <Separator />

              {deadline && (
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${isDeadlinePassed ? "text-destructive" : daysLeft! <= 3 ? "text-amber-500" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Application deadline</p>
                    <p className={`font-medium text-sm ${isDeadlinePassed ? "text-destructive" : daysLeft! <= 3 ? "text-amber-600" : ""}`}>
                      {isDeadlinePassed ? "Deadline passed" : daysLeft === 0 ? "Ends today" : `${fmtDate(deadline)} (${daysLeft}d left)`}
                    </p>
                  </div>
                </div>
              )}

              {campaign.campaignStartDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Campaign dates</p>
                    <p className="text-sm">
                      {fmtDate(campaign.campaignStartDate)}
                      {campaign.campaignEndDate && ` → ${fmtDate(campaign.campaignEndDate)}`}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Creators needed</p>
                  <p className="font-medium text-sm">{campaign.maxAccepted}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apply card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Apply to this campaign</CardTitle>
              <CardDescription>
                Write a pitch explaining why you&apos;re the right fit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {existingApplication ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Your application:</span>
                    <ApplicationStatusBadge status={existingApplication.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Applied {fmtDate(existingApplication.createdAt)}
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/creator/campaigns">View my applications</Link>
                  </Button>
                </div>
              ) : isCreator && !isDeadlinePassed ? (
                <ApplyForm campaignId={id} campaignTitle={campaign.title} />
              ) : isBrand ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Brands cannot apply to campaigns.
                </p>
              ) : isDeadlinePassed ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Applications are now closed.
                </p>
              ) : (
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href={`/login?callbackUrl=/campaigns/${id}`}>
                      Sign in to apply
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/signup">Create a creator account</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message brand */}
          {campaign.brandProfile?.userId && isCreator && (
            <MessageUserButton
              userId={campaign.brandProfile.userId}
              label="Message Brand"
              className="w-full"
            />
          )}

          {/* Write review */}
          {canReview && (
            <Button asChild className="w-full">
              <Link href={`/reviews/new/${id}`}>Write a Review</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
