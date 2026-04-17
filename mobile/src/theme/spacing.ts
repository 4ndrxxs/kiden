export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
  full: 9999,
} as const;

export const touchTarget = {
  min: 48,
  comfortable: 56,
  xl: 64,
} as const;

export type Spacing = typeof spacing;
