import { useState, useEffect } from 'react';
import { Shield, Key, Plus, Trash2, Wifi, WifiOff, Globe } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { config } from '../config';

interface ApiKeyEntry {
  name: string;
  key: string;
  active: boolean;
  lastUsed: string;
}

export function NetworkPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [allowedIps, setAllowedIps] = useState<string[]>([]);
  const [proxyStatus, setProxyStatus] = useState<'active' | 'waiting'>('waiting');

  useEffect(() => {
    let cancelled = false;

    async function fetchNetworkInfo() {
      try {
        const res = await fetch(`${config.vllmBaseUrl}/network`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (Array.isArray(data.api_keys)) {
            setApiKeys(data.api_keys);
          }
          if (Array.isArray(data.allowed_ips)) {
            setAllowedIps(data.allowed_ips);
          }
          if (data.proxy_status === 'active') {
            setProxyStatus('active');
          }
        }
      } catch {
        if (!cancelled) {
          setApiKeys([]);
          setAllowedIps([]);
          setProxyStatus('waiting');
        }
      }
    }

    fetchNetworkInfo();

    return () => { cancelled = true; };
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{'\uB124\uD2B8\uC6CC\uD06C'}</h1>

      <div style={styles.grid2}>
        {/* WireGuard 터널 */}
        <GlassCard title="WireGuard \uD130\uB110">
          <div style={styles.tunnelStatus}>
            <WifiOff size={32} color="var(--text-disabled)" />
            <span style={styles.tunnelLabel}>{'\uBE44\uD65C\uC131'}</span>
          </div>
          <button style={styles.toggleTunnelBtn}>
            <Wifi size={16} />
            {'\uD130\uB110 \uD65C\uC131\uD654'}
          </button>
          <div style={styles.tunnelMeta}>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>{'\uC124\uC815 \uD30C\uC77C'}</span>
              <span style={styles.metaValue}>/etc/wireguard/wg0.conf</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>{'\uC678\uBD80 \uC811\uADFC'}</span>
              <span style={{ ...styles.metaValue, color: 'var(--danger)' }}>{'\uCC28\uB2E8\uB428'}</span>
            </div>
          </div>
        </GlassCard>

        {/* 연결 상태 */}
        <GlassCard title={'\uC5F0\uACB0 \uC0C1\uD0DC'}>
          <div style={styles.connectionList}>
            <div style={styles.connectionItem}>
              <Globe size={16} color="var(--text-tertiary)" />
              <span style={styles.connLabel}>{'\uD504\uB85D\uC2DC \uC11C\uBC84'}</span>
              <span style={styles.connPort}>:{config.proxyPort}</span>
              <span style={{ ...styles.connStatus, color: proxyStatus === 'active' ? 'var(--safe)' : 'var(--text-disabled)' }}>
                {proxyStatus === 'active' ? '\uD65C\uC131' : '\uB300\uAE30'}
              </span>
            </div>
            <div style={styles.connectionItem}>
              <Globe size={16} color="var(--text-tertiary)" />
              <span style={styles.connLabel}>{'\uB300\uC2DC\uBCF4\uB4DC'}</span>
              <span style={styles.connPort}>:{config.dashboardPort}</span>
              <span style={{ ...styles.connStatus, color: 'var(--safe)' }}>{'\uD65C\uC131'}</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.connectionItem}>
              <span style={styles.connLabel}>Android {'\uC571'}</span>
              <span style={{ ...styles.connStatus, color: 'var(--text-disabled)' }}>{'\uBBF8\uC5F0\uACB0'}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* API 키 관리 */}
      <GlassCard title="API \uD0A4">
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
          {apiKeys.length === 0 && (
            <div style={styles.emptyHint}>{'\uB4F1\uB85D\uB41C API \uD0A4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4'}</div>
          )}
          <button style={styles.addBtn}>
            <Plus size={14} /> {'\uD0A4 \uC0DD\uC131'}
          </button>
        </div>
      </GlassCard>

      {/* IP 화이트리스트 */}
      <GlassCard title={'\uC811\uADFC \uD5C8\uC6A9 IP'}>
        <div style={styles.ipList}>
          {allowedIps.map((ip) => (
            <div key={ip} style={styles.ipRow}>
              <Shield size={14} color="var(--safe)" />
              <span style={styles.ipValue}>{ip}</span>
              <button style={styles.deleteBtn}><Trash2 size={14} /></button>
            </div>
          ))}
          {allowedIps.length === 0 && (
            <div style={styles.emptyHint}>{'\uB4F1\uB85D\uB41C IP\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4'}</div>
          )}
          <button style={styles.addBtn}>
            <Plus size={14} /> IP {'\uCD94\uAC00'}
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
  emptyHint: { padding: 16, textAlign: 'center' as const, color: 'var(--text-tertiary)', fontSize: 13 },
  ipList: { display: 'flex', flexDirection: 'column', gap: 8 },
  ipRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' },
  ipValue: { fontSize: 13, color: 'var(--text-primary)', flex: 1, fontFamily: 'monospace' },
};
