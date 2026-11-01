import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../plugins/auth.ts";
import { requireVehicleAccess, vehicleOf } from "../../plugins/vehicle-records.ts";
import { statsQuerySchema, type StatsQuery } from "./stats.schema.ts";
import { statsService } from "./stats.service.ts";

export async function statsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);
  app.addHook("preHandler", requireVehicleAccess);

  app.get<{ Querystring: StatsQuery }>(
    "/",
    { schema: { params: z.object({ vehicleId: z.uuid() }), querystring: statsQuerySchema } },
    async (req) => {
      const { supportingRecords: _ids, ...stats } = await statsService.forVehicle(vehicleOf(req), req.query);
      return stats;
    },
  );
}
