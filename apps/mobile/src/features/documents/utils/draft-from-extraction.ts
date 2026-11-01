import { usesCharging, usesFuel, type DocumentExtraction, type Propulsion } from '@ride-ready/core';

import type { RecordKind } from '@/api/records.api';
import type { LogScreen } from '@/constants/routes';

export type ExtractionDraft = {
  kind: RecordKind;
  screen: LogScreen;
  values: Record<string, unknown>;
  unclear: string[];
};

// Form inputs hold strings; nulls stay out so the form keeps its own defaults.
const str = (n: number | null | undefined) => (n == null ? undefined : String(n));
const date = (s: string | null) => {
  if (!s) return undefined;
  const d = new Date(s); // ISO without offset parses as local time, as printed
  return Number.isNaN(d.getTime()) || d.getTime() > Date.now() + 86_400_000 ? undefined : d;
};
const compact = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v != null && v !== ''));

/** Maps what was read from the photo to a prefilled log form, or null when the document fits no form for this vehicle. */
export function draftFromExtraction(x: DocumentExtraction, propulsion: Propulsion): ExtractionDraft | null {
  const e = x.extraction;
  // currency stays the profile's: records are kept in one currency (Profile → Default currency)
  const common = { odometerKm: str(e.odometerKm) };

  if (e.documentType === 'fuel_receipt' && usesFuel(propulsion)) {
    return {
      kind: 'fuel',
      screen: 'fuel',
      unclear: e.unclear,
      values: compact({
        ...common,
        filledAt: date(e.date),
        liters: str(e.fuel?.liters),
        pricePerLiter: str(e.fuel?.pricePerLiter),
        discount: str(e.fuel?.discount),
        totalPaid: str(e.totalPaid),
        station: e.fuel?.station,
      }),
    };
  }
  if (e.documentType === 'charging_receipt' && usesCharging(propulsion)) {
    return {
      kind: 'charging',
      screen: 'charging',
      unclear: e.unclear,
      values: compact({
        ...common,
        startedAt: date(e.date),
        kwhPurchased: str(e.charging?.kwhPurchased),
        cost: str(e.totalPaid),
        location: e.charging?.location,
      }),
    };
  }
  if (e.documentType === 'service_invoice') {
    return {
      kind: 'maintenance',
      screen: 'maintenance',
      unclear: e.unclear,
      values: compact({
        ...common,
        performedAt: date(e.date),
        description: e.service?.description,
        workshop: e.service?.workshop,
        laborCost: str(e.service?.laborCost),
        partsCost: str(e.service?.partsCost),
      }),
    };
  }
  if (e.documentType === 'odometer_photo' && e.odometerKm != null) {
    return { kind: 'odometer', screen: 'odometer', unclear: e.unclear, values: compact({ readAt: date(e.date), km: str(e.odometerKm) }) };
  }
  return null;
}
