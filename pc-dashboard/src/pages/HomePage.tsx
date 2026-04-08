import { Cpu, Thermometer, HardDrive, Clock, Activity, MessageSquare } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';

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
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>대시보드</h1>
        <StatusChip status="stopped" />
      </div>

      {/* 상단 요약 카드 — 3개 */}
      <div style={styles.grid3}>
        <GlassCard>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>vLLM 상태</span>
            <StatusChip status="stopped" />
          </div>
          <div style={styles.modelName}>google/gemma-4-12b</div>
          <div style={styles.cardMeta}>포트 8000 · 프록시 9001</div>
        </GlassCard>

        <GlassCard>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>GPU</span>
            <Thermometer size={16} color="var(--text-tertiary)" />
          </div>
          <div style={styles.gpuRow}>
            <StatCard icon={HardDrive} label="VRAM" value="-- / 16GB" color="var(--primary)" />
            <StatCard icon={Thermometer} label="온도" value="--°C" color="var(--caution)" />
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressBar, width: '0%' }} />
          </div>
        </GlassCard>

        <GlassCard>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>오늘 통계</span>
            <Activity size={16} color="var(--text-tertiary)" />
          </div>
          <div style={styles.statsRow}>
            <div style={styles.statsItem}>
              <MessageSquare size={16} color="var(--primary)" />
              <span style={styles.statsValue}>0</span>
              <span style={styles.statsLabel}>요청</span>
            </div>
            <div style={styles.statsItem}>
              <Clock size={16} color="var(--caution)" />
              <span style={styles.statsValue}>--</span>
              <span style={styles.statsLabel}>평균 응답</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 최근 요청 로그 (플레이스홀더) */}
      <GlassCard title="최근 요청">
        <div style={styles.emptyState}>
          <MessageSquare size={32} color="var(--text-disabled)" />
          <span style={styles.emptyText}>아직 요청이 없습니다</span>
          <span style={styles.emptyHint}>vLLM을 시작하고 Android 앱을 연결하세요</span>
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
