import './global.css';
import './src/lib/nativewind-interop';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/store/AuthContext';
import RootNavigator from './src/router/RootNavigator';
import { colors } from './src/styles/theme';
import { initializeTheme } from './src/lib/theme';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.foreground,
    primary: colors.primary,
    border: colors.border,
  },
};

export default function App() {
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    initializeTheme().finally(() => setThemeReady(true));
  }, []);

  // Hold the very first frame until the persisted theme preference (light /
  // dark / system) is applied, so the app never flashes the wrong scheme.
  if (!themeReady) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
