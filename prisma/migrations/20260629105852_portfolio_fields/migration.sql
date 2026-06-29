/*
  Warnings:

  - You are about to drop the column `tags` on the `portfolio_items` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `portfolio_items` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MediaType" ADD VALUE 'REEL';
ALTER TYPE "MediaType" ADD VALUE 'SCREENSHOT';

-- AlterTable
ALTER TABLE "portfolio_items" DROP COLUMN "tags",
DROP COLUMN "thumbnailUrl",
ADD COLUMN     "brandName" TEXT,
ADD COLUMN     "comments" INTEGER,
ADD COLUMN     "engagementRate" DOUBLE PRECISION,
ADD COLUMN     "likes" INTEGER,
ADD COLUMN     "shares" INTEGER,
ADD COLUMN     "views" INTEGER;
