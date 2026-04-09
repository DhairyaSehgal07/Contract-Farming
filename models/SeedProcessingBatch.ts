import mongoose, { Schema, model, models } from "mongoose";

export const QUALITY_DECISIONS = ["accepted", "resort", "rejected"] as const;
export type QualityDecision = (typeof QUALITY_DECISIONS)[number];

export const PROCESSING_STATUS = [
  "draft",
  "processing",
  "quality_hold",
  "packed",
  "ready_for_dispatch",
] as const;
export type ProcessingStatus = (typeof PROCESSING_STATUS)[number];

export interface IWeightTolerance {
  targetKg: number;
  minKg: number;
  maxKg: number;
}

export interface ISeedInputLot {
  lotNumber: string;
  variety: string;
  seedSize?: string;
  bagCount: number;
  totalWeightKg: number;
}

export interface IQualityGate {
  decision: QualityDecision;
  reason?: string;
  issueReport?: string;
  decidedAt: Date;
  recordedByUserId?: mongoose.Types.ObjectId;
}

export interface ISeedOutputLot {
  outputLotNumber: string;
  variety: string;
  seedSize?: string;
  bagCount: number;
  totalWeightKg: number;
}

export interface ISeedProcessingBatch {
  _id?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  batchNumber: string;
  sourceColdStorageName?: string;
  inputLots: ISeedInputLot[];
  sortingNotes?: string;
  treatmentChemicalVolumeMl?: number;
  treatmentAppliedAt?: Date;
  treatmentDriedAt?: Date;
  qualityGate: IQualityGate;
  bagWeightTolerance: IWeightTolerance;
  outputLots: ISeedOutputLot[];
  status: ProcessingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const seedInputLotSchema = new Schema<ISeedInputLot>(
  {
    lotNumber: { type: String, required: true, trim: true },
    variety: { type: String, required: true, trim: true },
    seedSize: { type: String, trim: true },
    bagCount: { type: Number, required: true, min: 0 },
    totalWeightKg: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const qualityGateSchema = new Schema<IQualityGate>(
  {
    decision: { type: String, required: true, enum: QUALITY_DECISIONS },
    reason: { type: String, trim: true },
    issueReport: { type: String, trim: true },
    decidedAt: { type: Date, required: true, default: Date.now },
    recordedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
    },
  },
  { _id: false },
);

const weightToleranceSchema = new Schema<IWeightTolerance>(
  {
    targetKg: { type: Number, required: true, min: 0 },
    minKg: { type: Number, required: true, min: 0 },
    maxKg: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const seedOutputLotSchema = new Schema<ISeedOutputLot>(
  {
    outputLotNumber: { type: String, required: true, trim: true },
    variety: { type: String, required: true, trim: true },
    seedSize: { type: String, trim: true },
    bagCount: { type: Number, required: true, min: 0 },
    totalWeightKg: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const seedProcessingBatchSchema = new Schema<ISeedProcessingBatch>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    batchNumber: { type: String, required: true, trim: true, index: true },
    sourceColdStorageName: { type: String, trim: true },
    inputLots: { type: [seedInputLotSchema], default: [] },
    sortingNotes: { type: String, trim: true },
    treatmentChemicalVolumeMl: { type: Number, min: 0 },
    treatmentAppliedAt: { type: Date },
    treatmentDriedAt: { type: Date },
    qualityGate: { type: qualityGateSchema, required: true },
    bagWeightTolerance: { type: weightToleranceSchema, required: true },
    outputLots: { type: [seedOutputLotSchema], default: [] },
    status: {
      type: String,
      required: true,
      enum: PROCESSING_STATUS,
      default: "draft",
      index: true,
    },
  },
  { timestamps: true },
);

seedProcessingBatchSchema.index({ organizationId: 1, batchNumber: 1 }, { unique: true });
seedProcessingBatchSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export const SeedProcessingBatch =
  models.SeedProcessingBatch ||
  model<ISeedProcessingBatch>("SeedProcessingBatch", seedProcessingBatchSchema);
