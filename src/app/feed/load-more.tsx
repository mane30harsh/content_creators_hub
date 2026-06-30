"use client";

import { useState } from "react";
import { getFeed, getMyInteractions } from "@/lib/actions/feed";
import { PostCard } from "@/components/feed/post-card";
import { Button } from "@/components/ui/button";

interface Props {
  cursor: string;
  type?: string;
}

export function LoadMore({ cursor: initialCursor, type }: Props) {
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  async function handleLoadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const result = await getFeed({ type, cursor, take: 10 });
      const postIds = result.items.map((p) => p.id);
      const interactions = await getMyInteractions(postIds);

      setItems((prev) => [...prev, ...result.items]);
      setLikedSet((prev) => new Set([...prev, ...interactions.likedSet]));
      setSavedSet((prev) => new Set([...prev, ...interactions.savedSet]));
      setCursor(result.nextCursor);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {items.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          liked={likedSet.has(post.id)}
          saved={savedSet.has(post.id)}
        />
      ))}
      {cursor && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
}
