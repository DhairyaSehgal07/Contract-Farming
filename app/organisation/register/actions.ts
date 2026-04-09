"use server";

import { headers } from "next/headers";
import { z } from "zod";

const registerOrganizationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .transform((value) => value.replace(/\s+/g, " ")),
  contactDetails: z.object({
    phone: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .optional()
      .or(z.literal("")),
    address: z.string().trim().optional(),
  }),
});

export type RegisterOrganizationInput = z.input<
  typeof registerOrganizationFormSchema
>;

export type RegisterOrganizationResult =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
    };

export async function registerOrganizationAction(
  input: RegisterOrganizationInput,
): Promise<RegisterOrganizationResult> {
  const parsed = registerOrganizationFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
    };
  }

  const payload = {
    name: parsed.data.name,
    contactDetails: {
      phone: parsed.data.contactDetails.phone?.trim() || undefined,
      email: parsed.data.contactDetails.email?.trim().toLowerCase() || undefined,
      address: parsed.data.contactDetails.address?.trim() || undefined,
    },
  };

  try {
    const requestHeaders = await headers();
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
    const host =
      requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

    if (!host) {
      return {
        success: false,
        message: "Could not determine API host for registration.",
      };
    }

    const response = await fetch(`${protocol}://${host}/api/organisation/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    if (!response.ok) {
      return {
        success: false,
        message: body?.message || "Failed to register organization.",
      };
    }

    return {
      success: true,
      message: body?.message || "Organization registered successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Could not register organization. Please try again.",
    };
  }
}
