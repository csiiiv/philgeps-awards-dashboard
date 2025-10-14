// Theme-aware color system
export const getThemeColors = (isDark: boolean) => ({
  // Primary Colors (same for both themes)
  primary: {
    50: isDark ? '#1e3a8a' : '#eff6ff',
    100: isDark ? '#1e40af' : '#dbeafe',
    200: isDark ? '#1d4ed8' : '#bfdbfe',
    300: isDark ? '#2563eb' : '#93c5fd',
    400: isDark ? '#3b82f6' : '#60a5fa',
    500: '#3b82f6', // Main primary
    600: isDark ? '#60a5fa' : '#2563eb',
    700: isDark ? '#93c5fd' : '#1d4ed8',
    800: isDark ? '#bfdbfe' : '#1e40af',
    900: isDark ? '#dbeafe' : '#1e3a8a',
  },
  
  // Secondary Colors
  secondary: {
    50: isDark ? '#14532d' : '#f0fdf4',
    100: isDark ? '#166534' : '#dcfce7',
    200: isDark ? '#15803d' : '#bbf7d0',
    300: isDark ? '#16a34a' : '#86efac',
    400: isDark ? '#22c55e' : '#4ade80',
    500: '#22c55e',
    600: isDark ? '#4ade80' : '#16a34a',
    700: isDark ? '#86efac' : '#15803d',
    800: isDark ? '#bbf7d0' : '#166534',
    900: isDark ? '#dcfce7' : '#14532d',
  },
  
  // Gray Scale
  gray: {
    50: isDark ? '#111827' : '#f9fafb',
    100: isDark ? '#1f2937' : '#f3f4f6',
    200: isDark ? '#374151' : '#e5e7eb',
    300: isDark ? '#4b5563' : '#d1d5db',
    400: isDark ? '#6b7280' : '#9ca3af',
    500: '#6b7280',
    600: isDark ? '#9ca3af' : '#4b5563',
    700: isDark ? '#d1d5db' : '#374151',
    800: isDark ? '#e5e7eb' : '#1f2937',
    900: isDark ? '#f3f4f6' : '#111827',
  },
  
  // Semantic Colors
  success: {
    50: isDark ? '#14532d' : '#f0fdf4',
    500: '#22c55e',
    600: isDark ? '#4ade80' : '#16a34a',
  },
  
  warning: {
    50: isDark ? '#92400e' : '#fffbeb',
    500: '#f59e0b',
    600: isDark ? '#fbbf24' : '#d97706',
  },
  
  error: {
    50: isDark ? '#991b1b' : '#fef2f2',
    500: '#ef4444',
    600: isDark ? '#f87171' : '#dc2626',
  },
  
  // Background Colors
  background: {
    primary: isDark ? '#111827' : '#ffffff',
    secondary: isDark ? '#1f2937' : '#f9fafb',
    tertiary: isDark ? '#374151' : '#f3f4f6',
  },
  
  // Text Colors
  text: {
    primary: isDark ? '#f9fafb' : '#111827',
    secondary: isDark ? '#d1d5db' : '#6b7280',
    tertiary: isDark ? '#9ca3af' : '#9ca3af',
    inverse: isDark ? '#111827' : '#ffffff',
  },
  
  // Border Colors
  border: {
    light: isDark ? '#374151' : '#e5e7eb',
    medium: isDark ? '#4b5563' : '#d1d5db',
    dark: isDark ? '#6b7280' : '#9ca3af',
  }
})

// CSS custom properties for theme switching
export const getThemeCSSVariables = (isDark: boolean) => {
  const colors = getThemeColors(isDark)
  
  return {
    '--color-primary-50': colors.primary[50],
    '--color-primary-100': colors.primary[100],
    '--color-primary-200': colors.primary[200],
    '--color-primary-300': colors.primary[300],
    '--color-primary-400': colors.primary[400],
    '--color-primary-500': colors.primary[500],
    '--color-primary-600': colors.primary[600],
    '--color-primary-700': colors.primary[700],
    '--color-primary-800': colors.primary[800],
    '--color-primary-900': colors.primary[900],
    
    '--color-background-primary': colors.background.primary,
    '--color-background-secondary': colors.background.secondary,
    '--color-background-tertiary': colors.background.tertiary,
    
    '--color-text-primary': colors.text.primary,
    '--color-text-secondary': colors.text.secondary,
    '--color-text-tertiary': colors.text.tertiary,
    '--color-text-inverse': colors.text.inverse,
    
    '--color-border-light': colors.border.light,
    '--color-border-medium': colors.border.medium,
    '--color-border-dark': colors.border.dark,
  }
}

