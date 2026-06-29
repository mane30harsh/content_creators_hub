"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import {
  campaignSchema,
  applicationSchema,
  reviewApplicationSchema,
  type CampaignInput,
  type ApplicationInput,
  type ReviewApplicationInput,
} from "@/lib/validations/campaign";

// ─── Shared result type (matches friend's pattern) ─────────────

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Helpers ───────────────────────────────────────────────────

function revalidateCampaignPaths(campaignId?: string) {
  revalidatePath("/brand/campaigns");
  revalidatePath("/brand/dashboard");
  revalidatePath("/campaigns");
  if (campaignId) {
    revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath(`/brand/campaigns/${campaignId}`);
  }
}

/** Dollars → cents. Undefined stays undefined. */
function toCents(dollars: number | undefined) {
  return dollars !== undefined ? Math.round(dollars * 100) : undefined;
}

// ─── Brand: create campaign ────────────────────────────────────

export async function createCampaign(
  rawData: CampaignInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const parsed = campaignSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!brandProfile) {
    return { success: false, error: "Complete your brand profile before creating a campaign." };
  }

  const campaign = await prisma.campaign.create({
    data: {
      brandProfileId: brandProfile.id,
      title:            data.title,
      description:      data.description,
      deliverableType:  data.deliverableType as never,
      deliverableCount: data.deliverableCount,
      deliverableNotes: data.deliverableNotes || null,
      budgetMinCents:   toCents(data.budgetMin),
      budgetMaxCents:   toCents(data.budgetMax),
      currency:         data.currency,
      niche:            data.niche,
      country:          data.country,
      language:         data.language,
      minFollowers:     data.minFollowers,
      maxFollowers:     data.maxFollowers,
      applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
      campaignStartDate:   data.campaignStartDate   ? new Date(data.campaignStartDate)   : null,
      campaignEndDate:     data.campaignEndDate      ? new Date(data.campaignEndDate)     : null,
      maxAccepted:      data.maxAccepted,
      maxApplications:  data.maxApplications,
      isPublic:         data.isPublic,
      tags:             data.tags,
      coverImage:       data.coverImage || null,
      status:           "DRAFT",
    },
  });

  revalidateCampaignPaths(campaign.id);
  return { success: true, data: { id: campaign.id } };
}

// ─── Brand: update campaign ────────────────────────────────────

export async function updateCampaign(
  campaignId: string,
  rawData: CampaignInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const parsed = campaignSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  // Verify ownership
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandProfile: { userId: user.id } },
    select: { id: true, status: true },
  });
  if (!campaign) return { success: false, error: "Campaign not found." };
  if (campaign.status === "COMPLETED" || campaign.status === "CANCELLED") {
    return { success: false, error: "Cannot edit a completed or cancelled campaign." };
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      title:            data.title,
      description:      data.description,
      deliverableType:  data.deliverableType as never,
      deliverableCount: data.deliverableCount,
      deliverableNotes: data.deliverableNotes || null,
      budgetMinCents:   toCents(data.budgetMin),
      budgetMaxCents:   toCents(data.budgetMax),
      currency:         data.currency,
      niche:            data.niche,
      country:          data.country,
      language:         data.language,
      minFollowers:     data.minFollowers,
      maxFollowers:     data.maxFollowers,
      applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
      campaignStartDate:   data.campaignStartDate   ? new Date(data.campaignStartDate)   : null,
      campaignEndDate:     data.campaignEndDate      ? new Date(data.campaignEndDate)     : null,
      maxAccepted:      data.maxAccepted,
      maxApplications:  data.maxApplications,
      isPublic:         data.isPublic,
      tags:             data.tags,
      coverImage:       data.coverImage || null,
    },
  });

  revalidateCampaignPaths(campaignId);
  return { success: true, data: { id: campaignId } };
}

// ─── Brand: publish campaign (DRAFT → OPEN) ────────────────────

export async function publishCampaign(
  campaignId: string
): Promise<ActionResult> {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandProfile: { userId: user.id } },
    select: { id: true, status: true },
  });
  if (!campaign) return { success: false, error: "Campaign not found." };
  if (campaign.status !== "DRAFT") {
    return { success: false, error: "Only draft campaigns can be published." };
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "OPEN" },
  });

  revalidateCampaignPaths(campaignId);
  return { success: true, data: undefined };
}

