"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

const CATEGORIES = [
  "Food",
  "Travel",
  "Lifestyle",
  "Gaming",
  "Fashion",
  "Beauty",
  "Fitness",
  "Tech",
];

interface CategoryPillsProps {
  onSelectCategory?: (category: string | null) => void;
  selectedCategory?: string | null;
}

export function CategoryPills({
  onSelectCategory,
  selectedCategory: externalSelected,
}: CategoryPillsProps) {
  const [active, setActive] = useState<string | null>(externalSelected ?? "Food");

  const handleSelect = (cat: string) => {
    const next = active === cat ? null : cat;
    setActive(next);
    if (onSelectCategory) {
      onSelectCategory(next);
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
      {CATEGORIES.map((cat) => {
        const isSelected = active === cat;
        return (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              isSelected
                ? "bg-[#FF007A] text-white shadow-md shadow-[#FF007A]/20"
                : "border border-neutral-800 bg-[#121215] text-neutral-300 hover:border-neutral-700 hover:text-white"
            }`}
          >
            <span>{cat}</span>
            {cat === "Gaming" && !isSelected && (
              <ChevronRight className="h-4 w-4 text-neutral-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
