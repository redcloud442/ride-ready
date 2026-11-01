import { db } from "../../lib/db.ts";
import { pageArgs, toPage } from "../../plugins/vehicle-records.ts";
import { ENERGY_KINDS, type EnergyPriceQuery, type SubmitEnergyPriceInput } from "./energy-prices.schema.ts";

// Shared reference data, not user records: no submitter is stored, so a price can't be traced to a person.
// shortcut: no moderation or outlier filtering; add a submitter hash + median filter before showing prices widely.
export const energyPricesService = {
  async list({ kind, region, ...page }: EnergyPriceQuery) {
    const rows = await db.energyPriceObservation.findMany({
      where: { kind, region: region ? { equals: region, mode: "insensitive" } : undefined },
      orderBy: [{ observedAt: "desc" }, { id: "desc" }],
      ...pageArgs(page),
    });
    return toPage(rows, page.limit);
  },

  submit(input: SubmitEnergyPriceInput) {
    return db.energyPriceObservation.create({
      data: { ...input, unit: ENERGY_KINDS[input.kind], source: "community" },
    });
  },
};
