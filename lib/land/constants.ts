/** Land area units — shared by UI, Zod schemas, and Mongoose (no server-only deps). */
export const LAND_AREA_UNITS = ["acre", "hectare"] as const;
export type LandAreaUnit = (typeof LAND_AREA_UNITS)[number];
