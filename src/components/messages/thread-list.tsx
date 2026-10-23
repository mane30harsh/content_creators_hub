"use client";

import Link from "next/link";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface OtherParticipant {
  id: string;
  name: string;
  image: string | null;
  role: string;
  username?: string;
}

interface LastMessage {
  body: string;
  createdAt: Date;
  isMine: boolean;
}

interface Thread {
  id: string;
  subject: string | null;
  campaignId: string | null;
  updatedAt: Date;
  otherParticipants: OtherParticipant[];
  lastMessage: LastMessage | null;
  unread: boolean;
}

export function ThreadList({ threads }: { threads: Thread[] }) {

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold">No messages yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Visit a creator or brand profile to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {threads.map((thread) => {
        const other = thread.otherParticipants[0];
        const initials = other?.name
          ?.split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() ?? "?";

        return (
          <Link
            key={thread.id}
            href={`/messages/${thread.id}`}
            className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
              thread.unread ? "bg-muted/30" : ""
            }`}
          >
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={other?.image ?? undefined} alt={other?.name ?? ""} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={`truncate text-sm ${thread.unread ? "font-semibold" : "font-medium"}`}>
                  {other?.name ?? "Unknown"}
                </p>
                {thread.lastMessage && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatTime(thread.lastMessage.createdAt)}
                  </span>
                )}
              </div>

              {thread.subject && (
                <p className="truncate text-xs text-muted-foreground">{thread.subject}</p>
              )}

              <div className="flex items-center gap-1.5">
                {thread.lastMessage ? (
                  <p
                    className={`truncate text-xs ${
                      thread.unread ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {thread.lastMessage.isMine && "You: "}
                    {thread.lastMessage.body}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">No messages yet</p>
                )}
                {thread.unread && (
                  <Badge variant="default" className="h-1.5 w-1.5 shrink-0 rounded-full p-0" />
                )}
              </div>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        );
      })}
    </div>
  );
}

function formatTime(date: Date) {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
