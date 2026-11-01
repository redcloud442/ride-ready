import { router } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { ErrorBanner } from '@/components/ui/error-banner';
import { FormSection } from '@/components/ui/form-section';
import { routes } from '@/constants/routes';
import { InvitationsForMe } from '@/features/family/components/invitations-for-me';
import { JoinedFamilies } from '@/features/family/components/joined-families';
import { MyFamily } from '@/features/family/components/my-family';
import { useFamily } from '@/hooks/use-family';
import { useAppTheme } from '@/theme';

export default function FamilyScreen() {
  const { colors } = useAppTheme();
  const family = useFamily();

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
        <InvitationsForMe />
        {family.isPending && <ActivityIndicator />}
        {family.error && <ErrorBanner message={family.error.message} onRetry={() => family.refetch()} />}
        {family.data && (
          <>
            <FormSection title="People with access to your garage">
              <MyFamily family={family.data.own} />
            </FormSection>
            {family.data.joined.length > 0 && (
              <FormSection title="Garages shared with you">
                <JoinedFamilies families={family.data.joined} />
              </FormSection>
            )}
          </>
        )}
        <Button mode="outlined" icon="qrcode-scan" onPress={() => router.push(routes.scanInvite)}>
          Scan an invite
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 24, paddingBottom: 48 },
});
