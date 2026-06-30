"use client";

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface Props {
  userId: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "ghost" | "outline";
  label?: string;
  className?: string;
}

export function MessageUserButton({ userId, size, variant, label, className }: Props) {
  const router = useRouter();

  function handleClick() {
    console.debug("MessageUserButton", userId);
    router.push("/messages");
  }

  return (
    <Button
      size={size ?? "sm"}
      variant={variant ?? "ghost"}
      className={className}
      onClick={handleClick}
    >
      <MessageSquare className="mr-1.5 h-4 w-4" />
      {label ?? "Message"}
    </Button>
  );
}
