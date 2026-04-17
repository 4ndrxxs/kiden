import { TextStyle } from 'react-native';

export const typography = {
  hero: {
    fontSize: 54,
    fontWeight: '800' as const,
    lineHeight: 58,
    letterSpacing: -1.6,
  },
  title1: {
    fontSize: 30,
    fontWeight: '800' as const,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  title2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
    letterSpacing: -0.6,
  },
  title3: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  body1: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: -0.15,
  },
  body1Bold: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  body2: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  body2Bold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0,
  },
  captionBold: {
    fontSize: 13,
    fontWeight: '700' as const,
    lineHeight: 18,
    letterSpacing: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  number: {
    large: {
      fontSize: 42,
      fontWeight: '800' as const,
      lineHeight: 46,
      letterSpacing: -1.2,
    } as TextStyle,
    medium: {
      fontSize: 30,
      fontWeight: '800' as const,
      lineHeight: 34,
      letterSpacing: -0.8,
    } as TextStyle,
    small: {
      fontSize: 22,
      fontWeight: '700' as const,
      lineHeight: 28,
      letterSpacing: -0.5,
    } as TextStyle,
  },
} satisfies Record<string, TextStyle | Record<string, TextStyle>>;

export type Typography = typeof typography;
