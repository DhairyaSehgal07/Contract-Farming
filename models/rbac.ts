/**
 * Roles are scoped per organization (see StoreAdminUser.organizationId + role).
 * Extend this list as product requirements grow; keep in sync with the User schema enum.
 */
export const ORGANIZATION_ROLES = ["admin", "manager", "staff"] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export function isOrganizationRole(value: string): value is OrganizationRole {
  return (ORGANIZATION_ROLES as readonly string[]).includes(value);
}
