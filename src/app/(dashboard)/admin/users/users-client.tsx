"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toggleUserActive, toggleUserFeatured } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Shield, ShieldOff, Star, StarOff, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  _count: { posts: number; reportsReceived: number };
}

interface Props {
  users: User[];
  total: number;
  currentPage: number;
  totalPages: number;
  currentRole: string;
  currentSearch: string;
}

export function AdminUsersClient({
  users,
  total,
  currentPage,
  totalPages,
  currentRole,
  currentSearch,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    router.push(`/admin/users?${params.toString()}`);
  }

  function handleToggleActive(userId: string, current: boolean) {
    const reason = current ? "Reactivated by admin" : "Deactivated by admin";
    startTransition(async () => {
      const result = await toggleUserActive(userId, reason);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function handleToggleFeatured(userId: string) {
    startTransition(async () => {
      const result = await toggleUserFeatured(userId);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            defaultValue={currentSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") setFilter("search", (e.target as HTMLInputElement).value);
            }}
            className="pl-8"
          />
        </div>

        <div className="flex gap-1">
          {["ALL", "CREATOR", "BRAND", "ADMIN"].map((role) => (
            <Button
              key={role}
              variant={currentRole === role ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("role", role)}
            >
              {role === "ALL" ? "All" : role.charAt(0) + role.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Posts</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Reports</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Featured</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{user.name ?? "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={user.isActive ? "success" : "destructive"}>
                    {user.isActive ? "Active" : "Banned"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">{user._count.posts}</td>
                <td className="px-4 py-3 text-center text-muted-foreground">{user._count.reportsReceived}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleFeatured(user.id)}
                    className="transition-colors hover:text-yellow-500"
                  >
                    {user.isFeatured ? (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant={user.isActive ? "destructive" : "outline"}
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      disabled={isPending}
                    >
                      {user.isActive ? (
                        <><ShieldOff className="mr-1 h-3.5 w-3.5" /> Deactivate</>
                      ) : (
                        <><Shield className="mr-1 h-3.5 w-3.5" /> Activate</>
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({total} users)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setFilter("page", String(currentPage - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
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
