import { Instagram, Youtube, Music2, Twitter, Linkedin, Globe } from "lucide-react";

function fmt(n: number | null | undefined): string | null {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

interface SocialLinksProps {
  instagramHandle?: string | null;
  instagramFollowers?: number | null;
  youtubeHandle?: string | null;
  youtubeSubscribers?: number | null;
  tiktokHandle?: string | null;
  tiktokFollowers?: number | null;
  twitterHandle?: string | null;
  twitterFollowers?: number | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
}

export function SocialLinks(props: SocialLinksProps) {
  const platforms = [
    {
      key: "instagram",
      icon: Instagram,
      label: "Instagram",
      handle: props.instagramHandle,
      followers: props.instagramFollowers,
      href: props.instagramHandle
        ? `https://instagram.com/${props.instagramHandle}`
        : null,
      color: "text-pink-600",
    },
    {
      key: "youtube",
      icon: Youtube,
      label: "YouTube",
      handle: props.youtubeHandle,
      followers: props.youtubeSubscribers,
      href: props.youtubeHandle
        ? `https://youtube.com/@${props.youtubeHandle}`
        : null,
      color: "text-red-600",
    },
    {
      key: "tiktok",
      icon: Music2,
      label: "TikTok",
      handle: props.tiktokHandle,
      followers: props.tiktokFollowers,
      href: props.tiktokHandle
        ? `https://tiktok.com/@${props.tiktokHandle}`
        : null,
      color: "text-foreground",
    },
    {
      key: "twitter",
      icon: Twitter,
      label: "X / Twitter",
      handle: props.twitterHandle,
      followers: props.twitterFollowers,
      href: props.twitterHandle
        ? `https://x.com/${props.twitterHandle}`
        : null,
      color: "text-sky-500",
    },
    {
      key: "linkedin",
      icon: Linkedin,
      label: "LinkedIn",
      handle: props.linkedinUrl ? "LinkedIn" : null,
      followers: null,
      href: props.linkedinUrl ?? null,
      color: "text-blue-600",
    },
    {
      key: "website",
      icon: Globe,
      label: "Website",
      handle: props.websiteUrl ? "Website" : null,
      followers: null,
      href: props.websiteUrl ?? null,
      color: "text-muted-foreground",
    },
  ].filter((p) => p.handle);

  if (!platforms.length) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {platforms.map(({ key, icon: Icon, label, handle, followers, href, color }) => (
        <a
          key={key}
          href={href ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="font-medium">@{handle}</span>
          {followers && (
            <span className="text-muted-foreground">· {fmt(followers)}</span>
          )}
        </a>
      ))}
    </div>
  );
}
