import { recordRoutes } from "../../plugins/vehicle-records.ts";
import { createTripSchema, updateTripSchema } from "./trips.schema.ts";
import { tripsService } from "./trips.service.ts";

export const tripsRoutes = recordRoutes({
  label: "Trip",
  service: tripsService,
  createSchema: createTripSchema,
  updateSchema: updateTripSchema,
});
