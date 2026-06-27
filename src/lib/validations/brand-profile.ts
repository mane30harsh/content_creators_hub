import { z } from "zod";

// ─── Static options ────────────────────────────────────────────

export const INDUSTRIES = [
  "Automotive",
  "Beauty & Personal Care",
  "Consumer Electronics",
  "E-commerce & Retail",
  "Education & EdTech",
  "Entertainment & Media",
  "Fashion & Apparel",
  "Finance & Fintech",
  "Food & Beverage",
  "Gaming",
  "Health & Wellness",
  "Home & Living",
  "Hospitality & Travel",
  "Luxury & Jewelry",
  "Marketing & Advertising",
  "Pets",
  "Real Estate",
  "SaaS & Technology",
  "Sports & Outdoors",
  "Sustainability & Eco",
  "Toys & Kids",
  "Other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const COMPANY_SIZES = [
  { value: "1-10",      label: "1–10 employees" },
  { value: "11-50",     label: "11–50 employees" },
  { value: "51-200",    label: "51–200 employees" },
  { value: "201-1000",  label: "201–1,000 employees" },
  { value: "1000+",     label: "1,000+ employees" },
] as const;

export const PLATFORMS = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Twitter / X",
  "LinkedIn",
  "Facebook",
  "Pinterest",
  "Podcast",
  "Blog",
  "Other",
] as const;

// ─── Zod helpers ───────────────────────────────────────────────

const urlOrEmpty = z
  .string()
  .optional()
  .transform((v) => v?.trim() || undefined)
  .refine((v) => !v || /^https?:\/\/.+/.test(v), {
    message: "Must be a valid URL starting with http:// or https://",
  });

const handleOrEmpty = z
  .string()
  .optional()
  .transform((v) => (v?.trim() ? v.trim().replace(/^@/, "") : undefined));

const yearOrEmpty = z
  .union([z.number().int().min(1800).max(new Date().getFullYear()), z.literal("")])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : Number(v)));

// ─── Onboarding schema (minimal required set) ──────────────────

export const brandOnboardingSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(40, "Slug must be 40 characters or less")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(80, "Company name must be 80 characters or less"),
  tagline: z
    .string()
    .max(120, "Tagline must be 120 characters or less")
    .optional()
    .or(z.literal("")),
  industry: z.string().min(1, "Select an industry"),
  country: z.string().max(60).optional().or(z.literal("")),
  city: z.string().max(60).optional().or(z.literal("")),
  bio: z
    .string()
    .max(800, "About must be 800 characters or less")
    .optional()
    .or(z.literal("")),
});

export type BrandOnboardingInput = z.infer<typeof brandOnboardingSchema>;

// ─── Full edit schema ──────────────────────────────────────────

export const brandProfileSchema = brandOnboardingSchema.extend({
  companySize: z.string().optional().or(z.literal("")),
  foundedYear: yearOrEmpty,
  websiteUrl: urlOrEmpty,
  contactEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  contactPhone: z.string().max(30).optional().or(z.literal("")),

  // Social
  instagramHandle: handleOrEmpty,
  twitterHandle:   handleOrEmpty,
  youtubeHandle:   handleOrEmpty,
  tiktokHandle:    handleOrEmpty,
  linkedinUrl:     urlOrEmpty,
  facebookUrl:     urlOrEmpty,

  // Images
  logo:        z.string().optional().or(z.literal("")),
  coverImage:  z.string().optional().or(z.literal("")),
});

export type BrandProfileInput = z.infer<typeof brandProfileSchema>;

// ─── Product showcase schema ───────────────────────────────────

export const brandProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  imageUrl: urlOrEmpty,
  productUrl: urlOrEmpty,
  isPublic: z.boolean().default(true),
});

export type BrandProductInput = z.infer<typeof brandProductSchema>;

// ─── Campaign showcase schema ──────────────────────────────────

export const brandCampaignShowcaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().max(600).optional().or(z.literal("")),
  imageUrl: urlOrEmpty,
  externalUrl: urlOrEmpty,
  platform: z.string().optional().or(z.literal("")),
  resultSummary: z.string().max(200).optional().or(z.literal("")),
  year: yearOrEmpty,
  isPublic: z.boolean().default(true),
});

export type BrandCampaignShowcaseInput = z.infer<typeof brandCampaignShowcaseSchema>;
