import { DELIVERABLE_TYPE_LABELS } from "@/lib/validations/campaign";

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM_POST:  "bg-pink-100 text-pink-800",
  INSTAGRAM_REEL:  "bg-pink-100 text-pink-800",
  INSTAGRAM_STORY: "bg-pink-100 text-pink-800",
  YOUTUBE_VIDEO:   "bg-red-100 text-red-800",
  YOUTUBE_SHORT:   "bg-red-100 text-red-800",
  TIKTOK_VIDEO:    "bg-slate-100 text-slate-800",
  TWITTER_POST:    "bg-sky-100 text-sky-800",
  LINKEDIN_POST:   "bg-blue-100 text-blue-800",
  BLOG_POST:       "bg-emerald-100 text-emerald-800",
  PODCAST_EPISODE: "bg-purple-100 text-purple-800",
  OTHER:           "bg-muted text-muted-foreground",
};

export function DeliverableBadge({ type, count }: { type: string; count?: number }) {
  const color = PLATFORM_COLORS[type] ?? "bg-muted text-muted-foreground";
  const label = DELIVERABLE_TYPE_LABELS[type] ?? type;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {count && count > 1 ? `${count}× ` : ""}{label}
    </span>
  );
}
