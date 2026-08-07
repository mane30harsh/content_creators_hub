import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubjectReviews } from "@/lib/actions/review";
import { formatNiches } from "@/lib/validations/creator-profile";
import { AvailabilityBadge } from "@/components/creator/availability-badge";
import { SocialLinks } from "@/components/creator/social-links";
import { PortfolioGrid } from "@/components/creator/portfolio-grid";
import { ReviewCard } from "@/components/reviews/review-card";
import { BackButton } from "@/components/shared/back-button";
import { CopyProfileLinkButton } from "@/components/shared/copy-profile-link-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pencil,
  Eye,
  MapPin,
  Mail,
  Calendar,
  Sparkles,
  Briefcase,
  Globe,
  Share2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile – Content Creators Hub",
  description: "Manage your creator profile and portfolio.",
};

function fmtFollowers(n?: number | null) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default async function CreatorProfileOverviewPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const creator = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          isFeatured: true,
        },
      },
      portfolioItems: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!creator?.username) {
    redirect("/creator/onboarding");
  }

  const reviews = await getSubjectReviews(session.user.id);
  const displayNiches = formatNiches(creator.niche);

  const initials = creator.displayName
    ? creator.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : creator.username.slice(0, 2).toUpperCase();

  const joinedYear = new Date(creator.user.createdAt).getFullYear();
  const publicUrl = `/creator/${creator.username}`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <BackButton href="/creator/dashboard" label="Back to Dashboard" />

      {/* ── LinkedIn-Style Header Card ── */}
      <Card className="overflow-hidden border-border shadow-md">
        {/* Cover Image */}
        <div
          className="h-44 w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:to-slate-900"
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

        <CardContent className="relative pt-0 pb-6">
          {/* Avatar & Quick Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-4">
            <Avatar className="h-28 w-28 border-4 border-background shadow-lg shrink-0">
              <AvatarImage src={creator.avatar ?? undefined} alt={creator.displayName ?? creator.username} />
              <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" className="font-medium">
                <Link href="/creator/profile/edit">
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit Full Profile
                </Link>
              </Button>
              <CopyProfileLinkButton path={publicUrl} />
              <Button asChild variant="outline" size="sm">
                <Link href={publicUrl}>
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  View Public Profile
                </Link>
              </Button>
            </div>
          </div>

          {/* Name & Title Block */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {creator.displayName ?? `@${creator.username}`}
              </h1>
              {creator.user.isFeatured && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs">
                  ⭐ Featured Creator
                </Badge>
              )}
              <AvailabilityBadge status={creator.availability} />
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              @{creator.username}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              {(creator.city || creator.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {[creator.city, creator.country].filter(Boolean).join(", ")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                Joined {joinedYear}
              </span>
              {creator.avgRating != null && (
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  ★ {creator.avgRating.toFixed(1)} ({creator.reviewCount} {creator.reviewCount === 1 ? "review" : "reviews"})
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 1: About / Bio ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-semibold">About</CardTitle>
          <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/creator/profile/edit">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {creator.bio ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {creator.bio}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No bio added yet. Click &ldquo;Edit&rdquo; above to tell brands about yourself!
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Section 2: Niches & Languages ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-semibold">Niches & Languages</CardTitle>
          <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/creator/profile/edit">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Niches
            </p>
            {displayNiches.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {displayNiches.map((n) => (
                  <span
                    key={n}
                    className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium"
                  >
                    {n}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-muted-foreground">No niches selected.</p>
            )}
          </div>

          {creator.language.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {creator.language.map((lang) => (
                  <Badge key={lang} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 3: Social Accounts & Reach ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-semibold">Social Accounts & Reach</CardTitle>
          <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/creator/profile/edit">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* ── Section 4: Portfolio & Showcase ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Portfolio & Past Work</CardTitle>
            <CardDescription className="text-xs">
              Showcase your best content to prospective brand partners.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/creator/profile/edit">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Manage Portfolio
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <PortfolioGrid items={creator.portfolioItems} />
        </CardContent>
      </Card>

      {/* ── Section 5: Reviews ── */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Brand Reviews</CardTitle>
            <CardDescription className="text-xs">
              Feedback from brands you&apos;ve collaborated with.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
