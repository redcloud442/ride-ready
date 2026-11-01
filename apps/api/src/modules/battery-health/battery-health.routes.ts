import { recordRoutes } from "../../plugins/vehicle-records.ts";
import { createBatteryHealthSchema, updateBatteryHealthSchema } from "./battery-health.schema.ts";
import { batteryHealthService } from "./battery-health.service.ts";

export const batteryHealthRoutes = recordRoutes({
  label: "Battery health record",
  service: batteryHealthService,
  createSchema: createBatteryHealthSchema,
  updateSchema: updateBatteryHealthSchema,
  // traction batteries only; a 12 V starter battery isn't tracked here
  allowed: {
    check: (p) => p === "hybrid" || p === "phev" || p === "ev",
    error: "This vehicle has no traction battery",
  },
});
