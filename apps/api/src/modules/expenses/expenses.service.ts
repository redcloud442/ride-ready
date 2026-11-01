import { db } from "../../lib/db.ts";
import { pageArgs, toPage, type ListQuery } from "../../plugins/vehicle-records.ts";
import type { CreateExpenseInput, UpdateExpenseInput } from "./expenses.schema.ts";

const omit = { deletedAt: true } as const;
const live = (vehicleId: string, id: string) => ({ id, vehicleId, deletedAt: null });

export const expensesService = {
  async list(vehicleId: string, query: ListQuery) {
    const rows = await db.expense.findMany({
      where: { vehicleId, deletedAt: null },
      orderBy: [{ paidAt: "desc" }, { id: "desc" }],
      omit,
      ...pageArgs(query),
    });
    return toPage(rows, query.limit);
  },

  get(vehicleId: string, id: string) {
    return db.expense.findFirst({ where: live(vehicleId, id), omit });
  },

  create(vehicleId: string, input: CreateExpenseInput) {
    return db.expense.create({ data: { ...input, vehicleId }, omit });
  },

  async update(vehicleId: string, id: string, input: UpdateExpenseInput) {
    const { count } = await db.expense.updateMany({ where: live(vehicleId, id), data: input });
    return count ? expensesService.get(vehicleId, id) : null;
  },

  async remove(vehicleId: string, id: string) {
    const { count } = await db.expense.updateMany({
      where: live(vehicleId, id),
      data: { deletedAt: new Date() },
    });
    return count > 0;
  },
};
