import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

import { UserAvatar } from '@/components/ui/user-avatar';
import { useAvatar, useChangeAvatar, useRemoveAvatar } from '@/hooks/use-profile';
import { useToastStore } from '@/stores/toast.store';

export function AvatarSection() {
  const avatar = useAvatar();
  const change = useChangeAvatar();
  const remove = useRemoveAvatar();
  const show = useToastStore((s) => s.show);

  return (
    <View style={styles.row}>
      <UserAvatar size={72} />
      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon="camera-outline"
          loading={change.isPending}
          disabled={change.isPending}
          onPress={() => change.mutate(undefined, { onSuccess: (done) => done && show('Photo updated'), onError: (e) => show(e.message) })}>
          {avatar.data?.url ? 'Change photo' : 'Add photo'}
        </Button>
        {!!avatar.data?.url && (
          <Button icon="delete-outline" disabled={remove.isPending} onPress={() => remove.mutate(undefined, { onError: (e) => show(e.message) })}>
            Remove photo
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  actions: { flex: 1, gap: 4, alignItems: 'flex-start' },
});
