import { odometerDecreases, type OdometerReading, type VehicleDocument, type VehicleSummary } from '@ride-ready/core';

import { DOCUMENT_KIND_UI } from '@/constants/documents';
import { MAINTENANCE_KIND_UI } from '@/constants/records';
import { PROPULSION_UI } from '@/constants/vehicles';
import { formatDate, formatKm } from '@/utils/format';
import type { VehicleRecords } from '@/utils/record-feed';

const SOURCE_LABEL: Record<OdometerReading['source'] | 'fuel' | 'charging' | 'maintenance', string> = {
  manual: 'Typed in by owner',
  photo_ocr: 'Read from dashboard photo',
  receipt: 'Read from receipt',
  trip_gps: 'From GPS trip',
  fuel: 'Logged with a fill-up',
  charging: 'Logged with a charge',
  maintenance: 'Logged with a service',
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

type Reading = { at: Date; km: number; source: keyof typeof SOURCE_LABEL };

/**
 * Buyer-facing service history as HTML (printed to PDF on the phone). Only what proves care: services,
 * odometer readings with where each value came from, and the documents on file. Costs, stations,
 * locations and trips stay out.
 */
export function serviceHistoryHtml(vehicle: VehicleSummary, r: VehicleRecords, documents: VehicleDocument[], now = new Date()) {
  const readings: Reading[] = [
    ...r.odometer.map((o) => ({ at: new Date(o.readAt), km: Number(o.km), source: o.source })),
    ...r.fuel.flatMap((f) => (f.odometerKm == null ? [] : [{ at: new Date(f.filledAt), km: Number(f.odometerKm), source: 'fuel' as const }])),
    ...r.charging.flatMap((c) => (c.odometerKm == null ? [] : [{ at: new Date(c.startedAt), km: Number(c.odometerKm), source: 'charging' as const }])),
    ...r.maintenance.flatMap((m) =>
      m.odometerKm == null ? [] : [{ at: new Date(m.performedAt), km: Number(m.odometerKm), source: 'maintenance' as const }],
    ),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());
  const lower = new Set(odometerDecreases(readings));
  const services = [...r.maintenance].sort((a, b) => b.performedAt.localeCompare(a.performedAt));
  const latest = readings[0];

  const odometerCheck = !readings.length
    ? 'No odometer readings recorded.'
    : lower.size
      ? `${lower.size} reading${lower.size === 1 ? ' was' : 's were'} lower than an earlier one (marked below): a typo or a replaced odometer.`
      : `All ${readings.length} readings go up over time.`;

  const serviceRows = services
    .map(
      (m) => `<tr>
        <td>${formatDate(new Date(m.performedAt))}</td>
        <td class="num">${m.odometerKm == null ? '—' : formatKm(Number(m.odometerKm))}</td>
        <td>${MAINTENANCE_KIND_UI[m.kind as keyof typeof MAINTENANCE_KIND_UI]?.label ?? esc(m.kind)}</td>
        <td>${esc(m.description)}${m.parts.length ? `<div class="muted">Parts: ${m.parts.map((p) => esc(p.name)).join(', ')}</div>` : ''}</td>
        <td>${m.workshop ? esc(m.workshop) : '—'}</td>
      </tr>`,
    )
    .join('');

  const readingRows = readings
    .map(
      (p) => `<tr${lower.has(p) ? ' class="flag"' : ''}>
        <td>${formatDate(p.at)}</td>
        <td class="num">${formatKm(p.km)}${lower.has(p) ? ' ⚠' : ''}</td>
        <td>${SOURCE_LABEL[p.source]}</td>
      </tr>`,
    )
    .join('');

  const docRows = documents
    .map(
      (d) => `<tr>
        <td>${formatDate(new Date(d.createdAt))}</td>
        <td>${DOCUMENT_KIND_UI[d.kind].label}</td>
        <td>${d.title ? esc(d.title) : '—'}</td>
      </tr>`,
    )
    .join('');

  const name = esc(`${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`);
  const empty = (cols: number, text: string) => `<tr><td colspan="${cols}" class="muted">${text}</td></tr>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
  @page { margin: 18mm 14mm; }
  body { font-family: -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif; color: black; font-size: 11px; }
  h1 { font-size: 20px; margin: 0 0 2px; }
  h2 { font-size: 14px; margin: 22px 0 6px; }
  .muted { color: dimgray; }
  .summary { margin-top: 12px; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 5px 6px; border-bottom: 1px solid gainsboro; vertical-align: top; }
  th { font-size: 10px; text-transform: uppercase; color: dimgray; }
  .num { text-align: right; white-space: nowrap; }
  .flag td { background: lightyellow; }
  footer { margin-top: 24px; font-size: 9px; color: dimgray; }
</style></head>
<body>
  <h1>Service history</h1>
  <div>${name} · ${PROPULSION_UI[vehicle.propulsion].label}</div>
  <div class="muted">Generated ${formatDate(now)} with RideReady from the owner's own records.</div>

  <div class="summary">
    <div><b>Latest odometer:</b> ${latest ? `${formatKm(latest.km)} on ${formatDate(latest.at)}` : 'not recorded'}</div>
    <div><b>Services logged:</b> ${services.length}</div>
    <div><b>Odometer check:</b> ${odometerCheck}</div>
  </div>

  <h2>Services</h2>
  <table>
    <tr><th>Date</th><th class="num">Odometer</th><th>Type</th><th>Work done</th><th>Workshop</th></tr>
    ${serviceRows || empty(5, 'No services logged.')}
  </table>

  <h2>Odometer readings</h2>
  <table>
    <tr><th>Date</th><th class="num">Reading</th><th>Where the value came from</th></tr>
    ${readingRows || empty(3, 'No readings.')}
  </table>

  <h2>Documents on file</h2>
  <table>
    <tr><th>Added</th><th>Kind</th><th>Title</th></tr>
    ${docRows || empty(3, 'No documents.')}
  </table>

  <footer>
    Everything here was recorded by the owner in RideReady; RideReady has not inspected the vehicle. Each odometer
    value says how it was captured. The odometer check is calculated from these readings only. Ask the owner to see
    any document listed.
  </footer>
</body></html>`;
}
