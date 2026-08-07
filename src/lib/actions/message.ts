"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { createNotification } from "@/lib/actions/notification";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Get or create thread with target user ──────────────────────────────────

export async function getOrCreateThread(input: {
  targetUserId: string;
  campaignId?: string;
}): Promise<ActionResult<{ threadId: string }>> {
  const user = await requireUser();
  const currentUserId = user.id;

  if (currentUserId === input.targetUserId) {
    return { success: false, error: "You cannot message yourself." };
  }

  // Verify target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: input.targetUserId },
    select: { id: true },
  });
  if (!targetUser) {
    return { success: false, error: "User not found." };
  }

  // Find existing thread where both users are participants
  const existingThreads = await prisma.messageThread.findMany({
    where: {
      ...(input.campaignId ? { campaignId: input.campaignId } : {}),
      participants: {
        every: {
          userId: { in: [currentUserId, input.targetUserId] },
        },
      },
    },
    include: {
      participants: { select: { userId: true } },
    },
  });

  const matchingThread = existingThreads.find(
    (t) =>
      t.participants.length === 2 &&
      t.participants.some((p) => p.userId === currentUserId) &&
      t.participants.some((p) => p.userId === input.targetUserId)
  );

  if (matchingThread) {
    return { success: true, data: { threadId: matchingThread.id } };
  }

  // Create new thread
  const newThread = await prisma.messageThread.create({
    data: {
      campaignId: input.campaignId || null,
      participants: {
        create: [
          { userId: currentUserId },
          { userId: input.targetUserId },
        ],
      },
    },
    select: { id: true },
  });

  revalidatePath("/messages");
  return { success: true, data: { threadId: newThread.id } };
}

// ─── Get all threads for logged-in user ─────────────────────────────────────

export async function getThreads() {
  const user = await requireUser();

  const threads = await prisma.messageThread.findMany({
    where: {
      participants: {
        some: { userId: user.id },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              creatorProfile: {
                select: {
                  displayName: true,
                  username: true,
                  avatar: true,
                },
              },
              brandProfile: {
                select: {
                  companyName: true,
                  slug: true,
                  logo: true,
                },
              },
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return threads.map((thread) => {
    const otherParticipant = thread.participants.find(
      (p) => p.userId !== user.id
    );
    const meParticipant = thread.participants.find(
      (p) => p.userId === user.id
    );

    const latestMessage = thread.messages[0] || null;
    const hasUnread =
      latestMessage &&
      latestMessage.senderId !== user.id &&
      (!meParticipant?.lastReadAt ||
        new Date(latestMessage.createdAt) > new Date(meParticipant.lastReadAt));

    const otherUser = otherParticipant?.user;
    const isBrand = otherUser?.role === "BRAND";
    const displayName =
      (isBrand
        ? otherUser?.brandProfile?.companyName
        : otherUser?.creatorProfile?.displayName) ||
      otherUser?.name ||
      "User";

    const avatar =
      (isBrand
        ? otherUser?.brandProfile?.logo
        : otherUser?.creatorProfile?.avatar) || undefined;

    const profileHref =
      isBrand && otherUser?.brandProfile?.slug
        ? `/brand/${otherUser.brandProfile.slug}`
        : otherUser?.creatorProfile?.username
        ? `/creator/${otherUser.creatorProfile.username}`
        : undefined;

    return {
      id: thread.id,
      updatedAt: thread.updatedAt,
      latestMessage,
      hasUnread,
      otherUser: otherUser
        ? {
            id: otherUser.id,
            displayName,
            avatar,
            role: otherUser.role,
            profileHref,
          }
        : null,
    };
  });
}

// ─── Get single thread with messages ───────────────────────────────────────

export async function getThreadMessages(threadId: string) {
  const user = await requireUser();

  // Verify participant
  const participant = await prisma.messageThreadParticipant.findUnique({
    where: {
      threadId_userId: { threadId, userId: user.id },
    },
  });

  if (!participant) return null;

  // Update lastReadAt
  await prisma.messageThreadParticipant.update({
    where: { threadId_userId: { threadId, userId: user.id } },
    data: { lastReadAt: new Date() },
  });

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              creatorProfile: {
                select: { displayName: true, username: true, avatar: true },
              },
              brandProfile: {
                select: { companyName: true, slug: true, logo: true },
              },
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              creatorProfile: { select: { displayName: true, avatar: true } },
              brandProfile: { select: { companyName: true, logo: true } },
            },
          },
        },
      },
    },
  });

  if (!thread) return null;

  const otherParticipant = thread.participants.find(
    (p) => p.userId !== user.id
  );

  const otherUser = otherParticipant?.user;
  const isBrand = otherUser?.role === "BRAND";
  const displayName =
    (isBrand
      ? otherUser?.brandProfile?.companyName
      : otherUser?.creatorProfile?.displayName) ||
    otherUser?.name ||
    "User";

  const avatar =
    (isBrand
      ? otherUser?.brandProfile?.logo
      : otherUser?.creatorProfile?.avatar) || undefined;

  const profileHref =
    isBrand && otherUser?.brandProfile?.slug
      ? `/brand/${otherUser.brandProfile.slug}`
      : otherUser?.creatorProfile?.username
      ? `/creator/${otherUser.creatorProfile.username}`
      : undefined;

  return {
    id: thread.id,
    currentUserId: user.id,
    otherUser: otherUser
      ? {
          id: otherUser.id,
          displayName,
          avatar,
          role: otherUser.role,
          profileHref,
        }
      : null,
    messages: thread.messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt,
      isMe: m.senderId === user.id,
    })),
  };
}

// ─── Send message in thread ──────────────────────────────────────────────────

export async function sendMessage(input: {
  threadId: string;
  body: string;
}): Promise<ActionResult<{ messageId: string }>> {
  const user = await requireUser();
  const text = input.body.trim();

  if (!text) {
    return { success: false, error: "Message cannot be empty." };
  }

  // Verify participant
  const thread = await prisma.messageThread.findUnique({
    where: { id: input.threadId },
    include: {
      participants: { select: { userId: true } },
    },
  });

  if (!thread || !thread.participants.some((p) => p.userId === user.id)) {
    return { success: false, error: "Thread not found or unauthorized." };
  }

  const message = await prisma.message.create({
    data: {
      threadId: input.threadId,
      senderId: user.id,
      body: text,
    },
  });

  // Update thread updatedAt & sender's lastReadAt
  await prisma.$transaction([
    prisma.messageThread.update({
      where: { id: input.threadId },
      data: { updatedAt: new Date() },
    }),
    prisma.messageThreadParticipant.update({
      where: {
        threadId_userId: { threadId: input.threadId, userId: user.id },
      },
      data: { lastReadAt: new Date() },
    }),
  ]);

  // Create notification for other participant
  const recipient = thread.participants.find((p) => p.userId !== user.id);
  if (recipient) {
    const senderName = user.name || "A user";
    await createNotification({
      userId: recipient.userId,
      type: "MESSAGE_RECEIVED",
      title: `New message from ${senderName}`,
      body: text.length > 80 ? `${text.slice(0, 80)}…` : text,
      referenceId: input.threadId,
      referenceType: "MessageThread",
    });
  }

  revalidatePath("/messages");
  return { success: true, data: { messageId: message.id } };
}
