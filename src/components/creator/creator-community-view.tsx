"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  ChevronRight,
  MoreHorizontal,
  MessageSquare,
  Pin,
  VolumeX,
  Trash2,
  Users,
  Bell,
  X,
  ChevronLeft,
  Image as ImageIcon,
  Smile,
  Send,
  Hash,
} from "lucide-react";
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
  memberCount: string;
  activeCount: string;
  description: string;
}

interface CommunityMessage {
  id: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  text: string;
  time: string;
  isMe: boolean;
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
    memberCount: "1.4k members",
    activeCount: "68 active now",
    description: "Dedicated to fitness creators, workout formats, activewear collaborations, and health campaigns.",
  },
  {
    id: "c2",
    name: "Creative Co. Network",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    lastMessage: "Harsh sent an attachment",
    timeAgo: "10m",
    unread: true,
    category: "brands",
    memberCount: "3.2k members",
    activeCount: "142 active now",
    description: "Collaborative hub for creative directors, video editors, and agency brand partners.",
  },
  {
    id: "c3",
    name: "Void Digital Collective",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    lastMessage: "9+Messages",
    timeAgo: "10m",
    unread: false,
    category: "general",
    memberCount: "890 members",
    activeCount: "35 active now",
    description: "3D animators, AI artists, and cutting-edge visual designers sharing tools and sponsorships.",
  },
  {
    id: "c4",
    name: "NXT Brand Creators",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    lastMessage: "Harsh sent an attachment",
    timeAgo: "10m",
    unread: false,
    category: "brands",
    memberCount: "2.1k members",
    activeCount: "94 active now",
    description: "Top-tier influencer partnerships, contract discussions, and brand pitch feedback.",
  },
  {
    id: "c5",
    name: "Foodie & Lifestyle Club",
    avatar: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&auto=format&fit=crop&q=80",
    lastMessage: "9+Messages",
    timeAgo: "10m",
    unread: true,
    category: "food",
    memberCount: "1.8k members",
    activeCount: "52 active now",
    description: "Culinary creators, café reviewers, and food brands sharing shooting tips and recipe sponsorships.",
  },
  {
    id: "c6",
    name: "Popcart Partner Community",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80",
    lastMessage: "Harsh sent an attachment",
    timeAgo: "10m",
    unread: false,
    category: "brands",
    memberCount: "4.5k members",
    activeCount: "210 active now",
    description: "E-commerce partner drops, affiliate commissions, and co-branded creator programs.",
  },
];

