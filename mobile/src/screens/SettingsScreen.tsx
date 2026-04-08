import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Switch, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius, touchTarget } from '../theme/spacing';
import { GlassCard } from '../components/common';
import { checkAndApplyUpdate, getCurrentUpdateInfo } from '../utils/updates';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  color?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
}

function SettingItem({ icon, title, subtitle, color = colors.text.secondary, trailing, onPress }: SettingItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.settingItem, { opacity: pressed && onPress ? 0.8 : 1 }]}
    >
      <View style={[styles.settingIcon, { backgroundColor: color + '14' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSub}>{subtitle}</Text>}
      </View>
      {trailing ?? <Ionicons name="chevron-forward" size={18} color={colors.text.disabled} />}
    </Pressable>
  );
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [checking, setChecking] = useState(false);
  const updateInfo = getCurrentUpdateInfo();

  const handleCheckUpdate = useCallback(async () => {
    setChecking(true);
    await checkAndApplyUpdate(false);
    setChecking(false);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 카드 */}
        <GlassCard>
          <View style={styles.profileRow}>
            <View style={styles.profileAvatar}>
              <Text style={{ fontSize: 28 }}>👤</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>환자 (아버지)</Text>
              <Text style={styles.profileSub}>투석 월/수/금 · IGA 신증</Text>
            </View>
          </View>
        </GlassCard>

        {/* 건강 설정 */}
        <Text style={styles.sectionLabel}>건강 설정</Text>
        <GlassCard noPadding>
          <SettingItem
            icon="calendar-outline"
            title="투석 일정"
            subtitle="매주 월, 수, 금"
            color={colors.status.danger}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="body-outline"
            title="건체중"
            subtitle="65.5 kg"
            color={colors.primary.main}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="nutrition-outline"
            title="영양소 상한 설정"
            subtitle="K 2000mg · P 1000mg · Na 2000mg"
            color={colors.secondary.main}
          />
        </GlassCard>

        {/* 알림 */}
        <Text style={styles.sectionLabel}>알림</Text>
        <GlassCard noPadding>
          <SettingItem
            icon="notifications-outline"
            title="투석 리마인더"
            color="#4A9BD9"
            trailing={<Switch value={true} trackColor={{ true: colors.primary.main }} />}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="medkit-outline"
            title="약 복용 알림"
            color={colors.status.caution}
            trailing={<Switch value={true} trackColor={{ true: colors.primary.main }} />}
          />
        </GlassCard>

        {/* 연결 */}
        <Text style={styles.sectionLabel}>연결</Text>
        <GlassCard noPadding>
          <SettingItem
            icon="server-outline"
            title="AI 서버 연결"
            subtitle="연결 안됨"
            color={colors.text.tertiary}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="people-outline"
            title="가족 초대"
            subtitle="1명 연결됨"
            color={colors.primary.main}
          />
        </GlassCard>

        {/* 기타 */}
        <Text style={styles.sectionLabel}>기타</Text>
        <GlassCard noPadding>
          <SettingItem
            icon="download-outline"
            title="데이터 내보내기"
            subtitle="PDF (병원 제출용)"
            color={colors.text.secondary}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="cloud-download-outline"
            title="업데이트 확인"
            subtitle={checking ? '확인 중...' : '터치하여 업데이트 확인'}
            color={colors.primary.main}
            onPress={handleCheckUpdate}
            trailing={checking ? <ActivityIndicator size="small" color={colors.primary.main} /> : undefined}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="information-circle-outline"
            title="앱 정보"
            subtitle={`Kiden v1.0.0 · ${updateInfo.isEmbeddedLaunch ? '기본 번들' : 'OTA 업데이트됨'}`}
            color={colors.text.tertiary}
          />
        </GlassCard>

        <View style={{ height: 120 }} />
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
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    ...typography.body1Bold,
    color: colors.text.primary,
  },
  profileSub: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  sectionLabel: {
    ...typography.captionBold,
    color: colors.text.tertiary,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.base,
    minHeight: touchTarget.min,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    ...typography.body2Bold,
    color: colors.text.primary,
  },
  settingSub: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 36 + spacing.lg + spacing.base,
    marginRight: spacing.lg,
  },
});
