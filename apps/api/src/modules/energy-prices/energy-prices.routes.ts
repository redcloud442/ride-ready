import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../plugins/auth.ts";
import { energyPricesController } from "./energy-prices.controller.ts";
import {
  energyPriceQuerySchema,
  submitEnergyPriceSchema,
  type EnergyPriceQuery,
  type SubmitEnergyPriceInput,
} from "./energy-prices.schema.ts";

export async function energyPricesRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  app.get<{ Querystring: EnergyPriceQuery }>(
    "/",
    { schema: { querystring: energyPriceQuerySchema } },
    energyPricesController.list,
  );
  app.post<{ Body: SubmitEnergyPriceInput }>(
    "/",
    {
      schema: { body: submitEnergyPriceSchema },
      config: { rateLimit: { max: 10, timeWindow: "1 hour" } }, // community input: keep spam cheap to absorb
    },
    energyPricesController.submit,
  );
}
