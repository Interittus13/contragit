'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CustomCommitMatrix } from '@/lib/types/scheduler';
import { renderTextToPixelMatrix, STENCILS } from '@/lib/utils/pixelFont';
import { 
  Brush, 
  Eraser, 
  RotateCcw, 
  Sparkles, 
  Type, 
  Shuffle, 
  Heart,
  Grid,
  Check,
  ZoomIn,
  Hand,
  Info,
  X
} from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';

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
  const [touchMode, setTouchMode] = useState<'draw' | 'pan'>('draw');
  const [zoomLevel, setZoomLevel] = useState<'normal' | 'large'>('normal');
  const [hoveredCell, setHoveredCell] = useState<{ date: string; day: string; count: number; level: number } | null>(null);

  // Stencil / Text modal state
  const [showStencilModal, setShowStencilModal] = useState<boolean>(false);
  const [stencilText, setStencilText] = useState<string>('HI');
  const [stencilOffset, setStencilOffset] = useState<number>(5);
  const [selectedStencilShape, setSelectedStencilShape] = useState<'text' | 'heart' | 'invader' | 'zigzag'>('text');

  // Compute 52-week calendar grid ending today
  const calendarGrid = useMemo(() => {
    const today = new Date();
    const end = new Date(today);
    const endDay = end.getDay();
    end.setDate(end.getDate() + (6 - endDay));

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

  // Window-level mouseup handler
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

  const handleCellClick = (dateStr: string) => {
    if (touchMode === 'draw') {
      paintCell(dateStr, selectedBrush);
    }
  };

  const handleCellEnter = (dateStr: string) => {
    if (isMouseDown && touchMode === 'draw') {
      paintCell(dateStr, selectedBrush);
    }
  };

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

  const applyStencil = () => {
    let rows: boolean[][] = [];

    if (selectedStencilShape === 'text') {
      rows = renderTextToPixelMatrix(stencilText || 'HI');
    } else if (STENCILS[selectedStencilShape]) {
      rows = STENCILS[selectedStencilShape].map(row => row.map(cell => Boolean(cell)));
    }

    if (rows.length === 0) return;

    const newMatrix = { ...matrix };
    const shapeCols = rows[0].length;
    const startWeek = Math.max(0, Math.min(52 - shapeCols, stencilOffset));

    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < shapeCols; c++) {
        const weekIdx = startWeek + c;
        if (weekIdx < 52 && calendarGrid[weekIdx]) {
          const cell = calendarGrid[weekIdx][r];
          if (cell) {
            const isFilled = rows[r]?.[c];
            if (isFilled) {
              newMatrix[cell.dateStr] = LEVEL_COMMITS[selectedBrush || 3];
            }
          }
        }
      }
    }

    onChange(newMatrix);
    setShowStencilModal(false);
  };

  const totalCommitsInCanvas = useMemo(() => {
    return Object.values(matrix).reduce((acc, c) => acc + (c || 0), 0);
  }, [matrix]);

  const activeDaysInCanvas = useMemo(() => {
    return Object.values(matrix).filter(c => (c || 0) > 0).length;
  }, [matrix]);

  // Clean month headers without collisions
  const monthLabels = useMemo(() => {
    const labels: Array<{ name: string; colIndex: number }> = [];
    let lastMonth = calendarGrid[0]?.[0]?.dateObj?.getMonth() ?? -1;
    let lastColIdx = -10;

    calendarGrid.forEach((week, colIdx) => {
      const firstDay = week[0]?.dateObj;
      if (firstDay) {
        const m = firstDay.getMonth();
        if (m !== lastMonth && colIdx <= 49) {
          if (colIdx - lastColIdx >= 3) {
            labels.push({ name: MONTH_NAMES[m], colIndex: colIdx });
            lastColIdx = colIdx;
          }
          lastMonth = m;
        }
      }
    });

    return labels;
  }, [calendarGrid]);

  const cellSize = zoomLevel === 'large' ? 15 : 11;
  const cellGap = zoomLevel === 'large' ? 4 : 3;
  const colStep = cellSize + cellGap;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Studio Header Toolbar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
        }}
      >
        {/* Brush Palette */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Brush:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[
              { lv: 0, label: 'Erase' },
              { lv: 1, label: 'L1' },
              { lv: 2, label: 'L2' },
              { lv: 3, label: 'L3' },
              { lv: 4, label: 'L4' },
            ].map(({ lv, label }) => {
              const isSelected = selectedBrush === lv;
              return (
                <button
                  key={lv}
                  type="button"
                  onClick={() => {
                    setSelectedBrush(lv);
                    setTouchMode('draw');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '1px solid var(--emerald-400)' : '1px solid var(--border-default)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? 'var(--emerald-400)' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '2px',
                      backgroundColor: LEVEL_COLORS[lv],
                      display: 'inline-block',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Studio Canvas Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* Mobile Touch Mode Toggle */}
          <button
            type="button"
            onClick={() => setTouchMode(touchMode === 'draw' ? 'pan' : 'draw')}
            className={`btn btn-sm ${touchMode === 'draw' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.7rem' }}
            title="Toggle between Drawing and Scrolling/Panning mode on touchscreens"
          >
            {touchMode === 'draw' ? <Brush size={13} color="var(--emerald-400)" /> : <Hand size={13} />}
            <span>{touchMode === 'draw' ? 'Draw Mode' : 'Pan Mode'}</span>
          </button>

          {/* Zoom Toggle */}
          <button
            type="button"
            onClick={() => setZoomLevel(zoomLevel === 'normal' ? 'large' : 'normal')}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem' }}
            title="Toggle grid scale for easier touch tapping"
          >
            <ZoomIn size={13} />
            <span>{zoomLevel === 'large' ? '1.5x' : '1x'}</span>
          </button>

          {/* Stencil */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowStencilModal(true)}
            icon={<Type size={13} />}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
          >
            Text / Stencil
          </Button>

          {/* Organic Shuffle */}
          <button
            type="button"
            onClick={handleRandomOrganic}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem' }}
            title="Generate organic realistic commit distribution"
          >
            <Shuffle size={13} />
          </button>

          {/* Invert */}
          <button
            type="button"
            onClick={handleInvert}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem' }}
            title="Invert painted canvas"
          >
            Invert
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-danger btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem' }}
            title="Clear all painted cells"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          userSelect: 'none',
        }}
      >
        <div style={{ minWidth: `${52 * colStep + 48}px` }}>
          {/* Months Header Bar */}
          <div
            style={{
              display: 'flex',
              marginBottom: '6px',
              paddingLeft: '32px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              height: '18px',
              position: 'relative',
            }}
          >
            {monthLabels.map(m => (
              <span
                key={m.colIndex}
                style={{
                  position: 'absolute',
                  left: `${32 + m.colIndex * colStep}px`,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                {m.name}
              </span>
            ))}
          </div>

          {/* Grid Rows */}
          <div style={{ display: 'flex', gap: `${cellGap}px` }}>
            {/* Weekday Legend */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `${cellGap}px`,
                width: '28px',
                fontSize: '0.65rem',
                color: 'var(--text-disabled)',
                textAlign: 'right',
                paddingRight: '6px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }} />
              <div style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}>Mon</div>
              <div style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }} />
              <div style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}>Wed</div>
              <div style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }} />
              <div style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}>Fri</div>
              <div style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }} />
            </div>

            {/* 52 Columns */}
            {calendarGrid.map((week, weekIdx) => (
              <div
                key={weekIdx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${cellGap}px`,
                }}
              >
                {week.map((cell) => {
                  const count = matrix[cell.dateStr] || 0;
                  let level = 0;
                  if (count >= 10) level = 4;
                  else if (count >= 6) level = 3;
                  else if (count >= 3) level = 2;
                  else if (count > 0) level = 1;

                  return (
                    <div
                      key={cell.dateStr}
                      data-date={cell.dateStr}
                      onClick={() => handleCellClick(cell.dateStr)}
                      onMouseEnter={() => {
                        handleCellEnter(cell.dateStr);
                        setHoveredCell({
                          date: cell.dateStr,
                          day: DAY_LABELS[cell.dayIndex],
                          count,
                          level,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      onMouseDown={() => {
                        setIsMouseDown(true);
                        if (touchMode === 'draw') {
                          paintCell(cell.dateStr, selectedBrush);
                        }
                      }}
                      onTouchStart={() => {
                        if (touchMode === 'draw') {
                          paintCell(cell.dateStr, selectedBrush);
                        }
                        setHoveredCell({
                          date: cell.dateStr,
                          day: DAY_LABELS[cell.dayIndex],
                          count: LEVEL_COMMITS[selectedBrush] || count,
                          level: selectedBrush,
                        });
                      }}
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        borderRadius: '2px',
                        backgroundColor: LEVEL_COLORS[level],
                        border: level > 0 ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.04)',
                        cursor: touchMode === 'draw' ? 'crosshair' : 'default',
                        transition: 'transform 0.1s ease',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Status & Inspector Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.65rem 1rem',
          background: 'rgba(10, 14, 23, 0.65)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Inspecting:
          </span>
          {hoveredCell ? (
            <Badge variant="emerald">
              {hoveredCell.date} ({hoveredCell.day}) • {hoveredCell.count} commits (L{hoveredCell.level})
            </Badge>
          ) : (
            <span style={{ color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>
              Hover or tap any square
            </span>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(lv => (
            <span
              key={lv}
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '2px',
                backgroundColor: LEVEL_COLORS[lv],
                display: 'inline-block',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Stencil / Pixel Font Modal */}
      {showStencilModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Type size={18} color="var(--emerald-400)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Pixel Stamp & Text Stencils</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStencilModal(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.35rem' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Stencil Presets */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {(['text', 'heart', 'invader', 'zigzag'] as const).map(shape => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => setSelectedStencilShape(shape)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: selectedStencilShape === shape ? '1px solid var(--emerald-400)' : '1px solid var(--border-default)',
                    background: selectedStencilShape === shape ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedStencilShape === shape ? 'var(--emerald-400)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {shape}
                </button>
              ))}
            </div>

            {selectedStencilShape === 'text' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">
                  Text to Stamp (A-Z, 0-9, ! + -):
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={stencilText}
                  onChange={e => setStencilText(e.target.value)}
                  className="form-control mono"
                  placeholder="e.g. HIRE ME, DEV, CONTRA"
                />
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">
                <span>Start Week Offset (Column 0 to 45):</span>
                <span className="mono" style={{ color: 'var(--emerald-400)' }}>Week {stencilOffset}</span>
              </label>
              <input
                type="range"
                min={0}
                max={45}
                value={stencilOffset}
                onChange={e => setStencilOffset(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--emerald-400)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowStencilModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={applyStencil}
                icon={<Check size={16} />}
              >
                Apply Stencil to Canvas
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
