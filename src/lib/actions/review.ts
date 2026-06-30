"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import {
  reviewSchema,
  type ReviewInput,
} from "@/lib/validations/review";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function checkReviewEligibility(campaignId: string) {
  const user = await requireUser();

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      status: true,
      brandProfile: { select: { userId: true } },
      applications: {
        where: { userId: user.id, status: "ACCEPTED" },
        select: { id: true },
      },
    },
  });

  if (!campaign) {
    return { eligible: false, reason: "Campaign not found." } as const;
  }

  if (campaign.status !== "COMPLETED") {
    return { eligible: false, reason: "Campaign must be completed before leaving a review." } as const;
  }

  const isBrandOwner = campaign.brandProfile.userId === user.id;
  const isAcceptedCreator = campaign.applications.length > 0;

  if (!isBrandOwner && !isAcceptedCreator) {
    return { eligible: false, reason: "You did not participate in this campaign." } as const;
  }

  const existing = await prisma.review.findUnique({
    where: { authorId_campaignId: { authorId: user.id, campaignId } },
    select: { id: true },
  });

  if (existing) {
    return { eligible: false, reason: "You have already reviewed this campaign." } as const;
  }

  const subjectId = isBrandOwner
    ? (await prisma.campaignApplication.findFirst({
        where: { campaignId, status: "ACCEPTED" },
        select: { userId: true },
      }))?.userId
    : campaign.brandProfile.userId;

  if (!subjectId) {
    return { eligible: false, reason: "No participant to review." } as const;
  }

  return { eligible: true, subjectId, authorRole: isBrandOwner ? "BRAND" : "CREATOR" } as const;
}

export async function createReview(rawData: ReviewInput): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const parsed = reviewSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { campaignId, subjectId, rating, body, categories } = parsed.data;

  const eligibility = await checkReviewEligibility(campaignId);
  if (!eligibility.eligible) {
    return { success: false, error: eligibility.reason };
  }

  if (eligibility.subjectId !== subjectId) {
    return { success: false, error: "Invalid review subject." };
  }

  if (user.id === subjectId) {
    return { success: false, error: "Cannot review yourself." };
  }

  const review = await prisma.review.create({
    data: {
      authorId: user.id,
      subjectId,
      campaignId,
      authorRole: eligibility.authorRole,
      rating,
      body,
      categories: categories ?? undefined,
    },
  });

  // Notify the reviewed user
  await prisma.notification.create({
    data: {
      userId:        subjectId,
      type:          "REVIEW_RECEIVED",
      title:         "New review received",
      body:          `You received a ${rating}-star review.`,
      referenceId:   review.id,
      referenceType: "Review",
      actionUrl:     `/campaigns/${campaignId}`,
    },
  });

  await updateAggregatedRatings(subjectId);

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath(`/creator`);
  revalidatePath(`/brand`);

  return { success: true, data: { id: review.id } };
}

async function updateAggregatedRatings(userId: string) {
  const reviews = await prisma.review.findMany({
    where: { subjectId: userId, isRemoved: false },
    select: { rating: true },
  });

  if (reviews.length === 0) return;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const reviewCount = reviews.length;

  await prisma.user.update({
    where: { id: userId },
    data: {},
  });

  const creatorProfile = await prisma.creatorProfile.findUnique({ where: { userId } });
  if (creatorProfile) {
    await prisma.creatorProfile.update({
      where: { userId },
      data: { avgRating: Math.round(avgRating * 100) / 100, reviewCount },
    });
  }

  const brandProfile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (brandProfile) {
    await prisma.brandProfile.update({
      where: { userId },
      data: { avgRating: Math.round(avgRating * 100) / 100, reviewCount },
    });
  }
}

export async function getSubjectReviews(subjectId: string) {
  const reviews = await prisma.review.findMany({
    where: { subjectId, isRemoved: false, isPublic: true },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          creatorProfile: { select: { username: true, displayName: true } },
          brandProfile: { select: { slug: true, companyName: true } },
        },
      },
      campaign: {
        select: { title: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    body: r.body,
    categories: r.categories as Record<string, number> | null,
    createdAt: r.createdAt,
    author: r.author,
    campaign: r.campaign,
  }));
}

export async function getMyReviewForCampaign(campaignId: string) {
  const user = await requireUser();

  return prisma.review.findUnique({
    where: { authorId_campaignId: { authorId: user.id, campaignId } },
  });
}

export async function getCompletedCampaignsForReview() {
  const user = await requireUser();

  const asBrand = await prisma.campaign.findMany({
    where: {
      brandProfile: { userId: user.id },
      status: "COMPLETED",
      reviews: { none: { authorId: user.id } },
    },
    select: {
      id: true,
      title: true,
      applications: {
        where: { status: "ACCEPTED" },
        take: 1,
        select: {
          creatorProfile: { select: { displayName: true, username: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const asCreator = await prisma.campaignApplication.findMany({
    where: {
      userId: user.id,
      status: "ACCEPTED",
      campaign: {
        status: "COMPLETED",
        reviews: { none: { authorId: user.id } },
      },
    },
    select: {
      campaignId: true,
      campaign: {
        select: {
          id: true,
          title: true,
          brandProfile: { select: { companyName: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return {
    asBrand: asBrand.map((c) => ({
      id: c.id,
      title: c.title,
      subjectName: c.applications[0]?.creatorProfile.displayName ?? c.applications[0]?.creatorProfile.username ?? "Creator",
    })),
    asCreator: asCreator.map((a) => ({
      id: a.campaignId,
      title: a.campaign.title,
      subjectName: a.campaign.brandProfile?.companyName ?? "Brand",
    })),
  };
}
