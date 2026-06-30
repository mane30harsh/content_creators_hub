"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveReport } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

interface Report {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: Date;
  reporter: { id: string; name: string | null; email: string; image: string | null };
  reported: { id: string; name: string | null; email: string; image: string | null; role: string; isActive: boolean };
}

interface Props {
  reports: Report[];
  total: number;
  currentPage: number;
  totalPages: number;
  currentStatus: string;
}

const STATUS_VARIANTS: Record<string, string> = {
  PENDING: "destructive",
  UNDER_REVIEW: "warning",
  RESOLVED: "success",
  DISMISSED: "secondary",
};

function ResolveDialog({ report }: { report: Report }) {
  const [resolution, setResolution] = useState("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleResolve(action: "RESOLVED" | "DISMISSED") {
    startTransition(async () => {
      const result = await resolveReport(report.id, action, resolution || undefined);
      if (!result.success) setError(result.error);
      else { setOpen(false); setResolution(""); router.refresh(); }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={report.status !== "PENDING" && report.status !== "UNDER_REVIEW"}>
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Review Report
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
            <p><span className="font-medium">Reported:</span> {report.reported.name ?? report.reported.email} ({report.reported.role})</p>
            <p><span className="font-medium">Reporter:</span> {report.reporter.name ?? report.reporter.email}</p>
            <p><span className="font-medium">Reason:</span> <Badge variant="destructive">{report.reason}</Badge></p>
            {report.referenceType && (
              <p><span className="font-medium">Content:</span> {report.referenceType}{report.referenceId ? ` (#${report.referenceId.slice(0, 8)})` : ""}</p>
            )}
          </div>

          {report.details && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Details</p>
              <p className="text-sm bg-muted/30 rounded-lg p-3">{report.details}</p>
            </div>
          )}

          {!report.reported.isActive && (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              This user&apos;s account is already deactivated.
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Resolution notes (optional)
            </label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Add notes about the resolution..."
              rows={2}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={() => handleResolve("RESOLVED")} disabled={isPending}>
              Resolve
            </Button>
            <Button onClick={() => handleResolve("DISMISSED")} variant="outline" disabled={isPending}>
              Dismiss
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminReportsClient({
  reports,
  total,
  currentPage,
  totalPages,
  currentStatus,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    router.push(`/admin/reports?${params.toString()}`);
  }

  function fmtDate(d: Date) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {["ALL", "PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED"].map((s) => (
          <Button
            key={s}
            variant={currentStatus === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("status", s)}
          >
            {s === "ALL" ? "All" : s === "UNDER_REVIEW" ? "In Review" : s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={(STATUS_VARIANTS[report.status] ?? "secondary") as never}>
                    {report.status}
                  </Badge>
                  <Badge variant="destructive">{report.reason}</Badge>
                  <span className="text-xs text-muted-foreground">{fmtDate(report.createdAt)}</span>
                </div>
                <p className="text-sm">
                  <span className="font-medium">{report.reporter.name ?? report.reporter.email}</span>
                  {" reported "}
                  <span className="font-medium">{report.reported.name ?? report.reported.email}</span>
                  {report.referenceType && (
                    <> regarding <Badge variant="outline">{report.referenceType}</Badge></>
                  )}
                </p>
                {report.details && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{report.details}</p>
                )}
              </div>
              <ResolveDialog report={report} />
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No reports found.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages} ({total} reports)</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1}
              onClick={() => setFilter("page", String(currentPage - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages}
              onClick={() => setFilter("page", String(currentPage + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
