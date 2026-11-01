import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { InfoCard } from '@/components/ui/info-card';
import { DocumentForm } from '@/features/documents/components/document-form';
import { useVehicles } from '@/hooks/use-vehicles';

export default function NewDocumentScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const vehicles = useVehicles();
  const vehicle = vehicles.data?.find((v) => v.id === vehicleId);
  if (vehicles.isPending) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!vehicle) return <InfoCard icon="car-off" title="Vehicle not found" body="It may have been deleted." />;
  return <DocumentForm vehicle={vehicle} />;
}
