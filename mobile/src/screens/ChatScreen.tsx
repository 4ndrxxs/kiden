import React, { useEffect, useRef, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { getQuickPrompts } from '../design/data';
import { EmptyState, SurfaceCard } from '../design/system';
import { useChatStore, type ChatMessage } from '../stores/chatStore';
import { useUserStore } from '../stores/userStore';

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <LinearGradient
          colors={[...colors.primary.gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userBubble}
        >
          <Text style={styles.userBubbleText}>{message.content}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.assistantRow}>
      <View style={styles.assistantIcon}>
        <Ionicons name="sparkles" size={14} color={colors.primary.main} />
      </View>
      <SurfaceCard style={styles.assistantBubble}>
        <Text style={styles.assistantBubbleText}>{message.content}</Text>
      </SurfaceCard>
    </View>
  );
}

export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { messages, fetchMessages, isLoading, sendMessage } = useChatStore();
  const aiServerUrl = useUserStore((state) => state.settings.aiServerUrl);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const quickPrompts = getQuickPrompts();
  const isConnected = aiServerUrl.trim().length > 0;
  const hasMessages = messages.length > 0;

  const handleSend = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || isLoading) return;

    if (!isConnected) {
      Alert.alert('AI 서버 미연결', '설정에서 AI 서버 주소를 먼저 등록해 주세요.');
      return;
    }

    setInput('');
    await sendMessage(text, aiServerUrl);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View
        style={[
          styles.inner,
          {
            paddingTop: insets.top + spacing.base,
            paddingBottom: Math.max(insets.bottom, spacing.base),
          },
        ]}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>키든 AI</Text>
            <Text style={styles.headerSubtitle}>투석 환자의 건강한 일상을 함께 관리하는 AI 상담사</Text>
          </View>
          <View style={[styles.onlineBadge, !isConnected && styles.offlineBadge]}>
            <View style={[styles.onlineDot, !isConnected && styles.offlineDot]} />
            <Text style={[styles.onlineText, !isConnected && styles.offlineText]}>
              {isConnected ? '온라인' : '미연결'}
            </Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.messageContent,
            !hasMessages && styles.messageContentEmpty,
          ]}
          onContentSizeChange={() => {
            if (hasMessages) scrollRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {hasMessages ? (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          ) : (
            <EmptyState
              icon="sparkles-outline"
              title={isConnected ? '무엇을 도와드릴까요?' : 'AI 서버에 연결해 주세요'}
              description={
                isConnected
                  ? '투석·식단·증상에 대해 편하게 물어보세요.\n기록 데이터를 참고해서 답변해 드려요.'
                  : '설정 > AI 서버 연결에서 주소를 등록하면 AI와 대화할 수 있어요.'
              }
            />
          )}
          {isLoading ? (
            <View style={styles.assistantRow}>
              <View style={styles.assistantIcon}>
                <Ionicons name="sparkles" size={14} color={colors.primary.main} />
              </View>
              <SurfaceCard style={styles.assistantBubble}>
                <Text style={styles.assistantBubbleText}>답변을 준비하고 있어요...</Text>
              </SurfaceCard>
            </View>
          ) : null}
        </ScrollView>

        {!hasMessages && isConnected ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPromptRow}
          >
            {quickPrompts.map((prompt) => (
              <Pressable
                key={prompt}
                onPress={() => handleSend(prompt)}
                style={({ pressed }) => [styles.quickPrompt, { opacity: pressed ? 0.88 : 1 }]}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.inputWrap}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={isConnected ? '메시지를 입력하세요...' : 'AI 서버 연결 후 사용 가능'}
            placeholderTextColor={colors.text.disabled}
            editable={isConnected && !isLoading}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={!isConnected || !input.trim() || isLoading}
            style={({ pressed }) => [
              styles.sendButton,
              (!isConnected || !input.trim()) && { opacity: 0.4 },
              { opacity: pressed ? 0.88 : undefined },
            ]}
          >
            <Ionicons name="paper-plane" size={18} color={colors.primary.main} />
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
  inner: {
    flex: 1,
    paddingHorizontal: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.base,
    marginBottom: spacing.base,
  },
  headerTitle: {
    ...typography.title1,
    color: colors.text.primary,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: 4,
    maxWidth: 260,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.status.safeBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  offlineBadge: {
    backgroundColor: colors.surfaceMuted,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.safe,
  },
  offlineDot: {
    backgroundColor: colors.text.tertiary,
  },
  onlineText: {
    ...typography.captionBold,
    color: colors.status.safe,
  },
  offlineText: {
    color: colors.text.tertiary,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    gap: spacing.base,
    paddingVertical: spacing.base,
  },
  messageContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  assistantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  assistantBubble: {
    flexShrink: 1,
    maxWidth: '82%',
    padding: spacing.base,
  },
  assistantBubbleText: {
    ...typography.body2,
    color: colors.text.primary,
  },
  userRow: {
    alignItems: 'flex-end',
  },
  userBubble: {
    maxWidth: '76%',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  userBubbleText: {
    ...typography.body2,
    color: colors.white,
  },
  quickPromptRow: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  quickPrompt: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary.bg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  quickPromptText: {
    ...typography.captionBold,
    color: colors.primary.main,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingLeft: spacing.base,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body2,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
