import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { transfersApi } from '@/api/transfers.api';

/** `watch`: the seller's QR screen polls until the buyer has scanned it. */
export function useTransfer(id: string | undefined, { watch = false } = {}) {
  return useQuery({
    queryKey: queryKeys.transfer(id ?? ''),
    queryFn: () => transfersApi.get(id ?? ''),
    enabled: !!id,
    retry: false, // expired / used codes answer 404
    refetchInterval: (q) => (watch && !q.state.data?.acceptedAt ? 3000 : false),
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transfersApi.create,
    onSuccess: (t) => qc.setQueryData(queryKeys.transfer(t.id), t),
  });
}

export function useAcceptTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transfersApi.accept,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.vehicles }),
  });
}

export function useCancelTransfer() {
  return useMutation({ mutationFn: transfersApi.cancel });
}
