"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  MessageCircle,
  Users,
  UserPlus,
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
      icon: MessageCircle,
    },
    {
      label: "Community",
      href: "/community",
      icon: Users,
    },
    {
      label: "Collabs",
      href: "/creator/campaigns",
      icon: UserPlus,
    },
    {
      label: "Profile",
      href: "/creator/profile",
      icon: null,
      isProfile: true,
    },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col bg-[#000000] px-8 py-8 text-white shrink-0">
      {/* ── Brand Logo (4 Rounded Squares: Pink, Pink, Pink, Yellow) ── */}
      <div className="mb-16">
        <Link href="/creator/dashboard" className="inline-block group" aria-label="Brridge Home">
          <div className="grid grid-cols-2 gap-1.5 w-7 h-7">
            <span className="w-3 h-3 rounded-[3px] bg-[#FF007A] transition-transform group-hover:scale-105" />
            <span className="w-3 h-3 rounded-[3px] bg-[#FF007A] transition-transform group-hover:scale-105" />
            <span className="w-3 h-3 rounded-[3px] bg-[#FF007A] transition-transform group-hover:scale-105" />
            <span className="w-3 h-3 rounded-[3px] bg-[#FFDD00] transition-transform group-hover:scale-105" />
          </div>
        </Link>
      </div>

      {/* ── Vertical Navigation Links ── */}
      <nav className="space-y-7">
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
                className={`flex items-center gap-4 text-base font-semibold transition-colors duration-150 ${
                  isActive
                    ? "text-[#FF007A]"
                    : "text-neutral-200 hover:text-white"
                }`}
              >
                <Avatar className="h-6 w-6 border border-neutral-700 shrink-0">
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
              className={`flex items-center gap-4 text-base font-semibold transition-colors duration-150 ${
                isActive
                  ? "text-[#FF007A]"
                  : "text-neutral-200 hover:text-white"
              }`}
            >
              {Icon && (
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    isActive ? "text-[#FF007A]" : "text-neutral-300"
                  }`}
                />
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
