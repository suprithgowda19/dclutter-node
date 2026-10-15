import express from "express";
import { protect, authorize } from "../../middleware/authmiddleware.js";
import categoryRoutes from "./category.routes.js";
import subcategoryRoutes from "./subcategory.routes.js";
import plantRoutes from "./plant.routes.js";
import vehicleRoutes from "./vehicle.routes.js";

const router = express.Router();

// Enforce authentication & admin/official role for ALL admin sub-routes
router.use(protect, authorize("ADMIN", "OFFICIAL"));

// Mount admin resources
router.use("/categories", categoryRoutes);
router.use("/subcategories", subcategoryRoutes);
router.use("/plants", plantRoutes);
router.use("/vehicles", vehicleRoutes);

export default router;
