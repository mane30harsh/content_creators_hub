import Link from "next/link";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { DELIVERABLE_TYPE_LABELS, getCurrencySymbol } from "@/lib/validations/campaign";

function fmtBudget(minCents?: number | null, maxCents?: number | null, currency = "USD") {
  const sym = getCurrencySymbol(currency);
  const fmt = (n: number) => {
    const dollars = n / 100;
    if (dollars >= 1000) return `${sym}${(dollars / 1000).toFixed(0)}K`;
    return `${sym}${dollars.toLocaleString()}`;
  };
  if (!minCents && !maxCents) return null;
  if (minCents && maxCents) return `${fmt(minCents)} – ${fmt(maxCents)}`;
  if (maxCents) return `Up to ${fmt(maxCents)}`;
  return `From ${fmt(minCents!)}`;
}

function fmtDeadline(date?: Date | string | null) {
  if (!date) return "No deadline";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function fmtFollowerRange(min?: number | null, max?: number | null) {
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
    return n.toString();
  };
  if (min && max) return `${fmt(min)}-${fmt(max)}`;
  if (min) return `>${fmt(min)}`;
  if (max) return `<${fmt(max)}`;
  return "Any";
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
    country?:         string[];
    minFollowers?:    number | null;
    maxFollowers?:    number | null;
    applicationDeadline?: Date | string | null;
    createdAt?:       Date | string | null;
    isFeatured:       boolean;
    coverImage?:      string | null;
    brandProfile?: {
      companyName?: string | null;
      logo?:        string | null;
      slug?:        string | null;
      isVerified?:  boolean;
    } | null;
    _count?: { applications: number };
  };
  variant?: "discover" | "manage";
  showStatus?: boolean;
}

export function CampaignCard({ campaign, variant = "discover", showStatus = false }: CampaignCardProps) {
  const href = variant === "manage"
    ? `/brand/campaigns/${campaign.id}`
    : `/campaigns/${campaign.id}`;

  const budget = fmtBudget(campaign.budgetMinCents, campaign.budgetMaxCents, campaign.currency);
  const deadlineStr = fmtDeadline(campaign.applicationDeadline);
  const deliverableLabel = `${campaign.deliverableCount} x ${DELIVERABLE_TYPE_LABELS[campaign.deliverableType] || campaign.deliverableType}`;
  const followerRangeStr = fmtFollowerRange(campaign.minFollowers, campaign.maxFollowers);
  const targetCountryStr = campaign.country && campaign.country.length > 0 ? campaign.country[0] : "Any";

  // Fallback high-quality cover photo if coverImage is empty
  const defaultCover = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-[#0F0F10] p-3.5 shadow-xl transition-all duration-300 hover:border-neutral-700 hover:shadow-2xl">
      {/* ── Top Cover Image Banner ── */}
      <div className="relative h-44 w-full overflow-hidden rounded-xl bg-neutral-900">
        <img
          src={campaign.coverImage || campaign.brandProfile?.logo || defaultCover}
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Featured / Status Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {campaign.isFeatured && (
            <span className="rounded-full bg-[#E60067] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
              ★ Featured
            </span>
          )}
          {showStatus && <CampaignStatusBadge status={campaign.status} />}
        </div>
      </div>

      {/* ── Content Details ── */}
      <div className="mt-3 flex flex-1 flex-col space-y-3">
        {/* Title */}
        <Link href={href}>
          <h3 className="text-base font-bold text-white transition-colors group-hover:text-[#FF0066] line-clamp-1">
            {campaign.title}
          </h3>
        </Link>

        {/* Timeline Row */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
          <span>{campaign.brandProfile?.companyName || "Brand"}</span>
          <span>Last day on {deadlineStr}</span>
        </div>

        {/* Vibrant Green Deliverable Badge */}
        <div className="pt-0.5">
          <span className="inline-flex rounded-full bg-[#00E639] px-3.5 py-1 text-xs font-bold text-black shadow-md">
            {deliverableLabel}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
          {campaign.description}
        </p>

        {/* ── Specs Pill Container (Matching Figma 4-Column Layout) ── */}
        <div className="mt-auto rounded-xl bg-neutral-900/90 p-2.5 border border-neutral-800/80">
          <div className="grid grid-cols-4 divide-x divide-neutral-800 text-center text-[10px]">
            <div className="px-1">
              <span className="block text-neutral-500 font-medium">Gender</span>
              <span className="block font-bold text-white truncate mt-0.5">Any</span>
            </div>
            <div className="px-1">
              <span className="block text-neutral-500 font-medium">Followers</span>
              <span className="block font-bold text-white truncate mt-0.5">{followerRangeStr}</span>
            </div>
            <div className="px-1">
              <span className="block text-neutral-500 font-medium">Budget</span>
              <span className="block font-bold text-[#00E639] truncate mt-0.5">{budget || "Collab"}</span>
            </div>
            <div className="px-1">
              <span className="block text-neutral-500 font-medium">Country</span>
              <span className="block font-bold text-white truncate mt-0.5">{targetCountryStr}</span>
            </div>
          </div>
        </div>

        {/* ── Hot Pink Action Button ── */}
        <div className="pt-1">
          <Link
            href={href}
            className="flex w-full items-center justify-center rounded-full bg-[#E60067] py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#FF0066] hover:scale-[1.02]"
          >
            {variant === "manage" ? "Manage Campaign" : "View and Apply"}
          </Link>
        </div>
      </div>
    </div>
  );
}

