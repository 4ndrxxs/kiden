import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, Brain, ScrollText, Globe, Settings,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '홈' },
  { to: '/engine', icon: Cpu, label: '엔진' },
  { to: '/ai', icon: Brain, label: 'AI 설정' },
  { to: '/logs', icon: ScrollText, label: '로그' },
  { to: '/network', icon: Globe, label: '네트워크' },
  { to: '/settings', icon: Settings, label: '시스템' },
];

export function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      {/* 로고 */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>K</div>
        <div>
          <div style={styles.logoTitle}>Kiden</div>
          <div style={styles.logoSub}>Server Console</div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* 하단 상태 */}
      <div style={styles.statusBar}>
        <div style={styles.statusDot} />
        <span style={styles.statusText}>vLLM 대기 중</span>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 220,
    minHeight: '100vh',
    background: '#FFFFFF',
    borderRight: '1px solid var(--border-light)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 12px',
    gap: 32,
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 8px',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #2B8A8E, #4DB0B4)',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 16,
  },
  logoTitle: {
    fontWeight: 700,
    fontSize: 16,
    color: 'var(--text-primary)',
  },
  logoSub: {
    fontSize: 11,
    color: 'var(--text-tertiary)',
    letterSpacing: 0.3,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  navItemActive: {
    background: 'var(--primary-bg)',
    color: 'var(--primary)',
    fontWeight: 600,
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px',
    background: 'var(--bg)',
    borderRadius: 'var(--radius-md)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    background: 'var(--text-disabled)',
  },
  statusText: {
    fontSize: 12,
    color: 'var(--text-tertiary)',
  },
};
