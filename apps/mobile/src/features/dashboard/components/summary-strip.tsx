import type { Propulsion } from '@ride-ready/core';
import { StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';

import { useAppTheme } from '@/theme';
import { formatMoney, formatNumber } from '@/utils/format';

import type { VehicleMetrics } from '../utils/metrics';

const monthShort = (d: Date) => d.toLocaleString(undefined, { month: 'short' });

// This month at a glance: three numbers + a 6-month spending trend. Missing values stay "—" with
// what's needed (plan principle: no fabricated numbers).
export function SummaryStrip({ metrics, propulsion }: { metrics: VehicleMetrics | null; propulsion?: Propulsion }) {
  const { colors } = useAppTheme();
  const ev = propulsion === 'ev';
  const spend = metrics?.monthSpend;
  const eff = metrics?.efficiency;
  const trend = metrics?.trend;

  // change vs last month, only when both are in the same currency and last month had spend
  const prev = trend && spend && trend.currency === spend.currency ? trend.months[trend.months.length - 2]?.total : 0;
  const change = prev && spend ? Math.round(((spend.amount - prev) / prev) * 100) : null;

  const columns = [
    {
      label: 'Spent',
      value: spend ? formatMoney(spend.amount, spend.currency) : null,
      note:
        change == null
          ? spend?.otherCurrencies
            ? `+${spend.otherCurrencies} more currency`
            : spend
              ? 'this month'
              : 'No costs yet'
          : change === 0
            ? 'Same as last month'
            : `${change > 0 ? 'Up' : 'Down'} ${Math.abs(change)}% vs last month`,
    },
    {
      label: 'Cost / km',
      value: metrics?.monthCostPerKm != null && spend ? formatMoney(metrics.monthCostPerKm, spend.currency) : null,
      note: metrics?.monthCostPerKm != null ? 'this month' : 'Needs costs and distance',
    },
    {
      label: eff ? `Avg ${eff.unit}` : ev ? 'kWh / 100 km' : 'L / 100 km',
      value: eff?.value != null ? formatNumber(eff.value, 1) : null,
      note: eff?.value != null ? (eff.quality === 'estimated' ? 'estimated' : 'calculated') : ev ? 'Needs 2 charges with km' : 'Needs 2 full fill-ups',
    },
  ];

  const max = trend ? Math.max(...trend.months.map((m) => m.total)) : 0;

  return (
    <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }]}>
      <View style={styles.columns}>
        {columns.map((c, i) => (
          <View
            key={c.label}
            style={[styles.column, i > 0 && { borderLeftColor: colors.outlineVariant, borderLeftWidth: StyleSheet.hairlineWidth }]}
            accessible
            accessibilityLabel={`${c.label}: ${c.value ?? 'not available'}. ${c.note}`}>
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
              {c.label}
            </Text>
            <Text variant="titleMedium" style={styles.num} numberOfLines={1} adjustsFontSizeToFit>
              {c.value ?? '—'}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={2}>
              {c.note}
            </Text>
          </View>
        ))}
      </View>

      {trend && (
        <View
          style={styles.trend}
          accessible
          accessibilityLabel={`Spending, last 6 months: ${trend.months.map((m) => `${monthShort(m.start)} ${formatMoney(m.total, trend.currency)}`).join(', ')}`}>
          {trend.months.map((m, i) => {
            const current = i === trend.months.length - 1;
            return (
              <View key={m.start.toISOString()} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${max ? Math.max((m.total / max) * 100, m.total ? 6 : 2) : 2}%`,
                        backgroundColor: current ? colors.primary : colors.primaryContainer,
                      },
                    ]}
                  />
                </View>
                <Text variant="labelSmall" style={{ color: current ? colors.onSurface : colors.onSurfaceVariant }}>
                  {monthShort(m.start)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 16 },
  columns: { flexDirection: 'row' },
  column: { flex: 1, gap: 2, paddingHorizontal: 8 },
  num: { fontVariant: ['tabular-nums'] },
  trend: { flexDirection: 'row', gap: 8, height: 72 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
});
