import { useState } from 'react';
import { Button, List } from 'react-native-paper';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useLeaveFamily } from '@/hooks/use-family';
import { useToastStore } from '@/stores/toast.store';

type Joined = { id: string; owner?: { user: { name: string; email: string } } };

// Garages shared with the user by other owners.
export function JoinedFamilies({ families }: { families: Joined[] }) {
  const leave = useLeaveFamily();
  const show = useToastStore((s) => s.show);
  const [leaving, setLeaving] = useState<Joined | null>(null); // dialog state
  const ownerName = (f: Joined | null) => f?.owner?.user.name ?? 'the owner';

  return (
    <>
      {families.map((f) => (
        <List.Item
          key={f.id}
          title={`${ownerName(f)}'s garage`}
          description={f.owner?.user.email}
          left={(p) => <List.Icon {...p} icon="garage-variant" />}
          right={() => <Button onPress={() => setLeaving(f)}>Leave</Button>}
        />
      ))}
      <ConfirmDialog
        visible={!!leaving}
        title={`Leave ${ownerName(leaving)}'s garage?`}
        body="Their vehicles disappear from your garage. Records you logged stay with them."
        confirmLabel="Leave"
        busy={leave.isPending}
        onDismiss={() => setLeaving(null)}
        onConfirm={() => {
          // explicit check: React Compiler would read `leaving.id` at render for `leaving!.id`
          if (!leaving) return;
          leave.mutate(leaving.id, {
            onSuccess: () => show('You left the family'),
            onError: (e) => show(e.message),
            onSettled: () => setLeaving(null),
          });
        }}
      />
    </>
  );
}
