import { z } from "zod";

export const lookupWardSchema = z.object({
  lat: z.coerce.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  lng: z.coerce.number().min(-180).max(180, "Longitude must be between -180 and 180"),
});

export const getConstituenciesSchema = z.object({
  corporationId: z.coerce.number().int().positive().optional(),
});

export const getWardsSchema = z.object({
  constituencyId: z.coerce.number().int().positive().optional(),
  corporationId: z.coerce.number().int().positive().optional(),
});

export const getWardsGeoJsonSchema = z.object({
  corporationId: z.coerce.number().int().positive().optional(),
  constituencyId: z.coerce.number().int().positive().optional(),
});
