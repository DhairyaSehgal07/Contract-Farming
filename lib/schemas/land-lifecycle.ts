import { z } from "zod";

import { CROP_SEASONS } from "@/models/LandLifecycle";

const objectIdRegex = /^[a-f\d]{24}$/i;

const optionalObjectId = z
  .string()
  .regex(objectIdRegex, "Invalid ObjectId")
  .optional();

const attachmentSetSchema = z.object({
  photos: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
});

const fieldGeoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const plantationEntrySchema = z.object({
  plantationDate: z.coerce.date(),
  variety: z.string().trim().min(1),
  size: z.string().trim().optional(),
  quantity: z.number().min(0),
  notes: z.string().trim().optional(),
  basalFertilizerDose: z.string().trim().optional(),
  preIrrigationStatus: z.string().trim().optional(),
  fieldGeoLocation: fieldGeoPointSchema.optional(),
  plantedArea: z.number().min(0).optional(),
  plantingDepthCm: z.number().min(0).optional(),
  spacingCm: z.string().trim().optional(),
  plantingPattern: z.string().trim().optional(),
  bagsUsed: z.number().min(0).optional(),
  recordedByUserId: optionalObjectId,
});

const irrigationEntrySchema = z.object({
  irrigationDate: z.coerce.date(),
  notes: z.string().trim().optional(),
  media: attachmentSetSchema.optional(),
  adminManagerInstructions: z.string().trim().optional(),
  recordedByUserId: optionalObjectId,
  reviewedByUserId: optionalObjectId,
});

const roguingEntrySchema = z.object({
  roguingDate: z.coerce.date(),
  results: z.string().trim().optional(),
  observations: z.string().trim().optional(),
  virusInfectedPlantCount: z.number().min(0).optional(),
  mixedVarietyPlantCount: z.number().min(0).optional(),
  germinationPercentage: z.number().min(0).max(100).optional(),
  qualityAssessmentReportUrl: z.string().trim().optional(),
  recordedByUserId: optionalObjectId,
});

const stripTestEntrySchema = z.object({
  stripTestDate: z.coerce.date(),
  stripLengthMeter: z.number().min(0).optional(),
  stripAreaSqm: z.number().min(0).optional(),
  goliTuberCount: z.number().min(0).optional(),
  mediumTuberCount: z.number().min(0).optional(),
  tuberRatio: z.string().trim().optional(),
  totalTuberWeightKg: z.number().min(0).optional(),
  isCropReadyForDehaulming: z.boolean().optional(),
  decisionNotes: z.string().trim().optional(),
  recordedByUserId: optionalObjectId,
});

const dehalmingEntrySchema = z.object({
  dehalmingDate: z.coerce.date(),
  notes: z.string().trim().optional(),
  recordedByUserId: optionalObjectId,
});

const cropSeasonSchema = z.enum(CROP_SEASONS);

const landLifecycleFields = z.object({
  cycleId: z.string().trim().optional(),
  season: cropSeasonSchema.optional(),
  year: z.number().int().min(2000).max(9999).optional(),
  crop: z.string().trim().optional(),
  plannedPlantingWindow: z
    .object({
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    })
    .optional(),
  actualPlantingStart: z.coerce.date().optional(),
  dehaulmingDate: z.coerce.date().optional(),
  harvestPlannedDate: z.coerce.date().optional(),
  /** Omitted on PATCH must stay omitted — `.default([])` would wipe other arrays on partial updates. */
  plantationEntries: z.array(plantationEntrySchema).optional(),
  irrigationEntries: z.array(irrigationEntrySchema).optional(),
  roguingEntries: z.array(roguingEntrySchema).optional(),
  stripTestEntries: z.array(stripTestEntrySchema).optional(),
  dehalmingEntries: z.array(dehalmingEntrySchema).optional(),
});

/** POST: default empty entry arrays when not sent. */
export const registerLandLifecycleSchema = landLifecycleFields.transform((data) => ({
  ...data,
  plantationEntries: data.plantationEntries ?? [],
  irrigationEntries: data.irrigationEntries ?? [],
  roguingEntries: data.roguingEntries ?? [],
  stripTestEntries: data.stripTestEntries ?? [],
  dehalmingEntries: data.dehalmingEntries ?? [],
}));

export const updateLandLifecycleSchema = landLifecycleFields.partial();

export type RegisterLandLifecycleInput = z.infer<typeof registerLandLifecycleSchema>;
export type UpdateLandLifecycleInput = z.infer<typeof updateLandLifecycleSchema>;
