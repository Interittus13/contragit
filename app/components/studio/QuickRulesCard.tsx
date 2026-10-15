'use client';

import React from 'react';
import { Calendar, Filter, Minus, Plus } from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { Weekday, WeekdayCounts, FilterPreset, FilterOption } from '@/lib/types/scheduler';

export interface QuickRulesCardProps {
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  weekdayCounts: WeekdayCounts;
  onWeekdayCountsChange: (val: WeekdayCounts) => void;
  activeFilter: FilterPreset;
  onApplyFilter: (preset: FilterPreset, opt?: FilterOption) => void;
  activeOption: FilterOption;
}

const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

export function QuickRulesCard({
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  weekdayCounts,
  onWeekdayCountsChange,
  activeFilter,
  onApplyFilter,
  activeOption,
}: QuickRulesCardProps) {
  const updateWeekday = (day: Weekday, delta: number) => {
    const cur = weekdayCounts[day] || 0;
    const next = Math.max(0, Math.min(20, cur + delta));
    onWeekdayCountsChange({ ...weekdayCounts, [day]: next });
  };

  return (
    <Card
      title="Rule Engine Parameters"
      subtitle="Define date boundaries and recurring weekly commit densities"
      badge={<Badge variant="emerald"><Calendar size={12} /> Date Range</Badge>}
    >
      {/* Date Pickers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <label className="form-label">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="form-control mono"
          />
        </div>
        <div>
          <label className="form-label">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="form-control mono"
          />
        </div>
      </div>

      {/* Filter Presets Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(10, 14, 23, 0.6)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Presets:
          </span>
          {(['all', 'even', 'odd', 'custom'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onApplyFilter(p, activeOption)}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: activeFilter === p ? '1px solid var(--emerald-400)' : '1px solid var(--border-default)',
                background: activeFilter === p ? 'var(--emerald-500)' : 'rgba(255, 255, 255, 0.04)',
                color: activeFilter === p ? '#03140c' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: activeFilter === p ? 700 : 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {(['min', 'max'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onApplyFilter(activeFilter, opt)}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: activeOption === opt ? '1px solid var(--border-active)' : '1px solid var(--border-default)',
                background: activeOption === opt ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeOption === opt ? 'var(--emerald-400)' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Weekday Steppers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(75px, 1fr))', gap: '0.5rem' }}>
        {WEEKDAYS.map(({ key, label }) => {
          const val = weekdayCounts[key] || 0;
          const isActive = val > 0;
          return (
            <div
              key={key}
              style={{
                background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: isActive ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.4rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? 'var(--emerald-400)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => updateWeekday(key, -1)}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Minus size={11} />
                </button>
                <span className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '18px' }}>
                  {val}
                </span>
                <button
                  type="button"
                  onClick={() => updateWeekday(key, 1)}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
