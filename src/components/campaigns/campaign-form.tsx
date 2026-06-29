"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  campaignSchema,
  type CampaignInput,
  DELIVERABLE_TYPE_LABELS,
  COUNTRIES,
} from "@/lib/validations/campaign";
import { NICHES, LANGUAGES } from "@/lib/validations/creator-profile";
import { createCampaign, updateCampaign } from "@/lib/actions/campaign";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// ─── Types ─────────────────────────────────────────────────────

interface CampaignFormProps {
  campaignId?: string;
  defaultValues?: Partial<CampaignInput>;
  mode: "create" | "edit";
}

// ─── Multi-select pill helper ──────────────────────────────────

function PillSelect({
  options,
  selected,
  onChange,
  max,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  max?: number;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected.includes(opt);
        const atMax = !active && max != null && selected.length >= max;
        return (
          <button
            key={opt}
            type="button"
            disabled={atMax}
            onClick={() =>
              onChange(active ? selected.filter((s) => s !== opt) : [...selected, opt])
            }
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : atMax
                ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50"
                : "border-border bg-background text-foreground hover:border-primary/50"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main form ─────────────────────────────────────────────────

export function CampaignForm({ campaignId, defaultValues, mode }: CampaignFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CampaignInput>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title:            "",
      description:      "",
      deliverableType:  "INSTAGRAM_REEL",
      deliverableCount: 1,
      deliverableNotes: "",
      budgetMin:        undefined,
      budgetMax:        undefined,
      currency:         "USD",
      niche:            [],
      country:          [],
      language:         [],
      minFollowers:     undefined,
      maxFollowers:     undefined,
      applicationDeadline: "",
      campaignStartDate:   "",
      campaignEndDate:     "",
      maxAccepted:      1,
      maxApplications:  undefined,
      isPublic:         true,
      tags:             [],
      coverImage:       "",
      ...defaultValues,
    },
  });

  async function onSubmit(values: CampaignInput) {
    setServerError(null);
    setIsSubmitting(true);

    const result =
      mode === "edit" && campaignId
        ? await updateCampaign(campaignId, values)
        : await createCampaign(values);

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error);
      if ("fieldErrors" in result && result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, msgs]) => {
          form.setError(field as keyof CampaignInput, { message: msgs[0] });
        });
      }
      return;
    }

    router.push(`/brand/campaigns/${result.data.id}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basics">
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="targeting">Targeting</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Basics ────────────────────────────────── */}
          <TabsContent value="basics" className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Adventure Campaign 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormDescription>
                    Tell creators what the campaign is about, what you expect, and what makes it exciting.
                  </FormDescription>
                  <FormControl>
                    <Textarea rows={6} placeholder="We are looking for lifestyle creators to..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="deliverableType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deliverable type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(DELIVERABLE_TYPE_LABELS).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliverableCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of deliverables</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={50} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deliverableNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deliverable notes</FormLabel>
                  <FormDescription>Specific requirements, style guidelines, dos and don&apos;ts.</FormDescription>
                  <FormControl>
                    <Textarea rows={3} placeholder="Minimum 30 seconds, must show product in use..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardContent className="pt-4">
                <Label className="text-sm font-medium">Budget range (USD)</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="budgetMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Min ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} placeholder="500" {...field}
                            onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budgetMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Max ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} placeholder="2000" {...field}
                            onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 2: Targeting ─────────────────────────────── */}
          <TabsContent value="targeting" className="space-y-6">
            <FormField
              control={form.control}
              name="niche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creator niches *</FormLabel>
                  <FormDescription>Which content niches should creators be in?</FormDescription>
                  <PillSelect
                    options={[...NICHES]}
                    selected={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="minFollowers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min followers</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="10000" {...field}
                        onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxFollowers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max followers</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="500000" {...field}
                        onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target countries</FormLabel>
                  <FormDescription>Leave empty to accept creators from any country.</FormDescription>
                  <PillSelect
                    options={[...COUNTRIES]}
                    selected={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Languages</FormLabel>
                  <FormDescription>Leave empty to accept any language.</FormDescription>
                  <PillSelect
                    options={[...LANGUAGES]}
                    selected={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* ── Tab 3: Timeline ──────────────────────────────── */}
          <TabsContent value="timeline" className="space-y-4">
            <FormField
              control={form.control}
              name="applicationDeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application deadline</FormLabel>
                  <FormDescription>Last day creators can submit applications.</FormDescription>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="campaignStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign start date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="campaignEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign end date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="maxAccepted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Creators to accept *</FormLabel>
                    <FormDescription>How many creators will you work with?</FormDescription>
                    <FormControl>
                      <Input type="number" min={1} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxApplications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max applications</FormLabel>
                    <FormDescription>Leave empty for unlimited.</FormDescription>
                    <FormControl>
                      <Input type="number" min={1} placeholder="Unlimited" {...field}
                        onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* ── Tab 4: Settings ──────────────────────────────── */}
          <TabsContent value="settings" className="space-y-4">
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <FormDescription>
                    Public campaigns are listed in the discovery feed. Private campaigns are invite-only.
                  </FormDescription>
                  <div className="flex gap-2 mt-2">
                    {[
                      { value: true,  label: "Public" },
                      { value: false, label: "Private" },
                    ].map(({ value, label }) => (
                      <button
                        key={String(value)}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                          field.value === value
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover image URL</FormLabel>
                  <FormDescription>Optional banner image for your campaign.</FormDescription>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        {serverError && (
          <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {serverError}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "edit" ? "Saving…" : "Creating…"
              : mode === "edit" ? "Save changes" : "Create campaign"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
