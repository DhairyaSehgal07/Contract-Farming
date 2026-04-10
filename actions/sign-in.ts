"use server";

import { signInFormSchema } from "@/lib/schemas/sign-in";

/**
 * Re-validates sign-in payload on the server before the client calls NextAuth `signIn`
 * (which runs Credentials `authorize` and issues the JWT session).
 */
export async function validateSignInInputOnServer(input: unknown) {
  return signInFormSchema.safeParse(input);
}
