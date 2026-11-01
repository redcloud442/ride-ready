import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../plugins/auth.ts";
import { profileController } from "./profile.controller.ts";
import { avatarUploadSchema } from "./profile.schema.ts";

// Mounted at /api/profile. The rest of the profile is Better Auth: /api/auth/update-user,
// /change-email, /change-password, /delete-user.
export async function profileRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  app.post("/avatar", { schema: { body: avatarUploadSchema }, config: { rateLimit: { max: 10, timeWindow: "1 hour" } } }, profileController.startAvatarUpload);
  app.get("/avatar", profileController.avatarUrl); // 5-minute URL
  app.delete("/avatar", profileController.removeAvatar);
}
