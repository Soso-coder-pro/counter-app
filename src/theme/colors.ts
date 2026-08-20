import { useColorScheme } from 'react-native';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  danger: string;
}

const light: ThemeColors = {
  background: '#F4F5F7',
  card: '#FFFFFF',
  text: '#111827',
  subtext: '#6B7280',
  border: '#E5E7EB',
  primary: '#2563EB',
  danger: '#DC2626',
};

const dark: ThemeColors = {
  background: '#0B0F17',
  card: '#161B26',
  text: '#F3F4F6',
  subtext: '#9CA3AF',
  border: '#26303F',
  primary: '#3B82F6',
  danger: '#EF4444',
};

/** Thème dérivé du réglage système (le choix explicite clair/sombre viendra avec l'écran Paramètres). */
export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
