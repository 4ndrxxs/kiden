export const colors = {
  white: '#FFFFFF',
  background: '#F6F7FF',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F4FF',
  pageEdge: '#ECEEFF',
  overlay: 'rgba(30, 42, 94, 0.16)',

  text: {
    primary: '#1E2452',
    secondary: '#5F6790',
    tertiary: '#8E96BC',
    disabled: '#BCC2DE',
    inverse: '#FFFFFF',
  },

  primary: {
    main: '#5D6BFF',
    dark: '#4655E7',
    light: '#8794FF',
    gradient: ['#5D7CFF', '#D37DFF'] as const,
    softGradient: ['#EEF1FF', '#F9EEFF'] as const,
    bg: '#EEF1FF',
  },

  secondary: {
    main: '#C77DFF',
    light: '#E6C7FF',
    gradient: ['#9A8CFF', '#F7A2FF'] as const,
    bg: '#F7EEFF',
  },

  accent: {
    blue: '#6A7DFF',
    green: '#61C48C',
    red: '#FF718C',
    orange: '#FFB367',
    aqua: '#67B9FF',
  },

  status: {
    safe: '#23B26D',
    safeGradient: ['#23B26D', '#61C48C'] as const,
    safeBg: '#E9FAF1',
    caution: '#FFB020',
    cautionGradient: ['#FFB020', '#FFD36B'] as const,
    cautionBg: '#FFF4DE',
    danger: '#FF5D79',
    dangerGradient: ['#FF5D79', '#FF8BA2'] as const,
    dangerBg: '#FFE8EE',
  },

  border: {
    light: '#EDF0FB',
    default: '#E2E6F6',
    dark: '#CAD0E8',
  },

  shadow: {
    card: 'rgba(83, 95, 172, 0.12)',
    strong: 'rgba(69, 84, 167, 0.18)',
  },

  glass: {
    background: 'rgba(255, 255, 255, 0.72)',
    border: 'rgba(255, 255, 255, 0.54)',
  },
} as const;

export type Colors = typeof colors;
