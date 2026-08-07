"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  MessageSquare,
  Search,
  User,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { sendMessage } from "@/lib/actions/message";

interface ThreadSummary {
  id: string;
  updatedAt: Date;
  latestMessage: { body: string; createdAt: Date; senderId: string } | null;
  hasUnread: boolean;
  otherUser: {
    id: string;
    displayName: string;
    avatar?: string;
    role: string;
    profileHref?: string;
  } | null;
}

interface MessageItem {
  id: string;
  senderId: string;
  body: string;
  createdAt: Date;
  isMe: boolean;
}

interface ThreadDetail {
  id: string;
  currentUserId: string;
  otherUser: {
    id: string;
    displayName: string;
    avatar?: string;
    role: string;
    profileHref?: string;
  } | null;
  messages: MessageItem[];
}

interface Props {
  threads: ThreadSummary[];
  activeThread: ThreadDetail | null;
  selectedThreadId?: string;
}

export function ChatView({ threads, activeThread, selectedThreadId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMobileList, setShowMobileList] = useState(!selectedThreadId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  const filteredThreads = threads.filter((t) =>
    t.otherUser?.displayName.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelectThread(id: string) {
    setShowMobileList(false);
    router.push(`/messages?threadId=${id}`);
  }

  function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeThread) return;

    const textToSend = messageText;
    setMessageText("");

    startTransition(async () => {
      const result = await sendMessage({
        threadId: activeThread.id,
        body: textToSend,
      });

      if (!result.success) {
        toast.error(result.error);
        setMessageText(textToSend);
        return;
      }

      router.refresh();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[500px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* ── Left Sidebar (Thread List) ── */}
      <div
        className={cn(
          "w-full border-r border-border bg-muted/20 md:w-80 md:flex flex-col shrink-0",
          showMobileList ? "flex" : "hidden md:flex"
        )}
      >
        {/* Search Header */}
        <div className="border-b border-border p-3.5">
          <h2 className="mb-2 text-lg font-bold tracking-tight">Messages</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40">
          {filteredThreads.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No conversations found.
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isSelected = thread.id === selectedThreadId;
              const other = thread.otherUser;
              const initials = other?.displayName
                ? other.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                : "?";

              return (
                <button
                  key={thread.id}
                  onClick={() => handleSelectThread(thread.id)}
                  className={cn(
                    "flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-muted/60",
                    isSelected && "bg-muted font-medium"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={other?.avatar} alt={other?.displayName ?? "User"} />
                      <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    {thread.hasUnread && (
                      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-primary ring-2 ring-background" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {other?.displayName ?? "Unknown User"}
                      </p>
                      {thread.latestMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(thread.latestMessage.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    <p className="truncate text-xs text-muted-foreground mt-0.5">
                      {thread.latestMessage ? thread.latestMessage.body : "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Chat Main Pane ── */}
      <div
        className={cn(
          "flex-1 flex-col bg-background",
          !showMobileList ? "flex" : "hidden md:flex"
        )}
      >
        {activeThread ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8"
                  onClick={() => setShowMobileList(true)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={activeThread.otherUser?.avatar}
                    alt={activeThread.otherUser?.displayName ?? "User"}
                  />
                  <AvatarFallback className="text-xs font-bold">
                    {activeThread.otherUser?.displayName?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">
                      {activeThread.otherUser?.displayName ?? "User"}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">
                      {activeThread.otherUser?.role}
                    </Badge>
                  </div>

                  {activeThread.otherUser?.profileHref && (
                    <Link
                      href={activeThread.otherUser.profileHref}
                      target="_blank"
                      className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      View profile <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
              {activeThread.messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm font-medium">No messages in this conversation yet.</p>
                  <p className="text-xs mt-1">Send a message below to start the conversation!</p>
                </div>
              ) : (
                activeThread.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex flex-col max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                      m.isMe
                        ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                        : "mr-auto bg-muted text-foreground border border-border rounded-bl-none"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <span
                      className={cn(
                        "mt-1 text-[10px] self-end opacity-70",
                        m.isMe ? "text-primary-foreground" : "text-muted-foreground"
                      )}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="border-t border-border p-3 bg-card flex items-center gap-2">
              <Input
                type="text"
                placeholder="Type your message…"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button type="submit" size="default" disabled={isPending || !messageText.trim()}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-3 text-muted-foreground/40" />
            <h3 className="text-base font-semibold text-foreground">Your Messages</h3>
            <p className="text-xs mt-1 max-w-sm">
              Select a conversation from the left sidebar or message a creator/brand directly from their campaign or profile page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
