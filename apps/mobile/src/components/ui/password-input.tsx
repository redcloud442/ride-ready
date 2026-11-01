import { useState } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { TextInput, type TextInputProps } from 'react-native-paper';

import { FormTextInput } from '@/components/ui/form-text-input';

type Props<T extends FieldValues> = Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'error'> & {
  // any: forms whose resolver transforms values (string → number) have a different output type
  control: Control<T, any, any>;
  name: Path<T>;
  info?: string;
};

// Password field with its own show/hide toggle (local UI state).
export function PasswordInput<T extends FieldValues>({ left = 'lock-outline', ...props }: Props<T> & { left?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <FormTextInput
      {...props}
      secureTextEntry={!visible}
      autoCapitalize="none"
      left={<TextInput.Icon icon={left} />}
      right={
        <TextInput.Icon
          icon={visible ? 'eye-off-outline' : 'eye-outline'}
          onPress={() => setVisible(!visible)}
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        />
      }
    />
  );
}
