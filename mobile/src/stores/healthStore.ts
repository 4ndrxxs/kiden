import { create } from 'zustand';

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weight?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  pulse?: number;
  temperature?: number;
  urineVolume?: number;
  urineColor?: string;
  edemaLevel?: number; // 1~5
  edemaAreas?: string[];
  fatigue?: number; // 1~5
  pain?: number; // 1~5
  painDescription?: string;
  mood?: number; // 1~5
  sleepHours?: number;
  sleepQuality?: number; // 1~5
  memo?: string;
}

export interface DialysisRecord {
  id: string;
  date: string;
  preWeight?: number;
  postWeight?: number;
  ultrafiltration?: number;
  accessStatus?: string;
  complications?: string;
  memo?: string;
}

export interface MealRecord {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  photoUri?: string;
  foodItems: FoodItem[];
  aiAnalysis?: string;
  riskLevel?: 'safe' | 'caution' | 'danger';
}

export interface FoodItem {
  name: string;
  amount?: string;
  potassium?: number; // mg
  phosphorus?: number; // mg
  sodium?: number; // mg
  protein?: number; // g
  calories?: number;
}

export interface WaterEntry {
  id: string;
  date: string;
  amountMl: number;
  timestamp: string;
}

interface HealthState {
  dailyRecords: DailyRecord[];
  dialysisRecords: DialysisRecord[];
  mealRecords: MealRecord[];
  waterEntries: WaterEntry[];

  addDailyRecord: (record: DailyRecord) => void;
  addDialysisRecord: (record: DialysisRecord) => void;
  addMealRecord: (record: MealRecord) => void;
  addWaterEntry: (entry: WaterEntry) => void;

  getTodayWater: () => number;
  getTodayNutrients: () => { potassium: number; phosphorus: number; sodium: number; protein: number };
  getLatestRecord: () => DailyRecord | undefined;
}

const today = () => new Date().toISOString().split('T')[0];

export const useHealthStore = create<HealthState>((set, get) => ({
  dailyRecords: [],
  dialysisRecords: [],
  mealRecords: [],
  waterEntries: [],

  addDailyRecord: (record) =>
    set((s) => ({ dailyRecords: [record, ...s.dailyRecords] })),

  addDialysisRecord: (record) =>
    set((s) => ({ dialysisRecords: [record, ...s.dialysisRecords] })),

  addMealRecord: (record) =>
    set((s) => ({ mealRecords: [record, ...s.mealRecords] })),

  addWaterEntry: (entry) =>
    set((s) => ({ waterEntries: [entry, ...s.waterEntries] })),

  getTodayWater: () => {
    const d = today();
    return get()
      .waterEntries.filter((e) => e.date === d)
      .reduce((sum, e) => sum + e.amountMl, 0);
  },

  getTodayNutrients: () => {
    const d = today();
    const meals = get().mealRecords.filter((m) => m.date === d);
    return meals.reduce(
      (acc, meal) => {
        meal.foodItems.forEach((item) => {
          acc.potassium += item.potassium ?? 0;
          acc.phosphorus += item.phosphorus ?? 0;
          acc.sodium += item.sodium ?? 0;
          acc.protein += item.protein ?? 0;
        });
        return acc;
      },
      { potassium: 0, phosphorus: 0, sodium: 0, protein: 0 },
    );
  },

  getLatestRecord: () => get().dailyRecords[0],
}));
