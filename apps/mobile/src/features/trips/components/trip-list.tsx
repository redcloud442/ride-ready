import type { Trip, VehicleSummary } from '@ride-ready/core';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Icon, IconButton, Surface, Text } from 'react-native-paper';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteRecord } from '@/hooks/use-vehicle-records';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';
import { formatDay, formatDuration, formatTime } from '@/utils/format';
import { toNumber } from '@/utils/numbers';

export function TripList({ vehicle, trips }: { vehicle: VehicleSummary; trips: Trip[] }) {
  const { colors } = useAppTheme();
  const remove = useDeleteRecord();
  const show = useToastStore((s) => s.show);
  const [pending, setPending] = useState<Trip | null>(null); // local dialog state

  return (
    <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }]}>
      {trips.map((trip, i) => {
        const start = new Date(trip.startedAt);
        const km = toNumber(trip.gpsKm);
        const business = trip.purpose === 'business';
        return (
          <View key={trip.id}>
            {i > 0 && <Divider />}
            <View style={styles.row}>
              <View style={[styles.icon, { backgroundColor: business ? colors.tertiaryContainer : colors.surfaceVariant }]}>
                <Icon source={business ? 'briefcase-outline' : 'map-marker-path'} size={20} color={business ? colors.onTertiaryContainer : colors.onSurfaceVariant} />
              </View>
              <View style={styles.text}>
                <Text variant="titleSmall">
                  {km != null ? `${km.toFixed(1)} km` : 'No GPS distance'}
                  {business ? ' · Business' : ''}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  {formatDay(start)} · {formatTime(start)}
                  {trip.endedAt ? ` · ${formatDuration(new Date(trip.endedAt).getTime() - start.getTime())}` : ''}
                </Text>
              </View>
              <IconButton icon="delete-outline" size={22} hitSlop={4} onPress={() => setPending(trip)} accessibilityLabel={`Delete trip from ${formatDay(start)}`} />
            </View>
          </View>
        );
      })}
      <ConfirmDialog
        visible={!!pending}
        title="Delete this trip?"
        body="Its route and distance will be removed."
        confirmLabel="Delete"
        busy={remove.isPending}
        onDismiss={() => setPending(null)}
        onConfirm={() =>
          pending &&
          remove.mutate(
            { vehicleId: vehicle.id, kind: 'trips', id: pending.id },
            { onSuccess: () => show('Trip deleted'), onError: (e) => show(e.message), onSettled: () => setPending(null) },
          )
        }
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, paddingLeft: 16, paddingRight: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
});
