type Status = 'running' | 'stopped' | 'error' | 'idle';

const config: Record<Status, { bg: string; color: string; label: string }> = {
  running: { bg: 'var(--safe-bg)', color: 'var(--safe)', label: 'Running' },
  stopped: { bg: 'var(--danger-bg)', color: 'var(--danger)', label: 'Stopped' },
  error: { bg: 'var(--danger-bg)', color: 'var(--danger)', label: 'Error' },
  idle: { bg: 'var(--caution-bg)', color: 'var(--caution)', label: 'Idle' },
};

export function StatusChip({ status }: { status: Status }) {
  const c = config[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 999,
        background: c.bg,
        color: c.color,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 3, background: c.color }} />
      {c.label}
    </span>
  );
}
