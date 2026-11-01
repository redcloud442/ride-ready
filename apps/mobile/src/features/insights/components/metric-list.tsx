import {
  usesCharging,
  usesFuel,
  type Metric,
  type MetricQuality,
  type Propulsion,
} from "@ride-ready/core";
import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { Divider, Surface, Text } from "react-native-paper";

import type { VehicleStatsResponse } from "@/api/stats.api";
import { useAppTheme } from "@/theme";
import { formatMoney, formatNumber } from "@/utils/format";

const QUALITY: Record<MetricQuality, string> = {
  measured: "Measured",
  calculated: "Calculated",
  estimated: "Estimated",
};

// Every value says how it was obtained (plan principle: label measured / calculated / estimated).
const caption = (m: Metric) =>
  [QUALITY[m.quality], m.basis].filter(Boolean).join(" · ");
const value = (m: Metric, decimals: number) =>
  m.value == null ? null : `${formatNumber(m.value, decimals)} ${m.unit}`;

type Row = { key: string; label: string; value: string | null; note: string };

// The period's numbers in one quiet card: label + how it was obtained, value on the right.
// A missing value shows "—" and what's needed, never 0.
export function MetricList({
  stats,
  propulsion,
}: {
  stats: VehicleStatsResponse;
  propulsion: Propulsion;
}) {
  const { colors } = useAppTheme();
  const fuel = usesFuel(propulsion);
  const charge = usesCharging(propulsion);
  const row = (key: string, label: string, m: Metric, decimals: number, hint: string): Row => ({
    key,
    label,
    value: value(m, decimals),
    note: m.value == null ? hint : caption(m),
  });
  const cpk = stats.costPerKm;

  const rows: Row[] = [
    row("distance", "Distance", stats.distance, 0, "Needs two odometer values"),
    ...(fuel ? [row("economy", "Fuel economy", stats.fuelEconomy, 1, "Needs two full fill-ups with odometer")] : []),
    ...(charge ? [row("consumption", "Charging use", stats.chargingConsumption, 1, "Needs charges with odometer")] : []),
    ...(fuel ? [row("fuel", "Fuel bought", stats.fuelPurchased, 1, "Log a fill-up")] : []),
    ...(charge ? [row("energy", "Energy bought", stats.energyPurchased, 1, "Log a charge")] : []),
    ...(charge && stats.batteryHealth
      ? [row("battery", "Battery health", stats.batteryHealth, 1, "Add a measurement in Garage")]
      : []),
    {
      key: "cpk",
      label: "Cost per km",
      value: cpk.value != null && cpk.currency ? formatMoney(cpk.value, cpk.currency) : null,
      note: cpk.value != null && cpk.currency ? caption(cpk) : "Needs costs and distance",
    },
  ];

  return (
    <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }]}>
      {rows.map((r, i) => (
        <Fragment key={r.key}>
          {i > 0 && <Divider />}
          <View
            style={styles.row}
            accessible
            accessibilityLabel={`${r.label}: ${r.value ?? "not available"}. ${r.note}`}
          >
            <View style={styles.flex}>
              <Text variant="bodyLarge">{r.label}</Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {r.note}
              </Text>
            </View>
            <Text
              variant="titleMedium"
              style={[styles.num, r.value == null && { color: colors.onSurfaceVariant }]}
            >
              {r.value ?? "—"}
            </Text>
          </View>
        </Fragment>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, minHeight: 56 },
  num: { fontVariant: ["tabular-nums"], textAlign: "right" },
});
