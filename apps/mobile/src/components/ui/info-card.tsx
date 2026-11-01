import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Surface, Text } from 'react-native-paper';

import { useAppTheme } from '@/theme';

import { Appear } from './appear';

type Tone = 'primary' | 'secondary' | 'tertiary' | 'neutral';
type Props = { icon: string; title: string; body: string; tone?: Tone; action?: ReactNode };

// Icon tile + title + one line of explanation. Used for empty states and reminders.
export function InfoCard({ icon, title, body, tone = 'neutral', action }: Props) {
  const { colors } = useAppTheme();
  const tile = {
    primary: [colors.primaryContainer, colors.onPrimaryContainer],
    secondary: [colors.secondaryContainer, colors.onSecondaryContainer],
    tertiary: [colors.tertiaryContainer, colors.onTertiaryContainer],
    neutral: [colors.surfaceVariant, colors.onSurfaceVariant],
  }[tone];

  return (
    <Appear>
      <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }]}>
        <View style={[styles.icon, { backgroundColor: tile[0] }]}>
          <Icon source={icon} size={22} color={tile[1]} />
        </View>
        <View style={styles.text}>
          <Text variant="titleSmall">{title}</Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {body}
          </Text>
        </View>
        {action}
      </Surface>
    </Appear>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
