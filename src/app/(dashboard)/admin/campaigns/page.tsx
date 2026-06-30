import { Suspense } from "react";
import { requireRole } from "@/lib/auth/guards";
import { getAdminCampaigns } from "@/lib/actions/admin";
import { AdminCampaignsClient } from "./campaigns-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Campaigns – Admin – Content Creators Hub",
};

interface Props {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

export default async function AdminCampaignsPage({ searchParams }: Props) {
  await requireRole(["ADMIN"]);
  const params = await searchParams;

  const { campaigns, total, page, totalPages } = await getAdminCampaigns({
    status: params.status,
    search: params.search,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="mt-1 text-muted-foreground">
          {total} campaign{total !== 1 ? "s" : ""} · Moderate and manage listings.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>}>
        <AdminCampaignsClient
          campaigns={campaigns}
          total={total}
          currentPage={page}
          totalPages={totalPages}
          currentStatus={params.status ?? "ALL"}
          currentSearch={params.search ?? ""}
        />
      </Suspense>
    </main>
  );
}
