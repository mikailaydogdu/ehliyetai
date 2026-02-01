import { useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { ThemeContext } from '@/context/ThemeContext';

/** Uygulama genelinde kullanılan tema: Profil’deki seçime göre aydınlık/karanlık veya sistem. */
export function useColorScheme(): 'light' | 'dark' {
  const theme = useContext(ThemeContext);
  const system = useRNColorScheme();
  if (theme) return theme.colorScheme;
  return system === 'dark' ? 'dark' : 'light';
}
