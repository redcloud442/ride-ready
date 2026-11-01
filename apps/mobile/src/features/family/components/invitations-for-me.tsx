import { StyleSheet, View } from 'react-native';
import { Button, List } from 'react-native-paper';

import { useAcceptInvite, useDeclineInvite, useInvitationsForMe } from '@/hooks/use-family';
import { useToastStore } from '@/stores/toast.store';

// Invitations sent to the signed-in email: they show up here without scanning anything.
export function InvitationsForMe() {
  const invitations = useInvitationsForMe();
  const accept = useAcceptInvite();
  const decline = useDeclineInvite();
  const show = useToastStore((s) => s.show);
  const busy = accept.isPending || decline.isPending;

  const pending = invitations.data?.filter((i) => i.status === 'pending' && new Date(i.expiresAt) > new Date()) ?? [];
  if (!pending.length) return null;

  return (
    <>
      {pending.map((i) => (
        <List.Item
          key={i.id}
          title={i.organizationName}
          description="Invited you to their garage"
          left={(p) => <List.Icon {...p} icon="email-open-outline" />}
          right={() => (
            <View style={styles.row}>
              <Button disabled={busy} onPress={() => decline.mutate(i.id, { onError: (e) => show(e.message) })}>
                Decline
              </Button>
              <Button
                mode="contained-tonal"
                disabled={busy}
                onPress={() => accept.mutate(i.id, { onSuccess: () => show('Joined. Their vehicles are in your garage.'), onError: (e) => show(e.message) })}>
                Join
              </Button>
            </View>
          )}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