// ─── Brand: close/cancel campaign ─────────────────────────────

export async function closeCampaign(
  campaignId: string,
  action: "COMPLETED" | "CANCELLED"
): Promise<ActionResult> {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandProfile: { userId: user.id } },
    select: { id: true, status: true },
  });
  if (!campaign) return { success: false, error: "Campaign not found." };

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: action },
  });

  revalidateCampaignPaths(campaignId);
  return { success: true, data: undefined };
}

// ─── Brand: review application ─────────────────────────────────

export async function reviewApplication(
  rawData: ReviewApplicationInput
): Promise<ActionResult> {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const parsed = reviewApplicationSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const { applicationId, status, brandNote, rejectionReason } = parsed.data;

  // Verify brand owns the campaign this application is for
  const application = await prisma.campaignApplication.findFirst({
    where: {
      id: applicationId,
      campaign: { brandProfile: { userId: user.id } },
    },
    select: { id: true, campaignId: true },
  });
  if (!application) return { success: false, error: "Application not found." };

  const now = new Date();
  await prisma.campaignApplication.update({
    where: { id: applicationId },
    data: {
      status: status as never,
      brandNote:        brandNote || null,
      rejectionReason:  rejectionReason || null,
      shortlistedAt:    status === "SHORTLISTED" ? now : undefined,
      acceptedAt:       status === "ACCEPTED"    ? now : undefined,
      rejectedAt:       status === "REJECTED"    ? now : undefined,
    },
  });

  // If accepted, notify via notification (non-blocking)
  if (status === "ACCEPTED") {
    const app = await prisma.campaignApplication.findUnique({
      where: { id: applicationId },
      select: { userId: true, campaign: { select: { title: true } } },
    });
    if (app) {
      await prisma.notification.create({
        data: {
          userId:        app.userId,
          type:          "APPLICATION_UPDATED",
          title:         "Your application was accepted! 🎉",
          body:          `You've been accepted for "${app.campaign.title}".`,
          referenceId:   applicationId,
          referenceType: "CampaignApplication",
          actionUrl:     `/creator/campaigns`,
        },
      });
    }
  }

  revalidatePath(`/brand/campaigns/${application.campaignId}`);
  revalidatePath("/creator/campaigns");
  return { success: true, data: undefined };
}

// ─── Brand: get own campaigns ──────────────────────────────────

