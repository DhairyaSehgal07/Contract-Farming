import { z } from "zod";

export const signInFormSchema = z.object({
  mobileNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s+/g, ""))
    .pipe(
      z
        .string()
        .min(8, "Mobile number must be at least 8 characters"),
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;
