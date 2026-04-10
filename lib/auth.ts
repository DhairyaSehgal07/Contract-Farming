import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function getSession() {
  return getServerSession(authOptions);
}
