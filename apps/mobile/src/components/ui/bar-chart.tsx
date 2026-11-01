import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { useAppTheme } from '@/theme';

export type Bar = { key: string; label: string; value: number; highlight?: boolean };

type Props = {
  bars: Bar[];
  /** read by screen readers instead of the bars, e.g. "Spending per month: Jan €120, …" */
  summary: string;
  height?: number;
};

// Small column chart in the style of Home's spending trend. Highlighted bars use primary; labels sit
// under every bar so the chart never relies on color alone. Bars grow from the baseline, left to right.
export function BarChart({ bars, summary, height = 72 }: Props) {
  const { colors } = useAppTheme();
  const max = Math.max(0, ...bars.map((b) => b.value));
  return (
    <View style={[styles.chart, { height }]} accessible accessibilityLabel={summary}>
      {bars.map((b, i) => (
        <View key={b.key} style={styles.col}>
          <View style={styles.track}>
            <GrowBar
              index={i}
              percent={max ? Math.max((b.value / max) * 100, b.value ? 6 : 2) : 2}
              color={b.highlight ? colors.primary : colors.primaryContainer}
            />
          </View>
          <Text variant="labelSmall" numberOfLines={1} style={{ color: b.highlight ? colors.onSurface : colors.onSurfaceVariant }}>
            {b.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function GrowBar({ index, percent, color }: { index: number; percent: number; color: string }) {
  const reduceMotion = useReducedMotion();
  const grow = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    grow.value = withDelay(120 + index * 45, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }));
  }, [grow, index, reduceMotion]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: grow.value }] }));
  return <Animated.View style={[styles.bar, { height: `${percent}%`, backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', gap: 6 },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  track: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, transformOrigin: 'bottom' },
});
