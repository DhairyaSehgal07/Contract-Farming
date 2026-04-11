import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import {
  registerLandLifecycleSchema,
  updateLandLifecycleSchema,
} from "@/lib/schemas/land-lifecycle";
import { connectToDatabase } from "@/lib/db";
import { Land } from "@/models/Land";
import { LandLifecycle } from "@/models/LandLifecycle";
import type { ILandLifecycle } from "@/models/LandLifecycle";

export const runtime = "nodejs";

const objectIdRegex = /^[a-f\d]{24}$/i;

const LIFECYCLE_ENTRY_ARRAY_KEYS = new Set([
  "plantationEntries",
  "irrigationEntries",
  "roguingEntries",
  "stripTestEntries",
  "dehalmingEntries",
]);

/**
 * Build `$set` from validated data but only for top-level keys present in the raw JSON body.
 * Prevents accidental wipes when a parser fills omitted fields (e.g. empty entry arrays).
 */
function pickSetFieldsFromRequest(
  rawBody: unknown,
  parsed: Record<string, unknown>,
): Record<string, unknown> {
  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
    return {};
  }
  const incoming = new Set(Object.keys(rawBody as Record<string, unknown>));
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(parsed)) {
    if (incoming.has(key)) {
      out[key] = parsed[key];
    }
  }
  return out;
}

/**
 * If the client sends several top-level keys and some entry arrays are empty `[]`, those are
 * noise (e.g. merged state) and must not overwrite existing logs. Omit empty entry arrays unless
 * this is a single-key request (explicit clear for that list).
 */
function omitEmptyEntryArraysWhenMixedRequest(
  rawBody: unknown,
  setPayload: Record<string, unknown>,
): Record<string, unknown> {
  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
    return setPayload;
  }
  const rawKeys = Object.keys(rawBody as Record<string, unknown>);
  if (rawKeys.length <= 1) {
    return setPayload;
  }
  const out = { ...setPayload };
  for (const k of LIFECYCLE_ENTRY_ARRAY_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(out, k)) continue;
    const v = out[k];
    if (Array.isArray(v) && v.length === 0) {
      delete out[k];
    }
  }
  return out;
}

function buildLifecyclePatchSet(rawBody: unknown, parsed: Record<string, unknown>): Record<string, unknown> {
  const picked = pickSetFieldsFromRequest(rawBody, parsed);
  return omitEmptyEntryArraysWhenMixedRequest(rawBody, picked);
}

function toIso(d: Date | undefined) {
  return d?.toISOString();
}

function attachmentToPayload(
  m: { photos: string[]; videos: string[] } | undefined,
) {
  if (!m) return { photos: [] as string[], videos: [] as string[] };
  return { photos: m.photos ?? [], videos: m.videos ?? [] };
}

