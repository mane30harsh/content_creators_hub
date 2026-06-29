/*
  Warnings:

  - Made the column `campaignId` on table `reviews` required.
  - Added the column `authorRole` to the `reviews` table.
  - Made the column `body` on table `reviews` required.
  - Dropped the column `title` from the `reviews` table.
  - Added the unique constraint `reviews_authorId_campaignId_key` on table `reviews`.
*/

-- DropIndex
DROP INDEX "reviews_campaignId_idx";

-- AlterTable
ALTER TABLE "reviews" 
  DROP COLUMN "title",
  ADD COLUMN "authorRole" "Role" NOT NULL DEFAULT 'CREATOR',
  ADD COLUMN "categories" JSONB,
  ALTER COLUMN "campaignId" SET NOT NULL,
  ALTER COLUMN "body" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_authorId_campaignId_key" ON "reviews"("authorId", "campaignId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
