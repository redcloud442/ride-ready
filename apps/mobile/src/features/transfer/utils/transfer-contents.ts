import type { VehicleTransferPreview } from '@ride-ready/core';

/** "12 service records, 40 odometer readings, 3 documents" — what the next owner receives. */
export function transferContents(c: VehicleTransferPreview['counts']) {
  const parts: [number, string][] = [
    [c.maintenance, 'service record'],
    [c.odometer, 'odometer reading'],
    [c.fuel, 'fill-up'],
    [c.charging, 'charging session'],
    [c.expenses, 'expense'],
    [c.documents, 'document'],
  ];
  const listed = parts.filter(([n]) => n > 0).map(([n, label]) => `${n} ${label}${n === 1 ? '' : 's'}`);
  return listed.length ? listed.join(', ') : 'No records yet, just the vehicle';
}
