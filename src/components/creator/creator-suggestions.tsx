"use client";

import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CreatorSuggestionItem } from "@/lib/creator-suggestions";

interface CreatorSuggestionsProps {
  suggestions?: CreatorSuggestionItem[];
}

const DEFAULT_SUGGESTIONS: CreatorSuggestionItem[] = [
  {
    id: "s1",
    name: "Offduty India",
    type: "brand",
    avatar: "/images/creator/offduty-logo.png",
    slug: "offduty-india",
  },
  {
    id: "s2",
    name: "Community",
    type: "community",
    avatar: "/images/creator/community-logo.png",
  },
];

export function CreatorSuggestions({ suggestions = DEFAULT_SUGGESTIONS }: CreatorSuggestionsProps) {
  const items = suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS;

  return (
    <aside className="relative sticky top-0 flex h-screen w-80 flex-col border-l border-neutral-900 bg-[#000000] px-6 py-8 text-white shrink-0 hidden xl:flex">
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 mb-8">
        <Star className="h-5 w-5 text-neutral-300 stroke-[1.5]" />
        <h3 className="text-xl font-bold tracking-tight text-white">Suggestions</h3>
      </div>

      {/* ── Suggestions List ── */}
      <div className="space-y-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar className="h-9 w-9 border border-neutral-800 bg-[#16161B] shrink-0">
                <AvatarImage src={item.avatar ?? undefined} />
                <AvatarFallback className="bg-neutral-800 text-xs font-bold text-white">
                  {item.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-white truncate">
                {item.name}
              </span>
            </div>

            <div className="shrink-0">
              {item.type === "brand" ? (
                <Link
                  href={item.slug ? `/brand/${item.slug}` : "/feed"}
                  className="inline-block rounded-full border border-neutral-700 bg-transparent px-5 py-1 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
                >
                  View
                </Link>
              ) : (
                <button
                  className="rounded-full border border-neutral-700 bg-transparent px-5 py-1 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer See All ── */}
      <div className="mt-8 flex justify-end">
        <Link
          href="/feed"
          className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
        >
          See all
        </Link>
      </div>

      {/* ── Right Edge Chevron Handle ── */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center h-12 w-4 bg-[#141418] rounded-l-md border-l border-y border-neutral-800 text-neutral-400 cursor-pointer hover:text-white">
        <ChevronRight className="h-3 w-3" />
      </div>
    </aside>
  );
}
