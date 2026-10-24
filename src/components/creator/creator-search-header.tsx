"use client";

import { useState } from "react";
import { Search, Bell, SlidersHorizontal } from "lucide-react";

interface CreatorSearchHeaderProps {
  onSearch?: (query: string) => void;
  onToggleNotifications?: () => void;
  showNotifications?: boolean;
  unreadCount?: number;
}

export function CreatorSearchHeader({
  onSearch,
  onToggleNotifications,
  showNotifications = false,
  unreadCount = 1,
}: CreatorSearchHeaderProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 pb-2 pt-1">
      {/* ── Search Input (Pill) ── */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search anything...."
          className="w-full rounded-full border border-neutral-800 bg-[#0F0F13] py-2.5 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:border-neutral-700 focus:outline-none transition-all"
        />
      </div>

      {/* ── Right Icons (Bell & Sliders) ── */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleNotifications}
          className={`relative p-2 text-neutral-300 hover:text-white transition-colors ${
            showNotifications ? "text-[#FF007A]" : ""
          }`}
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#FF007A]" />
          )}
        </button>
        <button
          className="p-2 text-neutral-300 hover:text-white transition-colors"
          title="Filters"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
