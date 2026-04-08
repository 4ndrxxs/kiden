import { Lock, Database, Bell, FolderArchive, Info } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={styles.settingRow}>
      <span style={styles.settingLabel}>{label}</span>
      <div style={styles.settingControl}>{children}</div>
    </div>
  );
}

export function SystemPage() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>시스템 설정</h1>

      <div style={styles.grid2}>
        {/* 보안 */}
        <GlassCard>
          <div style={styles.sectionHeader}>
            <Lock size={18} color="var(--primary)" />
            <h3 style={styles.sectionTitle}>보안</h3>
          </div>
          <div style={styles.settingList}>
            <SettingRow label="대시보드 비밀번호">
              <button style={styles.changeBtn}>변경</button>
            </SettingRow>
            <SettingRow label="세션 타임아웃">
              <select style={styles.select}>
                <option>30분</option>
                <option>1시간</option>
                <option>2시간</option>
              </select>
            </SettingRow>
          </div>
        </GlassCard>

        {/* 알림 */}
        <GlassCard>
          <div style={styles.sectionHeader}>
            <Bell size={18} color="var(--caution)" />
            <h3 style={styles.sectionTitle}>알림</h3>
          </div>
          <div style={styles.settingList}>
            <SettingRow label="에러 알림">
              <label style={styles.toggle}>
                <input type="checkbox" defaultChecked />
                <span>카카오톡</span>
              </label>
            </SettingRow>
            <SettingRow label="vLLM 크래시 알림">
              <label style={styles.toggle}>
                <input type="checkbox" defaultChecked />
                <span>활성</span>
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
            <h3 style={styles.sectionTitle}>데이터 보존</h3>
          </div>
          <div style={styles.settingList}>
            <SettingRow label="요청 로그">
              <select style={styles.select}>
                <option>90일</option>
                <option>180일</option>
                <option>365일</option>
              </select>
            </SettingRow>
            <SettingRow label="시스템 로그">
              <select style={styles.select}>
                <option>90일</option>
                <option>180일</option>
              </select>
            </SettingRow>
            <SettingRow label="GPU 메트릭">
              <select style={styles.select}>
                <option>30일</option>
                <option>90일</option>
              </select>
            </SettingRow>
            <SettingRow label="프롬프트 히스토리">
              <span style={styles.badge}>영구 보존</span>
            </SettingRow>
          </div>
        </GlassCard>

        {/* Supabase & 백업 */}
        <GlassCard>
          <div style={styles.sectionHeader}>
            <FolderArchive size={18} color="var(--danger)" />
            <h3 style={styles.sectionTitle}>연동 & 백업</h3>
          </div>
          <div style={styles.settingList}>
            <SettingRow label="Supabase URL">
              <input type="text" placeholder="https://xxx.supabase.co" style={styles.textInput} />
            </SettingRow>
            <SettingRow label="자동 Pull 간격">
              <select style={styles.select}>
                <option>1시간</option>
                <option>30분</option>
                <option>6시간</option>
              </select>
            </SettingRow>
            <div style={styles.btnRow}>
              <button style={styles.backupBtn}>설정 백업</button>
              <button style={styles.restoreBtn}>복원</button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 앱 정보 */}
      <GlassCard>
        <div style={styles.infoRow}>
          <Info size={16} color="var(--text-tertiary)" />
          <span style={styles.infoText}>Kiden Server Console v1.0.0</span>
          <span style={styles.infoSub}>FastAPI + vLLM · RTX 5080 · Python 3.11</span>
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
