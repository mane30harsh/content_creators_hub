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
  // Exact Figma state: Food and Travel are active with #FF006D background
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
    <div className="relative flex items-center gap-[10px] py-1">
      {CATEGORIES.map((cat) => {
        const isSelected = activeSet.has(cat);
        return (
          <button
            key={cat}
            onClick={() => handleToggle(cat)}
            className={`flex h-[36px] items-center justify-center rounded-[30px] border border-[rgba(255,0,109,0.4)] px-[24px] text-[16px] font-medium leading-8 tracking-[-0.6px] text-white transition-all duration-150 ${
              isSelected
                ? "bg-[#FF006D]"
                : "bg-transparent hover:border-[#FF006D]"
            }`}
          >
            <span>{cat}</span>
          </button>
        );
      })}

      {/* Right chevron with Figma gradient fade */}
      <button
        className="flex h-9 w-9 items-center justify-center text-white hover:text-[#FF006D] transition-colors"
        aria-label="More categories"
      >
        <ChevronRight className="h-5 w-5 stroke-[2]" />
      </button>
    </div>
  );
}
