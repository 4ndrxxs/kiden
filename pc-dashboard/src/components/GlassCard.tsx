import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
}

export function GlassCard({ children, title, style }: GlassCardProps) {
  return (
    <div className="glass-card" style={style}>
      {title && <h3 style={styles.title}>{title}</h3>}
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: 16,
  },
};
