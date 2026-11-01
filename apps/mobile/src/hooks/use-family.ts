import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { familyApi } from '@/api/family.api';
import { queryKeys } from '@/api/query-keys';
import { authClient } from '@/lib/auth-client';

export function useFamily() {
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  return useQuery({ queryKey: queryKeys.family, queryFn: () => familyApi.list(userId!), enabled: !!userId });
}

// Better Auth lists invitations only for verified emails (an unverified sign-up could claim someone
// else's address). Email sign-ups aren't verified until an email sender exists, so they join via QR / link.
export function useInvitationsForMe() {
  const { data: session } = authClient.useSession();
  return useQuery({ queryKey: [...queryKeys.family, 'for-me'], queryFn: familyApi.forMe, enabled: !!session?.user.emailVerified });
}

export function useInvitation(id: string | undefined) {
  return useQuery({ queryKey: queryKeys.invitation(id ?? ''), queryFn: () => familyApi.invitation(id!), enabled: !!id, retry: false });
}

// Joining or leaving changes which vehicles the user sees, so the garage refreshes too.
function useFamilyMutation<T, R>(fn: (input: T) => Promise<R>, { garage = false } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.family });
      if (garage) await queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
    },
  });
}

/** Creates the user's family on the first invite. */
export function useInvite() {
  const { data: session } = authClient.useSession();
  return useFamilyMutation(async ({ organizationId, email }: { organizationId: string | undefined; email: string }) => {
    if (!session) throw new Error('Sign in again to invite family members.');
    const id = organizationId ?? (await familyApi.create(session.user.id, session.user.name)).id;
    return familyApi.invite(id, email);
  });
}

export const useCancelInvite = () => useFamilyMutation(familyApi.cancelInvite);
export const useRemoveMember = () =>
  useFamilyMutation(({ organizationId, memberId }: { organizationId: string; memberId: string }) => familyApi.removeMember(organizationId, memberId));
export const useLeaveFamily = () => useFamilyMutation(familyApi.leave, { garage: true });
export const useAcceptInvite = () => useFamilyMutation(familyApi.accept, { garage: true });
export const useDeclineInvite = () => useFamilyMutation(familyApi.decline);
