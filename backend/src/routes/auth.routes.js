import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateMe,
  changePassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/authmiddleware.js";
import { validate } from "../middleware/validatorRequest.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";

const router = express.Router();

// Public routes (rate limited)
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);

// Protected routes (require valid JWT)
router.get("/me", protect, getMe);
router.patch("/me", protect, validate(updateProfileSchema), updateMe);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);

export default router;
