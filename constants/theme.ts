/**
 * All colors and shadows from Colors. Use c = Colors[colorScheme] in screens; avoid hardcoded hex.
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
  feedbackCorrect: string;
  feedbackWrong: string;
  accentPurple: string;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export const Colors: Record<ColorScheme, ThemeColors> = {
  light: {
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    background: '#F8FAFC',
    card: '#FFFFFF',
    tint: '#3B82F6',
    primary: '#3B82F6',
    primaryContrast: '#FFFFFF',
    primaryLight: '#60A5FA',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#3B82F6',
    border: '#E5E7EB',
    selectedBg: '#EFF6FF',
    cardShadow: '#00000008',
    success: '#22C55E',
    error: '#EF4444',
    feedbackCorrect: '#22C55E',
    feedbackWrong: '#EF4444',
    accentPurple: '#8B5CF6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    background: '#0C0C0E',
    card: '#16161A',
    tint: '#60A5FA',
    primary: '#60A5FA',
    primaryContrast: '#0C0C0E',
    primaryLight: '#93C5FD',
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#60A5FA',
    border: 'rgba(255,255,255,0.08)',
    selectedBg: 'rgba(96,165,250,0.12)',
    cardShadow: '#00000040',
    success: '#34D399',
    error: '#F87171',
    feedbackCorrect: '#34D399',
    feedbackWrong: '#F87171',
    accentPurple: '#A78BFA',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
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

/** iOS HIG: minimum touch target 44pt */
export const TOUCH_TARGET_MIN = 44;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

/** Card shadow – single source: use c.shadow* from theme */
export function getCardShadow(c: ThemeColors) {
  return {
    shadowColor: c.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: c.shadowOpacity,
    shadowRadius: c.shadowRadius,
    elevation: c.elevation,
  };
}

/** Backward compatibility: light theme shadow (use getCardShadow(Colors.light)) */
export const CardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};
