import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
import { applyGeoScope } from "../../utils/geoScope.util.js";

/**
 * Normalizes vehicle number by removing spaces, dashes, and converting to uppercase.
 * Example: "KA-01-AB-1234" -> "KA01AB1234"
 */
function normalizePlate(plate) {
  if (!plate || typeof plate !== "string") return "";
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Shared validation helper for vehicle payload
 */
function validateVehiclePayload(body, isUpdate = false) {
  const {
    vehicleNumber,
    constituencyIds,
    vehicleType,
    capacity,
    driverName,
    driverPhone,
    licenseNumber,
    driverEmail,
    defaultPassword,
    vehiclePhoto,
    rcDocument,
    fitnessDocument,
    insuranceDocument,
    licensePhoto,
    status,
  } = body;

  const errors = [];
  const data = {};

  // Vehicle Number
  if (!isUpdate || vehicleNumber !== undefined) {
    if (!vehicleNumber || typeof vehicleNumber !== "string" || !vehicleNumber.trim()) {
      errors.push("Vehicle registration number is required");
    } else {
      data.vehicleNumber = vehicleNumber.trim().toUpperCase();
      data.normalizedNumber = normalizePlate(vehicleNumber);
    }
  }

  // Constituency IDs (Array of Integers)
  if (!isUpdate || constituencyIds !== undefined) {
    if (!Array.isArray(constituencyIds) || constituencyIds.length === 0) {
      errors.push("At least one operating constituency ID is required");
    } else {
      const parsedIds = constituencyIds
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (parsedIds.length === 0) {
        errors.push("Invalid constituency IDs");
      } else {
        data.constituencyIds = parsedIds;
      }
    }
  }

  // Vehicle Type
  if (!isUpdate || vehicleType !== undefined) {
    if (!vehicleType || typeof vehicleType !== "string" || !vehicleType.trim()) {
      errors.push("Vehicle type is required (e.g. Tipper, Compactor, Mini Truck)");
    } else {
      data.vehicleType = vehicleType.trim();
    }
  }

  // Capacity in Tons (Convert kg to tons if entered > 50)
  if (!isUpdate || capacity !== undefined) {
    const parsedCap = parseFloat(capacity);
    if (isNaN(parsedCap) || parsedCap <= 0) {
      errors.push("Valid capacity is required");
    } else {
      data.capacityTons = parsedCap > 50 ? parseFloat((parsedCap / 1000).toFixed(2)) : parsedCap;
    }
  }

  // Driver Name
  if (!isUpdate || driverName !== undefined) {
    if (!driverName || typeof driverName !== "string" || !driverName.trim()) {
      errors.push("Driver name is required");
    } else {
      data.driverName = driverName.trim();
    }
  }

  // Driver Phone (10 digits)
  if (!isUpdate || driverPhone !== undefined) {
    const phoneRegex = /^[0-9]{10}$/;
    if (!driverPhone || !phoneRegex.test(String(driverPhone).trim())) {
      errors.push("Driver phone must be a valid 10-digit number");
    } else {
      data.driverPhone = String(driverPhone).trim();
    }
  }

  // License Number
  if (!isUpdate || licenseNumber !== undefined) {
    if (!licenseNumber || typeof licenseNumber !== "string" || !licenseNumber.trim()) {
      errors.push("Driver license number is required");
    } else {
      data.licenseNumber = licenseNumber.trim().toUpperCase();
    }
  }

  // Optional Documents / URLs
  if (vehiclePhoto !== undefined) data.vehiclePhoto = vehiclePhoto || null;
  if (rcDocument !== undefined) data.rcDocument = rcDocument || null;
  if (fitnessDocument !== undefined) data.fitnessDocument = fitnessDocument || null;
  if (insuranceDocument !== undefined) data.insuranceDocument = insuranceDocument || null;
  if (licensePhoto !== undefined) data.licensePhoto = licensePhoto || null;

  if (status !== undefined) {
    data.status = Boolean(status);
  }

  return { errors, data, driverEmail, defaultPassword };
}

/**
 * Admin Vehicle Resource Controller
 */
class AdminVehicleController {
  // GET /api/admin/vehicles
  index = async (req, res, next) => {
    try {
      const { search, constituencyId, status } = req.query;

      const where = {};

      if (status === "active") where.status = true;
      if (status === "inactive") where.status = false;

      if (constituencyId) {
        const parsedId = parseInt(constituencyId, 10);
        if (!isNaN(parsedId)) {
          where.constituencyIds = { has: parsedId };
        }
      }

      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { vehicleNumber: { contains: query, mode: "insensitive" } },
          { driverName: { contains: query, mode: "insensitive" } },
          { driverPhone: { contains: query } },
          { licenseNumber: { contains: query, mode: "insensitive" } },
        ];
      }

      // Apply jurisdiction scoping
      const scopedWhere = applyGeoScope(req.user, where, "vehicle");

      const vehicles = await prisma.vehicle.findMany({
        where: scopedWhere,
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true, role: true },
          },
        },
        orderBy: { id: "asc" },
      });

      return res.status(200).json({
        success: true,
        count: vehicles.length,
        data: vehicles,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/admin/vehicles/:id
  show = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid vehicle ID" });
      }

      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true, role: true },
          },
        },
      });

      if (!vehicle) {
        return res.status(404).json({ success: false, message: "Vehicle not found" });
      }

      return res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/admin/vehicles
  store = async (req, res, next) => {
    try {
      const { errors, data, driverEmail, defaultPassword } = validateVehiclePayload(req.body, false);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: errors[0],
          errors,
        });
      }

      // 1. Check duplicate normalized registration plate
      const existingPlate = await prisma.vehicle.findUnique({
        where: { normalizedNumber: data.normalizedNumber },
      });
      if (existingPlate) {
        return res.status(409).json({
          success: false,
          message: `A vehicle with registration number '${existingPlate.vehicleNumber}' already exists`,
        });
      }

      // 2. Check duplicate driver phone or license
      const existingPhone = await prisma.vehicle.findUnique({
        where: { driverPhone: data.driverPhone },
      });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: `Driver phone number '${data.driverPhone}' is already registered with vehicle '${existingPhone.vehicleNumber}'`,
        });
      }

      const existingLicense = await prisma.vehicle.findUnique({
        where: { licenseNumber: data.licenseNumber },
      });
      if (existingLicense) {
        return res.status(409).json({
          success: false,
          message: `License number '${data.licenseNumber}' is already registered with vehicle '${existingLicense.vehicleNumber}'`,
        });
      }

      // 3. Provision or link User Account for Driver in `users` table
      let driverUser = await prisma.user.findFirst({
        where: { phone: data.driverPhone },
      });

      const rawPassword = defaultPassword || "1234";
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const email = driverEmail && typeof driverEmail === "string" && driverEmail.trim() ? driverEmail.trim() : null;

      if (!driverUser) {
        driverUser = await prisma.user.create({
          data: {
            name: data.driverName,
            phone: data.driverPhone,
            email,
            password: hashedPassword,
            role: "VEHICLE",
            constituencyIds: data.constituencyIds,
          },
        });
      } else {
        // Update user to have VEHICLE role and assigned constituencies
        driverUser = await prisma.user.update({
          where: { id: driverUser.id },
          data: {
            role: "VEHICLE",
            constituencyIds: Array.from(new Set([...(driverUser.constituencyIds || []), ...data.constituencyIds])),
          },
        });
      }

      // 4. Create Vehicle record linked to driver user
      data.userId = driverUser.id;

      const vehicle = await prisma.vehicle.create({
        data,
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true, role: true },
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: "Vehicle registered successfully and driver login account provisioned",
        data: {
          ...vehicle,
          driverLoginCredentials: {
            phone: data.driverPhone,
            defaultPassword: rawPassword,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/admin/vehicles/:id
  update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid vehicle ID" });
      }

      const existing = await prisma.vehicle.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: "Vehicle not found" });
      }

      const { errors, data } = validateVehiclePayload(req.body, true);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: errors[0],
          errors,
        });
      }

      // Check normalized plate uniqueness if changed
      if (data.normalizedNumber && data.normalizedNumber !== existing.normalizedNumber) {
        const duplicate = await prisma.vehicle.findUnique({
          where: { normalizedNumber: data.normalizedNumber },
        });
        if (duplicate && duplicate.id !== id) {
          return res.status(409).json({
            success: false,
            message: `A vehicle with registration number '${duplicate.vehicleNumber}' already exists`,
          });
        }
      }

      // Check phone uniqueness if changed
      if (data.driverPhone && data.driverPhone !== existing.driverPhone) {
        const dupPhone = await prisma.vehicle.findUnique({
          where: { driverPhone: data.driverPhone },
        });
        if (dupPhone && dupPhone.id !== id) {
          return res.status(409).json({
            success: false,
            message: `Driver phone number '${data.driverPhone}' is already in use`,
          });
        }
      }

      // Check license uniqueness if changed
      if (data.licenseNumber && data.licenseNumber !== existing.licenseNumber) {
        const dupLicense = await prisma.vehicle.findUnique({
          where: { licenseNumber: data.licenseNumber },
        });
        if (dupLicense && dupLicense.id !== id) {
          return res.status(409).json({
            success: false,
            message: `License number '${data.licenseNumber}' is already in use`,
          });
        }
      }

      const updatedVehicle = await prisma.vehicle.update({
        where: { id },
        data,
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true, role: true },
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: "Vehicle updated successfully",
        data: updatedVehicle,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/admin/vehicles/:id
  destroy = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid vehicle ID" });
      }

      await prisma.vehicle.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Vehicle removed successfully",
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ success: false, message: "Vehicle not found" });
      }
      next(error);
    }
  };

  // PATCH /api/admin/vehicles/:id/toggle-status
  toggleStatus = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid vehicle ID" });
      }

      const existing = await prisma.vehicle.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: "Vehicle not found" });
      }

      const updated = await prisma.vehicle.update({
        where: { id },
        data: { status: !existing.status },
      });

      return res.status(200).json({
        success: true,
        message: `Vehicle is now ${updated.status ? "Active" : "Inactive"}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AdminVehicleController();
