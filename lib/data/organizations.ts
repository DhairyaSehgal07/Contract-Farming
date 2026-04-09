import type mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Organization } from "@/models/Organization";

export type OrganizationListItem = {
  id: mongoose.Types.ObjectId;
  name: string;
  contactDetails: {
    phone?: string;
    email?: string;
    address?: string;
  };
  isActive: boolean;
  ownerUserId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Shared query used by GET /api/organisation and server-rendered pages.
 * Keeps one source of truth and avoids an extra HTTP round-trip from RSC → API.
 */
export async function getAllOrganizations(): Promise<OrganizationListItem[]> {
  await connectToDatabase();

  const organizations = await Organization.find({})
    .sort({ createdAt: -1 })
    .select("_id name contactDetails isActive ownerUserId createdAt updatedAt")
    .lean();

  return organizations.map((organization) => ({
    id: organization._id,
    name: organization.name,
    contactDetails: organization.contactDetails ?? {},
    isActive: organization.isActive,
    ownerUserId: organization.ownerUserId,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
  }));
}
