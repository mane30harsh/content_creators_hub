import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckCheck } from "lucide-react";
import { getNotifications, markAllAsRead } from "@/lib/actions/notification";
import { NotificationsList } from "./notifications-list";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/back-button";
import { CreatorHomeView } from "@/components/creator/creator-home-view";
import type { NotificationItem } from "@/components/notifications/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications – Brridge" };

export default async function NotificationsPage() {
  const session = await auth();
  const role = session?.user?.role;

  // If logged in as Creator, render the 3-column Notifications layout matching meeting UI
  if (role === "CREATOR" && session?.user) {
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    const rawCampaigns = await prisma.campaign.findMany({
      where: { status: "OPEN", isPublic: true, isRemoved: false },
      include: {
        brandProfile: { select: { companyName: true, logo: true, slug: true } },
      },
      take: 20,
    });

    const campaigns = rawCampaigns.map((c) => ({
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
    }));

    const savedCampaigns = await prisma.savedCampaign.findMany({
      where: { userId: session.user.id },
      select: { campaignId: true },
    });
    const applications = await prisma.campaignApplication.findMany({
      where: { userId: session.user.id },
      select: { campaignId: true },
    });

    const suggestedBrands = await prisma.brandProfile.findMany({
      take: 5,
      select: { id: true, companyName: true, logo: true, slug: true },
    });

    const suggestions = suggestedBrands.map((b) => ({
      id: b.id,
      name: b.companyName || "Brand",
      avatar: b.logo,
      type: "brand" as const,
      slug: b.slug ?? undefined,
    }));

    return (
      <CreatorHomeView
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          username: profile?.username,
          avatar: profile?.avatar,
        }}
        campaigns={campaigns}
        savedCampaignIds={savedCampaigns.map((s) => s.campaignId)}
        appliedCampaignIds={applications.map((a) => a.campaignId)}
        suggestions={suggestions}
        initialTab="notifications"
      />
    );
  }

  // Fallback for Brand / Admin users
  const { data, nextCursor } = await getNotifications();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <BackButton />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay up to date with your activity.
          </p>
        </div>
        {data.length > 0 && (
          <form action={markAllAsRead}>
            <Button variant="outline" size="sm" type="submit">
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Mark all read
            </Button>
          </form>
        )}
      </div>

      <NotificationsList initialItems={data as NotificationItem[]} initialCursor={nextCursor} />
    </main>
  );
}
