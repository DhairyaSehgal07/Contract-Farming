import mongoose, { Schema, model, models } from "mongoose";

export const DISPATCH_STATUS = [
  "draft",
  "ready_to_load",
  "loaded",
  "dispatched",
  "in_transit",
  "delivered",
] as const;
export type DispatchStatus = (typeof DISPATCH_STATUS)[number];

export interface IDispatchDocument {
  dispatchSlipUrl?: string;
  weightSlipUrl?: string;
}

export interface IDispatchLineItem {
  lotNumber: string;
  variety: string;
  seedSize?: string;
  bagCount: number;
  expectedNetWeightKg: number;
}

export interface ITruckWeighment {
  tareWeightKg?: number;
  grossWeightKg?: number;
  netWeightKg?: number;
  measuredAt?: Date;
}

export interface ISeedDispatch {
  _id?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  seedProcessingBatchId?: mongoose.Types.ObjectId;
  dispatchNumber: string;
  truckNumber: string;
  driverName?: string;
  driverMobileNumber?: string;
  originLocation: string;
  destinationLocation: string;
  preDispatchWeighment?: ITruckWeighment;
  documents: IDispatchDocument;
  lineItems: IDispatchLineItem[];
  dispatchedAt?: Date;
  status: DispatchStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const dispatchDocumentSchema = new Schema<IDispatchDocument>(
  {
    dispatchSlipUrl: { type: String, trim: true },
    weightSlipUrl: { type: String, trim: true },
  },
  { _id: false },
);

const dispatchLineItemSchema = new Schema<IDispatchLineItem>(
  {
    lotNumber: { type: String, required: true, trim: true },
    variety: { type: String, required: true, trim: true },
    seedSize: { type: String, trim: true },
    bagCount: { type: Number, required: true, min: 0 },
    expectedNetWeightKg: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const truckWeighmentSchema = new Schema<ITruckWeighment>(
  {
    tareWeightKg: { type: Number, min: 0 },
    grossWeightKg: { type: Number, min: 0 },
    netWeightKg: { type: Number, min: 0 },
    measuredAt: { type: Date },
  },
  { _id: false },
);

const seedDispatchSchema = new Schema<ISeedDispatch>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    seedProcessingBatchId: {
      type: Schema.Types.ObjectId,
      ref: "SeedProcessingBatch",
      required: false,
      index: true,
    },
    dispatchNumber: { type: String, required: true, trim: true, index: true },
    truckNumber: { type: String, required: true, trim: true, index: true },
    driverName: { type: String, trim: true },
    driverMobileNumber: { type: String, trim: true },
    originLocation: { type: String, required: true, trim: true },
    destinationLocation: { type: String, required: true, trim: true },
    preDispatchWeighment: { type: truckWeighmentSchema, required: false },
    documents: { type: dispatchDocumentSchema, default: {} },
    lineItems: { type: [dispatchLineItemSchema], default: [] },
    dispatchedAt: { type: Date },
    status: {
      type: String,
      required: true,
      enum: DISPATCH_STATUS,
      default: "draft",
      index: true,
    },
  },
  { timestamps: true },
);

seedDispatchSchema.index({ organizationId: 1, dispatchNumber: 1 }, { unique: true });
seedDispatchSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export const SeedDispatch =
  models.SeedDispatch || model<ISeedDispatch>("SeedDispatch", seedDispatchSchema);
