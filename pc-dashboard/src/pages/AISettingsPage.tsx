import { useState } from 'react';
import { Save, RotateCcw, Plus, ToggleLeft, ToggleRight, Send } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const presets = [
  { id: 'health', name: '건강 상담', active: true },
  { id: 'diet', name: '식단 분석', active: false },
  { id: 'emotion', name: '감정 지지', active: false },
];

const contextSlots = [
  { name: '환자 기본 프로필', enabled: true, autoUpdate: false },
  { name: '최근 7일 건강 기록', enabled: true, autoUpdate: true },
  { name: '식이 제한 기준', enabled: true, autoUpdate: false },
  { name: '금지 행동 규칙', enabled: true, autoUpdate: false },
  { name: '커스텀 지침', enabled: false, autoUpdate: false },
];

export function AISettingsPage() {
  const [activePreset, setActivePreset] = useState('health');

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>AI 설정</h1>

      <div style={styles.grid}>
        {/* 시스템 프롬프트 에디터 */}
        <GlassCard title="시스템 프롬프트">
          <div style={styles.editorToolbar}>
            <div style={styles.presetTabs}>
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePreset(p.id)}
                  style={{
                    ...styles.presetTab,
                    ...(activePreset === p.id ? styles.presetTabActive : {}),
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div style={styles.editorActions}>
              <button style={styles.iconBtn} title="테스트 전송">
                <Send size={16} />
              </button>
              <button style={styles.iconBtn} title="되돌리기">
                <RotateCcw size={16} />
              </button>
              <button style={{ ...styles.iconBtn, ...styles.saveBtn }} title="저장">
                <Save size={16} />
                저장
              </button>
            </div>
          </div>

          <textarea
            style={styles.editor}
            defaultValue={`당신은 투석 환자 전용 건강 도우미입니다.

[환자 프로필]
- IGA 신증 20년차, 혈액투석 주 3회 (월/수/금)
- 1년 전 투명신세포암 3기 신장 제거술
- 한쪽 신장 잔존, 소변량 수술 전 대비 약 1/10

[규칙]
1. 절대 진단하거나 처방하지 마세요.
2. 투석 환자 식이 기준에 기반해 답변하세요.
3. 응급 증상 감지 시 즉시 119 안내하세요.
4. 한국어로 답변하고, 쉬운 말로 설명하세요.
5. 환자의 감정을 존중하세요.`}
            spellCheck={false}
          />
          <div style={styles.editorHint}>
            변수: {'{{patient_name}}'}, {'{{today_date}}'}, {'{{recent_records}}'}
          </div>
        </GlassCard>

        {/* 컨텍스트 슬롯 */}
        <GlassCard title="컨텍스트 슬롯">
          <div style={styles.slotList}>
            {contextSlots.map((slot) => (
              <div key={slot.name} style={styles.slotItem}>
                <button style={styles.toggleBtn}>
                  {slot.enabled
                    ? <ToggleRight size={20} color="var(--primary)" />
                    : <ToggleLeft size={20} color="var(--text-disabled)" />
                  }
                </button>
                <div style={styles.slotInfo}>
                  <span style={styles.slotName}>{slot.name}</span>
                  {slot.autoUpdate && (
                    <span style={styles.autoTag}>자동 업데이트</span>
                  )}
                </div>
              </div>
            ))}
            <button style={styles.addSlotBtn}>
              <Plus size={16} />
              슬롯 추가
            </button>
          </div>
        </GlassCard>
      </div>

      {/* 파라미터 */}
      <GlassCard title="생성 파라미터">
        <div style={styles.paramGrid}>
          <div style={styles.paramRow}>
            <span style={styles.paramLabel}>Temperature</span>
            <input type="range" min="0" max="1" step="0.1" defaultValue="0.2" style={styles.slider} />
            <span style={styles.paramValue}>0.2</span>
          </div>
          <div style={styles.paramRow}>
            <span style={styles.paramLabel}>Top P</span>
            <input type="range" min="0" max="1" step="0.05" defaultValue="0.9" style={styles.slider} />
            <span style={styles.paramValue}>0.9</span>
          </div>
          <div style={styles.paramRow}>
            <span style={styles.paramLabel}>Max Tokens</span>
            <input type="range" min="128" max="2048" step="128" defaultValue="512" style={styles.slider} />
            <span style={styles.paramValue}>512</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 },
  editorToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' as const, gap: 8 },
  presetTabs: { display: 'flex', gap: 4 },
  presetTab: {
    padding: '6px 14px', borderRadius: 999, border: '1px solid var(--border)',
    background: 'var(--bg)', fontSize: 12, fontWeight: 500,
    color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
  },
  presetTabActive: {
    background: 'var(--primary)', color: '#FFF', borderColor: 'var(--primary)',
  },
  editorActions: { display: 'flex', gap: 8 },
  iconBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 10px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: '#FFF',
    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
  },
  saveBtn: {
    background: 'var(--primary)', color: '#FFF', borderColor: 'var(--primary)',
  },
  editor: {
    width: '100%', minHeight: 280, padding: 16,
    borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
    background: 'var(--bg)', fontFamily: "'Pretendard', monospace",
    fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)',
    resize: 'vertical' as const, outline: 'none',
  },
  editorHint: { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 },
  slotList: { display: 'flex', flexDirection: 'column', gap: 8 },
  slotItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' },
  toggleBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' },
  slotInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  slotName: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' },
  autoTag: {
    fontSize: 10, fontWeight: 600, color: 'var(--primary)',
    background: 'var(--primary-bg)', padding: '2px 6px',
    borderRadius: 4, alignSelf: 'flex-start',
  },
  addSlotBtn: {
    display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
    padding: '10px', borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border)', background: 'transparent',
    color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
  },
  paramGrid: { display: 'flex', flexDirection: 'column', gap: 16 },
  paramRow: { display: 'flex', alignItems: 'center', gap: 12 },
  paramLabel: { fontSize: 13, color: 'var(--text-secondary)', width: 100 },
  slider: { flex: 1, accentColor: 'var(--primary)' },
  paramValue: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', width: 40, textAlign: 'right' as const },
};
