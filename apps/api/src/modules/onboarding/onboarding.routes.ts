import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../plugins/auth.ts";
import { onboardingController } from "./onboarding.controller.ts";
import { completeOnboardingSchema, type CompleteOnboardingInput } from "./onboarding.schema.ts";

export async function onboardingRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  app.post<{ Body: CompleteOnboardingInput }>(
    "/complete",
    { schema: { body: completeOnboardingSchema } },
    onboardingController.complete,
  );
}
