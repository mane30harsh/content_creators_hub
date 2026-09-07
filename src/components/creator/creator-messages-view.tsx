"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MoreHorizontal, MessageSquare, Pin, VolumeX, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface MessageThreadItem {
  id: string;
  name: string;
  avatar?: string | null;
  lastMessage: string;
  timeAgo: string;
  unread?: boolean;
  type: "brand" | "creator";
  isPinned?: boolean;
  isMuted?: boolean;
}

const DEFAULT_THREADS: MessageThreadItem[] = [
  {
    id: "m1",
    name: "Jake",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    lastMessage: "Sent you an attachment",
    timeAgo: "15m",
    unread: true,
    type: "creator",
  },
  {
    id: "m2",
    name: "Harsh",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    lastMessage: "Sent the invoice",
    timeAgo: "10m",
    unread: true,
    type: "creator",
  },
  {
    id: "m3",
    name: "Soniya",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    lastMessage: "You sent an attachment",
    timeAgo: "10m",
    unread: false,
    type: "creator",
  },
  {
    id: "m4",
    name: "Sam W.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    lastMessage: "Sent the invoice",
    timeAgo: "10m",
    unread: false,
    type: "creator",
  },
  {
    id: "m5",
    name: "Smruti",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    lastMessage: "Yes",
    timeAgo: "3d",
    unread: false,
    type: "creator",
  },
  {
    id: "m6",
    name: "Alex",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    lastMessage: "Sent the invoice",
    timeAgo: "10m",
    unread: false,
    type: "creator",
  },
  {
    id: "m7",
    name: "Gullylabs Brand",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    lastMessage: "We approved your campaign pitch!",
    timeAgo: "1h",
    unread: true,
    type: "brand",
  },
  {
    id: "m8",
    name: "McDonald's Partner",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    lastMessage: "Please send over the draft reel",
    timeAgo: "2h",
    unread: false,
    type: "brand",
  },
];

export function CreatorMessagesView() {
  const [threads, setThreads] = useState<MessageThreadItem[]>(DEFAULT_THREADS);
  const [activeTab, setActiveTab] = useState<"brand" | "creator">("creator");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>("m2"); // default menu open as shown in screenshot

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleUnread = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unread: !t.unread } : t))
    );
    setOpenMenuId(null);
    toast.success("Updated unread status");
  };

  const handleTogglePin = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t))
    );
    setOpenMenuId(null);
    toast.success("Updated pinned status");
  };

  const handleToggleMute = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isMuted: !t.isMuted } : t))
    );
    setOpenMenuId(null);
    toast.success("Updated mute status");
  };

  const handleDelete = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    setOpenMenuId(null);
    toast.success("Thread deleted");
  };

  const filteredThreads = threads.filter((item) => {
    if (item.type !== activeTab) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.lastMessage.toLowerCase().includes(q)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Search Input ── */}
      <div className="relative py-2 max-w-xl">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ...."
          className="w-full rounded-full border border-neutral-800 bg-[#121216] py-2.5 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:border-[#FF007A] focus:outline-none focus:ring-1 focus:ring-[#FF007A] transition-all"
        />
      </div>

      {/* ── Segmented Toggle Tabs (Brands vs Creators) ── */}
      <div className="flex items-center justify-between gap-3 max-w-xl rounded-full border border-neutral-800 bg-[#121215] p-1">
        <button
          onClick={() => setActiveTab("brand")}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition-all duration-200 ${
            activeTab === "brand"
              ? "bg-[#FF007A] text-white shadow-md shadow-[#FF007A]/20"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Brands
        </button>
        <button
          onClick={() => setActiveTab("creator")}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition-all duration-200 ${
            activeTab === "creator"
              ? "bg-[#FF007A] text-white shadow-md shadow-[#FF007A]/20"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Creators
        </button>
      </div>

      {/* ── Threads List ── */}
      <div className="space-y-3 pt-2">
        {filteredThreads.length === 0 ? (
          <div className="rounded-3xl border border-neutral-800/80 bg-[#101014] p-12 text-center text-neutral-400">
            <p className="text-base font-semibold text-white">No messages</p>
            <p className="mt-1 text-sm text-neutral-500">
              No conversations found for {activeTab === "brand" ? "Brands" : "Creators"}.
            </p>
          </div>
        ) : (
          filteredThreads.map((item) => {
            const isMenuOpen = openMenuId === item.id;
            return (
              <div
                key={item.id}
                className="relative flex items-center justify-between gap-4 rounded-2xl border border-transparent p-3 transition-colors hover:border-neutral-800/80 hover:bg-[#121216]"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <Avatar className="h-12 w-12 border border-neutral-800 bg-neutral-900 shrink-0">
                    <AvatarImage src={item.avatar ?? undefined} />
                    <AvatarFallback className="bg-neutral-800 text-sm font-bold text-white">
                      {item.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">{item.name}</h4>
                    <p className="mt-0.5 text-xs font-semibold text-neutral-400">
                      {item.lastMessage}{" "}
                      <span className="font-normal text-neutral-500 ml-2">{item.timeAgo}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Pink Unread Dot */}
                  {item.unread && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF007A] shadow-md shadow-[#FF007A]/50" />
                  )}

                  {/* Options Button */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(isMenuOpen ? null : item.id)}
                      className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>

                    {/* Context Menu Popup (Matching Screenshot Design) */}
                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-8 z-50 w-52 rounded-2xl border border-neutral-800/90 bg-[#141419] p-2 shadow-2xl space-y-1"
                      >
                        <button
                          onClick={() => handleToggleUnread(item.id)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
                        >
                          <span>Mark as unread</span>
                          <MessageSquare className="h-4 w-4 text-neutral-400" />
                        </button>
                        <button
                          onClick={() => handleTogglePin(item.id)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
                        >
                          <span>Pin</span>
                          <Pin className="h-4 w-4 text-neutral-400" />
                        </button>
                        <button
                          onClick={() => handleToggleMute(item.id)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
                        >
                          <span>Mute</span>
                          <VolumeX className="h-4 w-4 text-neutral-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-[#FF007A] hover:bg-[#FF007A]/10 transition-all"
                        >
                          <span>Delete</span>
                          <Trash2 className="h-4 w-4 text-[#FF007A]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
