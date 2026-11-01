import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Divider, Menu, TouchableRipple } from 'react-native-paper';

import { UserAvatar } from '@/components/ui/user-avatar';
import { routes } from '@/constants/routes';
import { useSignOut } from '@/hooks/use-auth-actions';
import { useTripsToggle } from '@/hooks/use-trips-toggle';
import { authClient } from '@/lib/auth-client';

export function AccountMenu() {
  const { data: session } = authClient.useSession();
  const signOut = useSignOut();
  const [open, setOpen] = useState(false); // local UI toggle
  const trips = useTripsToggle();
  const tripsEnabled = trips.enabled;

  function toggleTrips() {
    setOpen(false);
    trips.toggle();
  }

  const go = (href: Parameters<typeof router.push>[0]) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <TouchableRipple onPress={() => setOpen(true)} borderless style={styles.hit} accessibilityLabel="Account menu">
          <UserAvatar size={44} />
        </TouchableRipple>
      }>
      <Menu.Item title={session?.user.email} disabled leadingIcon="account-circle-outline" />
      <Menu.Item title="Profile" leadingIcon="account-edit-outline" onPress={() => go(routes.profile)} />
      <Menu.Item title="Family" leadingIcon="account-group-outline" onPress={() => go(routes.family)} />
      <Menu.Item
        title={tripsEnabled ? 'Trip tracking: on' : 'Trip tracking: off'}
        leadingIcon={tripsEnabled ? 'map-marker-check-outline' : 'map-marker-off-outline'}
        onPress={toggleTrips}
        accessibilityLabel={`Trip tracking is ${tripsEnabled ? 'on' : 'off'}. Double tap to turn it ${tripsEnabled ? 'off' : 'on'}`}
      />
      <Divider />
      <Menu.Item
        title="Sign out"
        leadingIcon="logout"
        onPress={() => {
          setOpen(false);
          signOut.mutate();
        }}
      />
    </Menu>
  );
}

const styles = StyleSheet.create({
  hit: { borderRadius: 24, padding: 2 },
});
