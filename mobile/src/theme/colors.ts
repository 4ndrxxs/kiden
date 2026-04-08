export const colors = {
  // ── 기본 ──
  white: '#FFFFFF',
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceElevated: 'rgba(255, 255, 255, 0.85)',

  // ── 텍스트 ──
  text: {
    primary: '#191F28',
    secondary: '#4E5968',
    tertiary: '#8B95A1',
    disabled: '#B0B8C1',
    inverse: '#FFFFFF',
  },

  // ── 브랜드 (틸 블루 기반) ──
  primary: {
    main: '#2B8A8E',
    light: '#4DB0B4',
    dark: '#1A6B6F',
    gradient: ['#2B8A8E', '#4DB0B4'] as const,
    bg: 'rgba(43, 138, 142, 0.08)',
  },

  // ── 보조 (산호색) ──
  secondary: {
    main: '#E8836B',
    light: '#F2A594',
    gradient: ['#E8836B', '#F2A594'] as const,
    bg: 'rgba(232, 131, 107, 0.08)',
  },

  // ── 상태 ──
  status: {
    safe: '#2DC76D',
    safeGradient: ['#2DC76D', '#5FE096'] as const,
    safeBg: 'rgba(45, 199, 109, 0.08)',

    caution: '#F5B942',
    cautionGradient: ['#F5B942', '#FFCE6B'] as const,
    cautionBg: 'rgba(245, 185, 66, 0.08)',

    danger: '#E85D5D',
    dangerGradient: ['#E85D5D', '#F28B8B'] as const,
    dangerBg: 'rgba(232, 93, 93, 0.08)',
  },

  // ── 글래스모피즘 ──
  glass: {
    background: 'rgba(255, 255, 255, 0.72)',
    border: 'rgba(255, 255, 255, 0.4)',
    shadow: 'rgba(0, 0, 0, 0.04)',
  },

  // ── 보더 & 디바이더 ──
  border: {
    light: '#F2F4F6',
    default: '#E5E8EB',
    dark: '#D1D6DB',
  },

  // ── 오버레이 ──
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

export type Colors = typeof colors;
