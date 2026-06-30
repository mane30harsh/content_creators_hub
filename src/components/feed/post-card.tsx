"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { POST_TYPE_LABELS } from "@/lib/validations/feed";
import { toggleLike, toggleSave, sharePost } from "@/lib/actions/feed";

interface PostAuthor {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  creatorProfile?: { username: string | null; displayName: string | null } | null;
  brandProfile?: { slug: string | null; companyName: string | null } | null;
}

interface PostData {
  id: string;
  type: string;
  title: string | null;
  body: string;
  mediaUrls: string[];
  tags: string[];
  shareCount: number;
  createdAt: Date;
  author: PostAuthor;
  _count: { comments: number; likes: number };
}

interface Props {
  post: PostData;
  liked: boolean;
  saved: boolean;
}

export function PostCard({ post, liked: initialLiked, saved: initialSaved }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likeCount, setLikeCount] = useState(post._count.likes);

  const authorName =
    post.author.name ??
    post.author.creatorProfile?.displayName ??
    post.author.brandProfile?.companyName ??
    "Unknown";

  const authorLink = post.author.creatorProfile?.username
    ? `/creator/${post.author.creatorProfile.username}`
    : post.author.brandProfile?.slug
      ? `/brand/${post.author.brandProfile.slug}`
      : "#";

  const initials = authorName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleToggleLike() {
    const res = await toggleLike(post.id);
    if (res.success) {
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    }
  }

  async function handleToggleSave() {
    const res = await toggleSave(post.id);
    if (res.success) setSaved(res.data.saved);
  }

  async function handleShare() {
    const res = await sharePost(post.id);
    if (res.success) {
      const url = `${window.location.origin}/posts/${post.id}`;
      await navigator.clipboard.writeText(url);
    }
  }

  const timeAgo = formatTimeAgo(new Date(post.createdAt));

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-3">
          <Link href={authorLink}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.image ?? undefined} alt={authorName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={authorLink} className="text-sm font-medium hover:underline">
                {authorName}
              </Link>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {POST_TYPE_LABELS[post.type] ?? post.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <Link href={`/posts/${post.id}`} className="block px-5 py-3">
        {post.title && (
          <h3 className="mb-1 text-base font-semibold">{post.title}</h3>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-6">
          {post.body}
        </p>
      </Link>

      {/* Media */}
      {post.mediaUrls.length > 0 && (
        <div className={`px-5 pb-3 ${post.mediaUrls.length > 1 ? "grid grid-cols-2 gap-2" : ""}`}>
          {post.mediaUrls.slice(0, 4).map((url, i) => (
            <div key={i} className="overflow-hidden rounded-lg bg-muted">
              {url.match(/\.(mp4|webm|mov)$/i) ? (
                <video src={url} className="w-full object-cover aspect-video" controls={false} muted playsInline />
              ) : (
                <img src={url} alt="" className="w-full object-cover aspect-video" loading="lazy" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pb-2">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 border-t border-border px-2 py-1">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleToggleLike}>
          <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" asChild>
          <Link href={`/posts/${post.id}`}>
            <MessageCircle className="h-4 w-4" />
            {post._count.comments > 0 && <span className="text-xs">{post._count.comments}</span>}
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          {post.shareCount > 0 && <span className="text-xs">{post.shareCount}</span>}
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleToggleSave}>
          <Bookmark className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
        </Button>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
