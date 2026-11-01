import { zodResolver } from "@hookform/resolvers/zod";
import { MAINTENANCE_KINDS } from "@ride-ready/core";
import { useForm, useWatch } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";
import type { z } from "zod";

import { ChipSelect } from "@/components/ui/chip-select";
import { DateField } from "@/components/ui/date-field";
import { FormTextInput } from "@/components/ui/form-text-input";
import { MoreDetails } from "@/components/ui/more-details";
import { MAINTENANCE_KIND_UI } from "@/constants/records";
import { useLastUsed } from "@/hooks/use-last-used";
import { formatDay, formatKm } from "@/utils/format";

import { useLogRecord } from "../hooks/use-log-record";
import {
  maintenanceFormSchema,
  type MaintenanceForm as Values,
} from "../logging.schemas";
import { maintenanceValues } from "../utils/form-values";
import { LogLayout } from "./log-layout";

const KIND_OPTIONS = MAINTENANCE_KINDS.map((k) => ({
  value: k,
  ...MAINTENANCE_KIND_UI[k],
}));

export function MaintenanceForm() {
  const log = useLogRecord("maintenance", {
    created: "Service saved",
    updated: "Service updated",
  });
  const last = useLastUsed(log.vehicle); // currency, station, … from the newest records
  const { control, handleSubmit } = useForm<
    Values,
    unknown,
    z.output<typeof maintenanceFormSchema>
  >({
    resolver: zodResolver(maintenanceFormSchema),
    mode: "onTouched",
    defaultValues: {
      performedAt: new Date(),
      odometerKm: "",
      kind: "service",
      description: "",
      laborCost: "",
      partsCost: "",
      currency: last.currency,
      workshop: last.workshop,
      ...log.draft?.values,
    },
    values: log.record
      ? maintenanceValues(log.record, last.currency)
      : undefined,
    resetOptions: { keepDirtyValues: true },
  });
  const [performedAt, currency, workshop] = useWatch({
    control,
    name: ["performedAt", "currency", "workshop"],
  });
  const submit = () =>
    handleSubmit(({ performedAt, currency, ...v }) =>
      log.save(
        {
          ...v,
          performedAt: performedAt.toISOString(),
          // the API wants a currency only alongside an amount
          currency:
            v.laborCost != null || v.partsCost != null ? currency : undefined,
        },
        ["odometerKm", "laborCost", "partsCost", "currency", "workshop"]
      )
    )();

  return (
    <LogLayout
      vehicle={log.vehicle}
      loading={log.loadingRecord}
      saving={log.saving}
      error={log.error}
      draft={log.draft}
      saveLabel={log.isEditing ? "Save changes" : "Save service"}
      onSave={submit}
    >
      <ChipSelect
        control={control}
        name="kind"
        label="Type"
        options={KIND_OPTIONS}
      />
      <FormTextInput
        control={control}
        name="description"
        label="What was done"
        placeholder="e.g. Oil and filter change"
        multiline
        maxLength={1000}
      />
      <View style={styles.row}>
        <View style={styles.cell}>
          <FormTextInput
            control={control}
            name="laborCost"
            label="Labor"
            keyboardType="decimal-pad"
            right={<TextInput.Affix text={currency} />}
          />
        </View>
        <View style={styles.cell}>
          <FormTextInput
            control={control}
            name="partsCost"
            label="Parts"
            keyboardType="decimal-pad"
            right={<TextInput.Affix text={currency} />}
          />
        </View>
      </View>
      <FormTextInput
        control={control}
        name="odometerKm"
        label="Odometer"
        keyboardType="decimal-pad"
        placeholder={
          last.lastKm != null ? String(Math.round(last.lastKm)) : undefined
        }
        right={<TextInput.Affix text="km" />}
        info={
          last.lastKm != null ? `Last: ${formatKm(last.lastKm)}` : undefined
        }
      />
      <MoreDetails
        control={control}
        fields={["performedAt", "workshop"]}
        defaultOpen={log.isEditing}
        summary={[formatDay(performedAt), workshop || null]
          .filter(Boolean)
          .join(" · ")}
      >
        <DateField control={control} name="performedAt" label="Date" />
        <FormTextInput
          control={control}
          name="workshop"
          label="Workshop"
          maxLength={100}
        />
      </MoreDetails>
    </LogLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  cell: { flex: 1 },
});
