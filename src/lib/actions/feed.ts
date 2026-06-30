"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { uploadFile } from "@/lib/storage";
import type { Prisma, $Enums } from "@prisma/client";
import {
  createPostSchema,
  createCommentSchema,
  type CreatePostInput,
  type CreateCommentInput,
} from "@/lib/validations/feed";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Upload media ───────────────────────────────────────────────

export async function uploadFeedMedia(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  await requireUser();
  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided" };

  try {
    const result = await uploadFile(file);
    return { success: true, data: { url: result.url } };
  } catch {
    return { success: false, error: "Upload failed" };
  }
}

// ─── Create post ────────────────────────────────────────────────

export async function createPost(
  rawData: CreatePostInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const parsed = createPostSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      type: data.type as $Enums.PostType,
      title: data.title || null,
      body: data.body,
      mediaUrls: data.mediaUrls,
      tags: data.tags,
    },
  });

  revalidatePath("/feed");
  return { success: true, data: { id: post.id } };
}

// ─── Get feed (cursor-based pagination) ─────────────────────────

export async function getFeed(params: {
  type?: string;
  cursor?: string;
  take?: number;
}) {
  const { type, cursor, take = 20 } = params;

  const where: Prisma.PostWhereInput = { isPublic: true, isRemoved: false };
  if (type) where.type = type as $Enums.PostType;

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          creatorProfile: { select: { username: true, displayName: true } },
          brandProfile: { select: { slug: true, companyName: true } },
        },
      },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = posts.length > take;
  const items = hasMore ? posts.slice(0, take) : posts;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return { items, nextCursor };
}

// ─── Get single post ────────────────────────────────────────────

export async function getPost(postId: string) {
  return prisma.post.findFirst({
    where: { id: postId, isRemoved: false },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          creatorProfile: { select: { username: true, displayName: true } },
          brandProfile: { select: { slug: true, companyName: true } },
        },
      },
      _count: { select: { comments: true, likes: true } },
    },
  });
}

// ─── Get user's like/save state for a set of posts ──────────────

export async function getMyInteractions(postIds: string[]) {
  const user = await requireUser();

  const [likes, saves] = await Promise.all([
    prisma.like.findMany({
      where: { userId: user.id, postId: { in: postIds } },
      select: { postId: true },
    }),
    prisma.savedPost.findMany({
      where: { userId: user.id, postId: { in: postIds } },
      select: { postId: true },
    }),
  ]);

  const likedSet = new Set(likes.map((l) => l.postId).filter(Boolean) as string[]);
  const savedSet = new Set(saves.map((s) => s.postId));

  return { likedSet, savedSet };
}

// ─── Toggle like ────────────────────────────────────────────────

export async function toggleLike(
  postId: string
): Promise<ActionResult<{ liked: boolean; likeCount: number }>> {
  const user = await requireUser();

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({
      data: { userId: user.id, postId },
    });

    // Notify post author (unless liking own post)
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (post && post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId:        post.authorId,
          type:          "LIKE",
          title:         "Someone liked your post",
          referenceId:   postId,
          referenceType: "Post",
          actionUrl:     `/posts/${postId}`,
        },
      });
    }
  }

  const count = await prisma.like.count({ where: { postId } });
  revalidatePath("/feed");
  return { success: true, data: { liked: !existing, likeCount: count } };
}

// ─── Toggle save ────────────────────────────────────────────────

export async function toggleSave(
  postId: string
): Promise<ActionResult<{ saved: boolean }>> {
  const user = await requireUser();

  const existing = await prisma.savedPost.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    await prisma.savedPost.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedPost.create({
      data: { userId: user.id, postId },
    });
  }

  revalidatePath("/feed");
  return { success: true, data: { saved: !existing } };
}

// ─── Increment share count ──────────────────────────────────────

export async function sharePost(postId: string): Promise<ActionResult<{ shareCount: number }>> {
  const post = await prisma.post.update({
    where: { id: postId },
    data: { shareCount: { increment: 1 } },
    select: { shareCount: true },
  });

  revalidatePath("/feed");
  return { success: true, data: { shareCount: post.shareCount } };
}

// ─── Create comment ─────────────────────────────────────────────

export async function createComment(
  rawData: CreateCommentInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const parsed = createCommentSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  const comment = await prisma.comment.create({
    data: {
      postId: data.postId,
      authorId: user.id,
      body: data.body,
      parentId: data.parentId || null,
    },
  });

  // Notify post author (unless commenting on own post)
  const post = await prisma.post.findUnique({
    where: { id: data.postId },
    select: { authorId: true },
  });
  if (post && post.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        userId:        post.authorId,
        type:          "COMMENT",
        title:         "New comment on your post",
        body:          data.body.length > 100 ? data.body.slice(0, 100) + "…" : data.body,
        referenceId:   data.postId,
        referenceType: "Post",
        actionUrl:     `/posts/${data.postId}`,
      },
    });
  }

  revalidatePath(`/posts/${data.postId}`);
  revalidatePath("/feed");
  return { success: true, data: { id: comment.id } };
}

// ─── Get comments for a post ────────────────────────────────────

export async function getPostComments(postId: string) {
  const topLevel = await prisma.comment.findMany({
    where: { postId, parentId: null, isRemoved: false },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          creatorProfile: { select: { username: true, displayName: true } },
          brandProfile: { select: { slug: true, companyName: true } },
        },
      },
      replies: {
        where: { isRemoved: false },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
              creatorProfile: { select: { username: true, displayName: true } },
              brandProfile: { select: { slug: true, companyName: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { likes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return topLevel;
}
