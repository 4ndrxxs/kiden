import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { SurfaceCard } from '../design/system';
import { formatKoreanDate, getDisplayProfile, getTodayChecklist } from '../design/data';
import { useHealthStore } from '../stores/healthStore';
import { useUserStore } from '../stores/userStore';

const recordItems = [
  { key: 'DailyRecord', title: '일일 컨디션', subtitle: '체중, 혈압, 기분 기록', icon: 'body-outline', color: colors.primary.main, checkKey: 'daily' as const },
  { key: 'DialysisRecord', title: '투석 기록', subtitle: '투석 전후 체중, 제수량', icon: 'medical-outline', color: colors.accent.red, checkKey: 'dialysis' as const },
  { key: 'MealRecord', title: '식단 기록', subtitle: '식사와 영양소 기록', icon: 'restaurant-outline', color: colors.accent.orange, checkKey: 'meal' as const },
  { key: 'WaterIntake', title: '수분 섭취', subtitle: '원터치로 빠르게 추가', icon: 'water-outline', color: colors.accent.aqua, checkKey: 'water' as const },
] as const;

const todayStr = () => new Date().toISOString().split('T')[0];

export function RecordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { dailyRecords, dialysisRecords, mealRecords, waterEntries, fetchTodayData } = useHealthStore();
  const profile = useUserStore((state) => state.profile);

  useEffect(() => {
    fetchTodayData();
  }, [fetchTodayData]);

  const checklist = useMemo(() => {
    const today = todayStr();
    const displayProfile = getDisplayProfile(profile);
    const todayDay = new Date().getDay();
    return getTodayChecklist({
      hasDailyToday: dailyRecords.some((r) => r.recordedAt === today),
      hasDialysisToday: dialysisRecords.some((r) => r.recordedAt === today),
      hasMealToday: mealRecords.some((r) => r.recordedAt === today),
      hasWaterToday: waterEntries.some((e) => e.recordedAt.startsWith(today)),
      isDialysisDay: displayProfile.dialysisDays.includes(todayDay),
    });
  }, [dailyRecords, dialysisRecords, mealRecords, waterEntries, profile]);

  const summaryText = useMemo(() => {
    const remaining: string[] = [];
    if (!checklist.daily) remaining.push('컨디션');
    if (!checklist.meal) remaining.push('식단');
    if (!checklist.water) remaining.push('수분');
    if (checklist.totalCount === 4 && !checklist.dialysis) remaining.push('투석');

    if (remaining.length === 0) return '오늘 기록을 모두 완료했어요. 수고 많으셨습니다.';
    return `오늘 ${remaining.join(', ')} 기록이 남아 있어요.`;
  }, [checklist]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.base, paddingBottom: 120 }]}
      >
        <View>
          <Text style={styles.title}>기록</Text>
          <Text style={styles.subtitle}>{formatKoreanDate()}에 필요한 기록을 빠르게 선택하세요.</Text>
        </View>

        <SurfaceCard style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryTitle}>오늘 기록 체크리스트</Text>
            <Text style={styles.summaryCount}>
              {checklist.completedCount}/{checklist.totalCount}
            </Text>
          </View>
          <Text style={styles.summaryBody}>{summaryText}</Text>
        </SurfaceCard>

        <View style={styles.grid}>
          {recordItems.map((item) => {
            const isDone = checklist[item.checkKey];
            const isDialysis = item.checkKey === 'dialysis';
            const showDialysis = !isDialysis || checklist.totalCount === 4;
            if (!showDialysis) return null;
            return (
              <Pressable
                key={item.key}
                onPress={() => navigation.navigate(item.key)}
                style={({ pressed }) => [styles.gridCard, isDone && styles.gridCardDone, { opacity: pressed ? 0.88 : 1 }]}
              >
                <View style={[styles.gridIcon, { backgroundColor: `${item.color}16` }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.gridTitle}>{item.title}</Text>
                <Text style={styles.gridSubtitle}>{item.subtitle}</Text>
                <View style={styles.gridFooter}>
                  {isDone ? (
                    <View style={styles.doneTag}>
                      <Ionicons name="checkmark" size={12} color={colors.status.safe} />
                      <Text style={styles.doneText}>완료</Text>
                    </View>
                  ) : (
                    <Text style={styles.pendingText}>입력하기 →</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.base,
    gap: spacing.base,
  },
  title: {
    ...typography.title1,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: colors.primary.bg,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    ...typography.body1Bold,
    color: colors.text.primary,
  },
  summaryCount: {
    ...typography.body2Bold,
    color: colors.primary.main,
  },
  summaryBody: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    minHeight: 180,
    shadowColor: colors.shadow.card,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 6,
  },
  gridCardDone: {
    borderColor: colors.status.safe,
    backgroundColor: colors.status.safeBg,
  },
  gridIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  gridTitle: {
    ...typography.body1Bold,
    color: colors.text.primary,
  },
  gridSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 4,
  },
  gridFooter: {
    marginTop: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doneTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(35,178,109,0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  doneText: {
    ...typography.label,
    color: colors.status.safe,
  },
  pendingText: {
    ...typography.captionBold,
    color: colors.primary.main,
  },
});
