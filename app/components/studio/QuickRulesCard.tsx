'use client';

import React from 'react';
import { Calendar, Minus, Plus } from 'lucide-react';
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
      <div className="grid-auto-fit" style={{ marginBottom: '1.25rem' }}>
        <div>
          <label className="form-label" htmlFor="start-date-input">Start Date</label>
          <input
            id="start-date-input"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="form-control mono"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="end-date-input">End Date</label>
          <input
            id="end-date-input"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="form-control mono"
          />
        </div>
      </div>

      {/* Filter Presets Toolbar */}
      <div
        className="cluster-between"
        style={{
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(10, 14, 23, 0.6)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            Presets:
          </span>
          <div
            role="radiogroup"
            aria-label="Filter presets"
            className="segmented-control"
          >
            {(['all', 'even', 'odd', 'custom'] as const).map((p) => {
              const isSelected = activeFilter === p;
              return (
                <button
                  key={p}
                  role="radio"
                  aria-checked={isSelected}
                  type="button"
                  onClick={() => onApplyFilter(p, activeOption)}
                  className={`segmented-control-item ${isSelected ? 'is-active' : ''}`}
                  style={{ padding: '0.35rem 0.65rem', minHeight: '32px', fontSize: '0.75rem', textTransform: 'capitalize' }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label="Density option"
          className="segmented-control"
        >
          {(['min', 'max'] as const).map((opt) => {
            const isSelected = activeOption === opt;
            return (
              <button
                key={opt}
                role="radio"
                aria-checked={isSelected}
                type="button"
                onClick={() => onApplyFilter(activeFilter, opt)}
                className={`segmented-control-item ${isSelected ? 'is-active' : ''}`}
                style={{ padding: '0.35rem 0.65rem', minHeight: '32px', fontSize: '0.75rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
              >
                {opt}
              </button>
            );
          })}
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
                borderTop: isActive ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.4rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                transition: 'all 0.18s var(--spring-ease)',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? 'var(--emerald-400)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                <button
                  type="button"
                  aria-label={`Decrease ${label} commits`}
                  onClick={() => updateWeekday(key, -1)}
                  className="interactive"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-default)',
                    borderTop: '1px solid var(--specular-rim)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Minus size={13} />
                </button>
                <span className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '20px', fontVariantNumeric: 'tabular-nums' }}>
                  {val}
                </span>
                <button
                  type="button"
                  aria-label={`Increase ${label} commits`}
                  onClick={() => updateWeekday(key, 1)}
                  className="interactive"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-default)',
                    borderTop: '1px solid var(--specular-rim)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
