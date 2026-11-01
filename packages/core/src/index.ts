// Shared domain types and calculations. Pure TS, no runtime deps, so mobile and api both import it.

export const VEHICLE_TYPES = ['car', 'motorcycle'] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const PROPULSIONS = ['gasoline', 'diesel', 'hybrid', 'phev', 'ev'] as const;
export type Propulsion = (typeof PROPULSIONS)[number];

// Shape returned by GET /api/vehicles.
export type VehicleSummary = {
  id: string;
  type: VehicleType;
  propulsion: Propulsion;
  make: string;
  model: string;
  year: number;
  variant: string | null;
  /** null for vehicles created before body styles existed; use defaultBodyStyle(type) */
  bodyStyle: BodyStyle | null;
  /** paint shown in the picture; null = the picture's own paint */
  color: VehicleColor | null;
  shared: boolean; // another family member's vehicle: records are editable, the vehicle itself isn't
};

// Body style picks the vehicle's illustration and nothing else (no calculation depends on it).
export const CAR_BODY_STYLES = ['sedan', 'hatchback', 'suv', 'pickup', 'van', 'coupe'] as const;
export const MOTORCYCLE_BODY_STYLES = ['sport', 'cruiser', 'scooter', 'adventure'] as const;
export const BODY_STYLES = [...CAR_BODY_STYLES, ...MOTORCYCLE_BODY_STYLES] as const;
export type BodyStyle = (typeof BODY_STYLES)[number];

export const bodyStylesFor = (type: VehicleType): readonly BodyStyle[] =>
  type === 'car' ? CAR_BODY_STYLES : MOTORCYCLE_BODY_STYLES;

export const defaultBodyStyle = (type: VehicleType): BodyStyle => (type === 'car' ? 'sedan' : 'sport');

/** The style to draw: the saved one if it fits the type, else the type's default. */
export const bodyStyleOf = (v: { type: VehicleType; bodyStyle?: BodyStyle | null }): BodyStyle =>
  v.bodyStyle && bodyStylesFor(v.type).includes(v.bodyStyle) ? v.bodyStyle : defaultBodyStyle(v.type);

/** Paint options for the vehicle picture (rendered per body style in docs/brand/vehicles). */
export const VEHICLE_COLORS = ['white', 'silver', 'graphite', 'black', 'red', 'blue', 'green', 'beige'] as const;
export type VehicleColor = (typeof VEHICLE_COLORS)[number];

/** User.preferences, read from the session and written with Better Auth updateUser. */
export type UserPreferences = { currency?: string; tripsEnabled?: boolean };

export const usesFuel = (p: Propulsion) => p !== 'ev';
export const usesCharging = (p: Propulsion) => p === 'phev' || p === 'ev';

// Every derived metric says how it was obtained (product principle: never pass an estimate off as measured).
export type MetricQuality = 'measured' | 'calculated' | 'estimated';

export type FillUp = {
  odometerKm: number;
  liters: number;
  full: boolean;
};

/**
 * Full-to-full fuel economy in L/100km. Partial fills between two full fills count toward the
 * second interval. Returns null when there aren't two full fills or the odometer doesn't advance,
 * instead of guessing.
 */
export function fuelEconomyL100km(fillUps: FillUp[]): number | null {
  const sorted = [...fillUps].sort((a, b) => a.odometerKm - b.odometerKm);
  const firstFull = sorted.findIndex((f) => f.full);
  if (firstFull === -1) return null;

  let liters = 0;
  let km = 0;
  let pending = 0;
  let lastFullKm = sorted[firstFull].odometerKm;
  for (const f of sorted.slice(firstFull + 1)) {
    pending += f.liters;
    if (!f.full) continue;
    liters += pending;
    km += f.odometerKm - lastFullKm;
    pending = 0;
    lastFullKm = f.odometerKm;
  }
  return km > 0 ? (liters / km) * 100 : null;
}

// ---------------------------------------------------------------------------------------------
// Vehicle records: response shapes of /api/vehicles/:vehicleId/<feature> (apps/api record modules).
// Prisma Decimal columns serialize as strings; dates as ISO strings.

export type DecimalString = string;
export type Page<T> = { items: T[]; nextCursor: string | null };

export const MAINTENANCE_KINDS = ['service', 'repair', 'inspection', 'tires', 'other'] as const;
export type MaintenanceKind = (typeof MAINTENANCE_KINDS)[number];

