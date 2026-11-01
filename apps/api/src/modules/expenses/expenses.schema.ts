import { EXPENSE_CATEGORIES } from "@ride-ready/core";
import { z } from "zod";
import { currency, money, optionalText, pastDate } from "../../lib/schemas.ts";

export const createExpenseSchema = z.object({
  paidAt: pastDate,
  category: z.enum(EXPENSE_CATEGORIES),
  amount: money,
  currency,
  note: optionalText(500),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
