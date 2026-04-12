import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import "@/models/Farmer";
import { Land } from "@/models/Land";
import type { ILand, ILandArea, IGeoLocation } from "@/models/Land";
import { Organization } from "@/models/Organization";

export type LandListItem = {
  id: string;
  name: string;
  farmerId: string;
  /** From populated Farmer; used for display in admin UI. */
  farmerName: string;
  organizationId: string;
  area: ILandArea;
  geoLocation?: IGeoLocation;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Lands for an organization (newest first). Used by RSC pages and GET /api/land.
 */
export async function getLandsForOrganization(
  organizationId: string,
): Promise<{ lands: LandListItem[]; organizationFound: boolean }> {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(organizationId)) {
    return { lands: [], organizationFound: false };
  }

  const orgObjectId = new Types.ObjectId(organizationId);
  const organization = await Organization.findById(orgObjectId).lean();
  if (!organization) {
    return { lands: [], organizationFound: false };
  }

  const docs = (await Land.find({ organizationId: orgObjectId })
    .populate("farmerId", "fullName")
    .sort({ createdAt: -1 })
    .lean()) as Array<
    ILand & {
      _id: Types.ObjectId;
      farmerId: Types.ObjectId | { _id: Types.ObjectId; fullName: string } | null;
    }
  >;

  const lands: LandListItem[] = docs.map((l) => {
    const farmerRef = l.farmerId as
      | Types.ObjectId
      | { _id: Types.ObjectId; fullName: string }
      | null
      | undefined;

    let farmerIdStr: string;
    let farmerName: string;

    if (farmerRef && typeof farmerRef === "object" && "fullName" in farmerRef) {
      farmerIdStr = String(farmerRef._id);
      farmerName = farmerRef.fullName;
    } else if (farmerRef) {
      farmerIdStr = String(farmerRef);
      farmerName = "—";
    } else {
      farmerIdStr = "";
      farmerName = "—";
    }

    return {
      id: String(l._id),
      name: l.name,
      farmerId: farmerIdStr,
      farmerName,
      organizationId: String(l.organizationId),
      area: l.area,
      geoLocation: l.geoLocation,
      isActive: l.isActive,
      createdAt: (l.createdAt ?? new Date()).toISOString(),
      updatedAt: (l.updatedAt ?? new Date()).toISOString(),
    };
  });

  return { lands, organizationFound: true };
}

/**
 * Single land for an organization (with farmer name). Used by land detail pages.
 */
export async function getLandByIdForOrganization(
  organizationId: string,
  landId: string,
): Promise<{ land: LandListItem | null; organizationFound: boolean }> {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(organizationId) || !Types.ObjectId.isValid(landId)) {
    return { land: null, organizationFound: false };
  }

  const orgObjectId = new Types.ObjectId(organizationId);
  const landObjectId = new Types.ObjectId(landId);

  const organization = await Organization.findById(orgObjectId).lean();
  if (!organization) {
    return { land: null, organizationFound: false };
  }

  const doc = (await Land.findOne({
    _id: landObjectId,
    organizationId: orgObjectId,
  })
    .populate("farmerId", "fullName")
    .lean()) as
    | (ILand & {
        _id: Types.ObjectId;
        farmerId: Types.ObjectId | { _id: Types.ObjectId; fullName: string } | null;
      })
    | null;

  if (!doc) {
    return { land: null, organizationFound: true };
  }

  const farmerRef = doc.farmerId as
    | Types.ObjectId
    | { _id: Types.ObjectId; fullName: string }
    | null
    | undefined;

  let farmerIdStr: string;
  let farmerName: string;

  if (farmerRef && typeof farmerRef === "object" && "fullName" in farmerRef) {
    farmerIdStr = String(farmerRef._id);
    farmerName = farmerRef.fullName;
  } else if (farmerRef) {
    farmerIdStr = String(farmerRef);
    farmerName = "—";
  } else {
    farmerIdStr = "";
    farmerName = "—";
  }

  const land: LandListItem = {
    id: String(doc._id),
    name: doc.name,
    farmerId: farmerIdStr,
    farmerName,
    organizationId: String(doc.organizationId),
    area: doc.area,
    geoLocation: doc.geoLocation,
    isActive: doc.isActive,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };

  return { land, organizationFound: true };
}
