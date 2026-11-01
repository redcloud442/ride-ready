import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { InfoCard } from '@/components/ui/info-card';
import { TransferVehicle } from '@/features/transfer/components/transfer-vehicle';
import { useVehicles } from '@/hooks/use-vehicles';

export default function TransferVehicleScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const vehicles = useVehicles();
  const vehicle = vehicles.data?.find((v) => v.id === vehicleId);
  if (vehicles.isPending) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!vehicle) return <InfoCard icon="car-off" title="Vehicle not found" body="It may have been deleted or transferred." />;
  if (vehicle.shared) return <InfoCard icon="account-lock-outline" title="Only the owner can transfer this vehicle" body="It belongs to another member of your family." />;
  return <TransferVehicle vehicle={vehicle} />;
}
