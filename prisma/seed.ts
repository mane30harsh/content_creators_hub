/**
 * Seed script — creates one user per role for local development.
 * Run with: npm run prisma:seed
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

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

  const creator = await prisma.user.upsert({
    where: { email: "creator@example.com" },
    update: {},
    create: {
      name: "Creator User",
      email: "creator@example.com",
      password,
      role: Role.CREATOR,
      creatorProfile: {
        create: {
          bio: "Lifestyle content creator.",
          niche: "Lifestyle",
        },
      },
    },
  });

  const brand = await prisma.user.upsert({
    where: { email: "brand@example.com" },
    update: {},
    create: {
      name: "Brand User",
      email: "brand@example.com",
      password,
      role: Role.BRAND,
      brandProfile: {
        create: {
          companyName: "Acme Co",
          industry: "Retail",
        },
      },
    },
  });

  console.log({ admin: admin.email, creator: creator.email, brand: brand.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