const MOCK_COMMUNITY_DISCUSSIONS: Record<string, CommunityMessage[]> = {
  c1: [
    {
      id: "1",
      senderName: "Coach Mike",
      senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      senderRole: "Moderator",
      text: "Welcome to Fitness & Sports Hub! Feel free to share your workout reel ideas and campaign pitches.",
      time: "09:30 AM",
      isMe: false,
    },
    {
      id: "2",
      senderName: "Sarah Jenkins",
      senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      text: "Hey everyone! Just signed with a hydration brand. Any recommendations on shooting fast-paced transition reels?",
      time: "10:15 AM",
      isMe: false,
    },
    {
      id: "3",
      senderName: "Harsh Mane",
      text: "Golden hour outdoors around 5:30 PM gives incredible natural contrast for activewear reels!",
      time: "10:18 AM",
      isMe: true,
    },
    {
      id: "4",
      senderName: "Alex Rivera",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      text: "100% agreed with Harsh. Also make sure to keep the first 2 seconds punchy with an action hook.",
      time: "10:25 AM",
      isMe: false,
    },
  ],
  c2: [
    {
      id: "1",
      senderName: "Maya Chen",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      senderRole: "Admin",
      text: "Draft review session for the Q4 agency showcase is now live.",
      time: "09:00 AM",
      isMe: false,
    },
    {
      id: "2",
      senderName: "Harsh Mane",
      text: "Harsh sent an attachment 📎",
      time: "09:45 AM",
      isMe: true,
    },
    {
      id: "3",
      senderName: "Elena Rostova",
      senderAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
      text: "Just reviewed the cut. The sound design syncs cleanly with the cuts. Approved!",
      time: "10:05 AM",
      isMe: false,
    },
  ],
  c3: [
    {
      id: "1",
      senderName: "Zane Void",
      senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      text: "Has anyone benchmarked the new 3D render pipelines on Apple Silicon chips?",
      time: "Yesterday",
      isMe: false,
    },
    {
      id: "2",
      senderName: "Sam W.",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      text: "Export speeds improved by ~40% on 4K multi-layer projects. Huge win for turnaround times.",
      time: "Yesterday",
      isMe: false,
    },
  ],
  c4: [
    {
      id: "1",
      senderName: "Brand Team Lead",
      senderAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
      senderRole: "Brand",
      text: "Open briefing: Looking for 3 lifestyle creators for an upcoming sustainable footwear drop.",
      time: "11:00 AM",
      isMe: false,
    },
    {
      id: "2",
      senderName: "Harsh Mane",
      text: "Pitch submitted with previous campaign metrics! Excited for this one.",
      time: "11:15 AM",
      isMe: true,
    },
  ],
  c5: [
    {
      id: "1",
      senderName: "Chef Leo",
      senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      text: "Weekend collab thread! Who is working on artisan food reels this week?",
      time: "08:30 AM",
      isMe: false,
    },
    {
      id: "2",
      senderName: "Priya Sharma",
      senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      text: "Shooting a matcha latte aesthetic reel tomorrow morning 🍵",
      time: "09:10 AM",
      isMe: false,
    },
  ],
  c6: [
    {
      id: "1",
      senderName: "Popcart Rep",
      senderAvatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80",
      senderRole: "Partner",
      text: "New bonus commission rates are live on the campaign dashboard for verified creators.",
      time: "Yesterday",
      isMe: false,
    },
  ],
};

