"use client";

import { usePathname } from "next/navigation";

export function DashboardHeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide top default navbar on creator full 3-column views
  if (
    pathname === "/creator/dashboard" ||
    pathname === "/creator" ||
    pathname === "/community" ||
    pathname === "/messages"
  ) {
    return null;
  }

  return <>{children}</>;
}
