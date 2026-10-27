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
    <aside className="relative sticky top-0 flex h-screen w-80 flex-col border-l border-[rgba(88,88,88,0.4)] bg-[#0A0A0A] px-7 py-7 text-white shrink-0 hidden xl:flex">
      {/* ── Header (Figma: Star 22px stroke 1.5, Heading 22px font-500, letter-spacing -0.6px) ── */}
      <div className="flex items-center gap-[10px] mb-8">
        <Star className="h-[22px] w-[22px] stroke-[1.5] text-white" />
        <h3 className="text-[22px] font-medium leading-8 tracking-[-0.6px] text-white">
          Suggestions
        </h3>
      </div>

      {/* ── Suggestions List (Figma: Avatar 40px, Item Name 16px font-400, Buttons h 36px border rgba(255,0,109,0.4)) ── */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-[15px] overflow-hidden">
              <Avatar className="h-10 w-10 border border-[rgba(250,255,0,0.22)] bg-[#121216] shrink-0">
                <AvatarImage src={item.avatar ?? undefined} />
                <AvatarFallback className="bg-neutral-800 text-xs font-bold text-white">
                  {item.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[16px] font-normal leading-8 tracking-[-0.6px] text-white truncate">
                {item.name}
              </span>
            </div>

            <div className="shrink-0">
              {item.type === "brand" ? (
                <Link
                  href={item.slug ? `/brand/${item.slug}` : "/feed"}
                  className="flex h-[36px] w-[86px] items-center justify-center rounded-[30px] border border-[rgba(255,0,109,0.4)] bg-transparent text-[16px] font-medium leading-8 tracking-[-0.6px] text-white hover:bg-neutral-900 transition-colors"
                >
                  View
                </Link>
              ) : (
                <button
                  className="flex h-[36px] w-[86px] items-center justify-center rounded-[30px] border border-[rgba(255,0,109,0.4)] bg-transparent text-[16px] font-medium leading-8 tracking-[-0.6px] text-white hover:bg-neutral-900 transition-colors"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer See All (Figma: font 16px 500, letter-spacing -0.6px, color #FFFFFF) ── */}
      <div className="mt-8 flex justify-end">
        <Link
          href="/feed"
          className="text-[16px] font-medium leading-8 tracking-[-0.6px] text-white hover:text-[#FF006D] transition-colors"
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
