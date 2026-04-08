import { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { config } from '../config';

type LogLevel = 'all' | 'info' | 'warn' | 'error';

interface LogEntry {
  id: number;
  time: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  source: string;
}

const levelColors: Record<string, string> = {
  info: 'var(--primary)',
  warn: 'var(--caution)',
  error: 'var(--danger)',
};

export function LogsPage() {
  const [filter, setFilter] = useState<LogLevel>('all');
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchLogs() {
      try {
        const res = await fetch(`${config.vllmBaseUrl}/logs`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setLogs(data.map((entry: Record<string, unknown>, i: number) => ({
              id: (entry.id as number) ?? i + 1,
              time: (entry.time as string) ?? '',
              level: (entry.level as 'info' | 'warn' | 'error') ?? 'info',
              message: (entry.message as string) ?? '',
              source: (entry.source as string) ?? 'system',
            })));
          }
        }
      } catch {
        if (!cancelled) {
          setLogs([]);
        }
      }
    }

    fetchLogs();

    return () => { cancelled = true; };
  }, []);

  const filtered = logs.filter(
    (log) =>
      (filter === 'all' || log.level === filter) &&
      (!search || log.message.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{'\uB85C\uADF8'}</h1>

      {/* 필터 바 */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={16} color="var(--text-tertiary)" />
          <input
            type="text"
            placeholder={'\uD0A4\uC6CC\uB4DC \uAC80\uC0C9...'}
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
              {lvl === 'all' ? '\uC804\uCCB4' : lvl.toUpperCase()}
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
            <div style={styles.empty}>{'\uC77C\uCE58\uD558\uB294 \uB85C\uADF8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4'}</div>
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
