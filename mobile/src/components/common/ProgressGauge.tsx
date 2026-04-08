import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing } from '../../theme/spacing';

interface ProgressGaugeProps {
  label: string;
  current: number;
  max: number;
  unit: string;
  icon?: string;
}

function getStatusColors(ratio: number) {
  if (ratio < 0.7) return { gradient: colors.status.safeGradient, bg: colors.status.safeBg };
  if (ratio < 0.9) return { gradient: colors.status.cautionGradient, bg: colors.status.cautionBg };
  return { gradient: colors.status.dangerGradient, bg: colors.status.dangerBg };
}

export function ProgressGauge({ label, current, max, unit, icon }: ProgressGaugeProps) {
  const ratio = Math.min(current / max, 1);
  const { gradient, bg } = getStatusColors(ratio);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.value}>
          <Text style={styles.current}>{current.toLocaleString()}</Text>
          <Text style={styles.separator}> / </Text>
          <Text style={styles.max}>{max.toLocaleString()}{unit}</Text>
        </Text>
      </View>
      <View style={[styles.trackBg, { backgroundColor: bg }]}>
        <LinearGradient
          colors={[...gradient] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.track, { width: `${ratio * 100}%` as any }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  value: {
    ...typography.caption,
  },
  current: {
    ...typography.captionBold,
    color: colors.text.primary,
  },
  separator: {
    color: colors.text.disabled,
  },
  max: {
    color: colors.text.tertiary,
  },
  trackBg: {
    height: 8,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  track: {
    height: '100%',
    borderRadius: radius.full,
  },
});
