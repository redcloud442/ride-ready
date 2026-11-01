import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

import { VehicleThumb } from '@/components/vehicle-thumb';
import { useSelectedVehicle, useVehicles } from '@/hooks/use-vehicles';
import { useGarageStore } from '@/stores/garage.store';

// Which vehicle the screen is about. 2+ vehicles: tappable chips. One vehicle: a plain label,
// unless the screen already names it (`labelSingle={false}`, e.g. Home's vehicle card).
export function VehicleSwitcher({ labelSingle = true }: { labelSingle?: boolean }) {
  const { data: vehicles } = useVehicles();
  const selected = useSelectedVehicle();
  const selectVehicle = useGarageStore((s) => s.selectVehicle);
  if (!vehicles?.length) return null;

  if (vehicles.length === 1) {
    const v = vehicles[0];
    return labelSingle ? (
      <Chip avatar={<VehicleThumb vehicle={v} height={22} style={styles.thumb} />} style={styles.single} accessibilityRole="text">
        {v.make} {v.model}
      </Chip>
    ) : null;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {vehicles.map((v) => (
        <Chip
          key={v.id}
          selected={v.id === selected?.id}
          showSelectedOverlay
          showSelectedCheck={false}
          avatar={<VehicleThumb vehicle={v} height={22} style={styles.thumb} />}
          onPress={() => selectVehicle(v.id)}
          accessibilityLabel={`Show ${v.make} ${v.model}`}>
          {v.make} {v.model}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  single: { alignSelf: 'flex-start' },
  // overrides Paper's round 24x24 avatar so the wide render isn't cropped
  thumb: { width: 35, height: 22, borderRadius: 0 },
});
