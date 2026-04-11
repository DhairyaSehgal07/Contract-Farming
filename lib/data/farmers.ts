import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { Farmer } from "@/models/Farmer";
import { Organization } from "@/models/Organization";

export type FarmerListItem = {
  id: string;
  fullName: string;
  address: string;
  mobileNumber: string;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Farmers for an organization (newest first). Used by RSC pages and GET /api/farmer.
 */
export async function getFarmersForOrganization(
  organizationId: string,
): Promise<{ farmers: FarmerListItem[]; organizationFound: boolean }> {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(organizationId)) {
    return { farmers: [], organizationFound: false };
  }

  const orgObjectId = new Types.ObjectId(organizationId);
  const organization = await Organization.findById(orgObjectId).lean();
  if (!organization) {
    return { farmers: [], organizationFound: false };
  }

  const docs = await Farmer.find({ organizationId: orgObjectId })
    .sort({ createdAt: -1 })
    .lean();

  const farmers: FarmerListItem[] = docs.map((f) => ({
    id: String(f._id),
    fullName: f.fullName,
    address: f.address,
    mobileNumber: f.mobileNumber,
    organizationId: String(f.organizationId),
    isActive: f.isActive,
    createdAt: (f.createdAt ?? new Date()).toISOString(),
    updatedAt: (f.updatedAt ?? new Date()).toISOString(),
  }));

  return { farmers, organizationFound: true };
}
