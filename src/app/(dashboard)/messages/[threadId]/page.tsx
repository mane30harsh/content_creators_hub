import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getThreadMessages } from "@/lib/actions/message";
import { MessageList } from "@/components/messages/message-list";
import { MessageInput } from "@/components/messages/message-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  params: Promise<{ threadId: string }>;
}

export default async function ThreadDetailPage({ params }: Props) {
  const { threadId } = await params;
  const thread = await getThreadMessages(threadId);

  if (!thread) notFound();

  const other = thread.otherUser;
  const initials = other?.displayName
    ?.split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  const profileHref = other?.profileHref ?? null;

  return (
    <main className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-3xl flex-col px-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border py-3">
        <Link
          href="/messages"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <Avatar className="h-8 w-8">
          <AvatarImage src={other?.avatar ?? undefined} alt={other?.displayName ?? ""} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          {profileHref ? (
            <Link href={profileHref} className="text-sm font-semibold hover:underline">
              {other?.displayName ?? "Unknown"}
            </Link>
          ) : (
            <p className="text-sm font-semibold">{other?.displayName ?? "Unknown"}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={thread.messages}
        otherParticipant={{
          name: other?.displayName ?? "Unknown",
          image: other?.avatar ?? null,
        }}
      />

      {/* Input */}
      <MessageInput threadId={threadId} />
    </main>
  );
}
