"use client";

import { usePathname } from "next/navigation";

interface DashboardHeaderWrapperProps {
  children: React.ReactNode;
  userRole?: string;
}

export function DashboardHeaderWrapper({
  children,
  userRole,
}: DashboardHeaderWrapperProps) {
  const pathname = usePathname();

  // Hide top default navbar for creators and routes that use the left sidebar navigation
  if (
    userRole === "CREATOR" ||
    pathname.startsWith("/creator") ||
    pathname.startsWith("/community") ||
    (pathname.startsWith("/messages") && userRole !== "BRAND" && userRole !== "ADMIN")
  ) {
    return null;
  }

  return <>{children}</>;
}
