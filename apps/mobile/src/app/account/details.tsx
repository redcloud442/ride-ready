import { router } from 'expo-router';

import { AccountScreen } from '@/features/profile/components/account-screen';
import { AvatarSection } from '@/features/profile/components/avatar-section';
import { NameForm } from '@/features/profile/components/name-form';

export default function NameAndPhotoScreen() {
  return (
    <AccountScreen footer="Family members see your name and photo.">
      <AvatarSection />
      <NameForm onDone={() => router.back()} />
    </AccountScreen>
  );
}
