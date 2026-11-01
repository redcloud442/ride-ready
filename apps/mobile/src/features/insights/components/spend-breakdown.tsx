import { StyleSheet, View } from "react-native";
import { Icon, Surface, Text } from "react-native-paper";

import type { VehicleStatsResponse } from "@/api/stats.api";
import { InfoCard } from "@/components/ui/info-card";
import { useAppTheme } from "@/theme";
import { formatMoney } from "@/utils/format";

const CATEGORIES = [
  { key: "fuel", label: "Fuel", icon: "gas-station" },
  { key: "charging", label: "Charging", icon: "ev-station" },
  { key: "maintenance", label: "Maintenance", icon: "wrench-outline" },
  { key: "other", label: "Other expenses", icon: "cash-multiple" },
] as const;

// Spend per category in the period's main currency. Bars carry labels + amounts, not color alone.
export function SpendBreakdown({
  spend,
}: {
  spend: VehicleStatsResponse["spend"];
}) {
  const { colors } = useAppTheme();
  const currencies = Object.entries(spend.total).sort((a, b) => b[1] - a[1]);
  if (!currencies.length) {
    return (
      <InfoCard
        icon="cash-multiple"
        title="No spending in this period"
        body="Fill-ups, charges, services and expenses add up here."
      />
    );
  }
  const [currency, total] = currencies[0];
  const barColor = {
    fuel: colors.primary,
    charging: colors.secondary,
    maintenance: colors.tertiary,
    other: colors.outline,
  };

  return (
    <Surface
      elevation={1}
      style={[styles.card, { borderColor: colors.outlineVariant }]}
    >
      <View style={styles.head}>
        <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
          Total
        </Text>
        <Text variant="headlineSmall" style={styles.num}>
          {formatMoney(total, currency)}
        </Text>
      </View>
      {CATEGORIES.map((c) => {
        const amount = spend[c.key][currency] ?? 0;
        if (!amount) return null;
        const pct = total ? amount / total : 0;
        return (
          <View
            key={c.key}
            style={styles.item}
            accessible
            accessibilityLabel={`${c.label}: ${formatMoney(
              amount,
              currency
            )}, ${Math.round(pct * 100)}%`}
          >
            <View style={styles.itemHead}>
              <Icon source={c.icon} size={18} color={colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={styles.flex}>
                {c.label}
              </Text>
              <Text variant="titleSmall" style={styles.num}>
                {formatMoney(amount, currency)}
              </Text>
            </View>
            <View
              style={[styles.track, { backgroundColor: colors.surfaceVariant }]}
            >
              <View
                style={[
                  styles.bar,
                  {
                    width: `${Math.max(pct * 100, 2)}%`,
                    backgroundColor: barColor[c.key],
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
      {currencies.length > 1 && (
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          Also spent:{" "}
          {currencies
            .slice(1)
            .map(([cur, amt]) => formatMoney(amt, cur))
            .join(", ")}{" "}
          (not converted)
        </Text>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  head: { gap: 2 },
  num: { fontVariant: ["tabular-nums"] },
  item: { gap: 6 },
  itemHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  bar: { height: 8, borderRadius: 4 },
});
