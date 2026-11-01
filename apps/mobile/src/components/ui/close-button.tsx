import { router } from 'expo-router';
import { IconButton } from 'react-native-paper';

// Visible way out of modal screens (iOS sheets otherwise only close by swiping).
export function CloseButton() {
  return <IconButton icon="close" onPress={() => router.back()} accessibilityLabel="Close" style={{ marginLeft: -8 }} />;
}
