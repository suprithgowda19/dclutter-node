import prisma from "../../config/db.js";
import { applyGeoScope } from "../../utils/geoScope.util.js";

/**
 * Helper to validate plant payload for store & update
 */
function validatePlantPayload(body, isUpdate = false) {
  const { name, corporationId, constituencyId, address, latitude, longitude, status } = body;
  const errors = [];
  const data = {};

  // Name validation
  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== "string" || !name.trim()) {
      errors.push("Plant name is required");
    } else {
      data.name = name.trim();
    }
  }

  // Corporation validation
  if (!isUpdate || corporationId !== undefined) {
    const parsedCorpId = parseInt(corporationId, 10);
    if (!corporationId || isNaN(parsedCorpId)) {
      errors.push("Valid corporationId is required");
    } else {
      data.corporationId = parsedCorpId;
    }
  }

  // Constituency validation
  if (!isUpdate || constituencyId !== undefined) {
    const parsedConId = parseInt(constituencyId, 10);
    if (!constituencyId || isNaN(parsedConId)) {
      errors.push("Valid constituencyId is required");
    } else {
      data.constituencyId = parsedConId;
    }
  }

  // Address
  if (address !== undefined) {
    data.address = address ? address.trim() : null;
  } else if (!isUpdate) {
    if (!address || typeof address !== "string" || !address.trim()) {
      errors.push("Plant address is required");
    } else {
      data.address = address.trim();
    }
  }

  // Coordinates (Optional / Numeric)
  if (latitude !== undefined && latitude !== null && latitude !== "") {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push("Latitude must be a valid number between -90 and 90");
    } else {
      data.latitude = lat;
    }
  }

  if (longitude !== undefined && longitude !== null && longitude !== "") {
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push("Longitude must be a valid number between -180 and 180");
    } else {
      data.longitude = lng;
    }
  }

  // Status
  if (status !== undefined) {
    data.status = Boolean(status);
  }

  return { errors, data };
}

/**
 * Admin Plant Resource Controller
 * Direct Prisma queries with shared inline validation helper
 */
class PlantController {
  // GET /api/admin/plants (and public /api/plants)
  index = async (req, res, next) => {
    try {
      const { corporationId, constituencyId, status, search } = req.query;

      const where = {};

      if (status === "active") where.status = true;
      if (status === "inactive") where.status = false;

      if (corporationId) {
        const parsedCorp = parseInt(corporationId, 10);
        if (!isNaN(parsedCorp)) where.corporationId = parsedCorp;
      }

      if (constituencyId) {
        const parsedCon = parseInt(constituencyId, 10);
        if (!isNaN(parsedCon)) where.constituencyId = parsedCon;
      }

      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { name: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
        ];
      }

      const scopedWhere = applyGeoScope(req.user, where, "plant");

      const plants = await prisma.plant.findMany({
        where: scopedWhere,
        include: {
          corporation: {
            select: { id: true, name: true },
          },
          constituency: {
            select: { id: true, name: true },
          },
        },
        orderBy: { id: "asc" },
      });

      return res.status(200).json({
        success: true,
        count: plants.length,
        data: plants,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/admin/plants/:id
  show = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid plant ID" });
      }

      const plant = await prisma.plant.findUnique({
        where: { id },
        include: {
          corporation: {
            select: { id: true, name: true },
          },
          constituency: {
            select: { id: true, name: true },
          },
        },
      });

      if (!plant) {
        return res.status(404).json({ success: false, message: "Plant not found" });
      }

      return res.status(200).json({
        success: true,
        data: plant,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/admin/plants
  store = async (req, res, next) => {
    try {
      const { errors, data } = validatePlantPayload(req.body, false);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: errors[0],
          errors,
        });
      }

      // Verify foreign key targets exist
      const corp = await prisma.corporation.findUnique({ where: { id: data.corporationId } });
      if (!corp) {
        return res.status(404).json({
          success: false,
          message: `Corporation with ID ${data.corporationId} does not exist`,
        });
      }

      const con = await prisma.constituency.findUnique({ where: { id: data.constituencyId } });
      if (!con) {
        return res.status(404).json({
          success: false,
          message: `Constituency with ID ${data.constituencyId} does not exist`,
        });
      }

      if (data.status === undefined) {
        data.status = true;
      }

      const plant = await prisma.plant.create({
        data,
        include: {
          corporation: { select: { id: true, name: true } },
          constituency: { select: { id: true, name: true } },
        },
      });

      return res.status(201).json({
        success: true,
        message: "Plant created successfully",
        data: plant,
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/admin/plants/:id
  update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid plant ID" });
      }

      const { errors, data } = validatePlantPayload(req.body, true);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: errors[0],
          errors,
        });
      }

      // Check foreign keys if updated
      if (data.corporationId) {
        const corp = await prisma.corporation.findUnique({ where: { id: data.corporationId } });
        if (!corp) {
          return res.status(404).json({
            success: false,
            message: `Corporation with ID ${data.corporationId} does not exist`,
          });
        }
      }

      if (data.constituencyId) {
        const con = await prisma.constituency.findUnique({ where: { id: data.constituencyId } });
        if (!con) {
          return res.status(404).json({
            success: false,
            message: `Constituency with ID ${data.constituencyId} does not exist`,
          });
        }
      }

      const plant = await prisma.plant.update({
        where: { id },
        data,
        include: {
          corporation: { select: { id: true, name: true } },
          constituency: { select: { id: true, name: true } },
        },
      });

      return res.status(200).json({
        success: true,
        message: "Plant updated successfully",
        data: plant,
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ success: false, message: "Plant not found" });
      }
      next(error);
    }
  };

  // DELETE /api/admin/plants/:id
  destroy = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid plant ID" });
      }

      await prisma.plant.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Plant deleted successfully",
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ success: false, message: "Plant not found" });
      }
      next(error);
    }
  };

  // PATCH /api/admin/plants/:id/toggle-status
  toggleStatus = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid plant ID" });
      }

      const existing = await prisma.plant.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: "Plant not found" });
      }

      const updated = await prisma.plant.update({
        where: { id },
        data: { status: !existing.status },
      });

      return res.status(200).json({
        success: true,
        message: `Plant is now ${updated.status ? "Active" : "Inactive"}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new PlantController();
