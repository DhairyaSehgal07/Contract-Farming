import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getFarmersForOrganization } from "@/lib/data/farmers";
import { connectToDatabase } from "@/lib/db";
import { Farmer } from "@/models/Farmer";
import { Organization } from "@/models/Organization";

export const runtime = "nodejs";

const objectIdRegex = /^[a-f\d]{24}$/i;

const registerFarmerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .transform((value) => value.replace(/\s+/g, " ")),
  address: z.string().trim().min(1, "Address is required"),
  mobileNumber: z.string().trim().min(8, "Mobile number must be at least 8 characters"),
  organizationId: z.string().trim().regex(objectIdRegex, "Invalid organization id"),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { farmers, organizationFound } = await getFarmersForOrganization(
      session.user.organizationId,
    );

    if (!organizationFound) {
      return NextResponse.json(
        { success: false, message: "Organization not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Farmers fetched successfully",
        data: farmers,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch farmers" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerFarmerSchema.safeParse(body);

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

    const { fullName, address, mobileNumber, organizationId, isActive } = parsed.data;
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

    const existingFarmer = await Farmer.findOne({
      organizationId: orgObjectId,
      mobileNumber: normalizedMobileNumber,
    }).lean();

    if (existingFarmer) {
      return NextResponse.json(
        {
          success: false,
          message: "Farmer with this mobile number already exists in this organization",
        },
        { status: 409 },
      );
    }

    const farmer = await Farmer.create({
      fullName,
      address,
      mobileNumber: normalizedMobileNumber,
      organizationId: orgObjectId,
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Farmer registered successfully",
        data: {
          id: farmer._id,
          fullName: farmer.fullName,
          address: farmer.address,
          mobileNumber: farmer.mobileNumber,
          organizationId: farmer.organizationId,
          isActive: farmer.isActive,
          createdAt: farmer.createdAt,
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

    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Farmer with this mobile number already exists in this organization",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to register farmer" },
      { status: 500 },
    );
  }
}
