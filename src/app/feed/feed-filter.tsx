"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const FILTERS = [
  { value: "", label: "All" },
  { value: "POST", label: "Posts" },
  { value: "CAMPAIGN_ANNOUNCEMENT", label: "Campaigns" },
  { value: "COLLAB_UPDATE", label: "Collabs" },
  { value: "INDUSTRY", label: "Industry" },
] as const;

export function FeedFilter({ currentType }: { currentType?: string }) {
  const router = useRouter();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map((f) => {
        const active = f.value === (currentType ?? "");
        return (
          <Button
            key={f.value}
            variant={active ? "default" : "outline"}
            size="sm"
            onClick={() => {
              const params = new URLSearchParams();
              if (f.value) params.set("type", f.value);
              router.push(`/feed${params.toString() ? `?${params.toString()}` : ""}`);
            }}
          >
            {f.label}
          </Button>
        );
      })}
    </div>
  );
}
