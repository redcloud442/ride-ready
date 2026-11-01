import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../plugins/auth.ts";
import { vehiclesController } from "./vehicles.controller.ts";
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleParamsSchema,
  type CreateVehicleInput,
  type UpdateVehicleInput,
  type VehicleParams,
} from "./vehicles.schema.ts";

export async function vehiclesRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  app.get("/", vehiclesController.list);
  app.post<{ Body: CreateVehicleInput }>(
    "/",
    { schema: { body: createVehicleSchema } },
    vehiclesController.create,
  );
  app.get<{ Params: VehicleParams }>(
    "/:id",
    { schema: { params: vehicleParamsSchema } },
    vehiclesController.get,
  );
  app.patch<{ Params: VehicleParams; Body: UpdateVehicleInput }>(
    "/:id",
    { schema: { params: vehicleParamsSchema, body: updateVehicleSchema } },
    vehiclesController.update,
  );
  app.delete<{ Params: VehicleParams }>(
    "/:id",
    { schema: { params: vehicleParamsSchema } },
    vehiclesController.remove,
  );
}
