import { useState, useEffect } from 'react';
import { Cpu, Thermometer, HardDrive, Clock, Activity, MessageSquare } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';
import { config } from '../config';

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Cpu; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: color + '14', color }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );
}

export function HomePage() {
  const [engineStatus, setEngineStatus] = useState<'running' | 'stopped'>('stopped');
  const [modelName, setModelName] = useState('--');
  const [vramUsage, setVramUsage] = useState('-- / 16GB');
  const [vramPercent, setVramPercent] = useState(0);
  const [gpuTemp, setGpuTemp] = useState('--\u00B0C');
  const [requestCount, setRequestCount] = useState('0');
  const [avgLatency, setAvgLatency] = useState('--');

  useEffect(() => {
    let cancelled = false;

    async function fetchHealth() {
      try {
        const res = await fetch(`${config.vllmBaseUrl}/health`);
        if (!cancelled && res.ok) {
          setEngineStatus('running');
        }
      } catch {
        if (!cancelled) {
          setEngineStatus('stopped');
        }
      }
    }

    async function fetchModel() {
      try {
        const res = await fetch(`${config.vllmBaseUrl}/v1/models`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data?.data?.[0]?.id) {
            setModelName(data.data[0].id);
          }
        }
      } catch {
        if (!cancelled) {
          setModelName('--');
        }
      }
    }

    async function fetchGpuStats() {
      try {
        const res = await fetch(`${config.vllmBaseUrl}/metrics`);
        if (!cancelled && res.ok) {
          const text = await res.text();
          const vramMatch = text.match(/gpu_memory_used_bytes\s+([\d.e+]+)/);
          const vramTotalMatch = text.match(/gpu_memory_total_bytes\s+([\d.e+]+)/);
          const tempMatch = text.match(/gpu_temperature_celsius\s+([\d.]+)/);
          if (vramMatch && vramTotalMatch) {
            const usedGB = (parseFloat(vramMatch[1]) / 1e9).toFixed(1);
            const totalGB = (parseFloat(vramTotalMatch[1]) / 1e9).toFixed(0);
            setVramUsage(`${usedGB} / ${totalGB}GB`);
            setVramPercent(Math.round((parseFloat(vramMatch[1]) / parseFloat(vramTotalMatch[1])) * 100));
          }
          if (tempMatch) {
            setGpuTemp(`${parseFloat(tempMatch[1]).toFixed(0)}\u00B0C`);
          }
        }
      } catch {
        if (!cancelled) {
          setVramUsage('-- / 16GB');
          setVramPercent(0);
          setGpuTemp('--\u00B0C');
        }
      }
    }

    async function fetchStats() {
      try {
        const res = await fetch(`${config.vllmBaseUrl}/stats`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.total_requests !== undefined) setRequestCount(String(data.total_requests));
          if (data.avg_latency !== undefined) setAvgLatency(`${data.avg_latency.toFixed(1)}s`);
        }
      } catch {
        if (!cancelled) {
          setRequestCount('0');
          setAvgLatency('--');
        }
      }
    }

    fetchHealth();
    fetchModel();
    fetchGpuStats();
    fetchStats();

    return () => { cancelled = true; };
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>{'\uB300\uC2DC\uBCF4\uB4DC'}</h1>
        <StatusChip status={engineStatus} />
      </div>

      {/* 상단 요약 카드 — 3개 */}
      <div style={styles.grid3}>
        <GlassCard>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>vLLM {'\uC0C1\uD0DC'}</span>
            <StatusChip status={engineStatus} />
          </div>
          <div style={styles.modelName}>{modelName}</div>
          <div style={styles.cardMeta}>{'\uD3EC\uD2B8'} {config.vllmBaseUrl.split(':').pop()} {'\xB7'} {'\uD504\uB85D\uC2DC'} {config.proxyPort}</div>
        </GlassCard>

        <GlassCard>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>GPU</span>
            <Thermometer size={16} color="var(--text-tertiary)" />
          </div>
          <div style={styles.gpuRow}>
            <StatCard icon={HardDrive} label="VRAM" value={vramUsage} color="var(--primary)" />
            <StatCard icon={Thermometer} label={'\uC628\uB3C4'} value={gpuTemp} color="var(--caution)" />
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressBar, width: `${vramPercent}%` }} />
          </div>
        </GlassCard>

        <GlassCard>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>{'\uC624\uB298 \uD1B5\uACC4'}</span>
            <Activity size={16} color="var(--text-tertiary)" />
          </div>
          <div style={styles.statsRow}>
            <div style={styles.statsItem}>
              <MessageSquare size={16} color="var(--primary)" />
              <span style={styles.statsValue}>{requestCount}</span>
              <span style={styles.statsLabel}>{'\uC694\uCCAD'}</span>
            </div>
            <div style={styles.statsItem}>
              <Clock size={16} color="var(--caution)" />
              <span style={styles.statsValue}>{avgLatency}</span>
              <span style={styles.statsLabel}>{'\uD3C9\uADE0 \uC751\uB2F5'}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 최근 요청 로그 (플레이스홀더) */}
      <GlassCard title={'\uCD5C\uADFC \uC694\uCCAD'}>
        <div style={styles.emptyState}>
          <MessageSquare size={32} color="var(--text-disabled)" />
          <span style={styles.emptyText}>{'\uC544\uC9C1 \uC694\uCCAD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4'}</span>
          <span style={styles.emptyHint}>vLLM{'\uC744 \uC2DC\uC791\uD558\uACE0'} Android {'\uC571\uC744 \uC5F0\uACB0\uD558\uC138\uC694'}</span>
        </div>
      </GlassCard>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  modelName: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: 'var(--text-tertiary)',
  },
  gpuRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    background: 'var(--bg)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    background: 'linear-gradient(90deg, var(--primary), var(--primary-light, #4DB0B4))',
    transition: 'width 0.3s',
  },
  statsRow: {
    display: 'flex',
    gap: 24,
  },
  statsItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  statsLabel: {
    fontSize: 12,
    color: 'var(--text-tertiary)',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: 11,
    color: 'var(--text-tertiary)',
  },
  statSub: {
    fontSize: 11,
    color: 'var(--text-tertiary)',
    marginLeft: 'auto',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '40px 0',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  emptyHint: {
    fontSize: 13,
    color: 'var(--text-tertiary)',
  },
};
