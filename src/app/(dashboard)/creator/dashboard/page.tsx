import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvailabilityBadge } from "@/components/creator/availability-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Instagram,
  Youtube,
  Music2,
  Twitter,
  Pencil,
  ExternalLink,
  Sparkles,
  Users,
  Star,
  Briefcase,
} from "lucide-react";

export const metadata = { title: "Creator Dashboard – Content Creators Hub" };

function fmtFollowers(n: number | null | undefined): string {
  if (!n) return "–";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default async function CreatorDashboardPage() {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
  });

  // Not onboarded yet
  if (!profile?.username) {
    redirect("/creator/onboarding");
  }

  const initials = (profile.displayName ?? profile.username ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalFollowers =
    (profile.instagramFollowers ?? 0) +
    (profile.youtubeSubscribers ?? 0) +
    (profile.tiktokFollowers ?? 0) +
    (profile.twitterFollowers ?? 0);

  const platforms = [
    {
      icon: Instagram,
      label: "Instagram",
      handle: profile.instagramHandle,
      count: profile.instagramFollowers,
      color: "text-pink-600",
    },
    {
      icon: Youtube,
      label: "YouTube",
      handle: profile.youtubeHandle,
      count: profile.youtubeSubscribers,
      color: "text-red-600",
    },
    {
      icon: Music2,
      label: "TikTok",
      handle: profile.tiktokHandle,
      count: profile.tiktokFollowers,
      color: "text-foreground",
    },
    {
      icon: Twitter,
      label: "Twitter/X",
      handle: profile.twitterHandle,
      count: profile.twitterFollowers,
      color: "text-sky-500",
    },
  ].filter((p) => p.handle);

  const profileCompleteness = (() => {
    const fields = [
      profile.displayName,
      profile.bio,
      profile.avatar,
      profile.coverImage,
      profile.country,
      profile.niche.length > 0,
      profile.language.length > 0,
      profile.contactEmail,
      profile.instagramHandle || profile.youtubeHandle || profile.tiktokHandle || profile.twitterHandle,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  })();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border border-border">
            <AvatarImage src={profile.avatar ?? undefined} />
            <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{profile.displayName}</h1>
              <AvailabilityBadge
                status={profile.availability as "AVAILABLE" | "LIMITED" | "FULLY_BOOKED"}
              />
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href={`/creator/${profile.username}`} target="_blank">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              View Profile
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/creator/profile/edit">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Profile completeness */}
      {profileCompleteness < 100 && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Your profile is {profileCompleteness}% complete
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{ width: `${profileCompleteness}%` }}
                />
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link href="/creator/profile/edit">Complete it</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Total Reach</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{fmtFollowers(totalFollowers)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Rating</span>
            </div>
            <p className="mt-2 text-2xl font-bold">
              {profile.avgRating?.toFixed(1) ?? "–"}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ({profile.reviewCount})
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Campaigns</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{profile.campaignCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Niches</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{profile.niche.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile snapshot */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Snapshot</CardTitle>
            <CardDescription>How you appear to brands.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.bio ? (
              <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
            ) : (
              <p className="text-sm italic text-muted-foreground">No bio yet.</p>
            )}

            <Separator />

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Niches
              </p>
              {profile.niche.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.niche.map((n: string) => (
                    <span
                      key={n}
                      className="inline-flex rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">None selected.</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.language.map((l: string) => (
                  <span
                    key={l}
                    className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Social Accounts</CardTitle>
            <CardDescription>Platforms connected to your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            {platforms.length > 0 ? (
              <div className="space-y-3">
                {platforms.map(({ icon: Icon, label, handle, count, color }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-sm text-muted-foreground">@{handle}</span>
                    </div>
                    <span className="text-sm font-semibold">{fmtFollowers(count)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No social accounts connected yet.</p>
                <Button variant="link" asChild className="mt-1">
                  <Link href="/creator/profile/edit?tab=social">Add accounts →</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
