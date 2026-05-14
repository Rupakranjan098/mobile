import { scale, moderateScale } from '../utils/responsive';

export const COLORS = {
  primary: '#22c55e',
  primaryDark: '#16a34a',
  primaryLight: 'rgba(34, 197, 94, 0.1)',
  
  background: '#0f172a',
  backgroundDark: '#020617',
  card: 'rgba(30, 41, 59, 0.7)',
  cardDark: 'rgba(15, 23, 42, 0.8)',
  
  textMain: '#f8fafc',
  textMuted: '#94a3b8',
  textWhite: '#ffffff',
  
  border: 'rgba(255, 255, 255, 0.1)',
  
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

export const SPACING = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
};

export const RADIUS = {
  sm: scale(6),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  xxl: scale(24),
  full: 9999,
};

export const SHADOW = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
};
