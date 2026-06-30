import { z } from "zod";

export const POST_TYPE_OPTIONS = [
  { value: "POST", label: "Post" },
  { value: "CAMPAIGN_ANNOUNCEMENT", label: "Campaign Announcement" },
  { value: "COLLAB_UPDATE", label: "Collaboration Update" },
  { value: "INDUSTRY", label: "Industry Content" },
] as const;

export const POST_TYPE_LABELS: Record<string, string> = {
  POST: "Post",
  CAMPAIGN_ANNOUNCEMENT: "Campaign Announcement",
  COLLAB_UPDATE: "Collaboration Update",
  INDUSTRY: "Industry Content",
};

export const createPostSchema = z.object({
  type: z.enum(["POST", "CAMPAIGN_ANNOUNCEMENT", "COLLAB_UPDATE", "INDUSTRY"]).default("POST"),
  title: z.string().max(200).optional().or(z.literal("")),
  body: z.string().min(1, "Post body is required").max(5000),
  mediaUrls: z.array(z.string()).max(10).default([]),
  tags: z.array(z.string()).max(10).default([]),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const createCommentSchema = z.object({
  postId: z.string().min(1),
  parentId: z.string().optional(),
  body: z.string().min(1, "Comment is required").max(2000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const feedFilterSchema = z.object({
  type: z.enum(["POST", "CAMPAIGN_ANNOUNCEMENT", "COLLAB_UPDATE", "INDUSTRY"]).optional(),
  cursor: z.string().optional(),
  take: z.number().int().min(1).max(50).default(20),
});

export type FeedFilterInput = z.infer<typeof feedFilterSchema>;
