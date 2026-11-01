import { router } from 'expo-router';

import { AccountScreen } from '@/features/profile/components/account-screen';
import { CurrencyForm } from '@/features/profile/components/currency-form';

export default function CurrencyScreen() {
  return (
    <AccountScreen footer="Every fill-up, charge, service and expense you log uses this currency.">
      <CurrencyForm onDone={() => router.back()} />
    </AccountScreen>
  );
}
