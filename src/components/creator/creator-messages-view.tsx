"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  MessageSquare,
  Pin,
  VolumeX,
  Trash2,
  Send,
  Smile,
  Image as ImageIcon,
  Phone,
  Video,
  Info,
  ChevronLeft,
  X,
} from "lucide-react";
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

interface MockMessage {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
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

const MOCK_CONVERSATIONS: Record<string, MockMessage[]> = {
  m1: [
    { id: "1", text: "Hey! Just wanted to check in about the collab.", time: "10:20", isMe: false },
    { id: "2", text: "Hey Jake! Yes let's do it. What product are we working with?", time: "10:22", isMe: true },
    { id: "3", text: "It's a new fitness gear line. I'll send details.", time: "10:24", isMe: false },
    { id: "4", text: "Sent you an attachment 📎", time: "10:45", isMe: false },
    { id: "5", text: "Got it! Looks great. I'll review and get back to you.", time: "10:50", isMe: true },
  ],
  m2: [
    { id: "1", text: "Hey! Campaign wrap-up looks awesome.", time: "09:00", isMe: false },
    { id: "2", text: "Thanks! Glad you liked it.", time: "09:05", isMe: true },
    { id: "3", text: "Sent the invoice", time: "10:00", isMe: false },
    { id: "4", text: "Received, I'll process it today.", time: "10:10", isMe: true },
  ],
  m3: [
    { id: "1", text: "Hi Soniya! Did you get the brief?", time: "08:00", isMe: true },
    { id: "2", text: "Yes! Working on it now.", time: "08:15", isMe: false },
    { id: "3", text: "You sent an attachment 📎", time: "09:30", isMe: true },
    { id: "4", text: "Nice! I'll review soon.", time: "09:45", isMe: false },
  ],
  m7: [
    { id: "1", text: "Hi! We reviewed your pitch and loved it.", time: "11:00", isMe: false },
    { id: "2", text: "That's amazing, thank you so much!", time: "11:05", isMe: true },
    { id: "3", text: "We approved your campaign pitch! 🎉", time: "11:10", isMe: false },
    { id: "4", text: "When do we start?", time: "11:12", isMe: true },
    { id: "5", text: "Next Monday. We'll send the contract by Friday.", time: "11:15", isMe: false },
  ],
  m8: [
    { id: "1", text: "Hey! How's the reel coming along?", time: "14:00", isMe: false },
    { id: "2", text: "Almost done! Just finishing edits.", time: "14:10", isMe: true },
    { id: "3", text: "Please send over the draft reel when ready.", time: "14:30", isMe: false },
  ],
};

function getDefaultMessages(id: string): MockMessage[] {
  return (
    MOCK_CONVERSATIONS[id] ?? [
      { id: "1", text: "Hey! Great connecting with you.", time: "Yesterday", isMe: false },
      { id: "2", text: "Likewise! Looking forward to working together.", time: "Yesterday", isMe: true },
    ]
  );
}

// ─── Thread List (shared between both modes) ─────────────────────────────────

interface ThreadListProps {
  threads: MessageThreadItem[];
  activeTab: "brand" | "creator";
  setActiveTab: (tab: "brand" | "creator") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  selectedThreadId: string | null;
  onSelectThread: (item: MessageThreadItem) => void;
  onToggleUnread: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleMute: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

function ThreadList({
  threads,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  openMenuId,
  setOpenMenuId,
  selectedThreadId,
  onSelectThread,
  onToggleUnread,
  onTogglePin,
  onToggleMute,
  onDelete,
  compact = false,
}: ThreadListProps) {
  const filtered = threads.filter((item) => {
    if (item.type !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.lastMessage.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className={compact ? "flex flex-col h-full" : "space-y-4"}>
      {/* Search */}
      <div className={compact ? "px-4 pt-4 pb-3 space-y-3 border-b border-neutral-800/60 shrink-0" : "space-y-4"}>
        {compact && <h2 className="text-base font-bold text-white">Messages</h2>}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages…"
            className="w-full rounded-xl border border-neutral-800 bg-[#111115] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:border-[#FF007A]/60 focus:outline-none focus:ring-1 focus:ring-[#FF007A]/40 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 w-full rounded-xl border border-neutral-800 bg-[#111115] p-1">
          <button
            onClick={() => setActiveTab("brand")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === "brand"
                ? "bg-[#FF007A] text-white shadow-lg shadow-[#FF007A]/25"
                : "text-neutral-500 hover:text-neutral-200"
            }`}
          >
            Brands
          </button>
          <button
            onClick={() => setActiveTab("creator")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === "creator"
                ? "bg-[#FF007A] text-white shadow-lg shadow-[#FF007A]/25"
                : "text-neutral-500 hover:text-neutral-200"
            }`}
          >
            Creators
          </button>
        </div>
      </div>

      {/* Thread rows */}
      <div className={compact ? "flex-1 overflow-y-auto no-scrollbar py-1" : "space-y-1 pt-2"}>
        {filtered.length === 0 ? (
          <div className={`${compact ? "p-8" : "p-12 rounded-3xl border border-neutral-800/80 bg-[#101014]"} text-center`}>
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-neutral-600" />
            <p className="text-sm font-semibold text-neutral-400">No messages</p>
            <p className="mt-1 text-xs text-neutral-600">
              No conversations for {activeTab === "brand" ? "Brands" : "Creators"}.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isMenuOpen = openMenuId === item.id;
            const isSelected = selectedThreadId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectThread(item)}
                className={`relative flex items-center gap-3 cursor-pointer transition-all ${
                  compact
                    ? `px-4 py-3 border-l-2 ${isSelected ? "bg-[#FF007A]/10 border-[#FF007A]" : "border-transparent hover:bg-neutral-900/60"}`
                    : "rounded-2xl border border-transparent p-3 hover:border-neutral-800/80 hover:bg-[#121216]"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className={`border border-neutral-800 bg-neutral-900 ${compact ? "h-11 w-11" : "h-12 w-12"}`}>
                    <AvatarImage src={item.avatar ?? undefined} />
                    <AvatarFallback className="bg-neutral-800 text-sm font-bold text-white">
                      {item.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {item.unread && (
                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#FF007A] ring-2 ring-[#070709]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={`truncate text-sm ${item.unread ? "font-bold text-white" : "font-medium text-neutral-300"}`}>
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-neutral-600 shrink-0">{item.timeAgo}</span>
                  </div>
                  <p className={`truncate text-xs mt-0.5 ${item.unread ? "text-neutral-300 font-medium" : "text-neutral-600"}`}>
                    {item.lastMessage}
                  </p>
                </div>

                {/* Three-dot menu */}
                <div className="relative z-50 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : item.id);
                    }}
                    className="p-1 rounded-lg text-neutral-600 hover:text-white transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {isMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-7 z-50 w-48 rounded-2xl border border-neutral-800/90 bg-[#141419] p-2 shadow-2xl space-y-0.5"
                    >
                      <button
                        onClick={() => onToggleUnread(item.id)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
                      >
                        <span>Mark as unread</span>
                        <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
                      </button>
                      <button
                        onClick={() => onTogglePin(item.id)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
                      >
                        <span>Pin</span>
                        <Pin className="h-3.5 w-3.5 text-neutral-400" />
                      </button>
                      <button
                        onClick={() => onToggleMute(item.id)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
                      >
                        <span>Mute</span>
                        <VolumeX className="h-3.5 w-3.5 text-neutral-400" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-[#FF007A] hover:bg-[#FF007A]/10 transition-all"
                      >
                        <span>Delete</span>
                        <Trash2 className="h-3.5 w-3.5 text-[#FF007A]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CreatorMessagesView() {
  const [threads, setThreads] = useState<MessageThreadItem[]>(DEFAULT_THREADS);
  const [activeTab, setActiveTab] = useState<"brand" | "creator">("creator");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<MessageThreadItem | null>(null);
  const [conversations, setConversations] = useState<Record<string, MockMessage[]>>(
    Object.fromEntries(DEFAULT_THREADS.map((t) => [t.id, getDefaultMessages(t.id)]))
  );
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread?.id, conversations]);

  const handleToggleUnread = (id: string) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: !t.unread } : t)));
    setOpenMenuId(null);
    toast.success("Updated unread status");
  };

  const handleTogglePin = (id: string) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t)));
    setOpenMenuId(null);
    toast.success("Updated pinned status");
  };

  const handleToggleMute = (id: string) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, isMuted: !t.isMuted } : t)));
    setOpenMenuId(null);
    toast.success("Updated mute status");
  };

  const handleDelete = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (selectedThread?.id === id) setSelectedThread(null);
    setOpenMenuId(null);
    toast.success("Thread deleted");
  };

  const handleSelectThread = (item: MessageThreadItem) => {
    setSelectedThread(item);
    setThreads((prev) => prev.map((t) => (t.id === item.id ? { ...t, unread: false } : t)));
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !selectedThread) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: MockMessage = { id: Date.now().toString(), text: messageText.trim(), time, isMe: true };
    setConversations((prev) => ({
      ...prev,
      [selectedThread.id]: [...(prev[selectedThread.id] ?? []), newMsg],
    }));
    setThreads((prev) =>
      prev.map((t) => (t.id === selectedThread.id ? { ...t, lastMessage: messageText.trim(), timeAgo: "now" } : t))
    );
    setMessageText("");
  };

  const activeMessages = selectedThread ? (conversations[selectedThread.id] ?? []) : [];
  const isOpen = !!selectedThread;

  return (
    <>
      {/* Overlay to close context menu */}
      {openMenuId && <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />}

      {isOpen ? (
        /* ── SPLIT PANE MODE (chat open) ── */
        <div className="flex h-full overflow-hidden rounded-2xl border border-neutral-800/60 bg-[#0a0a0e]">

          {/* Left: compact thread list */}
          <div className="hidden md:flex flex-col w-72 shrink-0 border-r border-neutral-800/60">
            <div className="px-3 pt-3 pb-2 border-b border-neutral-800/60 shrink-0">
              <h2 className="text-sm font-bold text-white mb-3">Messages</h2>
              <ThreadList
                threads={threads}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                selectedThreadId={selectedThread?.id ?? null}
                onSelectThread={handleSelectThread}
                onToggleUnread={handleToggleUnread}
                onTogglePin={handleTogglePin}
                onToggleMute={handleToggleMute}
                onDelete={handleDelete}
                compact
              />
            </div>
          </div>

          {/* Right: chat area */}
          <div className="flex-1 flex flex-col bg-[#070709] min-w-0">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/60 bg-[#0a0a0e] shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedThread(null)}
                  className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="relative">
                  <Avatar className="h-9 w-9 border border-neutral-800">
                    <AvatarImage src={selectedThread.avatar ?? undefined} />
                    <AvatarFallback className="bg-neutral-800 text-xs font-bold text-white">
                      {selectedThread.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0a0a0e]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{selectedThread.name}</p>
                  <p className="text-[10px] text-emerald-400 font-medium">Active now</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-all">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-all">
                  <Video className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-all">
                  <Info className="h-4 w-4" />
                </button>
                {/* Close button */}
                <button
                  onClick={() => setSelectedThread(null)}
                  className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-all ml-1"
                  title="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 no-scrollbar">
              {activeMessages.map((msg, idx) => {
                const prevMsg = activeMessages[idx - 1];
                const showAvatar = !msg.isMe && (!prevMsg || prevMsg.isMe);
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${msg.isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!msg.isMe && (
                      <div className="w-7 shrink-0">
                        {showAvatar && (
                          <Avatar className="h-7 w-7 border border-neutral-800">
                            <AvatarImage src={selectedThread.avatar ?? undefined} />
                            <AvatarFallback className="bg-neutral-800 text-[10px] font-bold text-white">
                              {selectedThread.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}
                    <div className={`group flex flex-col max-w-[65%] ${msg.isMe ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-4 py-2.5 text-sm leading-relaxed ${
                          msg.isMe
                            ? "bg-[#FF007A] text-white rounded-2xl rounded-br-sm"
                            : "bg-[#1c1c22] text-neutral-100 border border-neutral-800/60 rounded-2xl rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="mt-1 text-[10px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="shrink-0 flex items-center gap-3 px-4 py-3 border-t border-neutral-800/60 bg-[#0a0a0e]"
            >
              <button type="button" className="shrink-0 p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-all">
                <ImageIcon className="h-5 w-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Message…"
                  className="w-full rounded-2xl border border-neutral-800 bg-[#111115] px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-[#FF007A]/50 focus:outline-none focus:ring-1 focus:ring-[#FF007A]/30 transition-all pr-10"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors">
                  <Smile className="h-4 w-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!messageText.trim()}
                className={`shrink-0 p-2.5 rounded-xl transition-all ${
                  messageText.trim()
                    ? "bg-[#FF007A] text-white hover:bg-[#e0006e] shadow-md shadow-[#FF007A]/30"
                    : "text-neutral-600 cursor-not-allowed"
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ── FULL-WIDTH MODE (no chat open) ── */
        <ThreadList
          threads={threads}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          selectedThreadId={null}
          onSelectThread={handleSelectThread}
          onToggleUnread={handleToggleUnread}
          onTogglePin={handleTogglePin}
          onToggleMute={handleToggleMute}
          onDelete={handleDelete}
          compact={false}
        />
      )}
    </>
  );
}
