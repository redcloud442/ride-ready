import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bodyStyleOf, bodyStylesFor } from './index.ts';

test('bodyStyleOf keeps a matching style and falls back otherwise', () => {
  assert.equal(bodyStyleOf({ type: 'car', bodyStyle: 'suv' }), 'suv');
  assert.equal(bodyStyleOf({ type: 'car', bodyStyle: null }), 'sedan');
  assert.equal(bodyStyleOf({ type: 'motorcycle', bodyStyle: 'suv' }), 'sport', 'car style on a motorcycle');
  assert.ok(bodyStylesFor('motorcycle').includes('scooter'));
  assert.ok(!bodyStylesFor('car').includes('scooter'));
});
