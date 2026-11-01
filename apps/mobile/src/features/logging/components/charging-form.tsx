import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";
import type { z } from "zod";

import { ChipSelect } from "@/components/ui/chip-select";
import { DateField } from "@/components/ui/date-field";
import { FormTextInput } from "@/components/ui/form-text-input";
import { MoreDetails } from "@/components/ui/more-details";
import { CHARGER_TYPES } from "@/constants/records";
import { useLastUsed } from "@/hooks/use-last-used";
import { formatDay, formatKm } from "@/utils/format";

import { useLogRecord } from "../hooks/use-log-record";
import {
  chargingFormSchema,
  type ChargingForm as Values,
} from "../logging.schemas";
import { chargingValues } from "../utils/form-values";
import { LogLayout } from "./log-layout";

const CHARGER_OPTIONS = CHARGER_TYPES.map((t) => ({ value: t, label: t }));

export function ChargingForm() {
  const log = useLogRecord("charging", {
    created: "Charge saved",
    updated: "Charge updated",
  });
  const last = useLastUsed(log.vehicle); // currency, station, … from the newest records
  const { control, handleSubmit } = useForm<
    Values,
    unknown,
    z.output<typeof chargingFormSchema>
  >({
    resolver: zodResolver(chargingFormSchema),
    mode: "onTouched",
    defaultValues: {
      startedAt: new Date(),
      odometerKm: "",
      kwhPurchased: "",
      cost: "",
      currency: last.currency,
      chargerType: last.chargerType,
      location: last.chargeLocation,
      socStartPct: "",
      socEndPct: "",
      ...log.draft?.values,
    },
    values: log.record ? chargingValues(log.record) : undefined,
    resetOptions: { keepDirtyValues: true },
  });
  const [startedAt, currency, chargerType] = useWatch({
    control,
    name: ["startedAt", "currency", "chargerType"],
  });
  const submit = () =>
    handleSubmit(({ startedAt, ...v }) =>
      log.save({ ...v, startedAt: startedAt.toISOString() }, [
        "odometerKm",
        "chargerType",
        "location",
        "socStartPct",
        "socEndPct",
      ])
    )();

  return (
    <LogLayout
      vehicle={log.vehicle}
      loading={log.loadingRecord}
      saving={log.saving}
      error={log.error}
      draft={log.draft}
      saveLabel={log.isEditing ? "Save changes" : "Save charge"}
      onSave={submit}
    >
      <View style={styles.row}>
        <View style={styles.cell}>
          <FormTextInput
            control={control}
            name="kwhPurchased" placeholder="e.g. 32.5"
            label="Energy"
            keyboardType="decimal-pad"
            right={<TextInput.Affix text="kWh" />}
            info="As billed by the charger"
          />
        </View>
        <View style={styles.cell}>
          <FormTextInput
            control={control}
            name="cost" placeholder="e.g. 12.40"
            label="Cost"
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
          last.lastKm != null ? String(Math.round(last.lastKm)) : "e.g. 45200"
        }
        right={<TextInput.Affix text="km" />}
        info={
          last.lastKm != null
            ? `Last: ${formatKm(last.lastKm)}. Needed for kWh per 100 km`
            : "Needed to estimate kWh per 100 km"
        }
      />
      <MoreDetails
        control={control}
        fields={[
          "startedAt",
          "chargerType",
          "socStartPct",
          "socEndPct",
          "location",
        ]}
        defaultOpen={log.isEditing}
        summary={[formatDay(startedAt), chargerType || null]
          .filter(Boolean)
          .join(" · ")}
      >
        <DateField control={control} name="startedAt" label="Date" />
        <ChipSelect
          control={control}
          name="chargerType"
          label="Charger"
          options={CHARGER_OPTIONS}
          clearable
        />
        <View style={styles.row}>
          <View style={styles.cell}>
            <FormTextInput
              control={control}
              name="socStartPct" placeholder="e.g. 20"
              label="Battery start"
              keyboardType="number-pad"
              right={<TextInput.Affix text="%" />}
            />
          </View>
          <View style={styles.cell}>
            <FormTextInput
              control={control}
              name="socEndPct" placeholder="e.g. 80"
              label="Battery end"
              keyboardType="number-pad"
              right={<TextInput.Affix text="%" />}
            />
          </View>
        </View>
        <FormTextInput
          control={control}
          name="location" placeholder="e.g. Ionity A2, Home"
          label="Location"
          maxLength={200}
        />
      </MoreDetails>
    </LogLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  cell: { flex: 1 },
});
