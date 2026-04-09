import { NextResponse } from "next/server";
import { getAllOrganizations } from "@/lib/data/organizations";

export const runtime = "nodejs";

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
