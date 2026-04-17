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

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { GradientButton, HeaderIconButton, SoftBadge, SurfaceCard } from '../design/system';
import { formatKoreanDate, getDisplayProfile } from '../design/data';
import { ULTRAFILTRATION_WARNING_THRESHOLD } from '../config/constants';
import { useHealthStore } from '../stores/healthStore';
import { useUserStore } from '../stores/userStore';

export function DialysisRecordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const addDialysisRecord = useHealthStore((state) => state.addDialysisRecord);
  const profile = useUserStore((state) => state.profile);

  const [preWeight, setPreWeight] = useState('');
  const [postWeight, setPostWeight] = useState('');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const displayProfile = getDisplayProfile(profile);

  const uf = useMemo(() => {
    if (!preWeight || !postWeight) return null;
    const value = Number(preWeight) - Number(postWeight);
    if (Number.isNaN(value)) return null;
    return Number(value.toFixed(1));
  }, [preWeight, postWeight]);

  const handleSave = async () => {
    const pre = Number(preWeight);
    const post = Number(postWeight);
    if (!pre || !post) {
      Alert.alert('입력 확인', '투석 전후 체중을 모두 입력해 주세요.');
      return;
    }
    if (pre <= post) {
      Alert.alert('입력 확인', '투석 전 체중이 후 체중보다 커야 합니다.');
      return;
    }
    if (pre < 30 || pre > 200 || post < 30 || post > 200) {
      Alert.alert('입력 확인', '체중 값이 올바르지 않습니다.');
      return;
    }

    setSaving(true);
    try {
      await addDialysisRecord({
        recordedAt: new Date().toISOString().split('T')[0],
        preWeight: pre,
        postWeight: post,
        memo,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('저장 실패', '잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.inner, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <HeaderIconButton name="chevron-back" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>투석 기록</Text>
          <Pressable onPress={handleSave} disabled={saving}>
            <Text style={[styles.saveText, saving && { opacity: 0.5 }]}>저장</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.dateText}>{formatKoreanDate()}</Text>
          {displayProfile.hospitalName || displayProfile.dialysisTime ? (
            <Text style={styles.timeText}>
              {[displayProfile.dialysisTime, displayProfile.hospitalName].filter(Boolean).join(' · ')}
            </Text>
          ) : (
            <Text style={styles.timeText}>설정에서 병원과 시간을 등록하면 여기에 표시됩니다.</Text>
          )}

          <View style={styles.weightRow}>
            <SurfaceCard style={styles.smallCard}>
              <Text style={styles.cardCaption}>투석 전 체중</Text>
              <TextInput
                value={preWeight}
                onChangeText={setPreWeight}
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={colors.text.disabled}
                style={styles.weightInput}
                maxLength={5}
              />
              <Text style={styles.unitText}>kg</Text>
            </SurfaceCard>
            <SurfaceCard style={styles.smallCard}>
              <Text style={styles.cardCaption}>투석 후 체중</Text>
              <TextInput
                value={postWeight}
                onChangeText={setPostWeight}
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={colors.text.disabled}
                style={styles.weightInput}
                maxLength={5}
              />
              <Text style={styles.unitText}>kg</Text>
            </SurfaceCard>
          </View>

          <SurfaceCard>
            <View style={styles.ufHeader}>
              <Text style={styles.ufLabel}>제수량 (UF)</Text>
              {uf != null && uf > ULTRAFILTRATION_WARNING_THRESHOLD ? (
                <SoftBadge label={`${ULTRAFILTRATION_WARNING_THRESHOLD}L 초과`} color={colors.status.danger} backgroundColor={colors.status.dangerBg} />
              ) : null}
            </View>
            <View style={styles.ufValueRow}>
              <Text style={styles.ufValue}>{uf != null ? uf.toFixed(1) : '—'}</Text>
              <Text style={styles.ufUnit}>L</Text>
            </View>
            <Text style={styles.rangeText}>권장: 1.0 ~ {ULTRAFILTRATION_WARNING_THRESHOLD.toFixed(1)} L</Text>
          </SurfaceCard>

          <SurfaceCard>
            <Text style={styles.cardCaption}>특이사항 메모</Text>
            <TextInput
              value={memo}
              onChangeText={setMemo}
              placeholder="투석 중 발생한 증상, 혈관 상태, 약 변경 등을 적어 주세요"
              placeholderTextColor={colors.text.disabled}
              multiline
              style={styles.memoInput}
            />
          </SurfaceCard>

          <GradientButton label={saving ? '저장 중...' : '저장하기'} onPress={handleSave} style={{ marginTop: spacing.sm }} />
        </ScrollView>
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
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.title3,
    color: colors.text.primary,
  },
  saveText: {
    ...typography.body2Bold,
    color: colors.primary.main,
  },
  content: {
    paddingBottom: 40,
    gap: spacing.base,
  },
  dateText: {
    ...typography.title3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  timeText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.base,
  },
  weightRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  smallCard: {
    flex: 1,
  },
  cardCaption: {
    ...typography.captionBold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  weightInput: {
    ...typography.number.medium,
    color: colors.text.primary,
  },
  unitText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  ufHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ufLabel: {
    ...typography.body1Bold,
    color: colors.text.primary,
  },
  ufValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  ufValue: {
    ...typography.number.large,
    color: colors.text.primary,
  },
  ufUnit: {
    ...typography.title3,
    color: colors.text.secondary,
  },
  rangeText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  memoInput: {
    minHeight: 112,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    ...typography.body2,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
});
