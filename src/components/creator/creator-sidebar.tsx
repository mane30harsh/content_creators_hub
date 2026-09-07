"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  MessageSquare,
  Users,
  Handshake,
  User,
} from "lucide-react";

interface CreatorSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    avatar?: string | null;
  };
}

export function CreatorSidebar({ user }: CreatorSidebarProps) {
  const pathname = usePathname();

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems = [
    {
      label: "Home",
      href: "/creator/dashboard",
      icon: Home,
      exact: true,
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      label: "Community",
      href: "/community",
      icon: Users,
    },
    {
      label: "Collabs",
      href: "/creator/campaigns",
      icon: Handshake,
    },
    {
      label: "Profile",
      href: "/creator/profile",
      icon: User,
      isProfile: true,
    },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col justify-between border-r border-neutral-800/80 bg-[#0A0A0C] px-5 py-6 text-white shrink-0">
      {/* ── Brand Logo Header ── */}
      <div className="flex items-center gap-3">
        <Link href="/creator/dashboard" className="flex items-center gap-2 group">
          <div className="grid grid-cols-2 gap-1 w-7 h-7">
            <span className="w-3 h-3 rounded-sm bg-[#FF007A]" />
            <span className="w-3 h-3 rounded-sm bg-[#E60067]" />
            <span className="w-3 h-3 rounded-sm bg-[#FF007A]" />
            <span className="w-3 h-3 rounded-sm bg-[#FFDD00]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#FF007A] transition-colors">
            Brridge
          </span>
        </Link>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="my-auto space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : item.href === "/community"
            ? pathname.startsWith("/community") || pathname.startsWith("/feed")
            : pathname.startsWith(item.href);

          if (item.isProfile) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-base font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#FF007A]/10 text-[#FF007A]"
                    : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                }`}
              >
                <Avatar className="h-6 w-6 border border-neutral-700">
                  <AvatarImage src={user.avatar ?? user.image ?? undefined} />
                  <AvatarFallback className="text-[10px] font-bold bg-neutral-800 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-base font-semibold transition-all duration-200 ${
                isActive
                  ? "text-[#FF007A] font-bold"
                  : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-[#FF007A]" : "text-neutral-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer / Info ── */}
      <div className="text-xs text-neutral-500 font-medium">
        © 2026 Brridge Hub
      </div>
    </aside>
  );
}
