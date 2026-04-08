import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius, touchTarget } from '../theme/spacing';
import { GlassCard } from '../components/common';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface RecordMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

function RecordMenuItem({ icon, title, subtitle, color, onPress }: RecordMenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.menuIcon, { backgroundColor: color + '14' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.disabled} />
    </Pressable>
  );
}

export function RecordScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();

  const menuItems: RecordMenuItemProps[] = [
    {
      icon: 'body-outline',
      title: '일일 컨디션',
      subtitle: '체중, 혈압, 기분, 수면',
      color: colors.primary.main,
      onPress: () => nav.navigate('DailyRecord'),
    },
    {
      icon: 'medical-outline',
      title: '투석 기록',
      subtitle: '투석 전후 체중, 제수량',
      color: colors.status.danger,
      onPress: () => nav.navigate('DialysisRecord'),
    },
    {
      icon: 'restaurant-outline',
      title: '식단 기록',
      subtitle: '음식 사진, 영양 분석',
      color: colors.secondary.main,
      onPress: () => nav.navigate('MealRecord'),
    },
    {
      icon: 'water-outline',
      title: '수분 섭취',
      subtitle: '물, 음료 기록',
      color: '#4A9BD9',
      onPress: () => nav.navigate('WaterIntake'),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>기록</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 오늘 날짜 */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.text.tertiary} />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </Text>
        </View>

        {/* 기록 메뉴 */}
        <GlassCard noPadding>
          <View style={styles.menuList}>
            {menuItems.map((item, idx) => (
              <React.Fragment key={item.title}>
                <RecordMenuItem {...item} />
                {idx < menuItems.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </GlassCard>

        <View style={{ height: 100 }} />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.title1,
    color: colors.text.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.base,
    paddingTop: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    ...typography.body2,
    color: colors.text.tertiary,
  },
  menuList: {
    paddingVertical: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    minHeight: touchTarget.comfortable,
    gap: spacing.base,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    ...typography.body1Bold,
    color: colors.text.primary,
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 44 + spacing.lg + spacing.base,
    marginRight: spacing.lg,
  },
});
