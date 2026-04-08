import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing } from '../../theme/spacing';

type StatusLevel = 'safe' | 'caution' | 'danger';

interface StatusBadgeProps {
  level: StatusLevel;
  label: string;
}

const statusConfig = {
  safe: { bg: colors.status.safeBg, color: colors.status.safe, icon: '✓' },
  caution: { bg: colors.status.cautionBg, color: colors.status.caution, icon: '!' },
  danger: { bg: colors.status.dangerBg, color: colors.status.danger, icon: '✕' },
};

export function StatusBadge({ level, label }: StatusBadgeProps) {
  const config = statusConfig[level];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.icon, { color: config.color }]}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  icon: {
    ...typography.captionBold,
  },
  label: {
    ...typography.captionBold,
  },
});
