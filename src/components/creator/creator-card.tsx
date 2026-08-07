import Link from "next/link";
import { Star } from "lucide-react";
import { formatNiches } from "@/lib/validations/creator-profile";

function fmtFollowers(n?: number | null) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
}

interface CreatorCardProps {
  creator: {
    id: string;
    username: string;
    displayName?: string | null;
    avatar?: string | null;
    niche: string[];
    bio?: string | null;
    avgRating?: number | null;
    reviewCount?: number;
    instagramFollowers?: number | null;
    youtubeSubscribers?: number | null;
    tiktokFollowers?: number | null;
    city?: string | null;
    country?: string | null;
  };
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const name = creator.displayName || `@${creator.username}`;
  const totalFollowers =
    (creator.instagramFollowers || 0) +
    (creator.youtubeSubscribers || 0) +
    (creator.tiktokFollowers || 0);

  const displayNiches = formatNiches(creator.niche).slice(0, 3).join(" | ");

  const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-[#0F0F10] p-3.5 shadow-xl transition-all duration-300 hover:border-neutral-700 hover:shadow-2xl">
      {/* Photo */}
      <div className="relative h-52 w-full overflow-hidden rounded-xl bg-neutral-900">
        <img
          src={creator.avatar || defaultAvatar}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />

        {/* Rating Badge */}
        {creator.avgRating != null && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur-md">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{creator.avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 flex flex-1 flex-col space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white truncate group-hover:text-[#FF0066] transition-colors">
            {name}
          </h3>
        </div>

        <p className="text-xs text-neutral-400 font-medium">
          Followers - {fmtFollowers(totalFollowers)}
        </p>

        {displayNiches && (
          <p className="text-[11px] text-neutral-400 line-clamp-1">
            {displayNiches}
          </p>
        )}

        <p className="text-[11px] text-neutral-500 font-medium pt-0.5">
          Collabs - {creator.reviewCount || 0}
        </p>

        {/* Hot Pink Collab Button */}
        <div className="pt-2 mt-auto">
          <Link
            href={`/creator/${creator.username}`}
            className="flex w-full items-center justify-center rounded-full bg-[#E60067] py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#FF0066] hover:scale-[1.02]"
          >
            Collab
          </Link>
        </div>
      </div>
    </div>
  );
}
