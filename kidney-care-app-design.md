# 🏥 Kiden (키든) — 설계 문서

> **프로젝트명**: Kiden (키든)
> **작성일**: 2026-04-08
> **버전**: v1.0 Draft
> **작성자**: Juwon

---

## 1. 프로젝트 개요

### 1.1 배경
- **환자**: 아버지 (IGA 신증 20년차, 투석 중)
- **현재 상태**:
  - 매주 월/수/금 혈액투석 진행 중
  - 1년 전 투명신세포암(Clear Cell RCC) 3기 — 신장 제거술 시행
  - 현재 한쪽 신장만 잔존, 소변량 수술 전 대비 약 1/10
  - 악화 증상: 피로감, 우울증, 부종, 찌르는 듯한 통증, 불면증

### 1.2 목적
투석 환자의 일상 건강 데이터를 체계적으로 기록하고, 가족이 실시간 모니터링하며, 로컬 AI가 식단 판단 및 건강 상담을 제공하는 Android 앱.

### 1.3 사용자
| 역할 | 설명 | 권한 |
|------|------|------|
| **환자 (아버지)** | 주 사용자. 데이터 입력, AI 상담 | 전체 읽기/쓰기 |
| **가족** | 모니터링, 알림 수신 | 읽기 + 긴급 알림 수신 |

---

## 2. 기술 스택

### 2.1 클라이언트
| 항목 | 선택 | 이유 |
|------|------|------|
| **프레임워크** | React Native | UI 자유도 높음, 풍부한 애니메이션 라이브러리 |
| **UI 라이브러리** | React Native Paper + 커스텀 컴포넌트 | Material Design 3 기반, 한국어 접근성 |
| **상태관리** | Zustand | 가볍고 직관적 |
| **네비게이션** | React Navigation v7 | 탭 + 스택 혼합 구조 |
| **차트** | react-native-gifted-charts | 건강 데이터 시각화 |
| **알림** | Notifee (로컬) + FCM (원격) | 투석 리마인더 + 가족 긴급 알림 |
| **언어** | 한국어 단일 | i18n 불필요 |

### 2.2 백엔드 / DB
| 항목 | 선택 | 이유 |
|------|------|------|
| **클라우드 DB** | Supabase (PostgreSQL) | 오픈소스, 실시간 구독, Row Level Security로 가족 권한 분리 |
| **인증** | Supabase Auth (카카오 로그인) | 아버지 편의성 — 카카오 계정으로 간편 로그인 |
| **실시간 동기화** | Supabase Realtime | 가족 대시보드 실시간 반영 |
| **오프라인 캐시** | WatermelonDB | 투석 중 네트워크 불안정 대비 로컬 캐시 → 온라인 복귀 시 자동 Sync |

### 2.3 AI 서버 (로컬)
| 항목 | 선택 | 이유 |
|------|------|------|
| **모델** | Gemma 4 (27B 또는 12B — VRAM에 따라 결정) | 한국어 성능, 의료 상담 품질 |
| **서빙** | vLLM | RTX 5080 (16GB VRAM) 최적화, 연속 배치 처리 |
| **API 형태** | OpenAI-compatible REST API | vLLM 기본 제공, 클라이언트 연동 간편 |
| **접근** | 가정 내 LAN (Tailscale VPN으로 외부 접근 가능) | 데이터 프라이버시 보장 + 외출 시에도 접근 |

```
                        ┌─────────────────────────────┐
                        │      Supabase Cloud          │
                        │  (DB, Auth, Realtime, FCM)   │
                        └──────┬──────────┬────────────┘
                               │          │
                          HTTPS│          │Realtime 구독
                               │          │
                    ┌──────────▼──┐   ┌───▼──────────┐
                    │ Android 앱  │   │  가족 앱      │
                    │ (환자용)     │   │ (모니터링)    │
                    └──────┬──────┘   └──────────────┘
                           │
                    LAN / WireGuard
                    (PC 앱이 터널 관리)
                           │
              ┌────────────▼────────────────┐
              │    🖥️ PC 관리 앱 (Gateway)    │
              │  ┌────────────────────────┐  │
              │  │ FastAPI Proxy Server   │  │
              │  │ (인증, 로깅, 라우팅)     │  │
              │  └───────────┬────────────┘  │
              │              │               │
              │  ┌───────────▼────────────┐  │
              │  │ vLLM (Gemma 4)         │  │
              │  │ GPU: RTX 5080          │  │
              │  └────────────────────────┘  │
              │                              │
              │  ┌────────────────────────┐  │
              │  │ 웹 대시보드 (관리 UI)    │  │
              │  │ localhost:9000          │  │
              │  └────────────────────────┘  │
              └──────────────────────────────┘
```

