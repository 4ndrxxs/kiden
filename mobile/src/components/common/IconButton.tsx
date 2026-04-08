import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { radius, touchTarget } from '../../theme/spacing';

interface IconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  variant?: 'ghost' | 'filled' | 'glass';
  style?: ViewStyle;
}

export function IconButton({
  name,
  onPress,
  size = 24,
  color = colors.text.primary,
  variant = 'ghost',
  style,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'filled' && styles.filled,
        variant === 'glass' && styles.glass,
        { opacity: pressed ? 0.7 : 1 },
        style,
      ]}
      hitSlop={8}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: touchTarget.min,
    height: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  filled: {
    backgroundColor: colors.primary.bg,
  },
  glass: {
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
});
