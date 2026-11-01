import { StyleSheet, View } from "react-native";
import { Button, HelperText, Icon, Surface, Text } from "react-native-paper";

import { useGenerateInsight, useInsights } from "@/hooks/use-insights";
import { useAppTheme } from "@/theme";
import { formatDay } from "@/utils/format";

const QUALITY_LABEL = {
  measured: "Based on measured records",
  calculated: "Calculated from your records",
  estimated: "Includes estimates",
} as const;

// Written summaries of a period, built from your records' metrics (core describeStats).
export function InsightList({
  vehicleId,
  from,
  to,
}: {
  vehicleId: string;
  from: Date;
  to: Date;
}) {
  const { colors } = useAppTheme();
  const insights = useInsights(vehicleId);
  const generate = useGenerateInsight();

  return (
    <View style={styles.wrap}>
      <Button
        mode="contained-tonal"
        icon="creation"
        onPress={() => generate.mutate({ vehicleId, from, to })}
        loading={generate.isPending}
        disabled={generate.isPending}
      >
        Summarize this period
      </Button>
      {generate.error && (
        <HelperText type="error" visible accessibilityLiveRegion="polite">
          {generate.error.message}
        </HelperText>
      )}
      {insights.data?.map((insight) => (
        <Surface
          key={insight.id}
          elevation={1}
          style={[styles.card, { borderColor: colors.outlineVariant }]}
        >
          <View style={styles.meta}>
            <Icon source="creation" size={16} color={colors.primary} />
            <Text
              variant="labelMedium"
              style={{ color: colors.onSurfaceVariant }}
            >
              {formatDay(new Date(insight.createdAt))} ·{" "}
              {QUALITY_LABEL[insight.quality] ?? insight.quality}
            </Text>
          </View>
          <Text variant="bodyMedium">{insight.body}</Text>
        </Surface>
      ))}
      {insights.isSuccess && !insights.data.length && (
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          No summaries yet. They explain your numbers in plain words and only
          use your own records.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
});
