import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { DEFAULT_HEALTH_SETTINGS } from '../config/constants';
import type { Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  displayName: string;
  role: 'patient' | 'caregiver';
  diagnosis: string;
  dialysisDays: number[];
  idealBodyWeight: number | null;
  hospitalName: string;
  dialysisTime: string;
  notes: string;
}

export interface HealthSettings {
  waterLimitMl: number;
  potassiumLimitMg: number;
  phosphorusLimitMg: number;
  sodiumLimitMg: number;
  notifyDialysis: boolean;
  notifyMedication: boolean;
  notifyWater: boolean;
  aiServerUrl: string;
}

interface UserState {
  session: Session | null;
  profile: Profile | null;
  settings: HealthSettings;
  isLoading: boolean;

  initialize: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateSettings: (updates: Partial<HealthSettings>) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  session: null,
  profile: null,
  settings: {
    waterLimitMl: DEFAULT_HEALTH_SETTINGS.waterLimitMl,
    potassiumLimitMg: DEFAULT_HEALTH_SETTINGS.potassiumLimitMg,
    phosphorusLimitMg: DEFAULT_HEALTH_SETTINGS.phosphorusLimitMg,
    sodiumLimitMg: DEFAULT_HEALTH_SETTINGS.sodiumLimitMg,
    notifyDialysis: true,
    notifyMedication: true,
    notifyWater: false,
    aiServerUrl: '',
  },
  isLoading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session) {
        get().fetchProfile();
        get().fetchSettings();
      } else {
        set({ profile: null });
      }
    });

    if (session) {
      await Promise.all([get().fetchProfile(), get().fetchSettings()]);
    }
    set({ isLoading: false });
  },

  fetchProfile: async () => {
    const userId = get().session?.user?.id;
    if (!userId) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      set({
        profile: {
          id: data.id,
          displayName: data.display_name ?? '',
          role: data.role,
          diagnosis: data.diagnosis ?? '',
          dialysisDays: Array.isArray(data.dialysis_days) ? data.dialysis_days : [],
          idealBodyWeight: data.ideal_body_weight,
          hospitalName: data.hospital_name ?? '',
          dialysisTime: data.dialysis_time ?? '',
          notes: data.notes ?? '',
        },
      });
    }
  },

  fetchSettings: async () => {
    const userId = get().session?.user?.id;
    if (!userId) return;

    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      set({
        settings: {
          waterLimitMl: data.water_limit_ml,
          potassiumLimitMg: data.potassium_limit_mg,
          phosphorusLimitMg: data.phosphorus_limit_mg,
          sodiumLimitMg: data.sodium_limit_mg,
          notifyDialysis: data.notify_dialysis,
          notifyMedication: data.notify_medication,
          notifyWater: data.notify_water,
          aiServerUrl: data.ai_server_url ?? '',
        },
      });
    }
  },

  updateProfile: async (updates) => {
    const userId = get().session?.user?.id;
    if (!userId) return;

    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.diagnosis !== undefined) dbUpdates.diagnosis = updates.diagnosis;
    if (updates.dialysisDays !== undefined) dbUpdates.dialysis_days = updates.dialysisDays;
    if (updates.idealBodyWeight !== undefined) dbUpdates.ideal_body_weight = updates.idealBodyWeight;
    if (updates.hospitalName !== undefined) dbUpdates.hospital_name = updates.hospitalName;
    if (updates.dialysisTime !== undefined) dbUpdates.dialysis_time = updates.dialysisTime;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId);

    if (!error) {
      set({ profile: { ...get().profile!, ...updates } });
    }
  },

  updateSettings: async (updates) => {
    const userId = get().session?.user?.id;
    if (!userId) return;

    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.waterLimitMl !== undefined) dbUpdates.water_limit_ml = updates.waterLimitMl;
    if (updates.potassiumLimitMg !== undefined) dbUpdates.potassium_limit_mg = updates.potassiumLimitMg;
    if (updates.phosphorusLimitMg !== undefined) dbUpdates.phosphorus_limit_mg = updates.phosphorusLimitMg;
    if (updates.sodiumLimitMg !== undefined) dbUpdates.sodium_limit_mg = updates.sodiumLimitMg;
    if (updates.notifyDialysis !== undefined) dbUpdates.notify_dialysis = updates.notifyDialysis;
    if (updates.notifyMedication !== undefined) dbUpdates.notify_medication = updates.notifyMedication;
    if (updates.notifyWater !== undefined) dbUpdates.notify_water = updates.notifyWater;
    if (updates.aiServerUrl !== undefined) dbUpdates.ai_server_url = updates.aiServerUrl;

    const { error } = await supabase
      .from('user_settings')
      .update(dbUpdates)
      .eq('user_id', userId);

    if (!error) {
      set({ settings: { ...get().settings, ...updates } });
    }
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },

  signUp: async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: 'kiden://auth/callback',
      },
    });
    if (error) return { error: error.message };

    // 이메일 확인이 꺼져 있으면 signUp 직후 session 발급, 바로 로그인됨
    // 이메일 확인이 켜져 있으면 session null → 수동 signIn 시도
    if (!data.session) {
      const signInResult = await supabase.auth.signInWithPassword({ email, password });
      if (signInResult.error) {
        return {
          error:
            '가입은 완료되었지만 로그인할 수 없습니다. 이메일 확인 메일을 확인하거나, 관리자에게 문의해 주세요.',
        };
      }
    }
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
}));
