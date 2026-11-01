import { z } from "zod";

export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const avatarUploadSchema = z.object({
  mimeType: z.enum(AVATAR_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(5 * 1024 * 1024),
});

export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
