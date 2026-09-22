// Design tokens mirrored from global.css (light palette) for places that need
// raw color values in JS — gradients, SVG fills, icon `color` props, etc.
// Prefer NativeWind className utilities (e.g. `bg-primary`) for everything else.

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

export const gradients = {
  sunset: ['#C64E26', '#EF852E', '#F4B93C'] as const,
  ink: ['#102519', '#041813'] as const,
};

export const radius = 14; // 0.875rem @ 16px base
