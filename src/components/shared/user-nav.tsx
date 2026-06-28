"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLE_LABELS, type AppRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface UserNavProps {
  name?: string;
  email?: string;
  image?: string;
  role: AppRole;
}

export function UserNav({ name, email, image, role }: UserNavProps) {
  const [open, setOpen] = useState(false);

  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : (email?.[0] ?? "U").toUpperCase();

  const profileHref =
    role === "CREATOR"
      ? "/creator/profile/edit"
      : role === "BRAND"
      ? "/brand/profile/edit"
      : "/admin/dashboard";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 transition-colors hover:border-border hover:bg-muted"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar className="h-7 w-7">
          <AvatarImage src={image} alt={name ?? "User"} />
          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden flex-col items-start sm:flex">
          <span className="text-sm font-medium leading-none">{name ?? "Account"}</span>
          <span className="text-[10px] text-muted-foreground">{ROLE_LABELS[role]}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* Dropdown */}
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {/* User info */}
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-semibold">{name ?? "Account"}</p>
              {email && (
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              )}
              <span className="mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {ROLE_LABELS[role]}
              </span>
            </div>

            {/* Links */}
            <div className="py-1">
              <Link
                href={profileHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-muted"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Edit Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-muted"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-border py-1">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
