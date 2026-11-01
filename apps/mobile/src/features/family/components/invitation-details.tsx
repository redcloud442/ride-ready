import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { InfoCard } from '@/components/ui/info-card';
import { routes } from '@/constants/routes';
import { useAcceptInvite, useDeclineInvite, useInvitation } from '@/hooks/use-family';
import { authClient } from '@/lib/auth-client';
import { useToastStore } from '@/stores/toast.store';

// Opened by a scanned QR code or a rideready://invite/<id> link.
export function InvitationDetails({ id }: { id: string }) {
  const { data: session } = authClient.useSession();
  const invitation = useInvitation(id);
  const accept = useAcceptInvite();
  const decline = useDeclineInvite();
  const show = useToastStore((s) => s.show);
  const busy = accept.isPending || decline.isPending;

  if (invitation.isPending) return <ActivityIndicator style={styles.flex} />;
  if (!invitation.data) {
    return (
      <View style={styles.content}>
        <InfoCard
          icon="email-off-outline"
          title="Can't open this invite"
          body={`It may have expired, been cancelled, or be meant for another email. You're signed in as ${session?.user.email ?? ''}.`}
        />
      </View>
    );
  }

  const inv = invitation.data;
  return (
    <View style={styles.content}>
      <Text variant="headlineSmall">Join {inv.organizationName}</Text>
      <Text variant="bodyMedium">
        {`${inv.inviterEmail} invited you. You'll see their vehicles in your garage and can log fuel, charging, maintenance, trips and documents for them. You can leave any time.`}
      </Text>
      <Button
        mode="contained"
        loading={accept.isPending}
        disabled={busy}
        onPress={() =>
          accept.mutate(id, {
            onSuccess: () => {
              show('Joined. Their vehicles are in your garage.');
              router.replace(routes.family);
            },
            onError: (e) => show(e.message),
          })
        }>
        Join
      </Button>
      <Button disabled={busy} onPress={() => decline.mutate(id, { onSuccess: () => router.back(), onError: (e) => show(e.message) })}>
        Decline
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 16 },
});
