import Fastify, { type FastifyError } from "fastify";
import type { ZodType } from "zod";
import { batteryHealthRoutes } from "./modules/battery-health/battery-health.routes.ts";
import { chargingRoutes } from "./modules/charging/charging.routes.ts";
import { documentsRoutes } from "./modules/documents/documents.routes.ts";
import { energyPricesRoutes } from "./modules/energy-prices/energy-prices.routes.ts";
import { expensesRoutes } from "./modules/expenses/expenses.routes.ts";
import { fuelRoutes } from "./modules/fuel/fuel.routes.ts";
import { healthRoutes } from "./modules/health/health.routes.ts";
import { insightsRoutes } from "./modules/insights/insights.routes.ts";
import { maintenanceRoutes } from "./modules/maintenance/maintenance.routes.ts";
import { odometerRoutes } from "./modules/odometer/odometer.routes.ts";
import { onboardingRoutes } from "./modules/onboarding/onboarding.routes.ts";
import { profileRoutes } from "./modules/profile/profile.routes.ts";
import { statsRoutes } from "./modules/stats/stats.routes.ts";
import { transferLinkRoutes, transfersRoutes } from "./modules/transfers/transfers.routes.ts";
import { tripsRoutes } from "./modules/trips/trips.routes.ts";
import { vehiclesRoutes } from "./modules/vehicles/vehicles.routes.ts";
import { authRoutes } from "./plugins/auth.ts";
import { registerSecurity } from "./plugins/security.ts";

export async function buildApp() {
  const app = Fastify({ logger: true });
  app.decorateRequest("user", null);
  app.decorateRequest("vehicle", null);

  // Route `schema.body` etc. are zod schemas; the parsed (trimmed, stripped) value replaces the raw input.
  app.setValidatorCompiler<ZodType>(({ schema }) => (data) => {
    const result = schema.safeParse(data);
    if (result.success) return { value: result.data };
    const issue = result.error.issues[0];
    return { error: new Error(`${issue.path.join(".") || "body"}: ${issue.message}`) };
  });

  app.setErrorHandler<FastifyError>((err, req, reply) => {
    const status = err.statusCode ?? 500;
    // 5xx messages can carry Prisma/query internals: log them, send the client a generic one
    if (status >= 500) {
      req.log.error(err);
      return reply.code(status).send({ error: "Internal Server Error" });
    }
    return reply.code(status).send({ error: err.message });
  });

  await registerSecurity(app);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(vehiclesRoutes, { prefix: "/api/vehicles" });
  await app.register(onboardingRoutes, { prefix: "/api/onboarding" });
  await app.register(profileRoutes, { prefix: "/api/profile" });
  await app.register(energyPricesRoutes, { prefix: "/api/energy-prices" });
  await app.register(transfersRoutes, { prefix: "/api/transfers" });
  await app.register(transferLinkRoutes, { prefix: "/t" });

  // records of one vehicle; access (owner or family member) is checked once per request in plugins/vehicle-records.ts
  const records = "/api/vehicles/:vehicleId";
  await app.register(odometerRoutes, { prefix: `${records}/odometer-readings` });
  await app.register(tripsRoutes, { prefix: `${records}/trips` });
  await app.register(fuelRoutes, { prefix: `${records}/fuel-transactions` });
  await app.register(chargingRoutes, { prefix: `${records}/charging-sessions` });
  await app.register(maintenanceRoutes, { prefix: `${records}/maintenance` });
  await app.register(expensesRoutes, { prefix: `${records}/expenses` });
  await app.register(batteryHealthRoutes, { prefix: `${records}/battery-health` });
  await app.register(documentsRoutes, { prefix: `${records}/documents` });
  await app.register(statsRoutes, { prefix: `${records}/stats` });
  await app.register(insightsRoutes, { prefix: records });

  return app;
}
