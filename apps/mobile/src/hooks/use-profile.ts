import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import { authApi } from '@/api/auth.api';
import { profileApi } from '@/api/profile.api';
import { queryKeys } from '@/api/query-keys';
import { refreshSession } from '@/lib/auth-client';

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024; // mirrors apps/api profile.schema.ts

export const useUpdateName = () => useMutation({ mutationFn: authApi.updateName, onSuccess: refreshSession });
export const useChangeEmail = () => useMutation({ mutationFn: authApi.changeEmail, onSuccess: refreshSession });
export const useChangePassword = () => useMutation({ mutationFn: authApi.changePassword });
export const useDeleteAccount = () => useMutation({ mutationFn: authApi.deleteAccount });

export function useAvatar() {
  return useQuery({ queryKey: queryKeys.avatar, queryFn: profileApi.avatarUrl, staleTime: 4 * 60_000 }); // URL lives 5 min
}

/** Picks a square photo from the library and uploads it; resolves false when the user cancels. */
export function useChangeAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error('Allow photo access in Settings to choose a profile photo.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
      const asset = result.canceled ? null : result.assets[0];
      if (!asset) return false;
      const mimeType = asset.mimeType ?? 'image/jpeg';
      if (!AVATAR_TYPES.includes(mimeType)) throw new Error('Use a JPEG, PNG or WebP photo.');
      const sizeBytes = asset.fileSize ?? (await (await fetch(asset.uri)).blob()).size;
      if (sizeBytes > AVATAR_MAX_BYTES) throw new Error('That photo is over 5 MB. Choose a smaller one.');
      await profileApi.uploadAvatar({ uri: asset.uri, mimeType, sizeBytes });
      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.avatar }),
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.removeAvatar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.avatar }),
  });
}
