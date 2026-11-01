import { recordRoutes } from "../../plugins/vehicle-records.ts";
import { createExpenseSchema, updateExpenseSchema } from "./expenses.schema.ts";
import { expensesService } from "./expenses.service.ts";

export const expensesRoutes = recordRoutes({
  label: "Expense",
  service: expensesService,
  createSchema: createExpenseSchema,
  updateSchema: updateExpenseSchema,
});
