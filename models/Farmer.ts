import mongoose, { Schema, model, models } from "mongoose";

export interface IFarmer {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  address: string;
  mobileNumber: string;
  organizationId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const farmerSchema = new Schema<IFarmer>(
  {
    fullName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

/**
 * Farmers are unique per organization by mobile number.
 * The same farmer mobile can exist across different organizations.
 */
farmerSchema.index({ organizationId: 1, mobileNumber: 1 }, { unique: true });

export const Farmer = models.Farmer || model<IFarmer>("Farmer", farmerSchema);
