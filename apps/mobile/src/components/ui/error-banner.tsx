import { StyleSheet } from 'react-native';
import { Button, Icon, Surface, Text } from 'react-native-paper';

import { useAppTheme } from '@/theme';

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Surface elevation={0} style={[styles.banner, { backgroundColor: colors.errorContainer }]} accessibilityRole="alert">
      <Icon source="alert-circle-outline" size={20} color={colors.onErrorContainer} />
      <Text variant="bodyMedium" style={[styles.text, { color: colors.onErrorContainer }]}>
        {message}
      </Text>
      {onRetry && (
        <Button onPress={onRetry} textColor={colors.onErrorContainer}>
          Retry
        </Button>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 16, paddingLeft: 16, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { flex: 1 },
});
