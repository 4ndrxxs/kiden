import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// ─── Types ───────────────────────────────

export interface DailyRecord {
  id: string;
  recordedAt: string;
  weight: number | null;
  systolic: number | null;
  diastolic: number | null;
  mood: number | null;
  fatigue: number | null;
  memo: string;
}

export interface DialysisRecord {
  id: string;
  recordedAt: string;
  preWeight: number | null;
  postWeight: number | null;
  ultrafiltration: number | null;
  memo: string;
}

export interface MealRecord {
  id: string;
  recordedAt: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  photoUrl: string | null;
  calories: number | null;
  potassiumMg: number | null;
  phosphorusMg: number | null;
  sodiumMg: number | null;
  proteinG: number | null;
  analyzed: boolean;
}

export interface WaterEntry {
  id: string;
  amountMl: number;
  recordedAt: string;
}

// ─── Store ───────────────────────────────

interface HealthState {
  dailyRecords: DailyRecord[];
  dialysisRecords: DialysisRecord[];
  mealRecords: MealRecord[];
  waterEntries: WaterEntry[];
  isLoading: boolean;

  fetchTodayData: () => Promise<void>;
  fetchRecords: (days?: number) => Promise<void>;

  addDailyRecord: (record: Omit<DailyRecord, 'id'>) => Promise<void>;
  addDialysisRecord: (record: Omit<DialysisRecord, 'id' | 'ultrafiltration'>) => Promise<void>;
  addMealRecord: (record: Omit<MealRecord, 'id' | 'analyzed'>) => Promise<void>;
  addWaterEntry: (amountMl: number) => Promise<void>;

  getTodayWater: () => number;
  getTodayNutrients: () => { potassium: number; phosphorus: number; sodium: number; protein: number; calories: number };
  getLatestRecord: () => DailyRecord | null;
  getRecordsByDateRange: (startDate: string, endDate: string) => DailyRecord[];
}

const today = () => new Date().toISOString().split('T')[0];

