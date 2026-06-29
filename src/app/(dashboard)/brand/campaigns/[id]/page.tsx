import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Users, Calendar, DollarSign } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { getBrandCampaignDetail } from "@/lib/actions/campaign";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DeliverableBadge } from "@/components/campaigns/deliverable-badge";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { ApplicationRow, CampaignActions } from "./actions-client";

function fmtBudget(min?: number | null, max?: number | null) {
  const fmt = (n: number) => `$${(n / 100).toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (max) return `Up to ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return "Negotiable";
}

function fmtDate(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  await requireRole(["BRAND", "ADMIN"]);
  const campaign = await getBrandCampaignDetail(id);
  if (!campaign) return { title: "Campaign Not Found" };
  return { title: `${campaign.title} – Content Creators Hub` };
}

export default async function BrandCampaignDetailPage({ params }: Props) {
  const { id } = await params;
  await requireRole(["BRAND", "ADMIN"]);
  const campaign = await getBrandCampaignDetail(id);
  if (!campaign) notFound();

  const byStatus = {
    PENDING:     campaign.applications.filter((a) => a.status === "PENDING"),
    SHORTLISTED: campaign.applications.filter((a) => a.status === "SHORTLISTED"),
    ACCEPTED:    campaign.applications.filter((a) => a.status === "ACCEPTED"),
    REJECTED:    campaign.applications.filter((a) => a.status === "REJECTED"),
    WITHDRAWN:   campaign.applications.filter((a) => a.status === "WITHDRAWN"),
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Back */}
      <Link
        href="/brand/campaigns"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        My campaigns
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{campaign.title}</h1>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Created {fmtDate(campaign.createdAt)}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {(campaign.status === "DRAFT" || campaign.status === "OPEN") && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/brand/campaigns/${id}/edit`}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
          )}
          {campaign.isPublic && campaign.status === "OPEN" && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/campaigns/${id}`} target="_blank">
                View public listing
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left — applications */}
        <div className="space-y-6">
          {/* Campaign actions */}
          <CampaignActions campaignId={id} status={campaign.status} />

          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Applications ({campaign._count.applications})
              </CardTitle>
              <CardDescription>
                Review and respond to creator applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.applications.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No applications yet.{" "}
                    {campaign.status === "DRAFT" && "Publish your campaign to start receiving applications."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Pending */}
                  {byStatus.PENDING.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Pending ({byStatus.PENDING.length})
                      </p>
                      {byStatus.PENDING.map((app) => (
                        <ApplicationRow key={app.id} app={app} />
                      ))}
                    </div>
                  )}

                  {/* Shortlisted */}
                  {byStatus.SHORTLISTED.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                        Shortlisted ({byStatus.SHORTLISTED.length})
                      </p>
                      {byStatus.SHORTLISTED.map((app) => (
                        <ApplicationRow key={app.id} app={app} />
                      ))}
                    </div>
                  )}

                  {/* Accepted */}
                  {byStatus.ACCEPTED.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        Accepted ({byStatus.ACCEPTED.length})
                      </p>
                      {byStatus.ACCEPTED.map((app) => (
                        <ApplicationRow key={app.id} app={app} />
                      ))}
                    </div>
                  )}

                  {/* Rejected */}
                  {byStatus.REJECTED.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Rejected ({byStatus.REJECTED.length})
                      </p>
                      {byStatus.REJECTED.map((app) => (
                        <ApplicationRow key={app.id} app={app} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — campaign info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-medium text-sm">
                    {fmtBudget(campaign.budgetMinCents, campaign.budgetMaxCents)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Creators needed</p>
                  <p className="font-medium text-sm">{campaign.maxAccepted}</p>
                </div>
              </div>
              {campaign.applicationDeadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="font-medium text-sm">{fmtDate(campaign.applicationDeadline)}</p>
                  </div>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Deliverable</p>
                <DeliverableBadge type={campaign.deliverableType} count={campaign.deliverableCount} />
              </div>
              {campaign.niche.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Niches</p>
                  <div className="flex flex-wrap gap-1">
                    {campaign.niche.map((n) => (
                      <span key={n} className="rounded-full border px-2 py-0.5 text-[10px]">{n}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Description
              </p>
              <p className="text-sm text-muted-foreground line-clamp-6 leading-relaxed">
                {campaign.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
