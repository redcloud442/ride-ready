import { StyleSheet, View } from 'react-native';
import { Button, Divider, HelperText, Text } from 'react-native-paper';

import { useGoogleSignIn } from '@/hooks/use-auth-actions';
import { useAppTheme } from '@/theme';

// "Continue with Google" + the "or with email" divider under it.
export function GoogleSignIn() {
  const { colors } = useAppTheme();
  const google = useGoogleSignIn();
  return (
    <View style={styles.wrap}>
      <Button
        mode="outlined"
        icon="google"
        onPress={() => google.mutate()}
        loading={google.isPending}
        disabled={google.isPending}
        contentStyle={styles.button}
        style={{ borderColor: colors.outline }}
        textColor={colors.onSurface}>
        Continue with Google
      </Button>
      {google.error && (
        <HelperText type="error" visible accessibilityLiveRegion="polite">
          {google.error.message}
        </HelperText>
      )}
      <View style={styles.dividerRow}>
        <Divider style={styles.flex} />
        <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
          or with email
        </Text>
        <Divider style={styles.flex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { gap: 16 },
  button: { height: 52 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