export const useHealthStore = create<HealthState>((set, get) => ({
  dailyRecords: [],
  dialysisRecords: [],
  mealRecords: [],
  waterEntries: [],
  isLoading: false,

  fetchTodayData: async () => {
    set({ isLoading: true });
    const todayStr = today();
    const startOfDay = `${todayStr}T00:00:00`;
    const endOfDay = `${todayStr}T23:59:59`;

    const [dailyRes, dialysisRes, mealRes, waterRes] = await Promise.all([
      supabase.from('daily_records').select('*').eq('recorded_at', todayStr).order('created_at', { ascending: false }),
      supabase.from('dialysis_records').select('*').eq('recorded_at', todayStr).order('created_at', { ascending: false }),
      supabase.from('meal_records').select('*').eq('recorded_at', todayStr).order('created_at', { ascending: false }),
      supabase.from('water_entries').select('*').gte('recorded_at', startOfDay).lte('recorded_at', endOfDay).order('recorded_at', { ascending: false }),
    ]);

    set({
      dailyRecords: (dailyRes.data ?? []).map(mapDailyRecord),
      dialysisRecords: (dialysisRes.data ?? []).map(mapDialysisRecord),
      mealRecords: (mealRes.data ?? []).map(mapMealRecord),
      waterEntries: (waterRes.data ?? []).map(mapWaterEntry),
      isLoading: false,
    });
  },

  fetchRecords: async (days = 7) => {
    set({ isLoading: true });
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startStr = startDate.toISOString().split('T')[0];

    const [dailyRes, dialysisRes, mealRes, waterRes] = await Promise.all([
      supabase.from('daily_records').select('*').gte('recorded_at', startStr).order('recorded_at', { ascending: false }),
      supabase.from('dialysis_records').select('*').gte('recorded_at', startStr).order('recorded_at', { ascending: false }),
      supabase.from('meal_records').select('*').gte('recorded_at', startStr).order('recorded_at', { ascending: false }),
      supabase.from('water_entries').select('*').gte('recorded_at', startStr).order('recorded_at', { ascending: false }),
    ]);

    set({
      dailyRecords: (dailyRes.data ?? []).map(mapDailyRecord),
      dialysisRecords: (dialysisRes.data ?? []).map(mapDialysisRecord),
      mealRecords: (mealRes.data ?? []).map(mapMealRecord),
      waterEntries: (waterRes.data ?? []).map(mapWaterEntry),
      isLoading: false,
    });
  },

  addDailyRecord: async (record) => {
    const { data, error } = await supabase
      .from('daily_records')
      .insert({
        recorded_at: record.recordedAt,
        weight: record.weight,
        systolic: record.systolic,
        diastolic: record.diastolic,
        mood: record.mood,
        fatigue: record.fatigue,
        memo: record.memo,
      })
      .select()
      .single();

    if (!error && data) {
      set((s) => ({ dailyRecords: [mapDailyRecord(data), ...s.dailyRecords] }));
    }
  },

  addDialysisRecord: async (record) => {
    const { data, error } = await supabase
      .from('dialysis_records')
      .insert({
        recorded_at: record.recordedAt,
        pre_weight: record.preWeight,
        post_weight: record.postWeight,
        memo: record.memo,
      })
      .select()
      .single();

    if (!error && data) {
      set((s) => ({ dialysisRecords: [mapDialysisRecord(data), ...s.dialysisRecords] }));
    }
  },

  addMealRecord: async (record) => {
    const { data, error } = await supabase
      .from('meal_records')
      .insert({
        recorded_at: record.recordedAt,
        meal_type: record.mealType,
        description: record.description,
        photo_url: record.photoUrl,
        calories: record.calories,
        potassium_mg: record.potassiumMg,
        phosphorus_mg: record.phosphorusMg,
        sodium_mg: record.sodiumMg,
        protein_g: record.proteinG,
      })
      .select()
      .single();

    if (!error && data) {
      set((s) => ({ mealRecords: [mapMealRecord(data), ...s.mealRecords] }));
    }
  },

  addWaterEntry: async (amountMl) => {
    const { data, error } = await supabase
      .from('water_entries')
      .insert({ amount_ml: amountMl })
      .select()
      .single();

    if (!error && data) {
      set((s) => ({ waterEntries: [mapWaterEntry(data), ...s.waterEntries] }));
    }
  },

  getTodayWater: () => {
    const todayStr = today();
    return get()
      .waterEntries.filter((e) => e.recordedAt.startsWith(todayStr))
      .reduce((sum, e) => sum + e.amountMl, 0);
  },

  getTodayNutrients: () => {
    const todayStr = today();
    const meals = get().mealRecords.filter((m) => m.recordedAt === todayStr);
    return {
      potassium: meals.reduce((s, m) => s + (m.potassiumMg ?? 0), 0),
      phosphorus: meals.reduce((s, m) => s + (m.phosphorusMg ?? 0), 0),
      sodium: meals.reduce((s, m) => s + (m.sodiumMg ?? 0), 0),
      protein: meals.reduce((s, m) => s + (m.proteinG ?? 0), 0),
      calories: meals.reduce((s, m) => s + (m.calories ?? 0), 0),
    };
  },

  getLatestRecord: () => get().dailyRecords[0] ?? null,

  getRecordsByDateRange: (startDate, endDate) =>
    get().dailyRecords.filter((r) => r.recordedAt >= startDate && r.recordedAt <= endDate),
}));

// ─── DB → App 매핑 ──────────────────────

function mapDailyRecord(row: Record<string, unknown>): DailyRecord {
  return {
    id: row.id as string,
    recordedAt: row.recorded_at as string,
    weight: row.weight as number | null,
    systolic: row.systolic as number | null,
    diastolic: row.diastolic as number | null,
    mood: row.mood as number | null,
    fatigue: row.fatigue as number | null,
    memo: (row.memo as string) ?? '',
  };
}

function mapDialysisRecord(row: Record<string, unknown>): DialysisRecord {
  return {
    id: row.id as string,
    recordedAt: row.recorded_at as string,
    preWeight: row.pre_weight as number | null,
    postWeight: row.post_weight as number | null,
    ultrafiltration: row.ultrafiltration as number | null,
    memo: (row.memo as string) ?? '',
  };
}

function mapMealRecord(row: Record<string, unknown>): MealRecord {
  return {
    id: row.id as string,
    recordedAt: row.recorded_at as string,
    mealType: row.meal_type as MealRecord['mealType'],
    description: (row.description as string) ?? '',
    photoUrl: row.photo_url as string | null,
    calories: row.calories as number | null,
    potassiumMg: row.potassium_mg as number | null,
    phosphorusMg: row.phosphorus_mg as number | null,
    sodiumMg: row.sodium_mg as number | null,
    proteinG: row.protein_g as number | null,
    analyzed: (row.analyzed as boolean) ?? false,
  };
}

function mapWaterEntry(row: Record<string, unknown>): WaterEntry {
  return {
    id: row.id as string,
    amountMl: row.amount_ml as number,
    recordedAt: row.recorded_at as string,
  };
}