---

## 3. 핵심 기능 상세

### 3.1 📋 일일 컨디션 기록

**목적**: 투석 전후 및 일상 증상을 간편하게 기록

#### 입력 항목
| 카테고리 | 항목 | 입력 방식 |
|----------|------|-----------|
| **활력징후** | 혈압 (수축/이완), 맥박, 체온, 체중 | 숫자 입력 (큰 키패드) |
| **소변** | 소변량 (mL), 색상 | 슬라이더 + 색상 팔레트 선택 |
| **부종** | 부위 (발목/손/얼굴/전신), 심각도 (1~5) | 신체 일러스트 터치 + 슬라이더 |
| **증상** | 피로감, 통증, 우울감, 불면, 가려움, 메스꺼움 등 | 이모지 기반 선택 (😊~😫) + 자유 메모 |
| **투석 관련** | 투석 전후 체중, 제수량, 혈관접근로 상태 | 투석일(월/수/금) 자동 활성화 |
| **수면** | 수면 시간, 수면의 질 | 시간 피커 + 별점 |

#### UX 설계 원칙
- **큰 터치 영역**: 최소 48dp, 피로한 환자 고려
- **최소 타이핑**: 슬라이더, 선택지, 이모지 중심
- **빠른 기록**: 핵심 3개 항목 (체중, 혈압, 기분)은 홈 화면에서 바로 입력
- **기본값 제공**: 전날 데이터 기반으로 프리필

---

### 3.2 📅 투석 스케줄 & 리마인더

**고정 일정**: 매주 월/수/금

#### 알림 체계
| 시점 | 알림 내용 | 방식 |
|------|-----------|------|
| 투석 전날 밤 | "내일 투석일입니다. 수분/식이 주의" | 푸시 알림 |
| 투석 당일 아침 | "오늘 투석 전 체중을 기록해주세요" | 푸시 + 홈 위젯 배너 |
| 투석 후 | "투석 후 체중과 컨디션을 기록해주세요" | 푸시 알림 (수동 트리거 or 시간 기반) |
| 약 복용 시간 | 처방약 리마인더 (커스텀 설정) | 반복 로컬 알림 |

#### 부가 기능
- 투석 병원 일정 변경 시 수동 조정
- 투석 기록 히스토리 (제수량 트렌드, 건체중 변화 차트)

---

### 3.3 🍚 식단 / 수분 섭취 관리

**핵심**: 투석 환자 식이 제한 — 칼륨(K), 인(P), 나트륨(Na), 수분 제한

#### 기록 방식
1. **사진 촬영** → AI가 음식 인식 + 영양성분 추정
2. **수동 검색** → 한국 음식 DB 기반 (식약처 영양성분 DB 연동)
3. **즐겨찾기** → 자주 먹는 식단 원터치 등록

#### AI 식단 판단 로직
```
[사진 or 텍스트 입력]
       ↓
[ Gemma 4 분석 ]
       ↓
┌──────────────────────────────────┐
│ 🟢 안전: "잡곡밥 + 달걀프라이"     │
│ 🟡 주의: "바나나 — 칼륨 높음"      │
│ 🔴 위험: "참외 — 칼륨 매우 높음"    │
└──────────────────────────────────┘
       ↓
  일일 누적 영양소 대시보드 업데이트
```

#### 일일 제한량 대시보드
| 영양소 | 기본 권장 상한 (투석 환자 기준) | 표시 |
|--------|-------------------------------|------|
| 수분 | 500~700mL + 전일 소변량 | 물잔 아이콘 게이지 |
| 칼륨 | 2,000mg 이하 | 프로그레스 바 |
| 인 | 800~1,000mg 이하 | 프로그레스 바 |
| 나트륨 | 2,000mg 이하 | 프로그레스 바 |
| 단백질 | 1.0~1.2g/kg (투석 환자 상향) | 프로그레스 바 |

> ⚠️ **중요**: 위 수치는 기본값이며, 담당 의사의 처방에 따라 앱 내에서 커스텀 가능해야 함.

