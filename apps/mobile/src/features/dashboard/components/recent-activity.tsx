import { StyleSheet, View } from 'react-native';
import { Divider, Icon, Surface, Text } from 'react-native-paper';

import { InfoCard } from '@/components/ui/info-card';
import { useAppTheme } from '@/theme';
import { formatDay, formatMoney } from '@/utils/format';

import type { FeedItem } from '@/utils/record-feed';

export function RecentActivity({ items }: { items: FeedItem[] }) {
  const { colors } = useAppTheme();
  if (!items.length) {
    return <InfoCard icon="history" title="Nothing logged yet" body="Fill-ups, trips and services appear here as you log them." />;
  }

  return (
    <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }]}>
      {items.map((item, i) => (
        <View key={item.key}>
          {i > 0 && <Divider />}
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: colors.surfaceVariant }]}>
              <Icon source={item.icon} size={20} color={colors.onSurfaceVariant} />
            </View>
            <View style={styles.text}>
              <Text variant="titleSmall" numberOfLines={1}>
                {item.title}
              </Text>
              <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
                {[formatDay(item.at), item.detail].filter(Boolean).join(' · ')}
              </Text>
            </View>
            {item.amount && (
              <Text variant="titleSmall" style={styles.amount}>
                {formatMoney(item.amount.value, item.amount.currency)}
              </Text>
            )}
          </View>
        </View>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  amount: { fontVariant: ['tabular-nums'] },
});
