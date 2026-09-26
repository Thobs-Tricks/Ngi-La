// Design tokens mirrored from global.css for places that need raw color
// values in JS — gradients, SVG fills, icon `color` props, etc. Prefer
// NativeWind className utilities (e.g. `bg-primary`) for everything else,
// since those automatically respond to dark mode; these raw values don't,
// which is why `useThemeColors()` below picks the right set at render time.
import { useColorScheme } from 'nativewind';

export const colors = {
  background: '#FDF9F0',
  foreground: '#132218',
  card: '#FFFFFC',
  primary: '#C64E26',
  primaryForeground: '#FEFAF1',
  secondary: '#F5ECDA',
  secondaryForeground: '#223227',
  muted: '#F4EEE2',
  mutedForeground: '#626755',
  accent: '#EFAD2E',
  accentForeground: '#301D0D',
  destructive: '#DA2C2B',
  border: '#E6DFD0',
  ink: '#102519',
  inkForeground: '#FBF5E8',
  sand: '#F8EFDF',
  verified: '#1D8F69',
};

export const darkColors = {
  background: '#0A1710',
  foreground: '#F8F3E9',
  card: '#122219',
  primary: '#E7723B',
  primaryForeground: '#08120C',
  secondary: '#1D2D24',
  secondaryForeground: '#F8F3E9',
  muted: '#1D2D24',
  mutedForeground: '#A7A597',
  accent: '#EFAD2E',
  accentForeground: '#201308',
  destructive: '#F3625D',
  border: '#304437',
  ink: '#05100B',
  inkForeground: '#F8F3E9',
  sand: '#222618',
  verified: '#46B68C',
};

export const gradients = {
  // Muted terracotta — stays inside the terracotta family (deep rust to the
  // base primary), instead of ranging out into bright orange/gold.
  terracotta: ['#8F3818', '#C64E26'] as const,
  ink: ['#102519', '#041813'] as const,
};

export const radius = 14; // 0.875rem @ 16px base

/** Raw color values (for icon `color` props, ActivityIndicator, etc.) that
 * follow the active light/dark scheme. */
export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? darkColors : colors;
}
