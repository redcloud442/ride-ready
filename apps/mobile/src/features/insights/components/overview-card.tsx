import { Text } from 'react-native-paper';

import type { VehicleStatsResponse } from '@/api/stats.api';
import { BarChart } from '@/components/ui/bar-chart';
import { Card } from '@/components/ui/card';
import { StatColumns } from '@/components/ui/stat-columns';
import { useAppTheme } from '@/theme';
import { formatKm, formatMoney, formatNumber } from '@/utils/format';

import { changeNote, monthShort } from '../utils/change';

// The period at a glance, styled like Home's "This month": distance, spend and cost per km with the
// change against the previous period, then spend per month.
export function OverviewCard({ stats, compare, index }: { stats: VehicleStatsResponse; compare: string; index?: number }) {
  const { colors } = useAppTheme();
  const { details, previous } = stats;
  const cur = details.currency;
  const spent = cur ? (stats.spend.total[cur] ?? null) : null;
  const cpk = stats.costPerKm;
  const months = details.months;

  return (
    <Card index={index}>
      <StatColumns
        columns={[
          {
            label: 'Distance',
            value: stats.distance.value != null ? formatKm(stats.distance.value) : null,
            note: stats.distance.value != null ? (changeNote(stats.distance.value, previous.distance.value, compare) ?? 'from odometer') : 'Needs 2 odometer values',
          },
          {
            label: 'Spent',
            value: spent != null && cur ? formatMoney(spent, cur) : null,
            note: spent != null && cur ? (changeNote(spent, previous.spendTotal[cur], compare) ?? 'this period') : 'No costs yet',
          },
          {
            label: 'Cost / km',
            value: cpk.value != null && cpk.currency ? formatMoney(cpk.value, cpk.currency) : null,
            note: cpk.value != null ? (changeNote(cpk.value, previous.costPerKm.value, compare) ?? 'all costs') : 'Needs costs and distance',
          },
        ]}
      />
      {details.kmPerDay != null && (
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          About {formatNumber(details.kmPerDay, 0)} km a day on average
        </Text>
      )}
      {months.length > 1 && cur && (
        <>
          <BarChart
            bars={months.map((m, i) => ({ key: m.start, label: monthShort(m.start), value: m.spend, highlight: i === months.length - 1 }))}
            summary={`Spending per month: ${months.map((m) => `${monthShort(m.start)} ${formatMoney(m.spend, cur)}`).join(', ')}`}
          />
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            Spending per month in {cur}
            {Object.keys(stats.spend.total).length > 1 ? '; other currencies are not converted' : ''}
          </Text>
        </>
      )}
    </Card>
  );
}
