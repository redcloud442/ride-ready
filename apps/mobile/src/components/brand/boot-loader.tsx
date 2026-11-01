import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useAppTheme } from '@/theme';

import { BrandGradient } from './brand-gradient';
import { LogoMark } from './logo-mark';
import { Wordmark } from './wordmark';

// Same size and spot as the native splash image (app.json imageWidth), so the hand-off is invisible.
const LOGO = 120;
const RING = 176;
const STROKE = 3;
const R = (RING - STROKE) / 2;
const C = 2 * Math.PI * R;

/** Launch screen after the native splash: a gauge arc sweeps around the logo until the app is ready. */
export function BootLoader() {
  const { brand } = useAppTheme();
  const reduceMotion = useReducedMotion();
  const spin = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    spin.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.cubic) }), -1);
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [reduceMotion, spin, pulse]);

  const arc = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  const logo = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <Animated.View
      exiting={FadeOut.duration(420)}
      style={[StyleSheet.absoluteFill, { backgroundColor: brand.splash }]}
      accessible
      accessibilityLabel="Loading RideReady">
      <Animated.View entering={FadeIn.duration(600)} style={StyleSheet.absoluteFill}>
        <BrandGradient style={StyleSheet.absoluteFill} />
      </Animated.View>
      <View style={styles.center}>
        <Animated.View entering={FadeIn.duration(400).delay(150)} style={[styles.ring, arc]}>
          <Svg width={RING} height={RING}>
            <Circle cx={RING / 2} cy={RING / 2} r={R} stroke={brand.motif} strokeWidth={STROKE} fill="none" />
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={R}
              stroke={brand.accent}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${C * 0.28} ${C}`}
              fill="none"
            />
          </Svg>
        </Animated.View>
        <Animated.View style={logo}>
          <LogoMark size={LOGO} />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(420).delay(250)} style={styles.word}>
          <Wordmark size={26} onBrand />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
  // below the ring without pushing the logo off the splash position
  word: { position: 'absolute', top: '50%', marginTop: RING / 2 + 24 },
});
