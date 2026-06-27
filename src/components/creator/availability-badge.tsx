import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "AVAILABLE" | "LIMITED" | "FULLY_BOOKED";

const config: Record<Status, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Available",
    className: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  LIMITED: {
    label: "Limited Availability",
    className: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  FULLY_BOOKED: {
    label: "Fully Booked",
    className: "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function AvailabilityBadge({ status }: { status: Status }) {
  const { label, className } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
