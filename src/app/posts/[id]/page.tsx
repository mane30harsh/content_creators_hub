import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPost, getPostComments, getMyInteractions } from "@/lib/actions/feed";
import { PostCard } from "@/components/feed/post-card";
import { CommentSection } from "@/components/feed/comment-section";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title ?? "Post"} – Content Creators Hub`,
    description: post.body.slice(0, 160),
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;

  const [post, comments] = await Promise.all([
    getPost(id),
    getPostComments(id),
  ]);

  if (!post || post.isRemoved) notFound();

  const { likedSet, savedSet } = await getMyInteractions([id]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/feed"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      <div className="space-y-6">
        <PostCard
          post={post}
          liked={likedSet.has(post.id)}
          saved={savedSet.has(post.id)}
        />

        <CommentSection
          postId={post.id}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          comments={comments as any}
        />
      </div>
    </main>
  );
}
