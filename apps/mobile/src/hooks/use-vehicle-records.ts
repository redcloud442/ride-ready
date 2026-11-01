import type { Page } from '@ride-ready/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { recordsApis, type RecordKind } from '@/api/records.api';

type Api = typeof recordsApis;
export type RecordOf<K extends RecordKind> = Awaited<ReturnType<Api[K]['list']>> extends Page<infer T> ? T : never;
export type CreateInputOf<K extends RecordKind> = Parameters<Api[K]['create']>[1];

// Records of one vehicle, newest first. Disabled until a vehicle is known.
export function useVehicleRecords<K extends RecordKind>(kind: K, vehicleId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.records(vehicleId, kind),
    queryFn: () => recordsApis[kind].list(vehicleId!) as Promise<Page<RecordOf<K>>>,
    enabled: !!vehicleId,
    select: (page) => page.items,
  });
}

// A record changes stats and insights too, so refresh everything under that vehicle.
const invalidateVehicle = (queryClient: ReturnType<typeof useQueryClient>, vehicleId: string) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.vehicle(vehicleId) });

export function useCreateRecord<K extends RecordKind>(kind: K) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, input }: { vehicleId: string; input: CreateInputOf<K> }) =>
      (recordsApis[kind].create as (id: string, body: CreateInputOf<K>) => Promise<RecordOf<K>>)(vehicleId, input),
    onSuccess: (_record, { vehicleId }) => invalidateVehicle(queryClient, vehicleId),
  });
}

export function useUpdateRecord<K extends RecordKind>(kind: K) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, id, input }: { vehicleId: string; id: string; input: Partial<CreateInputOf<K>> }) =>
      (recordsApis[kind].update as (v: string, i: string, body: Partial<CreateInputOf<K>>) => Promise<RecordOf<K>>)(
        vehicleId,
        id,
        input,
      ),
    onSuccess: (_record, { vehicleId }) => invalidateVehicle(queryClient, vehicleId),
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, kind, id }: { vehicleId: string; kind: RecordKind; id: string }) =>
      recordsApis[kind].remove(vehicleId, id),
    onSuccess: (_void, { vehicleId }) => invalidateVehicle(queryClient, vehicleId),
  });
}
