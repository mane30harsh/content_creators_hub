"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Image as ImageIcon, Video, Film, Camera } from "lucide-react";
import {
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  uploadPortfolioFile,
} from "@/lib/actions/portfolio";
import type { PortfolioItemInput } from "@/lib/validations/creator-profile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const MEDIA_TYPE_META: Record<string, { label: string; icon: typeof ImageIcon }> = {
  IMAGE: { label: "Image", icon: ImageIcon },
  REEL: { label: "Reel", icon: Film },
  VIDEO: { label: "Video", icon: Video },
  SCREENSHOT: { label: "Screenshot", icon: Camera },
};

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
  sortOrder: number;
}

type FormMode = "create" | "edit";

function emptyForm(): PortfolioItemInput {
  return {
    title: "",
    brandName: "",
    description: "",
    mediaUrl: "",
    externalUrl: "",
    mediaType: "IMAGE",
    views: undefined,
    likes: undefined,
    comments: undefined,
    shares: undefined,
    engagementRate: undefined,
  };
}

function itemToForm(item: PortfolioItem): PortfolioItemInput {
  return {
    title: item.title,
    brandName: item.brandName ?? "",
    description: item.description ?? "",
    mediaUrl: item.mediaUrl,
    externalUrl: item.externalUrl ?? "",
    mediaType: item.mediaType as PortfolioItemInput["mediaType"],
    views: item.views ?? undefined,
    likes: item.likes ?? undefined,
    comments: item.comments ?? undefined,
    shares: item.shares ?? undefined,
    engagementRate: item.engagementRate ?? undefined,
  };
}

interface PortfolioPanelProps {
  items: PortfolioItem[];
}

export function PortfolioPanel({ items }: PortfolioPanelProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PortfolioItemInput>(emptyForm());
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setForm(emptyForm());
    setMode("create");
    setEditingId(null);
  }, []);

  const openCreate = useCallback(() => {
    resetForm();
    setOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((item: PortfolioItem) => {
    setForm(itemToForm(item));
    setMode("edit");
    setEditingId(item.id);
    setOpen(true);
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadPortfolioFile(fd);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setForm((prev) => ({ ...prev, mediaUrl: res.data.url }));
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      if (mode === "create") {
        const res = await createPortfolioItem(form);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        toast.success("Portfolio item added");
      } else if (editingId) {
        const res = await updatePortfolioItem(editingId, form);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        toast.success("Portfolio item updated");
      }
      setOpen(false);
      resetForm();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }, [mode, editingId, form, resetForm, router]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this portfolio item?")) return;
    const res = await deletePortfolioItem(id);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Portfolio item deleted");
    router.refresh();
  }, [router]);

  const set = useCallback((field: keyof PortfolioItemInput, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Portfolio</h3>
          <p className="text-sm text-muted-foreground">
            Showcase your best work to attract brand partnerships.
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No portfolio items yet. Add your first piece of work above.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const meta = MEDIA_TYPE_META[item.mediaType] ?? MEDIA_TYPE_META.IMAGE;
            const Icon = meta.icon;
            return (
              <Card key={item.id}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted">
                    {item.mediaUrl ? (
                      <img
                        src={item.mediaUrl}
                        alt=""
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{item.title}</p>
                    {item.brandName && (
                      <p className="truncate text-xs text-muted-foreground">{item.brandName}</p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">{meta.label}</p>
                    {item.views != null && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.views.toLocaleString()} views
                        {item.likes != null && ` · ${item.likes.toLocaleString()} likes`}
                        {item.engagementRate != null && ` · ${item.engagementRate}% eng.`}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add Portfolio Item" : "Edit Portfolio Item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign / Project Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Summer Campaign 2025"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                value={form.brandName ?? ""}
                onChange={(e) => set("brandName", e.target.value)}
                placeholder="e.g. Nike"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Briefly describe the project and your role..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaType">Media Type</Label>
              <Select
                value={form.mediaType}
                onValueChange={(v) => set("mediaType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MEDIA_TYPE_META).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaUrl">Media URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="mediaUrl"
                  value={form.mediaUrl}
                  onChange={(e) => set("mediaUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Label
                  htmlFor="file-upload"
                  className="inline-flex cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  {uploading ? "..." : "Upload"}
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,video/*"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </Label>
              </div>
              {form.mediaUrl && (
                <img
                  src={form.mediaUrl}
                  alt="preview"
                  className="mt-1 max-h-32 rounded-md object-cover"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalUrl">External Link (optional)</Label>
              <Input
                id="externalUrl"
                value={form.externalUrl ?? ""}
                onChange={(e) => set("externalUrl", e.target.value)}
                placeholder="https://instagram.com/p/..."
              />
            </div>

            <fieldset className="rounded-lg border p-4">
              <legend className="px-2 text-sm font-medium">Performance Metrics (optional)</legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="views">Views</Label>
                  <Input
                    id="views"
                    type="number"
                    min={0}
                    value={form.views ?? ""}
                    onChange={(e) => set("views", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="likes">Likes</Label>
                  <Input
                    id="likes"
                    type="number"
                    min={0}
                    value={form.likes ?? ""}
                    onChange={(e) => set("likes", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="comments">Comments</Label>
                  <Input
                    id="comments"
                    type="number"
                    min={0}
                    value={form.comments ?? ""}
                    onChange={(e) => set("comments", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="shares">Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    min={0}
                    value={form.shares ?? ""}
                    onChange={(e) => set("shares", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="engagementRate">Engagement Rate (%)</Label>
                  <Input
                    id="engagementRate"
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.engagementRate ?? ""}
                    onChange={(e) => set("engagementRate", e.target.value)}
                  />
                </div>
              </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !form.title || !form.mediaUrl}>
                {submitting ? "Saving..." : mode === "create" ? "Add Item" : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