export const EXPENSE_CATEGORIES = [
  'insurance',
  'registration',
  'parking',
  'tolls',
  'tires',
  'modification',
  'cleaning',
  'other',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

type RecordBase = { id: string; vehicleId: string; createdAt: string; updatedAt: string };

export type OdometerReading = RecordBase & {
  readAt: string;
  km: DecimalString;
  source: 'manual' | 'photo_ocr' | 'trip_gps' | 'receipt';
  confidence: DecimalString | null;
};

export type FuelTransaction = RecordBase & {
  filledAt: string;
  odometerKm: DecimalString | null;
  liters: DecimalString;
  pricePerLiter: DecimalString;
  discount: DecimalString;
  totalPaid: DecimalString;
  currency: string;
  fullFill: boolean;
  station: string | null;
};

export type ChargingSession = RecordBase & {
  startedAt: string;
  odometerKm: DecimalString | null;
  kwhPurchased: DecimalString;
  cost: DecimalString;
  currency: string;
  chargerType: string | null;
  location: string | null;
  tariff: string | null;
  socStartPct: DecimalString | null;
  socEndPct: DecimalString | null;
};

export type MaintenanceRecord = RecordBase & {
  performedAt: string;
  odometerKm: DecimalString | null;
  kind: string;
  description: string;
  parts: { name: string; partNumber?: string; quantity?: number }[];
  laborCost: DecimalString | null;
  partsCost: DecimalString | null;
  currency: string | null;
  workshop: string | null;
};

export type Expense = RecordBase & {
  paidAt: string;
  category: string;
  amount: DecimalString;
  currency: string;
  note: string | null;
};

// ---------------------------------------------------------------------------------------------
// Ownership metrics. Inputs are plain numbers/dates; callers convert API strings first.

export type Period = { start: Date; end: Date }; // [start, end)

export function monthOf(date: Date): Period {
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
  };
}

export type OdometerPoint = { at: Date; km: number };

/** Most recent odometer value by date (ties → higher km). */
export function latestOdometer(points: OdometerPoint[]): OdometerPoint | null {
  let best: OdometerPoint | null = null;
  for (const p of points) {
    if (!best || p.at > best.at || (p.at.getTime() === best.at.getTime() && p.km > best.km)) best = p;
  }
  return best;
}

/**
 * Distance driven in a period, from recorded odometer values only: from the last value at or before
 * the start (else the first one inside the period) to the last one inside it. null when there is no
 * span to measure — never a guess.
 */
export function distanceInPeriod(points: OdometerPoint[], { start, end }: Period): number | null {
  const inside = points.filter((p) => p.at > start && p.at < end);
  const baseline =
    latestOdometer(points.filter((p) => p.at <= start)) ??
    inside.reduce<OdometerPoint | null>((first, p) => (!first || p.at < first.at ? p : first), null);
  const last = latestOdometer(inside);
  if (!baseline || !last || last.at <= baseline.at) return null;
  const km = last.km - baseline.km;
  return km > 0 ? km : null;
}

export type SpendItem = { at: Date; amount: number; currency: string };

/** Totals per currency for a period. Currencies are never converted or mixed. */
export function spendByCurrency(items: SpendItem[], { start, end }: Period): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const i of items) {
    if (i.at >= start && i.at < end) totals[i.currency] = (totals[i.currency] ?? 0) + i.amount;
  }
  return totals;
}

/** Totals in one currency for the last `months` calendar months, oldest first (current month last). */
export function monthlyTotals(items: SpendItem[], currency: string, months: number, now = new Date()) {
  return Array.from({ length: months }, (_, i) => {
    const period = monthOf(new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1));
    return { start: period.start, total: spendByCurrency(items, period)[currency] ?? 0 };
  });
}

export function costPerKm(spend: number | null, km: number | null): number | null {
  return spend != null && km != null && km > 0 ? spend / km : null;
}

export type ChargePoint = { odometerKm: number; kwh: number };

/**
 * Energy bought per 100 km between charging sessions that recorded the odometer ("at the plug":
 * includes charging losses, so it estimates consumption rather than measuring it). The first
 * session only opens the interval. null without two sessions and a positive distance.
 */
export function chargingKwh100km(sessions: ChargePoint[]): number | null {
  const sorted = [...sessions].sort((a, b) => a.odometerKm - b.odometerKm);
  if (sorted.length < 2) return null;
  const km = sorted[sorted.length - 1].odometerKm - sorted[0].odometerKm;
  const kwh = sorted.slice(1).reduce((sum, s) => sum + s.kwh, 0);
  return km > 0 ? (kwh / km) * 100 : null;
}

export type Metric = { value: number | null; unit: string; quality: MetricQuality; basis: string };

