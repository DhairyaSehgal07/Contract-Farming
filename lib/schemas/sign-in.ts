import { z } from "zod";

/** Per-field Zod schemas for TanStack Form `validators` (Standard Schema). */
export const signInMobileNumberFieldSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s+/g, ""))
  .pipe(
    z.string().min(8, "Mobile number must be at least 8 characters"),
  );

export const signInPasswordFieldSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

export const signInFormSchema = z.object({
  mobileNumber: signInMobileNumberFieldSchema,
  password: signInPasswordFieldSchema,
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;
