import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;

  fetchMessages: (limit?: number) => Promise<void>;
  sendMessage: (content: string, aiServerUrl?: string) => Promise<void>;
  clearMessages: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,

  fetchMessages: async (limit = 50) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (data) {
      set({ messages: data.map(mapMessage) });
    }
  },

  sendMessage: async (content, aiServerUrl) => {
    // 1) 유저 메시지 저장
    const { data: userMsg } = await supabase
      .from('chat_messages')
      .insert({ role: 'user', content })
      .select()
      .single();

    if (userMsg) {
      set((s) => ({ messages: [...s.messages, mapMessage(userMsg)] }));
    }

    // 2) AI 응답 요청
    set({ isLoading: true });

    let aiReply = '';
    try {
      if (aiServerUrl) {
        const res = await fetch(`${aiServerUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            history: get().messages.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });
        const json = await res.json();
        aiReply = json.reply ?? json.response ?? json.content ?? '';
      }
    } catch {
      // AI 서버 연결 실패
    }

    if (!aiReply) {
      aiReply = 'AI 서버에 연결할 수 없습니다. 설정에서 서버 주소를 확인해주세요.';
    }

    // 3) AI 응답 저장
    const { data: assistantMsg } = await supabase
      .from('chat_messages')
      .insert({ role: 'assistant', content: aiReply })
      .select()
      .single();

    if (assistantMsg) {
      set((s) => ({
        messages: [...s.messages, mapMessage(assistantMsg)],
        isLoading: false,
      }));
    } else {
      set({ isLoading: false });
    }
  },

  clearMessages: async () => {
    await supabase.from('chat_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    set({ messages: [] });
  },
}));

function mapMessage(row: Record<string, unknown>): ChatMessage {
  return {
    id: row.id as string,
    role: row.role as ChatMessage['role'],
    content: row.content as string,
    createdAt: row.created_at as string,
  };
}
