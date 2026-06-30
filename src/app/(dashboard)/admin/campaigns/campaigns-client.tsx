"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { removeCampaign } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  status: string;
  isRemoved: boolean;
  removedReason: string | null;
  createdAt: Date;
  brandProfile: {
    companyName: string | null;
    slug: string | null;
    logo: string | null;
    userId: string;
  } | null;
  _count: { applications: number };
}

interface Props {
  campaigns: Campaign[];
  total: number;
  currentPage: number;
  totalPages: number;
  currentStatus: string;
  currentSearch: string;
}

function RemoveDialog({ campaign }: { campaign: Campaign }) {
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleRemove() {
    startTransition(async () => {
      const result = await removeCampaign(campaign.id, reason);
      if (!result.success) {
        setError(result.error);
      } else {
        setOpen(false);
        setReason("");
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" disabled={campaign.isRemoved}>
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Remove
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Remove <strong>{campaign.title}</strong> from the platform. The brand will be notified.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for removal (min 10 characters)..."
            rows={3}
            className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={handleRemove} disabled={isPending || reason.length < 10} variant="destructive">
              {isPending ? "Removing..." : "Remove Campaign"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminCampaignsClient({
  campaigns,
  total,
  currentPage,
  totalPages,
  currentStatus,
  currentSearch,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    router.push(`/admin/campaigns?${params.toString()}`);
  }

  const statusColor: Record<string, string> = {
    DRAFT: "secondary", OPEN: "default", IN_REVIEW: "warning",
    ACTIVE: "success", COMPLETED: "success", CANCELLED: "destructive",
  } as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            defaultValue={currentSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") setFilter("search", (e.target as HTMLInputElement).value);
            }}
            className="pl-8"
          />
        </div>

        <div className="flex gap-1 flex-wrap">
          {["ALL", "DRAFT", "OPEN", "ACTIVE", "COMPLETED", "CANCELLED"].map((s) => (
            <Button
              key={s}
              variant={currentStatus === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("status", s)}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Campaign</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Brand</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Applications</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Removed</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{campaign.title}</span>
                    <Link href={`/campaigns/${campaign.id}`} target="_blank" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {campaign.brandProfile?.companyName ?? "Unknown"}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={(statusColor[campaign.status] ?? "secondary") as never}>
                    {campaign.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {campaign._count.applications}
                </td>
                <td className="px-4 py-3 text-center">
                  {campaign.isRemoved ? (
                    <Badge variant="destructive">Removed</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <RemoveDialog campaign={campaign} />
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No campaigns found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({total} campaigns)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              disabled={currentPage <= 1}
              onClick={() => setFilter("page", String(currentPage - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setFilter("page", String(currentPage + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