---

### 3.4 🤖 AI 건강 상담 (Gemma 4)

#### System Prompt 설계 방향
```
당신은 투석 환자 전용 건강 도우미입니다.

[환자 프로필]
- IGA 신증 20년차, 혈액투석 주 3회 (월/수/금)
- 1년 전 투명신세포암 3기 신장 제거술
- 한쪽 신장 잔존, 소변량 수술 전 대비 약 1/10
- 현재 증상: 피로감, 우울증, 부종, 통증, 불면증

[규칙]
1. 절대 진단하거나 처방하지 마세요. "의사와 상담하세요"를 항상 포함하세요.
2. 투석 환자 식이 기준 (칼륨/인/나트륨/수분 제한)에 기반해 답변하세요.
3. 응급 증상 (흉통, 호흡곤란, 의식저하, 심한 출혈) 감지 시 즉시 119 안내하세요.
4. 한국어로 답변하고, 쉬운 말로 설명하세요.
5. 환자의 감정을 존중하고, 우울감 표현 시 공감 + 전문 상담 권유하세요.
```

#### AI 기능 범위
| 가능 | 불가능 (명확히 거부) |
|------|---------------------|
| 음식 칼륨/인/나트륨 정보 제공 | 약 처방 / 용량 변경 권유 |
| 증상 기록 기반 트렌드 요약 | 진단 ("~병입니다") |
| 투석 전후 주의사항 안내 | 투석 스케줄 변경 권유 |
| 일반적인 생활 습관 조언 | 검사 결과 해석 |
| 감정적 지지 + 전문 상담 연결 | 의료 행위에 해당하는 일체의 판단 |

#### 대화 UX
- 카카오톡 스타일 채팅 인터페이스 (익숙함)
- 빠른 질문 버튼: "오늘 뭐 먹어도 돼?", "부종이 심해졌어", "잠이 안 와"
- 음성 입력 지원 (피로 시 타이핑 어려움 고려)
- 응답 시간: vLLM + RTX 5080 기준 첫 토큰 < 1초 목표

---

## 4. 화면 구조 (Information Architecture)

```
🏠 홈 (대시보드)
├── 오늘의 요약 카드 (체중, 혈압, 기분, 수분 게이지)
├── 빠른 기록 버튼 3개
├── 투석 D-day 배너
└── AI 한마디 ("오늘 날씨가 더우니 수분 주의하세요")

📋 기록 탭
├── 일일 컨디션 기록 폼
├── 투석 기록 (투석일 전용)
├── 식단 기록 (사진 촬영 / 검색 / 즐겨찾기)
├── 수분 섭취 기록 (원터치 +100mL 버튼)
└── 수면 기록

📊 리포트 탭
├── 주간/월간 트렌드 차트
│   ├── 체중 변화 (건체중 기준선 표시)
│   ├── 혈압 추이
│   ├── 증상 빈도 히트맵
│   └── 영양소 섭취 트렌드
└── AI 주간 요약 리포트 (자동 생성)

🤖 AI 상담 탭
├── 채팅 인터페이스
├── 빠른 질문 버튼 목록
└── 식단 사진 분석 (카메라 연동)

👨‍👩‍👦 가족 탭 (가족 계정 전용)
├── 실시간 대시보드 (아버지 오늘 기록 요약)
├── 이상치 알림 히스토리
└── 주간 리포트 열람

⚙️ 설정
├── 프로필 (투석 일정, 건체중, 영양소 상한 커스텀)
├── 알림 설정
├── 가족 초대 / 권한 관리
├── AI 서버 연결 설정 (IP/포트)
└── 데이터 내보내기 (PDF — 병원 제출용)
```

---

## 5. 데이터 모델 (Supabase)

### 주요 테이블

