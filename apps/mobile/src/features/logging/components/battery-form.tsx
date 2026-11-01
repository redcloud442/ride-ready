import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Text, TextInput } from "react-native-paper";
import type { z } from "zod";

import { ChipSelect } from "@/components/ui/chip-select";
import { DateField } from "@/components/ui/date-field";
import { FormTextInput } from "@/components/ui/form-text-input";
import { useAppTheme } from "@/theme";

import { useLogRecord } from "../hooks/use-log-record";
import {
  BATTERY_SOURCES,
  batteryFormSchema,
  type BatteryForm as Values,
} from "../logging.schemas";
import { batteryValues } from "../utils/form-values";
import { LogLayout } from "./log-layout";

const SOURCE_OPTIONS = BATTERY_SOURCES.map((s) => ({ value: s, label: s }));

export function BatteryForm() {
  const { colors } = useAppTheme();
  const log = useLogRecord("battery", {
    created: "Battery health saved",
    updated: "Battery health updated",
  });
  const { control, handleSubmit } = useForm<
    Values,
    unknown,
    z.output<typeof batteryFormSchema>
  >({
    resolver: zodResolver(batteryFormSchema),
    mode: "onTouched",
    defaultValues: { measuredAt: new Date(), sohPct: "", source: "" },
    values: log.record ? batteryValues(log.record) : undefined,
    resetOptions: { keepDirtyValues: true },
  });
  const submit = () =>
    handleSubmit((v) =>
      log.save({ ...v, measuredAt: v.measuredAt.toISOString() })
    )();

  return (
    <LogLayout
      vehicle={log.vehicle}
      loading={log.loadingRecord}
      saving={log.saving}
      error={log.error}
      saveLabel={log.isEditing ? "Save changes" : "Save measurement"}
      onSave={submit}
    >
      <Text
        variant="bodyMedium"
        style={{ color: colors.onSurfaceVariant, marginBottom: 12 }}
      >
        Record state of health only from a real measurement. RideReady never
        estimates it.
      </Text>
      <DateField control={control} name="measuredAt" label="Measured on" />
      <FormTextInput
        control={control}
        name="sohPct" placeholder="e.g. 94"
        label="State of health"
        keyboardType="decimal-pad"
        right={<TextInput.Affix text="%" />}
        info="100% = as new"
      />
      <ChipSelect
        control={control}
        name="source"
        label="Source"
        options={SOURCE_OPTIONS}
      />
    </LogLayout>
  );
}
