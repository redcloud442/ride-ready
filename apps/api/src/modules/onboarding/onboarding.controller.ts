import type { FastifyReply, FastifyRequest } from "fastify";
import { currentUser } from "../../plugins/auth.ts";
import type { CompleteOnboardingInput } from "./onboarding.schema.ts";
import { onboardingService } from "./onboarding.service.ts";

export const onboardingController = {
  async complete(req: FastifyRequest<{ Body: CompleteOnboardingInput }>, reply: FastifyReply) {
    const done = await onboardingService.complete(currentUser(req).id, req.body ?? {});
    if (!done) return reply.code(409).send({ error: "Already onboarded" });
    return { ok: true };
  },
};
