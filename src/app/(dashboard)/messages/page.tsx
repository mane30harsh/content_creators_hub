import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getThreads,
  getThreadMessages,
  getOrCreateThread,
} from "@/lib/actions/message";
import { ChatView } from "@/components/messages/chat-view";
import { CreatorSidebar } from "@/components/creator/creator-sidebar";
import { CreatorMessagesView } from "@/components/creator/creator-messages-view";
import { CreatorSuggestions } from "@/components/creator/creator-suggestions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages – Brridge",
  description: "Direct messaging between content creators and brand managers.",
};

interface Props {
  searchParams: Promise<{
    threadId?: string;
    recipientId?: string;
    campaignId?: string;
  }>;
}

export default async function MessagesPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.role;

  // If Creator user, render 3-column Messages layout
  if (role === "CREATOR") {
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
      select: { username: true, avatar: true },
    });

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
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            username: profile?.username,
            avatar: profile?.avatar,
          }}
        />

        {/* ── Center Main Content ── */}
        <main className="flex-1 max-w-4xl px-8 py-6 space-y-6 overflow-y-auto no-scrollbar border-r border-neutral-900/60">
          <CreatorMessagesView />
        </main>

        {/* ── Right Sidebar Suggestions ── */}
        <CreatorSuggestions suggestions={suggestions} />
      </div>
    );
  }

  // Fallback for Brand / Admin users
  const { threadId, recipientId, campaignId } = await searchParams;

  let activeThreadId = threadId;

  if (!activeThreadId && recipientId) {
    const threadResult = await getOrCreateThread({
      targetUserId: recipientId,
      campaignId,
    });
    if (threadResult.success) {
      activeThreadId = threadResult.data.threadId;
    }
  }

  const threads = await getThreads();

  if (!activeThreadId && threads.length > 0) {
    activeThreadId = threads[0].id;
  }

  const activeThread = activeThreadId
    ? await getThreadMessages(activeThreadId)
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <ChatView
        threads={threads}
        activeThread={activeThread}
        selectedThreadId={activeThreadId}
      />
    </main>
  );
}
