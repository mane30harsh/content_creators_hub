import { Suspense } from "react";
import { requireRole } from "@/lib/auth/guards";
import { getAdminUsers } from "@/lib/actions/admin";
import { AdminUsersClient } from "./users-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Users – Admin – Content Creators Hub",
};

interface Props {
  searchParams: Promise<{ role?: string; search?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  await requireRole(["ADMIN"]);
  const params = await searchParams;

  const { users, total, page, totalPages } = await getAdminUsers({
    role: params.role,
    search: params.search,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-muted-foreground">
          {total} user{total !== 1 ? "s" : ""} · Manage accounts and permissions.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>}>
        <AdminUsersClient
          users={users}
          total={total}
          currentPage={page}
          totalPages={totalPages}
          currentRole={params.role ?? "ALL"}
          currentSearch={params.search ?? ""}
        />
      </Suspense>
    </main>
  );
}
