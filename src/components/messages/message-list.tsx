"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageItem {
  id: string;
  senderId: string;
  body: string;
  createdAt: Date;
  isMe: boolean;
}

export function MessageList({
  messages,
  otherParticipant,
}: {
  messages: MessageItem[];
  otherParticipant: { name: string; image: string | null };
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      {messages.map((msg) => {
        const isGroup = !msg.isMe;
        const initials = (otherParticipant.name ?? "?")
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}
          >
            {isGroup && (
              <Avatar className="mt-1 h-6 w-6 shrink-0">
                <AvatarImage src={otherParticipant.image ?? undefined} />
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
            )}

            <div className={`max-w-[75%] ${msg.isMe ? "items-end" : "items-start"} flex flex-col`}>
              <div
                className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.body}
              </div>
              <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">
                {formatTime(msg.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

function formatTime(date: Date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  if (days === 0) return time;
  if (days === 1) return `Yesterday at ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ` at ${time}`;
}
