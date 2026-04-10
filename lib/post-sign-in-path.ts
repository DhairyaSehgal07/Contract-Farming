import type { OrganizationRole } from "@/models/rbac";
import { isOrganizationRole } from "@/models/rbac";

/**
 * Default app home for a signed-in user by organization role.
 */
export function getPostSignInPath(role: string | undefined): string {
  if (!role || !isOrganizationRole(role)) {
    return "/protected";
  }
  const map: Record<OrganizationRole, string> = {
    admin: "/admin",
    manager: "/manager",
    staff: "/staff",
  };
  return map[role];
}

/** Same-origin relative path only (blocks `//evil`, `https://…`, etc.). */
export function isSafeInternalCallbackPath(path: string): boolean {
  const p = path.trim();
  if (!p.startsWith("/") || p.startsWith("//")) return false;
  if (p.includes("://") || p.includes("\\")) return false;
  return true;
}

/**
 * After credentials sign-in: use an explicit `callbackUrl` when it looks like a deep link;
 * otherwise route by role.
 */
export function resolveAfterSignIn(
  callbackUrl: string | undefined,
  role: string | undefined,
): string {
  const trimmed = callbackUrl?.trim();
  if (
    trimmed &&
    trimmed !== "/protected" &&
    trimmed !== "/" &&
    !trimmed.startsWith("/sign-in") &&
    isSafeInternalCallbackPath(trimmed)
  ) {
    return trimmed;
  }
  return getPostSignInPath(role);
}
