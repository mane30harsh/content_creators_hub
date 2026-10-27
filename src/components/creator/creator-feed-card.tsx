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

  const defaultCover = "/images/creator/shoe-banner-clean.png";

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
    <article className="w-[458px] space-y-3">
      {/* ── Brand Header (Figma: Avatar 40px, Title 22px font-500, dot #585858, time 16px #585858) ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-neutral-800 bg-[#121216] shrink-0">
            <AvatarImage src={brandLogo ?? undefined} />
            <AvatarFallback className="bg-neutral-800 text-xs font-bold text-white">
              {brandName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <h4 className="text-[22px] font-medium leading-8 tracking-[-0.6px] text-white">
              {brandName}
            </h4>
            <span className="h-[3px] w-[3px] rounded-full bg-[#585858]" />
            <span className="text-[16px] font-medium leading-8 tracking-[-0.6px] text-[#585858]">
              {timeAgo}
            </span>
          </div>
        </div>

        <button className="text-white hover:text-[#FF006D] p-1 rounded-lg transition-colors">
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </div>

      {/* ── Content Card Container (Figma Frame 1171280404: border rgba(88,88,88,0.4), radius 20px, p-5) ── */}
      <div className="w-[458px] rounded-[20px] border border-[rgba(88,88,88,0.4)] bg-[#0A0A0A] p-[21px] space-y-[15px]">
        {/* Banner Image (Figma Rectangle 9193: radius 16px, h-[137px]) */}
        <div className="relative h-[137px] w-full overflow-hidden rounded-[16px] bg-neutral-900">
          <img
            src={campaign.coverImage || defaultCover}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Green Deliverable Badge (Figma Frame 1171280406: bg #00B000, radius 30px, h 36px, font 16px #FFFFFF) */}
        <div>
          <span className="inline-flex h-[36px] items-center justify-center rounded-[30px] bg-[#00B000] px-[24px] text-[16px] font-normal leading-8 tracking-[-0.6px] text-white shadow-sm">
            {deliverableText}
          </span>
        </div>

        {/* Description (Figma: font 16px, leading 19px, color #F3F5F5) */}
        <p className="text-[16px] font-normal leading-[19px] text-[#F3F5F5]">
          {campaign.description ||
            "McDonald's is seeking food and lifestyle influencers to create engaging content around new offers."}
        </p>

        {/* Specs Box (Figma Frame 1171280397: bg #232323, radius 16px, h 54px, labels #909090 14px, values #F3F5F5 14px) */}
        <div className="flex h-[54px] w-full items-center justify-center rounded-[16px] bg-[#232323] px-3">
          <div className="grid w-full grid-cols-4 text-center">
            <div>
              <span className="block text-[14px] font-medium leading-[17px] text-[#909090]">
                Gender
              </span>
              <span className="block text-[14px] font-medium leading-[17px] text-[#F3F5F5] mt-0.5">
                Any
              </span>
            </div>
            <div>
              <span className="block text-[14px] font-medium leading-[17px] text-[#909090]">
                Followers
              </span>
              <span className="block text-[14px] font-medium leading-[17px] text-[#F3F5F5] mt-0.5">
                {fmtFollowerRange(campaign.minFollowers, campaign.maxFollowers)}
              </span>
            </div>
            <div>
              <span className="block text-[14px] font-medium leading-[17px] text-[#909090]">
                Age
              </span>
              <span className="block text-[14px] font-medium leading-[17px] text-[#F3F5F5] mt-0.5">
                20-30
              </span>
            </div>
            <div>
              <span className="block text-[14px] font-medium leading-[17px] text-[#909090]">
                Country
              </span>
              <span className="block text-[14px] font-medium leading-[17px] text-[#F3F5F5] mt-0.5">
                {campaign.country && campaign.country.length > 0 ? campaign.country[0] : "Any"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Actions Row (Figma: View & Apply buttons with radius 30px, h 36px, font 16px 500) ── */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-[10px]">
          {/* View Button (Figma Frame 1171280406: border rgba(255,0,109,0.4), radius 30px, w 86px, h 36px) */}
          <Link
            href={`/campaigns/${campaign.id}`}
            className="flex h-[36px] w-[86px] items-center justify-center rounded-[30px] border border-[rgba(255,0,109,0.4)] bg-transparent text-[16px] font-medium leading-8 tracking-[-0.6px] text-white hover:bg-neutral-900 transition-colors"
          >
            View
          </Link>

          {/* Apply Button (Figma Frame 1171280407: bg #FF006D, border rgba(255,0,109,0.4), radius 30px, w 92px, h 36px) */}
          <button
            onClick={handleQuickApply}
            disabled={applied || applying}
            className={`flex h-[36px] w-[92px] items-center justify-center rounded-[30px] border border-[rgba(255,0,109,0.4)] bg-[#FF006D] text-[16px] font-medium leading-8 tracking-[-0.6px] text-white transition-all hover:bg-[#e60062] ${
              applied ? "opacity-80 cursor-default" : ""
            }`}
          >
            {applied ? "Applied" : applying ? "Applying..." : "Apply"}
          </button>

          {/* Send Icon (Figma Iconex/Light/Send: 20px x 20px, white border) */}
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
            className="text-white hover:text-[#FF006D] transition-colors ml-2 p-1"
            title="Share"
          >
            <Send className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Bookmark Icon (Figma Iconex/Light/Bookmark: 14px x 19px, white border) */}
        <button
          onClick={handleSaveToggle}
          className={`text-white p-1 transition-colors ${
            saved ? "text-[#FF006D] fill-[#FF006D]" : "hover:text-[#FF006D]"
          }`}
          title="Bookmark"
        >
          <Bookmark className="h-5 w-5 stroke-[1.5]" />
        </button>
      </div>
    </article>
  );
}
