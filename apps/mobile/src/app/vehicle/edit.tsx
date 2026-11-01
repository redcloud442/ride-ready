import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { InfoCard } from '@/components/ui/info-card';
import { VehicleEditForm } from '@/features/garage/components/vehicle-edit-form';
import { useVehicles } from '@/hooks/use-vehicles';

export default function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicles = useVehicles();
  const vehicle = vehicles.data?.find((v) => v.id === id);
  if (vehicles.isPending) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!vehicle) return <InfoCard icon="car-off" title="Vehicle not found" body="It may have been deleted." />;
  return <VehicleEditForm vehicle={vehicle} />;
}
