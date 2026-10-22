import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreatorCommunityView } from "@/components/creator/creator-community-view";
import { CreatorPageShell } from "@/components/creator/creator-page-shell";
import { getCreatorSuggestions } from "@/lib/creator-suggestions";

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

  const suggestions = await getCreatorSuggestions();

  return (
    <CreatorPageShell
      user={{
        name: session?.user?.name,
        email: session?.user?.email,
        image: session?.user?.image,
        username: profile?.username,
        avatar: profile?.avatar,
      }}
      suggestions={suggestions}
      mainClassName="overflow-y-auto no-scrollbar"
    >
      <div className="max-w-4xl">
        <CreatorCommunityView />
      </div>
    </CreatorPageShell>
  );
}
