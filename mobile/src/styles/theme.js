import { scale, moderateScale } from '../utils/responsive';

export const COLORS = {
  primary: '#22c55e',
  primaryDark: '#16a34a',
  primaryLight: '#dcfce7',
  
  background: '#f9fafb',
  card: '#ffffff',
  
  textMain: '#111827',
  textMuted: '#6b7280',
  textWhite: '#ffffff',
  
  border: '#e5e7eb',
  
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
  full: 9999,
};

export const SHADOW = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
};
