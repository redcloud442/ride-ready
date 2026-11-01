import type { LocalFile } from './documents.api';
import { ApiError, request } from './client';

type AvatarUpload = { upload: { url: string; method: 'PUT'; headers: Record<string, string> } };

// The profile photo lives in private storage; the rest of the profile is Better Auth (auth.api.ts).
export const profileApi = {
  /** 5-minute URL, or Google's picture, or null */
  avatarUrl: () => request<{ url: string | null }>('/api/profile/avatar'),

  async uploadAvatar(file: Omit<LocalFile, 'mimeType'> & { mimeType: string }) {
    const { upload } = await request<AvatarUpload>('/api/profile/avatar', {
      method: 'POST',
      body: JSON.stringify({ mimeType: file.mimeType, sizeBytes: file.sizeBytes }),
    });
    const body = await (await fetch(file.uri)).blob();
    const res = await fetch(upload.url, { method: upload.method, headers: upload.headers, body });
    if (!res.ok) throw new ApiError(res.status, 'Upload failed. Check your connection and try again.');
  },

  removeAvatar: () => request<void>('/api/profile/avatar', { method: 'DELETE' }),
};