export type StatsInput = {
  propulsion: Propulsion;
  odometer: OdometerPoint[];
  fuel: { at: Date; odometerKm: number | null; liters: number; fullFill: boolean; totalPaid: number; currency: string }[];
  charging: { at: Date; odometerKm: number | null; kwhPurchased: number; cost: number; currency: string }[];
  maintenance: { at: Date; laborCost: number | null; partsCost: number | null; currency: string | null }[];
  expenses: SpendItem[];
};

export type VehicleStats = {
  period: Period;
  distance: Metric;
  fuelEconomy: Metric;
  chargingConsumption: Metric;
  fuelPurchased: Metric;
  energyPurchased: Metric; // kWh bought, not kWh the battery received
  spend: Record<'fuel' | 'charging' | 'maintenance' | 'other' | 'total', Record<string, number>>;
  costPerKm: Metric & { currency: string | null };
};

const sum = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) : null);

/**
 * Everything the Insights screen and the AI explanation are built from, for one period. Missing data
 * stays null. PHEVs get no per-energy consumption: their distance is shared between fuel and
 * electricity, so neither figure can be separated honestly.
 */
export function vehicleStats(input: StatsInput, period: Period): VehicleStats {
  const within = <T extends { at: Date }>(rows: T[]) => rows.filter((r) => r.at >= period.start && r.at < period.end);
  const fuel = within(input.fuel);
  const charging = within(input.charging);
  const blended = input.propulsion === 'phev';

  const fuelSpend = fuel.map((f) => ({ at: f.at, amount: f.totalPaid, currency: f.currency }));
  const chargingSpend = charging.map((c) => ({ at: c.at, amount: c.cost, currency: c.currency }));
  const maintenanceSpend = input.maintenance.flatMap((m) =>
    m.currency == null ? [] : [{ at: m.at, amount: (m.laborCost ?? 0) + (m.partsCost ?? 0), currency: m.currency }],
  );
  const total = spendByCurrency([...fuelSpend, ...chargingSpend, ...maintenanceSpend, ...input.expenses], period);
  const currencies = Object.keys(total);
  const single = currencies.length === 1 ? currencies[0] : null;
  const distanceKm = distanceInPeriod(input.odometer, period);

  return {
    period,
    distance: { value: distanceKm, unit: 'km', quality: 'calculated', basis: 'odometer readings around the period' },
    fuelEconomy: {
      value: blended
        ? null
        : fuelEconomyL100km(
            fuel.flatMap((f) => (f.odometerKm == null ? [] : [{ odometerKm: f.odometerKm, liters: f.liters, full: f.fullFill }])),
          ),
      unit: 'L/100km',
      quality: 'calculated',
      basis: 'full-to-full fill-ups with odometer',
    },
    chargingConsumption: {
      value: blended
        ? null
        : chargingKwh100km(charging.flatMap((c) => (c.odometerKm == null ? [] : [{ odometerKm: c.odometerKm, kwh: c.kwhPurchased }]))),
      unit: 'kWh/100km',
      quality: 'estimated',
      basis: 'energy bought between charging sessions with odometer; includes charging losses',
    },
    fuelPurchased: { value: sum(fuel.map((f) => f.liters)), unit: 'L', quality: 'measured', basis: 'fuel transactions' },
    energyPurchased: { value: sum(charging.map((c) => c.kwhPurchased)), unit: 'kWh', quality: 'measured', basis: 'charging sessions' },
    spend: {
      fuel: spendByCurrency(fuelSpend, period),
      charging: spendByCurrency(chargingSpend, period),
      maintenance: spendByCurrency(maintenanceSpend, period),
      other: spendByCurrency(input.expenses, period),
      total,
    },
    costPerKm: {
      value: single ? costPerKm(total[single], distanceKm) : null,
      unit: 'per km',
      currency: single,
      quality: 'calculated',
      basis: 'all recorded costs over distance, single currency only',
    },
  };
}

