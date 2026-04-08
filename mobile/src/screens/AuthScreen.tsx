import React, { useState } from 'react';
import {
  StyleSheet, View, Text, KeyboardAvoidingView, Platform, Pressable, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { GlassCard, GradientButton, LargeInput } from '../components/common';
import { useUserStore } from '../stores/userStore';

type Mode = 'login' | 'signup';

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithEmail, signUp } = useUserStore();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    if (mode === 'signup' && !displayName.trim()) return;

    setLoading(true);
    const { error } =
      mode === 'login'
        ? await signInWithEmail(email.trim(), password)
        : await signUp(email.trim(), password, displayName.trim());
    setLoading(false);

    if (error) {
      Alert.alert(
        mode === 'login' ? '로그인 실패' : '가입 실패',
        error,
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#E8F5F5', colors.background]}
        style={[styles.gradient, { paddingTop: insets.top + 40 }]}
      >
        {/* 로고 */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💚</Text>
          </View>
          <Text style={styles.logoTitle}>키든</Text>
          <Text style={styles.logoSub}>투석 환자를 위한 건강 관리</Text>
        </View>

        {/* 폼 */}
        <GlassCard style={styles.formCard}>
          {mode === 'signup' && (
            <LargeInput
              label="이름"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="환자 이름"
            />
          )}
          <LargeInput
            label="이메일"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <LargeInput
            label="비밀번호"
            value={password}
            onChangeText={setPassword}
            placeholder="6자 이상"
            secureTextEntry
          />

          <GradientButton
            title={loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitBtn}
          />
        </GlassCard>

        {/* 모드 전환 */}
        <Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          <Text style={styles.switchText}>
            {mode === 'login'
              ? '계정이 없으신가요? 회원가입'
              : '이미 계정이 있으신가요? 로그인'}
          </Text>
        </Pressable>
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
    paddingHorizontal: spacing.lg,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  logoEmoji: {
    fontSize: 36,
  },
  logoTitle: {
    ...typography.title1,
    color: colors.primary.main,
    fontSize: 32,
  },
  logoSub: {
    ...typography.body2,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  formCard: {
    gap: spacing.base,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  switchText: {
    ...typography.body2,
    color: colors.primary.main,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
});
