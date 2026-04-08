import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius, touchTarget } from '../theme/spacing';
import { useChatStore, ChatMessage } from '../stores/chatStore';
import { useUserStore } from '../stores/userStore';
import { QUICK_QUESTIONS } from '../config/constants';

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';

  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🤖</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
          {msg.content}
        </Text>
      </View>
    </View>
  );
}

export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { messages, isLoading, sendMessage, fetchMessages } = useChatStore();
  const aiServerUrl = useUserStore((s) => s.settings.aiServerUrl);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSend = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || isLoading) return;
    setInput('');
    await sendMessage(content, aiServerUrl);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Text style={{ fontSize: 20 }}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>키든 AI</Text>
            <View style={styles.statusRow}>
              <View style={[
                styles.statusDot,
                { backgroundColor: colors.status.safe },
              ]} />
              <Text style={styles.statusText}>대기 중</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 메시지 영역 */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={[...colors.primary.gradient] as [string, string, ...string[]]}
              style={styles.emptyIcon}
            >
              <Ionicons name="chatbubble-ellipses" size={32} color={colors.white} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>건강 상담을 시작하세요</Text>
            <Text style={styles.emptySubtitle}>
              식단, 증상, 생활 습관에 대해{'\n'}궁금한 것을 물어보세요
            </Text>
          </View>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {isLoading && (
          <View style={[styles.bubbleRow]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🤖</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleAI]}>
              <Text style={styles.typingDots}>●●●</Text>
            </View>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* 빠른 질문 */}
      {messages.length === 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRow}
        >
          {QUICK_QUESTIONS.map((q) => (
            <Pressable
              key={q}
              onPress={() => handleSend(q)}
              style={({ pressed }) => [
                styles.quickBtn,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.quickText}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* 입력 바 */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            placeholderTextColor={colors.text.disabled}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={() => handleSend()}
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            disabled={!input.trim()}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={input.trim() ? colors.white : colors.text.disabled}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.body1Bold,
    color: colors.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...typography.label,
    color: colors.text.tertiary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.title3,
    color: colors.text.primary,
  },
  emptySubtitle: {
    ...typography.body2,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  bubbleRowUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
  },
  bubbleUser: {
    backgroundColor: colors.primary.main,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.border.light,
  },
  bubbleText: {
    ...typography.body2,
    color: colors.text.primary,
  },
  bubbleTextUser: {
    color: colors.white,
  },
  typingDots: {
    ...typography.body2,
    color: colors.text.disabled,
    letterSpacing: 4,
  },
  quickRow: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  quickBtn: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  quickText: {
    ...typography.captionBold,
    color: colors.primary.main,
  },
  inputBar: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 0.5,
    borderTopColor: colors.border.light,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    paddingLeft: spacing.base,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    ...typography.body2,
    color: colors.text.primary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.border.light,
  },
});
