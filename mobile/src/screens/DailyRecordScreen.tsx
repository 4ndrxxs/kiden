import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import {
  GlassCard,
  GradientButton,
  LargeInput,
  EmojiSelector,
  IconButton,
  SectionHeader,
  defaultMoodOptions,
} from '../components/common';
import { useHealthStore } from '../stores/healthStore';

const fatigueOptions = [
  { emoji: '💪', label: '활력', value: 1 },
  { emoji: '🙂', label: '양호', value: 2 },
  { emoji: '😐', label: '보통', value: 3 },
  { emoji: '😩', label: '피곤', value: 4 },
  { emoji: '🛌', label: '극심', value: 5 },
];

export function DailyRecordScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const addDailyRecord = useHealthStore((s) => s.addDailyRecord);

  const [weight, setWeight] = useState('');
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [fatigue, setFatigue] = useState<number | null>(null);
  const [memo, setMemo] = useState('');

  // 페이지 단위 (토스 스타일 — 한 화면 3개씩)
  const [page, setPage] = useState(0);

  const handleSave = () => {
    addDailyRecord({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      weight: weight ? Number(weight) : undefined,
      bpSystolic: bpSys ? Number(bpSys) : undefined,
      bpDiastolic: bpDia ? Number(bpDia) : undefined,
      mood: mood ?? undefined,
      fatigue: fatigue ?? undefined,
      memo: memo || undefined,
    });
    nav.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton name="arrow-back" onPress={() => nav.goBack()} />
        <Text style={styles.headerTitle}>일일 컨디션</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* 페이지 인디케이터 */}
      <View style={styles.pageIndicator}>
        {[0, 1].map((i) => (
          <View
            key={i}
            style={[styles.dot, page === i && styles.dotActive]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {page === 0 && (
          <>
            {/* 페이지 1: 체중 + 혈압 + 기분 (3개) */}
            <SectionHeader title="활력 징후" />
            <GlassCard>
              <View style={styles.inputGroup}>
                <LargeInput
                  label="체중"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="65.0"
                  unit="kg"
                  keyboardType="decimal-pad"
                />
                <View style={styles.bpRow}>
                  <LargeInput
                    label="수축기 혈압"
                    value={bpSys}
                    onChangeText={setBpSys}
                    placeholder="120"
                    unit="mmHg"
                    keyboardType="numeric"
                    style={{ flex: 1 }}
                  />
                  <LargeInput
                    label="이완기 혈압"
                    value={bpDia}
                    onChangeText={setBpDia}
                    placeholder="80"
                    unit="mmHg"
                    keyboardType="numeric"
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </GlassCard>

            <SectionHeader title="오늘의 기분" />
            <GlassCard>
              <EmojiSelector
                label="기분이 어떠세요?"
                options={defaultMoodOptions}
                selected={mood}
                onSelect={setMood}
              />
            </GlassCard>

            <GradientButton
              title="다음"
              onPress={() => setPage(1)}
              style={styles.nextBtn}
            />
          </>
        )}

        {page === 1 && (
          <>
            {/* 페이지 2: 피로감 + 메모 + 저장 (3개) */}
            <SectionHeader title="피로감" />
            <GlassCard>
              <EmojiSelector
                label="피로도를 선택하세요"
                options={fatigueOptions}
                selected={fatigue}
                onSelect={setFatigue}
              />
            </GlassCard>

            <SectionHeader title="메모" />
            <GlassCard>
              <LargeInput
                label="오늘 특이사항이 있나요?"
                value={memo}
                onChangeText={setMemo}
                placeholder="자유롭게 적어주세요"
              />
            </GlassCard>

            <GradientButton
              title="기록 완료"
              onPress={handleSave}
              style={styles.nextBtn}
            />
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.default,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary.main,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.base,
  },
  bpRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  nextBtn: {
    marginTop: spacing.lg,
  },
});
