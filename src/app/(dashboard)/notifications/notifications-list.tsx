"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCheck, MessageSquare, Heart, MessageCircle, FileText, Star, UserPlus, Megaphone, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { markAsRead, getNotifications } from "@/lib/actions/notification";
import { Button } from "@/components/ui/button";
import type { NotificationItem } from "@/components/notifications/types";

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

interface Props {
  initialItems: NotificationItem[];
  initialCursor: string | null;
}

export function NotificationsList({ initialItems, initialCursor }: Props) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  async function handleLoadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await getNotifications({ cursor });
      setItems((prev) => [...prev, ...(res.data as NotificationItem[])]);
      setCursor(res.nextCursor);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Bell className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="font-medium">No notifications yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Notifications will appear here when someone interacts with you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = TYPE_ICONS[item.type] ?? Bell;
        const handleClick = () => handleMarkRead(item.id);
        const content = (
          <>
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className={cn("text-sm", !item.isRead && "font-semibold")}>{item.title}</p>
                {!item.isRead && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkRead(item.id); }}
                    className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {item.body && (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.body}</p>
              )}
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {formatDate(new Date(item.createdAt))}
              </p>
            </div>
          </>
        );

        if (item.actionUrl) {
          return (
            <Link
              key={item.id}
              href={item.actionUrl}
              onClick={handleClick}
              className={cn(
                "flex items-start gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-muted",
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
              "flex items-start gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-muted",
              !item.isRead && "bg-muted/50"
            )}
          >
            {content}
          </div>
        );
      })}

      {cursor && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
