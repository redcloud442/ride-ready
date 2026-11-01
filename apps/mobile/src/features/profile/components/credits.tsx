import { Linking, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '@/theme';

const PACK_URL = 'https://sketchfab.com/3d-models/generic-passenger-car-pack-20f9af9b8a404d5cb022ac6fe87f21f5';

// CC-BY-4.0 requires crediting the car models wherever the app ships.
export function Credits() {
  const { colors } = useAppTheme();
  return (
    <Text variant="bodySmall" style={[styles.text, { color: colors.onSurfaceVariant }]}>
      Car images based on{' '}
      <Text
        variant="bodySmall"
        style={{ color: colors.primary, textDecorationLine: 'underline' }}
        accessibilityRole="link"
        onPress={() => Linking.openURL(PACK_URL)}>
        &quot;Generic passenger car pack&quot;
      </Text>{' '}
      by Comrade1280, licensed under CC BY 4.0.
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { textAlign: 'center' },
});
