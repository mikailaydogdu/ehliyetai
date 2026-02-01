/**
 * B Ehliyet - Tüm renk ve gölge tek yerden (Colors) yönetilir.
 * Ekranlarda sadece c = Colors[colorScheme] kullan; sabit hex yazma.
 */

import { Platform } from 'react-native';

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = {
  text: string;
  textSecondary: string;
  background: string;
  card: string;
  tint: string;
  primary: string;
  primaryContrast: string;
  primaryLight: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  border: string;
  selectedBg: string;
  cardShadow: string;
  success: string;
  error: string;
  /** Soru cevabında doğru şıkkı vurgulamak için yeşil */
  feedbackCorrect: string;
  /** Soru cevabında yanlış seçilen şıkkı vurgulamak için kırmızı */
  feedbackWrong: string;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export const Colors: Record<ColorScheme, ThemeColors> = {
  light: {
    text: '#000000',
    textSecondary: '#6B6B6B',
    background: '#FFFFFF',
    card: '#FFFFFF',
    tint: '#000000',
    primary: '#000000',
    primaryContrast: '#FFFFFF',
    primaryLight: '#333333',
    icon: '#6B6B6B',
    tabIconDefault: '#6B6B6B',
    tabIconSelected: '#000000',
    border: '#E0E0E0',
    selectedBg: '#F5F5F5',
    cardShadow: '#00000012',
    success: '#000000',
    error: '#000000',
    feedbackCorrect: '#34C759',
    feedbackWrong: '#FF3B30',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    background: '#000000',
    card: '#1A1A1A',
    tint: '#FFFFFF',
    primary: '#FFFFFF',
    primaryContrast: '#000000',
    primaryLight: '#E0E0E0',
    icon: '#A0A0A0',
    tabIconDefault: '#A0A0A0',
    tabIconSelected: '#FFFFFF',
    border: '#2A2A2A',
    selectedBg: '#252525',
    cardShadow: '#00000050',
    success: '#FFFFFF',
    error: '#FFFFFF',
    feedbackCorrect: '#30D158',
    feedbackWrong: '#FF453A',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

/** Kart gölgesi – tek kaynak: theme'deki c.shadow* değerleri kullanılır */
export function getCardShadow(c: ThemeColors) {
  return {
    shadowColor: c.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: c.shadowOpacity,
    shadowRadius: c.shadowRadius,
    elevation: c.elevation,
  };
}

/** Geriye uyumluluk: light tema gölgesi (getCardShadow(Colors.light) kullanın) */
export const CardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};
