import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius, touchTarget } from '../theme/spacing';
import { GlassCard, IconButton, SectionHeader } from '../components/common';

type Period = 'week' | 'month';

// 플레이스홀더 차트 데이터
const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
const mockWeightData = [66.2, 66.8, 65.5, 66.0, 66.5, 65.8, 66.1];
const mockBpData = [
  { sys: 135, dia: 85 },
  { sys: 140, dia: 88 },
  { sys: 128, dia: 82 },
  { sys: 132, dia: 84 },
  { sys: 138, dia: 86 },
  { sys: 130, dia: 80 },
  { sys: 134, dia: 83 },
];

function MiniBarChart({ data, max, color }: { data: number[]; max: number; color: string }) {
  const height = 80;
  return (
    <View style={styles.chartRow}>
      {data.map((val, idx) => {
        const barH = (val / max) * height;
        return (
          <View key={idx} style={styles.barCol}>
            <View style={[styles.bar, { height: barH, backgroundColor: color }]} />
            <Text style={styles.barLabel}>{weekDays[idx]}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function ReportScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const [period, setPeriod] = useState<Period>('week');

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <IconButton name="arrow-back" onPress={() => nav.goBack()} />
        <Text style={styles.headerTitle}>리포트</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* 기간 선택 */}
      <View style={styles.periodRow}>
        {(['week', 'month'] as Period[]).map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p === 'week' ? '주간' : '월간'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 체중 트렌드 */}
        <SectionHeader title="체중 변화" />
        <GlassCard>
          <View style={styles.chartHeader}>
            <Text style={styles.chartValue}>65.8</Text>
            <Text style={styles.chartUnit}>kg 평균</Text>
          </View>
          <MiniBarChart data={mockWeightData} max={70} color={colors.primary.main} />
          <View style={styles.baselineBadge}>
            <Ionicons name="flag-outline" size={12} color={colors.text.tertiary} />
            <Text style={styles.baselineText}>건체중 65.5kg</Text>
          </View>
        </GlassCard>

        {/* 혈압 추이 */}
        <SectionHeader title="혈압 추이" />
        <GlassCard>
          <View style={styles.chartHeader}>
            <Text style={styles.chartValue}>134/84</Text>
            <Text style={styles.chartUnit}>mmHg 평균</Text>
          </View>
          <MiniBarChart
            data={mockBpData.map((d) => d.sys)}
            max={180}
            color={colors.secondary.main}
          />
        </GlassCard>

        {/* AI 주간 요약 (플레이스홀더) */}
        <SectionHeader title="AI 주간 요약" />
        <GlassCard>
          <View style={styles.aiSummary}>
            <View style={styles.aiSummaryIcon}>
              <Ionicons name="sparkles" size={20} color={colors.primary.main} />
            </View>
            <Text style={styles.aiSummaryText}>
              AI 서버 연결 후 주간 건강 트렌드 요약이 자동으로 생성됩니다.
            </Text>
          </View>
        </GlassCard>

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
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  periodBtn: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  periodBtnActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  periodText: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  periodTextActive: {
    color: colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chartValue: {
    ...typography.number.medium,
    color: colors.text.primary,
  },
  chartUnit: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingTop: 20,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    ...typography.label,
    color: colors.text.tertiary,
  },
  baselineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    alignSelf: 'center',
  },
  baselineText: {
    ...typography.label,
    color: colors.text.tertiary,
  },
  aiSummary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  aiSummaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiSummaryText: {
    ...typography.body2,
    color: colors.text.secondary,
    flex: 1,
  },
});
