"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

interface CreatorSearchHeaderProps {
  onSearch?: (query: string) => void;
}

export function CreatorSearchHeader({ onSearch }: CreatorSearchHeaderProps) {
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
        <NotificationDropdown />
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
