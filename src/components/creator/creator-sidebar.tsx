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
    <aside className="sticky top-0 flex h-screen w-72 flex-col bg-[#0A0A0A] pl-14 pr-6 pt-7 text-white shrink-0">
      {/* ── Brand Logo (Figma Group 1171275230: #FAFF00 & #FF006D) ── */}
      <div className="mb-20">
        <Link href="/creator/dashboard" className="inline-block group" aria-label="Brridge Home">
          <div className="grid grid-cols-2 gap-2 w-10 h-10">
            <span className="w-4 h-4 rounded-full bg-[#FAFF00] transition-transform group-hover:scale-105" />
            <span className="w-4 h-4 rounded-none bg-[#FF006D] transition-transform group-hover:scale-105" />
            <span className="w-4 h-4 rounded-none bg-[#FF006D] transition-transform group-hover:scale-105" />
            <span className="w-4 h-4 rounded-full bg-[#FAFF00] transition-transform group-hover:scale-105" />
          </div>
        </Link>
      </div>

      {/* ── Vertical Navigation Links (Exact Figma: 22px, font-500, letter-spacing -0.6px) ── */}
      <nav className="space-y-4">
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
                className={`flex items-center gap-[15px] px-5 py-2 text-[22px] font-medium leading-8 tracking-[-0.6px] transition-colors duration-150 ${
                  isActive
                    ? "text-[#FF006D]"
                    : "text-white hover:text-neutral-200"
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
              className={`flex items-center gap-[15px] px-5 py-2 text-[22px] font-medium leading-8 tracking-[-0.6px] transition-colors duration-150 ${
                isActive
                  ? "text-[#FF006D]"
                  : "text-white hover:text-neutral-200"
              }`}
            >
              {Icon && (
                <Icon
                  className={`h-6 w-6 shrink-0 ${
                    isActive ? "text-[#FF006D]" : "text-white"
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
