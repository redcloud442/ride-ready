import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { useAppTheme } from '@/theme';

const FEATURES = [
  { icon: 'gas-station', title: 'Fuel and charging logs', body: 'Real economy from your own fill-ups.' },
  { icon: 'wrench-clock', title: 'Maintenance on time', body: 'Reminders by date and by kilometer.' },
  { icon: 'chart-donut', title: 'True cost of ownership', body: 'Every expense, cost per kilometer.' },
] as const;

export function WelcomeStep({ name }: { name?: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.wrap}>
      <Text variant="headlineMedium" accessibilityRole="header">
        {name ? `Welcome, ${name}` : 'Welcome to RideReady'}
      </Text>
      <Text variant="bodyLarge" style={{ color: colors.onSurfaceVariant }}>
        Set up your garage in under a minute. Everything RideReady tells you comes from your own records.
      </Text>
      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.feature}>
            <View style={[styles.icon, { backgroundColor: colors.secondaryContainer }]}>
              <Icon source={f.icon} size={22} color={colors.onSecondaryContainer} />
            </View>
            <View style={styles.text}>
              <Text variant="titleSmall">{f.title}</Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {f.body}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  features: { gap: 20, marginTop: 8 },
  feature: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
});
