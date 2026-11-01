import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Surface, Text, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { routes } from '@/constants/routes';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useSelectedVehicle } from '@/hooks/use-vehicles';
import { useToastStore } from '@/stores/toast.store';
import { FONT_ASSETS, useAppTheme } from '@/theme';

// Floating pill bar: a circle behind the active icon, and a raised "+" in the middle that opens
// the quick-add sheet (logging is the app's main action). Sits in normal layout, so screens need no
// extra bottom padding.
export function TabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardVisible();
  const vehicle = useSelectedVehicle();
  const show = useToastStore((s) => s.show);
  if (keyboard) return null; // keep the bar from riding up over the keyboard (Android)

  const middle = Math.ceil(state.routes.length / 2);

  return (
    <View style={[styles.outer, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Surface elevation={3} style={[styles.bar, { backgroundColor: colors.elevation.level2, borderColor: colors.outlineVariant }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = options.title ?? route.name;
          const color = focused ? colors.onSecondaryContainer : colors.onSurfaceVariant;

          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          return (
            <Fragment key={route.key}>
              {index === middle && (
                <View style={styles.addSlot}>
                  <TouchableRipple
                    onPress={() => (vehicle ? router.push(routes.quickAdd()) : show('Add a vehicle first.'))}
                    borderless
                    style={[styles.add, { backgroundColor: colors.primary }]}
                    accessibilityRole="button"
                    accessibilityLabel="Log a fill-up, charge, service or expense">
                    <Icon source="plus" size={30} color={colors.onPrimary} />
                  </TouchableRipple>
                </View>
              )}
              <TouchableRipple
                onPress={onPress}
                onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
                borderless
                style={styles.item}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={label}>
                <View style={styles.itemInner}>
                  <View style={[styles.indicator, focused && { backgroundColor: colors.secondaryContainer }]}>
                    {options.tabBarIcon?.({ focused, color, size: 24 })}
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[styles.label, { color: focused ? colors.onSurface : colors.onSurfaceVariant, fontFamily: focused ? FONT_ASSETS.semibold : FONT_ASSETS.medium }]}>
                    {label}
                  </Text>
                </View>
              </TouchableRipple>
            </Fragment>
          );
        })}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: 16, paddingTop: 8 },
  bar: { flexDirection: 'row', alignItems: 'center', borderRadius: 28, borderWidth: StyleSheet.hairlineWidth, height: 68, paddingHorizontal: 6 },
  item: { flex: 1, borderRadius: 20 },
  itemInner: { alignItems: 'center', gap: 2, paddingVertical: 4 },
  indicator: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }, // circle, echoing the round +
  label: { fontSize: 12, lineHeight: 16 },
  addSlot: { width: 64, alignItems: 'center' },
  add: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: -28 },
});
