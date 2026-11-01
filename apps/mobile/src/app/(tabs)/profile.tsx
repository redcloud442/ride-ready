import { ScrollView, StyleSheet } from 'react-native';

import { Credits } from '@/features/profile/components/credits';
import { ProfileHeader } from '@/features/profile/components/profile-header';
import { ProfileSettings } from '@/features/profile/components/profile-settings';
import { useAppTheme } from '@/theme';

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <ProfileHeader />
      <ProfileSettings />
      <Credits />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 24, paddingBottom: 48 },
});
