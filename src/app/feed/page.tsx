import { Suspense } from "react";
import { requireUser } from "@/lib/auth/guards";
import { getFeed, getMyInteractions } from "@/lib/actions/feed";
import { PostCard } from "@/components/feed/post-card";
import { PostForm } from "@/components/feed/post-form";
import { FeedFilter } from "./feed-filter";
import { LoadMore } from "./load-more";

export const metadata = { title: "Feed – Content Creators Hub" };

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function FeedPage({ searchParams }: Props) {
  const user = await requireUser();
  const { type } = await searchParams;

  const { items, nextCursor } = await getFeed({ type, take: 20 });
  const postIds = items.map((p) => p.id);
  const { likedSet, savedSet } = postIds.length > 0
    ? await getMyInteractions(postIds)
    : { likedSet: new Set<string>(), savedSet: new Set<string>() };

  const role = user.role;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stay up to date with your network.
        </p>
      </div>

      {/* Create post */}
      {(role === "CREATOR" || role === "BRAND" || role === "ADMIN") && (
        <div className="mb-6">
          <PostForm />
        </div>
      )}

      {/* Filter tabs */}
      <FeedFilter currentType={type} />

      {/* Feed */}
      <div className="mt-4 space-y-4">
        {items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No posts yet. Be the first to post!
          </p>
        ) : (
          <>
            {items.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                liked={likedSet.has(post.id)}
                saved={savedSet.has(post.id)}
              />
            ))}
            {nextCursor && (
              <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading...</p>}>
                <LoadMore cursor={nextCursor} type={type} />
              </Suspense>
            )}
          </>
        )}
      </div>
    </main>
  );
}
