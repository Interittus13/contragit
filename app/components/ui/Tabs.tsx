import React from 'react';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Tabs<T extends string>({
  items,
  activeId,
  onChange,
  className = '',
  style,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label="Studio mode navigation"
      className={`segmented-control ${className}`}
      style={style}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`segmented-control-item ${isActive ? 'is-active' : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  background: isActive
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? 'var(--emerald-400)' : 'var(--text-muted)',
                  border: isActive
                    ? '1px solid rgba(16, 185, 129, 0.35)'
                    : '1px solid var(--border-subtle)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.02em',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
