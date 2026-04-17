import { DAY_LABELS, MOOD_LABELS, QUICK_QUESTIONS } from '../config/constants';
import type { DailyRecord, WaterEntry } from '../stores/healthStore';
import type { HealthSettings, Profile } from '../stores/userStore';

// ─── Empty/Display Helpers (no mock data) ────────────────────────

export interface DisplayProfile {
  displayName: string;
  diagnosis: string;
  dialysisDays: number[];
  idealBodyWeight: number | null;
  hospitalName: string;
  dialysisTime: string;
}

export function getDisplayProfile(profile: Profile | null | undefined): DisplayProfile {
  return {
    displayName: profile?.displayName?.trim() || '사용자',
    diagnosis: profile?.diagnosis?.trim() || '',
    dialysisDays: profile?.dialysisDays?.length ? profile.dialysisDays : [],
    idealBodyWeight: profile?.idealBodyWeight ?? null,
    hospitalName: (profile as Profile & { hospitalName?: string })?.hospitalName ?? '',
    dialysisTime: (profile as Profile & { dialysisTime?: string })?.dialysisTime ?? '',
  };
}

export interface DailySummary {
  weight: number | null;
  systolic: number | null;
  diastolic: number | null;
  mood: number | null;
  moodText: string;
  weightDelta: number | null;
  bpStatus: 'safe' | 'caution' | 'danger' | 'unknown';
  bpStatusLabel: string;
}

export function getDailySummary(
  latest: DailyRecord | null | undefined,
  _settings: HealthSettings,
  idealWeight: number | null,
): DailySummary {
  const weight = latest?.weight ?? null;
  const systolic = latest?.systolic ?? null;
  const diastolic = latest?.diastolic ?? null;
  const mood = latest?.mood ?? null;
  const moodText = mood ? MOOD_LABELS[mood - 1] ?? '' : '기록 없음';

  const weightDelta =
    weight != null && idealWeight != null ? Number((weight - idealWeight).toFixed(1)) : null;

  const bpStatus = evaluateBloodPressure(systolic, diastolic);

  return {
    weight,
    systolic,
    diastolic,
    mood,
    moodText,
    weightDelta,
    bpStatus,
    bpStatusLabel: bpStatusToLabel(bpStatus),
  };
}

export function evaluateBloodPressure(
  systolic: number | null,
  diastolic: number | null,
): 'safe' | 'caution' | 'danger' | 'unknown' {
  if (systolic == null || diastolic == null) return 'unknown';
  if (systolic >= 160 || diastolic >= 100 || systolic < 90 || diastolic < 60) return 'danger';
  if (systolic >= 140 || diastolic >= 90) return 'caution';
  return 'safe';
}

function bpStatusToLabel(status: 'safe' | 'caution' | 'danger' | 'unknown'): string {
  switch (status) {
    case 'safe':
      return '정상';
    case 'caution':
      return '주의';
    case 'danger':
      return '위험';
    default:
      return '미입력';
  }
}

export interface NutrientGauge {
  label: string;
  current: number;
  max: number;
  unit: string;
  color: string;
  percent: number;
}

export const NUTRIENT_COLORS = {
  water: '#6A7DFF',
  potassium: '#61C48C',
  phosphorus: '#FF718C',
  sodium: '#FFB367',
} as const;

export function getHomeNutrients(
  water: number,
  nutrients: { potassium: number; phosphorus: number; sodium: number },
  settings: HealthSettings,
): NutrientGauge[] {
  const items: NutrientGauge[] = [
    {
      label: '수분',
      current: water,
      max: Math.max(settings.waterLimitMl, 1),
      unit: 'mL',
      color: NUTRIENT_COLORS.water,
      percent: 0,
    },
    {
      label: '칼륨',
      current: nutrients.potassium,
      max: Math.max(settings.potassiumLimitMg, 1),
      unit: 'mg',
      color: NUTRIENT_COLORS.potassium,
      percent: 0,
    },
    {
      label: '인',
      current: nutrients.phosphorus,
      max: Math.max(settings.phosphorusLimitMg, 1),
      unit: 'mg',
      color: NUTRIENT_COLORS.phosphorus,
      percent: 0,
    },
    {
      label: '나트륨',
      current: nutrients.sodium,
      max: Math.max(settings.sodiumLimitMg, 1),
      unit: 'mg',
      color: NUTRIENT_COLORS.sodium,
      percent: 0,
    },
  ];
  return items.map((item) => ({
    ...item,
    percent: Math.min(100, Math.round((item.current / item.max) * 100)),
  }));
}

