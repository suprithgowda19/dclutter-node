import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  if (statusCode >= 500) {
    logger.error(
      {
        err: {
          message: err.message,
          stack: err.stack,
        },
        path: req.originalUrl,
        method: req.method,
      },
      "Server error encountered"
    );
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
