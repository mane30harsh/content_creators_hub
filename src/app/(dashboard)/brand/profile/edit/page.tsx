import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { BrandProfileEditForm } from "./brand-profile-edit-form";
import { ProductsPanel } from "./products-panel";
import { CampaignShowcasePanel } from "./campaign-showcase-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Brand Profile – Content Creators Hub",
};

export default async function BrandProfileEditPage() {
  const user = await requireRole(["BRAND", "ADMIN"]);

  const profile = await prisma.brandProfile.findUnique({
    where: { userId: user.id },
    include: {
      products: { orderBy: { sortOrder: "asc" } },
      campaignShowcase: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!profile?.slug) {
    redirect("/brand/onboarding");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Brand Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your profile complete to attract the right creator partnerships.
          </p>
        </div>
        <Link
          href={`/brand/${profile.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View public profile
        </Link>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="products">
            Products
            {profile.products.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                {profile.products.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            Past Campaigns
            {profile.campaignShowcase.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                {profile.campaignShowcase.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <BrandProfileEditForm profile={profile} />
        </TabsContent>

        <TabsContent value="products">
          <ProductsPanel
            products={profile.products}
          />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignShowcasePanel
            items={profile.campaignShowcase}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
