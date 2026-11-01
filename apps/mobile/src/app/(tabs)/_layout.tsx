import { Tabs } from 'expo-router';
import { Icon, useTheme } from 'react-native-paper';

import { TabBar } from '@/components/navigation/tab-bar';
import { FONT_ASSETS } from '@/theme';

// Plan §4 listed five tabs. Trips is opt-in (account menu) and the Assistant went with the AI model,
// so the bar is Home, Garage, (+), Insights, Profile: two either side of the center action.
// Outline icon at rest, filled when active. The bar itself is components/navigation/tab-bar.tsx.
const TABS = [
  { name: 'index', title: 'Home', icon: 'home-variant-outline', active: 'home-variant' },
  { name: 'garage', title: 'Garage', icon: 'garage', active: 'garage-variant' },
  { name: 'insights', title: 'Insights', icon: 'chart-box-outline', active: 'chart-box' },
  { name: 'profile', title: 'Profile', icon: 'account-circle-outline', active: 'account-circle' },
] as const;

const OWN_HEADER = new Set<string>(['index', 'insights']);

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        animation: 'shift', // tab switch slides + fades (brand guide §8: motion explains the change)
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: FONT_ASSETS.semibold },
        headerShadowVisible: false,
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            headerShown: !OWN_HEADER.has(t.name), // these draw a brand band instead
            tabBarIcon: ({ color, size, focused }) => (
              <Icon source={focused ? t.active : t.icon} color={color as string} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
