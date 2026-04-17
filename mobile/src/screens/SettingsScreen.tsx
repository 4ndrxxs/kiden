import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { getDisplayProfile } from '../design/data';
import { GradientButton, SurfaceCard } from '../design/system';
import { checkAndApplyUpdate, getCurrentUpdateInfo } from '../utils/updates';
import { useUserStore, type HealthSettings, type Profile } from '../stores/userStore';
import { DAY_LABELS } from '../config/constants';

const appVersion = require('../../app.json').expo.version;

function SettingRow({
  label,
  value,
  onPress,
  trailing,
  danger,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
}) {
  const content = (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, danger && { color: colors.status.danger }]}>{label}</Text>
      <View style={styles.settingTrail}>
        {trailing ?? <Text style={styles.settingValue}>{value || '—'}</Text>}
        {onPress ? <Ionicons name="chevron-forward" size={14} color={colors.text.tertiary} /> : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
        {content}
      </Pressable>
    );
  }
  return content;
}

type EditTarget =
  | { type: 'displayName' }
  | { type: 'diagnosis' }
  | { type: 'idealBodyWeight' }
  | { type: 'hospitalName' }
  | { type: 'dialysisTime' }
  | { type: 'dialysisDays' }
  | { type: 'numberSetting'; key: keyof HealthSettings; label: string; unit: string }
  | { type: 'aiServerUrl' };

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const updateInfo = getCurrentUpdateInfo();
  const [checking, setChecking] = useState(false);
  const [editing, setEditing] = useState<EditTarget | null>(null);

  const profile = useUserStore((state) => state.profile);
  const settings = useUserStore((state) => state.settings);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const updateSettings = useUserStore((state) => state.updateSettings);
  const signOut = useUserStore((state) => state.signOut);
  const session = useUserStore((state) => state.session);

  const displayProfile = getDisplayProfile(profile);
  const email = session?.user?.email ?? '';

  const handleCheckUpdate = async () => {
    setChecking(true);
    await checkAndApplyUpdate(false);
    setChecking(false);
  };

  const handleSignOut = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.base, paddingBottom: 120 },
        ]}
      >
        <SurfaceCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayProfile.displayName.slice(0, 2) || '🙂'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{displayProfile.displayName}</Text>
              <Text style={styles.profileEmail}>{email || '로그인 정보가 없습니다'}</Text>
            </View>
            <Pressable
              onPress={() => setEditing({ type: 'displayName' })}
              hitSlop={10}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary.main} />
            </Pressable>
          </View>
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.sectionTitle}>프로필 관리</Text>
          <SettingRow
            label="투석 요일"
            value={
              displayProfile.dialysisDays.length > 0
                ? displayProfile.dialysisDays.map((d) => DAY_LABELS[d]).join(' / ')
                : '미설정'
            }
            onPress={() => setEditing({ type: 'dialysisDays' })}
          />
          <View style={styles.divider} />
          <SettingRow
            label="투석 시간"
            value={displayProfile.dialysisTime || '미설정'}
            onPress={() => setEditing({ type: 'dialysisTime' })}
          />
          <View style={styles.divider} />
          <SettingRow
            label="병원명"
            value={displayProfile.hospitalName || '미설정'}
            onPress={() => setEditing({ type: 'hospitalName' })}
          />
          <View style={styles.divider} />
          <SettingRow
            label="진단명"
            value={displayProfile.diagnosis || '미설정'}
            onPress={() => setEditing({ type: 'diagnosis' })}
          />
          <View style={styles.divider} />
          <SettingRow
            label="건체중"
            value={
              displayProfile.idealBodyWeight != null
                ? `${displayProfile.idealBodyWeight} kg`
                : '미설정'
            }
            onPress={() => setEditing({ type: 'idealBodyWeight' })}
          />
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.sectionTitle}>영양소 상한 설정</Text>
          <SettingRow
            label="수분"
            value={`${settings.waterLimitMl.toLocaleString()} mL / 일`}
            onPress={() =>
              setEditing({
                type: 'numberSetting',
                key: 'waterLimitMl',
                label: '수분 상한',
                unit: 'mL',
              })
            }
          />
          <View style={styles.divider} />
          <SettingRow
            label="칼륨 (K)"
            value={`${settings.potassiumLimitMg.toLocaleString()} mg / 일`}
            onPress={() =>
              setEditing({
                type: 'numberSetting',
                key: 'potassiumLimitMg',
                label: '칼륨 상한',
                unit: 'mg',
              })
            }
          />
          <View style={styles.divider} />
          <SettingRow
            label="인 (P)"
            value={`${settings.phosphorusLimitMg.toLocaleString()} mg / 일`}
            onPress={() =>
              setEditing({
                type: 'numberSetting',
                key: 'phosphorusLimitMg',
                label: '인 상한',
                unit: 'mg',
              })
            }
          />
          <View style={styles.divider} />
          <SettingRow
            label="나트륨 (Na)"
            value={`${settings.sodiumLimitMg.toLocaleString()} mg / 일`}
            onPress={() =>
              setEditing({
                type: 'numberSetting',
                key: 'sodiumLimitMg',
                label: '나트륨 상한',
                unit: 'mg',
              })
            }
          />
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.sectionTitle}>알림 설정</Text>
          <SettingRow
            label="투석 리마인더"
            trailing={
              <Switch
                value={settings.notifyDialysis}
                onValueChange={(value) => updateSettings({ notifyDialysis: value })}
                trackColor={{ true: colors.primary.main, false: colors.border.default }}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            label="약 복용 알림"
            trailing={
              <Switch
                value={settings.notifyMedication}
                onValueChange={(value) => updateSettings({ notifyMedication: value })}
                trackColor={{ true: colors.primary.main, false: colors.border.default }}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            label="기록 시간 알림"
            trailing={
              <Switch
                value={settings.notifyWater}
                onValueChange={(value) => updateSettings({ notifyWater: value })}
                trackColor={{ true: colors.primary.main, false: colors.border.default }}
              />
            }
          />
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.sectionTitle}>시스템</Text>
          <SettingRow
            label="AI 서버 주소"
            value={settings.aiServerUrl || '미연결'}
            onPress={() => setEditing({ type: 'aiServerUrl' })}
          />
          <View style={styles.divider} />
          <SettingRow
            label="앱 업데이트"
            trailing={
              checking ? (
                <ActivityIndicator size="small" color={colors.primary.main} />
              ) : (
                <Pressable onPress={handleCheckUpdate} hitSlop={8}>
                  <Text style={styles.linkText}>확인</Text>
                </Pressable>
              )
            }
          />
          <View style={styles.divider} />
          <SettingRow
            label="버전"
            value={`v${appVersion} · ${updateInfo.isEmbeddedLaunch ? '기본 번들' : 'OTA 적용'}`}
          />
          <View style={styles.divider} />
          <SettingRow
            label="로그아웃"
            danger
            trailing={
              <Pressable onPress={handleSignOut} hitSlop={8}>
                <Text style={[styles.linkText, { color: colors.status.danger }]}>실행</Text>
              </Pressable>
            }
          />
        </SurfaceCard>
      </ScrollView>

      <EditModal
        target={editing}
        onClose={() => setEditing(null)}
        profile={profile}
        settings={settings}
        updateProfile={updateProfile}
        updateSettings={updateSettings}
      />
    </View>
  );
}

