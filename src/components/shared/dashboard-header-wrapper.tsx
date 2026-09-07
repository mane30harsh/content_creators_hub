"use client";

import { usePathname } from "next/navigation";

export function DashboardHeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide top default navbar on creator home view where full 3-column layout is displayed
  if (pathname === "/creator/dashboard" || pathname === "/creator") {
    return null;
  }

  return <>{children}</>;
}
