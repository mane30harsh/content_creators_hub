import Link from "next/link";
import { getCompletedCampaignsForReview } from "@/lib/actions/review";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText, Inbox } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";

export const metadata = { title: "Reviews – Content Creators Hub" };

export default async function ReviewsPage() {
  const { asBrand, asCreator } = await getCompletedCampaignsForReview();

  const total = asBrand.length + asCreator.length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <BackButton />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Leave reviews for campaigns you&apos;ve completed.
        </p>
      </div>

      {total === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Inbox className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">No campaigns to review yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete a campaign to leave a review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {asBrand.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4" />
                  Review Creators
                </CardTitle>
                <CardDescription>
                  Campaigns you ran as a brand.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {asBrand.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Reviewing: {c.subjectName}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/reviews/new/${c.id}`}>Write Review</Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {asCreator.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4" />
                  Review Brands
                </CardTitle>
                <CardDescription>
                  Campaigns you participated in as a creator.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {asCreator.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Reviewing: {c.subjectName}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/reviews/new/${c.id}`}>Write Review</Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}
