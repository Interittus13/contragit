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
      className={`tabs-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.3rem',
        background: 'rgba(10, 14, 23, 0.85)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        gap: '0.25rem',
        ...style,
      }}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: isActive
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)'
                : 'transparent',
              color: isActive ? 'var(--emerald-400)' : 'var(--text-muted)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isActive ? '0 0 12px rgba(16, 185, 129, 0.15)' : 'none',
              outline: isActive ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--emerald-500)' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#03140c' : 'var(--text-secondary)',
                  fontWeight: 700,
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
