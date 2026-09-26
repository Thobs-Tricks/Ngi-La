import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

/** Keeps the status bar text legible against whatever the active scheme's
 * background is — dark text on the light cream background, light text on
 * the dark background. Android is edge-to-edge by default in this Expo SDK,
 * so the status bar background itself is always transparent and can't be
 * recolored here — screens are responsible for painting their own
 * background under it (see ScreenContainer / navigator contentStyle). */
export default function AppStatusBar() {
  const { colorScheme } = useColorScheme();
  return <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />;
}
