import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";
import type { z } from "zod";

import { DateField } from "@/components/ui/date-field";
import { FormTextInput } from "@/components/ui/form-text-input";
import { MoreDetails } from "@/components/ui/more-details";
import { SwitchField } from "@/components/ui/switch-field";
import { useLastUsed } from "@/hooks/use-last-used";
import { formatDay, formatKm } from "@/utils/format";

import { useLogRecord } from "../hooks/use-log-record";
import { fuelFormSchema, type FuelForm as Values } from "../logging.schemas";
import { fuelValues } from "../utils/form-values";
import { FuelTotalCheck } from "./fuel-total-check";
import { LogLayout } from "./log-layout";

export function FuelForm() {
  const log = useLogRecord("fuel", {
    created: "Fill-up saved",
    updated: "Fill-up updated",
  });
  const last = useLastUsed(log.vehicle); // currency, station, … from the newest records
  const { control, handleSubmit } = useForm<
    Values,
    unknown,
    z.output<typeof fuelFormSchema>
  >({
    resolver: zodResolver(fuelFormSchema),
    mode: "onTouched",
    defaultValues: {
      filledAt: new Date(),
      odometerKm: "",
      liters: "",
      pricePerLiter: "",
      totalPaid: "",
      discount: "",
      currency: last.currency,
      fullFill: true,
      station: last.station,
      ...log.draft?.values,
    },
    values: log.record ? fuelValues(log.record) : undefined,
    resetOptions: { keepDirtyValues: true },
  });
  const [filledAt, currency, station] = useWatch({
    control,
    name: ["filledAt", "currency", "station"],
  });
  const submit = () =>
    handleSubmit(({ filledAt, discount, ...v }) =>
      // discount is not nullable on the API: an emptied field means 0
      log.save(
        { ...v, discount: discount ?? 0, filledAt: filledAt.toISOString() },
        ["odometerKm", "station"]
      )
    )();

  return (
    <LogLayout
      vehicle={log.vehicle}
      loading={log.loadingRecord}
      saving={log.saving}
      error={log.error}
      draft={log.draft}
      saveLabel={log.isEditing ? "Save changes" : "Save fill-up"}
      onSave={submit}
    >
      <View style={styles.row}>
        <View style={styles.cell}>
          <FormTextInput
            control={control}
            name="liters" placeholder="e.g. 42.3"
            label="Liters"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.cell}>
          <FormTextInput
            control={control}
            name="totalPaid" placeholder="e.g. 76.10"
            label="Total paid"
            keyboardType="decimal-pad"
            right={<TextInput.Affix text={currency} />}
          />
        </View>
      </View>
      <FormTextInput
        control={control}
        name="pricePerLiter" placeholder="e.g. 1.80"
        label="Price / L (optional)"
        keyboardType="decimal-pad"
        info="Any two of liters, price and total are enough"
      />
      <FuelTotalCheck control={control} />
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
            ? `Last: ${formatKm(last.lastKm)}. Needed for fuel economy`
            : "Needed to calculate fuel economy"
        }
      />
      <SwitchField
        control={control}
        name="fullFill"
        label="Filled the tank"
        hint="Economy is measured between full fill-ups"
      />
      <MoreDetails
        control={control}
        fields={["filledAt", "discount", "station"]}
        defaultOpen={log.isEditing}
        summary={[formatDay(filledAt), station || null]
          .filter(Boolean)
          .join(" · ")}
      >
        <DateField control={control} name="filledAt" label="Date" />
        <FormTextInput
          control={control}
          name="discount" placeholder="e.g. 2.50"
          label="Discount"
          keyboardType="decimal-pad"
          right={<TextInput.Affix text={currency} />}
        />
        <FormTextInput
          control={control}
          name="station" placeholder="e.g. Shell Main St"
          label="Station"
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
