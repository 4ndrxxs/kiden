import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { GradientButton, shadows } from '../design/system';
import { useUserStore } from '../stores/userStore';

type Mode = 'login' | 'signup';

function AuthField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  trailing?: React.ReactNode;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Ionicons name={icon} size={18} color={colors.primary.main} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.disabled}
        style={styles.fieldInput}
        autoCapitalize="none"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
      {trailing}
    </View>
  );
}

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithEmail, signUp } = useUserStore();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [remember, setRemember] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || (mode === 'signup' && !displayName.trim())) {
      Alert.alert('입력 확인', '필수 항목을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    const result =
      mode === 'login'
        ? await signInWithEmail(email.trim(), password)
        : await signUp(email.trim(), password, displayName.trim());
    setLoading(false);

    if (result.error) {
      Alert.alert(mode === 'login' ? '로그인 실패' : '회원가입 실패', result.error);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#87A0FF', '#B388FF', '#F7A5D1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={[styles.glow, styles.glowLeft]} />
        <View style={[styles.glow, styles.glowRight]} />
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 36, paddingBottom: 32 }]} keyboardShouldPersistTaps="handled">
          <View style={styles.heroSection}>
            <Text style={styles.brand}>Kiden</Text>
            <Text style={styles.heroCopy}>오늘도 건강한 하루를{`\n`}함께 관리해요 💙</Text>
          </View>

          <View style={[styles.authCard, shadows.card]}>
            <Text style={styles.cardTitle}>{mode === 'login' ? '로그인' : '회원가입'}</Text>
            <Text style={styles.cardSubtitle}>키든과 함께 건강한 일상을 만들어가세요</Text>

            {mode === 'signup' ? (
              <AuthField icon="person-outline" placeholder="이름" value={displayName} onChangeText={setDisplayName} />
            ) : null}
            <AuthField icon="mail-outline" placeholder="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <AuthField
              icon="lock-closed-outline"
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              trailing={
                <Pressable onPress={() => setPasswordVisible((prev) => !prev)}>
                  <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.text.tertiary} />
                </Pressable>
              }
            />

            <View style={styles.metaRow}>
              <Pressable onPress={() => setRemember((prev) => !prev)} style={styles.rememberWrap}>
                <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                  {remember ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}
                </View>
                <Text style={styles.metaText}>로그인 상태 유지</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    '비밀번호 재설정',
                    '이메일을 입력하면 재설정 링크를 보내드려요.\n로그인 아래 이메일 주소가 자동으로 사용됩니다.',
                    [
                      { text: '취소', style: 'cancel' },
                      {
                        text: '보내기',
                        onPress: async () => {
                          if (!email.trim()) {
                            Alert.alert('알림', '이메일을 먼저 입력해 주세요.');
                            return;
                          }
                          const { supabase } = await import('../lib/supabase');
                          const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
                          if (error) {
                            Alert.alert('실패', error.message);
                          } else {
                            Alert.alert('전송 완료', '이메일을 확인해 주세요.');
                          }
                        },
                      },
                    ],
                  )
                }
              >
                <Text style={styles.metaAction}>비밀번호 찾기</Text>
              </Pressable>
            </View>

            <GradientButton
              label={loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
              onPress={handleSubmit}
              icon={loading ? <ActivityIndicator size="small" color={colors.white} /> : undefined}
              style={styles.submitButton}
            />

            <Pressable onPress={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}>
              <Text style={styles.switchText}>
                {mode === 'login' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
                <Text style={styles.switchTextStrong}>{mode === 'login' ? '회원가입' : '로그인'}</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  glowLeft: {
    top: 70,
    left: -80,
  },
  glowRight: {
    bottom: 90,
    right: -70,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  heroSection: {
    marginTop: 64,
  },
  brand: {
    ...typography.hero,
    color: colors.white,
  },
  heroCopy: {
    ...typography.title3,
    color: 'rgba(255,255,255,0.92)',
    marginTop: spacing.base,
  },
  authCard: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: radius['3xl'],
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  cardTitle: {
    ...typography.title2,
    color: colors.text.primary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  fieldInput: {
    flex: 1,
    ...typography.body2,
    color: colors.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  rememberWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.dark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  metaAction: {
    ...typography.captionBold,
    color: colors.primary.main,
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  dividerText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  socialButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  googleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleText: {
    ...typography.body2Bold,
    color: '#EA4335',
  },
  socialLabel: {
    ...typography.body2Bold,
    color: colors.text.primary,
  },
  switchText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  switchTextStrong: {
    ...typography.captionBold,
    color: colors.primary.main,
  },
});
