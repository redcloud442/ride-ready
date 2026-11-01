import type { VehicleSummary } from '@ride-ready/core';
import type { ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormSection } from '@/components/ui/form-section';
import { VehicleThumb } from '@/components/vehicle-thumb';
import type { LogDraft } from '@/stores/log-draft.store';
import { RADIUS, useAppTheme } from '@/theme';

type Props = {
  vehicle: VehicleSummary | undefined;
  saving: boolean;
  loading?: boolean;
  error?: string;
  saveLabel: string;
  onSave: () => void;
  /** set when the form was prefilled from a scanned receipt */
  draft?: LogDraft | null;
  children: ReactNode;
};

// Shared frame of every log screen: which vehicle, the fields, the save bar.
export function LogLayout({ vehicle, saving, loading, error, saveLabel, onSave, draft, children }: Props) {
  const { colors } = useAppTheme();
  if (loading) return <ActivityIndicator style={[styles.flex, { backgroundColor: colors.background }]} />;
  if (!vehicle) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text variant="bodyLarge">Add a vehicle first.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.vehicle}>
          <VehicleThumb vehicle={vehicle} height={22} />
          <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Text>
        </View>
        {draft?.source === 'receipt' && (
          <View style={[styles.draft, { backgroundColor: colors.tertiaryContainer }]} accessibilityRole="alert">
            <Icon source="text-recognition" size={20} color={colors.onTertiaryContainer} />
            <Text variant="bodySmall" style={[styles.flex, { color: colors.onTertiaryContainer }]}>
              Filled in from your receipt. Check every value before saving
              {draft.unclear?.length ? `; hard to read: ${draft.unclear.join(', ')}` : ''}.
            </Text>
          </View>
        )}
        <FormSection>{children}</FormSection>
        {error && (
          <HelperText type="error" visible accessibilityLiveRegion="polite">
            {error}
          </HelperText>
        )}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={[styles.footer, { borderTopColor: colors.outlineVariant }]}>
        <Button mode="contained" onPress={onSave} loading={saving} disabled={saving} style={styles.ctaButton} contentStyle={styles.cta}>
          {saveLabel}
        </Button>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 4 },
  vehicle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  draft: { flexDirection: 'row', gap: 10, borderRadius: RADIUS.md, padding: 12, marginBottom: 12 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth },
  ctaButton: { borderRadius: RADIUS.pill },
  cta: { height: 52 },
});
