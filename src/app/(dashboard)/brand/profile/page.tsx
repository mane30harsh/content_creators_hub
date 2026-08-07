import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubjectReviews } from "@/lib/actions/review";
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
import {
  Pencil,
  Eye,
  Building2,
  Globe,
  MapPin,
  Calendar,
  CheckCircle2,
  Package,
  BarChart2,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Profile – Content Creators Hub",
  description: "Manage your brand profile, products, and campaign showcases.",
};

export default async function BrandProfileOverviewPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const brand = await prisma.brandProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
      products: { orderBy: { sortOrder: "asc" } },
      campaignShowcase: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!brand?.slug) {
    redirect("/brand/onboarding");
  }

  const reviews = await getSubjectReviews(session.user.id);

  const initials = brand.companyName
    ? brand.companyName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : brand.slug.slice(0, 2).toUpperCase();

  const joinedYear = new Date(brand.user.createdAt).getFullYear();
  const publicUrl = `/brand/${brand.slug}`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <BackButton href="/brand/dashboard" label="Back to Dashboard" />

      {/* ── LinkedIn-Style Header Card ── */}
      <Card className="overflow-hidden border-border shadow-md">
        {/* Cover Image */}
        <div
          className="h-44 w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900"
          style={
            brand.coverImage
              ? {
                  backgroundImage: `url(${brand.coverImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />

        <CardContent className="relative pt-0 pb-6">
          {/* Logo & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-4">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-card shadow-lg">
              {brand.logo ? (
                <img src={brand.logo} alt={brand.companyName ?? brand.slug} className="h-full w-full object-contain p-2" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-3xl font-bold">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" className="font-medium">
                <Link href="/brand/profile/edit">
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit Brand Profile
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

          {/* Company Title Block */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {brand.companyName ?? brand.slug}
              </h1>
              {brand.isVerified && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified Brand
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              @{brand.slug}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              {brand.industry && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {brand.industry}
                </span>
              )}
              {brand.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {brand.country}
                </span>
              )}
              {brand.websiteUrl && (
                <a
                  href={brand.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  {brand.websiteUrl.replace(/^https?:\/\//, "")}
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                Member since {joinedYear}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 1: About Brand ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-semibold">About Company</CardTitle>
          <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/brand/profile/edit">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {brand.bio ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {brand.bio}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No company description added yet. Click &ldquo;Edit&rdquo; above to tell creators about your brand!
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Section 2: Products Showcase ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Featured Products ({brand.products.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Products you offer to creators for campaign collaborations.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/brand/profile/edit">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Manage Products
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {brand.products.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              No products added yet. Add your products in profile settings to display them to creators.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {brand.products.map((prod) => (
                <div key={prod.id} className="flex gap-3 rounded-lg border border-border p-3">
                  {prod.imageUrl && (
                    <img src={prod.imageUrl} alt={prod.name} className="h-16 w-16 rounded-md object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{prod.name}</p>
                    {prod.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{prod.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 3: Campaign Showcase ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              Past Campaigns & Highlights ({brand.campaignShowcase.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Past creator campaigns and results achieved.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/brand/profile/edit">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Manage Highlights
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {brand.campaignShowcase.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              No past campaign highlights added yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {brand.campaignShowcase.map((show) => (
                <div key={show.id} className="rounded-lg border border-border p-3 space-y-1.5">
                  <p className="font-semibold text-sm">{show.title}</p>
                  {show.resultSummary && (
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                      🏆 {show.resultSummary}
                    </Badge>
                  )}
                  {show.description && <p className="text-xs text-muted-foreground">{show.description}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 4: Reviews ── */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Creator Reviews</CardTitle>
            <CardDescription className="text-xs">
              Reviews from creators who collaborated with {brand.companyName}.
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
