"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guards";
import {
  brandOnboardingSchema,
  brandProfileSchema,
  brandProductSchema,
  brandCampaignShowcaseSchema,
  type BrandOnboardingInput,
  type BrandProfileInput,
  type BrandProductInput,
  type BrandCampaignShowcaseInput,
} from "@/lib/validations/brand-profile";

// ─── Shared result type ────────────────────────────────────────

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Helpers ───────────────────────────────────────────────────

function revalidateBrand(slug: string) {
  revalidatePath("/brand/dashboard");
  revalidatePath("/brand/profile/edit");
  revalidatePath(`/brand/${slug}`);
}

async function assertOwner(brandProfileId: string, userId: string) {
  const profile = await prisma.brandProfile.findFirst({
    where: { id: brandProfileId, userId },
    select: { id: true },
  });
  if (!profile) throw new Error("Not authorised");
}

// ─── Queries ───────────────────────────────────────────────────

export async function getMyBrandProfile() {
  const user = await requireRole(["BRAND", "ADMIN"]);
  return prisma.brandProfile.findUnique({
    where: { userId: user.id },
    include: {
      products: { where: { isPublic: true }, orderBy: { sortOrder: "asc" } },
      campaignShowcase: { where: { isPublic: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getMyBrandProfileFull() {
  const user = await requireRole(["BRAND", "ADMIN"]);
  return prisma.brandProfile.findUnique({
    where: { userId: user.id },
    include: {
      products: { orderBy: { sortOrder: "asc" } },
      campaignShowcase: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getBrandBySlug(slug: string) {
  return prisma.brandProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { isFeatured: true, createdAt: true } },
      products: { where: { isPublic: true }, orderBy: { sortOrder: "asc" } },
      campaignShowcase: { where: { isPublic: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
  const user = await requireRole(["BRAND", "ADMIN"]);
  const existing = await prisma.brandProfile.findFirst({
    where: { slug, NOT: { userId: user.id } },
  });
  return { available: !existing };
}

// ─── Onboarding ────────────────────────────────────────────────

export async function completeBrandOnboarding(
  rawData: BrandOnboardingInput
): Promise<ActionResult<{ slug: string }>> {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const parsed = brandOnboardingSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  const slugTaken = await prisma.brandProfile.findFirst({
    where: { slug: data.slug, NOT: { userId: user.id } },
  });
  if (slugTaken) {
    return {
      success: false,
      error: "Slug taken",
      fieldErrors: { slug: ["This URL slug is already taken."] },
    };
  }

  await prisma.brandProfile.upsert({
    where: { userId: user.id },
    update: {
      slug: data.slug,
      companyName: data.companyName,
      tagline: data.tagline || null,
      industry: data.industry,
      country: data.country || null,
      city: data.city || null,
      bio: data.bio || null,
    },
    create: {
      userId: user.id,
      slug: data.slug,
      companyName: data.companyName,
      tagline: data.tagline || null,
      industry: data.industry,
      country: data.country || null,
      city: data.city || null,
      bio: data.bio || null,
    },
  });

  revalidatePath("/brand/dashboard");
  return { success: true, data: { slug: data.slug } };
}

// ─── Full profile update ───────────────────────────────────────

export async function updateBrandProfile(
  rawData: BrandProfileInput
): Promise<ActionResult<{ slug: string }>> {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const parsed = brandProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  const slugTaken = await prisma.brandProfile.findFirst({
    where: { slug: data.slug, NOT: { userId: user.id } },
  });
  if (slugTaken) {
    return {
      success: false,
      error: "Slug taken",
      fieldErrors: { slug: ["This URL slug is already taken."] },
    };
  }

  await prisma.brandProfile.upsert({
    where: { userId: user.id },
    update: {
      slug: data.slug,
      companyName: data.companyName,
      tagline: data.tagline || null,
      industry: data.industry,
      country: data.country || null,
      city: data.city || null,
      bio: data.bio || null,
      companySize: data.companySize || null,
      foundedYear: data.foundedYear ?? null,
      websiteUrl: data.websiteUrl || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      instagramHandle: data.instagramHandle || null,
      twitterHandle: data.twitterHandle || null,
      youtubeHandle: data.youtubeHandle || null,
      tiktokHandle: data.tiktokHandle || null,
      linkedinUrl: data.linkedinUrl || null,
      facebookUrl: data.facebookUrl || null,
      logo: data.logo || null,
      coverImage: data.coverImage || null,
    },
    create: {
      userId: user.id,
      slug: data.slug,
      companyName: data.companyName,
      tagline: data.tagline || null,
      industry: data.industry,
      country: data.country || null,
      city: data.city || null,
      bio: data.bio || null,
      companySize: data.companySize || null,
      foundedYear: data.foundedYear ?? null,
      websiteUrl: data.websiteUrl || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      instagramHandle: data.instagramHandle || null,
      twitterHandle: data.twitterHandle || null,
      youtubeHandle: data.youtubeHandle || null,
      tiktokHandle: data.tiktokHandle || null,
      linkedinUrl: data.linkedinUrl || null,
      facebookUrl: data.facebookUrl || null,
      logo: data.logo || null,
      coverImage: data.coverImage || null,
    },
  });

  revalidateBrand(data.slug);
  return { success: true, data: { slug: data.slug } };
}

// ─── Products ──────────────────────────────────────────────────

export async function upsertBrandProduct(
  rawData: BrandProductInput,
  productId?: string
): Promise<ActionResult<{ id: string }>> {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const parsed = brandProductSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const profile = await prisma.brandProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, slug: true },
  });
  if (!profile) return { success: false, error: "Brand profile not found" };

  const data = parsed.data;

  let product;
  if (productId) {
    await assertOwner(profile.id, user.id);
    product = await prisma.brandProduct.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        productUrl: data.productUrl || null,
        isPublic: data.isPublic,
      },
    });
  } else {
    const count = await prisma.brandProduct.count({ where: { brandProfileId: profile.id } });
    product = await prisma.brandProduct.create({
      data: {
        brandProfileId: profile.id,
        name: data.name,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        productUrl: data.productUrl || null,
        isPublic: data.isPublic,
        sortOrder: count,
      },
    });
  }

  if (profile.slug) revalidateBrand(profile.slug);
  return { success: true, data: { id: product.id } };
}

export async function deleteBrandProduct(productId: string): Promise<ActionResult> {
  const user = await requireRole(["BRAND", "ADMIN"]);
  const profile = await prisma.brandProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, slug: true },
  });
  if (!profile) return { success: false, error: "Profile not found" };

  const product = await prisma.brandProduct.findFirst({
    where: { id: productId, brandProfileId: profile.id },
  });
  if (!product) return { success: false, error: "Product not found" };

  await prisma.brandProduct.delete({ where: { id: productId } });
  if (profile.slug) revalidateBrand(profile.slug);
  return { success: true, data: undefined };
}

// ─── Campaign showcases ────────────────────────────────────────

export async function upsertCampaignShowcase(
  rawData: BrandCampaignShowcaseInput,
  showcaseId?: string
): Promise<ActionResult<{ id: string }>> {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const parsed = brandCampaignShowcaseSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const profile = await prisma.brandProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, slug: true },
  });
  if (!profile) return { success: false, error: "Brand profile not found" };

  const data = parsed.data;

  let showcase;
  if (showcaseId) {
    showcase = await prisma.brandCampaignShowcase.update({
      where: { id: showcaseId },
      data: {
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        externalUrl: data.externalUrl || null,
        platform: data.platform || null,
        resultSummary: data.resultSummary || null,
        year: data.year ?? null,
        isPublic: data.isPublic,
      },
    });
  } else {
    const count = await prisma.brandCampaignShowcase.count({
      where: { brandProfileId: profile.id },
    });
    showcase = await prisma.brandCampaignShowcase.create({
      data: {
        brandProfileId: profile.id,
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        externalUrl: data.externalUrl || null,
        platform: data.platform || null,
        resultSummary: data.resultSummary || null,
        year: data.year ?? null,
        isPublic: data.isPublic,
        sortOrder: count,
      },
    });
  }

  if (profile.slug) revalidateBrand(profile.slug);
  return { success: true, data: { id: showcase.id } };
}

export async function deleteCampaignShowcase(showcaseId: string): Promise<ActionResult> {
  const user = await requireRole(["BRAND", "ADMIN"]);
  const profile = await prisma.brandProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, slug: true },
  });
  if (!profile) return { success: false, error: "Profile not found" };

  const showcase = await prisma.brandCampaignShowcase.findFirst({
    where: { id: showcaseId, brandProfileId: profile.id },
  });
  if (!showcase) return { success: false, error: "Showcase entry not found" };

  await prisma.brandCampaignShowcase.delete({ where: { id: showcaseId } });
  if (profile.slug) revalidateBrand(profile.slug);
  return { success: true, data: undefined };
}
