import { requireRole } from "@/lib/auth/guards";
import { getAnalytics, getAdminLogs } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Briefcase, FileText, Activity, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics – Admin – Content Creators Hub",
};

export default async function AdminAnalyticsPage() {
  await requireRole(["ADMIN"]);
  const analytics = await getAnalytics();
  const { logs } = await getAdminLogs(1, 15);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Platform metrics and audit trail.</p>
      </div>

      {/* KPI row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wide">Acceptance Rate</p>
            </div>
            <p className="text-3xl font-bold">{analytics.applications.acceptanceRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wide">New Users (30d)</p>
            </div>
            <p className="text-3xl font-bold">{analytics.users.active30d}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Briefcase className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wide">Completed Campaigns</p>
            </div>
            <p className="text-3xl font-bold">{analytics.campaigns.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wide">Total Posts</p>
            </div>
            <p className="text-3xl font-bold">{analytics.content.posts}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Campaigns breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Campaign Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.campaigns.byStatus.map(({ status, count }) => (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{status.toLowerCase()}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: analytics.campaigns.total > 0
                          ? `${(count / analytics.campaigns.total) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
              {analytics.campaigns.byStatus.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.users.byRole.map(({ role, count }) => (
                <div key={role}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{role.toLowerCase()}s</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: analytics.users.total > 0
                          ? `${(count / analytics.users.total) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{analytics.applications.total}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{analytics.applications.accepted}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Acceptance Rate</p>
                <p className="text-2xl font-bold">{analytics.applications.acceptanceRate}%</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Reviews</p>
                <p className="text-2xl font-bold">{analytics.content.reviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent admin actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Admin Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {log.action.replace(/_/g, " ").toLowerCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {log.admin.name ?? log.admin.email}
                      {log.target && ` → ${log.target.name ?? log.target.email}`}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {fmtDate(log.createdAt)}
                  </span>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No admin actions yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
