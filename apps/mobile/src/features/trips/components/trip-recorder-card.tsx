import type { VehicleSummary } from '@ride-ready/core';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, HelperText, SegmentedButtons, Text } from 'react-native-paper';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BrandGradient } from '@/components/brand/brand-gradient';
import { useNow } from '@/hooks/use-now';
import { useAppTheme } from '@/theme';
import { formatDuration } from '@/utils/format';

import { useRecordTrip } from '../hooks/use-record-trip';

export function TripRecorderCard({ vehicle }: { vehicle: VehicleSummary | undefined }) {
  const { brand } = useAppTheme();
  const t = useRecordTrip();
  const recording = t.status === 'recording' ? t.recording : null;
  const now = useNow(!!recording);
  const otherVehicle = recording && vehicle && recording.vehicleId !== vehicle.id;
  const [confirmDiscard, setConfirmDiscard] = useState(false); // local dialog state

  return (
    <BrandGradient style={styles.card}>
      <Text variant="labelLarge" style={{ color: brand.onBrandMuted }}>
        {recording ? 'Recording trip' : 'GPS trip'}
      </Text>
      {recording ? (
        <>
          <View style={styles.liveRow} accessibilityLiveRegion="polite">
            <View>
              <Text variant="displaySmall" style={[styles.num, { color: brand.onBrand }]}>
                {recording.km.toFixed(1)}
              </Text>
              <Text variant="labelMedium" style={{ color: brand.onBrandMuted }}>
                km (GPS)
              </Text>
            </View>
            <View>
              <Text variant="displaySmall" style={[styles.num, { color: brand.onBrand }]}>
                {formatDuration(now.getTime() - recording.startedAt.getTime())}
              </Text>
              <Text variant="labelMedium" style={{ color: brand.onBrandMuted }}>
                elapsed
              </Text>
            </View>
          </View>
          {otherVehicle && (
            <Text variant="bodySmall" style={{ color: brand.onBrandMuted }}>
              Recording for another vehicle in your garage.
            </Text>
          )}
          <SegmentedButtons
            value={t.purpose}
            onValueChange={(v) => t.setPurpose(v as typeof t.purpose)}
            buttons={[
              { value: 'personal', label: 'Personal', checkedColor: brand.onBrand, uncheckedColor: brand.onBrandMuted },
              { value: 'business', label: 'Business', checkedColor: brand.onBrand, uncheckedColor: brand.onBrandMuted },
            ]}
            theme={{ colors: { secondaryContainer: brand.motif, outline: brand.onBrandMuted } }}
          />
          <View style={styles.actions}>
            <Button mode="contained" icon="stop" onPress={t.finishAndSave} buttonColor={brand.onBrand} textColor={brand.gradient[1]} style={styles.flex}>
              Finish and save
            </Button>
            <Button onPress={() => setConfirmDiscard(true)} textColor={brand.onBrand}>
              Discard
            </Button>
          </View>
          <Text variant="bodySmall" style={{ color: brand.onBrandMuted }}>
            Keep RideReady open while you drive. GPS distance is stored separately from your odometer.
          </Text>
        </>
      ) : (
        <>
          <Text variant="titleLarge" style={{ color: brand.onBrand }}>
            {vehicle ? `Record a trip in your ${vehicle.make} ${vehicle.model}` : 'Add a vehicle to record trips'}
          </Text>
          <Button
            mode="contained"
            icon="play"
            onPress={() => vehicle && t.start(vehicle.id)}
            loading={t.status === 'starting' || t.saving}
            disabled={!vehicle || t.status !== 'idle' || t.saving}
            buttonColor={brand.onBrand}
            textColor={brand.gradient[1]}
            contentStyle={styles.cta}>
            Start trip
          </Button>
        </>
      )}
      {t.permissionDenied && (
        <Button mode="outlined" icon="cog-outline" onPress={() => Linking.openSettings()} textColor={brand.onBrand} style={{ borderColor: brand.onBrandMuted }}>
          Open Settings
        </Button>
      )}
      <ConfirmDialog
        visible={confirmDiscard}
        title="Discard this trip?"
        body={recording ? `${recording.km.toFixed(1)} km recorded so far will be lost.` : ''}
        confirmLabel="Discard"
        onDismiss={() => setConfirmDiscard(false)}
        onConfirm={() => {
          t.discard();
          setConfirmDiscard(false);
        }}
      />
      {(t.error || t.saveError) && (
        <HelperText type="error" visible style={{ color: brand.onBrand }} accessibilityLiveRegion="polite">
          {t.error ?? t.saveError}
        </HelperText>
      )}
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 24, padding: 20, gap: 12 },
  liveRow: { flexDirection: 'row', justifyContent: 'space-between' },
  num: { fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cta: { height: 48 },
});
