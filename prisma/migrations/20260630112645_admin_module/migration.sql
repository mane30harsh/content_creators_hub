-- AlterTable: add moderation fields to campaigns
ALTER TABLE "campaigns" 
  ADD COLUMN "isRemoved" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "removedReason" TEXT,
  ADD COLUMN "removedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "campaigns_isRemoved_idx" ON "campaigns"("isRemoved");
