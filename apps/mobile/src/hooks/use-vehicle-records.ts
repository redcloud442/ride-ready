import type { Page } from '@ride-ready/core';
import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { recordsApis, type RecordKind } from '@/api/records.api';
import { queryClient } from '@/lib/query-client';

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
const invalidateVehicle = (_: unknown, { vehicleId }: { vehicleId: string }) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.vehicle(vehicleId) });

type SaveVars = { vehicleId: string; id?: string; input: never };
type DeleteVars = { vehicleId: string; kind: RecordKind; id: string };

// Saves pause while offline and are persisted with the cache; after a restart only these defaults
// know how to send them, so the request lives here instead of in each useMutation.
// shortcut: a replay whose first attempt reached the server but lost its reply creates a duplicate;
// add a client-generated id the API dedupes on when that shows up in practice.
for (const kind of Object.keys(recordsApis) as RecordKind[]) {
  queryClient.setMutationDefaults(queryKeys.recordSave(kind, 'create'), {
    mutationFn: ({ vehicleId, input }: SaveVars) => recordsApis[kind].create(vehicleId, input),
    onSuccess: invalidateVehicle,
  });
  queryClient.setMutationDefaults(queryKeys.recordSave(kind, 'update'), {
    mutationFn: ({ vehicleId, id, input }: SaveVars) => recordsApis[kind].update(vehicleId, id!, input),
    onSuccess: invalidateVehicle,
  });
}
queryClient.setMutationDefaults(queryKeys.recordDelete, {
  mutationFn: ({ vehicleId, kind, id }: DeleteVars) => recordsApis[kind].remove(vehicleId, id),
  onSuccess: invalidateVehicle,
});

/** After the saved cache is restored: send record saves made offline (the defaults above must be registered). */
export const resumeOfflineSaves = () => void queryClient.resumePausedMutations();

export function useCreateRecord<K extends RecordKind>(kind: K) {
  return useMutation<RecordOf<K>, Error, { vehicleId: string; input: CreateInputOf<K> }>({
    mutationKey: queryKeys.recordSave(kind, 'create'),
  });
}

export function useUpdateRecord<K extends RecordKind>(kind: K) {
  return useMutation<RecordOf<K>, Error, { vehicleId: string; id: string; input: Partial<CreateInputOf<K>> }>({
    mutationKey: queryKeys.recordSave(kind, 'update'),
  });
}

export function useDeleteRecord() {
  return useMutation<void, Error, DeleteVars>({ mutationKey: queryKeys.recordDelete });
}
