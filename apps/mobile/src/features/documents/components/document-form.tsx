import { DOCUMENT_KINDS, type VehicleSummary } from '@ride-ready/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useController, useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect } from '@/components/ui/chip-select';
import { DateField } from '@/components/ui/date-field';
import { FormTextInput } from '@/components/ui/form-text-input';
import { SwitchField } from '@/components/ui/switch-field';
import { DOCUMENT_KIND_UI, READABLE_MIME_TYPES } from '@/constants/documents';
import { useUploadDocument } from '@/hooks/use-documents';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';

import { documentFormSchema, type DocumentFormInput, type DocumentFormValues } from '../documents.schemas';
import { usePickFile } from '../hooks/use-pick-file';
import { useScanReceipt } from '../hooks/use-scan-receipt';

const KIND_OPTIONS = DOCUMENT_KINDS.map((k) => ({ value: k, label: DOCUMENT_KIND_UI[k].label, icon: DOCUMENT_KIND_UI[k].icon }));

export function DocumentForm({ vehicle }: { vehicle: VehicleSummary }) {
  const { colors } = useAppTheme();
  const upload = useUploadDocument();
  const scanner = useScanReceipt(vehicle);
  const pick = usePickFile();
  const show = useToastStore((s) => s.show);
  const { control, handleSubmit } = useForm<DocumentFormInput, unknown, DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: { kind: 'receipt', title: '', hasExpiry: false, expiresAt: new Date(), readNow: true, file: null },
  });
  const { field: fileField, fieldState: fileState } = useController({ control, name: 'file' });
  const [kind, hasExpiry, readNow] = useWatch({ control, name: ['kind', 'hasExpiry', 'readNow'] });
  const file = fileField.value;
  const canRead = (kind === 'receipt' || kind === 'photo') && !!file && READABLE_MIME_TYPES.includes(file.mimeType);

  const choose = (picker: () => Promise<DocumentFormInput['file']>) => async () => {
    const picked = await picker();
    if (picked) fileField.onChange(picked);
  };

  const submit = () =>
    handleSubmit((v) =>
      upload.mutate(
        {
          vehicleId: vehicle.id,
          file: v.file!,
          meta: {
            kind: v.kind,
            title: v.title,
            expiresAt: DOCUMENT_KIND_UI[v.kind].expires && v.hasExpiry ? v.expiresAt.toISOString() : null,
          },
        },
        {
          onSuccess: (doc) => {
            if (canRead && v.readNow) {
              show('Saved. Reading it now…');
              scanner.scan(doc.id, { uri: v.file!.uri, replace: true });
            } else {
              show(`${DOCUMENT_KIND_UI[v.kind].label} saved`);
              router.back();
            }
          },
        },
      ),
    )();

  const busy = upload.isPending || scanner.scanning;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <ChipSelect control={control} name="kind" label="Type" options={KIND_OPTIONS} />

        <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
          File
        </Text>
        {file ? (
          <Surface elevation={1} style={[styles.file, { borderColor: colors.outlineVariant }]}>
            <Icon source={file.mimeType === 'application/pdf' ? 'file-pdf-box' : 'image-outline'} size={28} color={colors.primary} />
            <Text variant="bodyMedium" numberOfLines={1} style={styles.flex}>
              {file.name}
            </Text>
            <Button onPress={() => fileField.onChange(null)}>Change</Button>
          </Surface>
        ) : (
          <View style={styles.sources}>
            <Button mode="contained-tonal" icon="camera-outline" onPress={choose(() => pick.fromImage('camera'))}>
              Take photo
            </Button>
            <Button mode="outlined" icon="image-multiple-outline" onPress={choose(() => pick.fromImage('library'))}>
              Choose photo
            </Button>
            <Button mode="outlined" icon="file-document-outline" onPress={choose(pick.fromFiles)}>
              Choose file (PDF)
            </Button>
          </View>
        )}
        <HelperText type="error" visible={!!fileState.error}>
          {fileState.error?.message}
        </HelperText>

        <FormTextInput control={control} name="title" label="Title (optional)" placeholder="e.g. Shell, 12 Oct" maxLength={120} />

        {DOCUMENT_KIND_UI[kind].expires && (
          <>
            <SwitchField control={control} name="hasExpiry" label="Has an expiry date" hint="You'll see it on Home before it runs out" />
            {hasExpiry && <DateField control={control} name="expiresAt" label="Expires on" allowFuture />}
          </>
        )}
        {canRead && (
          <SwitchField
            control={control}
            name="readNow"
            label="Fill in a log from it"
            hint={readNow ? 'Reads the receipt and opens the right form for you to check' : undefined}
          />
        )}
        {upload.error && (
          <HelperText type="error" visible accessibilityLiveRegion="polite">
            {upload.error.message}
          </HelperText>
        )}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={[styles.footer, { borderTopColor: colors.outlineVariant }]}>
        <Button mode="contained" onPress={submit} loading={busy} disabled={busy} contentStyle={styles.cta}>
          {scanner.scanning ? 'Reading…' : 'Save document'}
        </Button>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 8 },
  sources: { gap: 8 },
  file: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: 1, paddingLeft: 12, paddingVertical: 4 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth },
  cta: { height: 52 },
});