```sql
-- 사용자
users (
  id UUID PK,
  role TEXT,          -- 'patient' | 'family'
  name TEXT,
  created_at TIMESTAMPTZ
)

-- 가족 그룹
family_groups (
  id UUID PK,
  patient_id UUID FK → users,
  member_id UUID FK → users,
  permission TEXT     -- 'read' | 'admin'
)

-- 일일 기록
daily_records (
  id UUID PK,
  user_id UUID FK → users,
  date DATE,
  weight DECIMAL,
  bp_systolic INT,
  bp_diastolic INT,
  pulse INT,
  temperature DECIMAL,
  urine_volume INT,        -- mL
  urine_color TEXT,
  edema_level INT,         -- 1~5
  edema_areas TEXT[],      -- ['ankle','face',...]
  fatigue INT,             -- 1~5
  pain INT,                -- 1~5
  pain_description TEXT,
  mood INT,                -- 1~5
  sleep_hours DECIMAL,
  sleep_quality INT,       -- 1~5
  memo TEXT,
  created_at TIMESTAMPTZ
)

-- 투석 기록
dialysis_records (
  id UUID PK,
  user_id UUID FK → users,
  date DATE,
  pre_weight DECIMAL,
  post_weight DECIMAL,
  ultrafiltration DECIMAL,  -- 제수량 (L)
  access_status TEXT,       -- 혈관접근로 상태
  complications TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ
)

-- 식단 기록
meal_records (
  id UUID PK,
  user_id UUID FK → users,
  date DATE,
  meal_type TEXT,           -- 'breakfast'|'lunch'|'dinner'|'snack'
  photo_url TEXT,
  food_items JSONB,         -- [{name, amount, K, P, Na, protein, calories}]
  ai_analysis TEXT,
  risk_level TEXT,          -- 'safe'|'caution'|'danger'
  created_at TIMESTAMPTZ
)

-- 수분 섭취
water_intake (
  id UUID PK,
  user_id UUID FK → users,
  date DATE,
  amount_ml INT,
  created_at TIMESTAMPTZ
)

-- AI 대화 로그
ai_conversations (
  id UUID PK,
  user_id UUID FK → users,
  messages JSONB,           -- [{role, content, timestamp}]
  created_at TIMESTAMPTZ
)

-- 알림 설정
notification_settings (
  id UUID PK,
  user_id UUID FK → users,
  type TEXT,
  time TIME,
  days INT[],               -- [1,3,5] = 월수금
  enabled BOOLEAN,
  message TEXT
)
```

### Row Level Security (RLS)
- 환자: 본인 데이터 전체 CRUD
- 가족: `family_groups`에 등록된 `patient_id`의 데이터 READ only
- 가족 알림: Supabase Edge Function → FCM으로 이상치 발생 시 푸시

---

## 6. 이상치 감지 & 긴급 알림

### 자동 감지 기준 (커스텀 가능)
| 항목 | 위험 기준 | 알림 대상 |
|------|-----------|-----------|
| 수축기 혈압 | > 180 또는 < 90 | 환자 + 가족 |
| 체중 증가 | 투석 간 > 3kg 증가 | 환자 + 가족 |
| 소변량 | 24h < 50mL (급감) | 가족 |
| 부종 | 심각도 5 | 가족 |
| 기분 | 연속 3일 최저점 | 가족 (우울증 주의) |
| 수분 섭취 | 일일 상한 초과 | 환자 즉시 경고 |

### 긴급 증상 (AI가 감지 시)
흉통, 호흡곤란, 의식 저하, 심한 출혈, 40도 이상 발열 → **119 전화 버튼 즉시 표시 + 가족 긴급 알림**

---

## 7. 🖥️ PC 관리 앱 (AI Gateway & Control Center)

> **관리자**: Juwon 전용
> **역할**: vLLM 프로세스 관리, AI 요청 프록시, 로깅, 시스템 프롬프트 편집, 네트워크 터널 관리

### 7.1 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| **언어** | Python 3.11+ | vLLM과 동일 환경, 의존성 최소화 |
| **프록시 서버** | FastAPI + Uvicorn | 비동기, 가볍고, OpenAI-compatible 프록시 구현 간편 |
| **관리 대시보드** | FastAPI에서 정적 파일 서빙 (React SPA) | 별도 프레임워크 불필요, `localhost:9000`에서 브라우저로 접근 |
| **시스템 트레이** | pystray + Pillow | 백그라운드 실행, 트레이 아이콘에서 빠른 제어 |
| **프로세스 관리** | subprocess + psutil | vLLM 프로세스 시작/종료/상태 모니터링 |
| **외부 접근 터널** | WireGuard (내장 관리) | Tailscale 대체, PC 앱이 직접 터널 on/off 제어 |
| **로컬 DB** | SQLite | 로그, 설정, 프롬프트 버전 관리 저장 |
| **설정 파일** | YAML | 사람이 읽기 쉬운 설정 포맷 |

