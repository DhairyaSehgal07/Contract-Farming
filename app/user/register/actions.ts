"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { ORGANIZATION_ROLES } from "@/models/rbac";

const objectIdRegex = /^[a-f\d]{24}$/i;

const registerUserPayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .transform((value) => value.replace(/\s+/g, " ")),
  mobileNumber: z
    .string()
    .trim()
    .min(8, "Mobile number must be at least 8 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  organizationId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Invalid organization id"),
  role: z.enum(ORGANIZATION_ROLES),
  isActive: z.boolean().optional().default(true),
});

export type RegisterUserInput = z.input<typeof registerUserPayloadSchema>;

export type RegisterUserResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function registerUserAction(
  input: RegisterUserInput,
): Promise<RegisterUserResult> {
  const parsed = registerUserPayloadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
    };
  }

  const payload = {
    name: parsed.data.name,
    mobileNumber: parsed.data.mobileNumber.replace(/\s+/g, ""),
    password: parsed.data.password,
    organizationId: parsed.data.organizationId,
    role: parsed.data.role,
    isActive: parsed.data.isActive ?? true,
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

    const response = await fetch(`${protocol}://${host}/api/user/register`, {
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
        message: body?.message || "Failed to register user.",
      };
    }

    return {
      success: true,
      message: body?.message || "User registered successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Could not register user. Please try again.",
    };
  }
}
