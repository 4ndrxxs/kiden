import { Shield, Key, Plus, Trash2, Wifi, WifiOff, Globe } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const apiKeys = [
  { name: 'android-app', key: 'kid_****_a1b2', active: true, lastUsed: '2분 전' },
  { name: 'test', key: 'kid_****_x9y8', active: true, lastUsed: '사용 안 함' },
];

const allowedIps = ['192.168.0.0/24 (LAN)'];

export function NetworkPage() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>네트워크</h1>

      <div style={styles.grid2}>
        {/* WireGuard 터널 */}
        <GlassCard title="WireGuard 터널">
          <div style={styles.tunnelStatus}>
            <WifiOff size={32} color="var(--text-disabled)" />
            <span style={styles.tunnelLabel}>비활성</span>
          </div>
          <button style={styles.toggleTunnelBtn}>
            <Wifi size={16} />
            터널 활성화
          </button>
          <div style={styles.tunnelMeta}>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>설정 파일</span>
              <span style={styles.metaValue}>/etc/wireguard/wg0.conf</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>외부 접근</span>
              <span style={{ ...styles.metaValue, color: 'var(--danger)' }}>차단됨</span>
            </div>
          </div>
        </GlassCard>

        {/* 연결 상태 */}
        <GlassCard title="연결 상태">
          <div style={styles.connectionList}>
            <div style={styles.connectionItem}>
              <Globe size={16} color="var(--text-tertiary)" />
              <span style={styles.connLabel}>프록시 서버</span>
              <span style={styles.connPort}>:9001</span>
              <span style={{ ...styles.connStatus, color: 'var(--text-disabled)' }}>대기</span>
            </div>
            <div style={styles.connectionItem}>
              <Globe size={16} color="var(--text-tertiary)" />
              <span style={styles.connLabel}>대시보드</span>
              <span style={styles.connPort}>:9000</span>
              <span style={{ ...styles.connStatus, color: 'var(--safe)' }}>활성</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.connectionItem}>
              <span style={styles.connLabel}>Android 앱</span>
              <span style={{ ...styles.connStatus, color: 'var(--text-disabled)' }}>미연결</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* API 키 관리 */}
      <GlassCard title="API 키">
        <div style={styles.keyList}>
          {apiKeys.map((k) => (
            <div key={k.name} style={styles.keyRow}>
              <Key size={16} color="var(--primary)" />
              <div style={styles.keyInfo}>
                <span style={styles.keyName}>{k.name}</span>
                <span style={styles.keyValue}>{k.key}</span>
              </div>
              <span style={styles.keyLastUsed}>{k.lastUsed}</span>
              <button style={styles.deleteBtn}><Trash2 size={14} /></button>
            </div>
          ))}
          <button style={styles.addBtn}>
            <Plus size={14} /> 키 생성
          </button>
        </div>
      </GlassCard>

      {/* IP 화이트리스트 */}
      <GlassCard title="접근 허용 IP">
        <div style={styles.ipList}>
          {allowedIps.map((ip) => (
            <div key={ip} style={styles.ipRow}>
              <Shield size={14} color="var(--safe)" />
              <span style={styles.ipValue}>{ip}</span>
              <button style={styles.deleteBtn}><Trash2 size={14} /></button>
            </div>
          ))}
          <button style={styles.addBtn}>
            <Plus size={14} /> IP 추가
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  tunnelStatus: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 0' },
  tunnelLabel: { fontSize: 14, fontWeight: 600, color: 'var(--text-tertiary)' },
  toggleTunnelBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
    padding: '10px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--primary)', background: 'var(--primary-bg)',
    color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    marginBottom: 16,
  },
  tunnelMeta: { display: 'flex', flexDirection: 'column', gap: 8 },
  metaRow: { display: 'flex', justifyContent: 'space-between' },
  metaLabel: { fontSize: 12, color: 'var(--text-tertiary)' },
  metaValue: { fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' },
  connectionList: { display: 'flex', flexDirection: 'column', gap: 10 },
  connectionItem: { display: 'flex', alignItems: 'center', gap: 8 },
  connLabel: { fontSize: 13, color: 'var(--text-secondary)', flex: 1 },
  connPort: { fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'monospace' },
  connStatus: { fontSize: 12, fontWeight: 600 },
  divider: { height: 1, background: 'var(--border-light)', margin: '4px 0' },
  keyList: { display: 'flex', flexDirection: 'column', gap: 10 },
  keyRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' },
  keyInfo: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  keyName: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
  keyValue: { fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' },
  keyLastUsed: { fontSize: 11, color: 'var(--text-tertiary)' },
  deleteBtn: {
    background: 'none', border: 'none', color: 'var(--text-disabled)',
    cursor: 'pointer', padding: 4, display: 'flex',
  },
  addBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '10px', borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border)', background: 'transparent',
    color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
  },
  ipList: { display: 'flex', flexDirection: 'column', gap: 8 },
  ipRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' },
  ipValue: { fontSize: 13, color: 'var(--text-primary)', flex: 1, fontFamily: 'monospace' },
};
