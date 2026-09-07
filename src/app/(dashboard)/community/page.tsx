import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreatorSidebar } from "@/components/creator/creator-sidebar";
import { CreatorCommunityView } from "@/components/creator/creator-community-view";
import { CreatorSuggestions } from "@/components/creator/creator-suggestions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Community – Brridge Creator" };

export default async function CommunityPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let profile = null;
  if (userId) {
    profile = await prisma.creatorProfile.findUnique({
      where: { userId },
      select: { username: true, avatar: true },
    });
  }

  const suggestedBrands = await prisma.brandProfile.findMany({
    take: 5,
    select: { id: true, companyName: true, logo: true, slug: true },
  });

  const suggestions = suggestedBrands.map((b) => ({
    id: b.id,
    name: b.companyName || "Brand",
    avatar: b.logo,
    type: "brand" as const,
    slug: b.slug ?? undefined,
  }));

  return (
    <div className="flex min-h-screen bg-[#070709] text-white">
      {/* ── Left Navigation Sidebar ── */}
      <CreatorSidebar
        user={{
          name: session?.user?.name,
          email: session?.user?.email,
          image: session?.user?.image,
          username: profile?.username,
          avatar: profile?.avatar,
        }}
      />

      {/* ── Center Main Content ── */}
      <main className="flex-1 max-w-4xl px-8 py-6 space-y-6 overflow-y-auto no-scrollbar border-r border-neutral-900/60">
        <CreatorCommunityView />
      </main>

      {/* ── Right Sidebar Suggestions ── */}
      <CreatorSuggestions suggestions={suggestions} />
    </div>
  );
}
