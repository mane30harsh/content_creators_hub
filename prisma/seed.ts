/**
 * Seed script — creates representative data for all roles.
 * Run with: npm run prisma:seed
 */
import { PrismaClient, Role, CampaignStatus, DeliverableType, MediaType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // ── Admin ──────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password,
      role: Role.ADMIN,
    },
  });

  // ── Creator ────────────────────────────────────────────────
  const creatorUser = await prisma.user.upsert({
    where: { email: "creator@example.com" },
    update: {},
    create: {
      name: "Alex Rivera",
      email: "creator@example.com",
      password,
      role: Role.CREATOR,
      creatorProfile: {
        create: {
          displayName: "Alex Rivera",
          bio: "Lifestyle & travel creator with 5 years of experience working with global brands.",
          niche: ["Lifestyle", "Travel", "Fashion"],
          tags: ["photography", "adventure", "sustainable-fashion"],
          country: "US",
          city: "New York",
          language: ["English", "Spanish"],
          instagramHandle: "alexrivera",
          instagramFollowers: 85000,
          youtubeHandle: "alexriveracreates",
          youtubeSubscribers: 32000,
          tiktokHandle: "alexrivera",
          tiktokFollowers: 120000,
          baseRateCents: 150000, // $1,500 per campaign
          currency: "USD",
          isVerified: true,
          verifiedAt: new Date(),
          portfolioItems: {
            create: [
              {
                title: "Summer Fashion Campaign — Zara",
                description: "Full lookbook shoot featuring Zara's summer 2024 collection.",
                mediaType: MediaType.IMAGE,
                mediaUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800",
                externalUrl: "https://instagram.com/p/example1",
                sortOrder: 1,
              },
              {
                title: "Travel Vlog — Bali",
                description: "7-day travel vlog for a boutique travel agency.",
                mediaType: MediaType.VIDEO,
                mediaUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
                sortOrder: 2,
              },
            ],
          },
        },
      },
    },
  });

  // ── Brand ──────────────────────────────────────────────────
  const brandUser = await prisma.user.upsert({
    where: { email: "brand@example.com" },
    update: {},
    create: {
      name: "Acme Brand",
      email: "brand@example.com",
      password,
      role: Role.BRAND,
      brandProfile: {
        create: {
          companyName: "Acme Co",
          bio: "We build premium lifestyle products for modern adventurers.",
          industry: "Outdoor & Lifestyle",
          websiteUrl: "https://acmeco.example.com",
          country: "US",
          city: "San Francisco",
          instagramHandle: "acmeco",
          isVerified: true,
          verifiedAt: new Date(),
        },
      },
    },
  });

  // ── Campaign ───────────────────────────────────────────────
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId: brandUser.id },
  });

  if (brandProfile) {
    await prisma.campaign.upsert({
      where: { id: "seed-campaign-1" },
      update: {},
      create: {
        id: "seed-campaign-1",
        brandProfileId: brandProfile.id,
        title: "Summer Adventure Campaign 2025",
        description:
          "We are looking for lifestyle and outdoor creators to showcase our new line of adventure gear. Create authentic content showing real adventures using our products.",
        status: CampaignStatus.OPEN,
        niche: ["Lifestyle", "Travel", "Outdoor"],
        minFollowers: 10000,
        country: ["US", "CA", "AU", "GB"],
        language: ["English"],
        deliverableType: DeliverableType.INSTAGRAM_REEL,
        deliverableCount: 2,
        deliverableNotes: "Two Instagram Reels, minimum 30 seconds each, featuring the product in an outdoor setting.",
        budgetMinCents: 50000,   // $500
        budgetMaxCents: 200000,  // $2,000
        currency: "USD",
        maxAccepted: 5,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        campaignStartDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        campaignEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isPublic: true,
        isFeatured: true,
        tags: ["adventure", "outdoor", "summer", "gear"],
      },
    });
  }

  console.log("✅ Seeded:");
  console.log(`   admin:   ${admin.email}`);
  console.log(`   creator: ${creatorUser.email}`);
  console.log(`   brand:   ${brandUser.email}`);
  console.log("   password for all: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