### 7.2 핵심 기능

#### A. vLLM 엔진 제어

| 기능 | 설명 |
|------|------|
| **시작 / 중지 / 재시작** | 원클릭으로 vLLM 프로세스 관리 |
| **모델 전환** | Gemma 4 12B ↔ 27B 전환 (드롭다운 선택 → 재시작) |
| **GPU 모니터링** | VRAM 사용량, GPU 온도, 사용률 실시간 표시 (nvidia-smi 파싱) |
| **자동 시작** | PC 부팅 시 자동 실행 옵션 (시스템 서비스 등록) |
| **헬스체크** | 30초 주기로 vLLM `/health` 엔드포인트 핑 → 죽으면 자동 재시작 |
| **리소스 제한** | `--gpu-memory-utilization`, `--max-model-len` 등 파라미터 UI 조정 |

#### B. AI 프록시 서버 (FastAPI)

Android 앱은 vLLM에 직접 접근하지 않고, **PC 앱의 프록시를 통해서만** 통신.

```
Android 앱 → [PC 프록시 :9001] → [vLLM :8000]
                  │
                  ├── API 키 인증 (앱 ↔ PC 간)
                  ├── Rate Limiting (분당 요청 제한)
                  ├── 시스템 프롬프트 자동 주입
                  ├── 요청/응답 로깅
                  ├── 금지어 필터링
                  └── 토큰 사용량 카운팅
```

**프록시 엔드포인트**:
```
POST /v1/chat/completions     ← Android 앱이 호출
GET  /v1/health               ← 앱에서 서버 상태 확인
GET  /v1/stats                ← 토큰 사용량, 요청 수 등
```

프록시가 하는 일:
1. Android 앱 요청 수신
2. 헤더에서 API 키 검증 (단순 Bearer 토큰, PC 앱에서 생성/관리)
3. 활성화된 시스템 프롬프트를 `messages[0]`에 자동 삽입
4. 활성화된 컨텍스트 (환자 프로필, 최근 기록 요약)를 시스템 프롬프트에 병합
5. vLLM으로 포워딩
6. 응답을 로깅 후 Android 앱에 스트리밍 반환

#### C. 시스템 프롬프트 & 역할 관리

대시보드에서 AI의 행동을 세밀하게 제어.

| 항목 | 설명 |
|------|------|
| **역할 프리셋** | 복수의 역할 프리셋 저장/전환 가능 |
| **시스템 프롬프트 에디터** | 코드 에디터 스타일 (구문 강조, 변수 템플릿 지원) |
| **프롬프트 변수** | `{{patient_name}}`, `{{today_date}}`, `{{recent_records}}` 등 동적 변수 지원 |
| **프롬프트 버전 관리** | 수정 시마다 자동 버전 저장 (Git-like diff 비교 가능) |
| **테스트 콘솔** | 대시보드에서 바로 프롬프트 테스트 (실제 vLLM 호출) |
| **컨텍스트 슬롯** | 아래 표 참조 |

**컨텍스트 슬롯 구조**:
```yaml
context_slots:
  - name: "환자 기본 프로필"
    enabled: true
    auto_update: false
    content: |
      환자: 남성, IGA 신증 20년차...
    
  - name: "최근 7일 건강 기록 요약"
    enabled: true
    auto_update: true          # Supabase에서 자동 pull
    source: "supabase:daily_records:last_7_days"
    
  - name: "식이 제한 기준"
    enabled: true
    auto_update: false
    content: |
      칼륨 2000mg 이하, 인 800mg 이하...
      
  - name: "금지 행동 규칙"
    enabled: true
    auto_update: false
    content: |
      절대 진단하지 마라. 약 용량 변경 권유 금지...
      
  - name: "커스텀 지침"
    enabled: true
    auto_update: false
    content: |
      (Juwon이 자유롭게 추가하는 영역)
```

각 슬롯은 **개별 on/off** 가능 → 프롬프트를 모듈식으로 조합.

#### D. 로깅 & 모니터링

| 로그 종류 | 내용 | 보존 기간 |
|-----------|------|-----------|
| **요청 로그** | 타임스탬프, 사용자, 입력 메시지, 응답, 토큰 수, 지연 시간 | 90일 |
| **시스템 로그** | vLLM 시작/종료, 에러, 크래시, 재시작 이벤트 | 90일 |
| **프롬프트 변경 로그** | 누가 언제 어떤 프롬프트를 수정했는지 (diff 포함) | 영구 |
| **GPU 메트릭** | VRAM, 온도, 사용률 (1분 간격 샘플링) | 30일 |
| **보안 로그** | 인증 실패, 비정상 요청 패턴 | 90일 |