/** L/100km for each full-to-full interval (partial fills count toward the next full one), oldest first. */
export function economyIntervals(fills: (FillUp & { at: Date })[]): { at: Date; value: number }[] {
  const sorted = [...fills].sort((a, b) => a.odometerKm - b.odometerKm);
  const out: { at: Date; value: number }[] = [];
  let lastFullKm: number | null = null;
  let liters = 0;
  for (const f of sorted) {
    if (lastFullKm == null) {
      if (f.full) lastFullKm = f.odometerKm;
      continue;
    }
    liters += f.liters;
    if (!f.full) continue;
    const km = f.odometerKm - lastFullKm;
    if (km > 0) out.push({ at: f.at, value: (liters / km) * 100 });
    lastFullKm = f.odometerKm;
    liters = 0;
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

const isMonthStart = (d: Date) => d.getDate() === 1 && d.getHours() === 0 && d.getMinutes() === 0;

/**
 * The period before, cut to the same elapsed span, so "this month so far" compares with the same
 * number of days last month. Calendar months stay calendar months.
 */
export function previousPeriod({ start, end }: Period, now = new Date()): Period {
  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
  const prevStart =
    months > 0 && isMonthStart(start) && isMonthStart(end)
      ? new Date(start.getFullYear(), start.getMonth() - months, 1)
      : new Date(start.getTime() - (end.getTime() - start.getTime()));
  // a finished period compares with the whole previous one (months differ in length)
  if (now >= end) return { start: prevStart, end: start };
  const elapsed = now.getTime() - start.getTime();
  return { start: prevStart, end: new Date(Math.min(prevStart.getTime() + elapsed, start.getTime())) };
}

/** Relative change in %, or null when either side is missing or the previous value is 0. */
export function percentChange(current: number | null, previous: number | null): number | null {
  return current == null || previous == null || previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100;
}

/** The figures Insights compares against ("vs previous period"). */
export type PreviousStats = Pick<VehicleStats, 'period' | 'distance' | 'fuelEconomy' | 'chargingConsumption' | 'costPerKm'> & {
  spendTotal: Record<string, number>;
};

export const previousStats = ({ period, distance, fuelEconomy, chargingConsumption, costPerKm, spend }: VehicleStats): PreviousStats => ({
  period,
  distance,
  fuelEconomy,
  chargingConsumption,
  costPerKm,
  spendTotal: spend.total,
});

export type StatsDetails = {
  /** currency of the money figures below: the period's largest spend; null when nothing was spent */
  currency: string | null;
  /** calendar months of the period up to now, oldest first; spend in `currency` only */
  months: { start: Date; distanceKm: number | null; spend: number }[];
  /** L/100km per full-to-full interval (not for PHEVs), oldest first */
  economy: { at: Date; value: number }[];
  fillUps: {
    count: number;
    avgLiters: number | null;
    /** total paid ÷ liters, fill-ups in `currency` only */
    avgPricePerLiter: number | null;
    minPricePerLiter: number | null;
    maxPricePerLiter: number | null;
    avgDaysBetween: number | null;
  };
  charging: { count: number; avgKwh: number | null; avgCostPerKwh: number | null };
  /** distance ÷ days elapsed in the period */
  kmPerDay: number | null;
};

const DAY_MS = 86_400_000;
const avg = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

/**
 * The deeper Insights breakdown for one period: monthly trend, economy per interval and fill-up /
 * charging habits. Built only from recorded values; anything without enough data stays null.
 */
export function statsDetails(input: StatsInput, period: Period, now = new Date()): StatsDetails {
  const within = <T extends { at: Date }>(rows: T[]) => rows.filter((r) => r.at >= period.start && r.at < period.end);
  const fuel = within(input.fuel);
  const charging = within(input.charging);
  const spendItems: SpendItem[] = [
    ...fuel.map((f) => ({ at: f.at, amount: f.totalPaid, currency: f.currency })),
    ...charging.map((c) => ({ at: c.at, amount: c.cost, currency: c.currency })),
    ...within(input.maintenance).flatMap((m) =>
      m.currency == null ? [] : [{ at: m.at, amount: (m.laborCost ?? 0) + (m.partsCost ?? 0), currency: m.currency }],
    ),
    ...within(input.expenses),
  ];
  const totals = Object.entries(spendByCurrency(spendItems, period)).sort((a, b) => b[1] - a[1]);
  const currency = totals[0]?.[0] ?? null;

  const months: StatsDetails['months'] = [];
  for (let m = monthOf(period.start); m.start < period.end && m.start <= now; m = monthOf(m.end)) {
    months.push({
      start: m.start,
      distanceKm: distanceInPeriod(input.odometer, m),
      spend: currency ? (spendByCurrency(spendItems, m)[currency] ?? 0) : 0,
    });
  }

  const priced = fuel.filter((f) => f.currency === currency && f.liters > 0);
  const prices = priced.map((f) => f.totalPaid / f.liters);
  const litersPriced = priced.reduce((s, f) => s + f.liters, 0);
  const fillDates = fuel.map((f) => f.at.getTime()).sort((a, b) => a - b);
  const gaps = fillDates.slice(1).map((t, i) => (t - fillDates[i]) / DAY_MS);
  const charged = charging.filter((c) => c.currency === currency && c.kwhPurchased > 0);
  const kwhCharged = charged.reduce((s, c) => s + c.kwhPurchased, 0);

  const distance = distanceInPeriod(input.odometer, period);
  const elapsedDays = (Math.min(now.getTime(), period.end.getTime()) - period.start.getTime()) / DAY_MS;

  return {
    currency,
    months,
    economy:
      input.propulsion === 'phev'
        ? []
        : economyIntervals(fuel.flatMap((f) => (f.odometerKm == null ? [] : [{ at: f.at, odometerKm: f.odometerKm, liters: f.liters, full: f.fullFill }]))),
    fillUps: {
      count: fuel.length,
      avgLiters: avg(fuel.map((f) => f.liters)),
      avgPricePerLiter: litersPriced > 0 ? priced.reduce((s, f) => s + f.totalPaid, 0) / litersPriced : null,
      minPricePerLiter: prices.length ? Math.min(...prices) : null,
      maxPricePerLiter: prices.length ? Math.max(...prices) : null,
      avgDaysBetween: avg(gaps),
    },
    charging: {
      count: charging.length,
      avgKwh: avg(charging.map((c) => c.kwhPurchased)),
      avgCostPerKwh: kwhCharged > 0 ? charged.reduce((s, c) => s + c.cost, 0) / kwhCharged : null,
    },
    kmPerDay: distance != null && elapsedDays >= 1 ? distance / elapsedDays : null,
  };
}

const QUALITY_RANK: Record<MetricQuality, number> = { measured: 0, calculated: 1, estimated: 2 };

/** Label for something built from several metrics: the weakest one that has a value. null when none has one. */
export function weakestQuality(metrics: Metric[]): MetricQuality | null {
  let weakest: MetricQuality | null = null;
  for (const m of metrics) {
    if (m.value != null && (weakest == null || QUALITY_RANK[m.quality] > QUALITY_RANK[weakest])) weakest = m.quality;
  }
  return weakest;
}

/**
 * Whether a fuel receipt adds up: liters × price − discount ≈ total, within 2% or 0.05 (pump rounding).
 * A mismatch usually means a misread digit, so the user should check before saving.
 */
export function fuelReceiptConsistent(r: { liters: number; pricePerLiter: number; discount: number; totalPaid: number }): boolean {
  const expected = r.liters * r.pricePerLiter - r.discount;
  return Math.abs(expected - r.totalPaid) <= Math.max(0.05, r.totalPaid * 0.02);
}

/**
 * Fills in the missing one of liters / price per liter / total from the other two
 * (total = liters × price − discount). null when fewer than two are known or the result isn't positive.
 * Rounds the derived value only: liters 2 dp, price 3 dp, total 2 dp.
 */
export function completeFuelAmounts(input: {
  liters?: number | null;
  pricePerLiter?: number | null;
  totalPaid?: number | null;
  discount?: number | null;
}): { liters: number; pricePerLiter: number; totalPaid: number } | null {
  const { liters, pricePerLiter, totalPaid } = input;
  const discount = input.discount ?? 0;
  const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp;
  const ok = (n: number) => Number.isFinite(n) && n > 0;

  if (liters != null && pricePerLiter != null) {
    const total = totalPaid ?? round(liters * pricePerLiter - discount, 2);
    return ok(liters) && ok(pricePerLiter) && ok(total) ? { liters, pricePerLiter, totalPaid: total } : null;
  }
  if (liters != null && totalPaid != null) {
    const price = round((totalPaid + discount) / liters, 3);
    return ok(liters) && ok(price) ? { liters, pricePerLiter: price, totalPaid } : null;
  }
  if (pricePerLiter != null && totalPaid != null) {
    const l = round((totalPaid + discount) / pricePerLiter, 2);
    return ok(l) && ok(pricePerLiter) ? { liters: l, pricePerLiter, totalPaid } : null;
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// Trips (/api/vehicles/:vehicleId/trips). List items omit `route` (private location history).

export const TRIP_PURPOSES = ['personal', 'business'] as const;
export type TripPurpose = (typeof TRIP_PURPOSES)[number];

export type Trip = RecordBase & {
  startedAt: string;
  endedAt: string | null;
  gpsKm: DecimalString | null; // GPS distance; never written into odometer readings
  purpose: TripPurpose;
  notes: string | null;
};

export type GeoPoint = { lat: number; lng: number };

/** Great-circle distance in km (haversine). */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Google encoded polyline (precision 5), the `route` format the trips API stores. */
export function encodePolyline(points: GeoPoint[]): string {
  let out = '';
  let prevLat = 0;
  let prevLng = 0;
  const encode = (value: number) => {
    let v = value < 0 ? ~(value << 1) : value << 1;
    let chunk = '';
    while (v >= 0x20) {
      chunk += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }
    return chunk + String.fromCharCode(v + 63);
  };
  for (const p of points) {
    const lat = Math.round(p.lat * 1e5);
    const lng = Math.round(p.lng * 1e5);
    out += encode(lat - prevLat) + encode(lng - prevLng);
    prevLat = lat;
    prevLng = lng;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Battery health (/battery-health): state of health from a supported measurement only.

export type BatteryHealthRecord = RecordBase & {
  measuredAt: string;
  sohPct: DecimalString;
  source: string;
};

// ---------------------------------------------------------------------------------------------
// Documents (/documents). Files live in private storage; the API hands out short-lived URLs.

export const DOCUMENT_KINDS = ['receipt', 'manual', 'warranty', 'insurance', 'registration', 'photo'] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];
export const DOCUMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/webp', 'application/pdf'] as const;
export type DocumentMimeType = (typeof DOCUMENT_MIME_TYPES)[number];
export const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;

export type VehicleDocument = RecordBase & {
  kind: DocumentKind;
  mimeType: DocumentMimeType;
  title: string | null;
  expiresAt: string | null;
};
export type VehicleDocumentWithUrl = VehicleDocument & { downloadUrl: string };
export type CreatedDocument = VehicleDocument & {
  upload: { url: string; method: 'PUT'; headers: Record<string, string> };
};

/** On-device OCR of a receipt or photo, parsed by `readReceiptText`. Always to be confirmed. */
export type DocumentExtraction = {
  documentId: string;
  quality: 'estimated';
  extraction: {
    documentType: 'fuel_receipt' | 'charging_receipt' | 'service_invoice' | 'odometer_photo' | 'other';
    date: string | null;
    currency: string | null;
    totalPaid: number | null;
    fuel: { liters: number | null; pricePerLiter: number | null; discount: number | null; station: string | null } | null;
    charging: { kwhPurchased: number | null; location: string | null; tariff: string | null } | null;
    service: { description: string | null; workshop: string | null; laborCost: number | null; partsCost: number | null } | null;
    odometerKm: number | null;
    unclear: string[];
  };
  checks: { fuelTotalsConsistent: boolean | null };
};

/**
 * A receipt number in either decimal convention: "1.234,56" and "1,234.56" → 1234.56. With a single
 * separator it is read as the decimal point ("45,20" → 45.2, "1,859" → 1.859): receipts print
 * decimals far more often than bare thousands.
 */
export function parseAmount(raw: string): number | null {
  const s = raw.replace(/\s/g, '');
  if (!/^\d+([.,]\d+)*$/.test(s)) return null;
  const lastSep = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','));
  const n = lastSep === -1 ? Number(s) : Number(`${s.slice(0, lastSep).replace(/[.,]/g, '')}.${s.slice(lastSep + 1)}`);
  return Number.isFinite(n) ? n : null;
}

const NUM = String.raw`(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d+)?|\d+(?:[.,]\d+)?)`;
const CURRENCY_CODES = ['EUR', 'USD', 'GBP', 'PHP', 'AUD', 'CAD', 'NZD', 'SGD', 'MYR', 'IDR', 'THB', 'VND', 'INR', 'JPY', 'CNY', 'HKD', 'KRW', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'ZAR', 'AED', 'SAR', 'MXN', 'BRL'];
// unambiguous symbols only: "$", "¥" and "kr" are shared by several currencies
const CURRENCY_SYMBOLS: Record<string, string> = { '€': 'EUR', '£': 'GBP', '₱': 'PHP', '₹': 'INR', '₩': 'KRW', '₫': 'VND', '฿': 'THB' };

/** The number captured by `pattern` (group 1), e.g. the "42,10" in "42,10 L". */
function amountNear(text: string, pattern: string) {
  const m = new RegExp(pattern, 'i').exec(text);
  return m ? parseAmount(m[1]) : null;
}

/** Last amount on the first line matching `label`, or on the line after it (OCR often splits columns). */
function labelledAmount(lines: string[], label: RegExp, exclude?: RegExp) {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!label.test(lines[i]) || exclude?.test(lines[i])) continue;
    for (const line of [lines[i], lines[i + 1] ?? '']) {
      const nums = [...line.matchAll(new RegExp(NUM, 'g'))].map((m) => parseAmount(m[1])).filter((n) => n != null);
      if (nums.length) return nums[nums.length - 1];
    }
  }
  return null;
}

function receiptDate(text: string): { value: string | null; ambiguous: boolean } {
  const time = /\b([01]?\d|2[0-3]):([0-5]\d)\b/.exec(text);
  const hhmm = time ? `T${time[1].padStart(2, '0')}:${time[2]}:00` : 'T12:00:00';
  const iso = /\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/.exec(text);
  const dmy = /\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2}|\d{2})\b/.exec(text);
  let y: number, mo: number, d: number;
  if (iso) [y, mo, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  else if (dmy) {
    const [a, b] = [Number(dmy[1]), Number(dmy[2])];
    y = dmy[3].length === 2 ? 2000 + Number(dmy[3]) : Number(dmy[3]);
    // 03/04 could be 3 April or March 4: only a part above 12 settles it
    if (a > 12) [d, mo] = [a, b];
    else if (b > 12) [mo, d] = [a, b];
    else return { value: null, ambiguous: true };
  } else return { value: null, ambiguous: false };
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return { value: null, ambiguous: true };
  return { value: `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}${hhmm}`, ambiguous: false };
}

