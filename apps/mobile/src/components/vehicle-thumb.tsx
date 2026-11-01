import type { BodyStyle, VehicleColor, VehicleType } from '@ride-ready/core';
import { Image } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';

import { vehicleImageOf } from '@/constants/vehicles';

type Props = { vehicle: { type: VehicleType; bodyStyle?: BodyStyle | null; color?: VehicleColor | null }; height: number; style?: StyleProp<ImageStyle> };

// Small still of the vehicle's 3D render, in place of a generic car/motorbike icon. Decorative: the name is always next to it.
export function VehicleThumb({ vehicle, height, style }: Props) {
  return (
    <Image
      source={vehicleImageOf(vehicle)}
      style={[{ width: height * 1.6, height }, style]}
      contentFit="contain"
      accessible={false}
    />
  );
}
