"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreatorSidebar } from "./creator-sidebar";
import { CreatorSuggestions } from "./creator-suggestions";
import { toast } from "sonner";

interface CollabsViewProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    avatar?: string | null;
  };
  applications: Array<{
    id: string;
    campaignId: string;
    status: string;
    createdAt?: Date | string | null;
    campaign: {
      id: string;
      title: string;
      deliverableType: string;
      deliverableCount: number;
      brandProfile?: {
        companyName?: string | null;
        logo?: string | null;
        slug?: string | null;
      } | null;
    };
  }>;
  suggestions: Array<{
    id: string;
    name: string;
    avatar?: string | null;
    type: "brand" | "community";
    slug?: string;
  }>;
}

export function CreatorCollabsView({
  user,
  applications,
  suggestions,
}: CollabsViewProps) {
  const [activeTab, setActiveTab] = useState<"applied" | "active" | "completed">("active");
  const [currentStep, setCurrentStep] = useState<number>(1); // 0 = Approved, 1 = Preparing, 2 = Submitted

  const tabs = [
    { id: "applied", label: "Applied" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
  ] as const;

  // Filter applications by tab status
  const filteredApps = applications.filter((app) => {
    if (activeTab === "applied") return app.status === "PENDING" || app.status === "SHORTLISTED";
    if (activeTab === "active") return app.status === "ACCEPTED" || app.status === "ACTIVE";
    if (activeTab === "completed") return app.status === "COMPLETED";
    return true;
  });

  const handleUpdateStatus = () => {
    const next = (currentStep + 1) % 3;
    setCurrentStep(next);
    const steps = ["Approved", "Preparing", "Submitted"];
    toast.success(`Collab status updated to: ${steps[next]}`);
  };

  return (
    <div className="flex min-h-screen justify-between bg-[#0A0A0A] text-white">
      {/* ── Left Navigation Sidebar (Figma: #0A0A0A) ── */}
      <CreatorSidebar user={user} />

      {/* ── Center Column (Figma: width 448px - 490px) ── */}
      <main className="flex-1 max-w-[490px] mx-auto px-4 py-7 space-y-6 overflow-y-auto no-scrollbar">
        {/* Header Title (Figma: 22px font-500, letter-spacing -0.6px, line-height 32px) */}
        <div>
          <h1 className="text-[22px] font-medium leading-8 tracking-[-0.6px] text-white">
            Collabs
          </h1>
        </div>

        {/* Filter Tabs (Figma: h 36px, radius 30px, border rgba(255,0,109,0.4), active #FF006D) */}
        <div className="flex items-center gap-[15px]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex h-[36px] items-center justify-center rounded-[30px] border border-[rgba(255,0,109,0.4)] px-[24px] text-[16px] font-medium leading-8 tracking-[-0.6px] transition-all duration-150 ${
                  isActive
                    ? "bg-[#FF006D] text-white"
                    : "bg-transparent text-white hover:border-[#FF006D]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Collabs Cards List / Track Campaign Container */}
        <div className="space-y-6 pt-2">
          {filteredApps.length === 0 ? (
            /* Figma Track Campaign Card (Default Demo / Active Collab) */
            <div className="w-[448px] rounded-[16px] border border-[#262626] bg-[#0F0F0F] p-6 space-y-7">
              {/* Brand Header */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-neutral-800 bg-[#121216] shrink-0">
                  <AvatarImage src="/images/creator/gullylabs-logo.png" />
                  <AvatarFallback className="bg-neutral-800 text-xs font-bold text-white">
                    GL
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-[22px] font-medium leading-8 tracking-[-0.6px] text-white">
                  Gullylabs
                </h3>
              </div>

              {/* Status Stepper (Figma: Approved, Preparing, Submitted) */}
              <div className="relative py-2">
                {/* Connecting Dotted Line */}
                <div className="absolute top-[23px] left-[45px] right-[45px] h-0 border-t border-dashed border-[#FF006D]/60" />

                {/* Steps Row */}
                <div className="relative flex items-center justify-between px-2">
                  {/* Step 1: Approved */}
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#E60067]/40">
                      <div className="h-[15px] w-[15px] rounded-full bg-[#FAFF00] shadow-[0_0_8px_#FAFF00]" />
                    </div>
                    <span className="mt-2 text-[14px] font-medium leading-[17px] text-white">
                      Approved
                    </span>
                  </div>

                  {/* Step 2: Preparing */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all ${
                        currentStep >= 1 ? "bg-[#E60067]/40" : "bg-neutral-800"
                      }`}
                    >
                      <div
                        className={`h-[15px] w-[15px] rounded-full transition-all ${
                          currentStep >= 1
                            ? "bg-[#FAFF00] shadow-[0_0_8px_#FAFF00]"
                            : "bg-neutral-600"
                        }`}
                      />
                    </div>
                    <span className="mt-2 text-[14px] font-medium leading-[17px] text-white">
                      Preparing
                    </span>
                  </div>

                  {/* Step 3: Submitted */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all ${
                        currentStep >= 2 ? "bg-[#E60067]/40" : "bg-neutral-800"
                      }`}
                    >
                      <div
                        className={`h-[15px] w-[15px] rounded-full transition-all ${
                          currentStep >= 2
                            ? "bg-[#FAFF00] shadow-[0_0_8px_#FAFF00]"
                            : "bg-neutral-600"
                        }`}
                      />
                    </div>
                    <span className="mt-2 text-[14px] font-medium leading-[17px] text-white">
                      Submitted
                    </span>
                  </div>
                </div>
              </div>

              {/* Update Status Button (Figma: w 382px, h 36px, bg #FF006D, radius 30px) */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleUpdateStatus}
                  className="flex h-[36px] w-[382px] items-center justify-center rounded-[30px] bg-[#FF006D] text-[16px] font-medium leading-8 tracking-[-0.6px] text-white hover:bg-[#e60062] transition-colors shadow-lg shadow-[#FF006D]/20"
                >
                  Update status
                </button>
              </div>
            </div>
          ) : (
            filteredApps.map((app) => (
              <div
                key={app.id}
                className="w-[448px] rounded-[16px] border border-[#262626] bg-[#0F0F0F] p-6 space-y-7"
              >
                {/* Brand Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-neutral-800 bg-[#121216] shrink-0">
                      <AvatarImage
                        src={app.campaign.brandProfile?.logo || "/images/creator/gullylabs-logo.png"}
                      />
                      <AvatarFallback className="bg-neutral-800 text-xs font-bold text-white">
                        {app.campaign.brandProfile?.companyName?.slice(0, 2).toUpperCase() || "GL"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-[22px] font-medium leading-8 tracking-[-0.6px] text-white">
                        {app.campaign.brandProfile?.companyName || "Gullylabs"}
                      </h3>
                      <p className="text-xs text-neutral-400 font-medium">
                        {app.campaign.title}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/campaigns/${app.campaignId}`}
                    className="text-xs font-semibold text-[#FF006D] hover:underline"
                  >
                    View details
                  </Link>
                </div>

                {/* Status Stepper */}
                <div className="relative py-2">
                  <div className="absolute top-[23px] left-[45px] right-[45px] h-0 border-t border-dashed border-[#FF006D]/60" />
                  <div className="relative flex items-center justify-between px-2">
                    <div className="flex flex-col items-center">
                      <div className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#E60067]/40">
                        <div className="h-[15px] w-[15px] rounded-full bg-[#FAFF00] shadow-[0_0_8px_#FAFF00]" />
                      </div>
                      <span className="mt-2 text-[14px] font-medium leading-[17px] text-white">
                        Approved
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        className={`relative flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all ${
                          app.status === "ACCEPTED" || app.status === "ACTIVE"
                            ? "bg-[#E60067]/40"
                            : "bg-neutral-800"
                        }`}
                      >
                        <div
                          className={`h-[15px] w-[15px] rounded-full transition-all ${
                            app.status === "ACCEPTED" || app.status === "ACTIVE"
                              ? "bg-[#FAFF00] shadow-[0_0_8px_#FAFF00]"
                              : "bg-neutral-600"
                          }`}
                        />
                      </div>
                      <span className="mt-2 text-[14px] font-medium leading-[17px] text-white">
                        Preparing
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        className={`relative flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all ${
                          app.status === "COMPLETED" ? "bg-[#E60067]/40" : "bg-neutral-800"
                        }`}
                      >
                        <div
                          className={`h-[15px] w-[15px] rounded-full transition-all ${
                            app.status === "COMPLETED"
                              ? "bg-[#FAFF00] shadow-[0_0_8px_#FAFF00]"
                              : "bg-neutral-600"
                          }`}
                        />
                      </div>
                      <span className="mt-2 text-[14px] font-medium leading-[17px] text-white">
                        Submitted
                      </span>
                    </div>
                  </div>
                </div>

                {/* Update Status Button */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleUpdateStatus}
                    className="flex h-[36px] w-[382px] items-center justify-center rounded-[30px] bg-[#FF006D] text-[16px] font-medium leading-8 tracking-[-0.6px] text-white hover:bg-[#e60062] transition-colors shadow-lg shadow-[#FF006D]/20"
                  >
                    Update status
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ── Right Sidebar Suggestions ── */}
      <CreatorSuggestions suggestions={suggestions} />
    </div>
  );
}
