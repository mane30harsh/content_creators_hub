"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Get unread count ───────────────────────────────────────────

export async function getUnreadCount() {
  const user = await requireUser();
  return prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });
}

// ─── Get notifications ─────────────────────────────────────────

export async function getNotifications(params?: { cursor?: string; unreadOnly?: boolean }) {
  const user = await requireUser();
  const { cursor, unreadOnly } = params ?? {};
  const take = 20;

  const items = await prisma.notification.findMany({
    where: {
      userId: user.id,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = items.length > take;
  const data = hasMore ? items.slice(0, take) : items;
  const nextCursor = hasMore ? data[data.length - 1]?.id : null;

  return { data, nextCursor };
}

// ─── Get recent notifications for dropdown ──────────────────────

export async function getRecentNotifications() {
  const user = await requireUser();

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notification.count({
      where: { userId: user.id, isRead: false },
    }),
  ]);

  return { items, unreadCount };
}

// ─── Mark as read ───────────────────────────────────────────────

export async function markAsRead(notificationId: string): Promise<ActionResult> {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath("/notifications");
  return { success: true, data: undefined };
}

// ─── Mark all as read ───────────────────────────────────────────

export async function markAllAsRead() {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath("/notifications");
}
