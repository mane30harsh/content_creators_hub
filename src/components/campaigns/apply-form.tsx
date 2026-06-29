"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, type ApplicationInput } from "@/lib/validations/campaign";
import { applyToCampaign } from "@/lib/actions/campaign";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

interface ApplyFormProps {
  campaignId: string;
  campaignTitle: string;
}

export function ApplyForm({ campaignId, campaignTitle }: ApplyFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { campaignId, pitch: "", proposedRate: undefined },
  });

  async function onSubmit(values: ApplicationInput) {
    setServerError(null);
    setIsSubmitting(true);

    const result = await applyToCampaign(values);
    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900/50 dark:bg-emerald-900/20">
        <div className="text-2xl mb-2">🎉</div>
        <p className="font-semibold text-emerald-800 dark:text-emerald-200">Application submitted!</p>
        <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
          The brand will review your pitch and get back to you.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.push("/creator/campaigns")}
        >
          View my applications
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...form.register("campaignId")} />

        <FormField
          control={form.control}
          name="pitch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your pitch *</FormLabel>
              <FormDescription>
                Tell the brand why you&apos;re the right fit for &ldquo;{campaignTitle}&rdquo;.
                Be specific — mention your niche, audience, and ideas.
              </FormDescription>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="I'm a lifestyle creator with 85K followers on Instagram and specialize in outdoor content. My audience is primarily 25–35 year olds who love adventure..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="proposedRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposed rate (USD)</FormLabel>
              <FormDescription>
                Optional. Leave empty to accept the brand&apos;s budget range.
              </FormDescription>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    className="pl-7"
                    {...field}
                    onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Submit application"}
        </Button>
      </form>
    </Form>
  );
}
