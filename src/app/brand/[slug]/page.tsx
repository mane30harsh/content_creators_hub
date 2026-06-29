import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { BrandSocialLinks } from "@/components/brand/brand-social-links";
import { Separator } from "@/components/ui/separator";
import {
  MapPin, Globe, Mail, Calendar, Users,
  Package, BarChart2, ExternalLink, Building2,
} from "lucide-react";
import { MessageUserButton } from "@/components/messages/message-user-button";
import { ReviewCard } from "@/components/reviews/review-card";
import { getSubjectReviews } from "@/lib/actions/review";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getBrand(slug: string) {
  return prisma.brandProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { isFeatured: true, createdAt: true } },
      products: { where: { isPublic: true }, orderBy: { sortOrder: "asc" } },
      campaignShowcase: { where: { isPublic: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Brand not found" };
  return {
    title: `${brand.companyName ?? slug} – Content Creators Hub`,
    description: brand.tagline ?? brand.bio ?? undefined,
  };
}

export default async function BrandPublicProfilePage({ params }: Props) {
  const { slug } = await params;
  const [brand, session] = await Promise.all([
    getBrand(slug),
    auth(),
  ]);
  if (!brand) notFound();

  const reviews = await getSubjectReviews(brand.userId);

  const initials = (brand.companyName ?? slug)
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const joinedYear = new Date(brand.user.createdAt).getFullYear();

  function fmtMoney(cents: number) {
    if (cents >= 1_000_000_00) return `$${(cents / 1_000_000_00).toFixed(1)}M`;
    if (cents >= 1_000_00) return `$${(cents / 1_000_00).toFixed(0)}K`;
    return `$${(cents / 100).toLocaleString()}`;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* ── Cover banner ── */}
      <div
        className="h-48 w-full sm:h-64"
        style={
          brand.coverImage
            ? {
                backgroundImage: `url(${brand.coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {!brand.coverImage && (
          <div className="h-full w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900" />
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4">
        {/* ── Profile header ── */}
        <div className="relative -mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:gap-6">
          {/* Logo */}
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-card shadow-lg sm:h-32 sm:w-32">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.companyName ?? slug} className="h-full w-full object-contain p-2" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-3xl font-bold">
                {initials}
              </div>
            )}
          </div>

          {/* Name block */}
          <div className="flex flex-1 flex-col gap-2 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold leading-none">
                {brand.companyName ?? slug}
              </h1>
              {brand.isVerified && <VerifiedBadge />}
              {brand.user.isFeatured && (
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  ⭐ Featured
                </span>
              )}
            </div>

            {brand.tagline && (
              <p className="text-base text-muted-foreground italic">&ldquo;{brand.tagline}&rdquo;</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {brand.industry && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {brand.industry}
                </span>
              )}
              {(brand.city || brand.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[brand.city, brand.country].filter(Boolean).join(", ")}
                </span>
              )}
              {brand.websiteUrl && (
                <a
                  href={brand.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {brand.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                On platform since {joinedYear}
              </span>
            </div>
          </div>

          {/* CTA */}
          {brand.contactEmail && (
            <a
              href={`mailto:${brand.contactEmail}`}
              className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              Contact for Partnerships
            </a>
          )}
          {session?.user && session.user.role === "CREATOR" && (
            <MessageUserButton userId={brand.userId} />
          )}
        </div>

        {/* ── Body ── */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left — main content */}
          <div className="space-y-10 lg:col-span-2">
            {/* About */}
            {brand.bio && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  About
                </h2>
                <p className="text-base leading-relaxed whitespace-pre-wrap">{brand.bio}</p>
              </section>
            )}

            {/* Social links */}
            {(brand.instagramHandle || brand.twitterHandle || brand.youtubeHandle ||
              brand.tiktokHandle || brand.linkedinUrl || brand.facebookUrl || brand.websiteUrl) && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Find Us Online
                </h2>
                <BrandSocialLinks
                  instagramHandle={brand.instagramHandle}
                  twitterHandle={brand.twitterHandle}
                  youtubeHandle={brand.youtubeHandle}
                  tiktokHandle={brand.tiktokHandle}
                  linkedinUrl={brand.linkedinUrl}
                  facebookUrl={brand.facebookUrl}
                  websiteUrl={brand.websiteUrl}
                />
              </section>
            )}

            {/* Products */}
            {brand.products.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Showcase
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {brand.products.map((product: typeof brand.products[0]) => (
                    <div
                      key={product.id}
                      className="group flex gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold leading-tight truncate">{product.name}</p>
                          {product.productUrl && (
                            <a
                              href={product.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        {product.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Past campaigns */}
            {brand.campaignShowcase.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Past Campaigns
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {brand.campaignShowcase.map((campaign: typeof brand.campaignShowcase[0]) => (
                    <div
                      key={campaign.id}
                      className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
                    >
                      {campaign.imageUrl && (
                        <div className="h-36 overflow-hidden bg-muted">
                          <img
                            src={campaign.imageUrl}
                            alt={campaign.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{campaign.title}</p>
                              {campaign.platform && (
                                <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium">
                                  {campaign.platform}
                                </span>
                              )}
                              {campaign.year && (
                                <span className="text-xs text-muted-foreground">{campaign.year}</span>
                              )}
                            </div>
                            {campaign.description && (
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                {campaign.description}
                              </p>
                            )}
                            {campaign.resultSummary && (
                              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                <BarChart2 className="h-3 w-3" />
                                {campaign.resultSummary}
                              </div>
                            )}
                          </div>
                          {campaign.externalUrl && (
                            <a
                              href={campaign.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Reviews ({reviews.length})
                </h2>
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right — sidebar stats */}
          <aside className="space-y-4">
            {/* Company details card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Company Info
              </p>
              <Separator />
              <dl className="space-y-2.5 text-sm">
                {brand.industry && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <dt className="text-muted-foreground">Industry</dt>
                    <dd className="ml-auto font-medium text-right">{brand.industry}</dd>
                  </div>
                )}
                {brand.companySize && (
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <dt className="text-muted-foreground">Size</dt>
                    <dd className="ml-auto font-medium">{brand.companySize} employees</dd>
                  </div>
                )}
                {brand.foundedYear && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <dt className="text-muted-foreground">Founded</dt>
                    <dd className="ml-auto font-medium">{brand.foundedYear}</dd>
                  </div>
                )}
                {(brand.city || brand.country) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <dt className="text-muted-foreground">HQ</dt>
                    <dd className="ml-auto font-medium text-right">
                      {[brand.city, brand.country].filter(Boolean).join(", ")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Activity stats */}
            {(brand.campaignCount > 0 || brand.reviewCount > 0 || brand.totalSpentCents > 0) && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Activity
                </p>
                <Separator />
                <div className="space-y-3 text-sm">
                  {brand.campaignCount > 0 && (
                    <div>
                      <p className="text-2xl font-bold">{brand.campaignCount}</p>
                      <p className="text-xs text-muted-foreground">campaigns run</p>
                    </div>
                  )}
                  {brand.reviewCount > 0 && (
                    <div>
                      <p className="text-2xl font-bold">
                        {brand.avgRating?.toFixed(1) ?? "–"}
                        <span className="text-sm font-normal text-muted-foreground"> / 5</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{brand.reviewCount} creator reviews</p>
                    </div>
                  )}
                  {brand.totalSpentCents > 0 && (
                    <div>
                      <p className="text-2xl font-bold">{fmtMoney(brand.totalSpentCents)}</p>
                      <p className="text-xs text-muted-foreground">total paid to creators</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact CTA */}
            {brand.contactEmail && (
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <p className="mb-3 text-sm font-medium">Interested in a partnership?</p>
                <a
                  href={`mailto:${brand.contactEmail}`}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Get in Touch
                </a>
              </div>
            )}
          </aside>
        </div>

        <Separator className="my-12" />
      </div>
    </main>
  );
}
