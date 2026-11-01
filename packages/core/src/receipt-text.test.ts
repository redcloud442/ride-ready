import assert from 'node:assert/strict';
import { test } from 'node:test';
import { describeStats, parseAmount, readReceiptText, vehicleStats } from './index.ts';

test('parseAmount reads both decimal conventions', () => {
  assert.equal(parseAmount('1.234,56'), 1234.56);
  assert.equal(parseAmount('1,234.56'), 1234.56);
  assert.equal(parseAmount('45,20'), 45.2);
  assert.equal(parseAmount('1,859'), 1.859);
  assert.equal(parseAmount('12'), 12);
  assert.equal(parseAmount('abc'), null);
});

test('reads a European fuel receipt', () => {
  const r = readReceiptText(['SHELL Station 42', '14.03.2026 08:15', 'Super E10', '40,00 L', '1,859 €/L', 'TOTAL EUR', '74,36']);
  const e = r.extraction;
  assert.equal(e.documentType, 'fuel_receipt');
  assert.equal(e.date, '2026-03-14T08:15:00');
  assert.equal(e.currency, 'EUR');
  assert.equal(e.totalPaid, 74.36);
  assert.equal(e.fuel?.liters, 40);
  assert.equal(e.fuel?.pricePerLiter, 1.859);
  assert.equal(e.fuel?.station, null); // names are never guessed
  assert.equal(r.checks.fuelTotalsConsistent, true);
  assert.equal(r.quality, 'estimated');
});

test('flags a fuel receipt whose numbers do not add up', () => {
  const r = readReceiptText(['Diesel', '40.00 L', 'Price 1.859', 'Total 94.36']);
  assert.equal(r.checks.fuelTotalsConsistent, false);
});

test('leaves an ambiguous date and $ currency out', () => {
  const r = readReceiptText(['Unleaded 30.5 L', '03/04/2026', 'Total $ 98.10']);
  assert.equal(r.extraction.date, null);
  assert.equal(r.extraction.currency, null);
  assert.deepEqual(r.extraction.unclear, ['date', 'currency']);
});

test('reads a charging receipt', () => {
  const r = readReceiptText(['Ionity', '2026-05-02 19:40', 'Energy 41,2 kWh', '0,69 €/kWh', 'Total 28,43 €']);
  assert.equal(r.extraction.documentType, 'charging_receipt');
  assert.equal(r.extraction.charging?.kwhPurchased, 41.2);
  assert.equal(r.extraction.totalPaid, 28.43);
  assert.equal(r.extraction.fuel, null);
});

test('reads an odometer photo as its longest number, converting printed miles', () => {
  assert.equal(readReceiptText(['045 812', 'km', 'TRIP 123.4']).extraction.odometerKm, 45812);
  assert.equal(readReceiptText(['10000 mi']).extraction.odometerKm, 16093);
  assert.equal(readReceiptText(['nothing here']).extraction.odometerKm, null);
});

test('describeStats reports values and what is missing, never mixing currencies', () => {
  const period = { start: new Date('2026-01-01'), end: new Date('2026-02-01') };
  const empty = vehicleStats({ propulsion: 'gasoline', odometer: [], fuel: [], charging: [], maintenance: [], expenses: [] }, period);
  const text = describeStats(empty, 'gasoline');
  assert.match(text, /Distance is unavailable/);
  assert.match(text, /Fuel economy is unavailable/);
  assert.match(text, /No costs were recorded/);

  const mixed = vehicleStats(
    {
      propulsion: 'phev',
      odometer: [],
      fuel: [],
      charging: [],
      maintenance: [],
      expenses: [
        { at: new Date('2026-01-05'), amount: 10, currency: 'EUR' },
        { at: new Date('2026-01-06'), amount: 20, currency: 'USD' },
      ],
    },
    period,
  );
  const t = describeStats(mixed, 'phev');
  assert.match(t, /10\.00 EUR and 20\.00 USD/);
  assert.match(t, /plug-in hybrids/);
  assert.doesNotMatch(t, /per km/);
});
