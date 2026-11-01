import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  chargingKwh100km,
  costPerKm,
  distanceInPeriod,
  latestOdometer,
  monthOf,
  monthlyTotals,
  spendByCurrency,
} from './index.ts';

const d = (s: string) => new Date(s);
const oct = { start: d('2026-10-01T00:00:00'), end: d('2026-11-01T00:00:00') };

test('monthOf covers the calendar month', () => {
  const m = monthOf(d('2026-10-29T15:00:00'));
  assert.equal(m.start.getMonth(), 9);
  assert.equal(m.start.getDate(), 1);
  assert.equal(m.end.getMonth(), 10);
});

test('latestOdometer picks the newest date, then the higher km', () => {
  assert.equal(latestOdometer([]), null);
  const p = latestOdometer([
    { at: d('2026-10-02'), km: 100 },
    { at: d('2026-10-05'), km: 90 },
    { at: d('2026-10-05'), km: 95 },
  ]);
  assert.equal(p?.km, 95);
});

test('distanceInPeriod uses the last reading before the month as baseline', () => {
  const km = distanceInPeriod(
    [
      { at: d('2026-09-20'), km: 1000 },
      { at: d('2026-09-28'), km: 1100 },
      { at: d('2026-10-15'), km: 1300 },
      { at: d('2026-10-28'), km: 1450 },
      { at: d('2026-11-03'), km: 1600 },
    ],
    oct,
  );
  assert.equal(km, 350);
});

test('distanceInPeriod without baseline spans readings inside; null when it cannot', () => {
  assert.equal(
    distanceInPeriod([{ at: d('2026-10-03'), km: 10 }, { at: d('2026-10-20'), km: 260 }], oct),
    250,
  );
  assert.equal(distanceInPeriod([{ at: d('2026-10-03'), km: 10 }], oct), null);
  assert.equal(distanceInPeriod([{ at: d('2026-09-03'), km: 10 }], oct), null);
  assert.equal(distanceInPeriod([], oct), null);
});

test('spendByCurrency sums inside the period, per currency', () => {
  assert.deepEqual(
    spendByCurrency(
      [
        { at: d('2026-10-02'), amount: 50, currency: 'EUR' },
        { at: d('2026-10-10'), amount: 25.5, currency: 'EUR' },
        { at: d('2026-10-11'), amount: 10, currency: 'USD' },
        { at: d('2026-11-01T00:00:00'), amount: 99, currency: 'EUR' }, // end is exclusive
      ],
      oct,
    ),
    { EUR: 75.5, USD: 10 },
  );
});

test('costPerKm needs both values and positive distance', () => {
  assert.equal(costPerKm(100, 400), 0.25);
  assert.equal(costPerKm(null, 400), null);
  assert.equal(costPerKm(100, null), null);
  assert.equal(costPerKm(100, 0), null);
});

test('chargingKwh100km ignores the first session energy', () => {
  assert.equal(
    chargingKwh100km([
      { odometerKm: 1000, kwh: 40 },
      { odometerKm: 1200, kwh: 30 },
      { odometerKm: 1400, kwh: 34 },
    ]),
    16,
  );
  assert.equal(chargingKwh100km([{ odometerKm: 1000, kwh: 40 }]), null);
  assert.equal(chargingKwh100km([{ odometerKm: 1000, kwh: 40 }, { odometerKm: 1000, kwh: 10 }]), null);
});

test('monthlyTotals: oldest first, one currency, empty months are 0', () => {
  const rows = monthlyTotals(
    [
      { at: d('2026-08-15'), amount: 40, currency: 'EUR' },
      { at: d('2026-10-02'), amount: 10, currency: 'EUR' },
      { at: d('2026-10-20'), amount: 5, currency: 'EUR' },
      { at: d('2026-10-21'), amount: 99, currency: 'USD' },
      { at: d('2026-05-01'), amount: 77, currency: 'EUR' }, // outside the window
    ],
    'EUR',
    3,
    d('2026-10-29T12:00:00'),
  );
  assert.deepEqual(rows.map((r) => [r.start.getMonth(), r.total]), [[7, 40], [8, 0], [9, 15]]);
});