export interface NextDialysisInfo {
  countdown: string;
  dateLabel: string;
  dayLabel: string;
  timeLabel: string;
  hasSchedule: boolean;
}

export function getNextDialysis(
  dialysisDays: number[],
  defaultTimeLabel = '시간 미설정',
): NextDialysisInfo {
  if (!dialysisDays || dialysisDays.length === 0) {
    return {
      countdown: '미설정',
      dateLabel: '',
      dayLabel: '',
      timeLabel: defaultTimeLabel,
      hasSchedule: false,
    };
  }

  const now = new Date();
  const day = now.getDay();
  for (let offset = 0; offset < 8; offset += 1) {
    const nextDay = (day + offset) % 7;
    if (dialysisDays.includes(nextDay)) {
      const date = new Date(now);
      date.setDate(now.getDate() + offset);
      return {
        countdown: offset === 0 ? 'D-DAY' : `D-${offset}`,
        dateLabel: formatCompactDate(date),
        dayLabel: DAY_LABELS[nextDay],
        timeLabel: defaultTimeLabel,
        hasSchedule: true,
      };
    }
  }

  return {
    countdown: '미설정',
    dateLabel: '',
    dayLabel: '',
    timeLabel: defaultTimeLabel,
    hasSchedule: false,
  };
}

export function formatKoreanDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = DAY_LABELS[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

export function formatCompactDate(date = new Date()): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatTimeLabel(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export interface ReportSeries {
  labels: string[];
  weights: number[];
  systolic: number[];
  diastolic: number[];
  hasData: boolean;
}

export function getReportSeries(records: DailyRecord[], days: number): ReportSeries {
  const sorted = [...records]
    .filter((record) => record.weight != null || record.systolic != null)
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .slice(-days);

  if (sorted.length === 0) {
    return { labels: [], weights: [], systolic: [], diastolic: [], hasData: false };
  }

  return {
    labels: sorted.map((item) => item.recordedAt.slice(5).replace('-', '/')),
    weights: sorted.map((item) => item.weight ?? 0),
    systolic: sorted.map((item) => item.systolic ?? 0),
    diastolic: sorted.map((item) => item.diastolic ?? 0),
    hasData: true,
  };
}

export function getQuickPrompts() {
  return QUICK_QUESTIONS;
}

/** 오늘 기록 진행률: daily, dialysis, meal, water 중 몇 개 입력했는지 */
export interface ChecklistStatus {
  daily: boolean;
  dialysis: boolean;
  meal: boolean;
  water: boolean;
  completedCount: number;
  totalCount: number;
}

export function getTodayChecklist(args: {
  hasDailyToday: boolean;
  hasDialysisToday: boolean;
  hasMealToday: boolean;
  hasWaterToday: boolean;
  isDialysisDay: boolean;
}): ChecklistStatus {
  const items = [args.hasDailyToday, args.hasMealToday, args.hasWaterToday];
  if (args.isDialysisDay) items.push(args.hasDialysisToday);
  const completedCount = items.filter(Boolean).length;
  return {
    daily: args.hasDailyToday,
    dialysis: args.hasDialysisToday,
    meal: args.hasMealToday,
    water: args.hasWaterToday,
    completedCount,
    totalCount: items.length,
  };
}

/** 영양소 비율 (mg → 일일 상한 대비 %) */
export function nutrientPercent(current: number, max: number): { percent: number; status: 'safe' | 'caution' | 'danger' } {
  const percent = max > 0 ? Math.round((current / max) * 100) : 0;
  if (percent >= 100) return { percent, status: 'danger' };
  if (percent >= 80) return { percent, status: 'caution' };
  return { percent, status: 'safe' };
}

/** 식단 입력 시 사용할 기본 음식 카테고리 */
export const FOOD_CATEGORIES = [
  '밥/면',
  '국/찌개',
  '반찬',
  '고기/생선',
  '채소',
  '과일',
  '간식/디저트',
  '음료',
  '기타',
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export function getDisplayWaterEntries(entries: WaterEntry[]): WaterEntry[] {
  return entries;
}
