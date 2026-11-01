import type { FastifyReply, FastifyRequest } from "fastify";
import type { EnergyPriceQuery, SubmitEnergyPriceInput } from "./energy-prices.schema.ts";
import { energyPricesService } from "./energy-prices.service.ts";

export const energyPricesController = {
  list(req: FastifyRequest<{ Querystring: EnergyPriceQuery }>) {
    return energyPricesService.list(req.query);
  },

  async submit(req: FastifyRequest<{ Body: SubmitEnergyPriceInput }>, reply: FastifyReply) {
    return reply.code(201).send(await energyPricesService.submit(req.body));
  },
};
