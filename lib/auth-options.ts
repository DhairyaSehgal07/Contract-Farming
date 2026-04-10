import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateWithMobilePassword } from "@/lib/auth/authenticate-user";
import type { OrganizationRole } from "@/models/rbac";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        mobileNumber: { label: "Mobile number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const mobileNumber = credentials?.mobileNumber?.trim();
        const password = credentials?.password;
        if (!mobileNumber || !password) {
          return null;
        }

        const user = await authenticateWithMobilePassword(
          mobileNumber,
          password,
        );
        if (!user?._id) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: `${user.mobileNumber}@users.local`,
          mobileNumber: user.mobileNumber,
          organizationId: user.organizationId.toString(),
          role: user.role as OrganizationRole,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.mobileNumber = (user as { mobileNumber?: string }).mobileNumber;
        token.organizationId = (user as { organizationId?: string })
          .organizationId;
        token.role = (user as { role?: OrganizationRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.mobileNumber = token.mobileNumber as string;
        session.user.organizationId = token.organizationId as string;
        session.user.role = token.role as OrganizationRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
