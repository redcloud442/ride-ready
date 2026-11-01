import type { VehicleDocument, VehicleSummary } from '@ride-ready/core';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, Divider, Icon, IconButton, Surface, Text, TouchableRipple } from 'react-native-paper';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InfoCard } from '@/components/ui/info-card';
import { DOCUMENT_KIND_UI, READABLE_MIME_TYPES } from '@/constants/documents';
import { routes } from '@/constants/routes';
import { useDeleteDocument, useDocuments, useOpenDocument } from '@/hooks/use-documents';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';
import { formatDate, formatDay } from '@/utils/format';

import { useScanReceipt } from '../hooks/use-scan-receipt';
import { expiryStatus } from '../utils/expiry';

export function DocumentList({ vehicle }: { vehicle: VehicleSummary }) {
  const { colors } = useAppTheme();
  const docs = useDocuments(vehicle.id);
  const open = useOpenDocument();
  const remove = useDeleteDocument();
  const scanner = useScanReceipt(vehicle);
  const show = useToastStore((s) => s.show);
  const [pending, setPending] = useState<VehicleDocument | null>(null); // local dialog state

  const name = (d: VehicleDocument) => d.title ?? DOCUMENT_KIND_UI[d.kind].label;

  return (
    <View style={styles.wrap}>
      {docs.isLoading ? (
        <ActivityIndicator style={styles.loading} />
      ) : !docs.data?.length ? (
        <InfoCard icon="file-document-multiple-outline" title="No documents yet" body="Keep receipts, insurance, registration and manuals with the vehicle." />
      ) : (
        <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }]}>
          {docs.data.map((d, i) => {
            const expiry = expiryStatus(d.expiresAt);
            const readable = (d.kind === 'receipt' || d.kind === 'photo') && READABLE_MIME_TYPES.includes(d.mimeType);
            return (
              <View key={d.id}>
                {i > 0 && <Divider />}
                <View style={styles.row}>
                  <TouchableRipple
                    style={styles.open}
                    onPress={() => open.mutate({ vehicleId: vehicle.id, id: d.id }, { onError: (e) => show(e.message) })}
                    accessibilityRole="button"
                    accessibilityLabel={`${name(d)}. Open`}>
                    <View style={styles.openInner}>
                      <View style={[styles.icon, { backgroundColor: colors.surfaceVariant }]}>
                        <Icon source={DOCUMENT_KIND_UI[d.kind].icon} size={20} color={colors.onSurfaceVariant} />
                      </View>
                      <View style={styles.flex}>
                        <Text variant="titleSmall" numberOfLines={1}>
                          {name(d)}
                        </Text>
                        <Text
                          variant="bodySmall"
                          numberOfLines={1}
                          style={{ color: expiry === 'expired' ? colors.error : expiry === 'soon' ? colors.tertiary : colors.onSurfaceVariant }}>
                          {d.expiresAt
                            ? `${expiry === 'expired' ? 'Expired' : 'Expires'} ${formatDate(new Date(d.expiresAt))}`
                            : `Added ${formatDay(new Date(d.createdAt))}`}
                        </Text>
                      </View>
                    </View>
                  </TouchableRipple>
                  {readable && (
                    <IconButton
                      icon="text-recognition"
                      size={22}
                      hitSlop={4}
                      disabled={scanner.scanning}
                      onPress={() => scanner.scan(d.id)}
                      accessibilityLabel={`Read ${name(d)} into a log`}
                    />
                  )}
                  {scanner.scanningId === d.id && <ActivityIndicator style={styles.spinner} />}
                  <IconButton icon="delete-outline" size={22} hitSlop={4} onPress={() => setPending(d)} accessibilityLabel={`Delete ${name(d)}`} />
                </View>
              </View>
            );
          })}
        </Surface>
      )}
      <Button mode="outlined" icon="file-plus-outline" onPress={() => router.push(routes.newDocument(vehicle.id))}>
        Add document
      </Button>
      <ConfirmDialog
        visible={!!pending}
        title="Delete this document?"
        body={pending ? `${name(pending)} will be removed from this vehicle.` : ''}
        confirmLabel="Delete"
        busy={remove.isPending}
        onDismiss={() => setPending(null)}
        onConfirm={() =>
          pending &&
          remove.mutate(
            { vehicleId: vehicle.id, id: pending.id },
            { onSuccess: () => show('Document deleted'), onError: (e) => show(e.message), onSettled: () => setPending(null) },
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { gap: 12 },
  loading: { height: 80 },
  card: { borderRadius: 16, borderWidth: 1, paddingLeft: 16, paddingRight: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  open: { flex: 1, borderRadius: 12 },
  openInner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  spinner: { marginHorizontal: 4 },
});
