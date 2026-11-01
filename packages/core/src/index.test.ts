import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  fuelEconomyL100km,
  fuelReceiptConsistent,
  vehicleStats,
  weakestQuality,
  type StatsInput,
} from './index.ts';

test('full-to-full interval', () => {
  assert.equal(
    fuelEconomyL100km([
      { odometerKm: 1000, liters: 40, full: true },
      { odometerKm: 1500, liters: 30, full: true },
    ]),
    6,
  );
});

test('partial fill counts toward next full interval, input order ignored', () => {
  assert.equal(
    fuelEconomyL100km([
      { odometerKm: 1400, liters: 20, full: true },
      { odometerKm: 1000, liters: 40, full: true },
      { odometerKm: 1200, liters: 10, full: false },
    ]),
    7.5,
  );
});

test('trailing partial fill is ignored', () => {
  assert.equal(
    fuelEconomyL100km([
      { odometerKm: 0, liters: 10, full: true },
      { odometerKm: 100, liters: 5, full: true },
      { odometerKm: 150, liters: 3, full: false },
    ]),
    5,
  );
});

test('not enough data returns null', () => {
  assert.equal(fuelEconomyL100km([]), null);
  assert.equal(fuelEconomyL100km([{ odometerKm: 0, liters: 10, full: false }]), null);
  assert.equal(fuelEconomyL100km([{ odometerKm: 0, liters: 10, full: true }]), null);
});

const day = (s: string) => new Date(s);
const october = { start: day('2026-10-01T00:00:00'), end: day('2026-11-01T00:00:00') };
const empty: StatsInput = { propulsion: 'gasoline', odometer: [], fuel: [], charging: [], maintenance: [], expenses: [] };

test('stats: no data → null metrics, empty spend', () => {
  const s = vehicleStats(empty, october);
  for (const m of [s.distance, s.fuelEconomy, s.chargingConsumption, s.fuelPurchased, s.energyPurchased, s.costPerKm]) {
    assert.equal(m.value, null);
  }
  assert.deepEqual(s.spend.total, {});
});

test('stats: single currency gives cost per km; records outside the period are ignored', () => {
  const s = vehicleStats(
    {
      ...empty,
      odometer: [
        { at: day('2026-09-30T12:00:00'), km: 1000 },
        { at: day('2026-10-30T12:00:00'), km: 1500 },
      ],
      fuel: [
        { at: day('2026-10-02T12:00:00'), odometerKm: 1000, liters: 40, fullFill: true, totalPaid: 60, currency: 'EUR' },
        { at: day('2026-10-20T12:00:00'), odometerKm: 1500, liters: 30, fullFill: true, totalPaid: 45, currency: 'EUR' },
        { at: day('2026-09-01T12:00:00'), odometerKm: 500, liters: 99, fullFill: true, totalPaid: 999, currency: 'EUR' },
      ],
      maintenance: [
        { at: day('2026-10-05T12:00:00'), laborCost: 50, partsCost: 20, currency: 'EUR' },
        { at: day('2026-10-06T12:00:00'), laborCost: null, partsCost: null, currency: null },
      ],
      expenses: [{ at: day('2026-10-07T12:00:00'), amount: 25, currency: 'EUR' }],
    },
    october,
  );
  assert.equal(s.distance.value, 500);
  assert.equal(s.fuelEconomy.value, 6);
  assert.equal(s.fuelPurchased.value, 70);
  assert.deepEqual(s.spend.total, { EUR: 200 });
  assert.equal(s.costPerKm.value, 0.4);
  assert.equal(s.costPerKm.currency, 'EUR');
});

test('stats: mixed currencies → no cost per km', () => {
  const s = vehicleStats(
    {
      ...empty,
      propulsion: 'ev',
      odometer: [
        { at: day('2026-10-01T12:00:00'), km: 0 },
        { at: day('2026-10-30T12:00:00'), km: 100 },
      ],
      charging: [{ at: day('2026-10-10T12:00:00'), odometerKm: null, kwhPurchased: 20, cost: 6, currency: 'EUR' }],
      expenses: [{ at: day('2026-10-11T12:00:00'), amount: 10, currency: 'USD' }],
    },
    october,
  );
  assert.equal(s.energyPurchased.value, 20);
  assert.equal(s.costPerKm.value, null);
  assert.equal(s.costPerKm.currency, null);
});

test('stats: PHEV gets no per-energy consumption', () => {
  const s = vehicleStats(
    {
      ...empty,
      propulsion: 'phev',
      fuel: [
        { at: day('2026-10-02T12:00:00'), odometerKm: 1000, liters: 20, fullFill: true, totalPaid: 30, currency: 'EUR' },
        { at: day('2026-10-20T12:00:00'), odometerKm: 1800, liters: 20, fullFill: true, totalPaid: 30, currency: 'EUR' },
      ],
      charging: [
        { at: day('2026-10-03T12:00:00'), odometerKm: 1100, kwhPurchased: 10, cost: 3, currency: 'EUR' },
        { at: day('2026-10-10T12:00:00'), odometerKm: 1300, kwhPurchased: 10, cost: 3, currency: 'EUR' },
      ],
    },
    october,
  );
  assert.equal(s.fuelEconomy.value, null);
  assert.equal(s.chargingConsumption.value, null);
  assert.equal(s.fuelPurchased.value, 40);
});

test('weakestQuality: weakest among metrics with a value; null when none has one', () => {
  const m = (value: number | null, quality: 'measured' | 'calculated' | 'estimated') => ({ value, quality, unit: '', basis: '' });
  assert.equal(weakestQuality([m(1, 'measured'), m(2, 'calculated'), m(null, 'estimated')]), 'calculated');
  assert.equal(weakestQuality([m(1, 'measured'), m(3, 'estimated')]), 'estimated');
  assert.equal(weakestQuality([m(null, 'measured')]), null);
});

test('fuel receipt consistency allows pump rounding, flags misreads', () => {
  assert.equal(fuelReceiptConsistent({ liters: 40.5, pricePerLiter: 1.899, discount: 0, totalPaid: 76.91 }), true);
  assert.equal(fuelReceiptConsistent({ liters: 40, pricePerLiter: 1.5, discount: 5, totalPaid: 55 }), true);
  assert.equal(fuelReceiptConsistent({ liters: 46.5, pricePerLiter: 1.899, discount: 0, totalPaid: 76.91 }), false);
});
