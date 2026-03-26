import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_URL: z.url().default("http://127.0.0.1:3000"),
  COLLAB_URL: z.url().default("ws://127.0.0.1:3001"),
  PORT: z.coerce.number().default(3000),
  COLLAB_PORT: z.coerce.number().default(3001),
  DATABASE_PATH: z.string().default("./data/app.db"),
  JWT_SECRET: z.string().min(32).default("change-me-in-development-only-32chars"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  ADMIN_EMAIL: z.email().default("admin@example.com"),
  UPLOAD_DIR: z.string().default("./storage/uploads"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(120),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  APP_URL: process.env.APP_URL,
  COLLAB_URL: process.env.COLLAB_URL,
  PORT: process.env.PORT,
  COLLAB_PORT: process.env.COLLAB_PORT,
  DATABASE_PATH: process.env.DATABASE_PATH,
  JWT_SECRET: process.env.JWT_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
});

export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
