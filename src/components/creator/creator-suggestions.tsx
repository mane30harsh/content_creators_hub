"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SuggestionItem {
  id: string;
  name: string;
  avatar?: string | null;
  type: "brand" | "community";
  slug?: string;
}

interface CreatorSuggestionsProps {
  suggestions?: SuggestionItem[];
}

const DEFAULT_SUGGESTIONS: SuggestionItem[] = [
  {
    id: "s1",
    name: "Offduty India",
    type: "brand",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    slug: "offduty-india",
  },
  {
    id: "s2",
    name: "Community",
    type: "community",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80",
  },
];

export function CreatorSuggestions({ suggestions = DEFAULT_SUGGESTIONS }: CreatorSuggestionsProps) {
  const items = suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS;

  return (
    <aside className="sticky top-0 flex h-screen w-80 flex-col border-l border-neutral-800/80 bg-[#0A0A0C] px-6 py-8 text-white shrink-0 hidden lg:flex">
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 mb-6">
        <Star className="h-5 w-5 text-neutral-300" />
        <h3 className="text-xl font-bold tracking-tight text-white">Suggestions</h3>
      </div>

      {/* ── Suggestions List ── */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-transparent p-2 transition-colors hover:border-neutral-800/80 hover:bg-[#121216]"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar className="h-10 w-10 border border-neutral-800 bg-neutral-900 shrink-0">
                <AvatarImage src={item.avatar ?? undefined} />
                <AvatarFallback className="bg-neutral-800 text-xs font-bold text-white">
                  {item.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold text-white truncate">
                {item.name}
              </span>
            </div>

            <div className="shrink-0">
              {item.type === "brand" ? (
                <Link
                  href={item.slug ? `/brand/${item.slug}` : "/feed"}
                  className="rounded-full border border-neutral-700 bg-transparent px-5 py-1.5 text-xs font-bold text-white hover:bg-neutral-800 hover:border-neutral-600 transition-all"
                >
                  View
                </Link>
              ) : (
                <button
                  className="rounded-full border border-neutral-700 bg-transparent px-5 py-1.5 text-xs font-bold text-white hover:bg-neutral-800 hover:border-neutral-600 transition-all"
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
          className="text-sm font-semibold text-neutral-300 hover:text-white transition-colors"
        >
          See all
        </Link>
      </div>
    </aside>
  );
}
