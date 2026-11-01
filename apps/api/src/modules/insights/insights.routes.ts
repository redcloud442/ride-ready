import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../plugins/auth.ts";
import { listQuerySchema, requireVehicleAccess, vehicleOf, type ListQuery } from "../../plugins/vehicle-records.ts";
import { generateInsightSchema, type GenerateInsightInput } from "./insights.schema.ts";
import { insightsService } from "./insights.service.ts";

const params = z.object({ vehicleId: z.uuid() });

// Mounted at /api/vehicles/:vehicleId: GET|POST /insights. Text comes from core describeStats, no model.
export async function insightsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);
  app.addHook("preHandler", requireVehicleAccess);

  app.get<{ Querystring: ListQuery }>(
    "/insights",
    { schema: { params, querystring: listQuerySchema } },
    (req) => insightsService.list(vehicleOf(req).id, req.query),
  );
  app.post<{ Body: GenerateInsightInput }>(
    "/insights",
    { schema: { params, body: generateInsightSchema } },
    async (req, reply) => reply.code(201).send(await insightsService.generate(vehicleOf(req), req.body)),
  );
}
