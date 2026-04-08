import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { GlassCard, GradientButton, LargeInput, IconButton, SectionHeader } from '../components/common';
import { useHealthStore } from '../stores/healthStore';

export function DialysisRecordScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const addDialysisRecord = useHealthStore((s) => s.addDialysisRecord);

  const [preWeight, setPreWeight] = useState('');
  const [postWeight, setPostWeight] = useState('');
  const [memo, setMemo] = useState('');

  const uf = preWeight && postWeight
    ? (Number(preWeight) - Number(postWeight)).toFixed(1)
    : null;

  const handleSave = () => {
    addDialysisRecord({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      preWeight: preWeight ? Number(preWeight) : undefined,
      postWeight: postWeight ? Number(postWeight) : undefined,
      ultrafiltration: uf ? Number(uf) : undefined,
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
        <Text style={styles.headerTitle}>투석 기록</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 체중 기록 */}
        <SectionHeader title="투석 전후 체중" />
        <GlassCard>
          <View style={styles.inputGroup}>
            <LargeInput
              label="투석 전 체중"
              value={preWeight}
              onChangeText={setPreWeight}
              placeholder="68.0"
              unit="kg"
              keyboardType="decimal-pad"
            />
            <LargeInput
              label="투석 후 체중"
              value={postWeight}
              onChangeText={setPostWeight}
              placeholder="65.5"
              unit="kg"
              keyboardType="decimal-pad"
            />
          </View>
        </GlassCard>

        {/* 제수량 자동 계산 */}
        {uf !== null && (
          <GlassCard>
            <View style={styles.ufCard}>
              <Text style={styles.ufLabel}>제수량 (자동 계산)</Text>
              <View style={styles.ufValueRow}>
                <Text style={styles.ufValue}>{uf}</Text>
                <Text style={styles.ufUnit}>L</Text>
              </View>
              {Number(uf) > 3 && (
                <View style={styles.warningBadge}>
                  <Text style={styles.warningText}>⚠️ 제수량이 3L을 초과합니다</Text>
                </View>
              )}
            </View>
          </GlassCard>
        )}

        {/* 메모 */}
        <SectionHeader title="메모" />
        <GlassCard>
          <LargeInput
            label="투석 중 특이사항"
            value={memo}
            onChangeText={setMemo}
            placeholder="혈관접근로 상태, 합병증 등"
          />
        </GlassCard>

        <GradientButton
          title="기록 완료"
          onPress={handleSave}
          gradient={colors.status.dangerGradient}
          style={styles.saveBtn}
        />

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  inputGroup: {
    gap: spacing.base,
  },
  ufCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  ufLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  ufValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  ufValue: {
    ...typography.number.large,
    color: colors.primary.main,
  },
  ufUnit: {
    ...typography.body1,
    color: colors.text.tertiary,
  },
  warningBadge: {
    backgroundColor: colors.status.cautionBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  warningText: {
    ...typography.captionBold,
    color: colors.status.caution,
  },
  saveBtn: {
    marginTop: spacing.lg,
  },
});
