import type { FastifyReply, FastifyRequest } from "fastify";
import { currentUser } from "../../plugins/auth.ts";
import type { CreateVehicleInput, UpdateVehicleInput, VehicleParams } from "./vehicles.schema.ts";
import { vehiclesService } from "./vehicles.service.ts";

const notFound = (reply: FastifyReply) => reply.code(404).send({ error: "Vehicle not found" });

export const vehiclesController = {
  list(req: FastifyRequest) {
    return vehiclesService.listForUser(currentUser(req).id);
  },

  async get(req: FastifyRequest<{ Params: VehicleParams }>, reply: FastifyReply) {
    const vehicle = await vehiclesService.getForUser(currentUser(req).id, req.params.id);
    return vehicle ?? notFound(reply);
  },

  async create(req: FastifyRequest<{ Body: CreateVehicleInput }>, reply: FastifyReply) {
    const vehicle = await vehiclesService.create(currentUser(req).id, req.body);
    return reply.code(201).send(vehicle);
  },

  async update(
    req: FastifyRequest<{ Params: VehicleParams; Body: UpdateVehicleInput }>,
    reply: FastifyReply,
  ) {
    const vehicle = await vehiclesService.update(currentUser(req).id, req.params.id, req.body);
    return vehicle ?? notFound(reply);
  },

  async remove(req: FastifyRequest<{ Params: VehicleParams }>, reply: FastifyReply) {
    const removed = await vehiclesService.remove(currentUser(req).id, req.params.id);
    return removed ? reply.code(204).send() : notFound(reply);
  },
};
