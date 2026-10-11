import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { asyncHandler } from "./middleware/asyncHandler";
import { requireAuth } from "./middleware/requireAuth";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.set("trust proxy", 1);

// Seguridad: cabeceras estándar (X-Frame-Options, nosniff, etc.)
app.use(helmet({ contentSecurityPolicy: false }));

// CORS restringido a los orígenes permitidos por entorno
app.use(
  cors({
    origin: env.allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(compression());

// Limitador global por IP (protección contra abuso)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones. Intenta de nuevo más tarde." },
});
app.use("/api", globalLimiter);

// Límite más estricto en búsquedas (lectura pesada + consumible desde el frontend)
const searchLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiadas búsquedas. Intenta de nuevo en un momento." },
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get(
  "/health/db",
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "up" });
  })
);

app.use("/api/search", searchLimiter);
app.use("/api", requireAuth, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`ProductMapper backend escuchando en el puerto ${env.port}`);
});

// Cierre ordenado: Render envía SIGTERM en cada deploy o suspensión.
// Se deja de aceptar conexiones, se terminan las peticiones en curso y se
// liberan las conexiones del pooler de Supabase antes de salir.
let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} recibido, cerrando servidor...`);

  // Red de seguridad: si algo queda colgado, salir igualmente.
  setTimeout(() => {
    console.error("Cierre forzado por timeout");
    process.exit(1);
  }, 10_000).unref();

  server.close(async () => {
    try {
      await prisma.$disconnect();
    } finally {
      process.exit(0);
    }
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

export default app;
