import assert from 'node:assert/strict';
import { test } from 'node:test';
import { completeFuelAmounts, fuelReceiptConsistent } from './index.ts';

test('total from liters and price (minus discount)', () => {
  assert.deepEqual(completeFuelAmounts({ liters: 40, pricePerLiter: 1.8 }), { liters: 40, pricePerLiter: 1.8, totalPaid: 72 });
  assert.deepEqual(completeFuelAmounts({ liters: 40, pricePerLiter: 1.8, discount: 2 }), { liters: 40, pricePerLiter: 1.8, totalPaid: 70 });
});

test('price from liters and total', () => {
  assert.deepEqual(completeFuelAmounts({ liters: 40.3, totalPaid: 72.5 }), { liters: 40.3, pricePerLiter: 1.799, totalPaid: 72.5 });
});

test('liters from price and total', () => {
  assert.deepEqual(completeFuelAmounts({ pricePerLiter: 1.8, totalPaid: 72 }), { liters: 40, pricePerLiter: 1.8, totalPaid: 72 });
});

test('all three given are kept as typed', () => {
  assert.deepEqual(completeFuelAmounts({ liters: 40, pricePerLiter: 1.8, totalPaid: 71.9 }), { liters: 40, pricePerLiter: 1.8, totalPaid: 71.9 });
});

test('fewer than two values, or nonsense, gives null', () => {
  assert.equal(completeFuelAmounts({ liters: 40 }), null);
  assert.equal(completeFuelAmounts({}), null);
  assert.equal(completeFuelAmounts({ liters: 0, totalPaid: 10 }), null);
  assert.equal(completeFuelAmounts({ liters: 10, pricePerLiter: 1, discount: 20 }), null);
});

test('completed amounts pass the receipt consistency check', () => {
  const c = completeFuelAmounts({ liters: 37.42, totalPaid: 66.98 })!;
  assert.ok(fuelReceiptConsistent({ ...c, discount: 0 }));
});
