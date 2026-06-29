"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewApplication, publishCampaign, closeCampaign } from "@/lib/actions/campaign";
import { ApplicationStatusBadge } from "@/components/campaigns/application-status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Application {
  id: string;
  status: string;
  pitch: string | null;
  proposedRateCents: number | null;
  createdAt: Date;
  creatorProfile: {
    displayName: string | null;
    username: string | null;
    avatar: string | null;
    niche: string[];
    instagramFollowers: number | null;
    youtubeSubscribers: number | null;
    tiktokFollowers: number | null;
    twitterFollowers: number | null;
    avgRating: number | null;
    reviewCount: number;
  };
}

export function ApplicationRow({ app }: { app: Application }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const totalFollowers =
    (app.creatorProfile.instagramFollowers ?? 0) +
    (app.creatorProfile.youtubeSubscribers ?? 0) +
    (app.creatorProfile.tiktokFollowers ?? 0) +
    (app.creatorProfile.twitterFollowers ?? 0);

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  };

  function review(status: "SHORTLISTED" | "ACCEPTED" | "REJECTED") {
    startTransition(async () => {
      const result = await reviewApplication({ applicationId: app.id, status });
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {app.creatorProfile.displayName?.[0] ?? app.creatorProfile.username?.[0] ?? "?"}
          </div>
          <div>
            <p className="font-medium text-sm">
              {app.creatorProfile.displayName ?? app.creatorProfile.username ?? "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">
              {fmt(totalFollowers)} total reach
              {app.creatorProfile.avgRating && ` · ★ ${app.creatorProfile.avgRating.toFixed(1)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ApplicationStatusBadge status={app.status} />
          {app.proposedRateCents && (
            <Badge variant="outline">${(app.proposedRateCents / 100).toLocaleString()}</Badge>
          )}
        </div>
      </div>

      {app.creatorProfile.niche.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {app.creatorProfile.niche.slice(0, 4).map((n) => (
            <span key={n} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{n}</span>
          ))}
        </div>
      )}

      {app.pitch && (
        <p className="text-sm text-muted-foreground line-clamp-3 border-l-2 border-border pl-3">
          {app.pitch}
        </p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {app.status === "PENDING" && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => review("SHORTLISTED")}>
            Shortlist
          </Button>
          <Button size="sm" disabled={isPending} onClick={() => review("ACCEPTED")}>
            Accept
          </Button>
          <Button size="sm" variant="destructive" disabled={isPending} onClick={() => review("REJECTED")}>
            Reject
          </Button>
        </div>
      )}
      {app.status === "SHORTLISTED" && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" disabled={isPending} onClick={() => review("ACCEPTED")}>Accept</Button>
          <Button size="sm" variant="destructive" disabled={isPending} onClick={() => review("REJECTED")}>Reject</Button>
        </div>
      )}
    </div>
  );
}

interface CampaignActionsProps {
  campaignId: string;
  status: string;
}

export function CampaignActions({ campaignId, status }: CampaignActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function publish() {
    startTransition(async () => {
      const result = await publishCampaign(campaignId);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function close(action: "COMPLETED" | "CANCELLED") {
    startTransition(async () => {
      const result = await closeCampaign(campaignId, action);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
      {status === "DRAFT" && (
        <Button size="sm" disabled={isPending} onClick={publish}>
          Publish campaign
        </Button>
      )}
      {(status === "OPEN" || status === "ACTIVE") && (
        <>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => close("COMPLETED")}>
            Mark completed
          </Button>
          <Button size="sm" variant="destructive" disabled={isPending} onClick={() => close("CANCELLED")}>
            Cancel campaign
          </Button>
        </>
      )}
    </div>
  );
}
