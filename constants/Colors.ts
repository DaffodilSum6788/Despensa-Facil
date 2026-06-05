const tintColorLight = '#1167d1';
const tintColorDark = '#4a8fe0';

export const Colors = {
  primary: '#1167d1',
  primaryLight: '#4a8fe0',
  primaryDark: '#0a4fa3',
  white: '#ffffff',
  black: '#000000',
  gray: '#6b7280',
  grayLight: '#f3f4f6',
  grayDark: '#374151',
  red: '#dc2626',
  yellow: '#f59e0b',
  green: '#16a34a',
  background: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  error: '#dc2626',
  success: '#16a34a',
};

export default {
  light: {
    text: '#1f2937',
    background: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f9fafb',
    background: '#111827',
    tint: tintColorDark,
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorDark,
  },
};
