import prisma from "../../config/db.js";

/**
 * Admin Subcategory Resource Controller
 * Direct Prisma queries with inline validation
 */
class SubcategoryController {
  // GET /api/admin/subcategories
  index = async (req, res, next) => {
    try {
      const { categoryId, status } = req.query;

      const where = {};
      if (categoryId) {
        const parsedCatId = parseInt(categoryId, 10);
        if (!isNaN(parsedCatId)) where.categoryId = parsedCatId;
      }
      if (status === "active") where.status = true;
      if (status === "inactive") where.status = false;

      const subcategories = await prisma.subcategory.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: { id: "asc" },
      });

      return res.status(200).json({
        success: true,
        count: subcategories.length,
        data: subcategories,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/admin/subcategories/:id
  show = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
      }

      const subcategory = await prisma.subcategory.findUnique({
        where: { id },
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
      });

      if (!subcategory) {
        return res.status(404).json({ success: false, message: "Subcategory not found" });
      }

      return res.status(200).json({
        success: true,
        data: subcategory,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/admin/subcategories
  store = async (req, res, next) => {
    try {
      const { categoryId, name, icon } = req.body;

      // Inline validation
      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: "categoryId is required",
        });
      }

      const parsedCatId = parseInt(categoryId, 10);
      if (isNaN(parsedCatId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId",
        });
      }

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Subcategory name is required",
        });
      }

      // Check category exists
      const category = await prisma.category.findUnique({
        where: { id: parsedCatId },
      });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Category with ID ${parsedCatId} not found`,
        });
      }

      const subcategory = await prisma.subcategory.create({
        data: {
          categoryId: parsedCatId,
          name: name.trim(),
          icon: icon ? icon.trim() : null,
          status: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Subcategory created successfully",
        data: subcategory,
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/admin/subcategories/:id
  update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
      }

      const { name, icon, categoryId } = req.body;
      const data = {};

      if (name !== undefined) {
        if (!name || typeof name !== "string" || !name.trim()) {
          return res.status(400).json({
            success: false,
            message: "Subcategory name cannot be empty",
          });
        }
        data.name = name.trim();
      }

      if (icon !== undefined) {
        data.icon = icon ? icon.trim() : null;
      }

      if (categoryId !== undefined) {
        const parsedCatId = parseInt(categoryId, 10);
        if (isNaN(parsedCatId)) {
          return res.status(400).json({ success: false, message: "Invalid categoryId" });
        }
        data.categoryId = parsedCatId;
      }

      const subcategory = await prisma.subcategory.update({
        where: { id },
        data,
      });

      return res.status(200).json({
        success: true,
        message: "Subcategory updated successfully",
        data: subcategory,
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ success: false, message: "Subcategory not found" });
      }
      next(error);
    }
  };

  // DELETE /api/admin/subcategories/:id
  destroy = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
      }

      await prisma.subcategory.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Subcategory deleted successfully",
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ success: false, message: "Subcategory not found" });
      }
      next(error);
    }
  };

  // PATCH /api/admin/subcategories/:id/toggle-status
  toggleStatus = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
      }

      const existing = await prisma.subcategory.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: "Subcategory not found" });
      }

      const updated = await prisma.subcategory.update({
        where: { id },
        data: { status: !existing.status },
      });

      return res.status(200).json({
        success: true,
        message: `Subcategory is now ${updated.status ? "Active" : "Inactive"}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new SubcategoryController();
