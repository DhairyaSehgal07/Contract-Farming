import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { updateLandSchema } from "@/lib/schemas/land-update";
import { connectToDatabase } from "@/lib/db";
import { Farmer } from "@/models/Farmer";
import { Land } from "@/models/Land";
import type { IGeoLocation, ILandArea } from "@/models/Land";

export const runtime = "nodejs";

const objectIdRegex = /^[a-f\d]{24}$/i;

function landToPayload(l: {
  _id: unknown;
  name: string;
  farmerId: unknown;
  organizationId: unknown;
  area: ILandArea;
  geoLocation?: IGeoLocation;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(l._id),
    name: l.name,
    farmerId: String(l.farmerId),
    organizationId: String(l.organizationId),
    area: l.area,
    geoLocation: l.geoLocation,
    isActive: l.isActive,
    createdAt: (l.createdAt ?? new Date()).toISOString(),
    updatedAt: (l.updatedAt ?? new Date()).toISOString(),
  };
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    if (!objectIdRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid land id" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = updateLandSchema.safeParse(body);
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

    await connectToDatabase();

    const orgObjectId = new Types.ObjectId(session.user.organizationId);
    const landObjectId = new Types.ObjectId(id);
    const farmerObjectId = new Types.ObjectId(parsed.data.farmerId);

    const existing = await Land.findOne({
      _id: landObjectId,
      organizationId: orgObjectId,
    }).lean();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Land not found" },
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

    const duplicateName = await Land.findOne({
      organizationId: orgObjectId,
      farmerId: farmerObjectId,
      name: parsed.data.name,
      _id: { $ne: landObjectId },
    }).lean();

    if (duplicateName) {
      return NextResponse.json(
        {
          success: false,
          message: "Another land with this name already exists for this farmer",
        },
        { status: 409 },
      );
    }

    const { geoLocation, ...rest } = parsed.data;
    const baseSet = {
      name: rest.name,
      farmerId: farmerObjectId,
      area: rest.area,
      isActive: rest.isActive,
    };

    const updated =
      geoLocation === null
        ? await Land.findOneAndUpdate(
            { _id: landObjectId, organizationId: orgObjectId },
            { $set: baseSet, $unset: { geoLocation: "" } },
            { new: true, runValidators: true },
          ).lean()
        : await Land.findOneAndUpdate(
            { _id: landObjectId, organizationId: orgObjectId },
            {
              $set:
                geoLocation !== undefined
                  ? { ...baseSet, geoLocation }
                  : baseSet,
            },
            { new: true, runValidators: true },
          ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Land not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Land updated successfully",
        data: landToPayload(updated),
      },
      { status: 200 },
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
          message: "Another land with this name already exists for this farmer",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update land" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    if (!objectIdRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid land id" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const orgObjectId = new Types.ObjectId(session.user.organizationId);
    const landObjectId = new Types.ObjectId(id);

    const deleted = await Land.findOneAndDelete({
      _id: landObjectId,
      organizationId: orgObjectId,
    }).lean();

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Land not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Land deleted successfully",
        data: { id: String(deleted._id) },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete land" },
      { status: 500 },
    );
  }
}
