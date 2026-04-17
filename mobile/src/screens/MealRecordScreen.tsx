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
import { GradientButton, HeaderIconButton, SectionTitle, SegmentedControl, SurfaceCard } from '../design/system';
import { FOOD_CATEGORIES, formatKoreanDate, nutrientPercent } from '../design/data';
import { useHealthStore } from '../stores/healthStore';
import { useUserStore } from '../stores/userStore';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const mealOptions: { label: string; value: MealType }[] = [
  { label: '아침', value: 'breakfast' },
  { label: '점심', value: 'lunch' },
  { label: '저녁', value: 'dinner' },
  { label: '간식', value: 'snack' },
];

interface NumberFieldProps {
  label: string;
  unit: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

function NumberField({ label, unit, value, onChangeText, placeholder }: NumberFieldProps) {
  return (
    <View style={styles.numberField}>
      <Text style={styles.numberFieldLabel}>{label}</Text>
      <View style={styles.numberFieldRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder={placeholder ?? '0'}
          placeholderTextColor={colors.text.disabled}
          style={styles.numberFieldInput}
        />
        <Text style={styles.numberFieldUnit}>{unit}</Text>
      </View>
    </View>
  );
}

export function MealRecordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const addMealRecord = useHealthStore((state) => state.addMealRecord);
  const settings = useUserStore((state) => state.settings);

  const [mealType, setMealType] = useState<MealType>(suggestedMeal());
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<string>(FOOD_CATEGORIES[0]);
  const [serving, setServing] = useState('');
  const [calories, setCalories] = useState('');
  const [potassium, setPotassium] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [sodium, setSodium] = useState('');
  const [protein, setProtein] = useState('');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const description = useMemo(() => {
    const parts: string[] = [];
    if (foodName.trim()) parts.push(foodName.trim());
    if (serving.trim()) parts.push(`${serving.trim()}`);
    if (memo.trim()) parts.push(`(${memo.trim()})`);
    return parts.join(' · ') || category;
  }, [foodName, serving, memo, category]);

  const kPercent = useMemo(
    () => nutrientPercent(Number(potassium) || 0, settings.potassiumLimitMg),
    [potassium, settings.potassiumLimitMg],
  );
  const pPercent = useMemo(
    () => nutrientPercent(Number(phosphorus) || 0, settings.phosphorusLimitMg),
    [phosphorus, settings.phosphorusLimitMg],
  );
  const naPercent = useMemo(
    () => nutrientPercent(Number(sodium) || 0, settings.sodiumLimitMg),
    [sodium, settings.sodiumLimitMg],
  );

  const statusColor = (status: 'safe' | 'caution' | 'danger') => {
    if (status === 'danger') return colors.status.danger;
    if (status === 'caution') return colors.status.caution;
    return colors.status.safe;
  };

  const handleSave = async () => {
    if (!foodName.trim()) {
      Alert.alert('입력 확인', '음식 이름을 입력해 주세요.');
      return;
    }

    setSaving(true);
    try {
      await addMealRecord({
        recordedAt: new Date().toISOString().split('T')[0],
        mealType,
        description,
        photoUrl: null,
        calories: calories ? Number(calories) : null,
        potassiumMg: potassium ? Number(potassium) : null,
        phosphorusMg: phosphorus ? Number(phosphorus) : null,
        sodiumMg: sodium ? Number(sodium) : null,
        proteinG: protein ? Number(protein) : null,
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: 40 }]}
      >
        <View style={styles.headerRow}>
          <HeaderIconButton name="chevron-back" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>식단 기록</Text>
          <Pressable onPress={handleSave} disabled={saving}>
            <Text style={[styles.saveText, saving && { opacity: 0.5 }]}>저장</Text>
          </Pressable>
        </View>

        <Text style={styles.dateText}>{formatKoreanDate()}</Text>

        <SectionTitle title="식사 시간" />
        <SegmentedControl options={mealOptions} value={mealType} onChange={setMealType} />

        <SectionTitle title="음식 정보" subtitle="이름과 양을 입력하세요" />
        <SurfaceCard>
          <Text style={styles.inputLabel}>음식 이름</Text>
          <TextInput
            value={foodName}
            onChangeText={setFoodName}
            placeholder="예: 잡곡밥, 두부조림"
            placeholderTextColor={colors.text.disabled}
            style={styles.textInput}
            maxLength={60}
          />

          <Text style={[styles.inputLabel, { marginTop: spacing.base }]}>1회 섭취량</Text>
          <TextInput
            value={serving}
            onChangeText={setServing}
            placeholder="예: 1공기 (210g)"
            placeholderTextColor={colors.text.disabled}
            style={styles.textInput}
            maxLength={40}
          />

          <Text style={[styles.inputLabel, { marginTop: spacing.base }]}>분류</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {FOOD_CATEGORIES.map((item) => {
              const active = item === category;
              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={({ pressed }) => [styles.chip, active && styles.chipActive, { opacity: pressed ? 0.85 : 1 }]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </SurfaceCard>

        <SectionTitle title="영양 정보 (선택)" subtitle="아는 만큼만 입력해도 됩니다" />
        <SurfaceCard>
          <View style={styles.nutrientGrid}>
            <NumberField label="칼로리" unit="kcal" value={calories} onChangeText={setCalories} />
            <NumberField label="단백질" unit="g" value={protein} onChangeText={setProtein} />
            <NumberField label="칼륨 (K)" unit="mg" value={potassium} onChangeText={setPotassium} />
            <NumberField label="인 (P)" unit="mg" value={phosphorus} onChangeText={setPhosphorus} />
            <NumberField label="나트륨 (Na)" unit="mg" value={sodium} onChangeText={setSodium} />
          </View>

          {(potassium || phosphorus || sodium) && (
            <View style={styles.percentRow}>
              <View style={styles.percentItem}>
                <Text style={styles.percentLabel}>K</Text>
                <Text style={[styles.percentValue, { color: statusColor(kPercent.status) }]}>{kPercent.percent}%</Text>
              </View>
              <View style={styles.percentItem}>
                <Text style={styles.percentLabel}>P</Text>
                <Text style={[styles.percentValue, { color: statusColor(pPercent.status) }]}>{pPercent.percent}%</Text>
              </View>
              <View style={styles.percentItem}>
                <Text style={styles.percentLabel}>Na</Text>
                <Text style={[styles.percentValue, { color: statusColor(naPercent.status) }]}>{naPercent.percent}%</Text>
              </View>
              <Text style={styles.percentSub}>일일 상한 대비</Text>
            </View>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.inputLabel}>메모</Text>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            placeholder="조리법, 특이사항 등을 적어 주세요"
            placeholderTextColor={colors.text.disabled}
            multiline
            style={styles.memoInput}
          />
        </SurfaceCard>

        <GradientButton
          label={saving ? '저장 중...' : '기록 저장'}
          onPress={handleSave}
          icon={!saving ? <Ionicons name="checkmark" size={18} color={colors.white} /> : undefined}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function suggestedMeal(): MealType {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 14) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
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
  saveText: {
    ...typography.body2Bold,
    color: colors.primary.main,
  },
  dateText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  inputLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  textInput: {
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.base,
    ...typography.body1Bold,
    color: colors.text.primary,
  },
  chipRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary.bg,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  chipText: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.primary.main,
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  numberField: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.base,
    gap: spacing.xs,
  },
  numberFieldLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  numberFieldRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  numberFieldInput: {
    flex: 1,
    ...typography.title3,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  numberFieldUnit: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.base,
  },
  percentItem: {
    alignItems: 'center',
  },
  percentLabel: {
    ...typography.label,
    color: colors.text.secondary,
  },
  percentValue: {
    ...typography.body1Bold,
    marginTop: 4,
  },
  percentSub: {
    ...typography.caption,
    color: colors.text.tertiary,
    flex: 1,
    textAlign: 'right',
  },
  memoInput: {
    minHeight: 100,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    ...typography.body2,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
});
