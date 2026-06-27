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
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
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
