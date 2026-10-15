import prisma from "../../config/db.js";

/**
 * Admin Category Resource Controller
 * Direct Prisma queries with inline validation
 */
class CategoryController {
  // GET /api/admin/categories (or public /api/categories)
  index = async (req, res, next) => {
    try {
      const { status } = req.query;

      const where = {};
      if (status === "active") where.status = true;
      if (status === "inactive") where.status = false;

      const categories = await prisma.category.findMany({
        where,
        include: {
          subcategories: {
            orderBy: { id: "asc" },
          },
        },
        orderBy: { id: "asc" },
      });

      return res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/admin/categories/:id
  show = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid category ID" });
      }

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          subcategories: {
            orderBy: { id: "asc" },
          },
        },
      });

      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/admin/categories
  store = async (req, res, next) => {
    try {
      const { name, icon } = req.body;

      // Inline validation
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      const trimmedName = name.trim();

      // Check duplicate
      const existing = await prisma.category.findUnique({
        where: { name: trimmedName },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Category with name '${trimmedName}' already exists`,
        });
      }

      const category = await prisma.category.create({
        data: {
          name: trimmedName,
          icon: icon ? icon.trim() : null,
          status: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/admin/categories/:id
  update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid category ID" });
      }

      const { name, icon } = req.body;
      const data = {};

      if (name !== undefined) {
        if (!name || typeof name !== "string" || !name.trim()) {
          return res.status(400).json({
            success: false,
            message: "Category name cannot be empty",
          });
        }
        data.name = name.trim();
      }

      if (icon !== undefined) {
        data.icon = icon ? icon.trim() : null;
      }

      const category = await prisma.category.update({
        where: { id },
        data,
      });

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
      if (error.code === "P2002") {
        return res.status(409).json({ success: false, message: "Category name already exists" });
      }
      next(error);
    }
  };

  // DELETE /api/admin/categories/:id
  destroy = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid category ID" });
      }

      await prisma.category.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
      next(error);
    }
  };

  // PATCH /api/admin/categories/:id/toggle-status
  toggleStatus = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid category ID" });
      }

      const existing = await prisma.category.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }

      const updated = await prisma.category.update({
        where: { id },
        data: { status: !existing.status },
      });

      return res.status(200).json({
        success: true,
        message: `Category is now ${updated.status ? "Active" : "Inactive"}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new CategoryController();
