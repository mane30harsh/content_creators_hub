import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS_LABELS } from "@/lib/validations/campaign";

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "destructive" | "secondary" | "outline"> = {
  PENDING:     "secondary",
  SHORTLISTED: "warning",
  ACCEPTED:    "success",
  REJECTED:    "destructive",
  WITHDRAWN:   "outline",
};

export function ApplicationStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "secondary"}>
      {APPLICATION_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
