import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Entrance for page content (brand guide §8): fade + 12 dp rise, 320 ms, staggered 60 ms by `index`
// so a screen builds top to bottom. Reanimated skips it when the system asks for reduced motion.
export const enterAt = (index = 0) => FadeInDown.duration(320).delay(Math.min(index, 8) * 60).withInitialValues({ transform: [{ translateY: 12 }] });

export function Appear({ index = 0, style, children }: { index?: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <Animated.View entering={enterAt(index)} style={style}>
      {children}
    </Animated.View>
  );
}
