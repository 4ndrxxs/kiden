import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing, touchTarget } from '../../theme/spacing';

interface LargeInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  unit?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  style?: ViewStyle;
}

export function LargeInput({
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  keyboardType = 'default',
  style,
}: LargeInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.disabled}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: touchTarget.comfortable,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.base,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputRowFocused: {
    borderColor: colors.primary.main,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: colors.text.primary,
    padding: 0,
  },
  unit: {
    ...typography.body2,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
});
