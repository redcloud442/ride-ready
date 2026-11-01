import type { VehicleSummary } from '@ride-ready/core';
import { useWindowDimensions, FlatList, StyleSheet, View } from 'react-native';

import { VehicleHero } from '@/components/vehicle-hero';
import { useLatestOdometerKm } from '@/hooks/use-latest-odometer';
import { useSelectedVehicle } from '@/hooks/use-vehicles';
import { useGarageStore } from '@/stores/garage.store';
import { useAppTheme } from '@/theme';

const GAP = 12;
const SIDE = 16; // screen padding around the cards

// Swipe between vehicles; the card that settles becomes the selected vehicle for the whole app.
export function VehicleCarousel({ vehicles }: { vehicles: VehicleSummary[] }) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const selected = useSelectedVehicle();
  const selectVehicle = useGarageStore((s) => s.selectVehicle);
  const cardWidth = width - SIDE * 2 - (vehicles.length > 1 ? 24 : 0); // peek at the next card
  const index = Math.max(0, vehicles.findIndex((v) => v.id === selected?.id));

  if (vehicles.length === 1) return <CarouselCard vehicle={vehicles[0]} />;

  return (
    <View style={styles.wrap}>
      <FlatList
        data={vehicles}
        keyExtractor={(v) => v.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + GAP}
        decelerationRate="fast"
        initialScrollIndex={index}
        getItemLayout={(_, i) => ({ length: cardWidth + GAP, offset: (cardWidth + GAP) * i, index: i })}
        contentContainerStyle={styles.list}
        style={styles.bleed}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / (cardWidth + GAP));
          const v = vehicles[Math.min(Math.max(i, 0), vehicles.length - 1)];
          if (v && v.id !== selected?.id) selectVehicle(v.id);
        }}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth, marginRight: GAP }}>
            <CarouselCard vehicle={item} />
          </View>
        )}
      />
      <View style={styles.dots} accessible accessibilityLabel={`Vehicle ${index + 1} of ${vehicles.length}. Swipe to switch`}>
        {vehicles.map((v, i) => (
          <View key={v.id} style={[styles.dot, { backgroundColor: i === index ? colors.primary : colors.outlineVariant, width: i === index ? 18 : 6 }]} />
        ))}
      </View>
    </View>
  );
}

// shortcut: each card loads its vehicle's records for the odometer (cached per vehicle); fine for a
// handful of vehicles, add a latest-odometer field to GET /api/vehicles if garages get large.
function CarouselCard({ vehicle }: { vehicle: VehicleSummary }) {
  const odometerKm = useLatestOdometerKm(vehicle);
  return <VehicleHero vehicle={vehicle} odometerKm={odometerKm} />;
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  bleed: { marginHorizontal: -SIDE }, // let cards scroll to the screen edge
  list: { paddingHorizontal: SIDE },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
});
