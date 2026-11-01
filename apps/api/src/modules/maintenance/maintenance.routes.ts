import { recordRoutes } from "../../plugins/vehicle-records.ts";
import { createMaintenanceSchema, updateMaintenanceSchema } from "./maintenance.schema.ts";
import { maintenanceService } from "./maintenance.service.ts";

export const maintenanceRoutes = recordRoutes({
  label: "Maintenance record",
  service: maintenanceService,
  createSchema: createMaintenanceSchema,
  updateSchema: updateMaintenanceSchema,
});
