import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

type LogLevel = 'all' | 'info' | 'warn' | 'error';

const mockLogs = [
  { id: 1, time: '14:32:01', level: 'info' as const, message: '[proxy] 서버 시작 — :9001', source: 'system' },
  { id: 2, time: '14:32:03', level: 'info' as const, message: '[vllm] 모델 로딩 중... google/gemma-4-12b', source: 'system' },
  { id: 3, time: '14:32:45', level: 'info' as const, message: '[vllm] 모델 로드 완료 (42s)', source: 'system' },
  { id: 4, time: '14:35:12', level: 'info' as const, message: '[req] POST /v1/chat/completions — 200 — 1.2s — 128 tokens', source: 'request' },
  { id: 5, time: '14:36:08', level: 'warn' as const, message: '[proxy] 금지어 감지: "mg 복용" → 응답 필터링됨', source: 'security' },
  { id: 6, time: '14:40:22', level: 'error' as const, message: '[vllm] CUDA OOM — max_model_len 축소 필요', source: 'system' },
];

const levelColors: Record<string, string> = {
  info: 'var(--primary)',
  warn: 'var(--caution)',
  error: 'var(--danger)',
};

export function LogsPage() {
  const [filter, setFilter] = useState<LogLevel>('all');
  const [search, setSearch] = useState('');

  const filtered = mockLogs.filter(
    (log) =>
      (filter === 'all' || log.level === filter) &&
      (!search || log.message.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>로그</h1>

      {/* 필터 바 */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={16} color="var(--text-tertiary)" />
          <input
            type="text"
            placeholder="키워드 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterRow}>
          {(['all', 'info', 'warn', 'error'] as LogLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              style={{
                ...styles.filterBtn,
                ...(filter === lvl ? styles.filterBtnActive : {}),
              }}
            >
              {lvl === 'all' ? '전체' : lvl.toUpperCase()}
            </button>
          ))}
        </div>
        <button style={styles.exportBtn}>
          <Download size={14} />
          CSV
        </button>
      </div>

      {/* 로그 테이블 */}
      <GlassCard style={{ padding: 0 }}>
        <div style={styles.logList}>
          {filtered.map((log) => (
            <div key={log.id} style={styles.logRow}>
              <span style={styles.logTime}>{log.time}</span>
              <span style={{ ...styles.logLevel, color: levelColors[log.level] }}>
                {log.level.toUpperCase()}
              </span>
              <span style={styles.logMsg}>{log.message}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={styles.empty}>일치하는 로그가 없습니다</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  toolbar: { display: 'flex', alignItems: 'center', gap: 12 },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 14px', borderRadius: 'var(--radius-md)',
    background: '#FFF', border: '1px solid var(--border)', flex: 1, maxWidth: 320,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit',
  },
  filterRow: { display: 'flex', gap: 4 },
  filterBtn: {
    padding: '6px 12px', borderRadius: 999,
    border: '1px solid var(--border)', background: '#FFF',
    fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  filterBtnActive: {
    background: 'var(--primary)', color: '#FFF', borderColor: 'var(--primary)',
  },
  exportBtn: {
    display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto',
    padding: '6px 14px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: '#FFF',
    fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
  },
  logList: { fontFamily: "'Pretendard', monospace", fontSize: 13 },
  logRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 20px',
    borderBottom: '1px solid var(--border-light)',
  },
  logTime: { color: 'var(--text-tertiary)', fontWeight: 500, width: 70, flexShrink: 0 },
  logLevel: { fontWeight: 700, width: 50, flexShrink: 0, fontSize: 11 },
  logMsg: { color: 'var(--text-primary)', flex: 1 },
  empty: { padding: 40, textAlign: 'center' as const, color: 'var(--text-tertiary)' },
};
