"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

const CATEGORIES = [
  "Food",
  "Travel",
  "Lifestyle",
  "Gaming",
];

interface CategoryPillsProps {
  onSelectCategory?: (category: string | null) => void;
  selectedCategory?: string | null;
}

export function CategoryPills({
  onSelectCategory,
  selectedCategory,
}: CategoryPillsProps) {
  // Support active pills; in screenshot, Food and Travel are highlighted pink
  const [activeSet, setActiveSet] = useState<Set<string>>(
    new Set(selectedCategory ? [selectedCategory] : ["Food", "Travel"])
  );

  const handleToggle = (cat: string) => {
    const next = new Set(activeSet);
    if (next.has(cat)) {
      next.delete(cat);
    } else {
      next.add(cat);
    }
    setActiveSet(next);
    if (onSelectCategory) {
      onSelectCategory(next.size > 0 ? Array.from(next)[0] : null);
    }
  };

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
      {CATEGORIES.map((cat) => {
        const isSelected = activeSet.has(cat);
        return (
          <button
            key={cat}
            onClick={() => handleToggle(cat)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-150 ${
              isSelected
                ? "bg-[#FF007A] text-white"
                : "border border-neutral-800 bg-[#101014] text-neutral-300 hover:border-neutral-700 hover:text-white"
            }`}
          >
            <span>{cat}</span>
          </button>
        );
      })}
      
      {/* Right chevron button */}
      <button
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
        aria-label="More categories"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
