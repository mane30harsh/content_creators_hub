"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Send, Bookmark } from "lucide-react";
import { DELIVERABLE_TYPE_LABELS } from "@/lib/validations/campaign";
import { applyToCampaign, toggleSaveCampaign } from "@/lib/actions/campaign";
import { toast } from "sonner";

interface CreatorFeedCardProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    deliverableType: string;
    deliverableCount: number;
    minFollowers?: number | null;
    maxFollowers?: number | null;
    country?: string[];
    createdAt?: Date | string | null;
    coverImage?: string | null;
    brandProfile?: {
      companyName?: string | null;
      logo?: string | null;
      slug?: string | null;
    } | null;
    isSaved?: boolean;
    isApplied?: boolean;
  };
}

function fmtTimeAgo(date?: Date | string | null) {
  if (!date) return "2 days";
  const now = new Date();
  const d = new Date(date);
  const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} days`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks} w`;
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
  return "5k-20k";
}

export function CreatorFeedCard({ campaign }: CreatorFeedCardProps) {
  const [saved, setSaved] = useState(campaign.isSaved ?? false);
  const [applied, setApplied] = useState(campaign.isApplied ?? false);
  const [applying, setApplying] = useState(false);

  const brandName = campaign.brandProfile?.companyName || "Gullylabs";
  const brandLogo = campaign.brandProfile?.logo;
  const timeAgo = fmtTimeAgo(campaign.createdAt);
  const deliverableText = `${campaign.deliverableCount} x ${
    DELIVERABLE_TYPE_LABELS[campaign.deliverableType] || campaign.deliverableType || "Instagram reels"
  }`;

  const defaultCover =
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900&auto=format&fit=crop&q=80";

  const handleSaveToggle = async () => {
    try {
      setSaved(!saved);
      const res = await toggleSaveCampaign(campaign.id);
      if (res.success) {
        setSaved(res.data.saved);
        toast.success(res.data.saved ? "Saved campaign!" : "Removed from saved.");
      }
    } catch {
      toast.error("Failed to update bookmark.");
    }
  };

  const handleQuickApply = async () => {
    if (applied) return;
    try {
      setApplying(true);
      const res = await applyToCampaign({
        campaignId: campaign.id,
        pitch: "Interested in collaborating for this opportunity!",
        currency: "USD",
      });
      if (res.success) {
        setApplied(true);
        toast.success("Application submitted successfully!");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Something went wrong applying.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-neutral-800/60 bg-[#0E0E12] p-5 transition-all">
      {/* ── Brand Header ── */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-neutral-800 bg-[#1e293b]">
            <AvatarImage src={brandLogo ?? undefined} />
            <AvatarFallback className="bg-[#1e40af] text-sm font-bold text-white">
              {brandName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white tracking-tight">{brandName}</h4>
            <span className="text-xs text-neutral-400 font-medium">· {timeAgo}</span>
          </div>
        </div>

        <button className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* ── Banner Image ── */}
      <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-neutral-900 mb-4">
        <img
          src={campaign.coverImage || defaultCover}
          alt={campaign.title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* ── Green Deliverable Badge ── */}
      <div className="mb-3">
        <span className="inline-flex rounded-full bg-[#00E639] px-4 py-1.5 text-xs font-bold text-black shadow-sm">
          {deliverableText}
        </span>
      </div>

      {/* ── Description ── */}
      <p className="text-sm leading-relaxed text-neutral-200 font-normal mb-4">
        {campaign.description ||
          "McDonald's is seeking food and lifestyle influencers to create engaging content around new offers."}
      </p>

      {/* ── Specs Box ── */}
      <div className="rounded-2xl border border-neutral-800/80 bg-[#16161B] p-3.5 mb-5">
        <div className="grid grid-cols-4 divide-x divide-neutral-800/80 text-center text-xs">
          <div className="px-1">
            <span className="block text-[11px] text-neutral-400 font-medium">Gender</span>
            <span className="block font-bold text-white mt-1">Any</span>
          </div>
          <div className="px-1">
            <span className="block text-[11px] text-neutral-400 font-medium">Followers</span>
            <span className="block font-bold text-white mt-1">
              {fmtFollowerRange(campaign.minFollowers, campaign.maxFollowers)}
            </span>
          </div>
          <div className="px-1">
            <span className="block text-[11px] text-neutral-400 font-medium">Age</span>
            <span className="block font-bold text-white mt-1">20-30</span>
          </div>
          <div className="px-1">
            <span className="block text-[11px] text-neutral-400 font-medium">Country</span>
            <span className="block font-bold text-white mt-1">
              {campaign.country && campaign.country.length > 0 ? campaign.country[0] : "Any"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer Actions Row ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/campaigns/${campaign.id}`}
            className="rounded-full border border-neutral-700 bg-transparent px-6 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
          >
            View
          </Link>
          <button
            onClick={handleQuickApply}
            disabled={applied || applying}
            className={`rounded-full border border-neutral-700 bg-transparent px-6 py-2 text-xs font-semibold text-white transition-all hover:bg-neutral-800 ${
              applied ? "bg-[#FF007A] border-[#FF007A] text-white opacity-80 cursor-default" : ""
            }`}
          >
            {applied ? "Applied" : applying ? "Applying..." : "Apply"}
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: campaign.title,
                  url: window.location.origin + `/campaigns/${campaign.id}`,
                });
              } else {
                navigator.clipboard.writeText(
                  window.location.origin + `/campaigns/${campaign.id}`
                );
                toast.success("Link copied!");
              }
            }}
            className="text-neutral-400 hover:text-white transition-colors ml-1 p-1"
            title="Share"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={handleSaveToggle}
          className={`text-neutral-400 p-1 transition-colors ${
            saved ? "text-[#FF007A] fill-[#FF007A]" : "hover:text-white"
          }`}
          title="Bookmark"
        >
          <Bookmark className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}
