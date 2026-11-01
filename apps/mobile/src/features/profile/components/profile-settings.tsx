import { router } from 'expo-router';
import { Switch } from 'react-native-paper';

import { ListGroup, ListRow } from '@/components/ui/list-group';
import { routes } from '@/constants/routes';
import { useSignOut } from '@/hooks/use-auth-actions';
import { useFamily } from '@/hooks/use-family';
import { useCurrency } from '@/hooks/use-preferences';
import { useTripsToggle } from '@/hooks/use-trips-toggle';
import { authClient } from '@/lib/auth-client';

import { DeleteAccount } from './delete-account';

// Profile as settings groups; each row opens one small edit screen (app/account/*).
export function ProfileSettings() {
  const { data: session } = authClient.useSession();
  const currency = useCurrency();
  const trips = useTripsToggle();
  const family = useFamily();
  const signOut = useSignOut();
  // Google sign-ins have a verified email and no RideReady password (see email-form.tsx)
  const google = !!session?.user.emailVerified;

  const own = family.data?.own;
  const members = own ? own.members.length - 1 : 0;
  const joined = family.data?.joined.length ?? 0;
  const familySubtitle = members
    ? `${members} ${members === 1 ? 'person has' : 'people have'} access to your garage`
    : joined
      ? `You're in ${joined} shared ${joined === 1 ? 'garage' : 'garages'}`
      : 'Share your garage with family';

  return (
    <>
      <ListGroup title="Account" index={1}>
        <ListRow icon="account-outline" title="Name and photo" subtitle={session?.user.name} onPress={() => router.push(routes.account('details'))} />
        <ListRow
          icon="email-outline"
          title="Email"
          subtitle={google ? `${session?.user.email} · managed by Google` : session?.user.email}
          onPress={google ? undefined : () => router.push(routes.account('email'))}
        />
        {!google && <ListRow icon="lock-outline" title="Password" subtitle="Change your password" onPress={() => router.push(routes.account('password'))} />}
      </ListGroup>

      <ListGroup title="Preferences" index={2}>
        <ListRow
          icon="cash-multiple"
          title="Currency"
          subtitle={`${currency} · used by every form`}
          onPress={() => router.push(routes.account('currency'))}
        />
        <ListRow
          icon="map-marker-path"
          title="Trip tracking"
          subtitle={trips.enabled ? 'Record GPS trips from Home' : 'Off. Turn on to record GPS trips'}
          onPress={trips.toggle}
          right={<Switch value={trips.enabled} onValueChange={trips.toggle} disabled={trips.saving} />}
        />
      </ListGroup>

      <ListGroup title="Family" index={3}>
        <ListRow icon="account-group-outline" title="Family sharing" subtitle={familySubtitle} onPress={() => router.push(routes.family)} />
        <ListRow icon="qrcode-scan" title="Scan an invite" subtitle="Join someone's garage" onPress={() => router.push(routes.scanInvite)} />
      </ListGroup>

      <ListGroup index={4}>
        <ListRow icon="logout" title="Sign out" onPress={() => signOut.mutate()} disabled={signOut.isPending} />
        <DeleteAccount />
      </ListGroup>
    </>
  );
}
