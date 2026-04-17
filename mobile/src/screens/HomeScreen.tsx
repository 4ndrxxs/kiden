import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  EmptyState,
  GradientButton,
  MetricTile,
  RingStat,
  SectionTitle,
  StatBadge,
  SurfaceCard,
} from '../design/system';
import {
  getDailySummary,
  getDisplayProfile,
  getHomeNutrients,
  getNextDialysis,
} from '../design/data';
import { MOOD_EMOJIS } from '../config/constants';
import { useHealthStore } from '../stores/healthStore';
import { useUserStore } from '../stores/userStore';

function greetingByTime() {
  const hour = new Date().getHours();
  if (hour < 6) return '편안한 새벽이에요!';
  if (hour < 12) return '좋은 아침이에요!';
  if (hour < 18) return '좋은 오후예요!';
  return '편안한 저녁이에요!';
}

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { fetchTodayData, getTodayWater, getTodayNutrients, getLatestRecord } = useHealthStore();
  const profile = useUserStore((state) => state.profile);
  const settings = useUserStore((state) => state.settings);

  useEffect(() => {
    fetchTodayData();
  }, [fetchTodayData]);

  const displayProfile = getDisplayProfile(profile);
  const latestRecord = getLatestRecord();
  const summary = getDailySummary(latestRecord, settings, displayProfile.idealBodyWeight);
  const nutrients = getHomeNutrients(getTodayWater(), getTodayNutrients(), settings);
  const dialysisInfo = getNextDialysis(displayProfile.dialysisDays, displayProfile.dialysisTime || '시간 미설정');

  const weightDeltaPositive = (summary.weightDelta ?? 0) > 0;
  const weightDeltaLabel =
    summary.weightDelta != null
      ? `${weightDeltaPositive ? '+' : ''}${summary.weightDelta.toFixed(1)} kg`
      : '건체중 미설정';
  const moodEmoji = summary.mood ? MOOD_EMOJIS[summary.mood - 1] ?? '🙂' : '➖';
  const hasAnyNutrient = nutrients.some((n) => n.current > 0);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.base, paddingBottom: 130 }]}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting} numberOfLines={1}>
              안녕하세요, {displayProfile.displayName}님 👋
            </Text>
            <Text style={styles.greetingSub}>{greetingByTime()} 오늘도 힘내세요.</Text>
          </View>
          <Pressable style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={20} color={colors.text.primary} />
          </Pressable>
        </View>

        <SurfaceCard style={styles.heroCard}>
          <Text style={styles.heroCardLabel}>다음 투석까지</Text>
          <View style={styles.heroCardMainRow}>
            <Text style={styles.heroCardCountdown}>{dialysisInfo.countdown}</Text>
            <Pressable
              onPress={() => navigation.navigate('DialysisRecord')}
              style={styles.heroCardButton}
            >
              <Text style={styles.heroCardButtonText}>
                {dialysisInfo.hasSchedule ? '기록하기' : '일정 설정'}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.heroCardMeta}>
            {dialysisInfo.hasSchedule
              ? `${dialysisInfo.dateLabel} (${dialysisInfo.dayLabel}) · ${dialysisInfo.timeLabel}`
              : '설정에서 투석 요일을 등록해 주세요.'}
          </Text>
        </SurfaceCard>

        <View style={styles.metricsRow}>
          <MetricTile
            label="체중"
            value={summary.weight != null ? summary.weight.toFixed(1) : '—'}
            unit={summary.weight != null ? 'kg' : undefined}
            footer={
              summary.weightDelta != null ? (
                <Text
                  style={[
                    styles.metricFooter,
                    { color: weightDeltaPositive ? colors.status.danger : colors.status.safe },
                  ]}
                >
                  {weightDeltaPositive ? '▲ ' : '▼ '}
                  {weightDeltaLabel}
                </Text>
              ) : (
                <Text style={[styles.metricFooter, { color: colors.text.tertiary }]}>
                  {summary.weight == null ? '미입력' : '건체중 미설정'}
                </Text>
              )
            }
          />
          <MetricTile
            label="혈압"
            value={
              summary.systolic && summary.diastolic
                ? `${summary.systolic}/${summary.diastolic}`
                : '—'
            }
            footer={
              <View style={{ alignSelf: 'flex-start' }}>
                <StatBadge label={summary.bpStatusLabel} status={summary.bpStatus} />
              </View>
            }
          />
          <SurfaceCard style={styles.moodTile}>
            <Text style={styles.metricLabel}>기분</Text>
            <Text style={styles.moodEmoji}>{moodEmoji}</Text>
            <Text
              style={[
                styles.metricFooter,
                { color: summary.mood ? colors.status.safe : colors.text.tertiary },
              ]}
            >
              {summary.moodText}
            </Text>
          </SurfaceCard>
        </View>

        <SectionTitle title="영양소 섭취 현황" subtitle="오늘 기준 (상한 대비)" />
        <SurfaceCard>
          {hasAnyNutrient ? (
            <View style={styles.ringRow}>
              {nutrients.map((nutrient) => (
                <RingStat
                  key={nutrient.label}
                  label={nutrient.label}
                  current={nutrient.current}
                  max={nutrient.max}
                  unit={nutrient.unit}
                  color={nutrient.color}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="restaurant-outline"
              title="아직 기록이 없어요"
              description="식단과 수분 기록을 추가하면 오늘의 영양소 현황이 표시됩니다."
              actionLabel="식단 기록하기"
              onAction={() => navigation.navigate('MealRecord')}
            />
          )}
        </SurfaceCard>

        <SectionTitle title="빠른 기록" />
        <View style={styles.quickRow}>
          <Pressable
            onPress={() => navigation.navigate('DailyRecord')}
            style={({ pressed }) => [styles.quickCard, { opacity: pressed ? 0.88 : 1 }]}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: '#FFF0F4' }]}>
              <Ionicons name="heart" size={20} color={colors.accent.red} />
            </View>
            <Text style={styles.quickTitle}>컨디션</Text>
            <Text style={styles.quickSubtitle}>기록하기</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('WaterIntake')}
            style={({ pressed }) => [styles.quickCard, { opacity: pressed ? 0.88 : 1 }]}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: '#EEF5FF' }]}>
              <Ionicons name="water" size={20} color={colors.accent.aqua} />
            </View>
            <Text style={styles.quickTitle}>수분</Text>
            <Text style={styles.quickSubtitle}>기록하기</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('MealRecord')}
            style={({ pressed }) => [styles.quickCard, { opacity: pressed ? 0.88 : 1 }]}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: '#F3FFF6' }]}>
              <Ionicons name="restaurant" size={20} color={colors.status.safe} />
            </View>
            <Text style={styles.quickTitle}>식단</Text>
            <Text style={styles.quickSubtitle}>기록하기</Text>
          </Pressable>
        </View>

        <SurfaceCard style={styles.helperCard}>
          <View style={styles.helperRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.helperTitle}>오늘의 리포트</Text>
              <Text style={styles.helperBody}>
                지난 7일 동안의 체중·혈압 추이를 확인하고 건강 상태를 점검해 보세요.
              </Text>
            </View>
          </View>
          <GradientButton
            label="리포트 보기"
            onPress={() => navigation.navigate('Report')}
            style={{ marginTop: spacing.base }}
            textStyle={styles.helperButtonText}
          />
        </SurfaceCard>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.base,
  },
  greeting: {
    ...typography.title2,
    color: colors.text.primary,
  },
  greetingSub: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: 4,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: colors.surface,
  },
  heroCardLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  heroCardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCardCountdown: {
    ...typography.number.large,
    color: colors.text.primary,
  },
  heroCardButton: {
    backgroundColor: colors.primary.bg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  heroCardButtonText: {
    ...typography.captionBold,
    color: colors.primary.main,
  },
  heroCardMeta: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  moodTile: {
    flex: 1,
    minHeight: 118,
  },
  metricLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  metricFooter: {
    ...typography.captionBold,
  },
  moodEmoji: {
    fontSize: 30,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  ringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.base,
    alignItems: 'center',
    shadowColor: colors.shadow.card,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 6,
  },
  quickIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickTitle: {
    ...typography.body2Bold,
    color: colors.text.primary,
  },
  quickSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  helperCard: {
    marginTop: spacing.xs,
  },
  helperRow: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  helperTitle: {
    ...typography.body1Bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  helperBody: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  helperButtonText: {
    ...typography.body2Bold,
  },
});
