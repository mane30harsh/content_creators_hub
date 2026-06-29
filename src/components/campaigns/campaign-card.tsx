import Link from "next/link";
import { Calendar, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { DeliverableBadge } from "@/components/campaigns/deliverable-badge";

function fmtBudget(minCents?: number | null, maxCents?: number | null, currency = "USD") {
  const fmt = (n: number) => {
    const dollars = n / 100;
    if (dollars >= 1000) return `$${(dollars / 1000).toFixed(0)}K`;
    return `$${dollars.toFixed(0)}`;
  };
  if (!minCents && !maxCents) return null;
  if (minCents && maxCents) return `${fmt(minCents)} – ${fmt(maxCents)} ${currency}`;
  if (maxCents) return `Up to ${fmt(maxCents)} ${currency}`;
  return `From ${fmt(minCents!)} ${currency}`;
}

function fmtDeadline(date?: Date | string | null) {
  if (!date) return null;
  const d = new Date(date);
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return "Deadline passed";
  if (diff === 0) return "Deadline today";
  if (diff <= 7)  return `${diff}d left`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface CampaignCardProps {
  campaign: {
    id:               string;
    title:            string;
    description:      string;
    status:           string;
    niche:            string[];
    deliverableType:  string;
    deliverableCount: number;
    budgetMinCents?:  number | null;
    budgetMaxCents?:  number | null;
    currency:         string;
    applicationDeadline?: Date | string | null;
    isFeatured:       boolean;
    brandProfile?: {
      companyName?: string | null;
      logo?:        string | null;
      slug?:        string | null;
      isVerified?:  boolean;
    } | null;
    _count?: { applications: number };
  };
  /** "discover" = public view, "manage" = brand management view */
  variant?: "discover" | "manage";
  showStatus?: boolean;
}

export function CampaignCard({ campaign, variant = "discover", showStatus = false }: CampaignCardProps) {
  const href = variant === "manage"
    ? `/brand/campaigns/${campaign.id}`
    : `/campaigns/${campaign.id}`;

  const budget = fmtBudget(campaign.budgetMinCents, campaign.budgetMaxCents, campaign.currency);
  const deadline = fmtDeadline(campaign.applicationDeadline);
  const isUrgent = campaign.applicationDeadline &&
    Math.ceil((new Date(campaign.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 3;

  return (
    <Card className="group flex flex-col hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Brand info */}
            {campaign.brandProfile && (
              <div className="mb-2 flex items-center gap-2">
                {campaign.brandProfile.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={campaign.brandProfile.logo}
                    alt={campaign.brandProfile.companyName ?? "Brand"}
                    className="h-5 w-5 rounded object-cover"
                  />
                ) : (
                  <div className="h-5 w-5 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {campaign.brandProfile.companyName?.[0] ?? "B"}
                  </div>
                )}
                <span className="text-xs text-muted-foreground truncate">
                  {campaign.brandProfile.companyName ?? "Brand"}
                </span>
                {campaign.brandProfile.isVerified && (
                  <span className="text-xs text-sky-600">✓</span>
                )}
              </div>
            )}
            {/* Title */}
            <Link href={href} className="block">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {campaign.title}
              </h3>
            </Link>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {campaign.isFeatured && (
              <Badge variant="default" className="text-[10px]">Featured</Badge>
            )}
            {showStatus && <CampaignStatusBadge status={campaign.status} />}
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {campaign.description}
        </p>
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        {/* Niches */}
        <div className="flex flex-wrap gap-1 mb-3">
          {campaign.niche.slice(0, 3).map((n) => (
            <span key={n} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border">
              {n}
            </span>
          ))}
          {campaign.niche.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border">
              +{campaign.niche.length - 3}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="space-y-1.5">
          <DeliverableBadge type={campaign.deliverableType} count={campaign.deliverableCount} />
          {budget && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>{budget}</span>
            </div>
          )}
          {campaign._count && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{campaign._count.applications} application{campaign._count.applications !== 1 ? "s" : ""}</span>
            </div>
          )}
          {deadline && (
            <div className={`flex items-center gap-1.5 text-xs ${isUrgent ? "text-destructive font-medium" : "text-muted-foreground"}`}>
              <Calendar className="h-3 w-3" />
              <span>{deadline}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild size="sm" className="w-full" variant={variant === "manage" ? "outline" : "default"}>
          <Link href={href}>
            {variant === "manage" ? "View Campaign" : "View & Apply"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