// ─── Edit Modal ──────────────────────────────────

function EditModal({
  target,
  onClose,
  profile,
  settings,
  updateProfile,
  updateSettings,
}: {
  target: EditTarget | null;
  onClose: () => void;
  profile: Profile | null;
  settings: HealthSettings;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateSettings: (updates: Partial<HealthSettings>) => Promise<void>;
}) {
  const visible = target !== null;
  const [text, setText] = useState('');
  const [days, setDays] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!target) return;
    if (target.type === 'displayName') setText(profile?.displayName ?? '');
    else if (target.type === 'diagnosis') setText(profile?.diagnosis ?? '');
    else if (target.type === 'idealBodyWeight')
      setText(profile?.idealBodyWeight != null ? String(profile.idealBodyWeight) : '');
    else if (target.type === 'hospitalName') setText(profile?.hospitalName ?? '');
    else if (target.type === 'dialysisTime') setText(profile?.dialysisTime ?? '');
    else if (target.type === 'dialysisDays') setDays(profile?.dialysisDays ?? []);
    else if (target.type === 'numberSetting')
      setText(String(settings[target.key] ?? ''));
    else if (target.type === 'aiServerUrl') setText(settings.aiServerUrl);
  }, [target, profile, settings]);

  const title = useMemo(() => {
    if (!target) return '';
    switch (target.type) {
      case 'displayName':
        return '이름 수정';
      case 'diagnosis':
        return '진단명 수정';
      case 'idealBodyWeight':
        return '건체중 수정 (kg)';
      case 'hospitalName':
        return '병원명 수정';
      case 'dialysisTime':
        return '투석 시간 수정';
      case 'dialysisDays':
        return '투석 요일 선택';
      case 'numberSetting':
        return `${target.label} 수정 (${target.unit})`;
      case 'aiServerUrl':
        return 'AI 서버 주소';
    }
  }, [target]);

  const handleSave = async () => {
    if (!target) return;
    setSaving(true);
    try {
      switch (target.type) {
        case 'displayName':
          await updateProfile({ displayName: text.trim() });
          break;
        case 'diagnosis':
          await updateProfile({ diagnosis: text.trim() });
          break;
        case 'idealBodyWeight': {
          const value = Number(text);
          if (text && (Number.isNaN(value) || value < 20 || value > 200)) {
            Alert.alert('입력 확인', '20 ~ 200 kg 사이 숫자를 입력해 주세요.');
            setSaving(false);
            return;
          }
          await updateProfile({ idealBodyWeight: text ? value : null });
          break;
        }
        case 'hospitalName':
          await updateProfile({ hospitalName: text.trim() });
          break;
        case 'dialysisTime':
          await updateProfile({ dialysisTime: text.trim() });
          break;
        case 'dialysisDays':
          await updateProfile({ dialysisDays: days.sort((a, b) => a - b) });
          break;
        case 'numberSetting': {
          const value = Number(text);
          if (Number.isNaN(value) || value < 0 || value > 100000) {
            Alert.alert('입력 확인', '올바른 숫자를 입력해 주세요.');
            setSaving(false);
            return;
          }
          await updateSettings({ [target.key]: value } as Partial<HealthSettings>);
          break;
        }
        case 'aiServerUrl':
          await updateSettings({ aiServerUrl: text.trim() });
          break;
      }
      onClose();
    } catch (err) {
      Alert.alert('저장 실패', '잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  if (!target) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.text.secondary} />
            </Pressable>
          </View>

          {target.type === 'dialysisDays' ? (
            <View style={styles.dayGrid}>
              {DAY_LABELS.map((label, index) => {
                const selected = days.includes(index);
                return (
                  <Pressable
                    key={label}
                    onPress={() => toggleDay(index)}
                    style={({ pressed }) => [
                      styles.dayChip,
                      selected && styles.dayChipActive,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <Text style={[styles.dayChipText, selected && styles.dayChipTextActive]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={
                target.type === 'idealBodyWeight'
                  ? '예: 65.5'
                  : target.type === 'dialysisTime'
                  ? '예: 오전 9:00 ~ 오후 1:00'
                  : target.type === 'aiServerUrl'
                  ? 'https://ai.example.com'
                  : '입력하세요'
              }
              placeholderTextColor={colors.text.disabled}
              style={styles.modalInput}
              autoFocus
              keyboardType={
                target.type === 'idealBodyWeight' || target.type === 'numberSetting'
                  ? 'decimal-pad'
                  : target.type === 'aiServerUrl'
                  ? 'url'
                  : 'default'
              }
              autoCapitalize={target.type === 'aiServerUrl' ? 'none' : 'sentences'}
              maxLength={target.type === 'aiServerUrl' ? 200 : 60}
            />
          )}

          <GradientButton
            label={saving ? '저장 중...' : '저장'}
            onPress={handleSave}
            style={{ marginTop: spacing.base }}
          />
        </Pressable>
      </Pressable>
    </Modal>
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
  profileCard: {
    backgroundColor: colors.surface,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.body1Bold,
    color: colors.white,
  },
  profileName: {
    ...typography.body1Bold,
    color: colors.text.primary,
  },
  profileEmail: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.body1Bold,
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 42,
    gap: spacing.base,
  },
  settingLabel: {
    ...typography.body2,
    color: colors.text.primary,
    flexShrink: 0,
  },
  settingTrail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
  },
  settingValue: {
    ...typography.body2Bold,
    color: colors.text.secondary,
    textAlign: 'right',
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  linkText: {
    ...typography.body2Bold,
    color: colors.primary.main,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.title3,
    color: colors.text.primary,
  },
  modalInput: {
    minHeight: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.base,
    ...typography.body1Bold,
    color: colors.text.primary,
  },
  dayGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  dayChip: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: colors.primary.main,
  },
  dayChipText: {
    ...typography.body1Bold,
    color: colors.text.secondary,
  },
  dayChipTextActive: {
    color: colors.white,
  },
});
