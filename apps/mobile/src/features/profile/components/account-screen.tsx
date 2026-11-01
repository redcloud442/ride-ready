import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { FormSection } from '@/components/ui/form-section';
import { SPACE, useAppTheme } from '@/theme';

// Frame of the Profile edit screens (app/account/*): one form group, keyboard-safe.
export function AccountScreen({ footer, children }: { footer?: string; children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
        <FormSection footer={footer}>{children}</FormSection>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: SPACE.lg, paddingBottom: SPACE.xxl },
});
