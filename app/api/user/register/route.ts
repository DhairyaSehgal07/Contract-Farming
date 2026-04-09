import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { StoreAdminUser } from "@/models/User";
import { ORGANIZATION_ROLES } from "@/models/rbac";

export const runtime = "nodejs";

const objectIdRegex = /^[a-f\d]{24}$/i;

const registerUserSchema = z.object({
  mobileNumber: z.string().trim().min(8, "Mobile number must be at least 8 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  organizationId: z.string().trim().regex(objectIdRegex, "Invalid organization id"),
  role: z.enum(ORGANIZATION_ROLES),
  isActive: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerUserSchema.safeParse(body);

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

    const { mobileNumber, password, organizationId, role, isActive } = parsed.data;
    await connectToDatabase();

    const normalizedMobileNumber = mobileNumber.replace(/\s+/g, "");
    const orgObjectId = new Types.ObjectId(organizationId);

    const organization = await Organization.findById(orgObjectId).lean();
    if (!organization) {
      return NextResponse.json(
        { success: false, message: "Organization not found" },
        { status: 404 },
      );
    }

    const existingUser = await StoreAdminUser.findOne({
      organizationId: orgObjectId,
      mobileNumber: normalizedMobileNumber,
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this mobile number already exists in this organization",
        },
        { status: 409 },
      );
    }

    const user = await StoreAdminUser.create({
      mobileNumber: normalizedMobileNumber,
      password,
      organizationId: orgObjectId,
      role,
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        data: {
          id: user._id,
          mobileNumber: user.mobileNumber,
          organizationId: user.organizationId,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
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
      { success: false, message: "Failed to register user" },
      { status: 500 },
    );
  }
}
