import { DarkTheme as NavDark, DefaultTheme as NavLight } from 'expo-router';
import {
  configureFonts,
  MD3DarkTheme,
  MD3LightTheme,
  type MD3Theme,
  type MD3TypescaleKey,
  useTheme,
} from 'react-native-paper';

// Brand palette and type: docs/brand-guidelines.md. Violet-gray primary, teal secondary ("healthy/efficient"),
// amber tertiary for reminders. Change colors there first, then here.

export const FONT_ASSETS = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

// One font file per weight, so fontWeight stays 'normal' (Android ignores weights on custom families).
const familyFor = (variant: string) =>
  variant.startsWith('display') || variant.startsWith('headline')
    ? FONT_ASSETS.bold
    : variant.startsWith('title')
      ? FONT_ASSETS.semibold
      : variant.startsWith('label')
        ? FONT_ASSETS.medium
        : FONT_ASSETS.regular;

const fonts = configureFonts({
  config: Object.fromEntries(
    (Object.keys(MD3LightTheme.fonts) as (MD3TypescaleKey | 'default')[])
      .filter((k): k is MD3TypescaleKey => k !== 'default')
      .map((k) => [k, { fontFamily: familyFor(k), fontWeight: 'normal' as const }]),
  ),
});

const light: MD3Theme = {
  ...MD3LightTheme,
  fonts,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#5B4F86',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E9E5F3',
    onPrimaryContainer: '#2E2650',
    secondary: '#0F766E',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#CCFBF1',
    onSecondaryContainer: '#134E4A',
    tertiary: '#B45309',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FEF3C7',
    onTertiaryContainer: '#78350F',
    background: '#F8F7FB',
    onBackground: '#1C1A24',
    surface: '#FFFFFF',
    onSurface: '#1C1A24',
    surfaceVariant: '#F0EEF5',
    onSurfaceVariant: '#5A5668',
    outline: '#8E889F',
    outlineVariant: '#E6E3EE',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#FFFFFF',
      level3: '#F0EEF5',
      level4: '#F0EEF5',
      level5: '#E6E3EE',
    },
  },
};

const dark: MD3Theme = {
  ...MD3DarkTheme,
  fonts,
  roundness: 4,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#C7BEE6',
    onPrimary: '#2A2347',
    primaryContainer: '#433A68',
    onPrimaryContainer: '#E9E5F3',
    secondary: '#5EEAD4',
    onSecondary: '#042F2E',
    secondaryContainer: '#115E59',
    onSecondaryContainer: '#CCFBF1',
    tertiary: '#FBBF24',
    onTertiary: '#3B1D02',
    tertiaryContainer: '#78350F',
    onTertiaryContainer: '#FEF3C7',
    background: '#121019',
    onBackground: '#EEEDF3',
    surface: '#1A1724',
    onSurface: '#EEEDF3',
    surfaceVariant: '#262233',
    onSurfaceVariant: '#A9A4B8',
    outline: '#6E6884',
    outlineVariant: '#2A2638',
    elevation: {
      level0: 'transparent',
      level1: '#1A1724',
      level2: '#1F1B2B',
      level3: '#262233',
      level4: '#262233',
      level5: '#2F2A3E',
    },
  },
};

// Paper's adaptNavigationTheme doesn't accept expo-router 58's theme type, hence the manual map.
const nav = (base: typeof NavLight, paper: MD3Theme): typeof NavLight => ({
  ...base,
  colors: {
    ...base.colors,
    primary: paper.colors.primary,
    background: paper.colors.background,
    card: paper.colors.elevation.level2,
    text: paper.colors.onSurface,
    border: paper.colors.outlineVariant,
    notification: paper.colors.error,
  },
  fonts: {
    regular: { fontFamily: FONT_ASSETS.regular, fontWeight: 'normal' },
    medium: { fontFamily: FONT_ASSETS.medium, fontWeight: 'normal' },
    bold: { fontFamily: FONT_ASSETS.semibold, fontWeight: 'normal' },
    heavy: { fontFamily: FONT_ASSETS.bold, fontWeight: 'normal' },
  },
});

// Shape and spacing scale (docs/brand-guidelines.md §5). Use these instead of ad-hoc numbers.
export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;
export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

// Brand surfaces (gradient headers, logo areas) sit outside the MD3 roles, so they get their own tokens.
type BrandTokens = {
  gradient: readonly [string, string];
  onBrand: string;
  onBrandMuted: string;
  accent: string;
  motif: string;
};

export type AppTheme = MD3Theme & { brand: BrandTokens };

const lightApp: AppTheme = {
  ...light,
  brand: {
    gradient: ['#6B5E9C', '#2E2650'],
    onBrand: '#FFFFFF',
    onBrandMuted: '#F0EEF7',
    accent: '#5EEAD4',
    motif: 'rgba(255,255,255,0.08)',
  },
};

const darkApp: AppTheme = {
  ...dark,
  brand: {
    gradient: ['#3F3569', '#16121F'],
    onBrand: '#FFFFFF',
    onBrandMuted: '#D6D1E6',
    accent: '#5EEAD4',
    motif: 'rgba(255,255,255,0.06)',
  },
};

export const themes = {
  light: { paper: lightApp, nav: nav(NavLight, light) },
  dark: { paper: darkApp, nav: nav(NavDark, dark) },
};

export const useAppTheme = () => useTheme<AppTheme>();
