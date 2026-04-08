// ═══════════════════════════════════════════
//  Kiden — UI 상수 (하드코딩 제거)
// ═══════════════════════════════════════════

/** 기분 이모지 (1~5 단계) */
export const MOOD_EMOJIS = ['😫', '😞', '😐', '🙂', '😊'] as const;

/** 피로도 이모지 (1~5 단계) */
export const FATIGUE_EMOJIS = ['😴', '🥱', '😐', '💪', '🔥'] as const;

/** 기분 라벨 */
export const MOOD_LABELS = ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'] as const;

/** 피로도 라벨 */
export const FATIGUE_LABELS = ['매우 피곤', '피곤', '보통', '괜찮음', '활력'] as const;

/** 식사 유형 */
export const MEAL_TYPES = [
  { key: 'breakfast', label: '아침', icon: '🌅', time: '07:00 ~ 09:00' },
  { key: 'lunch', label: '점심', icon: '☀️', time: '12:00 ~ 14:00' },
  { key: 'dinner', label: '저녁', icon: '🌙', time: '18:00 ~ 20:00' },
  { key: 'snack', label: '간식', icon: '🍪', time: '기타' },
] as const;

/** 수분 퀵 추가 프리셋 */
export const WATER_PRESETS = [
  { amount: 50, label: '한 모금', icon: '💧' },
  { amount: 100, label: '반 컵', icon: '🥛' },
  { amount: 200, label: '한 컵', icon: '🥤' },
  { amount: 500, label: '큰 컵', icon: '🫗' },
] as const;

/** AI 빠른 질문 프리셋 */
export const QUICK_QUESTIONS = [
  '오늘 뭐 먹어도 돼?',
  '부종이 심해졌어',
  '잠이 안 와',
  '투석 후 어지러워',
  '칼륨 높은 음식이 뭐야?',
] as const;

/** 투석 한외여과량 경고 임계값 (L) */
export const ULTRAFILTRATION_WARNING_THRESHOLD = 3;

/** 요일 매핑 (0=일, 1=월, ..., 6=토) */
export const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 식단 입력 방법 */
export const MEAL_INPUT_METHODS = [
  { key: 'camera', label: '사진 촬영', icon: 'camera' },
  { key: 'search', label: '음식 검색', icon: 'search' },
  { key: 'favorites', label: '즐겨찾기', icon: 'heart' },
] as const;

/** 기본 건강 설정 (Supabase에서 못 가져올 때 폴백) */
export const DEFAULT_HEALTH_SETTINGS = {
  waterLimitMl: 700,
  potassiumLimitMg: 2000,
  phosphorusLimitMg: 1000,
  sodiumLimitMg: 2000,
  dialysisDays: [1, 3, 5], // 월, 수, 금
  idealBodyWeight: 65.5,
} as const;
