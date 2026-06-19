"use client";

import { useSession } from "next-auth/react";
import type { AppRole } from "@/lib/roles";

/**
 * Thin convenience wrapper around next-auth's useSession,
 * typed to the app's role-aware session shape.
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    role: session?.user?.role as AppRole | undefined,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