/**
 * Reads on-device OCR text (lines or blocks) of a fuel/charging receipt, service invoice or odometer
 * photo. Keyword and pattern based: anything not found stays null, never guessed, and the user
 * confirms every value. Station, location and workshop names are left to the user.
 */
export function readReceiptText(lines: string[]): Omit<DocumentExtraction, 'documentId'> {
  const clean = lines.flatMap((l) => l.split('\n')).map((l) => l.trim()).filter(Boolean);
  const text = clean.join('\n');
  const unclear: string[] = [];

  const isCharging = /kwh/i.test(text);
  const isFuel = !isCharging && (/\b(litres?|liters?|ltrs?|unleaded|diesel|petrol|gasoline|gasolina|fuel|pump|ron\s?9\d|e10)\b/i.test(text) || new RegExp(`${NUM}\\s?L\\b`).test(text));
  const isService = !isCharging && !isFuel && /\b(labou?r|parts|service|oil change|workshop|repair)\b/i.test(text);
  const hasMoney = /\b(total|amount|cash|change|vat|tax)\b/i.test(text);
  const isOdometer = !isCharging && !isFuel && !isService && !hasMoney;

  const documentType = isCharging ? 'charging_receipt' : isFuel ? 'fuel_receipt' : isService ? 'service_invoice' : isOdometer ? 'odometer_photo' : 'other';

  const date = receiptDate(text);
  if (date.ambiguous) unclear.push('date');

  const code = CURRENCY_CODES.find((c) => new RegExp(`\\b${c}\\b`).test(text));
  const symbol = Object.keys(CURRENCY_SYMBOLS).find((s) => text.includes(s));
  const currency = code ?? (symbol ? CURRENCY_SYMBOLS[symbol] : null);
  if (!currency && /[$¥]/.test(text)) unclear.push('currency');

  const totalPaid = isOdometer
    ? null
    : labelledAmount(clean, /\b(total|amount due|amount|to pay|sale)\b/i, /\b(sub\s?total|vat|tax|net)\b/i);

  let odometerKm: number | null = null;
  if (isOdometer) {
    // the odometer is the longest whole number on the photo; trip meters are shorter or have a decimal
    const candidates = [...text.matchAll(/\b(\d{1,3}(?:[ ,.]\d{3})+|\d{3,7})\b(?![.,]\d)/g)].map((m) => Number(m[1].replace(/\D/g, '')));
    const max = candidates.length ? Math.max(...candidates) : null;
    odometerKm = max == null ? null : /\b(mi|miles)\b/i.test(text) ? Math.round(max * 1.609344) : max;
  } else {
    odometerKm = labelledAmount(clean, /\b(odometer|odo|mileage|kilometerstand|km stand)\b/i);
  }

  const fuel = isFuel
    ? {
        liters: amountNear(text, `${NUM}\\s?(?:L|ltrs?|litres?|liters?)\\b(?!\\s?\\/)`),
        // "1,859/L", "1,859 €/L" or a "Price" / "@" line
        pricePerLiter: amountNear(text, `${NUM}\\s?\\S{0,3}?\\s?(?:\\/|per\\s)\\s?(?:L|ltr|litre|liter)\\b`) ?? labelledAmount(clean, /\b(price|unit price)\b|@/i),
        discount: labelledAmount(clean, /\b(discount|rebate)\b/i),
        station: null,
      }
    : null;

  const fuelTotalsConsistent =
    fuel && fuel.liters != null && fuel.pricePerLiter != null && totalPaid != null
      ? fuelReceiptConsistent({ liters: fuel.liters, pricePerLiter: fuel.pricePerLiter, discount: fuel.discount ?? 0, totalPaid })
      : null;

  return {
    quality: 'estimated',
    extraction: {
      documentType,
      date: date.value,
      currency,
      totalPaid,
      fuel,
      charging: isCharging
        ? { kwhPurchased: amountNear(text, `${NUM}\\s?kwh\\b(?!\\s?\\/)`), location: null, tariff: null }
        : null,
      service: isService
        ? { description: null, workshop: null, laborCost: labelledAmount(clean, /\blabou?r\b/i), partsCost: labelledAmount(clean, /\bparts\b/i) }
        : null,
      odometerKm,
      unclear,
    },
    checks: { fuelTotalsConsistent },
  };
}

