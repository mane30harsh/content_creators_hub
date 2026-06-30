"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createComment } from "@/lib/actions/feed";

interface CommentAuthor {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  creatorProfile?: { username: string | null; displayName: string | null } | null;
  brandProfile?: { slug: string | null; companyName: string | null } | null;
}

interface ReplyData {
  id: string;
  body: string;
  createdAt: Date;
  author: CommentAuthor;
}

interface CommentData {
  id: string;
  body: string;
  createdAt: Date;
  author: CommentAuthor;
  replies: ReplyData[];
  _count: { likes: number };
}

interface Props {
  postId: string;
  comments: CommentData[];
}

export function CommentSection({ postId, comments: _initialComments }: Props) {
  const router = useRouter();
  const [comments] = useState(_initialComments);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    startTransition(async () => {
      const res = await createComment({ postId, body: body.trim() });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  function handleReply(commentId: string) {
    if (!replyBody.trim()) return;

    startTransition(async () => {
      const res = await createComment({ postId, parentId: commentId, body: replyBody.trim() });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setReplyTo(null);
      setReplyBody("");
      router.refresh();
    });
  }

  function authorName(a: CommentAuthor) {
    return a.name ?? a.creatorProfile?.displayName ?? a.brandProfile?.companyName ?? "Unknown";
  }

  function authorInitials(a: CommentAuthor) {
    const name = authorName(a);
    return name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>

      {/* Add comment */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          maxLength={2000}
        />
        <Button type="submit" size="sm" disabled={isPending || !body.trim()}>
          {isPending ? "..." : "Post"}
        </Button>
      </form>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id}>
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={comment.author.image ?? undefined} />
                  <AvatarFallback className="text-[10px]">{authorInitials(comment.author)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="rounded-xl bg-muted px-3 py-2">
                    <p className="text-xs font-medium">{authorName(comment.author)}</p>
                    <p className="text-sm">{comment.body}</p>
                  </div>
                  <button
                    type="button"
                    className="ml-2 mt-0.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  >
                    Reply
                  </button>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage src={reply.author.image ?? undefined} />
                            <AvatarFallback className="text-[8px]">
                              {authorInitials(reply.author)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="rounded-xl bg-muted/60 px-3 py-1.5">
                            <p className="text-xs font-medium">{authorName(reply.author)}</p>
                            <p className="text-sm">{reply.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply form */}
                  {replyTo === comment.id && (
                    <div className="ml-4 mt-2 flex gap-2">
                      <input
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none"
                        maxLength={2000}
                        autoFocus
                      />
                      <Button type="button" size="sm" variant="ghost" onClick={() => handleReply(comment.id)} disabled={!replyBody.trim()}>
                        Reply
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
