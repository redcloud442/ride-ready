import { Image } from 'expo-image';

// Gauge arc + check needle. Rendered from docs/brand/render-brand-assets.mjs; white/teal, for brand surfaces.
const source = require('@/assets/images/brand/logo-mark.png');

export function LogoMark({ size = 56 }: { size?: number }) {
  return <Image source={source} style={{ width: size, height: size }} accessibilityLabel="RideReady logo" />;
}
