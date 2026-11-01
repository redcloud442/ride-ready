import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import type { RecordKind } from "@/api/records.api";
import {
  useCreateRecord,
  useUpdateRecord,
  useVehicleRecords,
  type CreateInputOf,
  type RecordOf,
} from "@/hooks/use-vehicle-records";
import { useSelectedVehicle, useVehicles } from "@/hooks/use-vehicles";
import { useLogDraftStore } from "@/stores/log-draft.store";
import { useToastStore } from "@/stores/toast.store";

const RECEIPT_LINKABLE: RecordKind[] = ["fuel", "charging"];

/**
 * Create or edit one record. `/log/<kind>` creates for the selected vehicle;
 * `/log/<kind>?id=<record>&vehicleId=<vehicle>` edits. A scanned-receipt draft prefills a new record.
 */
export function useLogRecord<K extends RecordKind>(
  kind: K,
  messages: { created: string; updated: string }
) {
  const params = useLocalSearchParams<{ id?: string; vehicleId?: string }>();
  const selected = useSelectedVehicle();
  const { data: vehicles } = useVehicles();
  const vehicle = params.vehicleId
    ? vehicles?.find((v) => v.id === params.vehicleId)
    : selected;

  const list = useVehicleRecords(kind, params.id ? vehicle?.id : undefined);
  const record = params.id
    ? (list.data as RecordOf<K>[] | undefined)?.find(
        (r) => (r as { id: string }).id === params.id
      )
    : undefined;

  // read the draft once, on open; clear it when the form closes
  const [draft] = useState(() => {
    const d = useLogDraftStore.getState().draft;
    return !params.id && d?.kind === kind ? d : null;
  });
  useEffect(() => () => useLogDraftStore.getState().clear(), []);

  const create = useCreateRecord(kind);
  const update = useUpdateRecord(kind);
  const show = useToastStore((s) => s.show);
  const isEditing = !!params.id;

  return {
    vehicle,
    record,
    isEditing,
    loadingRecord: isEditing && !record && list.isLoading,
    draft,
    saving: create.isPending || update.isPending,
    error: (create.error ?? update.error)?.message,
    /** `clearable`: optional fields that become null on edit when left empty (PATCH skips missing keys) */
    save(input: CreateInputOf<K>, clearable: string[] = []) {
      if (!vehicle) return;
      const done = {
        onSuccess: () => {
          show(isEditing ? messages.updated : messages.created);
          router.back();
        },
      };
      if (isEditing && params.id) {
        const patch: Record<string, unknown> = { ...input };
        for (const key of clearable)
          if (patch[key] === undefined) patch[key] = null;
        update.mutate(
          {
            vehicleId: vehicle.id,
            id: params.id,
            input: patch as Partial<CreateInputOf<K>>,
          },
          done
        );
      } else {
        const receipt =
          draft?.receiptId && RECEIPT_LINKABLE.includes(kind)
            ? { receiptId: draft.receiptId }
            : {};
        create.mutate(
          { vehicleId: vehicle.id, input: { ...input, ...receipt } },
          done
        );
      }
    },
  };
}
