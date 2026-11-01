import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  describeStats,
  economyIntervals,
  percentChange,
  previousPeriod,
  previousStats,
  statsDetails,
  vehicleStats,
  type StatsInput,
} from './index.ts';

const d = (s: string) => new Date(s);

test('economyIntervals: one value per full-to-full interval, partials count toward the next', () => {
  const out = economyIntervals([
    { at: d('2026-01-01'), odometerKm: 1000, liters: 40, full: true },
    { at: d('2026-01-10'), odometerKm: 1300, liters: 10, full: false },
    { at: d('2026-01-20'), odometerKm: 1500, liters: 20, full: true },
    { at: d('2026-02-01'), odometerKm: 2000, liters: 35, full: true },
  ]);
  assert.deepEqual(out.map((o) => Math.round(o.value * 100) / 100), [6, 7]);
  assert.deepEqual(economyIntervals([{ at: d('2026-01-01'), odometerKm: 1000, liters: 40, full: true }]), []);
});

test('previousPeriod: calendar months, cut to the elapsed span', () => {
  const march = { start: new Date(2026, 2, 1), end: new Date(2026, 3, 1) };
  const mid = previousPeriod(march, new Date(2026, 2, 11));
  assert.equal(mid.start.getTime(), new Date(2026, 1, 1).getTime());
  assert.equal(mid.end.getTime(), new Date(2026, 1, 11).getTime());
  const q = previousPeriod({ start: new Date(2026, 0, 1), end: new Date(2026, 3, 1) }, new Date(2026, 5, 1));
  assert.equal(q.start.getTime(), new Date(2025, 9, 1).getTime());
  assert.equal(q.end.getTime(), new Date(2026, 0, 1).getTime()); // never overlaps the current period
});

test('percentChange needs both values and a non-zero base', () => {
  assert.equal(percentChange(120, 100), 20);
  assert.equal(percentChange(80, 100), -20);
  assert.equal(percentChange(null, 100), null);
  assert.equal(percentChange(10, 0), null);
});

const input: StatsInput = {
  propulsion: 'gasoline',
  odometer: [
    { at: d('2026-01-01T00:00:00'), km: 1000 },
    { at: d('2026-01-31T00:00:00'), km: 1600 },
    { at: d('2026-02-28T00:00:00'), km: 2000 },
  ],
  fuel: [
    { at: d('2026-01-02'), odometerKm: 1000, liters: 40, fullFill: true, totalPaid: 72, currency: 'EUR' },
    { at: d('2026-01-12'), odometerKm: 1500, liters: 30, fullFill: true, totalPaid: 60, currency: 'EUR' },
    { at: d('2026-01-22'), odometerKm: 1600, liters: 10, fullFill: true, totalPaid: 19, currency: 'EUR' },
  ],
  charging: [],
  maintenance: [{ at: d('2026-02-10'), laborCost: 100, partsCost: 50, currency: 'EUR' }],
  expenses: [{ at: d('2026-02-11'), amount: 30, currency: 'USD' }],
};
const twoMonths = { start: new Date(2026, 0, 1), end: new Date(2026, 2, 1) };

test('statsDetails: months, habits and per-interval economy', () => {
  const x = statsDetails(input, twoMonths, new Date(2026, 2, 15));
  assert.equal(x.currency, 'EUR');
  assert.equal(x.months.length, 2);
  assert.equal(x.months[0].spend, 151);
  assert.equal(x.months[1].spend, 150); // the USD expense is not mixed in
  assert.equal(x.fillUps.count, 3);
  assert.equal(x.fillUps.avgDaysBetween, 10);
  assert.equal(x.fillUps.avgPricePerLiter, 151 / 80);
  assert.equal(x.fillUps.minPricePerLiter, 1.8);
  assert.equal(x.fillUps.maxPricePerLiter, 2);
  assert.deepEqual(x.economy.map((e) => Math.round(e.value * 100) / 100), [6, 10]);
  assert.equal(x.charging.avgCostPerKwh, null);
});

test('statsDetails: nothing recorded → empty and null, never zero guesses', () => {
  const empty: StatsInput = { propulsion: 'ev', odometer: [], fuel: [], charging: [], maintenance: [], expenses: [] };
  const x = statsDetails(empty, twoMonths, new Date(2026, 2, 15));
  assert.equal(x.currency, null);
  assert.equal(x.kmPerDay, null);
  assert.equal(x.fillUps.avgLiters, null);
  assert.equal(x.fillUps.avgDaysBetween, null);
  assert.deepEqual(x.economy, []);
});

test('describeStats mentions the change against the previous period and fill-up habits', () => {
  const feb = { start: new Date(2026, 1, 1), end: new Date(2026, 2, 1) };
  const jan = { start: new Date(2026, 0, 1), end: new Date(2026, 1, 1) };
  const text = describeStats(vehicleStats(input, jan), 'gasoline', {
    previous: previousStats(vehicleStats(input, { start: new Date(2025, 11, 1), end: jan.start })),
    details: statsDetails(input, jan, feb.end),
  });
  assert.match(text, /You filled up 3 times, about every 10 days, paying 1\.887 EUR\/L on average\./);
  assert.doesNotMatch(text, /previous period/); // December has no data to compare with
});
