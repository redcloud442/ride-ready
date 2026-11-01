import { usesFuel } from "@ride-ready/core";
import { recordRoutes } from "../../plugins/vehicle-records.ts";
import { createFuelSchema, updateFuelSchema } from "./fuel.schema.ts";
import { fuelService } from "./fuel.service.ts";

export const fuelRoutes = recordRoutes({
  label: "Fuel transaction",
  service: fuelService,
  createSchema: createFuelSchema,
  updateSchema: updateFuelSchema,
  allowed: { check: usesFuel, error: "This vehicle doesn't use fuel" },
});
