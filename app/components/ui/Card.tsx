import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  elevated?: boolean;
}

export function Card({
  children,
  title,
  subtitle,
  badge,
  headerAction,
  className = '',
  style,
  elevated = false,
}: CardProps) {
  const hasHeader = title || subtitle || badge || headerAction;

  return (
    <div
      className={`glass-panel ui-card ${elevated ? 'glass-panel-elevated' : ''} ${className}`}
      style={style}
    >
      {hasHeader && (
        <div className="card-header">
          <div>
            <div className="card-title-group">
              {title && <h3 className="card-title">{title}</h3>}
              {badge}
            </div>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
