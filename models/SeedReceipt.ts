import mongoose, { Schema, model, models } from "mongoose";

export const RECEIPT_STATUS = [
  "pending_verification",
  "verified",
  "discrepancy_reported",
  "closed",
] as const;
export type ReceiptStatus = (typeof RECEIPT_STATUS)[number];

export interface IReceiptIssue {
  issueType: "bag_count_mismatch" | "weight_mismatch" | "transit_damage" | "other";
  description: string;
  reportedAt: Date;
  reportedByUserId?: mongoose.Types.ObjectId;
}

export interface IReceiptLineItem {
  lotNumber: string;
  variety: string;
  seedSize?: string;
  receivedBagCount: number;
  receivedWeightKg: number;
  stackLocationLabel?: string;
}

export interface ISeedReceipt {
  _id?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  dispatchId: mongoose.Types.ObjectId;
  receiptNumber: string;
  receiverName: string;
  receiverMobileNumber?: string;
  receivedAt?: Date;
  hasDiscrepancy: boolean;
  issues: IReceiptIssue[];
  lineItems: IReceiptLineItem[];
  acknowledgedAt?: Date;
  status: ReceiptStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const receiptIssueSchema = new Schema<IReceiptIssue>(
  {
    issueType: {
      type: String,
      required: true,
      enum: ["bag_count_mismatch", "weight_mismatch", "transit_damage", "other"],
    },
    description: { type: String, required: true, trim: true },
    reportedAt: { type: Date, required: true, default: Date.now },
    reportedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
    },
  },
  { _id: false },
);

const receiptLineItemSchema = new Schema<IReceiptLineItem>(
  {
    lotNumber: { type: String, required: true, trim: true },
    variety: { type: String, required: true, trim: true },
    seedSize: { type: String, trim: true },
    receivedBagCount: { type: Number, required: true, min: 0 },
    receivedWeightKg: { type: Number, required: true, min: 0 },
    stackLocationLabel: { type: String, trim: true },
  },
  { _id: false },
);

const seedReceiptSchema = new Schema<ISeedReceipt>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    dispatchId: {
      type: Schema.Types.ObjectId,
      ref: "SeedDispatch",
      required: true,
      index: true,
    },
    receiptNumber: { type: String, required: true, trim: true, index: true },
    receiverName: { type: String, required: true, trim: true },
    receiverMobileNumber: { type: String, trim: true },
    receivedAt: { type: Date },
    hasDiscrepancy: { type: Boolean, required: true, default: false, index: true },
    issues: { type: [receiptIssueSchema], default: [] },
    lineItems: { type: [receiptLineItemSchema], default: [] },
    acknowledgedAt: { type: Date },
    status: {
      type: String,
      required: true,
      enum: RECEIPT_STATUS,
      default: "pending_verification",
      index: true,
    },
  },
  { timestamps: true },
);

seedReceiptSchema.index({ organizationId: 1, receiptNumber: 1 }, { unique: true });
seedReceiptSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export const SeedReceipt =
  models.SeedReceipt || model<ISeedReceipt>("SeedReceipt", seedReceiptSchema);
