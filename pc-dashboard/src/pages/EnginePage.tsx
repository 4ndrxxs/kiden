import { Play, Square, RotateCcw, Thermometer, Gauge, HardDrive } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';

function ControlButton({ icon: Icon, label, color, disabled }: {
  icon: typeof Play; label: string; color: string; disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      style={{
        ...styles.controlBtn,
        background: color + '14',
        color,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

export function EnginePage() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>엔진 관리</h1>

      {/* 컨트롤 패널 */}
      <GlassCard title="vLLM 제어">
        <div style={styles.controlRow}>
          <ControlButton icon={Play} label="시작" color="var(--safe)" />
          <ControlButton icon={Square} label="중지" color="var(--danger)" disabled />
          <ControlButton icon={RotateCcw} label="재시작" color="var(--caution)" disabled />
        </div>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>모델</span>
            <select style={styles.select}>
              <option>google/gemma-4-12b</option>
              <option>google/gemma-4-27b</option>
            </select>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>상태</span>
            <StatusChip status="stopped" />
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>포트</span>
            <span style={styles.infoValue}>8000</span>
          </div>
        </div>
      </GlassCard>

      {/* GPU 모니터링 */}
      <div style={styles.grid2}>
        <GlassCard title="GPU 리소스">
          <div style={styles.gpuMetrics}>
            <div style={styles.metricRow}>
              <HardDrive size={16} color="var(--primary)" />
              <span style={styles.metricLabel}>VRAM</span>
              <span style={styles.metricValue}>-- / 16 GB</span>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: '0%', background: 'linear-gradient(90deg, var(--primary), #4DB0B4)' }} />
            </div>
            <div style={styles.metricRow}>
              <Gauge size={16} color="var(--caution)" />
              <span style={styles.metricLabel}>사용률</span>
              <span style={styles.metricValue}>--%</span>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: '0%', background: 'linear-gradient(90deg, var(--caution), #FFCE6B)' }} />
            </div>
            <div style={styles.metricRow}>
              <Thermometer size={16} color="var(--danger)" />
              <span style={styles.metricLabel}>온도</span>
              <span style={styles.metricValue}>--°C</span>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: '0%', background: 'linear-gradient(90deg, var(--safe), var(--danger))' }} />
            </div>
          </div>
        </GlassCard>

        <GlassCard title="엔진 설정">
          <div style={styles.settingsGrid}>
            <div style={styles.settingRow}>
              <span style={styles.settingLabel}>GPU 메모리 사용률</span>
              <input type="range" min="0.5" max="0.95" step="0.05" defaultValue="0.9" style={styles.slider} />
              <span style={styles.settingValue}>90%</span>
            </div>
            <div style={styles.settingRow}>
              <span style={styles.settingLabel}>최대 컨텍스트</span>
              <input type="range" min="2048" max="16384" step="1024" defaultValue="8192" style={styles.slider} />
              <span style={styles.settingValue}>8192</span>
            </div>
            <div style={styles.settingRow}>
              <span style={styles.settingLabel}>헬스체크 간격</span>
              <input type="range" min="10" max="120" step="10" defaultValue="30" style={styles.slider} />
              <span style={styles.settingValue}>30초</span>
            </div>
            <label style={styles.checkboxRow}>
              <input type="checkbox" defaultChecked />
              <span>PC 시작 시 자동 실행</span>
            </label>
            <label style={styles.checkboxRow}>
              <input type="checkbox" defaultChecked />
              <span>크래시 시 자동 재시작</span>
            </label>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  controlRow: { display: 'flex', gap: 12, marginBottom: 20 },
  controlBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 'var(--radius-md)',
    border: 'none', fontSize: 14, fontWeight: 600,
    fontFamily: 'inherit',
  },
  infoGrid: { display: 'flex', gap: 24 },
  infoItem: { display: 'flex', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 500 },
  infoValue: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  select: {
    padding: '6px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', fontSize: 13, fontFamily: 'inherit',
    background: 'var(--bg)', color: 'var(--text-primary)',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  gpuMetrics: { display: 'flex', flexDirection: 'column', gap: 12 },
  metricRow: { display: 'flex', alignItems: 'center', gap: 8 },
  metricLabel: { fontSize: 13, color: 'var(--text-secondary)', flex: 1 },
  metricValue: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
  progressTrack: { height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
  settingsGrid: { display: 'flex', flexDirection: 'column', gap: 16 },
  settingRow: { display: 'flex', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 13, color: 'var(--text-secondary)', width: 130 },
  slider: { flex: 1, accentColor: 'var(--primary)' },
  settingValue: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', width: 50, textAlign: 'right' as const },
  checkboxRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer',
  },
};
