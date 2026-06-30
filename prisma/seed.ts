/**
 * Seed script — creates representative data for all roles.
 * Run with: npm run prisma:seed
 *
 * To reseed from scratch:
 *   npx prisma migrate reset --force && npm run prisma:seed
 */
import { PrismaClient, Role, CampaignStatus, DeliverableType, MediaType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // Clean existing data (in correct dependency order)
  await prisma.adminActionLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savedPost.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.review.deleteMany();
  await prisma.campaignApplication.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.brandProfile.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ── Admin ──────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // ── Creators ────────────────────────────────────────────────
  const creator1 = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "creator@example.com",
      password,
      role: Role.CREATOR,
      isActive: true,
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
          baseRateCents: 150000,
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

  const creator2 = await prisma.user.create({
    data: {
      name: "Maya Chen",
      email: "creator2@example.com",
      password,
      role: Role.CREATOR,
      isActive: true,
      creatorProfile: {
        create: {
          displayName: "Maya Chen",
          bio: "Tech reviewer and coding educator. I make complex topics simple.",
          niche: ["Technology", "Education"],
          tags: ["coding", "reviews", "gadgets"],
          country: "US",
          city: "Seattle",
          language: ["English", "Mandarin"],
          youtubeHandle: "mayachencodes",
          youtubeSubscribers: 145000,
          tiktokHandle: "mayachen",
          tiktokFollowers: 200000,
          baseRateCents: 250000,
          currency: "USD",
          isVerified: true,
          verifiedAt: new Date(),
        },
      },
    },
  });

  const creator3 = await prisma.user.create({
    data: {
      name: "Jordan Lee",
      email: "creator3@example.com",
      password,
      role: Role.CREATOR,
      isActive: true,
      creatorProfile: {
        create: {
          displayName: "Jordan Lee",
          bio: "Fitness & wellness coach. Helping you stay active and healthy.",
          niche: ["Fitness", "Health", "Wellness"],
          tags: ["workout", "nutrition", "mental-health"],
          country: "CA",
          city: "Toronto",
          language: ["English", "French"],
          instagramHandle: "jordanfitness",
          instagramFollowers: 45000,
          baseRateCents: 100000,
          currency: "CAD",
        },
      },
    },
  });

  // ── Brands ──────────────────────────────────────────────────
  const brand1 = await prisma.user.create({
    data: {
      name: "Acme Brand",
      email: "brand@example.com",
      password,
      role: Role.BRAND,
      isActive: true,
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

  const brand2 = await prisma.user.create({
    data: {
      name: "TechGadget Inc",
      email: "brand2@example.com",
      password,
      role: Role.BRAND,
      isActive: true,
      brandProfile: {
        create: {
          companyName: "TechGadget Inc",
          bio: "Cutting-edge consumer electronics and smart home devices.",
          industry: "Technology",
          websiteUrl: "https://techgadget.example.com",
          country: "US",
          city: "San Jose",
          instagramHandle: "techgadget",
          isVerified: true,
          verifiedAt: new Date(),
        },
      },
    },
  });

  // ── Campaigns ───────────────────────────────────────────────
  const bp1 = (await prisma.brandProfile.findUnique({ where: { userId: brand1.id } }))!;
  const bp2 = (await prisma.brandProfile.findUnique({ where: { userId: brand2.id } }))!;

  const campaign1 = await prisma.campaign.create({
    data: {
      brandProfileId: bp1!.id,
      title: "Summer Adventure Campaign 2025",
      description: "Looking for lifestyle & outdoor creators to showcase our new line of adventure gear.",
      status: CampaignStatus.OPEN,
      niche: ["Lifestyle", "Travel", "Outdoor"],
      minFollowers: 10000,
      country: ["US", "CA", "AU", "GB"],
      language: ["English"],
      deliverableType: DeliverableType.INSTAGRAM_REEL,
      deliverableCount: 2,
      deliverableNotes: "Two Instagram Reels, 30s+ each, featuring product in an outdoor setting.",
      budgetMinCents: 50000,
      budgetMaxCents: 200000,
      currency: "USD",
      maxAccepted: 5,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      campaignStartDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      campaignEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isPublic: true,
      isFeatured: true,
      tags: ["adventure", "outdoor", "summer", "gear"],
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      brandProfileId: bp2!.id,
      title: "Smart Home Review Campaign",
      description: "Seeking tech creators to review our new smart home hub. Unboxing, setup, and honest review.",
      status: CampaignStatus.OPEN,
      niche: ["Technology", "Education"],
      minFollowers: 5000,
      country: ["US", "CA", "GB"],
      language: ["English"],
      deliverableType: DeliverableType.YOUTUBE_VIDEO,
      deliverableCount: 1,
      deliverableNotes: "10-15 minute YouTube video with unboxing, setup walkthrough, and review.",
      budgetMinCents: 100000,
      budgetMaxCents: 500000,
      currency: "USD",
      maxAccepted: 3,
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      campaignStartDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
      campaignEndDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      isPublic: true,
      isFeatured: false,
      tags: ["tech", "review", "smart-home", "gadgets"],
    },
  });

  // ── Applications ────────────────────────────────────────────
  // Get creator profile IDs
  const cp1 = await prisma.creatorProfile.findUnique({ where: { userId: creator1.id } });
  const cp2 = await prisma.creatorProfile.findUnique({ where: { userId: creator2.id } });

  await prisma.campaignApplication.create({
    data: {
      campaignId: campaign1.id,
      creatorProfileId: cp1!.id,
      userId: creator1.id,
      status: "ACCEPTED",
      pitch: "I'd love to showcase your gear in my upcoming trip to Patagonia.",
    },
  });

  await prisma.campaignApplication.create({
    data: {
      campaignId: campaign2.id,
      creatorProfileId: cp2!.id,
      userId: creator2.id,
      status: "ACCEPTED",
      pitch: "My audience loves honest tech reviews. Happy to feature your product.",
    },
  });

  // ── Feed Posts ──────────────────────────────────────────────
  const post1 = await prisma.post.create({
    data: {
      authorId: creator1.id,
      type: "POST",
      title: "Just got back from an amazing shoot!",
      body: "Spent the week shooting content in the mountains. The new gear from Acme Co held up amazingly well in harsh conditions. Can't wait to share the final results!",
      tags: ["photography", "adventure", "outdoors"],
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: creator2.id,
      type: "INDUSTRY",
      body: "New AI-powered editing tools are changing the game for content creators. Here's what you need to know about the latest releases and how they can streamline your workflow.",
      tags: ["AI", "editing", "tools"],
    },
  });

  // ── Comments & Likes ────────────────────────────────────────
  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: creator2.id,
      body: "This looks incredible! What camera setup did you use?",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: creator3.id,
      body: "The lighting in that first shot is unreal. Great work!",
    },
  });

  await prisma.like.create({
    data: { userId: creator2.id, postId: post1.id },
  });
  await prisma.like.create({
    data: { userId: creator3.id, postId: post1.id },
  });
  await prisma.like.create({
    data: { userId: creator1.id, postId: post2.id },
  });

  // ── Reviews ─────────────────────────────────────────────────
  await prisma.review.create({
    data: {
      authorId: creator1.id,
      subjectId: brand1.id,
      campaignId: campaign1.id,
      authorRole: Role.CREATOR,
      rating: 5,
      body: "Great brand to work with! Clear communication and prompt payment.",
      categories: { communication: 5, payment: 5, creativity: 4 },
    },
  });

  await prisma.review.create({
    data: {
      authorId: brand1.id,
      subjectId: creator1.id,
      campaignId: campaign1.id,
      authorRole: Role.BRAND,
      rating: 5,
      body: "Alex produced outstanding content that exceeded our expectations.",
      categories: { quality: 5, communication: 5, professionalism: 5 },
    },
  });

  // ── Notifications ───────────────────────────────────────────
  await prisma.notification.create({
    data: {
      userId: creator1.id,
      type: "APPLICATION_UPDATED",
      title: "Application accepted",
      body: 'You have been accepted for "Summer Adventure Campaign 2025".',
      referenceId: campaign1.id,
      referenceType: "Campaign",
      actionUrl: `/creator/campaigns`,
      isRead: true,
      readAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: brand1.id,
      type: "REVIEW_RECEIVED",
      title: "New review received",
      body: "You received a 5-star review from Alex Rivera.",
      referenceId: campaign1.id,
      referenceType: "Campaign",
      actionUrl: `/campaigns/${campaign1.id}`,
      isRead: true,
      readAt: new Date(),
    },
  });

  console.log("");
  console.log("  ✅ Database seeded successfully");
  console.log("");
  console.log("  ┌─────────────────────┬──────────────────────────────┐");
  console.log("  │ Email               │ Password                     │");
  console.log("  ├─────────────────────┼──────────────────────────────┤");
  console.log("  │ admin@example.com   │ password123                  │");
  console.log("  │ creator@example.com │ password123                  │");
  console.log("  │ creator2@example.com│ password123                  │");
  console.log("  │ creator3@example.com│ password123                  │");
  console.log("  │ brand@example.com   │ password123                  │");
  console.log("  │ brand2@example.com  │ password123                  │");
  console.log("  └─────────────────────┴──────────────────────────────┘");
  console.log("");
  console.log(`  Users:       6`);
  console.log(`  Campaigns:   2`);
  console.log(`  Posts:       2`);
  console.log(`  Comments:    2`);
  console.log(`  Reviews:     2`);
  console.log(`  Applications: 2`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
