import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters long"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  ALLOWED_ORIGINS: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables detected at startup:");
    const errors = result.error.format();
    for (const [key, value] of Object.entries(errors)) {
      if (key !== "_errors" && value?._errors?.length) {
        console.error(`   - ${key}: ${value._errors.join(", ")}`);
      }
    }
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
