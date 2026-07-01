"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  label?: string;
  href?: string;
  className?: string;
}

export function BackButton({ label = "Back", href, className }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      className={cn(
        "mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
