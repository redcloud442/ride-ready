import { db } from "../../lib/db.ts";
import type { CompleteOnboardingInput } from "./onboarding.schema.ts";

export const onboardingService = {
  // First vehicle and the onboarded flag commit together, so a failed insert never strands a user as "onboarded".
  // Returns false when the user was already onboarded.
  complete(userId: string, { vehicle }: CompleteOnboardingInput) {
    return db.$transaction(async (tx) => {
      // conditional update claims onboarding once, so a double submit can't add a second vehicle
      const { count } = await tx.user.updateMany({
        where: { id: userId, onboardedAt: null },
        data: { onboardedAt: new Date() },
      });
      if (count === 0) return false;
      if (vehicle) await tx.vehicle.create({ data: { ...vehicle, userId } });
      return true;
    });
  },
};
