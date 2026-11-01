import { randomUUID } from "node:crypto";
import { db } from "../../lib/db.ts";
import { deleteObjects, downloadUrl, uploadUrl } from "../../lib/storage.ts";
import type { AvatarUploadInput } from "./profile.schema.ts";

// Name, email, password, preferences and account deletion are Better Auth endpoints (lib/auth.ts).
// Only the photo lives here: User.image holds a private storage key ("avatars/<userId>/…") or, for
// Google accounts, Google's public picture URL.

const isStorageKey = (image: string | null): image is string => !!image?.startsWith("avatars/");

export const profileService = {
  // shortcut: image points at the new key before the upload finishes; a failed upload shows initials
  // until the next try. Add a confirm step if half-finished uploads become a problem.
  async startAvatarUpload(userId: string, { mimeType, sizeBytes }: AvatarUploadInput) {
    const key = `avatars/${userId}/${randomUUID()}`;
    const { image: previous } = await db.user.update({ where: { id: userId }, data: { image: key }, select: { image: true } });
    const url = await uploadUrl(key, mimeType, sizeBytes);
    if (isStorageKey(previous) && previous !== key) await deleteObjects([previous]);
    return { upload: { url, method: "PUT" as const, headers: { "content-type": mimeType, "content-length": String(sizeBytes) } } };
  },

  async avatarUrl(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { image: true } });
    const image = user?.image ?? null;
    return { url: isStorageKey(image) ? await downloadUrl(image) : image };
  },

  async removeAvatar(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { image: true } });
    await db.user.update({ where: { id: userId }, data: { image: null } });
    if (isStorageKey(user?.image ?? null)) await deleteObjects([user!.image!]);
  },
};
