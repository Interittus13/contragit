'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CustomCommitMatrix } from '@/lib/types/scheduler';
import { renderTextToPixelMatrix, STENCILS } from '@/lib/utils/pixelFont';
import { 
  Brush, 
  Eraser, 
  RotateCcw, 
  Sparkles, 
  Type, 
  Maximize2, 
  Shuffle, 
  Heart,
  Grid,
  Check
} from 'lucide-react';

interface HeatmapCanvasProps {
  matrix: CustomCommitMatrix;
  onChange: (matrix: CustomCommitMatrix) => void;
}

const LEVEL_COLORS: Record<number, string> = {
  0: '#161b22', // Empty
  1: '#0e4429', // Low (1 commit)
  2: '#006d32', // Medium (3 commits)
  3: '#26a641', // High (6 commits)
  4: '#39d353', // Ultra (10 commits)
};

const LEVEL_COMMITS: Record<number, number> = {
  0: 0,
  1: 1,
  2: 3,
  3: 6,
  4: 10,
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HeatmapCanvas({ matrix, onChange }: HeatmapCanvasProps) {
  const [selectedBrush, setSelectedBrush] = useState<number>(3); // default Level 3
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [hoveredCell, setHoveredCell] = useState<{ date: string; day: string; count: number } | null>(null);

  // Stencil / Text modal state
  const [showStencilModal, setShowStencilModal] = useState<boolean>(false);
  const [stencilText, setStencilText] = useState<string>('HI');
  const [stencilOffset, setStencilOffset] = useState<number>(5);
  const [selectedStencilShape, setSelectedStencilShape] = useState<'text' | 'heart' | 'invader' | 'zigzag'>('text');

  // Compute 52-week calendar grid ending today
  const calendarGrid = useMemo(() => {
    const today = new Date();
    // End on current week's Saturday
    const end = new Date(today);
    const endDay = end.getDay();
    end.setDate(end.getDate() + (6 - endDay));

    // Start 52 weeks back on Sunday
    const start = new Date(end);
    start.setDate(start.getDate() - (52 * 7 - 1));

    const weeks: Array<Array<{ dateStr: string; dateObj: Date; dayIndex: number }>> = [];

    const cur = new Date(start);
    for (let w = 0; w < 52; w++) {
      const weekDays: Array<{ dateStr: string; dateObj: Date; dayIndex: number }> = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = cur.toISOString().split('T')[0];
        weekDays.push({
          dateStr,
          dateObj: new Date(cur),
          dayIndex: cur.getDay(),
        });
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(weekDays);
    }

    return weeks;
  }, []);

  // Window-level mouseup handler so drag painting stops even when mouse leaves grid
  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const paintCell = useCallback((dateStr: string, level: number) => {
    const count = LEVEL_COMMITS[level] || 0;
    onChange({
      ...matrix,
      [dateStr]: count,
    });
  }, [matrix, onChange]);

  const handleCellMouseDown = (dateStr: string) => {
    setIsMouseDown(true);
    paintCell(dateStr, selectedBrush);
  };

  const handleCellMouseEnter = (dateStr: string) => {
    if (isMouseDown) {
      paintCell(dateStr, selectedBrush);
    }
  };

  // Quick Tools
  const handleClear = () => {
    onChange({});
  };

  const handleFillAll = (level: number) => {
    const count = LEVEL_COMMITS[level];
    const newMatrix: CustomCommitMatrix = {};
    calendarGrid.forEach(week => {
      week.forEach(cell => {
        newMatrix[cell.dateStr] = count;
      });
    });
    onChange(newMatrix);
  };

  const handleInvert = () => {
    const newMatrix: CustomCommitMatrix = {};
    calendarGrid.forEach(week => {
      week.forEach(cell => {
        const curCount = matrix[cell.dateStr] || 0;
        newMatrix[cell.dateStr] = curCount > 0 ? 0 : LEVEL_COMMITS[selectedBrush || 3];
      });
    });
    onChange(newMatrix);
  };

  const handleRandomOrganic = () => {
    const newMatrix: CustomCommitMatrix = {};
    calendarGrid.forEach(week => {
      week.forEach(cell => {
        const isWeekend = cell.dayIndex === 0 || cell.dayIndex === 6;
        const chance = isWeekend ? 0.2 : 0.65;
        if (Math.random() < chance) {
          const lv = Math.floor(Math.random() * 4) + 1;
          newMatrix[cell.dateStr] = LEVEL_COMMITS[lv];
        } else {
          newMatrix[cell.dateStr] = 0;
        }
      });
    });
    onChange(newMatrix);
  };

  // Apply Stencil / Text onto Grid
  const applyStencil = () => {
    let rows: boolean[][] = [];

    if (selectedStencilShape === 'text') {
      rows = renderTextToPixelMatrix(stencilText || 'HI');
    } else if (STENCILS[selectedStencilShape]) {
      rows = STENCILS[selectedStencilShape].map(r => r.map(Boolean));
    }

    if (!rows || rows.length === 0) return;

    const stencilHeight = rows.length; // 7 rows
    const stencilWidth = rows[0]?.length || 0;
    const newMatrix = { ...matrix };

    for (let col = 0; col < stencilWidth; col++) {
      const targetCol = stencilOffset + col;
      if (targetCol >= 0 && targetCol < calendarGrid.length) {
        for (let row = 0; row < stencilHeight; row++) {
          if (row < 7) {
            const cell = calendarGrid[targetCol][row];
            if (cell) {
              const isFilled = rows[row][col];
              if (isFilled) {
                newMatrix[cell.dateStr] = LEVEL_COMMITS[selectedBrush || 3];
              }
            }
          }
        }
      }
    }

    onChange(newMatrix);
    setShowStencilModal(false);
  };

  // Stats calculation
  const totalCommits = useMemo(() => {
    return Object.values(matrix).reduce((acc, c) => acc + (c || 0), 0);
  }, [matrix]);

  const activeDays = useMemo(() => {
    return Object.values(matrix).filter(c => (c || 0) > 0).length;
  }, [matrix]);

  // Month labels positioning
  const monthLabels = useMemo(() => {
    const labels: Array<{ name: string; colIndex: number }> = [];
    let lastMonth = -1;

    calendarGrid.forEach((week, colIdx) => {
      const firstDay = week[0]?.dateObj;
      if (firstDay) {
        const m = firstDay.getMonth();
        if (m !== lastMonth && colIdx > 0 && colIdx < 50) {
          labels.push({ name: MONTH_NAMES[m], colIndex: colIdx });
          lastMonth = m;
        }
      }
    });

    return labels;
  }, [calendarGrid]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Canvas Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        background: 'rgba(10, 14, 23, 0.75)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem'
      }}>
        {/* Brush Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            <Brush size={14} style={{ display: 'inline', marginRight: '4px' }} /> Brush:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {[
              { level: 0, label: 'Erase', color: LEVEL_COLORS[0] },
              { level: 1, label: 'Low (1)', color: LEVEL_COLORS[1] },
              { level: 2, label: 'Med (3)', color: LEVEL_COLORS[2] },
              { level: 3, label: 'High (6)', color: LEVEL_COLORS[3] },
              { level: 4, label: 'Ultra (10)', color: LEVEL_COLORS[4] },
            ].map(({ level, label, color }) => (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedBrush(level)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedBrush === level ? '1px solid var(--emerald-400)' : '1px solid var(--border-color)',
                  background: selectedBrush === level ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedBrush === level ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor: color,
                    display: 'inline-block',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowStencilModal(true)}
            className="btn-primary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.35rem' }}
          >
            <Type size={14} /> Text / Stencil
          </button>
          <button
            type="button"
            onClick={handleRandomOrganic}
            className="btn-ghost"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
            title="Randomize realistic organic pattern"
          >
            <Shuffle size={14} /> Organic
          </button>
          <button
            type="button"
            onClick={handleInvert}
            className="btn-ghost"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            title="Invert current canvas"
          >
            Invert
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="btn-ghost"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: 'var(--danger)' }}
            title="Clear all painted cells"
          >
            <RotateCcw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Grid Container with Horizontal Scroll for Small Screens */}
      <div style={{
        background: 'rgba(5, 7, 12, 0.85)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem 1.25rem',
        overflowX: 'auto',
        userSelect: 'none',
      }}>
        <div style={{ minWidth: '780px' }}>
          {/* Month Labels Bar */}
          <div style={{ display: 'flex', marginBottom: '6px', paddingLeft: '32px', fontSize: '0.75rem', color: 'var(--text-dim)', height: '18px', position: 'relative' }}>
            {monthLabels.map(m => (
              <span
                key={m.colIndex}
                style={{
                  position: 'absolute',
                  left: `${32 + m.colIndex * 14}px`,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {m.name}
              </span>
            ))}
          </div>

          {/* Canvas Matrix */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {/* Weekday Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '28px', fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'right', paddingRight: '6px' }}>
              <div style={{ height: '11px', lineHeight: '11px' }}></div>
              <div style={{ height: '11px', lineHeight: '11px' }}>Mon</div>
              <div style={{ height: '11px', lineHeight: '11px' }}></div>
              <div style={{ height: '11px', lineHeight: '11px' }}>Wed</div>
              <div style={{ height: '11px', lineHeight: '11px' }}></div>
              <div style={{ height: '11px', lineHeight: '11px' }}>Fri</div>
              <div style={{ height: '11px', lineHeight: '11px' }}></div>
            </div>

            {/* 52 Columns */}
            {calendarGrid.map((week, colIdx) => (
              <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {week.map(cell => {
                  const count = matrix[cell.dateStr] || 0;
                  let level = 0;
                  if (count >= 10) level = 4;
                  else if (count >= 6) level = 3;
                  else if (count >= 3) level = 2;
                  else if (count >= 1) level = 1;

                  return (
                    <div
                      key={cell.dateStr}
                      onMouseDown={() => handleCellMouseDown(cell.dateStr)}
                      onMouseEnter={() => {
                        handleCellMouseEnter(cell.dateStr);
                        setHoveredCell({
                          date: cell.dateStr,
                          day: DAY_LABELS[cell.dayIndex],
                          count,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        width: '11px',
                        height: '11px',
                        borderRadius: '2px',
                        backgroundColor: LEVEL_COLORS[level],
                        border: level > 0 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.04)',
                        cursor: 'crosshair',
                        transition: 'transform 0.1s, background-color 0.15s',
                        transform: hoveredCell?.date === cell.dateStr ? 'scale(1.3)' : 'none',
                        zIndex: hoveredCell?.date === cell.dateStr ? 10 : 1,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer Legend & Tooltip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <div>
              {hoveredCell ? (
                <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  <strong>{hoveredCell.count} commits</strong> on {hoveredCell.day}, {hoveredCell.date}
                </span>
              ) : (
                <span>Hover or click & drag to paint commit density onto any day.</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(lv => (
                <div
                  key={lv}
                  style={{
                    width: '11px',
                    height: '11px',
                    borderRadius: '2px',
                    backgroundColor: LEVEL_COLORS[lv],
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Canvas Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
      }}>
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Grid size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Active Days</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>
              {activeDays} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 400 }}>/ 364</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Commits</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>
              {totalCommits}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brush size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Current Brush</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>
              Level {selectedBrush} ({LEVEL_COMMITS[selectedBrush]} commits)
            </div>
          </div>
        </div>
      </div>

      {/* Stencil & Text Modal */}
      {showStencilModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Type size={20} color="var(--emerald-400)" /> Text & Stencil Stamp Tool
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Stamp letters, words, or 8-bit pixel art shapes directly onto your GitHub contribution matrix.
            </p>

            {/* Stencil Mode Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setSelectedStencilShape('text')}
                className={`filter-chip ${selectedStencilShape === 'text' ? 'active' : ''}`}
              >
                Custom Text
              </button>
              <button
                type="button"
                onClick={() => setSelectedStencilShape('heart')}
                className={`filter-chip ${selectedStencilShape === 'heart' ? 'active' : ''}`}
              >
                Pixel Heart
              </button>
              <button
                type="button"
                onClick={() => setSelectedStencilShape('invader')}
                className={`filter-chip ${selectedStencilShape === 'invader' ? 'active' : ''}`}
              >
                Space Invader
              </button>
              <button
                type="button"
                onClick={() => setSelectedStencilShape('zigzag')}
                className={`filter-chip ${selectedStencilShape === 'zigzag' ? 'active' : ''}`}
              >
                Zigzag Waves
              </button>
            </div>

            {selectedStencilShape === 'text' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Text to Render (Up to 6 letters)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={stencilText}
                  onChange={(e) => setStencilText(e.target.value.toUpperCase())}
                  className="form-input mono"
                  placeholder="e.g. HI, DEV, GO"
                  style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}
                />
              </div>
            )}

            {/* Starting Week Offset Slider */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                <span className="form-label">Position (Start Week Column)</span>
                <span className="mono" style={{ color: 'var(--emerald-400)' }}>Week {stencilOffset} / 52</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={stencilOffset}
                onChange={(e) => setStencilOffset(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--emerald-500)', cursor: 'pointer' }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowStencilModal(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyStencil}
                className="btn-primary"
              >
                <Check size={16} /> Stamp onto Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
