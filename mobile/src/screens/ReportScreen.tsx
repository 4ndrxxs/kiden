import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  EmptyState,
  HeaderIconButton,
  MiniLineChart,
  SegmentedControl,
  SurfaceCard,
} from '../design/system';
import { formatCompactDate, getDisplayProfile, getReportSeries } from '../design/data';
import { useHealthStore } from '../stores/healthStore';
import { useUserStore } from '../stores/userStore';

type Period = 'week' | 'month';

export function ReportScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [period, setPeriod] = useState<Period>('week');
  const { dailyRecords, fetchRecords } = useHealthStore();
  const profile = useUserStore((state) => state.profile);

  useEffect(() => {
    fetchRecords(period === 'week' ? 7 : 30);
  }, [fetchRecords, period]);

  const displayProfile = getDisplayProfile(profile);
  const days = period === 'week' ? 7 : 30;
  const reportSeries = useMemo(() => getReportSeries(dailyRecords, days), [dailyRecords, days]);
  const periodRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    return `${formatCompactDate(start)} - ${formatCompactDate(end)}`;
  }, [days]);

  const periodLabel = period === 'week' ? '최근 7일' : '최근 30일';

  const avgWeight = useMemo(() => {
    const valid = reportSeries.weights.filter((w) => w > 0);
    if (valid.length === 0) return null;
    return valid.reduce((sum, value) => sum + value, 0) / valid.length;
  }, [reportSeries]);

  const latestWeight = useMemo(() => {
    const valid = [...reportSeries.weights].reverse().find((w) => w > 0);
    return valid ?? null;
  }, [reportSeries]);

  const avgSystolic = useMemo(() => {
    const valid = reportSeries.systolic.filter((v) => v > 0);
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
  }, [reportSeries]);

  const avgDiastolic = useMemo(() => {
    const valid = reportSeries.diastolic.filter((v) => v > 0);
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
  }, [reportSeries]);

  const weightRange = useMemo(() => {
    const valid = reportSeries.weights.filter((w) => w > 0);
    if (valid.length === 0) return { min: 0, max: 1 };
    const ideal = displayProfile.idealBodyWeight;
    const allValues = ideal != null ? [...valid, ideal] : valid;
    return {
      min: Math.floor(Math.min(...allValues) - 1),
      max: Math.ceil(Math.max(...allValues) + 1),
    };
  }, [reportSeries, displayProfile.idealBodyWeight]);

  const bpRange = useMemo(() => {
    const allSys = reportSeries.systolic.filter((v) => v > 0);
    const allDia = reportSeries.diastolic.filter((v) => v > 0);
    if (allSys.length === 0 && allDia.length === 0) return { min: 60, max: 160 };
    const all = [...allSys, ...allDia];
    return {
      min: Math.max(0, Math.floor(Math.min(...all) - 10)),
      max: Math.ceil(Math.max(...all) + 10),
    };
  }, [reportSeries]);

  const summaryText = useMemo(() => {
    if (!reportSeries.hasData) return null;
    const parts: string[] = [];
    if (avgWeight != null && displayProfile.idealBodyWeight != null) {
      const delta = avgWeight - displayProfile.idealBodyWeight;
      parts.push(
        `평균 체중이 건체중보다 ${delta >= 0 ? '약' : '약'} ${Math.abs(delta).toFixed(1)} kg ${delta >= 0 ? '높' : '낮'}습니다.`,
      );
    } else if (avgWeight != null) {
      parts.push(`평균 체중 ${avgWeight.toFixed(1)} kg 유지 중입니다.`);
    }
    if (avgSystolic != null && avgDiastolic != null) {
      if (avgSystolic >= 140 || avgDiastolic >= 90) {
        parts.push('혈압이 권장 범위보다 높습니다. 담당 의료진과 상의해 주세요.');
      } else if (avgSystolic < 90 || avgDiastolic < 60) {
        parts.push('혈압이 낮은 편이에요. 어지러움이 있다면 기록해 주세요.');
      } else {
        parts.push('혈압은 권장 범위 안에서 유지되고 있습니다.');
      }
    }
    return parts.join(' ');
  }, [reportSeries, avgWeight, avgSystolic, avgDiastolic, displayProfile.idealBodyWeight]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.sm, paddingBottom: 120 },
        ]}
      >
        <View style={styles.headerRow}>
          <HeaderIconButton name="chevron-back" onPress={() => navigation.goBack()} />
          <View style={{ flex: 1 }}>
            <SegmentedControl
              options={[
                { label: '주간', value: 'week' },
                { label: '월간', value: 'month' },
              ]}
              value={period}
              onChange={setPeriod}
            />
          </View>
          <View style={{ width: 36 }} />
        </View>

        <Text style={styles.periodLabel}>{periodLabel}</Text>

        {reportSeries.hasData ? (
          <>
            <SurfaceCard>
              <Text style={styles.cardTitle}>체중 변화</Text>
              <Text style={styles.cardPeriod}>{periodRange}</Text>
              <View style={styles.metricHeader}>
                <Text style={styles.metricValue}>
                  {avgWeight != null ? `${avgWeight.toFixed(1)} kg` : '기록 없음'}
                </Text>
                {latestWeight != null && displayProfile.idealBodyWeight != null ? (
                  <Text
                    style={[
                      styles.metricMeta,
                      {
                        color:
                          latestWeight > displayProfile.idealBodyWeight
                            ? colors.status.danger
                            : colors.status.safe,
                      },
                    ]}
                  >
                    건체중 대비 {latestWeight > displayProfile.idealBodyWeight ? '+' : ''}
                    {(latestWeight - displayProfile.idealBodyWeight).toFixed(1)} kg
                  </Text>
                ) : null}
              </View>
              <MiniLineChart
                labels={reportSeries.labels}
                series={[{ values: reportSeries.weights, color: colors.primary.main }]}
                min={weightRange.min}
                max={weightRange.max}
                targetLine={
                  displayProfile.idealBodyWeight != null
                    ? { value: displayProfile.idealBodyWeight, color: colors.status.danger }
                    : undefined
                }
              />
            </SurfaceCard>

            <SurfaceCard>
              <View style={styles.bpHeader}>
                <View>
                  <Text style={styles.cardTitle}>혈압 추이</Text>
                  <Text style={styles.cardPeriod}>{periodRange}</Text>
                </View>
                <Text style={styles.metricValue}>
                  {avgSystolic && avgDiastolic ? `${avgSystolic}/${avgDiastolic}` : '—'}
                </Text>
              </View>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accent.red }]} />
                  <Text style={styles.legendText}>수축기</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accent.blue }]} />
                  <Text style={styles.legendText}>이완기</Text>
                </View>
              </View>
              <MiniLineChart
                labels={reportSeries.labels}
                series={[
                  { values: reportSeries.systolic, color: colors.accent.red },
                  { values: reportSeries.diastolic, color: colors.accent.blue },
                ]}
                min={bpRange.min}
                max={bpRange.max}
              />
            </SurfaceCard>

            {summaryText ? (
              <SurfaceCard>
                <Text style={styles.cardTitle}>요약</Text>
                <View style={styles.summaryBox}>
                  <View style={styles.summaryIconWrap}>
                    <Text style={styles.summaryIcon}>📊</Text>
                  </View>
                  <Text style={styles.summaryText}>{summaryText}</Text>
                </View>
              </SurfaceCard>
            ) : null}
          </>
        ) : (
          <SurfaceCard>
            <EmptyState
              icon="bar-chart-outline"
              title="아직 기록이 부족해요"
              description={`${periodLabel} 동안의 체중·혈압 데이터가 있어야 리포트가 생성됩니다.\n일일 컨디션 기록을 시작해 보세요.`}
              actionLabel="컨디션 기록하기"
              onAction={() => navigation.navigate('DailyRecord')}
            />
          </SurfaceCard>
        )}
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
    alignItems: 'center',
    gap: spacing.base,
  },
  periodLabel: {
    ...typography.title3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  cardTitle: {
    ...typography.body1Bold,
    color: colors.text.primary,
  },
  cardPeriod: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  metricHeader: {
    marginTop: spacing.base,
    marginBottom: spacing.base,
  },
  metricValue: {
    ...typography.number.small,
    color: colors.text.primary,
  },
  metricMeta: {
    ...typography.body2Bold,
    marginTop: 4,
  },
  bpHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing.base,
    marginBottom: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  summaryBox: {
    flexDirection: 'row',
    gap: spacing.base,
    marginTop: spacing.base,
    alignItems: 'flex-start',
  },
  summaryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIcon: {
    fontSize: 20,
  },
  summaryText: {
    flex: 1,
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 22,
  },
});
