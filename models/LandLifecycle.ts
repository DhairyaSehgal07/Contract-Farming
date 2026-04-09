import mongoose, { Schema, model, models } from "mongoose";

export const VISIT_TYPES = ["strip_test_1", "strip_test_2"] as const;
export type VisitType = (typeof VISIT_TYPES)[number];

interface IAttachmentSet {
  photos: string[];
  videos: string[];
}

export interface IPlantationEntry {
  plantationDate: Date;
  variety: string;
  size?: string;
  quantity: number;
  notes?: string;
  recordedByUserId?: mongoose.Types.ObjectId;
}

export interface IIrrigationEntry {
  irrigationDate: Date;
  notes?: string;
  media: IAttachmentSet;
  adminManagerInstructions?: string;
  recordedByUserId?: mongoose.Types.ObjectId;
  reviewedByUserId?: mongoose.Types.ObjectId;
}

export interface IRoguingEntry {
  roguingDate: Date;
  results?: string;
  observations?: string;
  recordedByUserId?: mongoose.Types.ObjectId;
}

export interface IVisitReportEntry {
  visitType: VisitType;
  visitDate: Date;
  testResult?: string;
  observations?: string;
  recordedByUserId?: mongoose.Types.ObjectId;
}

export interface IDehalmingEntry {
  dehalmingDate: Date;
  notes?: string;
  recordedByUserId?: mongoose.Types.ObjectId;
}

export interface ILandLifecycle {
  _id?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  landId: mongoose.Types.ObjectId;
  plantationEntries: IPlantationEntry[];
  irrigationEntries: IIrrigationEntry[];
  roguingEntries: IRoguingEntry[];
  visitReports: IVisitReportEntry[];
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
    results: { type: String, trim: true },
    observations: { type: String, trim: true },
    recordedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
    },
  },
  { _id: false },
);

const visitReportEntrySchema = new Schema<IVisitReportEntry>(
  {
    visitType: { type: String, required: true, enum: VISIT_TYPES },
    visitDate: { type: Date, required: true },
    testResult: { type: String, trim: true },
    observations: { type: String, trim: true },
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
    plantationEntries: { type: [plantationEntrySchema], default: [] },
    irrigationEntries: { type: [irrigationEntrySchema], default: [] },
    roguingEntries: { type: [roguingEntrySchema], default: [] },
    visitReports: { type: [visitReportEntrySchema], default: [] },
    dehalmingEntries: { type: [dehalmingEntrySchema], default: [] },
  },
  { timestamps: true },
);

landLifecycleSchema.index({ organizationId: 1, farmerId: 1, landId: 1 });

export const LandLifecycle =
  models.LandLifecycle || model<ILandLifecycle>("LandLifecycle", landLifecycleSchema);
