import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { sql } from "kysely";
import { corsAllowedOrigins } from "./env.js";
import { logger } from "./logger.js";
import { db } from "./db/index.js";
import { errorHandler } from "./middleware/index.js";
import {
  auth,
  contact,
  photos,
  publicRoute,
  shots,
  slider,
  work,
} from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: corsAllowedOrigins.length ? corsAllowedOrigins : false,
      credentials: true,
      allowedHeaders: [
        "x-access-token",
        "Origin",
        "Content-Type",
        "Accept",
        "Authorization",
        "domain",
      ],
    }),
  );
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  // Liveness/readiness — pings the DB pool.
  app.get("/health", async (_req, res) => {
    try {
      await sql`select 1`.execute(db);
      res.status(200).json({ status: "ok" });
    } catch {
      res.status(503).json({ status: "degraded" });
    }
  });

  app.use("/public", publicRoute);
  for (const route of [auth, work, contact, shots, photos, slider]) {
    app.use("/api/v1", route);
  }

  app.use((_req, res) => {
    res.status(404).send({ message: "Not Found" });
  });

  app.use(errorHandler);

  return app;
}
