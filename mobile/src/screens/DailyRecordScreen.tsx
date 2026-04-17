import React, { useMemo, useState } from 'react';
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
import { GradientButton, HeaderIconButton, SoftBadge, SurfaceCard, WeightDial } from '../design/system';
import { formatKoreanDate } from '../design/data';
import { FATIGUE_EMOJIS, FATIGUE_LABELS, MOOD_EMOJIS, MOOD_LABELS } from '../config/constants';
import { useHealthStore } from '../stores/healthStore';
import { useUserStore } from '../stores/userStore';

const moodOptions = MOOD_EMOJIS.map((emoji, index) => ({
  value: index + 1,
  emoji,
  label: MOOD_LABELS[index],
}));

const fatigueOptions = FATIGUE_EMOJIS.map((emoji, index) => ({
  value: index + 1,
  emoji,
  label: FATIGUE_LABELS[index],
}));

const TOTAL_STEPS = 4;

export function DailyRecordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const addDailyRecord = useHealthStore((state) => state.addDailyRecord);
  const latest = useHealthStore((state) => state.dailyRecords[0]);
  const idealWeight = useUserStore((state) => state.profile?.idealBodyWeight ?? null);

  const [step, setStep] = useState(0);
  const [weight, setWeight] = useState<number>(latest?.weight ?? idealWeight ?? 60);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [fatigue, setFatigue] = useState<number | null>(null);
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const stepTitle = useMemo(() => {
    switch (step) {
      case 0:
        return '1. 체중을 입력해 주세요';
      case 1:
        return '2. 혈압을 입력해 주세요';
      case 2:
        return '3. 오늘 컨디션을 기록해 주세요';
      case 3:
        return '4. 메모를 남겨 주세요 (선택)';
      default:
        return '';
    }
  }, [step]);

  const weightDelta = useMemo(() => {
    if (idealWeight == null) return null;
    return Number((weight - idealWeight).toFixed(1));
  }, [weight, idealWeight]);

  const deltaText = useMemo(() => {
    if (weightDelta == null) return '건체중 미설정';
    if (weightDelta === 0) return '건체중과 동일';
    return `건체중 ${weightDelta > 0 ? '+' : ''}${weightDelta} kg`;
  }, [weightDelta]);

  const targetLabel = idealWeight != null ? `건체중 ${idealWeight.toFixed(1)} kg` : '건체중 미설정';

  const canSave = weight > 0;

  const validateStep = (): boolean => {
    if (step === 0 && weight <= 0) {
      Alert.alert('입력 확인', '체중을 입력해 주세요.');
      return false;
    }
    if (step === 1) {
      if (systolic && (Number(systolic) < 50 || Number(systolic) > 250)) {
        Alert.alert('입력 확인', '수축기 혈압이 올바르지 않습니다.');
        return false;
      }
      if (diastolic && (Number(diastolic) < 30 || Number(diastolic) > 150)) {
        Alert.alert('입력 확인', '이완기 혈압이 올바르지 않습니다.');
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('입력 확인', '체중을 먼저 입력해 주세요.');
      return;
    }
    setSaving(true);
    try {
      await addDailyRecord({
        recordedAt: new Date().toISOString().split('T')[0],
        weight,
        systolic: systolic ? Number(systolic) : null,
        diastolic: diastolic ? Number(diastolic) : null,
        mood,
        fatigue,
        memo,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('저장 실패', '잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS - 1) {
      setStep((prev) => prev + 1);
      return;
    }
    await handleSave();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.inner, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <HeaderIconButton name="arrow-back" onPress={() => navigation.goBack()} />
          <Text style={styles.stepCount}>
            {step + 1}/{TOTAL_STEPS}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
        </View>

        <Text style={styles.screenTitle}>{stepTitle}</Text>
        <Text style={styles.screenSubtitle}>{formatKoreanDate()}</Text>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 0 ? (
            <WeightDial
              value={weight}
              deltaText={deltaText}
              targetLabel={targetLabel}
              onDecrease={() => setWeight((prev) => Number(Math.max(0, prev - 0.1).toFixed(1)))}
              onIncrease={() => setWeight((prev) => Number((prev + 0.1).toFixed(1)))}
            />
          ) : null}

          {step === 1 ? (
            <SurfaceCard>
              <Text style={styles.cardLabel}>혈압을 입력하면 오늘 상태를 더 정확하게 볼 수 있어요.</Text>
              <View style={styles.pressureRow}>
                <View style={styles.pressureCard}>
                  <Text style={styles.inputLabel}>수축기</Text>
                  <TextInput
                    value={systolic}
                    onChangeText={setSystolic}
                    keyboardType="number-pad"
                    placeholder="—"
                    placeholderTextColor={colors.text.disabled}
                    style={styles.numericInput}
                    maxLength={3}
                  />
                  <Text style={styles.inputUnit}>mmHg</Text>
                </View>
                <View style={styles.pressureCard}>
                  <Text style={styles.inputLabel}>이완기</Text>
                  <TextInput
                    value={diastolic}
                    onChangeText={setDiastolic}
                    keyboardType="number-pad"
                    placeholder="—"
                    placeholderTextColor={colors.text.disabled}
                    style={styles.numericInput}
                    maxLength={3}
                  />
                  <Text style={styles.inputUnit}>mmHg</Text>
                </View>
              </View>
              <SoftBadge label="권장 범위 120 / 80 전후" color={colors.status.safe} backgroundColor={colors.status.safeBg} />
            </SurfaceCard>
          ) : null}

          {step === 2 ? (
            <View style={{ gap: spacing.base }}>
              <SurfaceCard>
                <Text style={styles.cardLabel}>오늘 기분은 어떤가요?</Text>
                <View style={styles.moodRow}>
                  {moodOptions.map((option) => {
                    const selected = option.value === mood;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => setMood(option.value)}
                        style={({ pressed }) => [
                          styles.moodChip,
                          selected && styles.moodChipActive,
                          { opacity: pressed ? 0.9 : 1 },
                        ]}
                      >
                        <Text style={styles.moodEmoji}>{option.emoji}</Text>
                        <Text style={[styles.moodLabel, selected && styles.moodLabelActive]}>{option.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </SurfaceCard>

              <SurfaceCard>
                <Text style={styles.cardLabel}>피로감은 어떤가요?</Text>
                <View style={styles.moodRow}>
                  {fatigueOptions.map((option) => {
                    const selected = option.value === fatigue;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => setFatigue(option.value)}
                        style={({ pressed }) => [
                          styles.moodChip,
                          selected && styles.moodChipActive,
                          { opacity: pressed ? 0.9 : 1 },
                        ]}
                      >
                        <Text style={styles.moodEmoji}>{option.emoji}</Text>
                        <Text style={[styles.moodLabel, selected && styles.moodLabelActive]}>{option.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </SurfaceCard>
            </View>
          ) : null}

          {step === 3 ? (
            <SurfaceCard>
              <Text style={styles.cardLabel}>메모 (선택)</Text>
              <TextInput
                value={memo}
                onChangeText={setMemo}
                placeholder="컨디션, 약 복용 여부, 기타 특이사항을 적어 주세요"
                placeholderTextColor={colors.text.disabled}
                multiline
                style={styles.memoInput}
              />
            </SurfaceCard>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <GradientButton
            label={
              saving
                ? '저장 중...'
                : step === 0
                ? '다음: 혈압 입력'
                : step === 1
                ? '다음: 컨디션 입력'
                : step === 2
                ? '다음: 메모 입력'
                : '기록 저장'
            }
            onPress={handleNext}
            icon={
              !saving && step < TOTAL_STEPS - 1 ? (
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              ) : undefined
            }
          />
          <View style={styles.dotRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <View key={index} style={[styles.dot, index === step && styles.dotActive]} />
            ))}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCount: {
    ...typography.captionBold,
    color: colors.text.tertiary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border.light,
    borderRadius: radius.full,
    marginTop: spacing.base,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary.main,
  },
  screenTitle: {
    ...typography.title2,
    color: colors.text.primary,
    marginTop: spacing.xl,
  },
  screenSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  footer: {
    paddingBottom: spacing.base,
    gap: spacing.base,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border.default,
  },
  dotActive: {
    backgroundColor: colors.primary.main,
  },
  cardLabel: {
    ...typography.body2Bold,
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  pressureRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  pressureCard: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xl,
    padding: spacing.base,
  },
  inputLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  numericInput: {
    ...typography.number.medium,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  inputUnit: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moodChip: {
    width: '31%',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xl,
    paddingVertical: spacing.base,
    alignItems: 'center',
    gap: spacing.xs,
  },
  moodChipActive: {
    backgroundColor: colors.primary.bg,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  moodLabelActive: {
    color: colors.primary.main,
  },
  memoInput: {
    minHeight: 140,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    ...typography.body2,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
});
