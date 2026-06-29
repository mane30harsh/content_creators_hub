import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { BrandSocialLinks } from "@/components/brand/brand-social-links";
import {
  Pencil, ExternalLink, Package, Megaphone,
  Star, Briefcase, DollarSign, Building2,
  MapPin, Globe, ChevronRight, AlertCircle,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Dashboard – Content Creators Hub",
};

function fmtMoney(cents: number) {
  if (cents >= 1_000_000_00) return `$${(cents / 1_000_000_00).toFixed(1)}M`;
  if (cents >= 1_000_00) return `$${(cents / 1_000_00).toFixed(0)}K`;
  return `$${(cents / 100).toLocaleString()}`;
}

export default async function BrandDashboardPage() {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const profile = await prisma.brandProfile.findUnique({
    where: { userId: user.id },
    include: {
      products: { orderBy: { sortOrder: "asc" }, take: 4 },
      campaignShowcase: { orderBy: { sortOrder: "asc" }, take: 4 },
    },
  });

  if (!profile?.slug) {
    redirect("/brand/onboarding");
  }

  // Profile completeness score
  const completenessFields = [
    profile.companyName,
    profile.tagline,
    profile.bio,
    profile.logo,
    profile.coverImage,
    profile.industry,
    profile.country,
    profile.websiteUrl,
    profile.contactEmail,
    profile.companySize,
    profile.instagramHandle || profile.linkedinUrl || profile.twitterHandle,
    profile.products.length > 0,
    profile.campaignShowcase.length > 0,
  ];
  const filledCount = completenessFields.filter(Boolean).length;
  const completeness = Math.round((filledCount / completenessFields.length) * 100);

  const initials = (profile.companyName ?? profile.slug)
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* ── Page header ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {profile.logo ? (
              <img src={profile.logo} alt={profile.companyName ?? profile.slug} className="h-full w-full object-contain p-1" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-bold text-lg">
                {initials}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{profile.companyName ?? profile.slug}</h1>
              {profile.isVerified && <VerifiedBadge size="sm" />}
            </div>
            {profile.tagline && (
              <p className="text-sm text-muted-foreground">{profile.tagline}</p>
            )}
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              {profile.industry && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> {profile.industry}
                </span>
              )}
              {(profile.city || profile.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/brand/${profile.slug}`} target="_blank">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Public Profile
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/brand/profile/edit">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Completeness bar ── */}
      {completeness < 100 && (
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Your profile is {completeness}% complete
            </p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100">
            <Link href="/brand/profile/edit">Complete it →</Link>
          </Button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <Briefcase className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Campaigns</span>
            </div>
            <p className="text-3xl font-bold">{profile.campaignCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <Star className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Avg Rating</span>
            </div>
            <p className="text-3xl font-bold">
              {profile.avgRating?.toFixed(1) ?? "–"}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ({profile.reviewCount})
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Total Paid</span>
            </div>
            <p className="text-3xl font-bold">
              {profile.totalSpentCents > 0 ? fmtMoney(profile.totalSpentCents) : "–"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <Package className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Products</span>
            </div>
            <p className="text-3xl font-bold">{profile.products.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile snapshot */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Brand Snapshot</CardTitle>
              <CardDescription>What creators see when they find you.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/brand/profile/edit" className="text-xs">
                Edit <ChevronRight className="ml-0.5 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.bio ? (
              <p className="line-clamp-4 text-sm text-muted-foreground">{profile.bio}</p>
            ) : (
              <p className="italic text-sm text-muted-foreground">No description yet. Add one to attract creators.</p>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Industry</p>
                <p>{profile.industry ?? <span className="italic text-muted-foreground">–</span>}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Company size</p>
                <p>{profile.companySize ? `${profile.companySize} employees` : <span className="italic text-muted-foreground">–</span>}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Founded</p>
                <p>{profile.foundedYear ?? <span className="italic text-muted-foreground">–</span>}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Website</p>
                {profile.websiteUrl ? (
                  <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline truncate">
                    <Globe className="h-3 w-3 shrink-0" />
                    {profile.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                ) : <span className="italic text-muted-foreground">–</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social & contact */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Social & Contact</CardTitle>
              <CardDescription>How creators reach your team.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/brand/profile/edit?tab=social" className="text-xs">
                Edit <ChevronRight className="ml-0.5 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <BrandSocialLinks
              instagramHandle={profile.instagramHandle}
              twitterHandle={profile.twitterHandle}
              youtubeHandle={profile.youtubeHandle}
              tiktokHandle={profile.tiktokHandle}
              linkedinUrl={profile.linkedinUrl}
              facebookUrl={profile.facebookUrl}
              websiteUrl={profile.websiteUrl}
            />
            {!profile.instagramHandle && !profile.twitterHandle && !profile.linkedinUrl && (
              <p className="text-sm italic text-muted-foreground">No social accounts linked yet.</p>
            )}
            <Separator />
            {profile.contactEmail ? (
              <p className="text-sm">
                <span className="font-medium">Partnerships email: </span>
                <a href={`mailto:${profile.contactEmail}`} className="text-primary hover:underline">
                  {profile.contactEmail}
                </a>
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No contact email set.{" "}
                <Link href="/brand/profile/edit" className="text-primary hover:underline not-italic">
                  Add one →
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Products preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Products
              </CardTitle>
              <CardDescription>
                {profile.products.length === 0
                  ? "No products showcased yet."
                  : `${profile.products.length} product${profile.products.length !== 1 ? "s" : ""} showcased`}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/brand/profile/edit" className="text-xs">
                {profile.products.length === 0 ? "Add" : "Manage"} <ChevronRight className="ml-0.5 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {profile.products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Package className="mb-2 h-7 w-7 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Add products for creators to preview.</p>
                <Button variant="link" size="sm" asChild className="mt-1">
                  <Link href="/brand/profile/edit">Add products →</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.products.slice(0, 3).map((p: typeof profile.products[0]) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      {p.description && (
                        <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                      )}
                    </div>
                  </div>
                ))}
                {profile.products.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{profile.products.length - 3} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaigns preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone className="h-4 w-4" />
                Past Campaigns
              </CardTitle>
              <CardDescription>
                {profile.campaignShowcase.length === 0
                  ? "No campaigns showcased yet."
                  : `${profile.campaignShowcase.length} campaign${profile.campaignShowcase.length !== 1 ? "s" : ""} showcased`}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/brand/profile/edit" className="text-xs">
                {profile.campaignShowcase.length === 0 ? "Add" : "Manage"} <ChevronRight className="ml-0.5 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {profile.campaignShowcase.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Megaphone className="mb-2 h-7 w-7 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Show creators what you&apos;ve run before.</p>
                <Button variant="link" size="sm" asChild className="mt-1">
                  <Link href="/brand/profile/edit">Add campaigns →</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.campaignShowcase.slice(0, 3).map((c: typeof profile.campaignShowcase[0]) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Megaphone className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{c.title}</p>
                        {c.year && <span className="shrink-0 text-xs text-muted-foreground">{c.year}</span>}
                      </div>
                      {c.resultSummary && (
                        <p className="truncate text-xs text-emerald-600 dark:text-emerald-400">{c.resultSummary}</p>
                      )}
                    </div>
                  </div>
                ))}
                {profile.campaignShowcase.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{profile.campaignShowcase.length - 3} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
