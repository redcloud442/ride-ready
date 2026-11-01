import type { VehicleSummary } from '@ride-ready/core';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { queryKeys } from '@/api/query-keys';
import { routes } from '@/constants/routes';
import { useCancelTransfer, useCreateTransfer, useTransfer } from '@/hooks/use-transfers';
import { useToastStore } from '@/stores/toast.store';

export type TransferOptions = { includeReceipts: boolean; includeCosts: boolean };

// Seller side: choose what goes, show the code, wait for the buyer's scan, then leave the gone car's screens.
export function useTransferVehicle(vehicle: VehicleSummary) {
  const form = useForm<TransferOptions>({ defaultValues: { includeReceipts: true, includeCosts: true } });
  const create = useCreateTransfer();
  const transfer = useTransfer(create.data?.id, { watch: true });
  const cancel = useCancelTransfer();
  const qc = useQueryClient();
  const show = useToastStore((s) => s.show);
  const name = `${vehicle.make} ${vehicle.model}`;
  const acceptedAt = transfer.data?.acceptedAt;

  useEffect(() => {
    if (!acceptedAt) return;
    void qc.invalidateQueries({ queryKey: queryKeys.vehicles });
    show(`${name} now belongs to its new owner.`);
    router.dismissTo(routes.garage);
  }, [acceptedAt, name, qc, show]);

  return {
    form,
    transfer: transfer.data ?? null,
    // checked at each 3 s poll, not during render
    expired: !!transfer.data && new Date(transfer.data.expiresAt).getTime() <= transfer.dataUpdatedAt,
    creating: create.isPending,
    error: create.error?.message ?? null,
    start: () => form.handleSubmit((v) => create.mutate({ vehicleId: vehicle.id, ...v }))(),
    cancelling: cancel.isPending,
    cancel: () => {
      const id = create.data?.id;
      if (!id) return;
      cancel.mutate(id, {
        onSuccess: () => {
          show('Transfer cancelled. The code no longer works.');
          router.back();
        },
        onError: (e) => show(e.message),
      });
    },
  };
}
