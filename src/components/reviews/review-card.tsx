import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/reviews/star-rating";
import {
  CREATOR_CATEGORY_LABELS,
  BRAND_CATEGORY_LABELS,
} from "@/lib/validations/review";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  creatorProfile?: { username: string | null; displayName: string | null } | null;
  brandProfile?: { slug: string | null; companyName: string | null } | null;
}

interface ReviewProps {
  review: {
    id: string;
    rating: number;
    body: string | null;
    categories: Record<string, number> | null;
    createdAt: Date;
    author: Author;
    campaign: { title: string };
  };
}

export function ReviewCard({ review }: ReviewProps) {
  const authorName =
    review.author.name ??
    review.author.creatorProfile?.displayName ??
    review.author.brandProfile?.companyName ??
    "Unknown";

  const initials = authorName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isCreatorReview = review.author.role === "CREATOR";
  const categoryLabels = isCreatorReview ? BRAND_CATEGORY_LABELS : CREATOR_CATEGORY_LABELS;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={review.author.image ?? undefined} alt={authorName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{authorName}</p>
            <p className="text-xs text-muted-foreground">
              {isCreatorReview ? "Creator" : "Brand"} · {review.campaign.title}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {review.body && (
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{review.body}</p>
      )}

      {review.categories && Object.keys(review.categories).length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
          {Object.entries(review.categories).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {categoryLabels[key] ?? key}
              </span>
              <StarRating rating={value} size="sm" />
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-[10px] text-muted-foreground">
        {formatDate(review.createdAt)}
      </p>
    </div>
  );
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
