import express from "express";
import plantController from "../../controllers/admin/plant.controller.js";

const router = express.Router();

// Resource routes: /api/admin/plants
router
  .route("/")
  .get(plantController.index)
  .post(plantController.store);

router
  .route("/:id")
  .get(plantController.show)
  .patch(plantController.update)
  .delete(plantController.destroy);

router.patch("/:id/toggle-status", plantController.toggleStatus);

export default router;
