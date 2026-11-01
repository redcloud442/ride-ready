import { recordRoutes } from "../../plugins/vehicle-records.ts";
import { createOdometerSchema, updateOdometerSchema } from "./odometer.schema.ts";
import { odometerService } from "./odometer.service.ts";

export const odometerRoutes = recordRoutes({
  label: "Odometer reading",
  service: odometerService,
  createSchema: createOdometerSchema,
  updateSchema: updateOdometerSchema,
});
