import type { Propulsion, VehicleDocument } from '@ride-ready/core';

import { DOCUMENT_KIND_UI } from '@/constants/documents';
import { MAINTENANCE_KIND_UI } from '@/constants/records';
import { daysUntil, expiryStatus } from '@/features/documents/utils/expiry';
import { formatDate, formatKm, formatNumber } from '@/utils/format';

import type { VehicleMetrics } from './metrics';

export type Nudge = {
  key: string;
  icon: string;
  tone: 'error' | 'tertiary' | 'primary';
  title: string;
  body: string;
};

const DAY = 86_400_000;
export const ODOMETER_STALE_DAYS = 30;
// a forecast shows on Home once it's this close (either one)
const SERVICE_SOON_DAYS = 45;
const SERVICE_SOON_KM = 1500;

/** Short, data-backed reminders for Home, most urgent first. Every one is derived from records. */
export function buildNudges(
  { documents, metrics, propulsion }: { documents: VehicleDocument[]; metrics: VehicleMetrics | null; propulsion: Propulsion },
  now = new Date(),
): Nudge[] {
  const nudges: Nudge[] = [];

  for (const d of documents) {
    const status = expiryStatus(d.expiresAt, now);
    if (status !== 'expired' && status !== 'soon') continue;
    const label = d.title ?? DOCUMENT_KIND_UI[d.kind].label;
    const days = daysUntil(d.expiresAt!, now);
    nudges.push(
      status === 'expired'
        ? { key: `doc-${d.id}`, icon: 'alert-circle-outline', tone: 'error', title: `${label} expired`, body: `On ${formatDate(new Date(d.expiresAt!))}. Renew it and add the new document.` }
        : { key: `doc-${d.id}`, icon: DOCUMENT_KIND_UI[d.kind].icon, tone: 'tertiary', title: `${label} expires in ${days} ${days === 1 ? 'day' : 'days'}`, body: `On ${formatDate(new Date(d.expiresAt!))}.` },
    );
  }

  for (const { kind, forecast: f } of metrics?.forecasts ?? []) {
    const days = Math.ceil((f.dueAt.getTime() - now.getTime()) / DAY);
    const overdue = days < 0 || (f.kmLeft != null && f.kmLeft <= 0);
    if (!overdue && days > SERVICE_SOON_DAYS && (f.kmLeft == null || f.kmLeft > SERVICE_SOON_KM)) continue;
    const label = MAINTENANCE_KIND_UI[kind].label;
    const every = [
      f.intervalKm != null ? formatKm(f.intervalKm) : null,
      f.intervalDays >= 60 ? `${Math.round(f.intervalDays / 30.4)} months` : `${f.intervalDays} days`,
    ].filter(Boolean).join(' or ');
    const left = f.kmLeft == null ? '' : f.kmLeft > 0 ? `About ${formatKm(f.kmLeft)} to go. ` : `${formatKm(-f.kmLeft)} past it. `;
    const pace = f.kmPerDay ? ` and ~${formatNumber(f.kmPerDay)} km a day` : '';
    nudges.push({
      key: `service-${kind}`,
      icon: MAINTENANCE_KIND_UI[kind].icon,
      tone: overdue ? 'error' : 'tertiary',
      title: overdue ? `${label} likely due now` : `${label} due around ${formatDate(f.dueAt)}`,
      body: `${left}Estimated from your last ${f.basedOn} visits (every ${every})${pace}.`,
    });
  }

  const last = metrics?.latestOdometer;
  if (last) {
    const days = Math.floor((now.getTime() - last.at.getTime()) / DAY);
    if (days >= ODOMETER_STALE_DAYS) {
      nudges.push({
        key: 'odometer-stale',
        icon: 'speedometer-slow',
        tone: 'primary',
        title: `No odometer reading in ${days} days`,
        body: 'Update it on the card above to keep distance and cost per km accurate.',
      });
    }
  }

  if (metrics && metrics.efficiency.value == null && metrics.counts.energy > 0) {
    nudges.push(
      propulsion === 'ev'
        ? { key: 'economy', icon: 'lightning-bolt', tone: 'primary', title: 'Almost there: kWh per 100 km', body: 'Log your next charge with the odometer to see it.' }
        : { key: 'economy', icon: 'fuel', tone: 'primary', title: 'Almost there: fuel economy', body: 'Log your next full fill-up with the odometer to see it.' },
    );
  }

  const rank = { error: 0, tertiary: 1, primary: 2 };
  return nudges.sort((a, b) => rank[a.tone] - rank[b.tone]);
}
