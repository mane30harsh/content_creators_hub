import { Image as ImageIcon, Video, Film, Camera, ExternalLink, Eye, Heart, MessageCircle, Share2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PortfolioItem {
  id: string;
  title: string;
  brandName: string | null;
  description: string | null;
  mediaUrl: string;
  externalUrl: string | null;
  mediaType: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  engagementRate: number | null;
}

const MEDIA_ICONS: Record<string, typeof ImageIcon> = {
  IMAGE: ImageIcon,
  REEL: Film,
  VIDEO: Video,
  SCREENSHOT: Camera,
};

interface PortfolioGridProps {
  items: PortfolioItem[];
}

export function PortfolioGrid({ items }: PortfolioGridProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-6 text-xl font-bold tracking-tight">Portfolio</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = MEDIA_ICONS[item.mediaType] ?? ImageIcon;
          const isVideo = item.mediaType === "VIDEO" || item.mediaType === "REEL";

          return (
            <Card key={item.id} className="group overflow-hidden">
              <a
                href={item.externalUrl || item.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-video overflow-hidden bg-muted"
              >
                {isVideo ? (
                  <video
                    src={item.mediaUrl}
                    className="h-full w-full object-cover"
                    controls={false}
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                  <ExternalLink className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-xs">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </a>
              <CardContent className="p-4">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{item.title}</h3>
                    {item.brandName && (
                      <p className="truncate text-xs text-muted-foreground">{item.brandName}</p>
                    )}
                  </div>
                </div>
                {item.description && (
                  <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {(item.views != null ||
                  item.likes != null ||
                  item.comments != null ||
                  item.shares != null ||
                  item.engagementRate != null) && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {item.views != null && (
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {item.views.toLocaleString()}
                      </span>
                    )}
                    {item.likes != null && (
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {item.likes.toLocaleString()}
                      </span>
                    )}
                    {item.comments != null && (
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {item.comments.toLocaleString()}
                      </span>
                    )}
                    {item.shares != null && (
                      <span className="inline-flex items-center gap-1">
                        <Share2 className="h-3.5 w-3.5" />
                        {item.shares.toLocaleString()}
                      </span>
                    )}
                    {item.engagementRate != null && (
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {item.engagementRate}%
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
