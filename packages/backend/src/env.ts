import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

// 12-factor config: a single DATABASE_URL plus explicit secrets.
// Replaces the old IS_PROD flag that toggled DB_PROD_*/DB_LOCAL_* var sets.
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8090),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  SECRET: z.string().min(8, "SECRET must be at least 8 chars"),
  JWT_EXPIRATION: z.coerce.number().int().positive().default(3600),
  JWT_REFRESH_EXPIRATION: z.coerce.number().int().positive().default(86400),

  // Comma-separated allowlist; empty => reject all cross-origin requests.
  CORS_ALLOWED_ORIGINS: z.string().default(""),

  // Public base used to build absolute image URLs returned to the FE.
  PUBLIC_BASE_URL: z.string().default(""),

  // Object storage (S3-compatible). Unset => fall back to local disk.
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("auto"),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast at boot with a readable message — never start half-configured.
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;

export const corsAllowedOrigins = env.CORS_ALLOWED_ORIGINS
  ? env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

// Whether S3 object storage is fully configured; otherwise use local disk.
export const isS3Enabled = Boolean(
  env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY,
);
