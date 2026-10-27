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
  showNotifications,
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
    <div className="flex items-center gap-4 pb-2 pt-1">
      {/* ── Search Input (Figma: width 367px, height 48px, bg #000000, border rgba(88,88,88,0.4), radius 30px) ── */}
      <div className="relative w-[367px] h-[48px]">
        <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#585858]" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search anything...."
          className="h-full w-full rounded-[30px] border border-[rgba(88,88,88,0.4)] bg-[#000000] px-5 pl-12 text-[16px] font-normal leading-8 tracking-[-0.6px] text-white placeholder-[#585858] focus:border-[#FF006D] focus:outline-none transition-all"
        />
      </div>

      {/* ── Right Icons (Bell & Sliders: white stroke, #FF006D notification dot) ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleNotifications}
          className={`relative flex h-10 w-10 items-center justify-center transition-colors ${
            showNotifications ? "text-[#FF006D]" : "text-white hover:text-[#FF006D]"
          }`}
          title="Notifications"
        >
          <Bell className="h-6 w-6 stroke-[1.5]" />
          {unreadCount > 0 && !showNotifications && (
            <span className="absolute top-2 right-2 h-[7px] w-[7px] rounded-full bg-[#FF006D]" />
          )}
        </button>
        <button
          className="flex h-10 w-10 items-center justify-center text-white hover:text-[#FF006D] transition-colors"
          title="Filters"
        >
          <SlidersHorizontal className="h-6 w-6 stroke-[1.5]" />
        </button>
      </div>
    </div>
  );
}
