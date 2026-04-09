import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      mobileNumber: string;
      organizationId: string;
      role: string;
      isActive: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    mobileNumber: string;
    organizationId: string;
    role: string;
    isActive: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    mobileNumber?: string;
    organizationId?: string;
    role?: string;
    isActive?: boolean;
  }
}
