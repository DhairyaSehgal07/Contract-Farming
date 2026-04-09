import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";
import {
  ORGANIZATION_ROLES,
  type OrganizationRole,
} from "./rbac";

export interface IStoreAdminUser {
  _id?: mongoose.Types.ObjectId;
  mobileNumber: string;
  password: string;
  organizationId: mongoose.Types.ObjectId;
  role: OrganizationRole;
  /** When false, authentication / authorization should reject this user. */
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const storeAdminUserSchema = new Schema<IStoreAdminUser>(
  {
    mobileNumber: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ORGANIZATION_ROLES,
      index: true,
    },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

storeAdminUserSchema.index(
  { organizationId: 1, mobileNumber: 1 },
  { unique: true },
);

storeAdminUserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

export const StoreAdminUser =
  models.StoreAdminUser ||
  model<IStoreAdminUser>("StoreAdminUser", storeAdminUserSchema);

/**
 * Backward-compatible alias while existing imports still use `User`.
 * Prefer `StoreAdminUser` in new code.
 */
export const User = StoreAdminUser;
