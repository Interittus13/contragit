import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'muted' | 'danger' | 'warning';
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({
  children,
  variant = 'emerald',
  icon,
  className = '',
  style,
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {icon}
      {children}
    </span>
  );
}
