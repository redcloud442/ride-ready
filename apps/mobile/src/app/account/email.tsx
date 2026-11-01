import { router } from 'expo-router';

import { AccountScreen } from '@/features/profile/components/account-screen';
import { EmailForm } from '@/features/profile/components/email-form';

export default function EmailScreen() {
  return (
    <AccountScreen>
      <EmailForm onDone={() => router.back()} />
    </AccountScreen>
  );
}
