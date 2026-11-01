import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';

import { routes } from '@/constants/routes';
import { PriceList } from '@/features/prices/components/price-list';

export default function PricesScreen() {
  return (
    <View style={styles.flex}>
      <PriceList />
      <FAB icon="plus" label="Report a price" style={styles.fab} onPress={() => router.push(routes.newPrice)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
