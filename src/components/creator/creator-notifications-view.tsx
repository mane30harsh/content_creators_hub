"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, SlidersHorizontal, ChevronRight } from "lucide-react";

interface NotificationItemData {
  id: string;
  senderName: string;
  senderAvatar?: string | null;
  text: string;
  timeAgo: string;
  type: "collab" | "community" | "payment" | "request" | "general";
  actionUrl?: string;
  group: "today" | "this_week";
}

interface CreatorNotificationsViewProps {
  notifications?: NotificationItemData[];
  onCloseNotifications?: () => void;
}

const DEFAULT_NOTIFICATIONS: NotificationItemData[] = [
  {
    id: "n1",
    senderName: "gottamii",
    senderAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    text: "wants to collab with you.",
    timeAgo: "2h",
    type: "request",
    actionUrl: "/creator/campaigns",
    group: "today",
  },
  {
    id: "n2",
    senderName: "gottamii",
    senderAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    text: "added you in the fitness community.",
    timeAgo: "2h",
    type: "community",
    actionUrl: "/feed",
    group: "today",
  },
  {
    id: "n3",
    senderName: "gottamii",
    senderAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    text: "accepted your collab.",
    timeAgo: "2h",
    type: "collab",
    actionUrl: "/creator/campaigns",
    group: "today",
  },
  {
    id: "n4",
    senderName: "gottamii",
    senderAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    text: "completed payment.",
    timeAgo: "2h",
    type: "payment",
    actionUrl: "/creator/dashboard",
    group: "today",
  },
  {
    id: "n5",
    senderName: "gottamii",
    senderAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    text: "wants to collab with you.",
    timeAgo: "2h",
    type: "request",
    actionUrl: "/creator/campaigns",
    group: "this_week",
  },
  {
    id: "n6",
    senderName: "gottamii",
    senderAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    text: "added you in the fitness community.",
    timeAgo: "2h",
    type: "community",
    actionUrl: "/feed",
    group: "this_week",
  },
];

const FILTER_PILLS = [
  { label: "All", value: "all" },
  { label: "requests", value: "request" },
  { label: "collab", value: "collab" },
  { label: "community", value: "community", hasArrow: true },
];

export function CreatorNotificationsView({
  notifications = DEFAULT_NOTIFICATIONS,
  onCloseNotifications,
}: CreatorNotificationsViewProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const items = notifications.length > 0 ? notifications : DEFAULT_NOTIFICATIONS;

  const filteredItems = items.filter((item) => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  const todayItems = filteredItems.filter((i) => i.group === "today");
  const thisWeekItems = filteredItems.filter((i) => i.group === "this_week");

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between py-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">Notifications</h2>

        <div className="flex items-center gap-3">
          <button
            onClick={onCloseNotifications}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF007A] text-white shadow-lg shadow-[#FF007A]/30 transition-all hover:bg-[#E60067]"
            title="Toggle Notifications"
          >
            <Bell className="h-5 w-5 fill-white" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-[#121216] text-neutral-300 hover:border-neutral-700 hover:text-white transition-all"
            title="Filter options"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Category Filter Pills ── */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {FILTER_PILLS.map((pill) => {
          const isSelected = activeFilter === pill.value;
          return (
            <button
              key={pill.label}
              onClick={() => setActiveFilter(pill.value)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-6 py-2 text-sm font-semibold transition-all duration-200 ${
                isSelected
                  ? "bg-[#FF007A] text-white shadow-md shadow-[#FF007A]/20"
                  : "border border-neutral-800 bg-[#121215] text-neutral-300 hover:border-neutral-700 hover:text-white"
              }`}
            >
              <span>{pill.label}</span>
              {pill.hasArrow && !isSelected && (
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Notifications List Sections ── */}
      <div className="space-y-6 pt-2">
        {/* Today Section */}
        {todayItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-300">Today</h3>
            <div className="space-y-3">
              {todayItems.map((item) => (
                <NotificationRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {todayItems.length > 0 && thisWeekItems.length > 0 && (
          <div className="my-6 border-b border-neutral-800/80" />
        )}

        {/* This Week Section */}
        {thisWeekItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-300">This week</h3>
            <div className="space-y-3">
              {thisWeekItems.map((item) => (
                <NotificationRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="rounded-3xl border border-neutral-800/80 bg-[#101014] p-12 text-center text-neutral-400">
            <p className="text-base font-semibold text-white">No notifications</p>
            <p className="mt-1 text-sm text-neutral-500">
              You are all caught up for this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationRow({ item }: { item: NotificationItemData }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-transparent p-2 transition-colors hover:border-neutral-800/80 hover:bg-[#121216]">
      <div className="flex items-center gap-3 overflow-hidden">
        <Avatar className="h-10 w-10 border border-neutral-800 bg-neutral-900 shrink-0">
          <AvatarImage src={item.senderAvatar ?? undefined} />
          <AvatarFallback className="bg-neutral-800 text-xs font-bold text-white">
            {item.senderName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <p className="text-sm text-neutral-200 leading-snug truncate">
          <span className="font-bold text-white">{item.senderName}</span>{" "}
          {item.text}{" "}
          <span className="text-xs font-normal text-neutral-400">{item.timeAgo}</span>
        </p>
      </div>

      <Link
        href={item.actionUrl || "/creator/dashboard"}
        className="shrink-0 rounded-full border border-neutral-700 bg-transparent px-6 py-1.5 text-xs font-bold text-white hover:bg-neutral-800 hover:border-neutral-600 transition-all"
      >
        View
      </Link>
    </div>
  );
}
