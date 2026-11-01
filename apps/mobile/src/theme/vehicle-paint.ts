import type { VehicleColor } from '@ride-ready/core';

// Swatch colours for the vehicle paint picker. Match the paints in docs/brand/vehicles (paint.py, render.mjs).
export const VEHICLE_PAINT: Record<VehicleColor, string> = {
  white: '#ECECE8',
  silver: '#A9ADB4',
  graphite: '#4E525A',
  black: '#16161A',
  red: '#AA181E',
  blue: '#1C46A0',
  green: '#225C3C',
  beige: '#C4B08C',
};
