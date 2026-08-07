"use client";

import { LANGUAGES } from "@/lib/validations/creator-profile";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function LanguageSelector({ value, onChange, error }: LanguageSelectorProps) {
  const toggle = (lang: string) => {
    if (value.includes(lang)) {
      onChange(value.filter((l) => l !== lang));
    } else {
      onChange([...value, lang]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => {
          const selected = value.includes(lang);
          return (
            <button
              key={lang}
              type="button"
              onClick={() => toggle(lang)}
              className={cn(
                "inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200",
                selected
                  ? "border-[#E60067] bg-[#E60067] text-white shadow-md scale-105"
                  : "border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:border-neutral-700"
              )}
            >
              {lang}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
