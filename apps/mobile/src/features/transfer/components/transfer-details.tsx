import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { Appear } from '@/components/ui/appear';
import { Card } from '@/components/ui/card';
import { InfoCard } from '@/components/ui/info-card';
import { VehicleArt } from '@/components/vehicle-art';
import { routes } from '@/constants/routes';
import { PROPULSION_UI } from '@/constants/vehicles';
import { useAcceptTransfer, useTransfer } from '@/hooks/use-transfers';
import { useGarageStore } from '@/stores/garage.store';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';

import { transferContents } from '../utils/transfer-contents';

// Buyer side, opened by a scanned transfer QR code or rideready://transfer/<id> link.
export function TransferDetails({ id }: { id: string }) {
  const { colors } = useAppTheme();
  const transfer = useTransfer(id);
  const accept = useAcceptTransfer();
  const selectVehicle = useGarageStore((s) => s.selectVehicle);
  const show = useToastStore((s) => s.show);

  if (transfer.isPending) return <ActivityIndicator style={styles.flex} />;
  const t = transfer.data;
  if (!t) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <InfoCard
          icon="qrcode-remove"
          title="Can't open this transfer code"
          body="It may have expired, been cancelled, or already been used. Ask the seller to show a new code."
        />
      </ScrollView>
    );
  }
  if (t.mine) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <InfoCard icon="account-arrow-right" title="This is your own transfer code" body="Show it to the buyer so they can scan it." />
      </ScrollView>
    );
  }

  const v = t.vehicle;
  const name = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;
  if (t.acceptedAt) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <InfoCard
          icon="check-circle-outline"
          tone="primary"
          title="Already in your garage"
          body={`${name} is yours now.`}
          action={<Button onPress={() => router.replace(routes.vehicle(v.id))}>Open it</Button>}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Appear>
        <VehicleArt vehicle={v} height={120} />
        <Text variant="headlineSmall" style={styles.center}>
          {name}
        </Text>
        <Text variant="bodyMedium" style={[styles.center, { color: colors.onSurfaceVariant }]}>
          {PROPULSION_UI[v.propulsion].label}
        </Text>
      </Appear>
      <Card index={1}>
        <Text variant="titleSmall">Comes with</Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          {transferContents(t.counts)}. Everything was logged by the previous owner. Their trips stay private.
        </Text>
      </Card>
      <Appear index={2}>
        <Button
          mode="contained"
          icon="garage-variant"
          loading={accept.isPending}
          disabled={accept.isPending}
          contentStyle={styles.cta}
          onPress={() =>
            accept.mutate(id, {
              onSuccess: ({ vehicleId }) => {
                selectVehicle(vehicleId);
                show(`${v.make} ${v.model} is in your garage, with its history.`);
                router.replace(routes.vehicle(vehicleId));
              },
              onError: (e) => show(e.message),
            })
          }>
          Add to my garage
        </Button>
      </Appear>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  center: { textAlign: 'center' },
  cta: { minHeight: 52 },
});
