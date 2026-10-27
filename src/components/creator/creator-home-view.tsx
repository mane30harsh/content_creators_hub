"use client";

import { useState } from "react";
import { CreatorSidebar } from "./creator-sidebar";
import { CreatorSearchHeader } from "./creator-search-header";
import { CategoryPills } from "./category-pills";
import { CreatorFeedCard } from "./creator-feed-card";
import { CreatorSuggestions } from "./creator-suggestions";
import { CreatorNotificationsView } from "./creator-notifications-view";

interface CreatorHomeViewProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    avatar?: string | null;
  };
  campaigns: Array<{
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
    niche?: string[];
    brandProfile?: {
      companyName?: string | null;
      logo?: string | null;
      slug?: string | null;
    } | null;
  }>;
  savedCampaignIds: string[];
  appliedCampaignIds: string[];
  suggestions: Array<{
    id: string;
    name: string;
    avatar?: string | null;
    type: "brand" | "community";
    slug?: string;
  }>;
  initialTab?: "feed" | "notifications";
}

export function CreatorHomeView({
  user,
  campaigns,
  savedCampaignIds,
  appliedCampaignIds,
  suggestions,
  initialTab = "feed",
}: CreatorHomeViewProps) {
  const [showNotifications, setShowNotifications] = useState(initialTab === "notifications");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>("Food");

  const savedSet = new Set(savedCampaignIds);
  const appliedSet = new Set(appliedCampaignIds);

  const filteredCampaigns = campaigns.filter((c) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchBrand = c.brandProfile?.companyName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchBrand) return false;
    }

    // Category filter
    if (selectedCategory) {
      if (c.niche && c.niche.length > 0) {
        const matchesNiche = c.niche.some(
          (n) => n.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!matchesNiche) return false;
      }
    }

    return true;
  });

  return (
    <div className="flex min-h-screen justify-between bg-[#0A0A0A] text-white">
      {/* ── Left Navigation Sidebar (Figma: #0A0A0A) ── */}
      <CreatorSidebar user={user} />

      {/* ── Center Main Content Column (Figma: Post width 458px, container max-w-[490px]) ── */}
      <main className="flex-1 max-w-[490px] mx-auto px-4 py-7 space-y-6 overflow-y-auto no-scrollbar">
        {showNotifications ? (
          <CreatorNotificationsView
            onCloseNotifications={() => setShowNotifications(false)}
          />
        ) : (
          <>
            {/* Search Header */}
            <CreatorSearchHeader
              onSearch={setSearchQuery}
              onToggleNotifications={() => setShowNotifications(true)}
              showNotifications={showNotifications}
            />

            {/* Category Pills Bar */}
            <CategoryPills
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Feed Cards Section */}
            <div className="space-y-8 pt-2">
              {filteredCampaigns.length === 0 ? (
                <div className="rounded-[20px] border border-[rgba(88,88,88,0.4)] bg-[#0A0A0A] p-12 text-center text-neutral-400">
                  <p className="text-base font-semibold text-white">No campaigns found</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Try resetting your search or selecting a different category filter.
                  </p>
                </div>
              ) : (
                filteredCampaigns.map((c) => (
                  <CreatorFeedCard
                    key={c.id}
                    campaign={{
                      ...c,
                      isSaved: savedSet.has(c.id),
                      isApplied: appliedSet.has(c.id),
                    }}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Right Sidebar Suggestions ── */}
      <CreatorSuggestions suggestions={suggestions} />
    </div>
  );
}