const fmt = (n: number, dp = 1) => n.toFixed(dp);
const money = (byCurrency: Record<string, number>) =>
  Object.entries(byCurrency).map(([c, v]) => `${fmt(v, 2)} ${c}`).join(' and ');

/**
 * Plain-language summary of a period, built only from the computed metrics. Missing values say what to
 * record instead of guessing; currencies are never added together.
 */
export function describeStats(
  stats: VehicleStats,
  propulsion: Propulsion,
  extra: { previous?: PreviousStats; details?: StatsDetails } = {},
): string {
  const out: string[] = [];
  const { distance, fuelEconomy, chargingConsumption, spend, costPerKm: perKm } = stats;
  const { previous, details } = extra;
  // "12% more than ..." only when both periods have the value
  const change = (current: number | null, prev: number | null | undefined, what: string) => {
    const pct = percentChange(current, prev ?? null);
    if (pct == null || Math.abs(pct) < 1) return;
    out.push(`${what} ${fmt(Math.abs(pct), 0)}% ${pct > 0 ? 'more' : 'less'} than the same point in the previous period.`);
  };

  out.push(
    distance.value != null
      ? `You drove ${fmt(distance.value, 0)} km, from your odometer readings.`
      : 'Distance is unavailable: log an odometer reading at the start and end of the period.',
  );
  change(distance.value, previous?.distance.value, 'That is');
  if (propulsion === 'phev') {
    out.push("Fuel economy and charging consumption aren't shown for plug-in hybrids, because the distance is shared between fuel and electricity.");
  } else {
    if (usesFuel(propulsion)) {
      out.push(
        fuelEconomy.value != null
          ? `Fuel economy was ${fmt(fuelEconomy.value)} L/100km between full fill-ups.`
          : 'Fuel economy is unavailable: log two full fill-ups with the odometer.',
      );
    }
    if (usesCharging(propulsion)) {
      out.push(
        chargingConsumption.value != null
          ? `Charging used about ${fmt(chargingConsumption.value)} kWh/100km. This is an estimate that includes charging losses.`
          : 'Charging consumption is unavailable: log two charging sessions with the odometer.',
      );
    }
  }
  if (Object.keys(spend.total).length) {
    out.push(`You spent ${money(spend.total)} in total.`);
    if (perKm.value != null && perKm.currency) out.push(`That is ${fmt(perKm.value, 2)} ${perKm.currency} per km.`);
    const cur = details?.currency;
    if (cur) change(spend.total[cur] ?? null, previous?.spendTotal[cur], `Spending in ${cur} was`);
  } else {
    out.push('No costs were recorded in this period.');
  }
  const f = details?.fillUps;
  if (f && f.count > 0) {
    const every = f.avgDaysBetween != null ? `, about every ${fmt(f.avgDaysBetween, 0)} days` : '';
    const price = f.avgPricePerLiter != null && details.currency ? `, paying ${fmt(f.avgPricePerLiter, 3)} ${details.currency}/L on average` : '';
    out.push(`You filled up ${f.count} ${f.count === 1 ? 'time' : 'times'}${every}${price}.`);
  }
  return out.join(' ');
}

// ---------------------------------------------------------------------------------------------
// Energy prices (/api/energy-prices): timestamped community submissions (plan §3).

export const ENERGY_PRICE_KINDS = ['gasoline_regular', 'gasoline_premium', 'diesel', 'electricity_ac', 'electricity_dc'] as const;
export type EnergyPriceKind = (typeof ENERGY_PRICE_KINDS)[number];

export type EnergyPriceObservation = {
  id: string;
  kind: EnergyPriceKind;
  price: DecimalString;
  currency: string;
  unit: 'L' | 'kWh';
  region: string | null;
  source: string;
  observedAt: string;
  createdAt: string;
};
