import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getLandsForOrganization } from "@/lib/data/lands";
import { connectToDatabase } from "@/lib/db";
import { Farmer } from "@/models/Farmer";
import { LAND_AREA_UNITS } from "@/lib/land/constants";
import { Land } from "@/models/Land";
import { Organization } from "@/models/Organization";

export const runtime = "nodejs";

const objectIdRegex = /^[a-f\d]{24}$/i;

const geoSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const registerLandSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  farmerId: z.string().trim().regex(objectIdRegex, "Invalid farmer id"),
  organizationId: z.string().trim().regex(objectIdRegex, "Invalid organization id"),
  area: z.object({
    value: z.number().min(0, "Area value must be non-negative"),
    unit: z.enum(LAND_AREA_UNITS),
  }),
  geoLocation: geoSchema.optional(),
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

    const { lands, organizationFound } = await getLandsForOrganization(
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
        message: "Lands fetched successfully",
        data: lands,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch lands" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerLandSchema.safeParse(body);

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

    const { name, farmerId, organizationId, area, geoLocation, isActive } = parsed.data;
    await connectToDatabase();

    const orgObjectId = new Types.ObjectId(organizationId);
    const farmerObjectId = new Types.ObjectId(farmerId);

    const organization = await Organization.findById(orgObjectId).lean();
    if (!organization) {
      return NextResponse.json(
        { success: false, message: "Organization not found" },
        { status: 404 },
      );
    }

    const farmer = await Farmer.findOne({
      _id: farmerObjectId,
      organizationId: orgObjectId,
    }).lean();

    if (!farmer) {
      return NextResponse.json(
        { success: false, message: "Farmer not found in this organization" },
        { status: 404 },
      );
    }

    const existingLand = await Land.findOne({
      organizationId: orgObjectId,
      farmerId: farmerObjectId,
      name,
    }).lean();

    if (existingLand) {
      return NextResponse.json(
        {
          success: false,
          message: "Land with this name already exists for this farmer",
        },
        { status: 409 },
      );
    }

    const land = await Land.create({
      name,
      farmerId: farmerObjectId,
      organizationId: orgObjectId,
      area,
      ...(geoLocation !== undefined ? { geoLocation } : {}),
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Land registered successfully",
        data: {
          id: land._id,
          name: land.name,
          farmerId: land.farmerId,
          organizationId: land.organizationId,
          area: land.area,
          geoLocation: land.geoLocation,
          isActive: land.isActive,
          createdAt: land.createdAt,
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
          message: "Land with this name already exists for this farmer",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to register land" },
      { status: 500 },
    );
  }
}