function landLifecycleToPayload(doc: ILandLifecycle & { _id: Types.ObjectId }) {
  return {
    id: String(doc._id),
    organizationId: String(doc.organizationId),
    farmerId: String(doc.farmerId),
    landId: String(doc.landId),
    cycleId: doc.cycleId,
    season: doc.season,
    year: doc.year,
    crop: doc.crop,
    plannedPlantingWindow: doc.plannedPlantingWindow
      ? {
          startDate: toIso(doc.plannedPlantingWindow.startDate),
          endDate: toIso(doc.plannedPlantingWindow.endDate),
        }
      : undefined,
    actualPlantingStart: toIso(doc.actualPlantingStart),
    dehaulmingDate: toIso(doc.dehaulmingDate),
    harvestPlannedDate: toIso(doc.harvestPlannedDate),
    plantationEntries: (doc.plantationEntries ?? []).map((e) => ({
      plantationDate: e.plantationDate.toISOString(),
      variety: e.variety,
      size: e.size,
      quantity: e.quantity,
      notes: e.notes,
      basalFertilizerDose: e.basalFertilizerDose,
      preIrrigationStatus: e.preIrrigationStatus,
      fieldGeoLocation: e.fieldGeoLocation,
      plantedArea: e.plantedArea,
      plantingDepthCm: e.plantingDepthCm,
      spacingCm: e.spacingCm,
      plantingPattern: e.plantingPattern,
      bagsUsed: e.bagsUsed,
      recordedByUserId: e.recordedByUserId
        ? String(e.recordedByUserId)
        : undefined,
    })),
    irrigationEntries: (doc.irrigationEntries ?? []).map((e) => ({
      irrigationDate: e.irrigationDate.toISOString(),
      notes: e.notes,
      media: attachmentToPayload(e.media),
      adminManagerInstructions: e.adminManagerInstructions,
      recordedByUserId: e.recordedByUserId
        ? String(e.recordedByUserId)
        : undefined,
      reviewedByUserId: e.reviewedByUserId
        ? String(e.reviewedByUserId)
        : undefined,
    })),
    roguingEntries: (doc.roguingEntries ?? []).map((e) => ({
      roguingDate: e.roguingDate.toISOString(),
      results: e.results,
      observations: e.observations,
      virusInfectedPlantCount: e.virusInfectedPlantCount,
      mixedVarietyPlantCount: e.mixedVarietyPlantCount,
      germinationPercentage: e.germinationPercentage,
      qualityAssessmentReportUrl: e.qualityAssessmentReportUrl,
      recordedByUserId: e.recordedByUserId
        ? String(e.recordedByUserId)
        : undefined,
    })),
    stripTestEntries: (doc.stripTestEntries ?? []).map((e) => ({
      stripTestDate: e.stripTestDate.toISOString(),
      stripLengthMeter: e.stripLengthMeter,
      stripAreaSqm: e.stripAreaSqm,
      goliTuberCount: e.goliTuberCount,
      mediumTuberCount: e.mediumTuberCount,
      tuberRatio: e.tuberRatio,
      totalTuberWeightKg: e.totalTuberWeightKg,
      isCropReadyForDehaulming: e.isCropReadyForDehaulming,
      decisionNotes: e.decisionNotes,
      recordedByUserId: e.recordedByUserId
        ? String(e.recordedByUserId)
        : undefined,
    })),
    dehalmingEntries: (doc.dehalmingEntries ?? []).map((e) => ({
      dehalmingDate: e.dehalmingDate.toISOString(),
      notes: e.notes,
      recordedByUserId: e.recordedByUserId
        ? String(e.recordedByUserId)
        : undefined,
    })),
    createdAt: toIso(doc.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(doc.updatedAt) ?? new Date().toISOString(),
  };
}

async function requireLandInOrg(landObjectId: Types.ObjectId, orgObjectId: Types.ObjectId) {
  const land = await Land.findOne({
    _id: landObjectId,
    organizationId: orgObjectId,
  }).lean();

  return land;
}

export async function GET(
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

    const land = await requireLandInOrg(landObjectId, orgObjectId);
    if (!land) {
      return NextResponse.json(
        { success: false, message: "Land not found" },
        { status: 404 },
      );
    }

    const lifecycle = await LandLifecycle.findOne({
      landId: landObjectId,
      organizationId: orgObjectId,
    }).lean();

    if (!lifecycle) {
      return NextResponse.json(
        { success: false, message: "Lifecycle not found for this land" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Land lifecycle fetched successfully",
        data: landLifecycleToPayload(
          lifecycle as ILandLifecycle & { _id: Types.ObjectId },
        ),
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch land lifecycle" },
      { status: 500 },
    );
  }
}

export async function POST(
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
    const parsed = registerLandLifecycleSchema.safeParse(body);
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

    const land = await requireLandInOrg(landObjectId, orgObjectId);
    if (!land) {
      return NextResponse.json(
        { success: false, message: "Land not found" },
        { status: 404 },
      );
    }

    const existing = await LandLifecycle.findOne({
      landId: landObjectId,
    }).lean();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "A lifecycle already exists for this land",
        },
        { status: 409 },
      );
    }

    const {
      plantationEntries,
      irrigationEntries,
      roguingEntries,
      stripTestEntries,
      dehalmingEntries,
      ...rest
    } = parsed.data;

    const created = await LandLifecycle.create({
      organizationId: orgObjectId,
      farmerId: land.farmerId,
      landId: landObjectId,
      ...rest,
      plantationEntries,
      irrigationEntries,
      roguingEntries,
      stripTestEntries,
      dehalmingEntries,
    });

    const doc = created.toObject();
    return NextResponse.json(
      {
        success: true,
        message: "Land lifecycle created successfully",
        data: landLifecycleToPayload(
          doc as ILandLifecycle & { _id: Types.ObjectId },
        ),
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
          message: "A lifecycle already exists for this land",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create land lifecycle" },
      { status: 500 },
    );
  }
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
    const parsed = updateLandLifecycleSchema.safeParse(body);
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

    const setPayload = buildLifecyclePatchSet(body, parsed.data as Record<string, unknown>);

    if (Object.keys(setPayload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const orgObjectId = new Types.ObjectId(session.user.organizationId);
    const landObjectId = new Types.ObjectId(id);

    const land = await requireLandInOrg(landObjectId, orgObjectId);
    if (!land) {
      return NextResponse.json(
        { success: false, message: "Land not found" },
        { status: 404 },
      );
    }

    const updated = await LandLifecycle.findOneAndUpdate(
      { landId: landObjectId, organizationId: orgObjectId },
      { $set: setPayload },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Lifecycle not found for this land" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Land lifecycle updated successfully",
        data: landLifecycleToPayload(
          updated as ILandLifecycle & { _id: Types.ObjectId },
        ),
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
      { success: false, message: "Failed to update land lifecycle" },
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

    const land = await requireLandInOrg(landObjectId, orgObjectId);
    if (!land) {
      return NextResponse.json(
        { success: false, message: "Land not found" },
        { status: 404 },
      );
    }

    const deleted = await LandLifecycle.findOneAndDelete({
      landId: landObjectId,
      organizationId: orgObjectId,
    }).lean();

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Lifecycle not found for this land" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Land lifecycle deleted successfully",
        data: { id: String(deleted._id), landId: String(deleted.landId) },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete land lifecycle" },
      { status: 500 },
    );
  }
}
