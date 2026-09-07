import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { CreatorHomeView } from "@/components/creator/creator-home-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Home – Brridge Creator" };

export default async function CreatorDashboardPage() {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
  });

  // Redirect to onboarding if creator profile hasn't set username yet
  if (!profile?.username) {
    redirect("/creator/onboarding");
  }

  // Fetch active open campaigns for creator home feed
  const rawCampaigns = await prisma.campaign.findMany({
    where: {
      status: "OPEN",
      isPublic: true,
      isRemoved: false,
    },
    include: {
      brandProfile: {
        select: {
          companyName: true,
          logo: true,
          slug: true,
        },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 20,
  });

  // Fallback demo campaigns if DB is empty so user gets exact UI look from meeting screenshot
  const defaultDemoCampaigns = [
    {
      id: "demo-gullylabs",
      title: "McDonald's Seeking Influencers",
      description:
        "McDonald's is seeking food and lifestyle influencers to create engaging content around new offers.",
      deliverableType: "INSTAGRAM_REEL",
      deliverableCount: 2,
      minFollowers: 5000,
      maxFollowers: 20000,
      country: ["Any"],
      niche: ["Food", "Lifestyle"],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      coverImage:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80",
      brandProfile: {
        companyName: "Gullylabs",
        logo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
        slug: "gullylabs",
      },
    },
    {
      id: "demo-mcdonalds",
      title: "New Product Launch Campaign",
      description:
        "Looking for creators to review and showcase our upcoming summer apparel collection.",
      deliverableType: "INSTAGRAM_POST",
      deliverableCount: 1,
      minFollowers: 10000,
      maxFollowers: 50000,
      country: ["India"],
      niche: ["Fashion", "Travel"],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      coverImage:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop&q=80",
      brandProfile: {
        companyName: "Mcdonald's",
        logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
        slug: "mcdonalds",
      },
    },
  ];

  const campaigns =
    rawCampaigns.length > 0
      ? rawCampaigns.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          deliverableType: c.deliverableType,
          deliverableCount: c.deliverableCount,
          minFollowers: c.minFollowers,
          maxFollowers: c.maxFollowers,
          country: c.country,
          createdAt: c.createdAt,
          coverImage: c.coverImage,
          niche: c.niche,
          brandProfile: c.brandProfile,
        }))
      : defaultDemoCampaigns;

  // Saved campaigns by current user
  const savedCampaigns = await prisma.savedCampaign.findMany({
    where: { userId: user.id },
    select: { campaignId: true },
  });
  const savedCampaignIds = savedCampaigns.map((s) => s.campaignId);

  // Applied campaigns by current user
  const applications = await prisma.campaignApplication.findMany({
    where: { userId: user.id },
    select: { campaignId: true },
  });
  const appliedCampaignIds = applications.map((a) => a.campaignId);

  // Suggested brands & communities
  const suggestedBrands = await prisma.brandProfile.findMany({
    take: 5,
    select: {
      id: true,
      companyName: true,
      logo: true,
      slug: true,
    },
  });

  const suggestions =
    suggestedBrands.length > 0
      ? suggestedBrands.map((b) => ({
          id: b.id,
          name: b.companyName || "Brand",
          avatar: b.logo,
          type: "brand" as const,
          slug: b.slug ?? undefined,
        }))
      : [
          {
            id: "s1",
            name: "Offduty India",
            avatar:
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
            type: "brand" as const,
            slug: "offduty-india",
          },
          {
            id: "s2",
            name: "Community",
            avatar:
              "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80",
            type: "community" as const,
          },
        ];

  return (
    <CreatorHomeView
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        username: profile.username,
        avatar: profile.avatar,
      }}
      campaigns={campaigns}
      savedCampaignIds={savedCampaignIds}
      appliedCampaignIds={appliedCampaignIds}
      suggestions={suggestions}
    />
  );
}
