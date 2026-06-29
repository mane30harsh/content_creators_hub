import Link from "next/link";
import { Search, Bookmark } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { getMyApplications } from "@/lib/actions/campaign";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/components/campaigns/application-status-badge";
import { DeliverableBadge } from "@/components/campaigns/deliverable-badge";
import { MessageUserButton } from "@/components/messages/message-user-button";

function fmtDate(d?: Date | string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const metadata = { title: "My Applications – Content Creators Hub" };

export default async function CreatorCampaignsPage() {
  await requireRole(["CREATOR", "ADMIN"]);
  const applications = await getMyApplications();

  const stats = {
    total:       applications.length,
    pending:     applications.filter((a) => a.status === "PENDING").length,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
    accepted:    applications.filter((a) => a.status === "ACCEPTED").length,
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your applications and discover new campaigns.
          </p>
        </div>
        <Button asChild>
          <Link href="/campaigns">
            <Search className="mr-1.5 h-4 w-4" />
            Browse campaigns
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Applied",      value: stats.total,       color: "" },
          { label: "Pending",      value: stats.pending,     color: "" },
          { label: "Shortlisted",  value: stats.shortlisted, color: "text-amber-600" },
          { label: "Accepted",     value: stats.accepted,    color: "text-emerald-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Applications</CardTitle>
          <CardDescription>
            All the campaigns you&apos;ve applied to.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bookmark className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium">No applications yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Find campaigns that match your niche and start applying.
              </p>
              <Button asChild className="mt-4">
                <Link href="/campaigns">Browse campaigns</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <Link
                  key={app.id}
                  href={`/campaigns/${app.campaignId}`}
                  className="block"
                >
                  <div className="rounded-lg border p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Brand */}
                        <p className="text-xs text-muted-foreground mb-1">
                          {app.campaign.brandProfile?.companyName ?? "Brand"}
                        </p>
                        {/* Campaign title */}
                        <p className="font-medium text-sm truncate">{app.campaign.title}</p>
                        {/* Deliverable */}
                        <div className="mt-1.5">
                          <DeliverableBadge
                            type={app.campaign.deliverableType}
                            count={app.campaign.deliverableCount}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <ApplicationStatusBadge status={app.status} />
                        {app.proposedRateCents && (
                          <p className="text-xs text-muted-foreground">
                            ${(app.proposedRateCents / 100).toLocaleString()}
                          </p>
                        )}
                        <MessageUserButton
                          userId={app.campaign.brandProfile.userId}
                          size="sm"
                          variant="ghost"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Applied {fmtDate(app.createdAt)}</span>
                      {app.campaign.applicationDeadline && (
                        <>
                          <span>·</span>
                          <span>Deadline {fmtDate(app.campaign.applicationDeadline)}</span>
                        </>
                      )}
                    </div>

                    {/* Status-specific callouts */}
                    {app.status === "ACCEPTED" && (
                      <p className="mt-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                        🎉 Your application was accepted!
                      </p>
                    )}
                    {app.status === "SHORTLISTED" && (
                      <p className="mt-2 rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                        ⭐ You&apos;ve been shortlisted — the brand is reviewing your application.
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
