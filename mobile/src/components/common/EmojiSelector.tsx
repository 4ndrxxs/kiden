import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing, touchTarget } from '../../theme/spacing';

interface EmojiOption {
  emoji: string;
  label: string;
  value: number;
}

interface EmojiSelectorProps {
  label: string;
  options: EmojiOption[];
  selected: number | null;
  onSelect: (value: number) => void;
}

const defaultMoodOptions: EmojiOption[] = [
  { emoji: '😫', label: '매우 나쁨', value: 1 },
  { emoji: '😞', label: '나쁨', value: 2 },
  { emoji: '😐', label: '보통', value: 3 },
  { emoji: '🙂', label: '좋음', value: 4 },
  { emoji: '😊', label: '매우 좋음', value: 5 },
];

export { defaultMoodOptions };

export function EmojiSelector({ label, options, selected, onSelect }: EmojiSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  label: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    gap: spacing.xs,
    minHeight: touchTarget.comfortable,
  },
  optionSelected: {
    backgroundColor: colors.primary.bg,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
  },
  emoji: {
    fontSize: 28,
  },
  optionLabel: {
    ...typography.label,
    color: colors.text.tertiary,
  },
  optionLabelSelected: {
    color: colors.primary.main,
  },
});
