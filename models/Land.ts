import mongoose, { Schema, model, models } from "mongoose";

export const LAND_AREA_UNITS = ["acre", "hectare"] as const;
export type LandAreaUnit = (typeof LAND_AREA_UNITS)[number];

export interface ILandArea {
  value: number;
  unit: LandAreaUnit;
}

export interface IGeoLocation {
  latitude: number;
  longitude: number;
}

export interface ILand {
  _id?: mongoose.Types.ObjectId;
  name: string;
  farmerId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  area: ILandArea;
  geoLocation?: IGeoLocation;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const landAreaSchema = new Schema<ILandArea>(
  {
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: LAND_AREA_UNITS },
  },
  { _id: false },
);

const geoLocationSchema = new Schema<IGeoLocation>(
  {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false },
);

const landSchema = new Schema<ILand>(
  {
    name: { type: String, required: true, trim: true },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    area: { type: landAreaSchema, required: true },
    geoLocation: { type: geoLocationSchema, required: false },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

landSchema.index({ organizationId: 1, farmerId: 1, name: 1 }, { unique: true });

export const Land = models.Land || model<ILand>("Land", landSchema);
