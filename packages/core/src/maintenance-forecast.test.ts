import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dailyDistanceKm, maintenanceForecast, odometerDecreases, odometerFromText } from './index.ts';

const d = (s: string) => new Date(s);
const now = d('2026-11-01T12:00:00');

test('dailyDistanceKm: first to last value in the window', () => {
  const pts = [
    { at: d('2026-09-01T12:00:00'), km: 10_000 },
    { at: d('2026-10-31T12:00:00'), km: 12_400 },
  ];
  assert.equal(dailyDistanceKm(pts, now), 40); // 2400 km / 60 days
});

test('dailyDistanceKm: null without a 14-day span or with old data only', () => {
  assert.equal(dailyDistanceKm([{ at: d('2026-10-30'), km: 1 }, { at: d('2026-10-31'), km: 100 }], now), null);
  assert.equal(dailyDistanceKm([{ at: d('2025-01-01'), km: 1 }, { at: d('2025-03-01'), km: 900 }], now), null);
  assert.equal(dailyDistanceKm([], now), null);
});

test('maintenanceForecast: null with fewer than two distinct visits', () => {
  assert.equal(maintenanceForecast([{ at: d('2026-01-01'), km: 5000 }], [], now), null);
  // two entries for the same job a few days apart count once
  assert.equal(maintenanceForecast([{ at: d('2026-01-01'), km: 5000 }, { at: d('2026-01-03'), km: 5010 }], [], now), null);
});

test('maintenanceForecast: median intervals and km-driven due date', () => {
  const visits = [
    { at: d('2025-03-01T12:00:00'), km: 10_000 },
    { at: d('2025-09-01T12:00:00'), km: 18_000 }, // 8000 km
    { at: d('2026-03-01T12:00:00'), km: 30_000 }, // 12000 km (odd one)
    { at: d('2026-08-01T12:00:00'), km: 40_000 }, // 10000 km
  ];
  const odo = [
    { at: d('2026-08-01T12:00:00'), km: 40_000 },
    { at: d('2026-10-31T12:00:00'), km: 49_000 }, // 9000 km in 91 days
  ];
  const f = maintenanceForecast(visits, odo, now);
  assert.ok(f);
  assert.equal(f.basedOn, 4);
  assert.equal(f.intervalKm, 10_000);
  assert.equal(f.dueKm, 50_000);
  assert.equal(f.kmLeft, 1_000);
  assert.ok(f.kmPerDay! > 98 && f.kmPerDay! < 100);
  // ~10 days after the last reading, well before the time-based date
  const days = (f.dueAt.getTime() - odo[1].at.getTime()) / 86_400_000;
  assert.ok(days > 9 && days < 11);
  assert.equal(f.quality, 'estimated');
});

test('maintenanceForecast: time only when visits have no odometer', () => {
  const f = maintenanceForecast([{ at: d('2025-06-01T12:00:00'), km: null }, { at: d('2026-06-01T12:00:00'), km: null }], [], now);
  assert.ok(f);
  assert.equal(f.intervalKm, null);
  assert.equal(f.kmLeft, null);
  assert.equal(f.intervalDays, 365);
  assert.equal(f.dueAt.toISOString(), d('2027-06-01T12:00:00').toISOString());
});

test('odometerDecreases flags readings below an earlier one', () => {
  const pts = [
    { at: d('2026-01-01'), km: 1000 },
    { at: d('2026-02-01'), km: 900 },
    { at: d('2026-03-01'), km: 1200 },
  ];
  assert.deepEqual(odometerDecreases(pts), [pts[1]]);
  assert.deepEqual(odometerDecreases([]), []);
});

test('odometerFromText: largest whole number, miles converted, null when none', () => {
  assert.equal(odometerFromText('12:45\n21°C\nTRIP A 123.4\n48 213 km\nRange 350 km'), 48_213);
  assert.equal(odometerFromText('ODO 10,000 mi'), 16_093);
  assert.equal(odometerFromText('no digits here'), null);
});
