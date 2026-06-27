"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import {
  creatorProfileSchema,
  onboardingSchema,
  type CreatorProfileInput,
  type OnboardingInput,
} from "@/lib/validations/creator-profile";

// ─── Types ────────────────────────────────────────────────────

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Get current creator profile ──────────────────────────────

export async function getMyCreatorProfile() {
  const user = await requireRole(["CREATOR", "ADMIN"]);
  return prisma.creatorProfile.findUnique({
    where: { userId: user.id },
  });
}

// ─── Get creator profile by username (public) ─────────────────

export async function getCreatorByUsername(username: string) {
  return prisma.creatorProfile.findFirst({
    where: { username },
    include: {
      user: {
        select: { name: true, email: true, isFeatured: true, createdAt: true },
      },
    },
  });
}

// ─── Onboarding (creates profile) ─────────────────────────────

export async function completeOnboarding(
  rawData: OnboardingInput
): Promise<ActionResult<{ username: string }>> {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const parsed = onboardingSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  // Check username uniqueness
  const existing = await prisma.creatorProfile.findFirst({
    where: { username: data.username, NOT: { userId: user.id } },
  });
  if (existing) {
    return {
      success: false,
      error: "Username taken",
      fieldErrors: { username: ["This username is already taken."] },
    };
  }

  await prisma.creatorProfile.upsert({
    where: { userId: user.id },
    update: {
      displayName: data.displayName,
      username: data.username,
      bio: data.bio || null,
      country: data.country || null,
      city: data.city || null,
      language: data.language,
      niche: data.niche,
      availability: data.availability,
    },
    create: {
      userId: user.id,
      displayName: data.displayName,
      username: data.username,
      bio: data.bio || null,
      country: data.country || null,
      city: data.city || null,
      language: data.language,
      niche: data.niche,
      availability: data.availability,
    },
  });

  revalidatePath("/creator/dashboard");
  return { success: true, data: { username: data.username } };
}

// ─── Update full profile ───────────────────────────────────────

export async function updateCreatorProfile(
  rawData: CreatorProfileInput
): Promise<ActionResult<{ username: string }>> {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const parsed = creatorProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  // Check username uniqueness
  const existing = await prisma.creatorProfile.findFirst({
    where: { username: data.username, NOT: { userId: user.id } },
  });
  if (existing) {
    return {
      success: false,
      error: "Username taken",
      fieldErrors: { username: ["This username is already taken."] },
    };
  }

  await prisma.creatorProfile.upsert({
    where: { userId: user.id },
    update: {
      displayName: data.displayName,
      username: data.username,
      bio: data.bio || null,
      country: data.country || null,
      city: data.city || null,
      language: data.language,
      niche: data.niche,
      availability: data.availability,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      instagramHandle: data.instagramHandle || null,
      instagramFollowers: data.instagramFollowers ?? null,
      youtubeHandle: data.youtubeHandle || null,
      youtubeSubscribers: data.youtubeSubscribers ?? null,
      tiktokHandle: data.tiktokHandle || null,
      tiktokFollowers: data.tiktokFollowers ?? null,
      twitterHandle: data.twitterHandle || null,
      twitterFollowers: data.twitterFollowers ?? null,
      linkedinUrl: data.linkedinUrl || null,
      websiteUrl: data.websiteUrl || null,
      avatar: data.avatar || null,
      coverImage: data.coverImage || null,
    },
    create: {
      userId: user.id,
      displayName: data.displayName,
      username: data.username,
      bio: data.bio || null,
      country: data.country || null,
      city: data.city || null,
      language: data.language,
      niche: data.niche,
      availability: data.availability,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      instagramHandle: data.instagramHandle || null,
      instagramFollowers: data.instagramFollowers ?? null,
      youtubeHandle: data.youtubeHandle || null,
      youtubeSubscribers: data.youtubeSubscribers ?? null,
      tiktokHandle: data.tiktokHandle || null,
      tiktokFollowers: data.tiktokFollowers ?? null,
      twitterHandle: data.twitterHandle || null,
      twitterFollowers: data.twitterFollowers ?? null,
      linkedinUrl: data.linkedinUrl || null,
      websiteUrl: data.websiteUrl || null,
      avatar: data.avatar || null,
      coverImage: data.coverImage || null,
    },
  });

  revalidatePath("/creator/dashboard");
  revalidatePath(`/creator/${data.username}`);
  revalidatePath("/creator/profile/edit");

  return { success: true, data: { username: data.username } };
}

// ─── Check username availability ──────────────────────────────

export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean }> {
  const user = await requireRole(["CREATOR", "ADMIN"]);
  const existing = await prisma.creatorProfile.findFirst({
    where: { username, NOT: { userId: user.id } },
  });
  return { available: !existing };
}
