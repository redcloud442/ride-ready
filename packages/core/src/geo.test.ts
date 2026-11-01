import assert from 'node:assert/strict';
import { test } from 'node:test';
import { encodePolyline, haversineKm } from './index.ts';

test('haversineKm matches a known distance (Paris → London ≈ 344 km)', () => {
  const km = haversineKm({ lat: 48.8566, lng: 2.3522 }, { lat: 51.5074, lng: -0.1278 });
  assert.ok(Math.abs(km - 343.6) < 1, `got ${km}`);
  assert.equal(haversineKm({ lat: 1, lng: 1 }, { lat: 1, lng: 1 }), 0);
});

test('encodePolyline matches the reference example', () => {
  // https://developers.google.com/maps/documentation/utilities/polylinealgorithm
  assert.equal(
    encodePolyline([
      { lat: 38.5, lng: -120.2 },
      { lat: 40.7, lng: -120.95 },
      { lat: 43.252, lng: -126.453 },
    ]),
    '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
  );
  assert.equal(encodePolyline([]), '');
});
