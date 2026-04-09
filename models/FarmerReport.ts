import mongoose, { Schema, model, models } from "mongoose";

export const FARMER_REPORT_STATUS = [
  "draft",
  "generated",
  "failed",
] as const;
export type FarmerReportStatus = (typeof FARMER_REPORT_STATUS)[number];

export interface IFarmerReport {
  _id?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  generatedByUserId?: mongoose.Types.ObjectId;
  reportDate: Date;
  status: FarmerReportStatus;
  pdfUrl?: string;
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const farmerReportSchema = new Schema<IFarmerReport>(
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
    generatedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
      index: true,
    },
    reportDate: { type: Date, required: true, default: Date.now, index: true },
    status: {
      type: String,
      required: true,
      enum: FARMER_REPORT_STATUS,
      default: "draft",
      index: true,
    },
    pdfUrl: { type: String, trim: true },
    errorMessage: { type: String, trim: true },
  },
  { timestamps: true },
);

farmerReportSchema.index({ organizationId: 1, farmerId: 1, reportDate: -1 });

export const FarmerReport =
  models.FarmerReport || model<IFarmerReport>("FarmerReport", farmerReportSchema);
