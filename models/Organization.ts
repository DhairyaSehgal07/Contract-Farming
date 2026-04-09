import mongoose, { Schema, model, models } from "mongoose";

export interface IOrganizationContactDetails {
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * Tenant root: RBAC is enforced by StoreAdminUser.organizationId + role.
 * Optional owner points at the primary org_admin user (set after first user is created).
 */
export interface IOrganization {
  _id?: mongoose.Types.ObjectId;
  name: string;
  contactDetails: IOrganizationContactDetails;
  isActive: boolean;
  /** Primary store admin user for this org; optional until bootstrap completes. */
  ownerUserId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const contactDetailsSchema = new Schema<IOrganizationContactDetails>(
  {
    phone: { type: String },
    email: { type: String },
    address: { type: String },
  },
  { _id: false },
);

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    contactDetails: { type: contactDetailsSchema, default: {} },
    isActive: { type: Boolean, required: true, default: true },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
      index: true,
    },
  },
  { timestamps: true },
);

export const Organization =
  models.Organization || model<IOrganization>("Organization", organizationSchema);
