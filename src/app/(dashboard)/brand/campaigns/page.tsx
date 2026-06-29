import Link from "next/link";
import { Plus, Megaphone } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { getMyBrandCampaigns } from "@/lib/actions/campaign";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";

export const metadata = { title: "My Campaigns – Content Creators Hub" };

export default async function BrandCampaignsPage() {
  await requireRole(["BRAND", "ADMIN"]);
  const campaigns = await getMyBrandCampaigns();

  const stats = {
    total:     campaigns.length,
    open:      campaigns.filter((c) => c.status === "OPEN").length,
    active:    campaigns.filter((c) => c.status === "ACTIVE").length,
    completed: campaigns.filter((c) => c.status === "COMPLETED").length,
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your influencer campaigns.
          </p>
        </div>
        <Button asChild>
          <Link href="/brand/campaigns/new">
            <Plus className="mr-1.5 h-4 w-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Open", value: stats.open },
          { label: "Active", value: stats.active },
          { label: "Completed", value: stats.completed },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List */}
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">No campaigns yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first campaign to start finding creators.
          </p>
          <Button asChild className="mt-4">
            <Link href="/brand/campaigns/new">Create a campaign</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}`} className="block">
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{campaign.title}</p>
                      <CampaignStatusBadge status={campaign.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {campaign._count.applications} application{campaign._count.applications !== 1 ? "s" : ""}
                      {campaign.applicationDeadline && (
                        <> · Deadline {new Date(campaign.applicationDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {new Date(campaign.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
