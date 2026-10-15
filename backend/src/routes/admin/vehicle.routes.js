import express from "express";
import vehicleController from "../../controllers/admin/vehicle.controller.js";

const router = express.Router();

// Resource routes: /api/admin/vehicles
router
  .route("/")
  .get(vehicleController.index)
  .post(vehicleController.store);

router
  .route("/:id")
  .get(vehicleController.show)
  .patch(vehicleController.update)
  .delete(vehicleController.destroy);

router.patch("/:id/toggle-status", vehicleController.toggleStatus);

export default router;
