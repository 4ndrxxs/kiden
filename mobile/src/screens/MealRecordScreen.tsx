import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius, touchTarget } from '../theme/spacing';
import { GlassCard, GradientButton, IconButton, SectionHeader, StatusBadge } from '../components/common';
import { MEAL_TYPES } from '../config/constants';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function MealRecordScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <IconButton name="arrow-back" onPress={() => nav.goBack()} />
        <Text style={styles.headerTitle}>식단 기록</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 끼니 선택 */}
        <SectionHeader title="끼니 선택" />
        <View style={styles.mealGrid}>
          {MEAL_TYPES.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setSelectedMeal(item.key as MealType)}
              style={[
                styles.mealCard,
                selectedMeal === item.key && styles.mealCardSelected,
              ]}
            >
              <Text style={styles.mealEmoji}>{item.icon}</Text>
              <Text style={[
                styles.mealLabel,
                selectedMeal === item.key && styles.mealLabelSelected,
              ]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 음식 입력 방법 */}
        <SectionHeader title="음식 입력" />
        <GlassCard noPadding>
          {/* 사진 촬영 */}
          <Pressable style={styles.inputMethod}>
            <View style={[styles.inputIcon, { backgroundColor: colors.primary.bg }]}>
              <Ionicons name="camera-outline" size={24} color={colors.primary.main} />
            </View>
            <View style={styles.inputText}>
              <Text style={styles.inputTitle}>사진으로 기록</Text>
              <Text style={styles.inputSub}>AI가 음식을 분석해요</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.disabled} />
          </Pressable>
          <View style={styles.divider} />
          {/* 수동 검색 */}
          <Pressable style={styles.inputMethod}>
            <View style={[styles.inputIcon, { backgroundColor: colors.secondary.bg }]}>
              <Ionicons name="search-outline" size={24} color={colors.secondary.main} />
            </View>
            <View style={styles.inputText}>
              <Text style={styles.inputTitle}>음식 검색</Text>
              <Text style={styles.inputSub}>한국 음식 DB에서 찾기</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.disabled} />
          </Pressable>
          <View style={styles.divider} />
          {/* 즐겨찾기 */}
          <Pressable style={styles.inputMethod}>
            <View style={[styles.inputIcon, { backgroundColor: colors.status.cautionBg }]}>
              <Ionicons name="star-outline" size={24} color={colors.status.caution} />
            </View>
            <View style={styles.inputText}>
              <Text style={styles.inputTitle}>즐겨찾기</Text>
              <Text style={styles.inputSub}>자주 먹는 음식 빠르게</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.disabled} />
          </Pressable>
        </GlassCard>

        {/* AI 분석 예시 (placeholder) */}
        <SectionHeader title="AI 분석 결과" />
        <GlassCard>
          <View style={styles.analysisPlaceholder}>
            <Ionicons name="sparkles-outline" size={32} color={colors.text.disabled} />
            <Text style={styles.placeholderText}>
              음식을 입력하면{'\n'}AI가 영양소를 분석해요
            </Text>
          </View>
        </GlassCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  mealGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  mealCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    minHeight: touchTarget.comfortable,
  },
  mealCardSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.bg,
  },
  mealEmoji: {
    fontSize: 28,
  },
  mealLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  mealLabelSelected: {
    color: colors.primary.main,
  },
  inputMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    gap: spacing.base,
    minHeight: touchTarget.comfortable,
  },
  inputIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputText: {
    flex: 1,
    gap: 2,
  },
  inputTitle: {
    ...typography.body2Bold,
    color: colors.text.primary,
  },
  inputSub: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 44 + spacing.lg + spacing.base,
    marginRight: spacing.lg,
  },
  analysisPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.md,
  },
  placeholderText: {
    ...typography.body2,
    color: colors.text.disabled,
    textAlign: 'center',
  },
});
