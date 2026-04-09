import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Organization } from "@/models/Organization";

export const runtime = "nodejs";

const registerOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .transform((value) => value.replace(/\s+/g, " ")),
  contactDetails: z
    .object({
      phone: z.string().trim().min(1).optional(),
      email: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
      address: z.string().trim().min(1).optional(),
    })
    .optional()
    .default({}),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerOrganizationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request payload",
          errors: z.treeifyError(parsed.error),
        },
        { status: 400 },
      );
    }
    const { name, contactDetails } = parsed.data;

    await connectToDatabase();

    const existingOrg = await Organization.findOne({
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    }).lean();

    if (existingOrg) {
      return NextResponse.json(
        { success: false, message: "Organization already exists" },
        { status: 409 },
      );
    }

    const organization = await Organization.create({
      name,
      contactDetails,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Organization registered successfully",
        data: {
          id: organization._id,
          name: organization.name,
          contactDetails: organization.contactDetails,
          isActive: organization.isActive,
          createdAt: organization.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to register organization" },
      { status: 500 },
    );
  }
}
