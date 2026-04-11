import { z } from "zod";

export const registerFarmerFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .transform((value) => value.replace(/\s+/g, " ")),
  address: z.string().trim().min(1, "Address is required"),
  mobileNumber: z
    .string()
    .trim()
    .min(8, "Mobile number must be at least 8 characters"),
  isActive: z.boolean(),
});

export type RegisterFarmerFormValues = z.infer<typeof registerFarmerFormSchema>;
