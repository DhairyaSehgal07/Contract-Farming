import mongoose, { Schema, model, models } from "mongoose";

export const CROP_SEASONS = ["kharif", "rabi", "zaid", "other"] as const;
export type CropSeason = (typeof CROP_SEASONS)[number];

interface IAttachmentSet {
  photos: string[];
  videos: string[];
}

export interface IPlantingWindow {
  startDate?: Date;
  endDate?: Date;
}

export interface IFieldGeoPoint {
  latitude: number;
  longitude: number;
}

export interface IPlantationEntry {
  plantationDate: Date;
  variety: string;
  size?: string;
  quantity: number; // bag count used for planting activity
  notes?: string;
  basalFertilizerDose?: string;
  preIrrigationStatus?: string;
  fieldGeoLocation?: IFieldGeoPoint;
  plantedArea?: number;
  plantingDepthCm?: number;
  spacingCm?: string;
  plantingPattern?: string;
  bagsUsed?: number;
  /** Optional photo URL (e.g. UploadThing) for this log entry */
  imageUrl?: string;
  recordedByUserId?: mongoose.Types.ObjectId;
}

export interface IIrrigationEntry {
  irrigationDate: Date;
  notes?: string;
  /** Optional photo URL for this visit */
  imageUrl?: string;
  media: IAttachmentSet;
  adminManagerInstructions?: string;
  recordedByUserId?: mongoose.Types.ObjectId;
  reviewedByUserId?: mongoose.Types.ObjectId;
}

export interface IRoguingEntry {
  roguingDate: Date;
  /** Optional photo URL for this inspection */
  imageUrl?: string;
  results?: string;
  observations?: string;
  virusInfectedPlantCount?: number;
  mixedVarietyPlantCount?: number;
  germinationPercentage?: number;
  qualityAssessmentReportUrl?: string;
  recordedByUserId?: mongoose.Types.ObjectId;
}

export interface IStripTestEntry {
  stripTestDate: Date;
  /** Optional photo URL for this strip test */
  imageUrl?: string;
  stripLengthMeter?: number;
  stripAreaSqm?: number;
  goliTuberCount?: number;
  mediumTuberCount?: number; // 11-12 soot bucket
  tuberRatio?: string;
  totalTuberWeightKg?: number;
  isCropReadyForDehaulming?: boolean;
  decisionNotes?: string;
  recordedByUserId?: mongoose.Types.ObjectId;
}

export interface IDehalmingEntry {
  dehalmingDate: Date;
  /** Optional photo URL for this milestone */
  imageUrl?: string;
  notes?: string;
  recordedByUserId?: mongoose.Types.ObjectId;
}

export interface ILandLifecycle {
  _id?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  landId: mongoose.Types.ObjectId;
  cycleId?: string;
  season?: CropSeason;
  year?: number;
  crop?: string;
  plannedPlantingWindow?: IPlantingWindow;
  actualPlantingStart?: Date;
  dehaulmingDate?: Date;
  harvestPlannedDate?: Date;
  plantationEntries: IPlantationEntry[];
  irrigationEntries: IIrrigationEntry[];
  roguingEntries: IRoguingEntry[];
  stripTestEntries: IStripTestEntry[];
  dehalmingEntries: IDehalmingEntry[];
  createdAt?: Date;
  updatedAt?: Date;
}

const attachmentSetSchema = new Schema<IAttachmentSet>(
  {
    photos: { type: [String], default: [] },
    videos: { type: [String], default: [] },
  },
  { _id: false },
);

const plantationEntrySchema = new Schema<IPlantationEntry>(
  {
    plantationDate: { type: Date, required: true },
    variety: { type: String, required: true, trim: true },
    size: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
    basalFertilizerDose: { type: String, trim: true },
    preIrrigationStatus: { type: String, trim: true },
    fieldGeoLocation: {
      type: {
        latitude: { type: Number, min: -90, max: 90, required: true },
        longitude: { type: Number, min: -180, max: 180, required: true },
      },
      _id: false,
      required: false,
    },
    plantedArea: { type: Number, min: 0 },
    plantingDepthCm: { type: Number, min: 0 },
    spacingCm: { type: String, trim: true },
    plantingPattern: { type: String, trim: true },
    bagsUsed: { type: Number, min: 0 },
    imageUrl: { type: String },
    recordedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
    },
  },
  { _id: false },
);

const irrigationEntrySchema = new Schema<IIrrigationEntry>(
  {
    irrigationDate: { type: Date, required: true },
    notes: { type: String, trim: true },
    imageUrl: { type: String },
    media: { type: attachmentSetSchema, default: { photos: [], videos: [] } },
    adminManagerInstructions: { type: String, trim: true },
    recordedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
    },
    reviewedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
    },
  },
  { _id: false },
);

const roguingEntrySchema = new Schema<IRoguingEntry>(
  {
    roguingDate: { type: Date, required: true },
    imageUrl: { type: String },
    results: { type: String, trim: true },
    observations: { type: String, trim: true },
    virusInfectedPlantCount: { type: Number, min: 0 },
    mixedVarietyPlantCount: { type: Number, min: 0 },
    germinationPercentage: { type: Number, min: 0, max: 100 },
    qualityAssessmentReportUrl: { type: String, trim: true },
    recordedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
    },
  },
  { _id: false },
);

const stripTestEntrySchema = new Schema<IStripTestEntry>(
  {
    stripTestDate: { type: Date, required: true },
    imageUrl: { type: String },
    stripLengthMeter: { type: Number, min: 0 },
    stripAreaSqm: { type: Number, min: 0 },
    goliTuberCount: { type: Number, min: 0 },
    mediumTuberCount: { type: Number, min: 0 },
    tuberRatio: { type: String, trim: true },
    totalTuberWeightKg: { type: Number, min: 0 },
    isCropReadyForDehaulming: { type: Boolean },
    decisionNotes: { type: String, trim: true },
    recordedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
    },
  },
  { _id: false },
);

const dehalmingEntrySchema = new Schema<IDehalmingEntry>(
  {
    dehalmingDate: { type: Date, required: true },
    imageUrl: { type: String },
    notes: { type: String, trim: true },
    recordedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
    },
  },
  { _id: false },
);

const landLifecycleSchema = new Schema<ILandLifecycle>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
      index: true,
    },
    landId: {
      type: Schema.Types.ObjectId,
      ref: "Land",
      required: true,
      unique: true,
      index: true,
    },
    cycleId: { type: String, trim: true, index: true },
    season: { type: String, enum: CROP_SEASONS },
    year: { type: Number, min: 2000, max: 9999 },
    crop: { type: String, trim: true },
    plannedPlantingWindow: {
      type: {
        startDate: { type: Date },
        endDate: { type: Date },
      },
      _id: false,
      required: false,
    },
    actualPlantingStart: { type: Date },
    dehaulmingDate: { type: Date },
    harvestPlannedDate: { type: Date },
    plantationEntries: { type: [plantationEntrySchema], default: [] },
    irrigationEntries: { type: [irrigationEntrySchema], default: [] },
    roguingEntries: { type: [roguingEntrySchema], default: [] },
    stripTestEntries: { type: [stripTestEntrySchema], default: [] },
    dehalmingEntries: { type: [dehalmingEntrySchema], default: [] },
  },
  { timestamps: true },
);

landLifecycleSchema.index({ organizationId: 1, farmerId: 1, landId: 1 });
landLifecycleSchema.index({ organizationId: 1, cycleId: 1, landId: 1 });

export const LandLifecycle =
  models.LandLifecycle || model<ILandLifecycle>("LandLifecycle", landLifecycleSchema);
