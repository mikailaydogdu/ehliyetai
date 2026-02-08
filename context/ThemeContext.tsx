import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@fersa_theme';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  /** User preference: light, dark, or follow system */
  themePreference: ThemePreference;
  setThemePreference: (value: ThemePreference) => Promise<void>;
  /** Current theme in use (preference + system) */
  colorScheme: 'light' | 'dark';
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemePreferenceState(stored);
      }
    });
  }, []);

  const setThemePreference = useCallback(async (value: ThemePreference) => {
    await AsyncStorage.setItem(THEME_KEY, value);
    setThemePreferenceState(value);
  }, []);

  const colorScheme: 'light' | 'dark' =
    themePreference === 'system'
      ? (systemScheme === 'dark' ? 'dark' : 'light')
      : themePreference;

  return (
    <ThemeContext.Provider value={{ themePreference, setThemePreference, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
