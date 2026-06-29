"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import { uploadFile as storageUpload } from "@/lib/storage";
import type { $Enums } from "@prisma/client";
import {
  portfolioItemSchema,
  type PortfolioItemInput,
} from "@/lib/validations/creator-profile";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Upload file (abstraction — swap storage provider here) ─────

export async function uploadPortfolioFile(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  await requireRole(["CREATOR", "ADMIN"]);
  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided" };

  try {
    const result = await storageUpload(file);
    return { success: true, data: { url: result.url } };
  } catch {
    return { success: false, error: "Upload failed" };
  }
}

// ─── Get all portfolio items for current creator ──────────────────

export async function getMyPortfolio() {
  const user = await requireRole(["CREATOR", "ADMIN"]);
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) return [];
  return prisma.portfolioItem.findMany({
    where: { creatorProfileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });
}

// ─── Get portfolio items for a public profile ─────────────────────

export async function getPublicPortfolio(profileId: string) {
  return prisma.portfolioItem.findMany({
    where: { creatorProfileId: profileId, isPublic: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ─── Create portfolio item ────────────────────────────────────────

export async function createPortfolioItem(
  rawData: PortfolioItemInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const parsed = portfolioItemSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "Complete your creator profile first" };
  }

  const item = await prisma.portfolioItem.create({
    data: {
      creatorProfileId: profile.id,
      title: data.title,
      brandName: data.brandName || null,
      description: data.description || null,
      mediaType: data.mediaType as $Enums.MediaType,
      mediaUrl: data.mediaUrl,
      externalUrl: data.externalUrl || null,
      views: data.views ?? null,
      likes: data.likes ?? null,
      comments: data.comments ?? null,
      shares: data.shares ?? null,
      engagementRate: data.engagementRate ?? null,
    },
  });

  revalidatePath("/creator/profile/edit");
  return { success: true, data: { id: item.id } };
}

// ─── Update portfolio item ────────────────────────────────────────

export async function updatePortfolioItem(
  itemId: string,
  rawData: PortfolioItemInput
): Promise<ActionResult<void>> {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const parsed = portfolioItemSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "Complete your creator profile first" };
  }

  const existing = await prisma.portfolioItem.findFirst({
    where: { id: itemId, creatorProfileId: profile.id },
  });
  if (!existing) {
    return { success: false, error: "Portfolio item not found" };
  }

  await prisma.portfolioItem.update({
    where: { id: itemId },
    data: {
      title: data.title,
      brandName: data.brandName || null,
      description: data.description || null,
      mediaType: data.mediaType as $Enums.MediaType,
      mediaUrl: data.mediaUrl,
      externalUrl: data.externalUrl || null,
      views: data.views ?? null,
      likes: data.likes ?? null,
      comments: data.comments ?? null,
      shares: data.shares ?? null,
      engagementRate: data.engagementRate ?? null,
    },
  });

  revalidatePath("/creator/profile/edit");
  return { success: true, data: undefined };
}

// ─── Delete portfolio item ────────────────────────────────────────

export async function deletePortfolioItem(
  itemId: string
): Promise<ActionResult<void>> {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "Complete your creator profile first" };
  }

  const existing = await prisma.portfolioItem.findFirst({
    where: { id: itemId, creatorProfileId: profile.id },
  });
  if (!existing) {
    return { success: false, error: "Portfolio item not found" };
  }

  await prisma.portfolioItem.delete({ where: { id: itemId } });

  revalidatePath("/creator/profile/edit");
  return { success: true, data: undefined };
}

// ─── Reorder portfolio items ──────────────────────────────────────

export async function reorderPortfolioItems(
  orderedIds: string[]
): Promise<ActionResult<void>> {
  const user = await requireRole(["CREATOR", "ADMIN"]);
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "Complete your creator profile first" };
  }

  const updates = orderedIds.map((id, index) =>
    prisma.portfolioItem.updateMany({
      where: { id, creatorProfileId: profile.id },
      data: { sortOrder: index },
    })
  );
  await prisma.$transaction(updates);

  revalidatePath("/creator/profile/edit");
  return { success: true, data: undefined };
}
