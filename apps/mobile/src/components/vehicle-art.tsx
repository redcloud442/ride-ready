import type { BodyStyle, VehicleColor, VehicleType } from '@ride-ready/core';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { vehicleImageOf } from '@/constants/vehicles';
import { useAppTheme } from '@/theme';

type Props = { vehicle: { type: VehicleType; bodyStyle?: BodyStyle | null; color?: VehicleColor | null }; height?: number };

// 3D render of the vehicle's body style. It drives in from the left (a spring, so it overshoots a
// little and rocks back level as it brakes), then hovers over a soft shadow that breathes with it. A different
// body style or color drives in again. Still under reduced motion.
export function VehicleArt({ vehicle, height = 120 }: Props) {
  const { colors } = useAppTheme();
  const reduceMotion = useReducedMotion();
  const lift = useSharedValue(0);
  const arrive = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      arrive.value = 1;
      return;
    }
    arrive.value = 0;
    arrive.value = withSpring(1, { damping: 13, stiffness: 90, mass: 0.9 });
    lift.value = 0;
    lift.value = withDelay(600, withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [arrive, lift, reduceMotion, vehicle.type, vehicle.bodyStyle, vehicle.color]);

  const car = useAnimatedStyle(() => ({
    opacity: Math.min(1, arrive.value * 1.6),
    transform: [
      { translateX: -height * 0.7 * (1 - arrive.value) },
      { translateY: -6 * lift.value },
      // tilted while arriving, rocks the other way on the overshoot, level once settled
      { rotate: `${(arrive.value - 1) * -6}deg` },
    ],
  }));
  const shadow = useAnimatedStyle(() => ({
    opacity: (0.22 - 0.08 * lift.value) * Math.min(1, arrive.value),
    transform: [{ translateX: -height * 0.7 * (1 - arrive.value) }, { scaleX: 1 - 0.12 * lift.value }],
  }));

  return (
    <View style={{ height }} accessible={false} importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.shadow, { backgroundColor: colors.shadow, width: height * 1.3, left: '50%', marginLeft: -height * 0.65 }, shadow]} />
      <Animated.View style={[StyleSheet.absoluteFill, car]}>
        <Image source={vehicleImageOf(vehicle)} style={styles.image} contentFit="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // renders are 16:10 with ~15% empty margin, so the shadow sits a little above the bottom edge
  shadow: { position: 'absolute', bottom: '14%', height: 10, borderRadius: 999 },
  image: { width: '100%', height: '100%' },
});
