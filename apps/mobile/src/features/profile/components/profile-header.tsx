import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text, TouchableRipple } from 'react-native-paper';

import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useChangeAvatar } from '@/hooks/use-profile';
import { authClient } from '@/lib/auth-client';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';

const memberSince = (d: Date | string | undefined) =>
  d ? new Date(d).toLocaleString(undefined, { month: 'long', year: 'numeric' }) : null;

// Who is signed in, Home-card style; tapping the photo changes it.
export function ProfileHeader() {
  const { colors } = useAppTheme();
  const { data: session } = authClient.useSession();
  const change = useChangeAvatar();
  const show = useToastStore((s) => s.show);
  const user = session?.user;
  const since = memberSince(user?.createdAt);

  return (
    <Card style={styles.card}>
      <TouchableRipple
        borderless
        style={styles.avatar}
        disabled={change.isPending}
        onPress={() => change.mutate(undefined, { onSuccess: (done) => done && show('Photo updated'), onError: (e) => show(e.message) })}
        accessibilityRole="button"
        accessibilityLabel="Change profile photo">
        <View>
          <UserAvatar size={88} />
          <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
            {change.isPending ? <ActivityIndicator size={14} color={colors.onPrimary} /> : <Icon source="camera" size={16} color={colors.onPrimary} />}
          </View>
        </View>
      </TouchableRipple>
      <View style={styles.text}>
        <Text variant="headlineSmall" numberOfLines={1} accessibilityRole="header">
          {user?.name}
        </Text>
        <Text variant="bodyMedium" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
          {user?.email}
        </Text>
        {since && (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            Member since {since}
          </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: 24 },
  avatar: { borderRadius: 48 },
  badge: { position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  text: { alignItems: 'center', gap: 2 },
});