**대시보드 로그 뷰어**:
- 실시간 스트리밍 로그 (터미널 스타일)
- 필터: 날짜, 로그 레벨, 키워드 검색
- 특정 대화 전체 맥락 보기 (세션 ID로 그룹핑)

#### E. 네트워크 & 접근 관리

| 기능 | 설명 |
|------|------|
| **WireGuard 터널 관리** | on/off 토글, 외부 접근 허용/차단 |
| **접근 허용 IP** | 화이트리스트 기반 (LAN 기본 허용, 외부는 WireGuard만) |
| **API 키 관리** | 키 생성/폐기/갱신, Android 앱용 키와 테스트용 키 분리 |
| **포트 설정** | 프록시 포트 (기본 9001), 대시보드 포트 (기본 9000) |
| **DDNS 연동** | 공유기 IP 변경 대비, DDNS 도메인 자동 갱신 (선택) |
| **연결 상태** | Android 앱 연결 상태 실시간 표시 (마지막 요청 시간, 지연) |

#### F. 안전장치 & 필터링

| 기능 | 설명 |
|------|------|
| **금지어 필터** | AI 응답에 특정 키워드 포함 시 차단/수정 (예: 구체적 약물 용량) |
| **응답 길이 제한** | max_tokens 상한 설정 |
| **Temperature 제한** | 의료 상담은 낮은 temperature 강제 (0.1~0.3) |
| **Fallback 응답** | vLLM 다운 시 Android 앱에 "AI 서버 점검 중" 안내 반환 |
| **비상 정지** | 대시보드 & 트레이에서 원클릭으로 모든 AI 응답 즉시 중단 |

### 7.3 PC 앱 화면 구조

```
🖥️ 시스템 트레이 아이콘
├── 🟢 서버 상태 표시 (녹색/빨강)
├── 시작 / 중지
├── 대시보드 열기 → 브라우저 localhost:9000
└── 종료

🌐 웹 대시보드 (localhost:9000)
├── 📊 홈 — 한눈에 보기
│   ├── vLLM 상태 (Running / Stopped / Error)
│   ├── GPU 상태 바 (VRAM, 온도)
│   ├── 오늘 요청 수 / 평균 응답 시간
│   ├── WireGuard 터널 상태
│   └── 최근 요청 5개 미리보기
│
├── 🤖 AI 설정
│   ├── 시스템 프롬프트 에디터
│   │   ├── 코드 에디터 (Monaco Editor)
│   │   ├── 변수 자동완성 ({{...}})
│   │   ├── 버전 히스토리 (되돌리기)
│   │   └── 테스트 전송 버튼
│   ├── 컨텍스트 슬롯 관리
│   │   ├── 슬롯별 on/off 토글
│   │   ├── 자동 업데이트 소스 설정
│   │   └── 슬롯 추가/삭제/순서 변경
│   ├── 역할 프리셋
│   │   ├── 프리셋 목록 (건강 상담 / 식단 분석 / 감정 지지)
│   │   └── 프리셋별 프롬프트 + 파라미터 묶음
│   └── 파라미터
│       ├── temperature, top_p, max_tokens
│       ├── 모델 선택 (12B / 27B)
│       └── 컨텍스트 길이
│
├── 📋 로그
│   ├── 실시간 로그 스트림
│   ├── 요청/응답 상세 보기
│   ├── 필터 (날짜, 레벨, 키워드)
│   └── CSV 내보내기
│
├── 🌐 네트워크
│   ├── WireGuard on/off
│   ├── API 키 관리
│   ├── 접근 IP 화이트리스트
│   ├── 포트 설정
│   └── 연결된 디바이스 목록
│
├── 🔧 엔진
│   ├── vLLM 시작/중지/재시작
│   ├── GPU 모니터링 차트 (실시간)
│   ├── 모델 관리 (다운로드, 삭제, 전환)
│   ├── 자동 시작 설정
│   └── 헬스체크 간격 설정
│
└── ⚙️ 시스템 설정
    ├── 대시보드 비밀번호
    ├── 로그 보존 기간
    ├── 백업/복원 (설정 + 프롬프트 + 로그)
    ├── Supabase 연결 설정 (컨텍스트 자동 pull용)
    └── 알림 설정 (에러 시 카카오톡/이메일 알림 to Juwon)
```

