import type { FastifyReply, FastifyRequest } from "fastify";
import { currentUser } from "../../plugins/auth.ts";
import type { AvatarUploadInput } from "./profile.schema.ts";
import { profileService } from "./profile.service.ts";

export const profileController = {
  async startAvatarUpload(req: FastifyRequest<{ Body: AvatarUploadInput }>, reply: FastifyReply) {
    return reply.code(201).send(await profileService.startAvatarUpload(currentUser(req).id, req.body));
  },

  avatarUrl(req: FastifyRequest) {
    return profileService.avatarUrl(currentUser(req).id);
  },

  async removeAvatar(req: FastifyRequest, reply: FastifyReply) {
    await profileService.removeAvatar(currentUser(req).id);
    return reply.code(204).send();
  },
};
