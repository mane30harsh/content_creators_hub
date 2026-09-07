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
  unreadCount = 3,
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
    <div className="flex items-center justify-between gap-4 py-4">
      {/* ── Search Input ── */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search anything...."
          className="w-full rounded-full border border-neutral-800 bg-[#121216] py-2.5 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:border-[#FF007A] focus:outline-none focus:ring-1 focus:ring-[#FF007A] transition-all"
        />
      </div>

      {/* ── Right Icons ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleNotifications}
          className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all ${
            showNotifications
              ? "bg-[#FF007A] text-white shadow-lg shadow-[#FF007A]/30"
              : "border border-neutral-800 bg-[#121216] text-neutral-300 hover:border-neutral-700 hover:text-white"
          }`}
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {!showNotifications && unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#FF007A] ring-2 ring-[#121216]" />
          )}
        </button>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-[#121216] text-neutral-300 hover:border-neutral-700 hover:text-white transition-all"
          title="Filter options"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
