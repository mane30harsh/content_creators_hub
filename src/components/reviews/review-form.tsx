"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/reviews/star-rating";
import { Button } from "@/components/ui/button";
import { createReview } from "@/lib/actions/review";
import {
  CREATOR_REVIEW_CATEGORIES,
  BRAND_REVIEW_CATEGORIES,
  CREATOR_CATEGORY_LABELS,
  BRAND_CATEGORY_LABELS,
} from "@/lib/validations/review";

interface Props {
  campaignId: string;
  subjectId: string;
  authorRole: "CREATOR" | "BRAND";
  subjectName: string;
}

export function ReviewForm({ campaignId, subjectId, authorRole, subjectName }: Props) {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isBrandReview = authorRole === "BRAND";
  const categoryDefs = isBrandReview ? CREATOR_REVIEW_CATEGORIES : BRAND_REVIEW_CATEGORIES;
  const categoryLabels = isBrandReview ? CREATOR_CATEGORY_LABELS : BRAND_CATEGORY_LABELS;

  function setCategoryRating(key: string, value: number) {
    setCategories((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select an overall rating.");
      return;
    }
    if (body.length < 20) {
      setError("Review must be at least 20 characters.");
      return;
    }

    startTransition(async () => {
      const result = await createReview({
        campaignId,
        subjectId,
        rating,
        body: body.trim(),
        categories: Object.keys(categories).length > 0 ? categories : undefined,
      });
      if (!result.success) {
        setError(result.error);
      } else {
        router.push(`/messages`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          Reviewing <span className="font-medium text-foreground">{subjectName}</span>
        </p>
      </div>

      {/* Overall rating */}
      <div>
        <label className="mb-2 block text-sm font-medium">Overall Rating</label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onChange={setRating}
        />
        {rating > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {rating === 1 ? "Poor" : rating === 2 ? "Below Average" : rating === 3 ? "Average" : rating === 4 ? "Good" : "Excellent"}
          </p>
        )}
      </div>

      {/* Category ratings */}
      <div>
        <label className="mb-2 block text-sm font-medium">Category Ratings (optional)</label>
        <div className="space-y-2">
          {categoryDefs.map((key) => (
            <div key={key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm">{categoryLabels[key]}</span>
              <StarRating
                rating={categories[key] ?? 0}
                size="sm"
                interactive
                onChange={(v) => setCategoryRating(key, v)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Review text */}
      <div>
        <label htmlFor="body" className="mb-2 block text-sm font-medium">
          Your Review
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your experience working together..."
          rows={4}
          className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {body.length}/2000 — minimum 20 characters
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || rating === 0 || body.length < 20}>
          {isPending ? "Submitting..." : "Submit Review"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
