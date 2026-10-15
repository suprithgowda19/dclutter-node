import express from "express";
import {
  getCorporations,
  getConstituencies,
  getWards,
  getWardById,
  lookupWard,
  getWardsGeoJson,
} from "../controllers/geo.controller.js";
import { validateQuery } from "../middleware/validatorRequest.js";
import {
  lookupWardSchema,
  getConstituenciesSchema,
  getWardsSchema,
  getWardsGeoJsonSchema,
} from "../validators/geo.validator.js";

const router = express.Router();

// Hierarchy routes
router.get("/corporations", getCorporations);
router.get("/constituencies", validateQuery(getConstituenciesSchema), getConstituencies);
router.get("/wards", validateQuery(getWardsSchema), getWards);
router.get("/wards/:id", getWardById);

// Point-in-polygon spatial lookup for map click or user GPS
router.get("/lookup-ward", validateQuery(lookupWardSchema), lookupWard);

// GIS GeoJSON map boundaries
router.get("/gis/wards", validateQuery(getWardsGeoJsonSchema), getWardsGeoJson);

export default router;
