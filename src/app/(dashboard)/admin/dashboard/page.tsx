import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Building2, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard – Content Creators Hub",
};

export default async function AdminDashboardPage() {
  await requireRole(["ADMIN"]);

  const [userCount, creatorCount, brandCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CREATOR" } }),
    prisma.user.count({ where: { role: "BRAND" } }),
  ]);

  const stats = [
    { label: "Total Users",    value: userCount,    icon: Users },
    { label: "Creators",       value: creatorCount, icon: ShieldCheck },
    { label: "Brands",         value: brandCount,   icon: Building2 },
    { label: "Active Campaigns", value: 0,          icon: Briefcase },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Platform overview and management.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <CardTitle className="text-xs font-semibold uppercase tracking-wide">
                  {label}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
