import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getThreads,
  getThreadMessages,
  getOrCreateThread,
} from "@/lib/actions/message";
import { ChatView } from "@/components/messages/chat-view";
import { CreatorMessagesView } from "@/components/creator/creator-messages-view";
import { CreatorPageShell } from "@/components/creator/creator-page-shell";
import { getCreatorSuggestions } from "@/lib/creator-suggestions";
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

    const suggestions = await getCreatorSuggestions();

    return (
      <CreatorPageShell
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          username: profile?.username,
          avatar: profile?.avatar,
        }}
        suggestions={suggestions}
        mainClassName="flex flex-col overflow-hidden"
      >
        <CreatorMessagesView />
      </CreatorPageShell>
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
