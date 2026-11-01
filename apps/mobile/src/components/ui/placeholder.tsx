import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <View style={styles.box}>
      <Text variant="titleLarge">{title}</Text>
      <Text variant="bodyMedium">{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
});
