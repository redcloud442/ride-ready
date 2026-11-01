import type { VehicleSummary } from '@ride-ready/core';
import { ActivityIndicator, ScrollView, Share, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useWatch } from 'react-hook-form';

import { transferLink } from '@/api/transfers.api';
import { Appear } from '@/components/ui/appear';
import { Card } from '@/components/ui/card';
import { SwitchField } from '@/components/ui/switch-field';
import { VehicleArt } from '@/components/vehicle-art';
import { themes, useAppTheme } from '@/theme';
import { formatDate, formatTime } from '@/utils/format';

import { useTransferVehicle } from '../hooks/use-transfer-vehicle';
import { transferContents } from '../utils/transfer-contents';

// dark modules on a light field in both themes: inverted codes don't scan reliably
const QR = themes.light.paper.colors;

export function TransferVehicle({ vehicle }: { vehicle: VehicleSummary }) {
  const { colors } = useAppTheme();
  const t = useTransferVehicle(vehicle);
  const name = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const muted = { color: colors.onSurfaceVariant };
  const includeCosts = useWatch({ control: t.form.control, name: 'includeCosts' });

  if (!t.transfer) {
    return (
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
        <Appear>
          <VehicleArt vehicle={vehicle} height={110} />
          <Text variant="titleLarge" style={styles.center}>
            {name}
          </Text>
        </Appear>
        <Card index={1}>
          <Text variant="titleSmall">Goes to the new owner</Text>
          <Text variant="bodyMedium" style={muted}>
            The vehicle with its services, odometer readings, fill-ups and charges, expenses, battery health and documents.
          </Text>
          <Text variant="titleSmall" style={styles.gap}>
            Stays private
          </Text>
          <Text variant="bodyMedium" style={muted}>
            Your trips and their locations are removed, never handed over.
          </Text>
          <Text variant="titleSmall" style={styles.gap}>
            After the scan
          </Text>
          <Text variant="bodyMedium" style={muted}>
            The vehicle leaves your garage (and your family&apos;s). You won&apos;t keep a copy.
          </Text>
        </Card>
        <Card index={2}>
          <SwitchField
            control={t.form.control}
            name="includeCosts"
            label="Include what I paid"
            hint="Fill-ups, charges and expenses, and service costs. Turned off, they're removed; odometer values from fill-ups are kept."
          />
          {/* a receipt shows what was paid, so it goes only with the costs */}
          {includeCosts && (
            <SwitchField
              control={t.form.control}
              name="includeReceipts"
              label="Include receipt photos"
              hint="Receipts can show your name, address or card digits. Turned off, they're deleted when the car moves."
            />
          )}
        </Card>
        {t.error && (
          <HelperText type="error" visible>
            {t.error}
          </HelperText>
        )}
        <Appear index={3}>
          <Button mode="contained" icon="qrcode" onPress={t.start} loading={t.creating} disabled={t.creating} contentStyle={styles.cta}>
            Show transfer code
          </Button>
        </Appear>
      </ScrollView>
    );
  }

  const link = transferLink(t.transfer.id);
  const expires = new Date(t.transfer.expiresAt);
  const { expired } = t;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Appear>
        <View style={[styles.qr, { backgroundColor: QR.surface }]} accessible accessibilityLabel="Vehicle transfer QR code">
          <QRCode value={link} size={240} color={QR.onSurface} backgroundColor={QR.surface} quietZone={10} />
        </View>
      </Appear>
      <Card index={1}>
        <Text variant="bodyMedium">
          {expired
            ? 'This code has expired. Close and create a new one.'
            : `Ask the buyer to scan this with their phone camera, or in RideReady under Garage → Scan a transfer code. It works once, until ${formatDate(expires)} ${formatTime(expires)}.`}
        </Text>
        <Text variant="bodySmall" style={[muted, styles.gap]}>
          They&apos;ll receive: {transferContents(t.transfer.counts)}.
        </Text>
      </Card>
      {!expired && (
        <Appear index={2} style={styles.waiting}>
          <ActivityIndicator />
          <Text variant="bodyMedium" style={muted}>
            Waiting for the buyer to scan…
          </Text>
        </Appear>
      )}
      <Appear index={3}>
        <Button
          icon="share-variant"
          onPress={() => Share.share({ message: `Take over my ${name} on RideReady (works once): ${link}` })}
          disabled={expired}>
          Send as a link instead
        </Button>
        <Button textColor={colors.error} onPress={t.cancel} loading={t.cancelling} disabled={t.cancelling}>
          Cancel transfer
        </Button>
      </Appear>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  center: { textAlign: 'center' },
  gap: { marginTop: 12 },
  cta: { minHeight: 52 },
  qr: { alignSelf: 'center', padding: 8, borderRadius: 16 },
  waiting: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center' },
});
