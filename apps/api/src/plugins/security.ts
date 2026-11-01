import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.ts";

// Registered on the root instance (not encapsulated) so every route, including /api/auth/*, is covered.
export async function registerSecurity(app: FastifyInstance) {
  await app.register(helmet);
  // Native apps send no Origin header, so CORS only matters for browser clients listed in CORS_ORIGINS.
  await app.register(cors, {
    origin: env.corsOrigins.length ? env.corsOrigins : false,
    credentials: true,
  });
  // shortcut: in-memory per-IP limit, per instance; move to the Redis store when the API runs >1 replica.
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
}
