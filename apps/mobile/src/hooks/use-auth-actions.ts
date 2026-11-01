import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/api/auth.api';
import { useToastStore } from '@/stores/toast.store';

// On success Better Auth updates useSession() and the root layout routes to onboarding or (tabs).
export const useSignIn = () => useMutation({ mutationFn: authApi.signInEmail });
export const useSignUp = () => useMutation({ mutationFn: authApi.signUpEmail });
export const useGoogleSignIn = () => useMutation({ mutationFn: authApi.signInGoogle });
export const useSignOut = () =>
  useMutation({ mutationFn: authApi.signOut, onError: (e) => useToastStore.getState().show(e.message) });
