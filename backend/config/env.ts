import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
// Fallback al .env en la raíz del monorepo (desarrollo local sin Docker)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatorio"),
  SUPABASE_URL: z.string().url("SUPABASE_URL debe ser una URL válida"),
  SUPABASE_JWT_AUDIENCE: z.string().default("authenticated"),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173")
    .describe("Orígenes permitidos separados por coma"),
});

const parsed = envSchema.parse(process.env);

export const env = {
  databaseUrl: parsed.DATABASE_URL,
  supabaseUrl: parsed.SUPABASE_URL.replace(/\/+$/, ""),
  supabaseJwtAudience: parsed.SUPABASE_JWT_AUDIENCE,
  port: parsed.PORT,
  nodeEnv: parsed.NODE_ENV,
  allowedOrigins: parsed.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};