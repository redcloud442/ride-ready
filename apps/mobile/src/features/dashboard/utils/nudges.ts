import type { Propulsion, VehicleDocument } from '@ride-ready/core';

import { DOCUMENT_KIND_UI } from '@/constants/documents';
import { daysUntil, expiryStatus } from '@/features/documents/utils/expiry';
import { formatDate } from '@/utils/format';

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
