import {
  bodyStyleOf,
  bodyStylesFor,
  defaultBodyStyle,
  PROPULSIONS,
  VEHICLE_COLORS,
  VEHICLE_TYPES,
  type BodyStyle,
  type Propulsion,
  type VehicleColor,
  type VehicleType,
} from '@ride-ready/core';

import { VEHICLE_PAINT } from '@/theme/vehicle-paint';

import { VEHICLE_IMAGES } from './vehicle-images';

// Display copy, icons and 3D renders (image = bundled asset id from require) for the domain values in @ride-ready/core.
// Renders come from docs/brand/vehicles (regenerate there, never hand-edit the WebPs).

export const VEHICLE_TYPE_UI: Record<VehicleType, { label: string }> = {
  car: { label: 'Car' },
  motorcycle: { label: 'Motorcycle' },
};

export const BODY_STYLE_UI: Record<BodyStyle, { label: string; hint: string }> = {
  sedan: { label: 'Sedan', hint: 'Four doors, trunk' },
  hatchback: { label: 'Hatchback', hint: 'Compact, rear hatch' },
  suv: { label: 'SUV', hint: 'Crossover or 4x4' },
  pickup: { label: 'Pickup', hint: 'Open cargo bed' },
  van: { label: 'Van / MPV', hint: '7+ seats or cargo' },
  coupe: { label: 'Coupe', hint: 'Two doors, sporty' },
  sport: { label: 'Sport', hint: 'Faired, sporty' },
  cruiser: { label: 'Cruiser', hint: 'Low seat, relaxed' },
  scooter: { label: 'Scooter', hint: 'Step-through' },
  adventure: { label: 'Adventure', hint: 'Tall, on and off road' },
};

export const PROPULSION_UI: Record<Propulsion, { label: string; hint: string; icon: string; image: number }> = {
  gasoline: { label: 'Gasoline', hint: 'Petrol engine', icon: 'gas-station', image: require('@/assets/images/vehicles/gasoline.webp') },
  diesel: { label: 'Diesel', hint: 'Diesel engine', icon: 'barrel', image: require('@/assets/images/vehicles/diesel.webp') },
  hybrid: { label: 'Hybrid', hint: 'Self-charging, fuel only', icon: 'leaf', image: require('@/assets/images/vehicles/hybrid.webp') },
  phev: { label: 'Plug-in hybrid', hint: 'Fuel and charging', icon: 'ev-plug-type2', image: require('@/assets/images/vehicles/phev.webp') },
  ev: { label: 'Electric', hint: 'Charging only', icon: 'lightning-bolt', image: require('@/assets/images/vehicles/ev.webp') },
};

export const VEHICLE_COLOR_UI: Record<VehicleColor, { label: string; swatch: string }> = Object.fromEntries(
  VEHICLE_COLORS.map((c) => [c, { label: c[0].toUpperCase() + c.slice(1), swatch: VEHICLE_PAINT[c] }]),
) as Record<VehicleColor, { label: string; swatch: string }>;

/** The render for a body style in a paint (null/undefined = the model's own paint). */
export const vehicleImage = (style: BodyStyle, color?: VehicleColor | null) => VEHICLE_IMAGES[style][color ?? 'default'];
export const vehicleImageOf = (v: { type: VehicleType; bodyStyle?: BodyStyle | null; color?: VehicleColor | null }) =>
  vehicleImage(bodyStyleOf(v), v.color);

// Option lists for the picture pickers (components/ui/image-choice-grid.tsx); body styles preview the chosen paint.
export const TYPE_OPTIONS = VEHICLE_TYPES.map((t) => ({ value: t, label: VEHICLE_TYPE_UI[t].label, image: vehicleImage(defaultBodyStyle(t)) }));
export const PROPULSION_OPTIONS = PROPULSIONS.map((p) => ({ value: p, ...PROPULSION_UI[p] }));
export const bodyStyleOptions = (type: VehicleType | undefined, color?: VehicleColor | null) =>
  type ? bodyStylesFor(type).map((b) => ({ value: b, ...BODY_STYLE_UI[b], image: vehicleImage(b, color) })) : [];