### 7.4 설정 파일 구조 (YAML)

```yaml
# config.yaml
server:
  proxy_port: 9001
  dashboard_port: 9000
  dashboard_password: "<bcrypt hash>"
  
vllm:
  model: "google/gemma-4-12b"
  host: "127.0.0.1"
  port: 8000
  gpu_memory_utilization: 0.9
  max_model_len: 8192
  auto_start: true
  health_check_interval: 30  # seconds
  auto_restart_on_crash: true

network:
  wireguard:
    enabled: false
    config_path: "/etc/wireguard/wg0.conf"
  allowed_ips:
    - "192.168.0.0/24"    # LAN
  ddns:
    enabled: false
    domain: ""
    provider: ""

auth:
  api_keys:
    - name: "android-app"
      key: "<generated>"
      active: true
    - name: "test"
      key: "<generated>"
      active: true

ai:
  active_preset: "health-counselor"
  default_temperature: 0.2
  default_max_tokens: 512
  blocked_keywords: ["처방합니다", "mg 복용"]

supabase:
  url: "https://xxx.supabase.co"
  service_key: "<key>"
  auto_pull_interval: 3600  # 1시간마다 최근 기록 pull

logging:
  request_retention_days: 90
  system_retention_days: 90
  gpu_retention_days: 30
  prompt_history: "permanent"
```

### 7.5 Android 앱 ↔ PC 앱 통신 흐름

```
1. Android 앱 시작 시
   → GET /v1/health (PC 프록시)
   → 200 OK → AI 기능 활성화
   → 타임아웃 → "AI 서버 연결 불가" 표시 (나머지 기능은 정상 작동)

2. 사용자가 AI에게 질문
   → POST /v1/chat/completions
   → Header: Authorization: Bearer <api-key>
   → PC 프록시가:
      a. 인증 확인
      b. 시스템 프롬프트 + 활성 컨텍스트 슬롯 조합
      c. messages 앞에 삽입
      d. vLLM에 포워딩 (stream: true)
      e. 스트리밍 응답을 Android 앱에 중계
      f. 완료 후 로그 저장

3. 식단 사진 분석
   → POST /v1/chat/completions
   → content: [image_base64, "이 음식 먹어도 돼?"]
   → 동일 파이프라인 (Gemma 4 multimodal 지원 시)
   → 미지원 시: Android 앱에서 별도 경량 모델로 음식 인식 → 텍스트로 변환 → AI에 전달
```

---

## 8. UX 디자인 가이드라인

### 디자인 원칙
1. **큰 글씨, 큰 버튼**: 기본 폰트 18sp, 버튼 최소 56dp 높이
2. **고대비 색상**: 시력 저하 고려, WCAG AA 이상
3. **최소 뎁스**: 핵심 기능 2탭 이내 도달
4. **긍정적 톤**: "오늘도 잘 기록했어요 💪" 같은 격려 메시지
5. **카카오톡 친숙함**: AI 채팅 UI를 카카오톡 스타일로

### 컬러 팔레트 (제안)
| 용도 | 색상 | 코드 |
|------|------|------|
| Primary | 차분한 틸 블루 | `#2B8A8E` |
| Secondary | 따뜻한 산호색 | `#E8836B` |
| Background | 부드러운 아이보리 | `#FAF7F2` |
| Surface | 화이트 | `#FFFFFF` |
| 안전 (🟢) | 소프트 그린 | `#4CAF82` |
| 주의 (🟡) | 소프트 옐로우 | `#F5B942` |
| 위험 (🔴) | 소프트 레드 | `#E85D5D` |
| 텍스트 | 다크 그레이 | `#2D2D2D` |

### 폰트
- **본문**: Pretendard (한국어 최적화 산세리프)
- **강조/숫자**: Pretendard Bold
- **AI 채팅**: 본문과 동일, 말풍선 구분으로 시각적 차별화

---

## 9. 개발 우선순위 (단계별)

