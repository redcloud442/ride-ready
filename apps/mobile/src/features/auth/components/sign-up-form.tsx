import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { FormTextInput } from '@/components/ui/form-text-input';
import { useSignUp } from '@/hooks/use-auth-actions';

import { signUpSchema, type SignUpValues } from '../auth.schemas';
import { PasswordInput } from '@/components/ui/password-input';

export function SignUpForm() {
  const signUp = useSignUp();
  const { control, handleSubmit } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });
  // confirmPassword is UI-only; never sent
  const submit = () => handleSubmit(({ name, email, password }) => signUp.mutate({ name, email, password }))();

  return (
    <View>
      <FormTextInput
        control={control}
        name="name"
        label="Name"
        autoComplete="name"
        textContentType="name"
        left={<TextInput.Icon icon="account-outline" />}
      />
      <FormTextInput
        control={control}
        name="email"
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        left={<TextInput.Icon icon="email-outline" />}
      />
      <PasswordInput
        control={control}
        name="password"
        label="Password"
        info="8+ characters with a letter and a number"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <PasswordInput
        control={control}
        name="confirmPassword"
        label="Confirm password"
        left="lock-check-outline"
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={submit}
      />
      {signUp.error && (
        <HelperText type="error" visible accessibilityLiveRegion="polite">
          {signUp.error.message}
        </HelperText>
      )}
      <Button mode="contained" onPress={submit} loading={signUp.isPending} disabled={signUp.isPending} contentStyle={styles.cta}>
        Create account
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  cta: { height: 52 },
});
