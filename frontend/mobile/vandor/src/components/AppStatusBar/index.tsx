import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

/** Keeps the status bar text legible against whatever the active scheme's
 * background is — dark text on the light cream background, light text on
 * the dark background. */
export default function AppStatusBar() {
  const { colorScheme } = useColorScheme();
  return <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />;
}
