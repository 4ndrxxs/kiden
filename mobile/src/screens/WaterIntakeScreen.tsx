import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { CircularProgress, EmptyState, HeaderIconButton, SurfaceCard } from '../design/system';
import { formatKoreanDate, formatTimeLabel } from '../design/data';
import { useHealthStore } from '../stores/healthStore';
import { useUserStore } from '../stores/userStore';
import { WATER_PRESETS } from '../config/constants';

export function WaterIntakeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { addWaterEntry, fetchTodayData, getTodayWater, waterEntries } = useHealthStore();
  const maxWater = useUserStore((state) => state.settings.waterLimitMl);

  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    fetchTodayData();
  }, [fetchTodayData]);

  const current = getTodayWater();
  const percent = useMemo(() => {
    if (maxWater <= 0) return 0;
    return Math.min(current / maxWater, 1);
  }, [current, maxWater]);
  const remaining = Math.max(0, maxWater - current);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntries = useMemo(
    () => waterEntries.filter((entry) => entry.recordedAt.startsWith(todayStr)).slice(0, 12),
    [waterEntries, todayStr],
  );

  const statusMessage = useMemo(() => {
    if (percent >= 1) return { text: '일일 상한에 도달했어요. 오늘은 더 마시지 않는 것이 좋습니다.', status: 'danger' as const };
    if (percent >= 0.8) return { text: '상한에 가까워요. 조금만 더 주의해 주세요.', status: 'caution' as const };
    if (percent >= 0.5) return { text: '절반 넘게 섭취했어요. 남은 양을 조절해 보세요.', status: 'safe' as const };
    return { text: '아직 여유가 있어요. 조금씩 나누어 마셔 보세요.', status: 'safe' as const };
  }, [percent]);

  const statusColor =
    statusMessage.status === 'danger'
      ? colors.status.danger
      : statusMessage.status === 'caution'
      ? colors.status.caution
      : colors.status.safe;

  const gradientColors = (
    percent >= 1
      ? ['#FF5D79', '#FF8BA2']
      : percent >= 0.8
      ? ['#FFB020', '#FFD36B']
      : ['#6A7DFF', '#A0B2FF']
  ) as readonly string[];

  const handleQuickAdd = async (amount: number) => {
    if (current + amount > maxWater * 1.5) {
      Alert.alert('확인', `상한의 150%를 넘는 섭취입니다. 계속 기록할까요?`, [
        { text: '취소', style: 'cancel' },
        { text: '기록', onPress: () => addWaterEntry(amount) },
      ]);
      return;
    }
    await addWaterEntry(amount);
  };

  const handleCustomAdd = async () => {
    const value = Number(customAmount);
    if (!value || value < 1 || value > 3000) {
      Alert.alert('입력 확인', '1 ~ 3000 mL 사이 숫자를 입력해 주세요.');
      return;
    }
    await handleQuickAdd(value);
    setCustomAmount('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: 40 }]}
      >
        <View style={styles.headerRow}>
          <HeaderIconButton name="chevron-back" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>수분 섭취</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={styles.dateText}>{formatKoreanDate()}</Text>

        <SurfaceCard style={styles.gaugeCard}>
          <CircularProgress size={220} strokeWidth={14} progress={percent} gradientColors={gradientColors} trackColor={colors.border.light}>
            <Text style={styles.gaugeValue}>{current.toLocaleString()} mL</Text>
            <Text style={styles.gaugeSub}>/ {maxWater.toLocaleString()} mL</Text>
            <Text style={styles.gaugePercent}>{Math.round(percent * 100)}%</Text>
          </CircularProgress>
          <Text style={styles.remainingText}>남은 섭취 가능량 {remaining.toLocaleString()} mL</Text>
          <Text style={[styles.warningText, { color: statusColor }]}>{statusMessage.text}</Text>
        </SurfaceCard>

        <Text style={styles.sectionTitle}>빠른 추가</Text>
        <View style={styles.quickRow}>
          {WATER_PRESETS.map((item) => (
            <Pressable
              key={item.amount}
              onPress={() => handleQuickAdd(item.amount)}
              style={({ pressed }) => [styles.quickButton, { opacity: pressed ? 0.88 : 1 }]}
            >
              <Text style={styles.quickAmount}>+{item.amount}</Text>
              <Text style={styles.quickUnit}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <SurfaceCard>
          <Text style={styles.sectionTitle}>직접 입력</Text>
          <View style={styles.customRow}>
            <TextInput
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="number-pad"
              placeholder="mL 단위로 입력"
              placeholderTextColor={colors.text.disabled}
              style={styles.customInput}
              maxLength={5}
            />
            <Pressable
              onPress={handleCustomAdd}
              style={({ pressed }) => [styles.customButton, { opacity: pressed ? 0.88 : 1 }]}
            >
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.customButtonText}>추가</Text>
            </Pressable>
          </View>
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.logTitle}>오늘 기록</Text>
          {todayEntries.length > 0 ? (
            todayEntries.map((entry, index) => (
              <View key={entry.id}>
                <View style={styles.logRow}>
                  <View style={styles.logLeft}>
                    <Ionicons name="water-outline" size={16} color={colors.accent.aqua} />
                    <Text style={styles.logTime}>{formatTimeLabel(entry.recordedAt)}</Text>
                  </View>
                  <Text style={styles.logAmount}>{entry.amountMl} mL</Text>
                </View>
                {index < todayEntries.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))
          ) : (
            <EmptyState
              icon="water-outline"
              title="오늘 아직 수분 기록이 없어요"
              description="위 버튼으로 빠르게 기록하거나 직접 입력할 수 있습니다."
            />
          )}
        </SurfaceCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: spacing.base,
    gap: spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...typography.title3,
    color: colors.text.primary,
  },
  dateText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  gaugeCard: {
    alignItems: 'center',
    gap: spacing.base,
  },
  gaugeValue: {
    ...typography.number.medium,
    color: colors.text.primary,
  },
  gaugeSub: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  gaugePercent: {
    ...typography.body1Bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  remainingText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  warningText: {
    ...typography.captionBold,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.body1Bold,
    color: colors.text.primary,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickButton: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xl,
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  quickAmount: {
    ...typography.body1Bold,
    color: colors.primary.main,
  },
  quickUnit: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 4,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  customInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.base,
    ...typography.body1Bold,
    color: colors.text.primary,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary.main,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.base,
    height: 48,
  },
  customButtonText: {
    ...typography.body2Bold,
    color: colors.white,
  },
  logTitle: {
    ...typography.body1Bold,
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logTime: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  logAmount: {
    ...typography.body2Bold,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
  },
});
