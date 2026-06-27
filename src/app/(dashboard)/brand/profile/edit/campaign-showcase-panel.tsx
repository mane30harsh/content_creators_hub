"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, Megaphone, X, Check, BarChart2 } from "lucide-react";

import {
  brandCampaignShowcaseSchema,
  type BrandCampaignShowcaseInput,
  PLATFORMS,
} from "@/lib/validations/brand-profile";
import {
  upsertCampaignShowcase,
  deleteCampaignShowcase,
} from "@/lib/actions/brand-profile";
import {
  Form, FormField, FormItem, FormLabel,
  FormControl, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ShowcaseItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  externalUrl: string | null;
  platform: string | null;
  resultSummary: string | null;
  year: number | null;
  isPublic: boolean;
}

interface CampaignShowcasePanelProps {
  profileId: string;
  items: ShowcaseItem[];
}

function ShowcaseForm({
  defaultValues,
  itemId,
  onSuccess,
  onCancel,
}: {
  defaultValues?: Partial<BrandCampaignShowcaseInput>;
  itemId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<BrandCampaignShowcaseInput>({
    resolver: zodResolver(brandCampaignShowcaseSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      externalUrl: "",
      platform: "",
      resultSummary: "",
      year: undefined,
      isPublic: true,
      ...defaultValues,
    },
  });

  function onSubmit(values: BrandCampaignShowcaseInput) {
    startTransition(async () => {
      const result = await upsertCampaignShowcase(values, itemId);
      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([f, msgs]) =>
            form.setError(f as keyof BrandCampaignShowcaseInput, { message: msgs[0] })
          );
        }
        return;
      }
      toast.success(itemId ? "Campaign updated!" : "Campaign added!");
      onSuccess();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-border bg-muted/30 p-4"
      >
        {/* Title + Platform */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Title <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Summer Launch 2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Year + External URL */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={String(new Date().getFullYear())}
                    min={2000}
                    max={new Date().getFullYear()}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="externalUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Link</FormLabel>
                <FormControl>
                  <Input placeholder="https://…" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image URL */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://…/campaign.jpg" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What was this campaign about? Who did you work with?"
                  className="resize-none"
                  rows={2}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Results */}
        <FormField
          control={form.control}
          name="resultSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                Results Summary
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 2M impressions · 8% engagement · 500 conversions"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>A short headline number or outcome to show credibility.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
            <X className="mr-1.5 h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            <Check className="mr-1.5 h-3.5 w-3.5" />
            {isPending ? "Saving…" : itemId ? "Update" : "Add Campaign"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ShowcaseCard({
  item,
  onEdit,
}: {
  item: ShowcaseItem;
  onEdit: () => void;
}) {
  const [deleting, startDelete] = useTransition();

  function handleDelete() {
    if (!confirm(`Remove "${item.title}"?`)) return;
    startDelete(async () => {
      const result = await deleteCampaignShowcase(item.id);
      if (!result.success) toast.error(result.error);
      else { toast.success("Campaign removed"); window.location.reload(); }
    });
  }

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border border-border bg-card transition-opacity",
      deleting && "opacity-50 pointer-events-none"
    )}>
      {/* Cover image */}
      {item.imageUrl && (
        <div className="h-36 w-full overflow-hidden bg-muted">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold leading-tight">{item.title}</p>
              {item.platform && (
                <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium">
                  {item.platform}
                </span>
              )}
              {item.year && (
                <span className="text-xs text-muted-foreground">{item.year}</span>
              )}
            </div>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
            {item.resultSummary && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <BarChart2 className="h-3 w-3" />
                {item.resultSummary}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.externalUrl && (
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              onClick={onEdit}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CampaignShowcasePanel({ profileId, items: initial }: CampaignShowcasePanelProps) {
  const [items] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Past Campaign Showcase
          </CardTitle>
          <CardDescription>
            Show creators the quality and results of your previous influencer campaigns.
          </CardDescription>
        </div>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Campaign
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && !editingId && (
          <ShowcaseForm
            onSuccess={() => { setShowForm(false); window.location.reload(); }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {items.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <Megaphone className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No past campaigns yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Showcase your best campaigns to build trust with creators.
            </p>
            <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add First Campaign
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) =>
              editingId === item.id ? (
                <div key={item.id} className="sm:col-span-2">
                  <ShowcaseForm
                    itemId={item.id}
                    defaultValues={{
                      title: item.title,
                      description: item.description ?? "",
                      imageUrl: item.imageUrl ?? "",
                      externalUrl: item.externalUrl ?? "",
                      platform: item.platform ?? "",
                      resultSummary: item.resultSummary ?? "",
                      year: item.year ?? undefined,
                      isPublic: item.isPublic,
                    }}
                    onSuccess={() => { setEditingId(null); window.location.reload(); }}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <ShowcaseCard
                  key={item.id}
                  item={item}
                  onEdit={() => { setShowForm(false); setEditingId(item.id); }}
                />
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
