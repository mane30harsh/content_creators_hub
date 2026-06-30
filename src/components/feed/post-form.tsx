"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPost, uploadFeedMedia } from "@/lib/actions/feed";
import { POST_TYPE_OPTIONS } from "@/lib/validations/feed";

export function PostForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState("POST");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadFeedMedia(fd);
      if (!res.success) { toast.error(res.error); return; }
      setMediaUrls((prev) => [...prev, res.data.url]);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeMedia(index: number) {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    startTransition(async () => {
      const res = await createPost({
        type: type as "POST" | "CAMPAIGN_ANNOUNCEMENT" | "COLLAB_UPDATE" | "INDUSTRY",
        title: title || undefined,
        body: body.trim(),
        mediaUrls,
        tags,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Post created");
      setType("POST");
      setTitle("");
      setBody("");
      setMediaUrls([]);
      setTagsInput("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POST_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          maxLength={200}
        />
      </div>

      <textarea
        placeholder="What's on your mind?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        maxLength={5000}
      />

      {mediaUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mediaUrls.map((url, i) => (
            <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeMedia(i)}
                className="absolute right-0.5 top-0.5 hidden rounded-full bg-background/80 p-0.5 group-hover:block"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        placeholder="Tags (comma separated)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground"
      />

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer text-muted-foreground hover:text-foreground">
            <ImageIcon className="h-5 w-5" />
            <input
              type="file"
              accept="image/*,video/*"
              className="sr-only"
              onChange={handleUpload}
              disabled={uploading || mediaUrls.length >= 10}
            />
          </label>
          {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
        </div>
        <Button type="submit" size="sm" disabled={isPending || !body.trim()}>
          {isPending ? "Posting..." : "Post"}
        </Button>
      </div>
    </form>
  );
}
