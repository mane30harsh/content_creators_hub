import { Badge } from "@/components/ui/badge";
import { CAMPAIGN_STATUS_LABELS } from "@/lib/validations/campaign";

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "destructive" | "secondary" | "outline"> = {
  DRAFT:      "secondary",
  OPEN:       "success",
  IN_REVIEW:  "warning",
  ACTIVE:     "default",
  COMPLETED:  "outline",
  CANCELLED:  "destructive",
};

export function CampaignStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "secondary"}>
      {CAMPAIGN_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