function getDefaultDiscussions(id: string): CommunityMessage[] {
  return (
    MOCK_COMMUNITY_DISCUSSIONS[id] ?? [
      {
        id: "1",
        senderName: "Community Moderator",
        text: "Welcome to this channel! Share questions, collaborate with other creators, and post updates.",
        time: "Yesterday",
        isMe: false,
      },
    ]
  );
}

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityItem | null>(null);
  const [discussions, setDiscussions] = useState<Record<string, CommunityMessage[]>>(
    Object.fromEntries(DEFAULT_COMMUNITIES.map((c) => [c.id, getDefaultDiscussions(c.id)]))
  );
  const [messageInput, setMessageInput] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCommunity) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedCommunity, discussions]);

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
    if (selectedCommunity?.id === id) {
      setSelectedCommunity(null);
    }
    setOpenMenuId(null);
    toast.success("Community removed");
  };

  const handleSelectCommunity = (item: CommunityItem) => {
    setSelectedCommunity(item);
    setCommunities((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, unread: false } : c))
    );
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !selectedCommunity) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: CommunityMessage = {
      id: Date.now().toString(),
      senderName: "Harsh Mane",
      text: messageInput.trim(),
      time: timeStr,
      isMe: true,
    };

    setDiscussions((prev) => ({
      ...prev,
      [selectedCommunity.id]: [...(prev[selectedCommunity.id] ?? []), newMsg],
    }));

    setCommunities((prev) =>
      prev.map((c) =>
        c.id === selectedCommunity.id
          ? { ...c, lastMessage: messageInput.trim(), timeAgo: "now" }
          : c
      )
    );

    setMessageInput("");
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

  const activeMessages = selectedCommunity ? (discussions[selectedCommunity.id] ?? []) : [];
  const isOpen = !!selectedCommunity;

  return (
    <>
      {/* Background click overlay for popup menus */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {isOpen ? (
        /* ══════════════════════════════════════════════════════════════════
           SPLIT PANE MODE (When a Community is clicked / selected)
           ══════════════════════════════════════════════════════════════════ */
        <div className="flex h-full overflow-hidden rounded-2xl border border-neutral-800/60 bg-[#0a0a0e]">
          {/* Left: Compact Community Channel List */}
          <div className="hidden md:flex flex-col w-72 shrink-0 border-r border-neutral-800/60">
            <div className="px-3 pt-3 pb-2 border-b border-neutral-800/60 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#FF007A]" />
                  <span>Communities</span>
                </h2>
                <span className="text-[11px] font-semibold text-neutral-500">
                  {communities.length}
                </span>
              </div>

              {/* Search Bar in Split View */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter channels…"
                  className="w-full rounded-xl border border-neutral-800 bg-[#111115] py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-600 focus:border-[#FF007A]/60 focus:outline-none focus:ring-1 focus:ring-[#FF007A]/40 transition-all"
                />
              </div>

              {/* Category Filter Pills (Compact) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {CATEGORY_PILLS.map((pill) => {
                  const isSelected = activeCategory === pill.value;
                  return (
                    <button
                      key={pill.label}
                      onClick={() => setActiveCategory(pill.value)}
                      className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                        isSelected
                          ? "bg-[#FF007A] text-white shadow-sm"
                          : "border border-neutral-800/80 bg-[#121215] text-neutral-400 hover:text-white"
                      }`}
                    >
                      <span>{pill.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compact Community Rows */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-1">
              {filteredCommunities.map((item) => {
                const isSelected = selectedCommunity.id === item.id;
                const isMenuOpen = openMenuId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCommunity(item)}
                    className={`relative flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-all border-l-2 ${
                      isSelected
                        ? "bg-[#FF007A]/10 border-[#FF007A]"
                        : "border-transparent hover:bg-neutral-900/60"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 border border-neutral-800 bg-neutral-900">
                        <AvatarImage src={item.avatar ?? undefined} />
                        <AvatarFallback className="bg-neutral-800 text-xs font-bold text-white">
                          {item.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {item.unread && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#FF007A] ring-2 ring-[#070709]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`truncate text-xs ${
                            isSelected ? "font-bold text-white" : "font-medium text-neutral-300"
                          }`}
                        >
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-neutral-600 shrink-0">{item.timeAgo}</span>
                      </div>
                      <p className="truncate text-[11px] text-neutral-500 mt-0.5">
                        {item.lastMessage}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : item.id);
                        }}
                        className="p-1 rounded-lg text-neutral-600 hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>

                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-6 z-50 w-44 rounded-2xl border border-neutral-800/90 bg-[#141419] p-2 shadow-2xl space-y-0.5"
                        >
                          <button
                            onClick={() => handleToggleUnread(item.id)}
                            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
                          >
                            <span>Mark as unread</span>
                            <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
                          </button>
                          <button
                            onClick={() => handleTogglePin(item.id)}
                            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
                          >
                            <span>Pin</span>
                            <Pin className="h-3.5 w-3.5 text-neutral-400" />
                          </button>
                          <button
                            onClick={() => handleToggleMute(item.id)}
                            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
                          >
                            <span>Mute</span>
                            <VolumeX className="h-3.5 w-3.5 text-neutral-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#FF007A] hover:bg-[#FF007A]/10 transition-all"
                          >
                            <span>Delete</span>
                            <Trash2 className="h-3.5 w-3.5 text-[#FF007A]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Community Channel & Chat View */}
          <div className="flex-1 flex flex-col bg-[#070709] min-w-0">
            {/* Channel Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60 bg-[#0a0a0e] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedCommunity(null)}
                  className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 border border-neutral-800 bg-neutral-900">
                    <AvatarImage src={selectedCommunity.avatar ?? undefined} />
                    <AvatarFallback className="bg-neutral-800 text-xs font-bold text-white">
                      {selectedCommunity.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0a0a0e]" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                    <Hash className="h-4 w-4 text-[#FF007A] shrink-0" />
                    <span>{selectedCommunity.name}</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-normal truncate mt-0.5">
                    <span className="text-emerald-400 font-medium">{selectedCommunity.activeCount}</span>
                    <span className="mx-1.5 text-neutral-600">•</span>
                    <span>{selectedCommunity.memberCount}</span>
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-all"
                  title="Community members"
                >
                  <Users className="h-4 w-4" />
                </button>
                <button
                  className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-all"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedCommunity(null)}
                  className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-all ml-1"
                  title="Close channel view"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Community Notice Banner */}
            <div className="px-5 py-2.5 border-b border-neutral-800/40 bg-[#0d0d12] flex items-center justify-between text-xs text-neutral-400 shrink-0">
              <p className="truncate pr-4">
                <span className="font-semibold text-white">Channel Info: </span>
                {selectedCommunity.description}
              </p>
              <span className="rounded-full bg-[#FF007A]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#FF007A] shrink-0 uppercase tracking-wider">
                {selectedCommunity.category}
              </span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 no-scrollbar">
              {activeMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.isMe ? "justify-end" : "justify-start"}`}
                >
                  {!msg.isMe && (
                    <Avatar className="h-8 w-8 border border-neutral-800 bg-neutral-900 shrink-0 mt-0.5">
                      <AvatarImage src={msg.senderAvatar ?? undefined} />
                      <AvatarFallback className="bg-neutral-800 text-[10px] font-bold text-white">
                        {msg.senderName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`group flex flex-col max-w-[70%] ${msg.isMe ? "items-end" : "items-start"}`}>
                    {!msg.isMe && (
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-semibold text-white">{msg.senderName}</span>
                        {msg.senderRole && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
                            {msg.senderRole}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-600">{msg.time}</span>
                      </div>
                    )}

                    <div
                      className={`px-4 py-2.5 text-sm leading-relaxed ${
                        msg.isMe
                          ? "bg-[#FF007A] text-white rounded-2xl rounded-br-sm shadow-md shadow-[#FF007A]/20"
                          : "bg-[#141419] text-neutral-100 border border-neutral-800/80 rounded-2xl rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.isMe && (
                      <span className="mt-1 text-[10px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                        {msg.time}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="shrink-0 flex items-center gap-3 px-5 py-3 border-t border-neutral-800/60 bg-[#0a0a0e]"
            >
              <button
                type="button"
                className="shrink-0 p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-all"
                title="Attach media"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Message #${selectedCommunity.name}…`}
                  className="w-full rounded-2xl border border-neutral-800 bg-[#111115] px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-[#FF007A]/50 focus:outline-none focus:ring-1 focus:ring-[#FF007A]/30 transition-all pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
                  title="Emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className={`shrink-0 p-2.5 rounded-xl transition-all ${
                  messageInput.trim()
                    ? "bg-[#FF007A] text-white hover:bg-[#e0006e] shadow-md shadow-[#FF007A]/30"
                    : "text-neutral-600 cursor-not-allowed"
                }`}
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════
           FULL-WIDTH MODE (Default list view across the page)
           ══════════════════════════════════════════════════════════════════ */
        <div className="flex flex-col h-full space-y-4">
          {/* ── Search Input (Long full-width stretching towards the right side like Messages) ── */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search community…"
              className="w-full rounded-xl border border-neutral-800 bg-[#111115] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:border-[#FF007A]/60 focus:outline-none focus:ring-1 focus:ring-[#FF007A]/40 transition-all"
            />
          </div>

          {/* ── Category Filter Pills ── */}
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 shrink-0">
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

          {/* ── Communities List (Clicking opens community discussion) ── */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pt-1">
            {filteredCommunities.length === 0 ? (
              <div className="rounded-3xl border border-neutral-800/80 bg-[#101014] p-12 text-center text-neutral-400">
                <Users className="h-8 w-8 mx-auto mb-2 text-neutral-600" />
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
                    onClick={() => handleSelectCommunity(item)}
                    className="group relative flex items-center justify-between gap-4 rounded-2xl border border-transparent p-3 cursor-pointer transition-all hover:border-neutral-800/80 hover:bg-[#121216]"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12 border border-neutral-800 bg-neutral-900">
                          <AvatarImage src={item.avatar ?? undefined} />
                          <AvatarFallback className="bg-neutral-800 text-sm font-bold text-white">
                            {item.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-white tracking-tight group-hover:text-[#FF007A] transition-colors truncate">
                          {item.name}
                        </h4>
                        <p className="mt-0.5 text-xs font-semibold text-neutral-400 truncate">
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
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : item.id);
                          }}
                          className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {/* Context Menu Popup */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
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
      )}
    </>
  );
}
