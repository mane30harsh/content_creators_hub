import { prisma } from "@/lib/prisma";

type NotificationType =
  | "APPLICATION_RECEIVED"
  | "APPLICATION_UPDATED"
  | "MESSAGE_RECEIVED"
  | "CAMPAIGN_PUBLISHED"
  | "REVIEW_RECEIVED"
  | "FOLLOW"
  | "LIKE"
  | "COMMENT"
  | "ADMIN_NOTICE"
  | "SYSTEM";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  referenceId?: string;
  referenceType?: string;
  actionUrl?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({ data: input });
}
