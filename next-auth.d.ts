import type { DefaultSession } from "next-auth";
import type { OrganizationRole } from "@/models/rbac";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      mobileNumber: string;
      organizationId: string;
      role: OrganizationRole;
    };
  }

  interface User {
    mobileNumber?: string;
    organizationId?: string;
    role?: OrganizationRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    mobileNumber?: string;
    organizationId?: string;
    role?: OrganizationRole;
  }
}
