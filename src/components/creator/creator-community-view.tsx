"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronRight, MoreHorizontal, MessageSquare, Pin, VolumeX, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface CommunityItem {
  id: string;
  name: string;
  avatar?: string | null;
  lastMessage: string;
  timeAgo: string;
  unread?: boolean;
  category: "sports" | "food" | "brands" | "general";
  isPinned?: boolean;
  isMuted?: boolean;
}

const DEFAULT_COMMUNITIES: CommunityItem[] = [
  {
    id: "c1",
    name: "Fitness & Sports Hub",
    avatar: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80",
    lastMessage: "9+Messages",
    timeAgo: "10m",
    unread: true,
    category: "sports",
  },
  {
    id: "c2",
    name: "Creative Co. Network",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    lastMessage: "Harsh sent an attachment",
    timeAgo: "10m",
    unread: true,
    category: "brands",
  },
  {
    id: "c3",
    name: "Void Digital Collective",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    lastMessage: "9+Messages",
    timeAgo: "10m",
    unread: false,
    category: "general",
  },
  {
    id: "c4",
    name: "NXT Brand Creators",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    lastMessage: "Harsh sent an attachment",
    timeAgo: "10m",
    unread: false,
    category: "brands",
  },
  {
    id: "c5",
    name: "Foodie & Lifestyle Club",
    avatar: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&auto=format&fit=crop&q=80",
    lastMessage: "9+Messages",
    timeAgo: "10m",
    unread: true,
    category: "food",
  },
  {
    id: "c6",
    name: "Popcart Partner Community",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80",
    lastMessage: "Harsh sent an attachment",
    timeAgo: "10m",
    unread: false,
    category: "brands",
  },
];

const CATEGORY_PILLS = [
  { label: "All", value: "all" },
  { label: "Sports", value: "sports" },
  { label: "Food", value: "food" },
  { label: "Brands", value: "brands", hasArrow: true },
];

export function CreatorCommunityView() {
  const [communities, setCommunities] = useState<CommunityItem[]>(DEFAULT_COMMUNITIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>("c2"); // default menu open as shown in screenshot

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
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: !c.unread } : c))
    );
    setOpenMenuId(null);
    toast.success("Updated unread status");
  };

  const handleTogglePin = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
    setOpenMenuId(null);
    toast.success("Updated pinned status");
  };

  const handleToggleMute = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isMuted: !c.isMuted } : c))
    );
    setOpenMenuId(null);
    toast.success("Updated mute status");
  };

  const handleDelete = (id: string) => {
    setCommunities((prev) => prev.filter((c) => c.id !== id));
    setOpenMenuId(null);
    toast.success("Community removed");
  };

  const filteredCommunities = communities.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.lastMessage.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (activeCategory !== "all" && item.category !== activeCategory) {
      return false;
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

      {/* ── Category Filter Pills ── */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORY_PILLS.map((pill) => {
          const isSelected = activeCategory === pill.value;
          return (
            <button
              key={pill.label}
              onClick={() => setActiveCategory(pill.value)}
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

      {/* ── Communities List ── */}
      <div className="space-y-3 pt-2">
        {filteredCommunities.length === 0 ? (
          <div className="rounded-3xl border border-neutral-800/80 bg-[#101014] p-12 text-center text-neutral-400">
            <p className="text-base font-semibold text-white">No communities found</p>
            <p className="mt-1 text-sm text-neutral-500">
              Try adjusting your search query or filter selection.
            </p>
          </div>
        ) : (
          filteredCommunities.map((item) => {
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
