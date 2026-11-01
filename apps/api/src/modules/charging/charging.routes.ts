import { usesCharging } from "@ride-ready/core";
import { recordRoutes } from "../../plugins/vehicle-records.ts";
import { createChargingSchema, updateChargingSchema } from "./charging.schema.ts";
import { chargingService } from "./charging.service.ts";

export const chargingRoutes = recordRoutes({
  label: "Charging session",
  service: chargingService,
  createSchema: createChargingSchema,
  updateSchema: updateChargingSchema,
  allowed: { check: usesCharging, error: "This vehicle doesn't charge from the grid" },
});
