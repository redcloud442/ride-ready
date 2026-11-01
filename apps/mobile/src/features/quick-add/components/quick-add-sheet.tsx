import { usesCharging, usesFuel } from '@ride-ready/core';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons } from 'react-native-paper';

import { useQuickScan } from '@/features/documents/hooks/use-quick-scan';
import { useSelectedVehicle } from '@/hooks/use-vehicles';
import { ChargingForm } from '@/features/logging/components/charging-form';
import { ExpenseForm } from '@/features/logging/components/expense-form';
import { FuelForm } from '@/features/logging/components/fuel-form';
import { MaintenanceForm } from '@/features/logging/components/maintenance-form';
import { useAppTheme } from '@/theme';

export type QuickType = 'fuel' | 'charging' | 'maintenance' | 'expense';

const FORMS: Record<QuickType, () => React.JSX.Element> = {
  fuel: FuelForm,
  charging: ChargingForm,
  maintenance: MaintenanceForm,
  expense: ExpenseForm,
};

// One place to log anything: pick the type, fill the essentials (the forms fold the rest away).
export function QuickAddSheet({ initial }: { initial?: QuickType }) {
  const { colors } = useAppTheme();
  const vehicle = useSelectedVehicle();
  const scan = useQuickScan(vehicle);
  const fuel = !vehicle || usesFuel(vehicle.propulsion);
  const charge = !!vehicle && usesCharging(vehicle.propulsion);
  const types = [
    ...(fuel ? [{ value: 'fuel' as const, label: 'Fuel', icon: 'gas-station' }] : []),
    ...(charge ? [{ value: 'charging' as const, label: 'Charge', icon: 'ev-station' }] : []),
    { value: 'maintenance' as const, label: 'Service', icon: 'wrench-outline' },
    { value: 'expense' as const, label: 'Expense', icon: 'cash-multiple' },
  ];
  const [type, setType] = useState<QuickType>(initial && types.some((t) => t.value === initial) ? initial : types[0].value); // local UI choice
  const Form = FORMS[type];

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.types}>
        {/* the "+" is the single entry point, so scanning is offered here too */}
        <Button
          mode="contained-tonal"
          icon="camera-outline"
          onPress={() => scan.scan('camera', { replace: true })}
          loading={scan.busy}
          disabled={scan.busy}
          contentStyle={styles.scan}
          accessibilityHint="Take a photo of the receipt instead of typing; the form is filled in for you to check">
          {scan.stage ?? 'Scan a receipt instead'}
        </Button>
        <SegmentedButtons
          value={type}
          onValueChange={(v) => setType(v as QuickType)}
          buttons={types.map((t) => ({ ...t, showSelectedCheck: false }))}
          density="small"
        />
      </View>
      {/* keyed so each type gets a fresh form */}
      <Form key={type} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  types: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  scan: { height: 48 },
});
