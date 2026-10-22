"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendMessage } from "@/lib/actions/message";

export function MessageInput({ threadId }: { threadId: string }) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  function handleSend() {
    const text = body.trim();
    if (!text) return;

    startTransition(async () => {
      const result = await sendMessage({ threadId, body: text });
      if (!result.success) {
        setError(result.error);
      } else {
        setBody("");
        setError(null);
        router.refresh();
        textareaRef.current?.focus();
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-border p-4">
      {error && (
        <p className="mb-2 text-xs text-destructive">{error}</p>
      )}
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex min-h-[40px] w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
          />
        </div>

        <Button
          size="icon"
          onClick={handleSend}
          disabled={!body.trim() || isPending}
          className="h-10 w-10 shrink-0 rounded-full"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
