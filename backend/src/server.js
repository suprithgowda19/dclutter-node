import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDB, disconnectDB } from "./config/db.js";
import apiRoutes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errormiddleware.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

// Initialize database
await connectDB();

const app = express();

// Trust reverse proxy (needed for accurate IP rate limiting behind Nginx/Cloudflare/AWS ALB)
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// 1. Security Headers
app.use(helmet());

// 2. Production-safe CORS Configuration
const allowedOrigins = [
  env.CLIENT_URL,
  ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()) : []),
  // Development origins for web and mobile expo bundlers
  ...(env.NODE_ENV === "development"
    ? ["http://localhost:5173", "http://localhost:3000", "http://localhost:8081"]
    : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  })
);

// 3. Response Compression
app.use(compression());

// 4. Request Logging with Request IDs
app.use(requestLogger);

// 5. Body Parsing
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 6. Global Rate Limiter for API
app.use("/api", apiLimiter);

// 7. Central API Routes
app.use("/api", apiRoutes);

// Root Health / Info endpoint
app.get("/", (req, res) => {
  res.json({
    name: "DClutter API",
    status: "Healthy",
    version: "1.0.0",
    environment: env.NODE_ENV,
  });
});

// 8. Error Handlers
app.use(notFound);
app.use(errorHandler);

// 9. Server Initialization & Graceful Teardown
const server = app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

server.on("close", () => {
  logger.info("Http server 'close' event fired");
});

server.on("error", (err) => {
  logger.error({ err }, "Http server fatal error");
  process.exit(1);
});

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received: closing HTTP server gracefully...`);
  server.close(async () => {
    logger.info("HTTP server closed.");
    try {
      await disconnectDB();
      logger.info("Database connection closed.");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "Error during database disconnection");
      process.exit(1);
    }
  });

  // Force shutdown after 10s timeout
  setTimeout(() => {
    logger.error("Forcing server shutdown after timeout");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  logger.error({ err }, "Unhandled Promise Rejection");
  gracefulShutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught Exception");
  gracefulShutdown("uncaughtException");
});

export default app;
