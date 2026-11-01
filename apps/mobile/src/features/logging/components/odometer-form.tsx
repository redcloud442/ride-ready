import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { TextInput } from "react-native-paper";
import type { z } from "zod";

import { DateField } from "@/components/ui/date-field";
import { FormTextInput } from "@/components/ui/form-text-input";
import { useLatestOdometerKm } from "@/hooks/use-latest-odometer";
import { formatKm } from "@/utils/format";

import { useLogRecord } from "../hooks/use-log-record";
import {
  odometerFormSchema,
  type OdometerForm as Values,
} from "../logging.schemas";
import { odometerValues } from "../utils/form-values";
import { LogLayout } from "./log-layout";

export function OdometerForm() {
  const log = useLogRecord("odometer", {
    created: "Odometer reading saved",
    updated: "Odometer reading updated",
  });
  const lastKm = useLatestOdometerKm(log.vehicle);
  const { control, handleSubmit } = useForm<
    Values,
    unknown,
    z.output<typeof odometerFormSchema>
  >({
    resolver: zodResolver(odometerFormSchema),
    mode: "onTouched",
    defaultValues: { readAt: new Date(), km: "", ...log.draft?.values },
    values: log.record ? odometerValues(log.record) : undefined,
    resetOptions: { keepDirtyValues: true },
  });
  const km = Number(
    String(useWatch({ control, name: "km" }) ?? "").replace(",", ".")
  );
  const submit = () =>
    handleSubmit((v) =>
      log.save({ readAt: v.readAt.toISOString(), km: v.km })
    )();

  // A lower value than the last reading is usually a typo; warn but allow (back-dated readings exist).
  const info =
    lastKm == null
      ? "As shown on the dashboard"
      : !log.isEditing && km > 0 && km < lastKm
      ? `Lower than your last reading (${formatKm(lastKm)}). Check the number.`
      : `Last recorded: ${formatKm(lastKm)}`;

  return (
    <LogLayout
      vehicle={log.vehicle}
      loading={log.loadingRecord}
      saving={log.saving}
      error={log.error}
      draft={log.draft}
      saveLabel={log.isEditing ? "Save changes" : "Save reading"}
      onSave={submit}
    >
      <DateField control={control} name="readAt" label="Date" />
      <FormTextInput
        control={control}
        name="km"
        label="Odometer"
        keyboardType="decimal-pad"
        right={<TextInput.Affix text="km" />}
        info={info}
        onSubmitEditing={submit}
      />
    </LogLayout>
  );
}
