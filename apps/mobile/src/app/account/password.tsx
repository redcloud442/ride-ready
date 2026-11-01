import { router } from 'expo-router';

import { AccountScreen } from '@/features/profile/components/account-screen';
import { PasswordForm } from '@/features/profile/components/password-form';

export default function PasswordScreen() {
  return (
    <AccountScreen footer="Changing it signs you out on your other devices.">
      <PasswordForm onDone={() => router.back()} />
    </AccountScreen>
  );
}
