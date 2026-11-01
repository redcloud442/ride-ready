import type { VehicleSummary } from '@ride-ready/core';
import { useState } from 'react';

import { useDeleteRecord } from '@/hooks/use-vehicle-records';
import { useVehicleRecordSet } from '@/hooks/use-vehicle-record-set';
import { useToastStore } from '@/stores/toast.store';
import { recordFeed, type FeedItem } from '@/utils/record-feed';

export type HistoryFilter = 'all' | FeedItem['kind'];

// Full record history of one vehicle, filterable, with delete.
export function useRecordHistory(vehicle: VehicleSummary | undefined) {
  const [filter, setFilter] = useState<HistoryFilter>('all'); // local UI choice
  const [pendingDelete, setPendingDelete] = useState<FeedItem | null>(null); // local dialog state
  const { records, isLoading, isError, refetch } = useVehicleRecordSet(vehicle);
  const remove = useDeleteRecord();
  const show = useToastStore((s) => s.show);

  const all = recordFeed(records);
  return {
    filter,
    setFilter,
    items: filter === 'all' ? all : all.filter((i) => i.kind === filter),
    total: all.length,
    isLoading,
    isError,
    refetch,
    pendingDelete,
    askDelete: setPendingDelete,
    cancelDelete: () => setPendingDelete(null),
    deleting: remove.isPending,
    confirmDelete() {
      if (!vehicle || !pendingDelete) return;
      remove.mutate(
        { vehicleId: vehicle.id, kind: pendingDelete.kind, id: pendingDelete.id },
        {
          onSuccess: () => show('Record deleted'),
          onError: (e) => show(e.message),
          onSettled: () => setPendingDelete(null),
        },
      );
    },
  };
}
