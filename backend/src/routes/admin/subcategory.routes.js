import express from "express";
import subcategoryController from "../../controllers/admin/subcategory.controller.js";

const router = express.Router();

// Resource routes: /api/admin/subcategories
router
  .route("/")
  .get(subcategoryController.index)
  .post(subcategoryController.store);

router
  .route("/:id")
  .get(subcategoryController.show)
  .patch(subcategoryController.update)
  .delete(subcategoryController.destroy);

router.patch("/:id/toggle-status", subcategoryController.toggleStatus);

export default router;
