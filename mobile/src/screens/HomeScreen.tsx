import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { GlassCard, ProgressGauge, QuickActionCard, SectionHeader } from '../components/common';
import { useHealthStore } from '../stores/healthStore';
import { useUserStore } from '../stores/userStore';
import { MOOD_EMOJIS } from '../config/constants';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '편안한 밤 되세요';
  if (h < 12) return '좋은 아침이에요';
  if (h < 18) return '좋은 오후예요';
  return '편안한 저녁이에요';
}

function isDialysisDay(dialysisDays: number[]): boolean {
  const day = new Date().getDay(); // 0=Sun
  return dialysisDays.includes(day);
}

function getDday(dialysisDays: number[]): string {
  const now = new Date();
  const day = now.getDay();
  for (let i = 0; i <= 6; i++) {
    const check = (day + i) % 7;
    if (dialysisDays.includes(check)) {
      if (i === 0) return '오늘 투석일';
      if (i === 1) return '내일 투석';
      return `투석 D-${i}`;
    }
  }
  return '';
}

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { fetchTodayData, getTodayWater, getTodayNutrients, getLatestRecord } = useHealthStore();
  const { profile, settings } = useUserStore();

  const dialysisDays = profile?.dialysisDays ?? [1, 3, 5];
  const todayWater = getTodayWater();
  const nutrients = getTodayNutrients();
  const latest = getLatestRecord();
  const dialysisToday = isDialysisDay(dialysisDays);

  useEffect(() => {
    fetchTodayData();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 상단 헤더 — 그라데이션 배경 */}
      <LinearGradient
        colors={['#E8F5F5', colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headerName}>{profile?.displayName || '환자'}</Text>
          </View>
          <View style={styles.ddayBadge}>
            <Ionicons
              name={dialysisToday ? 'medical' : 'calendar-outline'}
              size={16}
              color={dialysisToday ? colors.status.danger : colors.primary.main}
            />
            <Text style={[
              styles.ddayText,
              dialysisToday && { color: colors.status.danger },
            ]}>
              {getDday(dialysisDays)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 오늘의 요약 카드 */}
        <GlassCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>오늘의 상태</Text>
          <View style={styles.summaryRow}>
            <SummaryItem
              icon="fitness-outline"
              label="체중"
              value={latest?.weight != null ? `${latest.weight}kg` : '--'}
            />
            <SummaryItem
              icon="heart-outline"
              label="혈압"
              value={
                latest?.systolic != null
                  ? `${latest.systolic}/${latest.diastolic}`
                  : '--'
              }
            />
            <SummaryItem
              icon="happy-outline"
              label="기분"
              value={latest?.mood ? MOOD_EMOJIS[latest.mood - 1] : '--'}
              isEmoji
            />
          </View>
        </GlassCard>

        {/* 수분 & 영양소 게이지 */}
        <SectionHeader title="오늘의 섭취" />
        <View style={styles.gaugeSection}>
          <GlassCard>
            <ProgressGauge icon="💧" label="수분" current={todayWater} max={settings.waterLimitMl} unit="mL" />
          </GlassCard>
          <GlassCard>
            <View style={styles.gaugeStack}>
              <ProgressGauge icon="🍌" label="칼륨" current={nutrients.potassium} max={settings.potassiumLimitMg} unit="mg" />
              <ProgressGauge icon="🦴" label="인" current={nutrients.phosphorus} max={settings.phosphorusLimitMg} unit="mg" />
              <ProgressGauge icon="🧂" label="나트륨" current={nutrients.sodium} max={settings.sodiumLimitMg} unit="mg" />
            </View>
          </GlassCard>
        </View>

        {/* 빠른 기록 — 3개 */}
        <SectionHeader title="빠른 기록" />
        <View style={styles.quickActions}>
          <QuickActionCard
            icon="body-outline"
            title="컨디션"
            subtitle="체중 · 혈압 · 기분"
            gradient={colors.primary.gradient}
            onPress={() => nav.navigate('DailyRecord')}
          />
          <QuickActionCard
            icon="water-outline"
            title="수분"
            subtitle="물 섭취 기록"
            gradient={['#4A9BD9', '#6BB5E8']}
            onPress={() => nav.navigate('WaterIntake')}
          />
          <QuickActionCard
            icon="restaurant-outline"
            title="식단"
            subtitle="음식 기록"
            gradient={colors.secondary.gradient}
            onPress={() => nav.navigate('MealRecord')}
          />
        </View>

        {/* 하단 여백 (탭바 가림 방지) */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  isEmoji,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isEmoji?: boolean;
}) {
  return (
    <View style={styles.summaryItem}>
      <Ionicons name={icon} size={20} color={colors.primary.main} />
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={isEmoji ? styles.summaryEmoji : styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.base,
  },
  greeting: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  headerName: {
    ...typography.title1,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  ddayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  ddayText: {
    ...typography.captionBold,
    color: colors.primary.main,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.base,
    paddingTop: spacing.sm,
  },
  summaryCard: {
    marginTop: spacing.sm,
  },
  summaryTitle: {
    ...typography.captionBold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryLabel: {
    ...typography.label,
    color: colors.text.tertiary,
  },
  summaryValue: {
    ...typography.number.small,
    color: colors.text.primary,
  },
  summaryEmoji: {
    fontSize: 28,
  },
  gaugeSection: {
    gap: spacing.md,
  },
  gaugeStack: {
    gap: spacing.base,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