### Phase 1 — PC 앱 + Android MVP (5주)
- [ ] **[PC]** FastAPI 프록시 서버 + vLLM 프로세스 관리
- [ ] **[PC]** 시스템 트레이 앱 (pystray)
- [ ] **[PC]** 기본 웹 대시보드 (시작/중지, 상태 표시, 로그 뷰어)
- [ ] **[Android]** 프로젝트 셋업 (React Native + Supabase)
- [ ] **[Android]** 카카오 로그인
- [ ] **[Android]** 일일 컨디션 기록 (체중, 혈압, 기분)
- [ ] **[Android]** 투석 스케줄 알림
- [ ] **[Android]** 홈 대시보드
- [ ] **[연동]** Android → PC 프록시 LAN 통신 확인

### Phase 2 — AI 연동 + 식단 (4주)
- [ ] **[PC]** 시스템 프롬프트 에디터 + 컨텍스트 슬롯 관리
- [ ] **[PC]** 프롬프트 버전 관리 + 테스트 콘솔
- [ ] **[PC]** 요청/응답 로깅 + 로그 뷰어
- [ ] **[Android]** AI 채팅 연동 (프록시 경유)
- [ ] **[Android]** 식단 기록 (수동 검색)
- [ ] **[Android]** 수분 섭취 트래커
- [ ] **[Android]** 영양소 대시보드

### Phase 3 — 가족 + 네트워크 (3주)
- [ ] **[PC]** WireGuard 터널 관리 + API 키 관리
- [ ] **[PC]** GPU 모니터링 차트
- [ ] **[PC]** Supabase 연동 (컨텍스트 자동 pull)
- [ ] **[Android]** 가족 계정 + 실시간 모니터링
- [ ] **[Android]** 이상치 감지 + 긴급 알림
- [ ] **[Android]** 사진 기반 음식 인식 (AI)
- [ ] **[Android]** 주간/월간 리포트 차트

### Phase 4 — 완성도 (3주)
- [ ] **[PC]** 역할 프리셋 관리 + 안전장치/필터링
- [ ] **[PC]** 설정 백업/복원, 에러 시 Juwon에게 알림
- [ ] **[Android]** 오프라인 모드 (WatermelonDB)
- [ ] **[Android]** 음성 입력
- [ ] **[Android]** 데이터 PDF 내보내기 (병원 제출)
- [ ] **[전체]** 통합 테스트 + 버그 수정

---

## 10. 리스크 & 고려사항

| 리스크 | 대응 |
|--------|------|
| AI 할루시네이션 (잘못된 영양 정보) | 식약처 DB 크로스체크 + "의사와 상담" 필수 문구 |
| 집 PC 꺼짐 → AI 불가 | PC 앱 Fallback 응답 + Android 앱 기본 영양 DB로 대체 |
| 의료법 이슈 | AI는 정보 제공만, 진단/처방 절대 금지 (PC 앱에서 필터링 강제) |
| 아버지 사용 포기 | 온보딩 최소화, 하루 1분 기록 목표, 격려 UX |
| VRAM 부족 (27B 모델) | 12B Q8부터 시작, PC 앱에서 모델 전환 원클릭 |
| PC 앱 보안 (외부 노출) | WireGuard + API 키 + IP 화이트리스트 3중 방어 |
| vLLM 크래시 | PC 앱 헬스체크 → 자동 재시작 + Juwon에게 알림 |
| 프롬프트 실수로 위험한 응답 | 금지어 필터 + 프롬프트 버전 관리로 롤백 가능 |

---

## 11. 열린 질문 (결정 필요)

1. **앱 이름**: ✅ 확정 — **Kiden (키든)** / PC 앱: Kiden Server (or Kiden Console)
2. **식약처 영양 DB**: 공공 API 사용 vs 로컬 DB 임베딩
3. **투석 병원 연동**: 현재 단계에선 수동 기록, 추후 EMR 연동 가능성?
4. **약 복용 관리**: 별도 기능으로 추가할지 여부
5. **Gemma 4 12B vs 27B**: 한국어 의료 상담 품질 벤치마크 후 결정
6. **WireGuard vs ZeroTier**: 외부 터널 방식 최종 선택
7. **PC 대시보드 프론트**: React SPA vs 경량 대안 (Svelte, Preact)
8. **Gemma 4 multimodal 지원 여부**: 식단 사진 분석 파이프라인 결정에 영향

---

*이 문서는 설계 초안입니다. 구현 전 Juwon의 컨펌이 필요합니다.*
