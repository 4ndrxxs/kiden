import { useState, useEffect } from 'react';
import { Lock, Database, Bell, FolderArchive, Info } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { config } from '../config';

declare const __APP_VERSION__: string;

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={styles.settingRow}>
      <span style={styles.settingLabel}>{label}</span>
      <div style={styles.settingControl}>{children}</div>
    </div>
  );
}

export function SystemPage() {
  const appVersion = `Kiden Server Console v${__APP_VERSION__}`;
  const [systemInfo, setSystemInfo] = useState('--');

  useEffect(() => {
    let cancelled = false;

    async function fetchSystemInfo() {
      try {
        const res = await fetch(`${config.vllmBaseUrl}/system`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.info) {
            setSystemInfo(data.info);
          }
        }
      } catch {
        if (!cancelled) {
          setSystemInfo('--');
        }
      }
    }

    fetchSystemInfo();

    return () => { cancelled = true; };
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{'\uC2DC\uC2A4\uD15C \uC124\uC815'}</h1>

      <div style={styles.grid2}>
        {/* 보안 */}
        <GlassCard>
          <div style={styles.sectionHeader}>
            <Lock size={18} color="var(--primary)" />
            <h3 style={styles.sectionTitle}>{'\uBCF4\uC548'}</h3>
          </div>
          <div style={styles.settingList}>
            <SettingRow label={'\uB300\uC2DC\uBCF4\uB4DC \uBE44\uBC00\uBC88\uD638'}>
              <button style={styles.changeBtn}>{'\uBCC0\uACBD'}</button>
            </SettingRow>
            <SettingRow label={'\uC138\uC158 \uD0C0\uC784\uC544\uC6C3'}>
              <select style={styles.select}>
                <option>30{'\uBD84'}</option>
                <option>1{'\uC2DC\uAC04'}</option>
                <option>2{'\uC2DC\uAC04'}</option>
              </select>
            </SettingRow>
          </div>
        </GlassCard>

        {/* 알림 */}
        <GlassCard>
          <div style={styles.sectionHeader}>
            <Bell size={18} color="var(--caution)" />
            <h3 style={styles.sectionTitle}>{'\uC54C\uB9BC'}</h3>
          </div>
          <div style={styles.settingList}>
            <SettingRow label={'\uC5D0\uB7EC \uC54C\uB9BC'}>
              <label style={styles.toggle}>
                <input type="checkbox" defaultChecked />
                <span>{'\uCE74\uCE74\uC624\uD1A1'}</span>
              </label>
            </SettingRow>
            <SettingRow label="vLLM \uD06C\uB798\uC2DC \uC54C\uB9BC">
              <label style={styles.toggle}>
                <input type="checkbox" defaultChecked />
                <span>{'\uD65C\uC131'}</span>
              </label>
            </SettingRow>
          </div>
        </GlassCard>
      </div>

      <div style={styles.grid2}>
        {/* 데이터 */}
        <GlassCard>
          <div style={styles.sectionHeader}>
            <Database size={18} color="var(--safe)" />
            <h3 style={styles.sectionTitle}>{'\uB370\uC774\uD130 \uBCF4\uC874'}</h3>
          </div>
          <div style={styles.settingList}>
            <SettingRow label={'\uC694\uCCAD \uB85C\uADF8'}>
              <select style={styles.select}>
                <option>90{'\uC77C'}</option>
                <option>180{'\uC77C'}</option>
                <option>365{'\uC77C'}</option>
              </select>
            </SettingRow>
            <SettingRow label={'\uC2DC\uC2A4\uD15C \uB85C\uADF8'}>
              <select style={styles.select}>
                <option>90{'\uC77C'}</option>
                <option>180{'\uC77C'}</option>
              </select>
            </SettingRow>
            <SettingRow label="GPU \uBA54\uD2B8\uB9AD">
              <select style={styles.select}>
                <option>30{'\uC77C'}</option>
                <option>90{'\uC77C'}</option>
              </select>
            </SettingRow>
            <SettingRow label={'\uD504\uB86C\uD504\uD2B8 \uD788\uC2A4\uD1A0\uB9AC'}>
              <span style={styles.badge}>{'\uC601\uAD6C \uBCF4\uC874'}</span>
            </SettingRow>
          </div>
        </GlassCard>

        {/* Supabase & 백업 */}
        <GlassCard>
          <div style={styles.sectionHeader}>
            <FolderArchive size={18} color="var(--danger)" />
            <h3 style={styles.sectionTitle}>{'\uC5F0\uB3D9'} & {'\uBC31\uC5C5'}</h3>
          </div>
          <div style={styles.settingList}>
            <SettingRow label="Supabase URL">
              <input
                type="text"
                defaultValue={config.supabaseUrl}
                style={styles.textInput}
              />
            </SettingRow>
            <SettingRow label={'\uC790\uB3D9 Pull \uAC04\uACA9'}>
              <select style={styles.select}>
                <option>1{'\uC2DC\uAC04'}</option>
                <option>30{'\uBD84'}</option>
                <option>6{'\uC2DC\uAC04'}</option>
              </select>
            </SettingRow>
            <div style={styles.btnRow}>
              <button style={styles.backupBtn}>{'\uC124\uC815 \uBC31\uC5C5'}</button>
              <button style={styles.restoreBtn}>{'\uBCF5\uC6D0'}</button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 앱 정보 */}
      <GlassCard>
        <div style={styles.infoRow}>
          <Info size={16} color="var(--text-tertiary)" />
          <span style={styles.infoText}>{appVersion}</span>
          <span style={styles.infoSub}>{systemInfo}</span>
        </div>
      </GlassCard>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' },
  settingList: { display: 'flex', flexDirection: 'column', gap: 14 },
  settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: 13, color: 'var(--text-secondary)' },
  settingControl: { display: 'flex', alignItems: 'center', gap: 8 },
  select: {
    padding: '6px 10px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', fontSize: 12, fontFamily: 'inherit',
    background: 'var(--bg)', color: 'var(--text-primary)',
  },
  textInput: {
    padding: '6px 10px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', fontSize: 12, fontFamily: 'inherit',
    background: 'var(--bg)', color: 'var(--text-primary)', width: 180,
  },
  changeBtn: {
    padding: '4px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: '#FFF',
    fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
  },
  toggle: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' },
  badge: {
    fontSize: 11, fontWeight: 600, color: 'var(--primary)',
    background: 'var(--primary-bg)', padding: '3px 8px', borderRadius: 4,
  },
  btnRow: { display: 'flex', gap: 8, marginTop: 8 },
  backupBtn: {
    flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--primary)', background: 'var(--primary-bg)',
    color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  restoreBtn: {
    flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: '#FFF',
    color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  infoRow: { display: 'flex', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
  infoSub: { fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 'auto' },
};
