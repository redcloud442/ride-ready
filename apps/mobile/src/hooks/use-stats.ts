import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { statsApi } from '@/api/stats.api';

export function useVehicleStats(vehicleId: string | undefined, from: Date, to: Date) {
  return useQuery({
    queryKey: queryKeys.stats(vehicleId, from.toISOString(), to.toISOString()),
    queryFn: () => statsApi.get(vehicleId!, from, to),
    enabled: !!vehicleId,
  });
}
