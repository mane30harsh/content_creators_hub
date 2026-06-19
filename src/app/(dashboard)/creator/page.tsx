import { requireRole } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CreatorDashboardPage() {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Creator Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Welcome, {user.name ?? user.email}.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your space</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Creator-specific tools (campaigns, content, earnings) go here.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
