import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function VerifiedBadge({ className, size = "md" }: VerifiedBadgeProps) {
  return (
    <span
      title="Verified brand"
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        size === "sm"
          ? "px-2 py-0.5 text-xs"
          : "px-2.5 py-0.5 text-xs",
        "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
        className
      )}
    >
      <BadgeCheck className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      Verified
    </span>
  );
}
