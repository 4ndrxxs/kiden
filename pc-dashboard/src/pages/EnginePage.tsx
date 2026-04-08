import { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Thermometer, Gauge, HardDrive } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';
import { config, defaultModels } from '../config';

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
  const [selectedModel, setSelectedModel] = useState(defaultModels[0]);
  const [engineStatus, setEngineStatus] = useState<'running' | 'stopped'>('stopped');
  const [gpuMemUtil, setGpuMemUtil] = useState(0.9);
  const [maxContext, setMaxContext] = useState(8192);
  const [healthInterval, setHealthInterval] = useState(30);
  const [autoStart, setAutoStart] = useState(true);
  const [autoCrashRestart, setAutoCrashRestart] = useState(true);

  const [vram, setVram] = useState('-- / 16 GB');
  const [vramPercent, setVramPercent] = useState(0);
  const [gpuUtil, setGpuUtil] = useState('--%');
  const [gpuUtilPercent, setGpuUtilPercent] = useState(0);
  const [gpuTemp, setGpuTemp] = useState('--\u00B0C');
  const [gpuTempPercent, setGpuTempPercent] = useState(0);

  // Extract port from vllmBaseUrl for display
  const vllmPort = config.vllmBaseUrl.split(':').pop() || '8000';

  useEffect(() => {
    let cancelled = false;

    async function fetchEngineStatus() {
      try {
        const res = await fetch(`${config.vllmBaseUrl}/health`);
        if (!cancelled) setEngineStatus(res.ok ? 'running' : 'stopped');
      } catch {
        if (!cancelled) setEngineStatus('stopped');
      }
    }

    async function fetchGpuMetrics() {
      try {
        const res = await fetch(`${config.vllmBaseUrl}/metrics`);
        if (!cancelled && res.ok) {
          const text = await res.text();
          const vramUsedMatch = text.match(/gpu_memory_used_bytes\s+([\d.e+]+)/);
          const vramTotalMatch = text.match(/gpu_memory_total_bytes\s+([\d.e+]+)/);
          const utilMatch = text.match(/gpu_utilization_percent\s+([\d.]+)/);
          const tempMatch = text.match(/gpu_temperature_celsius\s+([\d.]+)/);

          if (vramUsedMatch && vramTotalMatch) {
            const usedGB = (parseFloat(vramUsedMatch[1]) / 1e9).toFixed(1);
            const totalGB = (parseFloat(vramTotalMatch[1]) / 1e9).toFixed(0);
            setVram(`${usedGB} / ${totalGB} GB`);
            setVramPercent(Math.round((parseFloat(vramUsedMatch[1]) / parseFloat(vramTotalMatch[1])) * 100));
          }
          if (utilMatch) {
            const pct = parseFloat(utilMatch[1]);
            setGpuUtil(`${pct.toFixed(0)}%`);
            setGpuUtilPercent(Math.round(pct));
          }
          if (tempMatch) {
            const temp = parseFloat(tempMatch[1]);
            setGpuTemp(`${temp.toFixed(0)}\u00B0C`);
            setGpuTempPercent(Math.min(100, Math.round((temp / 100) * 100)));
          }
        }
      } catch {
        if (!cancelled) {
          setVram('-- / 16 GB');
          setVramPercent(0);
          setGpuUtil('--%');
          setGpuUtilPercent(0);
          setGpuTemp('--\u00B0C');
          setGpuTempPercent(0);
        }
      }
    }

    fetchEngineStatus();
    fetchGpuMetrics();

    return () => { cancelled = true; };
  }, []);

  const isRunning = engineStatus === 'running';

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{'\uC5D4\uC9C4 \uAD00\uB9AC'}</h1>

      {/* 컨트롤 패널 */}
      <GlassCard title="vLLM \uC81C\uC5B4">
        <div style={styles.controlRow}>
          <ControlButton icon={Play} label={'\uC2DC\uC791'} color="var(--safe)" disabled={isRunning} />
          <ControlButton icon={Square} label={'\uC911\uC9C0'} color="var(--danger)" disabled={!isRunning} />
          <ControlButton icon={RotateCcw} label={'\uC7AC\uC2DC\uC791'} color="var(--caution)" disabled={!isRunning} />
        </div>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>{'\uBAA8\uB378'}</span>
            <select
              style={styles.select}
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {defaultModels.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>{'\uC0C1\uD0DC'}</span>
            <StatusChip status={engineStatus} />
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>{'\uD3EC\uD2B8'}</span>
            <span style={styles.infoValue}>{vllmPort}</span>
          </div>
        </div>
      </GlassCard>

      {/* GPU 모니터링 */}
      <div style={styles.grid2}>
        <GlassCard title="GPU \uB9AC\uC18C\uC2A4">
          <div style={styles.gpuMetrics}>
            <div style={styles.metricRow}>
              <HardDrive size={16} color="var(--primary)" />
              <span style={styles.metricLabel}>VRAM</span>
              <span style={styles.metricValue}>{vram}</span>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: `${vramPercent}%`, background: 'linear-gradient(90deg, var(--primary), #4DB0B4)' }} />
            </div>
            <div style={styles.metricRow}>
              <Gauge size={16} color="var(--caution)" />
              <span style={styles.metricLabel}>{'\uC0AC\uC6A9\uB960'}</span>
              <span style={styles.metricValue}>{gpuUtil}</span>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: `${gpuUtilPercent}%`, background: 'linear-gradient(90deg, var(--caution), #FFCE6B)' }} />
            </div>
            <div style={styles.metricRow}>
              <Thermometer size={16} color="var(--danger)" />
              <span style={styles.metricLabel}>{'\uC628\uB3C4'}</span>
              <span style={styles.metricValue}>{gpuTemp}</span>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: `${gpuTempPercent}%`, background: 'linear-gradient(90deg, var(--safe), var(--danger))' }} />
            </div>
          </div>
        </GlassCard>

        <GlassCard title={'\uC5D4\uC9C4 \uC124\uC815'}>
          <div style={styles.settingsGrid}>
            <div style={styles.settingRow}>
              <span style={styles.settingLabel}>GPU {'\uBA54\uBAA8\uB9AC \uC0AC\uC6A9\uB960'}</span>
              <input
                type="range" min="0.5" max="0.95" step="0.05"
                value={gpuMemUtil}
                onChange={(e) => setGpuMemUtil(parseFloat(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.settingValue}>{Math.round(gpuMemUtil * 100)}%</span>
            </div>
            <div style={styles.settingRow}>
              <span style={styles.settingLabel}>{'\uCD5C\uB300 \uCEE8\uD14D\uC2A4\uD2B8'}</span>
              <input
                type="range" min="2048" max="16384" step="1024"
                value={maxContext}
                onChange={(e) => setMaxContext(parseInt(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.settingValue}>{maxContext}</span>
            </div>
            <div style={styles.settingRow}>
              <span style={styles.settingLabel}>{'\uD5EC\uC2A4\uCCB4\uD06C \uAC04\uACA9'}</span>
              <input
                type="range" min="10" max="120" step="10"
                value={healthInterval}
                onChange={(e) => setHealthInterval(parseInt(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.settingValue}>{healthInterval}{'\uCD08'}</span>
            </div>
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
              />
              <span>PC {'\uC2DC\uC791 \uC2DC \uC790\uB3D9 \uC2E4\uD589'}</span>
            </label>
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={autoCrashRestart}
                onChange={(e) => setAutoCrashRestart(e.target.checked)}
              />
              <span>{'\uD06C\uB798\uC2DC \uC2DC \uC790\uB3D9 \uC7AC\uC2DC\uC791'}</span>
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
