import { useState } from 'react';
import { SegmentedButtons, Text } from 'react-native-paper';

import { AuthLayout } from '@/features/auth/components/auth-layout';
import { GoogleSignIn } from '@/features/auth/components/google-button';
import { SignInForm } from '@/features/auth/components/sign-in-form';
import { SignUpForm } from '@/features/auth/components/sign-up-form';
import { useAppTheme } from '@/theme';

type Mode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const { colors } = useAppTheme();
  const [mode, setMode] = useState<Mode>('sign-in');

  return (
    <AuthLayout title={mode === 'sign-in' ? 'Welcome back' : 'Create your garage'}>
      <SegmentedButtons
        value={mode}
        onValueChange={(v) => setMode(v as Mode)}
        buttons={[
          { value: 'sign-in', label: 'Sign in' },
          { value: 'sign-up', label: 'Sign up' },
        ]}
      />
      <GoogleSignIn />
      {/* keyed so switching mode remounts the form with fresh state */}
      {mode === 'sign-in' ? <SignInForm key="in" /> : <SignUpForm key="up" />}
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
        Your trips, receipts and documents stay private to your account.
      </Text>
    </AuthLayout>
  );
}
