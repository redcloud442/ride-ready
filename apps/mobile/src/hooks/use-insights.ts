import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { insightsApi } from '@/api/insights.api';
import { queryKeys } from '@/api/query-keys';

export function useInsights(vehicleId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.insights(vehicleId),
    queryFn: () => insightsApi.list(vehicleId!),
    enabled: !!vehicleId,
    select: (page) => page.items,
  });
}

export function useGenerateInsight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, from, to }: { vehicleId: string; from: Date; to: Date }) =>
      insightsApi.generate(vehicleId, from, to),
    onSuccess: (_insight, { vehicleId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.insights(vehicleId) }),
  });
}
