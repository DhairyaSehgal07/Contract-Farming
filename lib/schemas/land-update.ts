import { z } from "zod";

import { LAND_AREA_UNITS } from "@/lib/land/constants";

const objectIdRegex = /^[a-f\d]{24}$/i;

const geoSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const updateLandSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  farmerId: z.string().trim().regex(objectIdRegex, "Invalid farmer id"),
  area: z.object({
    value: z.number().min(0, "Area value must be non-negative"),
    unit: z.enum(LAND_AREA_UNITS),
  }),
  /** Omit to leave unchanged; `null` clears geo location. */
  geoLocation: z.union([geoSchema, z.null()]).optional(),
  isActive: z.boolean(),
});

export type UpdateLandFormValues = z.infer<typeof updateLandSchema>;
