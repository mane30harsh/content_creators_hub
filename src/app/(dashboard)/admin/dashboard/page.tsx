import { requireRole } from "@/lib/auth/guards";
import { getAnalytics } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, Briefcase, Building2, FileText,
  AlertTriangle, MessageSquare, Star, TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard – Content Creators Hub",
};

export default async function AdminDashboardPage() {
  await requireRole(["ADMIN"]);
  const analytics = await getAnalytics();

  const overviewCards = [
    { label: "Total Users", value: analytics.users.total, icon: Users, href: "/admin/users", color: "text-blue-600" },
    { label: "Creators", value: analytics.users.creators, icon: ShieldIcon, href: "/admin/users?role=CREATOR", color: "text-emerald-600" },
    { label: "Brands", value: analytics.users.brands, icon: Building2, href: "/admin/users?role=BRAND", color: "text-violet-600" },
    { label: "Open Campaigns", value: analytics.campaigns.open, icon: Briefcase, href: "/admin/campaigns?status=OPEN", color: "text-amber-600" },
    { label: "Total Posts", value: analytics.content.posts, icon: FileText, href: "#", color: "text-sky-600" },
    { label: "Active Reports", value: analytics.reports.pending, icon: AlertTriangle, href: "/admin/reports?status=PENDING", color: analytics.reports.pending > 0 ? "text-red-600" : "text-muted-foreground" },
    { label: "Reviews", value: analytics.content.reviews, icon: Star, href: "#", color: "text-yellow-600" },
    { label: "Messages", value: analytics.content.messages, icon: MessageSquare, href: "#", color: "text-pink-600" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Platform overview and management.</p>
      </div>

      {/* Overview cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {overviewCards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide">
                    {label}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{value.toLocaleString()}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Campaigns by status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Campaigns by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.campaigns.byStatus.map(({ status, count }) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-muted-foreground">
                    {status.toLowerCase()}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-muted sm:w-48">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: analytics.campaigns.total > 0
                            ? `${(count / analytics.campaigns.total) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
              {analytics.campaigns.byStatus.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No campaigns yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users by role */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.users.byRole.map(({ role, count }) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-muted-foreground">
                    {role.toLowerCase()}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-muted sm:w-48">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: analytics.users.total > 0
                            ? `${(count / analytics.users.total) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Applications</p>
                <p className="text-xl font-bold">{analytics.applications.total}</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.applications.acceptanceRate}% acceptance rate
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Inactive Users</p>
                <p className="text-xl font-bold">{analytics.users.inactive}</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.users.total > 0
                    ? `${Math.round((analytics.users.inactive / analytics.users.total) * 100)}% of total`
                    : "0% of total"}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">New Users (30d)</p>
                <p className="text-xl font-bold">{analytics.users.active30d}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Pending Reports</p>
                <p className={`text-xl font-bold ${analytics.reports.pending > 0 ? "text-destructive" : ""}`}>
                  {analytics.reports.pending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed Campaigns</span>
                <span className="font-medium">{analytics.campaigns.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Accepted Applications</span>
                <span className="font-medium">{analytics.applications.accepted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Reviews</span>
                <span className="font-medium">{analytics.content.reviews}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function ShieldIcon(props: React.ComponentProps<typeof Users>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>;
}
