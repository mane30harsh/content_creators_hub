"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrCreateThread } from "@/lib/actions/message";

interface Props {
  userId: string;
  campaignId?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "ghost" | "outline" | "secondary";
  label?: string;
  className?: string;
}

export function MessageUserButton({
  userId,
  campaignId,
  size,
  variant,
  label,
  className,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await getOrCreateThread({ targetUserId: userId, campaignId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.push(`/messages?threadId=${result.data.threadId}`);
    });
  }

  return (
    <Button
      size={size ?? "sm"}
      variant={variant ?? "outline"}
      className={className}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <MessageSquare className="mr-1.5 h-4 w-4" />
      )}
      {label ?? "Message"}
    </Button>
  );
}
