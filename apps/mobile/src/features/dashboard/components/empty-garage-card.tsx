import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Button, Icon, Surface, Text } from 'react-native-paper';

import { routes } from '@/constants/routes';
import { useAppTheme } from '@/theme';

export function EmptyGarageCard() {
  const { colors } = useAppTheme();
  return (
    <Surface elevation={2} style={[styles.card, { backgroundColor: colors.elevation.level1 }]}>
      <Icon source="garage-open-variant" size={40} color={colors.primary} />
      <Text variant="titleMedium">Your garage is empty</Text>
      <Text variant="bodyMedium" style={[styles.center, { color: colors.onSurfaceVariant }]}>
        Add a vehicle to start tracking fuel, service and costs.
      </Text>
      <Button mode="contained" icon="plus" onPress={() => router.push(routes.newVehicle)}>
        Add vehicle
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 24, gap: 8, alignItems: 'center' },
  center: { textAlign: 'center' },
});
