import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme, useColorScheme } from 'nativewind';

export type ThemePreference = 'light' | 'dark' | 'system';

const THEME_KEY = 'vandor.theme';

export async function loadThemePreference(): Promise<ThemePreference> {
  try {
    const raw = await AsyncStorage.getItem(THEME_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    // fall through to default
  }
  return 'system';
}

/** Applies a persisted theme preference to NativeWind's color scheme. Call
 * once on app boot, before the first paint that depends on colors. */
export async function initializeTheme(): Promise<void> {
  const pref = await loadThemePreference();
  colorScheme.set(pref);
}

/** Drives the "Dark Mode" toggle on the Profile screen. Exposes a simple
 * boolean (rather than the light/dark/system tri-state) since that's the
 * only choice the UI offers today. */
export function useDarkModeToggle() {
  const { colorScheme: active, setColorScheme } = useColorScheme();
  const [isDark, setIsDark] = useState(active === 'dark');

  useEffect(() => {
    setIsDark(active === 'dark');
  }, [active]);

  const toggle = useCallback(
    async (next: boolean) => {
      const pref: ThemePreference = next ? 'dark' : 'light';
      setColorScheme(pref);
      setIsDark(next);
      try {
        await AsyncStorage.setItem(THEME_KEY, pref);
      } catch {
        // non-fatal — the toggle still works for this session
      }
    },
    [setColorScheme]
  );

  return { isDark, toggle };
}
