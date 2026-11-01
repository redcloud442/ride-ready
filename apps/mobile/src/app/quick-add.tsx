import { useLocalSearchParams } from 'expo-router';

import { QuickAddSheet, type QuickType } from '@/features/quick-add/components/quick-add-sheet';

export default function QuickAddScreen() {
  const { type } = useLocalSearchParams<{ type?: QuickType }>();
  return <QuickAddSheet initial={type} />;
}
