import type { VehicleSummary } from '@ride-ready/core';
import { useMutation } from '@tanstack/react-query';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useDocuments } from '@/hooks/use-documents';
import { useVehicleRecordSet } from '@/hooks/use-vehicle-record-set';
import { useToastStore } from '@/stores/toast.store';

import { serviceHistoryHtml } from '../utils/service-history-report';

// Service history PDF for a buyer: made on the phone, shared only where the owner sends it.
export function useShareServiceHistory(vehicle: VehicleSummary) {
  const { records, isLoading } = useVehicleRecordSet(vehicle);
  const docs = useDocuments(vehicle.id);
  const show = useToastStore((s) => s.show);
  const share = useMutation({
    mutationFn: async () => {
      if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing isn't available on this phone.");
      const { uri } = await Print.printToFileAsync({ html: serviceHistoryHtml(vehicle, records, docs.data ?? []) });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Share service history' });
    },
    onError: (e) => show(e.message),
  });

  return {
    share: () => share.mutate(),
    sharing: share.isPending,
    // never share a half-loaded history
    ready: !isLoading && !docs.isLoading,
  };
}
