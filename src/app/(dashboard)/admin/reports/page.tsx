import { Suspense } from "react";
import { requireRole } from "@/lib/auth/guards";
import { getAdminReports } from "@/lib/actions/admin";
import { AdminReportsClient } from "./reports-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports – Admin – Content Creators Hub",
};

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminReportsPage({ searchParams }: Props) {
  await requireRole(["ADMIN"]);
  const params = await searchParams;

  const { reports, total, page, totalPages } = await getAdminReports({
    status: params.status,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-muted-foreground">
          {total} report{total !== 1 ? "s" : ""} · Review and resolve user reports.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>}>
        <AdminReportsClient
          reports={reports}
          total={total}
          currentPage={page}
          totalPages={totalPages}
          currentStatus={params.status ?? "ALL"}
        />
      </Suspense>
    </main>
  );
}
