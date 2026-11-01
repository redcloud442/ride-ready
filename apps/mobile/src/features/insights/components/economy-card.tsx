import { Text } from 'react-native-paper';

import type { VehicleStatsResponse } from '@/api/stats.api';
import { BarChart } from '@/components/ui/bar-chart';
import { Card } from '@/components/ui/card';
import { StatColumns } from '@/components/ui/stat-columns';
import { useAppTheme } from '@/theme';
import { formatNumber } from '@/utils/format';

import { changeNote, dayShort } from '../utils/change';

const MAX_BARS = 8;

// Fuel economy per full-to-full interval (calculated). Lower is better, so the best bar is the shortest.
export function EconomyCard({ stats, compare, index }: { stats: VehicleStatsResponse; compare: string; index?: number }) {
  const { colors } = useAppTheme();
  const intervals = stats.details.economy;
  if (!intervals.length) return null; // MetricList already says what's needed

  const values = intervals.map((i) => i.value);
  const best = Math.min(...values);
  const latest = values[values.length - 1];
  const shown = intervals.slice(-MAX_BARS);
  const l100 = (v: number) => `${formatNumber(v, 1)} L`;

  return (
    <Card index={index}>
      <StatColumns
        columns={[
          { label: 'Latest', value: l100(latest), note: dayShort(intervals[intervals.length - 1].at) },
          {
            label: 'Average',
            value: stats.fuelEconomy.value != null ? l100(stats.fuelEconomy.value) : null,
            note: changeNote(stats.fuelEconomy.value, stats.previous.fuelEconomy.value, compare) ?? 'per 100 km',
          },
          { label: 'Best', value: l100(best), note: `of ${intervals.length} ${intervals.length === 1 ? 'tank' : 'tanks'}` },
        ]}
      />
      {shown.length > 1 && (
        <BarChart
          bars={shown.map((i) => ({ key: i.at, label: dayShort(i.at), value: i.value, highlight: i.value === best }))}
          summary={`Fuel economy per tank, liters per 100 km: ${shown.map((i) => `${dayShort(i.at)} ${formatNumber(i.value, 1)}`).join(', ')}. Best ${formatNumber(best, 1)}.`}
        />
      )}
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        L/100 km between full fill-ups · calculated · lower is better
      </Text>
    </Card>
  );
}
