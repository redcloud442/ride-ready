import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { FormTextInput } from '@/components/ui/form-text-input';
import { useSignIn } from '@/hooks/use-auth-actions';

import { signInSchema, type SignInValues } from '../auth.schemas';
import { PasswordInput } from '@/components/ui/password-input';

export function SignInForm() {
  const signIn = useSignIn();
  const { control, handleSubmit } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onTouched', // validate on blur, then live once touched
    defaultValues: { email: '', password: '' },
  });
  const submit = () => handleSubmit((values) => signIn.mutate(values))();

  return (
    <View>
      <FormTextInput
        control={control}
        name="email" placeholder="you@example.com"
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        left={<TextInput.Icon icon="email-outline" />}
      />
      <PasswordInput
        control={control}
        name="password" placeholder="Your password"
        label="Password"
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={submit}
      />
      {signIn.error && (
        <HelperText type="error" visible accessibilityLiveRegion="polite">
          {signIn.error.message}
        </HelperText>
      )}
      <Button mode="contained" onPress={submit} loading={signIn.isPending} disabled={signIn.isPending} contentStyle={styles.cta}>
        Sign in
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  cta: { height: 52 },
});
