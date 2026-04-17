import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { colors } from '../theme/colors';
import { radius, spacing, touchTarget } from '../theme/spacing';
import { typography } from '../theme/typography';

export const shadows = {
  card: {
    shadowColor: colors.shadow.card,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  soft: {
    shadowColor: colors.shadow.strong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 6,
  },
} as const;

export function SurfaceCard({
  children,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  return <View style={[styles.card, shadows.card, padded && styles.cardPadding, style]}>{children}</View>;
}

export function GradientButton({
  label,
  onPress,
  style,
  textStyle,
  icon,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [style, { opacity: pressed ? 0.92 : 1 }]}> 
      <LinearGradient colors={[...colors.primary.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButton}>
        <Text style={[styles.primaryButtonText, textStyle]}>{label}</Text>
        {icon}
      </LinearGradient>
    </Pressable>
  );
}

export function HeaderIconButton({
  name,
  onPress,
  style,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.headerIconButton, style, { opacity: pressed ? 0.8 : 1 }]}> 
      <Ionicons name={name} size={20} color={colors.text.primary} />
    </Pressable>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function SoftBadge({
  label,
  color = colors.primary.main,
  backgroundColor = colors.primary.bg,
}: {
  label: string;
  color?: string;
  backgroundColor?: string;
}) {
  return (
    <View style={[styles.softBadge, { backgroundColor }]}> 
      <Text style={[styles.softBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function MetricTile({
  label,
  value,
  unit,
  footer,
  style,
}: {
  label: string;
  value: string;
  unit?: string;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SurfaceCard style={[styles.metricTile, style]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricRow}>
        <Text style={styles.metricValue}>{value}</Text>
        {unit ? <Text style={styles.metricUnit}>{unit}</Text> : null}
      </View>
      {footer}
    </SurfaceCard>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (next: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.segmentedWrap, style]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [styles.segmentedItem, active && styles.segmentedItemActive, { opacity: pressed ? 0.92 : 1 }]}
          >
            <Text style={[styles.segmentedText, active && styles.segmentedTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CircularProgress({
  size,
  strokeWidth,
  progress,
  color,
  trackColor = colors.border.light,
  gradientColors,
  children,
}: {
  size: number;
  strokeWidth: number;
  progress: number;
  color?: string;
  trackColor?: string;
  gradientColors?: readonly string[];
  children?: React.ReactNode;
}) {
  const clamped = Math.max(0, Math.min(progress, 1));
  const radiusValue = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const dashOffset = circumference * (1 - clamped);
  const gradientId = `progress-${size}-${strokeWidth}-${gradientColors?.join('-')}`.replace(/[^a-zA-Z0-9-]/g, '');

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          {gradientColors ? (
            <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              {gradientColors.map((stopColor, index) => (
                <Stop key={`${gradientId}-${stopColor}-${index}`} offset={`${(index / Math.max(gradientColors.length - 1, 1)) * 100}%`} stopColor={stopColor} />
              ))}
            </SvgLinearGradient>
          ) : null}
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={gradientColors ? `url(#${gradientId})` : color ?? colors.primary.main}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          originX={size / 2}
          originY={size / 2}
          rotation={-90}
        />
      </Svg>
      <View style={styles.circularChildren}>{children}</View>
    </View>
  );
}

export function RingStat({
  label,
  current,
  max,
  unit,
  color,
}: {
  label: string;
  current: number;
  max: number;
  unit: string;
  color: string;
}) {
  const percent = Math.round((current / max) * 100);
  return (
    <View style={styles.ringStat}>
      <CircularProgress size={74} strokeWidth={6} progress={current / max} color={color}>
        <Text style={styles.ringLabel}>{label}</Text>
      </CircularProgress>
      <Text style={styles.ringValue}>{current.toLocaleString()}</Text>
      <Text style={styles.ringSub}>/{max.toLocaleString()} {unit}</Text>
      <Text style={[styles.ringPercent, { color }]}>{percent}%</Text>
    </View>
  );
}

export function WeightDial({
  value,
  deltaText,
  targetLabel,
  onDecrease,
  onIncrease,
}: {
  value: number;
  deltaText: string;
  targetLabel: string;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  const size = 238;
  const center = size / 2;
  const radiusValue = 96;
  const tickAngles = Array.from({ length: 24 }, (_, index) => -140 + index * 12);

  return (
    <View style={styles.weightDialSection}>
      <Pressable onPress={onDecrease} style={({ pressed }) => [styles.dialAdjustButton, { opacity: pressed ? 0.8 : 1 }]}> 
        <Ionicons name="remove" size={22} color={colors.primary.main} />
      </Pressable>

      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
          <Circle cx={center} cy={center} r={radiusValue} stroke={colors.border.light} strokeWidth={3} fill="none" />
          {tickAngles.map((angle, index) => {
            const radians = (angle * Math.PI) / 180;
            const outer = radiusValue + 12;
            const inner = index % 6 === 0 ? radiusValue - 2 : radiusValue + 4;
            const x1 = center + inner * Math.cos(radians);
            const y1 = center + inner * Math.sin(radians);
            const x2 = center + outer * Math.cos(radians);
            const y2 = center + outer * Math.sin(radians);
            return (
              <Line
                key={`tick-${angle}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={index % 6 === 0 ? colors.border.dark : colors.border.light}
                strokeWidth={index % 6 === 0 ? 2 : 1}
              />
            );
          })}
        </Svg>
        <Text style={styles.weightDialValue}>{value.toFixed(1)}</Text>
        <Text style={styles.weightDialUnit}>kg</Text>
        <Text style={styles.weightDialDelta}>{deltaText}</Text>
        <SoftBadge label={targetLabel} color={colors.primary.main} backgroundColor={colors.primary.bg} />
      </View>

      <Pressable onPress={onIncrease} style={({ pressed }) => [styles.dialAdjustButton, { opacity: pressed ? 0.8 : 1 }]}> 
        <Ionicons name="add" size={22} color={colors.primary.main} />
      </Pressable>
    </View>
  );
}

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.emptyState, style]}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name={icon} size={28} color={colors.primary.main} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyDescription}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.emptyAction, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function StatBadge({
  label,
  status = 'safe',
}: {
  label: string;
  status?: 'safe' | 'caution' | 'danger' | 'unknown';
}) {
  const palette = {
    safe: { bg: colors.status.safeBg, fg: colors.status.safe },
    caution: { bg: colors.status.cautionBg, fg: colors.status.caution },
    danger: { bg: colors.status.dangerBg, fg: colors.status.danger },
    unknown: { bg: colors.surfaceMuted, fg: colors.text.tertiary },
  }[status];
  return <SoftBadge label={label} color={palette.fg} backgroundColor={palette.bg} />;
}

export function MiniLineChart({
  labels,
  series,
  min,
  max,
  height = 180,
  targetLine,
}: {
  labels: string[];
  series: { values: number[]; color: string; label?: string }[];
  min: number;
  max: number;
  height?: number;
  targetLine?: { value: number; color: string; label?: string };
}) {
  const width = 320;
  const chartHeight = height;
  const top = 16;
  const bottom = 28;
  const left = 28;
  const right = 10;
  const innerWidth = width - left - right;
  const innerHeight = chartHeight - top - bottom;
  const pointsCount = Math.max(labels.length - 1, 1);
  const range = Math.max(max - min, 1);

  const getPoint = (value: number, index: number) => {
    const x = left + (index / pointsCount) * innerWidth;
    const y = top + ((max - value) / range) * innerHeight;
    return { x, y };
  };

  const buildPath = (values: number[]) => {
    const pts = values.map((value, index) => getPoint(value, index));
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let index = 1; index < pts.length; index += 1) {
      const prev = pts[index - 1];
      const curr = pts[index];
      const midX = (prev.x + curr.x) / 2;
      path += ` Q ${midX} ${prev.y} ${curr.x} ${curr.y}`;
    }
    return path;
  };

  const yTicks = Array.from({ length: 5 }, (_, index) => Number((max - (range / 4) * index).toFixed(1)));

  return (
    <View>
      <Svg width="100%" height={chartHeight} viewBox={`0 0 ${width} ${chartHeight}`}>
        {yTicks.map((tick) => {
          const y = getPoint(tick, 0).y;
          return (
            <React.Fragment key={`grid-${tick}`}>
              <Line x1={left} y1={y} x2={width - right} y2={y} stroke={colors.border.light} strokeWidth={1} />
              <SvgText x={2} y={y + 4} fill={colors.text.tertiary} fontSize="11">
                {tick}
              </SvgText>
            </React.Fragment>
          );
        })}

        {targetLine ? (
          <Line
            x1={left}
            y1={getPoint(targetLine.value, 0).y}
            x2={width - right}
            y2={getPoint(targetLine.value, 0).y}
            stroke={targetLine.color}
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
        ) : null}

        {series.map((item, seriesIndex) => (
          <React.Fragment key={`series-${seriesIndex}`}>
            <Path d={buildPath(item.values)} stroke={item.color} strokeWidth={3} fill="none" />
            {item.values.map((value, index) => {
              const point = getPoint(value, index);
              return <Circle key={`point-${seriesIndex}-${index}`} cx={point.x} cy={point.y} r={3.5} fill={item.color} />;
            })}
          </React.Fragment>
        ))}
      </Svg>
      <View style={styles.chartLabelsRow}>
        {labels.map((label) => (
          <Text key={label} style={styles.chartXLabel}>{label}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardPadding: {
    padding: spacing.lg,
  },
  primaryButton: {
    minHeight: touchTarget.comfortable,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  primaryButtonText: {
    ...typography.body1Bold,
    color: colors.text.inverse,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.base,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  softBadge: {
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  softBadgeText: {
    ...typography.captionBold,
  },
  metricTile: {
    flex: 1,
    minHeight: 118,
  },
  metricLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricValue: {
    ...typography.number.small,
    color: colors.text.primary,
  },
  metricUnit: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  segmentedWrap: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
  },
  segmentedItem: {
    flex: 1,
    minHeight: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  segmentedItemActive: {
    backgroundColor: colors.primary.main,
  },
  segmentedText: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  segmentedTextActive: {
    color: colors.white,
  },
  circularChildren: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringStat: {
    width: '24%',
    alignItems: 'center',
  },
  ringLabel: {
    ...typography.captionBold,
    color: colors.text.primary,
  },
  ringValue: {
    ...typography.body1Bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  ringSub: {
    ...typography.label,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  ringPercent: {
    ...typography.captionBold,
    marginTop: spacing.sm,
  },
  weightDialSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dialAdjustButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow.strong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 6,
  },
  weightDialValue: {
    ...typography.number.large,
    color: colors.text.primary,
  },
  weightDialUnit: {
    ...typography.title3,
    color: colors.text.secondary,
    marginTop: -6,
  },
  weightDialDelta: {
    ...typography.body2Bold,
    color: colors.primary.main,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  chartLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 8,
    marginTop: -12,
  },
  chartXLabel: {
    ...typography.label,
    color: colors.text.tertiary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.body1Bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: spacing.base,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.primary.bg,
  },
  emptyActionText: {
    ...typography.captionBold,
    color: colors.primary.main,
  },
});
