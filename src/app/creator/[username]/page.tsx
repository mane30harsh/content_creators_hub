import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AvailabilityBadge } from "@/components/creator/availability-badge";
import { SocialLinks } from "@/components/creator/social-links";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Calendar } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

async function getCreator(username: string) {
  return prisma.creatorProfile.findFirst({
    where: { username },
    include: {
      user: {
        select: {
          name: true,
          isFeatured: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const creator = await getCreator(username);
  if (!creator) return { title: "Creator not found" };
  return {
    title: `${creator.displayName ?? creator.username} – Content Creators Hub`,
    description: creator.bio ?? undefined,
  };
}

export default async function CreatorPublicProfilePage({ params }: Props) {
  const { username } = await params;
  const creator = await getCreator(username);

  if (!creator) notFound();

  const initials = (creator.displayName ?? creator.username ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalFollowers =
    (creator.instagramFollowers ?? 0) +
    (creator.youtubeSubscribers ?? 0) +
    (creator.tiktokFollowers ?? 0) +
    (creator.twitterFollowers ?? 0);

  function fmtFollowers(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  }

  const joinedYear = new Date(creator.user.createdAt).getFullYear();

  return (
    <main className="min-h-screen bg-background">
      {/* Cover Banner */}
      <div
        className="h-48 w-full bg-gradient-to-r from-slate-200 to-slate-300 sm:h-64"
        style={
          creator.coverImage
            ? {
                backgroundImage: `url(${creator.coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      />

      {/* Profile Header */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative -mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          {/* Avatar */}
          <Avatar className="h-28 w-28 shrink-0 border-4 border-background shadow-lg sm:h-32 sm:w-32">
            <AvatarImage src={creator.avatar ?? undefined} alt={creator.displayName ?? username} />
            <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>

          {/* Name & meta */}
          <div className="flex flex-1 flex-col gap-2 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold leading-none">
                {creator.displayName ?? `@${username}`}
              </h1>
              {creator.user.isFeatured && (
                <Badge variant="secondary">⭐ Featured</Badge>
              )}
              <AvailabilityBadge
                status={creator.availability as "AVAILABLE" | "LIMITED" | "FULLY_BOOKED"}
              />
            </div>
            <p className="text-sm text-muted-foreground">@{username}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {(creator.city || creator.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[creator.city, creator.country].filter(Boolean).join(", ")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Member since {joinedYear}
              </span>
              {creator.contactEmail && (
                <a
                  href={`mailto:${creator.contactEmail}`}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {creator.contactEmail}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left — main info */}
          <div className="space-y-8 lg:col-span-2">
            {creator.bio && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  About
                </h2>
                <p className="text-base leading-relaxed whitespace-pre-wrap">{creator.bio}</p>
              </section>
            )}

            {creator.niche.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Niches
                </h2>
                <div className="flex flex-wrap gap-2">
                  {creator.niche.map((n: string) => (
                    <span
                      key={n}
                      className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Social Presence
              </h2>
              <SocialLinks
                instagramHandle={creator.instagramHandle}
                instagramFollowers={creator.instagramFollowers}
                youtubeHandle={creator.youtubeHandle}
                youtubeSubscribers={creator.youtubeSubscribers}
                tiktokHandle={creator.tiktokHandle}
                tiktokFollowers={creator.tiktokFollowers}
                twitterHandle={creator.twitterHandle}
                twitterFollowers={creator.twitterFollowers}
                linkedinUrl={creator.linkedinUrl}
                websiteUrl={creator.websiteUrl}
              />
            </section>
          </div>

          {/* Right — stats sidebar */}
          <aside className="space-y-6">
            {/* Total reach */}
            {totalFollowers > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Total Reach
                </p>
                <p className="mt-1 text-3xl font-bold">{fmtFollowers(totalFollowers)}</p>
                <p className="text-xs text-muted-foreground">followers across platforms</p>
              </div>
            )}

            {/* Reviews */}
            {creator.reviewCount > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Rating
                </p>
                <p className="mt-1 text-3xl font-bold">
                  {creator.avgRating?.toFixed(1) ?? "–"}{" "}
                  <span className="text-base font-normal text-muted-foreground">/ 5</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {creator.reviewCount} review{creator.reviewCount !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {/* Campaigns */}
            {creator.campaignCount > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Campaigns Completed
                </p>
                <p className="mt-1 text-3xl font-bold">{creator.campaignCount}</p>
              </div>
            )}

            {/* Languages */}
            {creator.language.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Languages
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {creator.language.map((l: string) => (
                    <span
                      key={l}
                      className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        <Separator className="my-12" />
      </div>
    </main>
  );
}
