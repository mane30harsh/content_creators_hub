"use client";

import { useState } from "react";
import { NICHES } from "@/lib/validations/creator-profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface NicheSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function NicheSelector({ value = [], onChange, error }: NicheSelectorProps) {
  const [customInput, setCustomInput] = useState("");

  const isOtherSelected = value.includes("Other");

  // Standard niches excluding "Other"
  const standardNichesList = NICHES.filter((n) => n !== "Other");

  // Any custom niche strings present in `value` (not part of predefined NICHES)
  const customNiches = value.filter(
    (n) => !NICHES.includes(n as (typeof NICHES)[number])
  );

  const toggleStandard = (niche: string) => {
    if (value.includes(niche)) {
      onChange(value.filter((n) => n !== niche));
    } else {
      onChange([...value, niche]);
    }
  };

  const toggleOther = () => {
    if (isOtherSelected) {
      // Remove "Other" and any custom niches
      onChange(value.filter((n) => n !== "Other" && NICHES.includes(n as (typeof NICHES)[number])));
      setCustomInput("");
    } else {
      onChange([...value, "Other"]);
    }
  };

  const handleAddCustomNiche = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;

    if (!value.includes(trimmed)) {
      // Ensure "Other" is also in value
      const next = value.includes("Other") ? [...value, trimmed] : [...value, "Other", trimmed];
      onChange(next);
    }
    setCustomInput("");
  };

  const handleRemoveCustomNiche = (customNiche: string) => {
    const updated = value.filter((n) => n !== customNiche);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Predefined Niche Pills */}
      <div className="flex flex-wrap gap-2">
        {standardNichesList.map((niche) => {
          const selected = value.includes(niche);
          return (
            <button
              key={niche}
              type="button"
              onClick={() => toggleStandard(niche)}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-foreground hover:bg-muted"
              )}
            >
              {niche}
            </button>
          );
        })}

        {/* "Other" Pill */}
        <button
          type="button"
          onClick={toggleOther}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            isOtherSelected || customNiches.length > 0
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-background text-foreground hover:bg-muted"
          )}
        >
          <Sparkles className="h-3 w-3" />
          Other
        </button>
      </div>

      {/* Render added custom niche badges */}
      {customNiches.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground font-medium">Custom niches:</span>
          {customNiches.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {c}
              <button
                type="button"
                onClick={() => handleRemoveCustomNiche(c)}
                className="rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                aria-label={`Remove ${c}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input box when "Other" is selected */}
      {(isOtherSelected || customNiches.length > 0) && (
        <div className="flex gap-2 pt-1 animate-in fade-in-50 slide-in-from-top-1">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomNiche();
              }
            }}
            placeholder="Specify your custom niche (e.g. Crypto, Cosplay, Woodworking)…"
            className="text-xs h-9"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddCustomNiche}
            disabled={!customInput.trim()}
            className="h-9 text-xs shrink-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
