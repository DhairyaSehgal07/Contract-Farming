import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { getAllOrganizations } from "@/lib/data/organizations";
import { Organization } from "@/models/Organization";

export const runtime = "nodejs";

const updateOrganizationSchema = z
  .object({
    id: z.string().trim().min(1, "Organization id is required"),
    name: z
      .string()
      .trim()
      .min(2, "Organization name must be at least 2 characters")
      .transform((value) => value.replace(/\s+/g, " "))
      .optional(),
    contactDetails: z
      .object({
        phone: z.string().trim().optional(),
        email: z
          .string()
          .trim()
          .email("Enter a valid email address")
          .transform((value) => value.toLowerCase())
          .optional(),
        address: z.string().trim().optional(),
      })
      .optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.contactDetails !== undefined ||
      value.isActive !== undefined,
    {
      message: "Provide at least one field to update",
      path: ["name"],
    },
  );

const deleteOrganizationSchema = z.object({
  id: z.string().trim().min(1, "Organization id is required"),
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET() {
  try {
    const organizations = await getAllOrganizations();

    return NextResponse.json(
      {
        success: true,
        message: "Organizations fetched successfully",
        data: organizations.map((organization) => ({
          id: organization.id,
          name: organization.name,
          contactDetails: organization.contactDetails,
          isActive: organization.isActive,
          ownerUserId: organization.ownerUserId,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
        })),
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organizations",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateOrganizationSchema.safeParse(body);

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

    const { id, name, contactDetails, isActive } = parsed.data;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid organization id" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    if (name) {
      const duplicate = await Organization.findOne({
        _id: { $ne: id },
        name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
      }).lean();

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Organization name already exists" },
          { status: 409 },
        );
      }
    }

    const update: {
      name?: string;
      contactDetails?: { phone?: string; email?: string; address?: string };
      isActive?: boolean;
    } = {};

    if (name !== undefined) update.name = name;
    if (isActive !== undefined) update.isActive = isActive;
    if (contactDetails !== undefined) {
      update.contactDetails = {
        phone: contactDetails.phone?.trim() || undefined,
        email: contactDetails.email?.trim() || undefined,
        address: contactDetails.address?.trim() || undefined,
      };
    }

    const organization = await Organization.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!organization) {
      return NextResponse.json(
        { success: false, message: "Organization not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Organization updated successfully",
        data: {
          id: organization._id,
          name: organization.name,
          contactDetails: organization.contactDetails ?? {},
          isActive: organization.isActive,
          ownerUserId: organization.ownerUserId,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
        },
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

    return NextResponse.json(
      { success: false, message: "Failed to update organization" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const idFromQuery = request.nextUrl.searchParams.get("id");
    const parsed = deleteOrganizationSchema.safeParse({ id: idFromQuery ?? "" });

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

    const { id } = parsed.data;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid organization id" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const deletedOrganization = await Organization.findByIdAndDelete(id).lean();
    if (!deletedOrganization) {
      return NextResponse.json(
        { success: false, message: "Organization not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Organization deleted successfully",
        data: {
          id: deletedOrganization._id,
          name: deletedOrganization.name,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete organization" },
      { status: 500 },
    );
  }
}
