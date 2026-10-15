import { prisma } from "../config/db.js";

// Standard Ray-casting algorithm to test if a point (lng, lat) is inside a polygon ring
function pointInPolygonRing(pt, ring) {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Test if point is inside GeoJSON geometry (Polygon or MultiPolygon)
function isPointInGeoJson(lng, lat, geojson) {
  if (!geojson || !geojson.type || !geojson.coordinates) return false;

  const pt = [lng, lat];

  if (geojson.type === "Polygon") {
    // coordinates: [outerRing, ...holeRings]
    const rings = geojson.coordinates;
    if (!rings.length) return false;

    // Must be inside outer ring
    if (!pointInPolygonRing(pt, rings[0])) return false;

    // Must NOT be inside any hole ring
    for (let i = 1; i < rings.length; i++) {
      if (pointInPolygonRing(pt, rings[i])) return false;
    }
    return true;
  }

  if (geojson.type === "MultiPolygon") {
    // coordinates: [ [outerRing, ...holeRings], ... ]
    for (const poly of geojson.coordinates) {
      if (!poly.length) continue;
      if (pointInPolygonRing(pt, poly[0])) {
        let inHole = false;
        for (let i = 1; i < poly.length; i++) {
          if (pointInPolygonRing(pt, poly[i])) {
            inHole = true;
            break;
          }
        }
        if (!inHole) return true;
      }
    }
    return false;
  }

  return false;
}

const CORP_COLORS = {
  1: "#2563eb", // Central (Blue)
  2: "#10b981", // East (Green)
  3: "#f59e0b", // North (Orange)
  4: "#8b5cf6", // West (Purple)
  5: "#ec4899", // South (Pink)
};

export class GeoService {
  /**
   * Fetch all corporations with constituencies count
   */
  static async getCorporations() {
    return prisma.corporation.findMany({
      include: {
        _count: {
          select: { constituencies: true },
        },
      },
      orderBy: { id: "asc" },
    });
  }

  /**
   * Fetch constituencies, optionally filtered by corporation
   */
  static async getConstituencies(corporationId) {
    const where = corporationId ? { corporationId: Number(corporationId) } : {};

    return prisma.constituency.findMany({
      where,
      include: {
        corporation: {
          select: { id: true, name: true, nameKn: true },
        },
        _count: {
          select: { wards: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Fetch wards list (lightweight, excludes heavy GeoJSON boundary for performance)
   */
  static async getWards({ constituencyId, corporationId }) {
    const where = {};

    if (constituencyId) {
      where.constituencyId = Number(constituencyId);
    } else if (corporationId) {
      where.constituency = {
        corporationId: Number(corporationId),
      };
    }

    return prisma.ward.findMany({
      where,
      select: {
        id: true,
        wardNumber: true,
        name: true,
        nameKn: true,
        constituencyId: true,
        constituency: {
          select: {
            id: true,
            name: true,
            corporation: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [{ wardNumber: "asc" }, { name: "asc" }],
    });
  }

  /**
   * Fetch a single ward by ID, including its boundary polygon
   */
  static async getWardById(id) {
    const ward = await prisma.ward.findUnique({
      where: { id: Number(id) },
      include: {
        constituency: {
          include: {
            corporation: true,
          },
        },
      },
    });

    if (!ward) {
      const error = new Error(`Ward with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    let parsedBoundary = null;
    if (ward.boundry) {
      try {
        parsedBoundary = JSON.parse(ward.boundry);
      } catch {
        parsedBoundary = null;
      }
    }

    return {
      ...ward,
      boundaryGeoJson: parsedBoundary,
    };
  }

  /**
   * Spatial reverse-geocoding: Match coordinates (lat, lng) to Ward polygon
   */
  static async lookupWardByCoords(lat, lng) {
    const numLat = Number(lat);
    const numLng = Number(lng);

    // Fetch all wards that have boundary polygons
    const wards = await prisma.ward.findMany({
      where: {
        boundry: { not: null },
      },
      select: {
        id: true,
        wardNumber: true,
        name: true,
        nameKn: true,
        boundry: true,
        constituency: {
          select: {
            id: true,
            name: true,
            corporation: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // 1. Exact Point-in-Polygon search
    for (const ward of wards) {
      try {
        const geojson = JSON.parse(ward.boundry);
        if (isPointInGeoJson(numLng, numLat, geojson)) {
          return {
            matched: true,
            wardId: ward.id,
            wardNumber: ward.wardNumber,
            wardName: ward.wardNumber ? `Ward ${ward.wardNumber} - ${ward.name}` : ward.name,
            constituencyId: ward.constituency?.id,
            constituencyName: ward.constituency?.name,
            corporationId: ward.constituency?.corporation?.id,
            corporationName: ward.constituency?.corporation?.name,
          };
        }
      } catch {
        continue;
      }
    }

    // 2. Fallback to first available ward if outside Bengaluru boundaries
    const defaultWard = wards[0];
    return {
      matched: false,
      wardId: defaultWard?.id,
      wardNumber: defaultWard?.wardNumber,
      wardName: defaultWard?.name,
      constituencyId: defaultWard?.constituency?.id,
      constituencyName: defaultWard?.constituency?.name,
      corporationId: defaultWard?.constituency?.corporation?.id,
      corporationName: defaultWard?.constituency?.corporation?.name,
      note: "Coordinates outside mapped polygon boundaries, fallback assigned.",
    };
  }

  /**
   * Ultra-fast GIS Map endpoint: Return GeoJSON FeatureCollection of all Ward boundaries
   */
  static async getWardsGeoJson({ corporationId, constituencyId }) {
    const where = {
      boundry: { not: null },
    };

    if (constituencyId) {
      where.constituencyId = Number(constituencyId);
    } else if (corporationId) {
      where.constituency = {
        corporationId: Number(corporationId),
      };
    }

    const wards = await prisma.ward.findMany({
      where,
      select: {
        id: true,
        name: true,
        wardNumber: true,
        boundry: true,
        constituency: {
          select: {
            id: true,
            name: true,
            corporationId: true,
            corporation: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const features = [];
    for (const w of wards) {
      if (!w.boundry) continue;

      try {
        const geometry = JSON.parse(w.boundry);
        const corpId = w.constituency?.corporationId;
        const color = CORP_COLORS[corpId] || "#64748b";

        features.push({
          type: "Feature",
          properties: {
            id: w.id,
            name: w.name,
            ward_number: w.wardNumber ? String(w.wardNumber) : "",
            constituency: w.constituency?.name || "N/A",
            constituency_id: w.constituency?.id || null,
            corporation: w.constituency?.corporation?.name || "N/A",
            corporation_id: corpId || null,
            color,
          },
          geometry,
        });
      } catch {
        continue;
      }
    }

    return {
      type: "FeatureCollection",
      features,
    };
  }
}
