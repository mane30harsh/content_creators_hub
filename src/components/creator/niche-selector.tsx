"use client";

import { NICHES } from "@/lib/validations/creator-profile";
import { cn } from "@/lib/utils";

interface NicheSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function NicheSelector({ value, onChange, error }: NicheSelectorProps) {
  const toggle = (niche: string) => {
    if (value.includes(niche)) {
      onChange(value.filter((n) => n !== niche));
    } else {
      onChange([...value, niche]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {NICHES.map((niche) => {
          const selected = value.includes(niche);
          return (
            <button
              key={niche}
              type="button"
              onClick={() => toggle(niche)}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              )}
            >
              {niche}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
