"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, CheckCheck, MessageSquare, Heart, MessageCircle, FileText, Star, UserPlus, Megaphone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecentNotifications, markAsRead } from "@/lib/actions/notification";
import type { NotificationItem } from "./types";

const TYPE_ICONS: Record<string, typeof Bell> = {
  MESSAGE_RECEIVED: MessageSquare,
  APPLICATION_RECEIVED: FileText,
  APPLICATION_UPDATED: FileText,
  CAMPAIGN_PUBLISHED: Megaphone,
  REVIEW_RECEIVED: Star,
  FOLLOW: UserPlus,
  LIKE: Heart,
  COMMENT: MessageCircle,
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRecentNotifications();
      setItems(res.items as NotificationItem[]);
      setUnreadCount(res.unreadCount);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Notifications</h3>
              <Link
                href="/notifications"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                View all
              </Link>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No notifications yet</p>
              ) : (
                items.map((item) => {
                  const Icon = TYPE_ICONS[item.type] ?? Bell;
                  const handleClick = () => { handleMarkRead(item.id); setOpen(false); };
                  const content = (
                    <>
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.body && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.body}</p>
                        )}
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {formatTimeAgo(new Date(item.createdAt))}
                        </p>
                      </div>
                      {!item.isRead && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkRead(item.id); }}
                          className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
                          title="Mark as read"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  );

                  if (item.actionUrl) {
                    return (
                      <Link
                        key={item.id}
                        href={item.actionUrl}
                        onClick={handleClick}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted",
                          !item.isRead && "bg-muted/50"
                        )}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted",
                        !item.isRead && "bg-muted/50"
                      )}
                    >
                      {content}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
