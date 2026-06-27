import { Instagram, Twitter, Youtube, Music2, Linkedin, Facebook, Globe } from "lucide-react";

interface BrandSocialLinksProps {
  instagramHandle?: string | null;
  twitterHandle?:   string | null;
  youtubeHandle?:   string | null;
  tiktokHandle?:    string | null;
  linkedinUrl?:     string | null;
  facebookUrl?:     string | null;
  websiteUrl?:      string | null;
}

const platformConfig = [
  {
    key: "instagram" as const,
    Icon: Instagram,
    label: "Instagram",
    color: "text-pink-600",
    href: (h: string) => `https://instagram.com/${h}`,
  },
  {
    key: "twitter" as const,
    Icon: Twitter,
    label: "X / Twitter",
    color: "text-sky-500",
    href: (h: string) => `https://x.com/${h}`,
  },
  {
    key: "youtube" as const,
    Icon: Youtube,
    label: "YouTube",
    color: "text-red-600",
    href: (h: string) => `https://youtube.com/@${h}`,
  },
  {
    key: "tiktok" as const,
    Icon: Music2,
    label: "TikTok",
    color: "text-foreground",
    href: (h: string) => `https://tiktok.com/@${h}`,
  },
  {
    key: "linkedin" as const,
    Icon: Linkedin,
    label: "LinkedIn",
    color: "text-blue-600",
    href: (u: string) => u,
  },
  {
    key: "facebook" as const,
    Icon: Facebook,
    label: "Facebook",
    color: "text-blue-700",
    href: (u: string) => u,
  },
  {
    key: "website" as const,
    Icon: Globe,
    label: "Website",
    color: "text-muted-foreground",
    href: (u: string) => u,
  },
] as const;

type PlatformKey = (typeof platformConfig)[number]["key"];

type ValueMap = {
  instagram?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  website?: string | null;
};

export function BrandSocialLinks(props: BrandSocialLinksProps) {
  const values: ValueMap = {
    instagram: props.instagramHandle,
    twitter: props.twitterHandle,
    youtube: props.youtubeHandle,
    tiktok: props.tiktokHandle,
    linkedin: props.linkedinUrl,
    facebook: props.facebookUrl,
    website: props.websiteUrl,
  };

  const active = platformConfig.filter(({ key }) => values[key]);
  if (!active.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {active.map(({ key, Icon, label, color, href }) => {
        const val = values[key]!;
        return (
          <a
            key={key}
            href={href(val)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            <Icon className={`h-4 w-4 shrink-0 ${color}`} />
            <span className="font-medium">{label}</span>
          </a>
        );
      })}
    </div>
  );
}
