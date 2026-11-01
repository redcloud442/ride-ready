import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, IconButton, List, Text } from 'react-native-paper';

import type { Family, FamilyMember } from '@/api/family.api';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useCancelInvite, useRemoveMember } from '@/hooks/use-family';
import { authClient } from '@/lib/auth-client';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';

import { InviteForm } from './invite-form';
import { InviteQrDialog } from './invite-qr-dialog';

// The user's own family: who can open their garage, pending invites, and a new invite.
export function MyFamily({ family }: { family: Family | null }) {
  const { colors } = useAppTheme();
  const { data: session } = authClient.useSession();
  const remove = useRemoveMember();
  const cancel = useCancelInvite();
  const show = useToastStore((s) => s.show);
  const [qr, setQr] = useState<{ id: string; email: string } | null>(null); // dialog state
  const [removing, setRemoving] = useState<FamilyMember | null>(null); // dialog state

  // Explicit null checks, never `a?.b.c` or `a!.b` on nullable state: React Compiler turns them into
  // render-time reads of `a.b` (its memo dependency), which throws while `a` is null.
  const members = family ? family.members.filter((m) => m.userId !== session?.user.id) : [];
  const pending = family ? family.invitations.filter((i) => i.status === 'pending' && new Date(i.expiresAt) > new Date()) : [];

  return (
    <View style={styles.wrap}>
      {members.length === 0 && pending.length === 0 && (
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          Invite family members to see and log everything in your garage: vehicles, fuel, charging, maintenance, trips and documents.
        </Text>
      )}
      {members.map((m) => (
        <List.Item
          key={m.id}
          title={m.user.name}
          description={m.user.email}
          left={(p) => <List.Icon {...p} icon="account-outline" />}
          right={() => <IconButton icon="account-remove-outline" onPress={() => setRemoving(m)} accessibilityLabel={`Remove ${m.user.name}`} />}
        />
      ))}
      {pending.map((i) => (
        <List.Item
          key={i.id}
          title={i.email}
          description="Invited, not joined yet"
          left={(p) => <List.Icon {...p} icon="email-outline" />}
          right={() => (
            <View style={styles.row}>
              <IconButton icon="qrcode" onPress={() => setQr({ id: i.id, email: i.email })} accessibilityLabel={`Show invite for ${i.email}`} />
              <IconButton
                icon="close"
                disabled={cancel.isPending}
                onPress={() => cancel.mutate(i.id, { onError: (e) => show(e.message) })}
                accessibilityLabel={`Cancel invite for ${i.email}`}
              />
            </View>
          )}
        />
      ))}
      {(members.length > 0 || pending.length > 0) && <Divider />}
      <InviteForm organizationId={family?.id} onInvited={setQr} />
      <InviteQrDialog invite={qr} onDismiss={() => setQr(null)} />
      <ConfirmDialog
        visible={!!removing}
        title={removing ? `Remove ${removing.user.name}?` : ''}
        body="They lose access to your garage right away. Records they logged stay."
        confirmLabel="Remove"
        busy={remove.isPending}
        onDismiss={() => setRemoving(null)}
        onConfirm={() => {
          if (!family || !removing) return;
          remove.mutate(
            { organizationId: family.id, memberId: removing.id },
            { onError: (e) => show(e.message), onSettled: () => setRemoving(null) },
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row' },
});
