import { z } from "zod";

export const CREATOR_REVIEW_CATEGORIES = [
  "qualityOfWork",
  "timeliness",
  "communication",
  "professionalism",
] as const;

export const BRAND_REVIEW_CATEGORIES = [
  "communication",
  "professionalism",
  "paymentReliability",
] as const;

export const CREATOR_CATEGORY_LABELS: Record<string, string> = {
  qualityOfWork: "Quality of Work",
  timeliness: "Timeliness",
  communication: "Communication",
  professionalism: "Professionalism",
};

export const BRAND_CATEGORY_LABELS: Record<string, string> = {
  communication: "Communication",
  professionalism: "Professionalism",
  paymentReliability: "Payment Reliability",
};

const categoryRatings = z
  .record(z.string(), z.number().int().min(1).max(5))
  .optional();

export const reviewSchema = z.object({
  campaignId: z.string().min(1, "Campaign is required."),
  subjectId: z.string().min(1, "Subject is required."),
  rating: z.number().int().min(1, "Rating must be at least 1.").max(5, "Rating must be at most 5."),
  body: z
    .string()
    .min(20, "Review must be at least 20 characters.")
    .max(2000, "Review must be 2,000 characters or less."),
  categories: categoryRatings,
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const reviewFilterSchema = z.object({
  subjectId: z.string().optional(),
  authorId: z.string().optional(),
});

export type ReviewFilterInput = z.infer<typeof reviewFilterSchema>;
