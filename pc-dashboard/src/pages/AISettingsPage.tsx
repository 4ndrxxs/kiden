import { useState } from 'react';
import { Save, RotateCcw, Plus, ToggleLeft, ToggleRight, Send } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const presets = [
  { id: 'health', name: '\uAC74\uAC15 \uC0C1\uB2F4', active: true },
  { id: 'diet', name: '\uC2DD\uB2E8 \uBD84\uC11D', active: false },
  { id: 'emotion', name: '\uAC10\uC815 \uC9C0\uC9C0', active: false },
];

const contextSlots = [
  { name: '\uD658\uC790 \uAE30\uBCF8 \uD504\uB85C\uD544', enabled: true, autoUpdate: false },
  { name: '\uCD5C\uADFC 7\uC77C \uAC74\uAC15 \uAE30\uB85D', enabled: true, autoUpdate: true },
  { name: '\uC2DD\uC774 \uC81C\uD55C \uAE30\uC900', enabled: true, autoUpdate: false },
  { name: '\uAE08\uC9C0 \uD589\uB3D9 \uADDC\uCE59', enabled: true, autoUpdate: false },
  { name: '\uCEE4\uC2A4\uD140 \uC9C0\uCE68', enabled: false, autoUpdate: false },
];

const defaultSystemPrompt = `\uB2F9\uC2E0\uC740 \uD22C\uC11D \uD658\uC790 \uC804\uC6A9 \uAC74\uAC15 \uB3C4\uC6B0\uBBF8\uC785\uB2C8\uB2E4.

[\uD658\uC790 \uD504\uB85C\uD544]
- IGA \uC2E0\uC99D 20\uB144\uCC28, \uD608\uC561\uD22C\uC11D \uC8FC 3\uD68C (\uC6D4/\uC218/\uAE08)
- 1\uB144 \uC804 \uD22C\uBA85\uC2E0\uC138\uD3EC\uC554 3\uAE30 \uC2E0\uC7A5 \uC81C\uAC70\uC220
- \uD55C\uCABD \uC2E0\uC7A5 \uC794\uC874, \uC18C\uBCC0\uB7C9 \uC218\uC220 \uC804 \uB300\uBE44 \uC57D 1/10

[\uADDC\uCE59]
1. \uC808\uB300 \uC9C4\uB2E8\uD558\uAC70\uB098 \uCC98\uBC29\uD558\uC9C0 \uB9C8\uC138\uC694.
2. \uD22C\uC11D \uD658\uC790 \uC2DD\uC774 \uAE30\uC900\uC5D0 \uAE30\uBC18\uD574 \uB2F5\uBCC0\uD558\uC138\uC694.
3. \uC751\uAE09 \uC99D\uC0C1 \uAC10\uC9C0 \uC2DC \uC989\uC2DC 119 \uC548\uB0B4\uD558\uC138\uC694.
4. \uD55C\uAD6D\uC5B4\uB85C \uB2F5\uBCC0\uD558\uACE0, \uC26C\uC6B4 \uB9D0\uB85C \uC124\uBA85\uD558\uC138\uC694.
5. \uD658\uC790\uC758 \uAC10\uC815\uC744 \uC874\uC911\uD558\uC138\uC694.`;

export function AISettingsPage() {
  const [activePreset, setActivePreset] = useState('health');
  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt);
  const [temperature, setTemperature] = useState(0.2);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(512);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>AI {'\uC124\uC815'}</h1>

      <div style={styles.grid}>
        {/* 시스템 프롬프트 에디터 */}
        <GlassCard title={'\uC2DC\uC2A4\uD15C \uD504\uB86C\uD504\uD2B8'}>
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
              <button style={styles.iconBtn} title={'\uD14C\uC2A4\uD2B8 \uC804\uC1A1'}>
                <Send size={16} />
              </button>
              <button style={styles.iconBtn} title={'\uB418\uB3CC\uB9AC\uAE30'}>
                <RotateCcw size={16} />
              </button>
              <button style={{ ...styles.iconBtn, ...styles.saveBtn }} title={'\uC800\uC7A5'}>
                <Save size={16} />
                {'\uC800\uC7A5'}
              </button>
            </div>
          </div>

          <textarea
            style={styles.editor}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            spellCheck={false}
          />
          <div style={styles.editorHint}>
            {'\uBCC0\uC218'}: {'{{patient_name}}'}, {'{{today_date}}'}, {'{{recent_records}}'}
          </div>
        </GlassCard>

        {/* 컨텍스트 슬롯 */}
        <GlassCard title={'\uCEE8\uD14D\uC2A4\uD2B8 \uC2AC\uB86F'}>
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
                    <span style={styles.autoTag}>{'\uC790\uB3D9 \uC5C5\uB370\uC774\uD2B8'}</span>
                  )}
                </div>
              </div>
            ))}
            <button style={styles.addSlotBtn}>
              <Plus size={16} />
              {'\uC2AC\uB86F \uCD94\uAC00'}
            </button>
          </div>
        </GlassCard>
      </div>

      {/* 파라미터 */}
      <GlassCard title={'\uC0DD\uC131 \uD30C\uB77C\uBBF8\uD130'}>
        <div style={styles.paramGrid}>
          <div style={styles.paramRow}>
            <span style={styles.paramLabel}>Temperature</span>
            <input
              type="range" min="0" max="1" step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.paramValue}>{temperature}</span>
          </div>
          <div style={styles.paramRow}>
            <span style={styles.paramLabel}>Top P</span>
            <input
              type="range" min="0" max="1" step="0.05"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.paramValue}>{topP}</span>
          </div>
          <div style={styles.paramRow}>
            <span style={styles.paramLabel}>Max Tokens</span>
            <input
              type="range" min="128" max="2048" step="128"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.paramValue}>{maxTokens}</span>
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
