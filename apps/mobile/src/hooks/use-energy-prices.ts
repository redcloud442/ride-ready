import type { EnergyPriceKind } from '@ride-ready/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { energyPricesApi } from '@/api/energy-prices.api';
import { queryKeys } from '@/api/query-keys';

export function useEnergyPrices(kind: EnergyPriceKind | undefined) {
  return useQuery({
    queryKey: queryKeys.energyPrices(kind),
    queryFn: () => energyPricesApi.list(kind),
    select: (page) => page.items,
  });
}

export function useSubmitEnergyPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: energyPricesApi.submit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['energy-prices'] }),
  });
}
