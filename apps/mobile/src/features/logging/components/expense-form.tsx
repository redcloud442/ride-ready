import { zodResolver } from "@hookform/resolvers/zod";
import { EXPENSE_CATEGORIES } from "@ride-ready/core";
import { useForm, useWatch } from "react-hook-form";
import { TextInput } from "react-native-paper";
import type { z } from "zod";

import { ChipSelect } from "@/components/ui/chip-select";
import { DateField } from "@/components/ui/date-field";
import { FormTextInput } from "@/components/ui/form-text-input";
import { MoreDetails } from "@/components/ui/more-details";
import { EXPENSE_CATEGORY_UI } from "@/constants/records";
import { useLastUsed } from "@/hooks/use-last-used";
import { formatDay } from "@/utils/format";

import { useLogRecord } from "../hooks/use-log-record";
import {
  expenseFormSchema,
  type ExpenseForm as Values,
} from "../logging.schemas";
import { expenseValues } from "../utils/form-values";
import { LogLayout } from "./log-layout";

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((c) => ({
  value: c,
  ...EXPENSE_CATEGORY_UI[c],
}));

export function ExpenseForm() {
  const log = useLogRecord("expenses", {
    created: "Expense saved",
    updated: "Expense updated",
  });
  const last = useLastUsed(log.vehicle); // currency, station, … from the newest records
  const { control, handleSubmit } = useForm<
    Values,
    unknown,
    z.output<typeof expenseFormSchema>
  >({
    resolver: zodResolver(expenseFormSchema),
    mode: "onTouched",
    defaultValues: {
      paidAt: new Date(),
      category: "insurance",
      amount: "",
      currency: last.currency,
      note: "",
      ...log.draft?.values,
    },
    values: log.record ? expenseValues(log.record) : undefined,
    resetOptions: { keepDirtyValues: true },
  });
  const [paidAt, currency, note] = useWatch({
    control,
    name: ["paidAt", "currency", "note"],
  });
  const submit = () =>
    handleSubmit(({ paidAt, ...v }) =>
      log.save({ ...v, paidAt: paidAt.toISOString() }, ["note"])
    )();

  return (
    <LogLayout
      vehicle={log.vehicle}
      loading={log.loadingRecord}
      saving={log.saving}
      error={log.error}
      draft={log.draft}
      saveLabel={log.isEditing ? "Save changes" : "Save expense"}
      onSave={submit}
    >
      <ChipSelect
        control={control}
        name="category"
        label="Category"
        options={CATEGORY_OPTIONS}
      />
      <FormTextInput
        control={control}
        name="amount" placeholder="e.g. 85.00"
        label="Amount"
        keyboardType="decimal-pad"
        right={<TextInput.Affix text={currency} />}
      />
      <MoreDetails
        control={control}
        fields={["paidAt", "note"]}
        defaultOpen={log.isEditing}
        summary={[formatDay(paidAt), note || null]
          .filter(Boolean)
          .join(" · ")}
      >
        <DateField control={control} name="paidAt" label="Date" />
        <FormTextInput
          control={control}
          name="note" placeholder="e.g. Annual road tax"
          label="Note"
          multiline
          maxLength={500}
        />
      </MoreDetails>
    </LogLayout>
  );
}
