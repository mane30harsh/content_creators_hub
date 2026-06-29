import { z } from "zod";

// ─── Constants ─────────────────────────────────────────────────

export const DELIVERABLE_TYPE_LABELS: Record<string, string> = {
  INSTAGRAM_POST:    "Instagram Post",
  INSTAGRAM_REEL:    "Instagram Reel",
  INSTAGRAM_STORY:   "Instagram Story",
  YOUTUBE_VIDEO:     "YouTube Video",
  YOUTUBE_SHORT:     "YouTube Short",
  TIKTOK_VIDEO:      "TikTok Video",
  TWITTER_POST:      "Twitter/X Post",
  LINKEDIN_POST:     "LinkedIn Post",
  BLOG_POST:         "Blog Post",
  PODCAST_EPISODE:   "Podcast Episode",
  OTHER:             "Other",
};

export const DELIVERABLE_TYPES = Object.keys(DELIVERABLE_TYPE_LABELS) as [string, ...string[]];

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  DRAFT:      "Draft",
  OPEN:       "Open",
  IN_REVIEW:  "In Review",
  ACTIVE:     "Active",
  COMPLETED:  "Completed",
  CANCELLED:  "Cancelled",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING:      "Pending",
  SHORTLISTED:  "Shortlisted",
  ACCEPTED:     "Accepted",
  REJECTED:     "Rejected",
  WITHDRAWN:    "Withdrawn",
};

export const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia",
  "India", "Germany", "France", "Brazil", "Mexico", "Spain",
  "Italy", "Netherlands", "Singapore", "Japan", "South Korea",
  "UAE", "South Africa", "Nigeria", "Indonesia", "Philippines",
] as const;

// ─── Helpers ────────────────────────────────────────────────────

const positiveIntOrEmpty = z
  .union([z.number().int().nonnegative(), z.literal(""), z.undefined()])
  .transform((v) => (v === "" || v === undefined ? undefined : Number(v)));

const dollarAmountOrEmpty = z
  .union([z.number()  .nonnegative(), z.literal(""), z.undefined()])
  .transform((v) => (v === "" || v === undefined ? undefined : Number(v)));

const dateStringOrEmpty = z
  .string()
  .optional()
  .transform((v) => v || undefined);

// ─── Campaign schema ─────────────────────────────────────────────

export const campaignSchema = z
  .object({
    // Basic
    title: z
      .string()
      .min(5, "Title must be at least 5 characters.")
      .max(120, "Title must be 120 characters or less."),
    description: z
      .string()
      .min(30, "Description must be at least 30 characters.")
      .max(5000, "Description must be 5,000 characters or less."),

    // Deliverable
    deliverableType: z.enum(DELIVERABLE_TYPES, { message: "Select a deliverable type." }),
    deliverableCount: z.coerce.number().int().min(1).max(50).default(1),
    deliverableNotes: z
      .string()
      .max(1000, "Notes must be 1,000 characters or less.")
      .optional()
      .or(z.literal("")),

    // Budget — stored as dollars in form, converted to cents in action
    budgetMin: dollarAmountOrEmpty,
    budgetMax: dollarAmountOrEmpty,
    currency: z.string().default("USD"),

    // Targeting
    niche: z.array(z.string()).min(1, "Select at least one niche."),
    country: z.array(z.string()).default([]),
    language: z.array(z.string()).default([]),
    minFollowers: positiveIntOrEmpty,
    maxFollowers: positiveIntOrEmpty,

    // Timeline
    applicationDeadline: dateStringOrEmpty,
    campaignStartDate: dateStringOrEmpty,
    campaignEndDate: dateStringOrEmpty,

    // Slots
    maxAccepted: z.coerce.number().int().min(1, "Must accept at least 1 creator.").default(1),
    maxApplications: positiveIntOrEmpty,

    // Discovery
    isPublic: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional().or(z.literal("")),
  })
  .refine(
    (d) => !d.budgetMin || !d.budgetMax || d.budgetMax >= d.budgetMin,
    { message: "Max budget must be greater than or equal to min budget.", path: ["budgetMax"] }
  )
  .refine(
    (d) => !d.minFollowers || !d.maxFollowers || d.maxFollowers >= d.minFollowers,
    { message: "Max followers must be greater than or equal to min followers.", path: ["maxFollowers"] }
  );

export type CampaignInput = z.infer<typeof campaignSchema>;

// ─── Application schema ──────────────────────────────────────────

export const applicationSchema = z.object({
  campaignId: z.string().min(1),
  pitch: z
    .string()
    .min(50, "Pitch must be at least 50 characters — brands want to know you.")
    .max(2000, "Pitch must be 2,000 characters or less."),
  proposedRate: dollarAmountOrEmpty,
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

// ─── Review application schema (brand side) ──────────────────────

export const reviewApplicationSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum(["SHORTLISTED", "ACCEPTED", "REJECTED"]),
  brandNote: z.string().max(500).optional().or(z.literal("")),
  rejectionReason: z.string().max(500).optional().or(z.literal("")),
});

export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;

/** Cents → dollars for display. */
export function fromCents(cents: number | null | undefined) {
  if (cents == null) return undefined;
  return cents / 100;
}