export async function getMyBrandCampaigns() {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!brandProfile) return [];

  return prisma.campaign.findMany({
    where: { brandProfileId: brandProfile.id },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Brand: get single campaign with applications ──────────────

export async function getBrandCampaignDetail(campaignId: string) {
  const user = await requireRole(["BRAND", "ADMIN"]);

  return prisma.campaign.findFirst({
    where: {
      id: campaignId,
      brandProfile: { userId: user.id },
    },
    include: {
      applications: {
        include: {
          creatorProfile: {
            select: {
              displayName: true,
              username:    true,
              avatar:      true,
              niche:       true,
              instagramFollowers: true,
              youtubeSubscribers: true,
              tiktokFollowers:    true,
              twitterFollowers:   true,
              avgRating:          true,
              reviewCount:        true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { applications: true, savedBy: true } },
    },
  });
}

// ─── Public: browse open campaigns ────────────────────────────

export async function getPublicCampaigns(filters: {
  niche?: string;
  deliverableType?: string;
  budgetMin?: number;
  budgetMax?: number;
  search?: string;
  page?: number;
}) {
  const PAGE_SIZE = 12;
  const page = filters.page ?? 1;

  const where = {
    status: "OPEN" as never,
    isPublic: true,
    ...(filters.niche && { niche: { has: filters.niche } }),
    ...(filters.deliverableType && { deliverableType: filters.deliverableType as never }),
    ...(filters.budgetMin && { budgetMaxCents: { gte: filters.budgetMin * 100 } }),
    ...(filters.budgetMax && { budgetMinCents: { lte: filters.budgetMax * 100 } }),
    ...(filters.search && {
      OR: [
        { title:       { contains: filters.search, mode: "insensitive" as never } },
        { description: { contains: filters.search, mode: "insensitive" as never } },
      ],
    }),
  };

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      include: {
        brandProfile: {
          select: {
            companyName: true,
            logo:        true,
            slug:        true,
            isVerified:  true,
          },
        },
        _count: { select: { applications: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
    }),
    prisma.campaign.count({ where }),
  ]);

  return { campaigns, total, page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) };
}

// ─── Public: get single campaign detail ───────────────────────

export async function getPublicCampaignDetail(campaignId: string) {
  return prisma.campaign.findFirst({
    where: { id: campaignId, isPublic: true },
    include: {
      brandProfile: {
        select: {
          companyName: true,
          logo:        true,
          slug:        true,
          bio:         true,
          industry:    true,
          isVerified:  true,
          websiteUrl:  true,
        },
      },
      _count: { select: { applications: true } },
    },
  });
}

// ─── Creator: apply to campaign ────────────────────────────────

export async function applyToCampaign(
  rawData: ApplicationInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const parsed = applicationSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { campaignId, pitch, proposedRate } = parsed.data;

  // Get creator profile
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!creatorProfile) {
    return { success: false, error: "Complete your creator profile before applying." };
  }

  // Check campaign exists and is open
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, status: "OPEN", isPublic: true },
    select: { id: true, title: true, maxApplications: true, _count: { select: { applications: true } } },
  });
  if (!campaign) return { success: false, error: "Campaign is not accepting applications." };

  // Check application limit
  if (campaign.maxApplications && campaign._count.applications >= campaign.maxApplications) {
    return { success: false, error: "This campaign has reached its maximum number of applications." };
  }

  // Check not already applied
  const existing = await prisma.campaignApplication.findUnique({
    where: { campaignId_creatorProfileId: { campaignId, creatorProfileId: creatorProfile.id } },
  });
  if (existing) return { success: false, error: "You have already applied to this campaign." };

  const application = await prisma.campaignApplication.create({
    data: {
      campaignId,
      creatorProfileId: creatorProfile.id,
      userId:           user.id,
      pitch,
      proposedRateCents: toCents(proposedRate),
      currency:          "USD",
    },
  });

  // Notify brand
  const brandUser = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { brandProfile: { select: { userId: true } } },
  });
  if (brandUser?.brandProfile) {
    await prisma.notification.create({
      data: {
        userId:        brandUser.brandProfile.userId,
        type:          "APPLICATION_RECEIVED",
        title:         "New campaign application",
        body:          `Someone applied to "${campaign.title}".`,
        referenceId:   application.id,
        referenceType: "CampaignApplication",
        actionUrl:     `/brand/campaigns/${campaignId}`,
      },
    });
  }

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/creator/campaigns");
  return { success: true, data: { id: application.id } };
}

// ─── Creator: withdraw application ────────────────────────────

export async function withdrawApplication(
  applicationId: string
): Promise<ActionResult> {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const application = await prisma.campaignApplication.findFirst({
    where: { id: applicationId, userId: user.id },
    select: { id: true, status: true, campaignId: true },
  });
  if (!application) return { success: false, error: "Application not found." };
  if (application.status === "ACCEPTED") {
    return { success: false, error: "Cannot withdraw an accepted application." };
  }

  await prisma.campaignApplication.update({
    where: { id: applicationId },
    data: { status: "WITHDRAWN", withdrawnAt: new Date() },
  });

  revalidatePath("/creator/campaigns");
  revalidatePath(`/campaigns/${application.campaignId}`);
  return { success: true, data: undefined };
}

// ─── Creator: get my applications ─────────────────────────────

export async function getMyApplications() {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  return prisma.campaignApplication.findMany({
    where: { userId: user.id },
    include: {
      campaign: {
        include: {
          brandProfile: {
            select: { companyName: true, logo: true, slug: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Creator: save/unsave campaign ────────────────────────────

export async function toggleSaveCampaign(
  campaignId: string
): Promise<ActionResult<{ saved: boolean }>> {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const existing = await prisma.savedCampaign.findUnique({
    where: { userId_campaignId: { userId: user.id, campaignId } },
  });

  if (existing) {
    await prisma.savedCampaign.delete({
      where: { userId_campaignId: { userId: user.id, campaignId } },
    });
    revalidatePath("/campaigns");
    return { success: true, data: { saved: false } };
  }

  await prisma.savedCampaign.create({
    data: { userId: user.id, campaignId },
  });

  revalidatePath("/campaigns");
  return { success: true, data: { saved: true } };
}
