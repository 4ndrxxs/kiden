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
          displayName: data.display_name,
          role: data.role,
          diagnosis: data.diagnosis ?? '',
          dialysisDays: data.dialysis_days ?? DEFAULT_HEALTH_SETTINGS.dialysisDays,
          idealBodyWeight: data.ideal_body_weight,
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
}));
