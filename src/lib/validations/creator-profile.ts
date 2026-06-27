import { z } from "zod";

export const NICHES = [
  "Fashion",
  "Beauty",
  "Lifestyle",
  "Travel",
  "Food & Drink",
  "Fitness & Health",
  "Tech",
  "Gaming",
  "Finance",
  "Education",
  "Parenting",
  "Music",
  "Art & Design",
  "Photography",
  "Business",
  "Comedy",
  "Sports",
  "Sustainability",
  "Home & Decor",
  "Pets",
  "Other",
] as const;

export const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Japanese",
  "Korean",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Arabic",
  "Hindi",
  "Russian",
  "Dutch",
  "Polish",
  "Turkish",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "AVAILABLE", label: "Available", color: "success" },
  { value: "LIMITED", label: "Limited Availability", color: "warning" },
  { value: "FULLY_BOOKED", label: "Fully Booked", color: "destructive" },
] as const;

const urlOrEmpty = z
  .string()
  .optional()
  .transform((v) => v || undefined)
  .refine((v) => !v || /^https?:\/\//.test(v), {
    message: "Must be a valid URL starting with http:// or https://",
  });

const handleOrEmpty = z
  .string()
  .optional()
  .transform((v) => (v ? v.replace(/^@/, "") : undefined));

const positiveIntOrEmpty = z
  .union([z.number().int().nonnegative(), z.literal("")])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : Number(v)));

export const creatorProfileSchema = z.object({
  // Basic info
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(60, "Display name must be 60 characters or less"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or less")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional().or(z.literal("")),

  // Location
  country: z.string().max(60).optional().or(z.literal("")),
  city: z.string().max(60).optional().or(z.literal("")),

  // Arrays
  language: z.array(z.string()).min(1, "Select at least one language"),
  niche: z.array(z.string()).min(1, "Select at least one niche"),

  // Availability
  availability: z.enum(["AVAILABLE", "LIMITED", "FULLY_BOOKED"]),

  // Contact
  contactEmail: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().max(20).optional().or(z.literal("")),

  // Social handles
  instagramHandle: handleOrEmpty,
  youtubeHandle: handleOrEmpty,
  tiktokHandle: handleOrEmpty,
  twitterHandle: handleOrEmpty,
  linkedinUrl: urlOrEmpty,
  websiteUrl: urlOrEmpty,

  // Follower counts
  instagramFollowers: positiveIntOrEmpty,
  youtubeSubscribers: positiveIntOrEmpty,
  tiktokFollowers: positiveIntOrEmpty,
  twitterFollowers: positiveIntOrEmpty,

  // Images (URLs — upload handled separately)
  avatar: z.string().optional().or(z.literal("")),
  coverImage: z.string().optional().or(z.literal("")),
});

export type CreatorProfileInput = z.infer<typeof creatorProfileSchema>;

// Subset for onboarding (fewer required fields)
export const onboardingSchema = creatorProfileSchema.pick({
  displayName: true,
  username: true,
  bio: true,
  niche: true,
  language: true,
  availability: true,
  country: true,
  city: true,
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
