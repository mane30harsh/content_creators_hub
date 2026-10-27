import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getMyApplications } from "@/lib/actions/campaign";
import { CreatorCollabsView } from "@/components/creator/creator-collabs-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Collabs – Brridge" };

export default async function CreatorCampaignsPage() {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
  });

  const rawApplications = await getMyApplications();

  const applications = rawApplications.map((app) => ({
    id: app.id,
    campaignId: app.campaignId,
    status: app.status,
    createdAt: app.createdAt,
    campaign: {
      id: app.campaign.id,
      title: app.campaign.title,
      deliverableType: app.campaign.deliverableType,
      deliverableCount: app.campaign.deliverableCount,
      brandProfile: app.campaign.brandProfile
        ? {
            companyName: app.campaign.brandProfile.companyName,
            logo: app.campaign.brandProfile.logo,
            slug: app.campaign.brandProfile.slug,
          }
        : null,
    },
  }));

  // Suggested brands
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
          avatar: b.logo || "/images/creator/offduty-logo.png",
          type: "brand" as const,
          slug: b.slug ?? undefined,
        }))
      : [
          {
            id: "s1",
            name: "Offduty India",
            avatar: "/images/creator/offduty-logo.png",
            type: "brand" as const,
            slug: "offduty-india",
          },
          {
            id: "s2",
            name: "Community",
            avatar: "/images/creator/community-logo.png",
            type: "community" as const,
          },
        ];

  return (
    <CreatorCollabsView
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        username: profile?.username,
        avatar: profile?.avatar,
      }}
      applications={applications}
      suggestions={suggestions}
    />
  );
}
