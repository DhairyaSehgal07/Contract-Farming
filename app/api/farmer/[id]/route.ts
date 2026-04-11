import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { updateFarmerSchema } from "@/lib/schemas/farmer-update";
import { connectToDatabase } from "@/lib/db";
import { Farmer } from "@/models/Farmer";

export const runtime = "nodejs";

const objectIdRegex = /^[a-f\d]{24}$/i;

function farmerToPayload(f: {
  _id: unknown;
  fullName: string;
  address: string;
  mobileNumber: string;
  organizationId: unknown;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(f._id),
    fullName: f.fullName,
    address: f.address,
    mobileNumber: f.mobileNumber,
    organizationId: String(f.organizationId),
    isActive: f.isActive,
    createdAt: (f.createdAt ?? new Date()).toISOString(),
    updatedAt: (f.updatedAt ?? new Date()).toISOString(),
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
        { success: false, message: "Invalid farmer id" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = updateFarmerSchema.safeParse(body);
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
    const farmerObjectId = new Types.ObjectId(id);
    const normalizedMobile = parsed.data.mobileNumber.replace(/\s+/g, "");

    const existing = await Farmer.findOne({
      _id: farmerObjectId,
      organizationId: orgObjectId,
    }).lean();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Farmer not found" },
        { status: 404 },
      );
    }

    const duplicateMobile = await Farmer.findOne({
      organizationId: orgObjectId,
      mobileNumber: normalizedMobile,
      _id: { $ne: farmerObjectId },
    }).lean();

    if (duplicateMobile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another farmer with this mobile number already exists in this organization",
        },
        { status: 409 },
      );
    }

    const updated = await Farmer.findOneAndUpdate(
      { _id: farmerObjectId, organizationId: orgObjectId },
      {
        fullName: parsed.data.fullName,
        address: parsed.data.address,
        mobileNumber: normalizedMobile,
        isActive: parsed.data.isActive,
      },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Farmer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Farmer updated successfully",
        data: farmerToPayload(updated),
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
          message:
            "Another farmer with this mobile number already exists in this organization",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update farmer" },
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
        { success: false, message: "Invalid farmer id" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const orgObjectId = new Types.ObjectId(session.user.organizationId);
    const farmerObjectId = new Types.ObjectId(id);

    const deleted = await Farmer.findOneAndDelete({
      _id: farmerObjectId,
      organizationId: orgObjectId,
    }).lean();

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Farmer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Farmer deleted successfully",
        data: { id: String(deleted._id) },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete farmer" },
      { status: 500 },
    );
  }
}
