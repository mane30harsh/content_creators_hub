/**
 * Single source of truth for application roles.
 * Mirrors the Prisma `Role` enum — keep both in sync.
 */
export const ROLES = ["CREATOR", "BRAND", "ADMIN"] as const;

export type AppRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  CREATOR: "Creator",
  BRAND: "Brand",
  ADMIN: "Admin",
};

/** Default landing route after login, per role. */
export const ROLE_HOME: Record<AppRole, string> = {
  CREATOR: "/creator",
  BRAND: "/brand",
  ADMIN: "/admin",
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
