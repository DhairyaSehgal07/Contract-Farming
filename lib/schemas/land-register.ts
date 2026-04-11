import { z } from "zod";

import { LAND_AREA_UNITS } from "@/lib/land/constants";

const objectIdRegex = /^[a-f\d]{24}$/i;

export const registerLandFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    farmerId: z.string().trim().regex(objectIdRegex, "Select a farmer"),
    areaValue: z.number().min(0, "Area must be zero or greater"),
    areaUnit: z.enum(LAND_AREA_UNITS),
    latitude: z.string(),
    longitude: z.string(),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const lt = data.latitude.trim();
    const lg = data.longitude.trim();
    if ((lt && !lg) || (!lt && lg)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter both latitude and longitude, or leave both empty.",
        path: ["latitude"],
      });
    }
    if (lt && lg) {
      const la = Number(lt);
      const lo = Number(lg);
      if (Number.isNaN(la) || la < -90 || la > 90) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Latitude must be between -90 and 90.",
          path: ["latitude"],
        });
      }
      if (Number.isNaN(lo) || lo < -180 || lo > 180) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Longitude must be between -180 and 180.",
          path: ["longitude"],
        });
      }
    }
  });

export type RegisterLandFormValues = z.infer<typeof registerLandFormSchema>;
