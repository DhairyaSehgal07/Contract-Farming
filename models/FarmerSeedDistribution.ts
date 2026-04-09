import mongoose, { Schema, model, models } from "mongoose";

export const DISTRIBUTION_STATUS = ["issued", "acknowledged", "disputed"] as const;
export type DistributionStatus = (typeof DISTRIBUTION_STATUS)[number];

export interface IDistributionGeoLocation {
  latitude: number;
  longitude: number;
}

export interface IFarmerDistributionLineItem {
  lotNumber: string;
  variety: string;
  seedSize?: string;
  bagCount: number;
  totalWeightKg: number;
}

export interface IFarmerSeedDistribution {
  _id?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  landId: mongoose.Types.ObjectId;
  cycleId: string;
  seedReceiptId?: mongoose.Types.ObjectId;
  seedDispatchId?: mongoose.Types.ObjectId;
  issueDate: Date;
  lineItems: IFarmerDistributionLineItem[];
  storageGeoLocation?: IDistributionGeoLocation;
  farmerAcknowledgedAt?: Date;
  notes?: string;
  status: DistributionStatus;
  issuedByUserId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const distributionGeoLocationSchema = new Schema<IDistributionGeoLocation>(
  {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false },
);

const farmerDistributionLineItemSchema = new Schema<IFarmerDistributionLineItem>(
  {
    lotNumber: { type: String, required: true, trim: true },
    variety: { type: String, required: true, trim: true },
    seedSize: { type: String, trim: true },
    bagCount: { type: Number, required: true, min: 0 },
    totalWeightKg: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const farmerSeedDistributionSchema = new Schema<IFarmerSeedDistribution>(
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
      index: true,
    },
    cycleId: { type: String, required: true, trim: true, index: true },
    seedReceiptId: {
      type: Schema.Types.ObjectId,
      ref: "SeedReceipt",
      required: false,
      index: true,
    },
    seedDispatchId: {
      type: Schema.Types.ObjectId,
      ref: "SeedDispatch",
      required: false,
      index: true,
    },
    issueDate: { type: Date, required: true, default: Date.now, index: true },
    lineItems: { type: [farmerDistributionLineItemSchema], default: [] },
    storageGeoLocation: { type: distributionGeoLocationSchema, required: false },
    farmerAcknowledgedAt: { type: Date },
    notes: { type: String, trim: true },
    status: {
      type: String,
      required: true,
      enum: DISTRIBUTION_STATUS,
      default: "issued",
      index: true,
    },
    issuedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
      index: true,
    },
  },
  { timestamps: true },
);

farmerSeedDistributionSchema.index({ organizationId: 1, cycleId: 1, landId: 1, issueDate: -1 });
farmerSeedDistributionSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export const FarmerSeedDistribution =
  models.FarmerSeedDistribution ||
  model<IFarmerSeedDistribution>("FarmerSeedDistribution", farmerSeedDistributionSchema);
