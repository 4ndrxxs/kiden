import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius, touchTarget } from '../theme/spacing';
import { GlassCard, IconButton, ProgressGauge } from '../components/common';
import { useHealthStore } from '../stores/healthStore';

const quickAmounts = [
  { label: '한 모금', amount: 50, icon: '💧' },
  { label: '반 컵', amount: 100, icon: '🥛' },
  { label: '한 컵', amount: 200, icon: '🥤' },
  { label: '한 병', amount: 500, icon: '🍶' },
];

export function WaterIntakeScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { addWaterEntry, getTodayWater, waterEntries } = useHealthStore();

  const todayWater = getTodayWater();
  const maxWater = 700; // 기본 상한
  const percentage = Math.min((todayWater / maxWater) * 100, 100);

  const todayEntries = waterEntries
    .filter((e) => e.date === new Date().toISOString().split('T')[0])
    .slice(0, 10);

  const handleAdd = (amount: number) => {
    addWaterEntry({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      amountMl: amount,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <IconButton name="arrow-back" onPress={() => nav.goBack()} />
        <Text style={styles.headerTitle}>수분 섭취</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 물잔 게이지 */}
        <GlassCard>
          <View style={styles.gaugeCenter}>
            <View style={styles.circleOuter}>
              <View style={[styles.circleFill, { height: `${percentage}%` as any }]} />
              <View style={styles.circleContent}>
                <Text style={styles.waterIcon}>💧</Text>
                <Text style={styles.waterAmount}>{todayWater}</Text>
                <Text style={styles.waterUnit}>/ {maxWater}mL</Text>
              </View>
            </View>
            {todayWater >= maxWater && (
              <View style={styles.warningBadge}>
                <Ionicons name="warning-outline" size={14} color={colors.status.danger} />
                <Text style={styles.warningText}>일일 상한에 도달했어요</Text>
              </View>
            )}
          </View>
        </GlassCard>

        {/* 빠른 추가 버튼 */}
        <View style={styles.quickGrid}>
          {quickAmounts.map((item) => (
            <Pressable
              key={item.amount}
              onPress={() => handleAdd(item.amount)}
              style={({ pressed }) => [
                styles.quickBtn,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.quickEmoji}>{item.icon}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
              <Text style={styles.quickAmount}>+{item.amount}mL</Text>
            </Pressable>
          ))}
        </View>

        {/* 오늘 기록 */}
        {todayEntries.length > 0 && (
          <>
            <Text style={styles.historyTitle}>오늘 기록</Text>
            <GlassCard noPadding>
              {todayEntries.map((entry, idx) => (
                <View key={entry.id}>
                  <View style={styles.historyItem}>
                    <Text style={styles.historyTime}>
                      {new Date(entry.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={styles.historyAmount}>+{entry.amountMl}mL</Text>
                  </View>
                  {idx < todayEntries.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </GlassCard>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    ...typography.title3,
    color: colors.text.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.base,
    paddingTop: spacing.base,
  },
  gaugeCenter: {
    alignItems: 'center',
    gap: spacing.base,
  },
  circleOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.background,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  circleFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(43, 138, 142, 0.15)',
  },
  circleContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  waterAmount: {
    ...typography.number.medium,
    color: colors.primary.main,
  },
  waterUnit: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.status.dangerBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  warningText: {
    ...typography.captionBold,
    color: colors.status.danger,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.base,
    borderRadius: radius.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: touchTarget.comfortable,
  },
  quickEmoji: {
    fontSize: 24,
  },
  quickLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  quickAmount: {
    ...typography.label,
    color: colors.primary.main,
  },
  historyTitle: {
    ...typography.captionBold,
    color: colors.text.secondary,
    paddingHorizontal: spacing.xs,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  historyTime: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  historyAmount: {
    ...typography.body2Bold,
    color: colors.primary.main,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.lg,
  },
});
