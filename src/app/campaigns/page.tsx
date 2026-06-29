import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { getPublicCampaigns } from "@/lib/actions/campaign";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { NICHES } from "@/lib/validations/creator-profile";
import { DELIVERABLE_TYPE_LABELS } from "@/lib/validations/campaign";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Browse Campaigns – Content Creators Hub" };

interface PageProps {
  searchParams: Promise<{
    niche?: string;
    type?: string;
    search?: string;
    page?: string;
  }>;
}

async function CampaignGrid({ searchParams }: PageProps) {
  const params = await searchParams;
  const { campaigns, total, totalPages, page } = await getPublicCampaigns({
    niche:            params.niche,
    deliverableType:  params.type,
    search:           params.search,
    page:             params.page ? Number(params.page) : 1,
  });

  if (campaigns.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <p className="text-lg font-medium">No campaigns found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="col-span-full mb-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} campaign{total !== 1 ? "s" : ""} found
        </p>
      </div>

      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} variant="discover" />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="col-span-full flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/campaigns?${new URLSearchParams({ ...params, page: String(p) })}`}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors ${
                p === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default async function CampaignsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Campaigns</h1>
        <p className="mt-1 text-muted-foreground">
          Find brand campaigns that match your niche and apply with a single pitch.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-3">
        {/* Search */}
        <form method="GET" action="/campaigns" className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={params.search}
              placeholder="Search campaigns…"
              className="pl-9 w-60"
            />
          </div>
          {params.niche && <input type="hidden" name="niche" value={params.niche} />}
          {params.type  && <input type="hidden" name="type"  value={params.type} />}
          <Button type="submit" variant="outline">Search</Button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar filters */}
        <aside className="space-y-6">
          {/* Niche filter */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Niche
            </p>
            <div className="space-y-1">
              <Link
                href={`/campaigns?${new URLSearchParams({ ...params, niche: "" }).toString()}`}
                className={`block rounded-md px-2 py-1 text-sm transition-colors ${
                  !params.niche ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent"
                }`}
              >
                All niches
              </Link>
              {NICHES.map((niche) => (
                <Link
                  key={niche}
                  href={`/campaigns?${new URLSearchParams({ ...params, niche }).toString()}`}
                  className={`block rounded-md px-2 py-1 text-sm transition-colors ${
                    params.niche === niche
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent text-muted-foreground"
                  }`}
                >
                  {niche}
                </Link>
              ))}
            </div>
          </div>

          {/* Deliverable type filter */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Platform
            </p>
            <div className="space-y-1">
              <Link
                href={`/campaigns?${new URLSearchParams({ ...params, type: "" }).toString()}`}
                className={`block rounded-md px-2 py-1 text-sm transition-colors ${
                  !params.type ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent"
                }`}
              >
                All platforms
              </Link>
              {Object.entries(DELIVERABLE_TYPE_LABELS).map(([val, label]) => (
                <Link
                  key={val}
                  href={`/campaigns?${new URLSearchParams({ ...params, type: val }).toString()}`}
                  className={`block rounded-md px-2 py-1 text-sm transition-colors ${
                    params.type === val
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent text-muted-foreground"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Campaign grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 content-start">
          <Suspense fallback={
            <div className="col-span-full py-20 text-center text-muted-foreground text-sm">
              Loading campaigns…
            </div>
          }>
            <CampaignGrid searchParams={Promise.resolve(params)} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
