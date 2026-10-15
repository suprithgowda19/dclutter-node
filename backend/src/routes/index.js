import express from "express";
import authRoutes from "./auth.routes.js";
import geoRoutes from "./geo.routes.js";
import adminRoutes from "./admin/index.js";
import categoryController from "../controllers/admin/category.controller.js";
import plantController from "../controllers/admin/plant.controller.js";

const router = express.Router();

// System Health
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Public Masters (Citizen / Vehicle App lookup)
router.get("/categories", categoryController.index);
router.get("/categories/:id", categoryController.show);
router.get("/plants", plantController.index);
router.get("/plants/:id", plantController.show);

// Authentication & Profile
router.use("/auth", authRoutes);

// Geographic Hierarchy & GIS
router.use("/geo", geoRoutes);

// ==========================================
// Modular Actor Portals
// ==========================================
router.use("/admin", adminRoutes);
// router.use("/citizen", citizenRoutes);
// router.use("/vehicle", vehicleRoutes);

export default router;
