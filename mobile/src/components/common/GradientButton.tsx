import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing, touchTarget } from '../../theme/spacing';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  gradient?: readonly [string, string, ...string[]];
  size?: 'large' | 'medium' | 'small';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function GradientButton({
  title,
  onPress,
  gradient = colors.primary.gradient,
  size = 'large',
  disabled = false,
  style,
  textStyle,
  icon,
}: GradientButtonProps) {
  const heightMap = {
    large: touchTarget.comfortable,
    medium: touchTarget.min,
    small: 40,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        { opacity: pressed ? 0.85 : disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <LinearGradient
        colors={[...gradient] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { height: heightMap[size] }]}
      >
        {icon}
        <Text style={[styles.text, size === 'small' && styles.textSmall, textStyle]}>
          {title}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    borderRadius: radius.lg,
  },
  text: {
    ...typography.body1Bold,
    color: colors.text.inverse,
  },
  textSmall: {
    ...typography.captionBold,
  },
});
