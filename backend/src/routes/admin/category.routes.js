import express from "express";
import categoryController from "../../controllers/admin/category.controller.js";

const router = express.Router();

// Resource routes: /api/admin/categories
router
  .route("/")
  .get(categoryController.index)
  .post(categoryController.store);

router
  .route("/:id")
  .get(categoryController.show)
  .patch(categoryController.update)
  .delete(categoryController.destroy);

router.patch("/:id/toggle-status", categoryController.toggleStatus);

export default router;
