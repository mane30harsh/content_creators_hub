import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getThreads,
  getThreadMessages,
  getOrCreateThread,
} from "@/lib/actions/message";
import { ChatView } from "@/components/messages/chat-view";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages – Content Creators Hub",
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

  const { threadId, recipientId, campaignId } = await searchParams;

  let activeThreadId = threadId;

  // If recipientId is passed directly in URL, get or create the thread
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

  // If no threadId selected but user has threads, default to the most recent thread
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
