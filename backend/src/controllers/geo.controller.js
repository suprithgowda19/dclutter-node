import { GeoService } from "../services/geo.service.js";

export const getCorporations = async (req, res, next) => {
  try {
    const corporations = await GeoService.getCorporations();
    return res.status(200).json({
      success: true,
      count: corporations.length,
      data: corporations,
    });
  } catch (error) {
    next(error);
  }
};

export const getConstituencies = async (req, res, next) => {
  try {
    const { corporationId } = req.query;
    const constituencies = await GeoService.getConstituencies(corporationId);
    return res.status(200).json({
      success: true,
      count: constituencies.length,
      data: constituencies,
    });
  } catch (error) {
    next(error);
  }
};

export const getWards = async (req, res, next) => {
  try {
    const { constituencyId, corporationId } = req.query;
    const wards = await GeoService.getWards({ constituencyId, corporationId });
    return res.status(200).json({
      success: true,
      count: wards.length,
      data: wards,
    });
  } catch (error) {
    next(error);
  }
};

export const getWardById = async (req, res, next) => {
  try {
    const ward = await GeoService.getWardById(req.params.id);
    return res.status(200).json({
      success: true,
      data: ward,
    });
  } catch (error) {
    next(error);
  }
};

export const lookupWard = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const result = await GeoService.lookupWardByCoords(lat, lng);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getWardsGeoJson = async (req, res, next) => {
  try {
    const { corporationId, constituencyId } = req.query;
    const geojson = await GeoService.getWardsGeoJson({ corporationId, constituencyId });

    // Cache header for ultra-fast CDN/browser caching like Laravel GisController
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).json(geojson);
  } catch (error) {
    next(error);
  }
};
