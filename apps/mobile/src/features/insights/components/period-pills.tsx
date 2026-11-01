import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

import { themes, useAppTheme } from '@/theme';

import { PERIODS, type PeriodKey } from '../insights.periods';

// the white pill keeps the light theme's violet in dark mode too (dark primary is too pale on white)
const ON_PILL = themes.light.paper.colors.primary;

// Period choice on the brand band: white pill for the selected one, translucent for the rest.
export function PeriodPills({ value, onChange }: { value: PeriodKey; onChange: (p: PeriodKey) => void }) {
  const { brand } = useAppTheme();
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Period">
      {PERIODS.map((p) => {
        const selected = p.value === value;
        return (
          <TouchableRipple
            key={p.value}
            borderless
            onPress={() => onChange(p.value)}
            style={[styles.pill, { backgroundColor: selected ? brand.onBrand : brand.motif }]}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}>
            <Text variant="labelLarge" style={{ color: selected ? ON_PILL : brand.onBrand }}>
              {p.label}
            </Text>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  pill: { flex: 1, minHeight: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
});
