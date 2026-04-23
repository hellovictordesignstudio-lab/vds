'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  X,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type DpMode = 'single' | 'range' | 'month' | 'time';
type DpSize = 'sm' | 'md' | 'lg';
type DpUiState = 'default' | 'error' | 'success' | 'disabled';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function chipStyleA(overrides?: CSSProperties): CSSProperties {
  return {
    background: 'rgba(10,136,83,0.10)',
    color: '#0A8853',
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    ...overrides,
  };
}

function chipStyleB(t: VDSTheme, overrides?: CSSProperties): CSSProperties {
  return {
    background: t.bg.fill.brandSubtle.default,
    color: t.text.brand.default,
    fontFamily: 'var(--font-mono), monospace',
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    width: 'fit-content',
    ...overrides,
  };
}

function dottedZone(t: VDSTheme, height: number, canvasDark?: boolean): CSSProperties {
  return {
    backgroundColor: canvasDark ? '#0F1117' : t.bg.surface.secondary.default,
    backgroundImage: `radial-gradient(circle, ${canvasDark ? 'rgba(255,255,255,0.06)' : t.border.default.default} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    minHeight: height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  };
}

function AnnotationDot({ letter }: { letter: string }) {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#E8186D',
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}

function IllustratedDoDont({
  t,
  ok,
  title,
  caption,
  children,
}: {
  t: VDSTheme;
  ok: boolean;
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div style={{ background: t.bg.surface.secondary.default, padding: 24, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
      <div style={{ padding: '12px 16px 0', fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>{title}</div>
      <div style={{ height: 3, background: ok ? '#0A8853' : '#E8186D' }} />
      <p style={{ padding: '16px 20px', fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{caption}</p>
    </div>
  );
}

const SIZE_MAP: Record<DpSize, { h: number; fs: number }> = {
  sm: { h: 32, fs: 12 },
  md: { h: 40, fs: 13 },
  lg: { h: 48, fs: 14 },
};

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function fmtShort(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

interface CalendarCell {
  date: Date;
  inCurrentMonth: boolean;
}

function buildCalendarCells(viewYear: number, viewMonth: number): CalendarCell[] {
  const first = new Date(viewYear, viewMonth, 1);
  const startPad = first.getDay();
  const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevLast = new Date(viewYear, viewMonth, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = startPad - 1; i >= 0; i--) {
    cells.push({ date: new Date(viewYear, viewMonth - 1, prevLast - i), inCurrentMonth: false });
  }
  for (let d = 1; d <= lastDate; d++) {
    cells.push({ date: new Date(viewYear, viewMonth, d), inCurrentMonth: true });
  }
  const remainder = cells.length % 7;
  const pad = remainder === 0 ? 0 : 7 - remainder;
  for (let i = 1; i <= pad; i++) {
    cells.push({ date: new Date(viewYear, viewMonth + 1, i), inCurrentMonth: false });
  }
  return cells;
}

function DatePickerDemo({
  t,
  mode,
  size,
  clearable,
  showToday,
  disabledWeekends,
  uiState,
  isOpen,
  setIsOpen,
  reducedMotion,
}: {
  t: VDSTheme;
  mode: DpMode;
  size: DpSize;
  clearable: boolean;
  showToday: boolean;
  disabledWeekends: boolean;
  uiState: DpUiState;
  isOpen: boolean;
  setIsOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  reducedMotion: boolean;
}) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());
  const [single, setSingle] = useState(() => new Date(today.getFullYear(), today.getMonth(), 15));
  const [range, setRange] = useState<{ from: Date; to: Date }>(() => {
    const y = today.getFullYear();
    const m = today.getMonth();
    return { from: new Date(y, m, 10), to: new Date(y, m, 20) };
  });
  const [monthPick, setMonthPick] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));
  const [hour12, setHour12] = useState(2);
  const [minute, setMinute] = useState(30);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('PM');
  const [cleared, setCleared] = useState(false);

  const disabled = uiState === 'disabled';

  const { h: th, fs: tfs } = SIZE_MAP[size];

  const panelOpen = isOpen;
  const showDayGrid = mode === 'single' || mode === 'range' || mode === 'time';
  const showMonthGrid = mode === 'month';
  const showFooterTime = mode === 'time';
  const showApplyFooter = mode === 'range' || mode === 'time';
  const showFooter =
    (mode === 'single' && showToday) || mode === 'range' || mode === 'time' || (mode === 'month' && showToday);

  const displaySingle = `${MONTHS[single.getMonth()]} ${single.getDate()}, ${single.getFullYear()}`;
  const displayRange = `${fmtShort(range.from)} → ${fmtShort(range.to)}`;
  const displayMonth = `${MONTHS[monthPick.m]} ${monthPick.y}`;
  const displayDatetime = `${MONTHS[single.getMonth()]} ${single.getDate()}, ${single.getFullYear()} · ${String(hour12).padStart(2, '0')}:${String(
    minute,
  ).padStart(2, '0')} ${ampm}`;

  let valueText = '';
  let hasValue = false;
  if (mode === 'single') {
    valueText = cleared ? '' : displaySingle;
    hasValue = !cleared;
  } else if (mode === 'range') {
    valueText = displayRange;
    hasValue = true;
  } else if (mode === 'month') {
    valueText = displayMonth;
    hasValue = true;
  } else {
    valueText = cleared ? '' : displayDatetime;
    hasValue = !cleared;
  }

  let borderColor = t.border.default.default;
  let shadow: string | undefined;
  if (uiState === 'error') {
    borderColor = '#D22232';
  } else if (uiState === 'success') {
    borderColor = t.border.success.default;
  } else if (panelOpen && uiState === 'default' && !disabled) {
    borderColor = t.border.brand.focus;
    shadow = `0 0 0 3px ${t.bg.fill.brandSubtle.default}`;
  }

  const branchSubtle = t.bg.fill.brandSubtle.default;

  const isDayDisabled = (d: Date) => {
    if (disabledWeekends) {
      const wd = d.getDay();
      if (wd === 0 || wd === 6) return true;
    }
    return false;
  };

  const inRange = (d: Date) => {
    const t0 = startOfDay(d).getTime();
    const a = startOfDay(range.from).getTime();
    const b = startOfDay(range.to).getTime();
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return t0 > lo && t0 < hi;
  };

  const isRangeStart = (d: Date) => sameDay(d, range.from);
  const isRangeEnd = (d: Date) => sameDay(d, range.to);

  const onPickDay = (d: Date) => {
    if (isDayDisabled(d)) return;
    setCleared(false);
    if (mode === 'single' || mode === 'time') {
      setSingle(d);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    } else if (mode === 'range') {
      setRange((prev) => {
        if (sameDay(prev.from, prev.to)) {
          const a = startOfDay(prev.from).getTime();
          const b = startOfDay(d).getTime();
          if (b < a) return { from: d, to: prev.from };
          return { from: prev.from, to: d };
        }
        return { from: d, to: d };
      });
    }
  };

  const cells = buildCalendarCells(viewYear, viewMonth);

  const panelAnim: CSSProperties = reducedMotion
    ? {}
    : {
        animation: 'docsDpOpen 150ms ease-out forwards',
        opacity: 0,
      };

  return (
    <div style={{ position: 'relative', width: 280, fontFamily: 'inherit' }}>
      <style>{`
        @keyframes docsDpOpen {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <button
        type="button"
        data-dp-trigger
        disabled={disabled}
        aria-expanded={panelOpen}
        aria-haspopup="dialog"
        role="combobox"
        onClick={() => !disabled && setIsOpen((o) => !o)}
        style={{
          width: 280,
          height: th,
          background: disabled ? t.bg.surface.tertiary.default : t.bg.surface.primary.default,
          border: `1px solid ${borderColor}`,
          borderRadius: 8,
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          boxShadow: shadow,
          fontFamily: 'inherit',
        }}
      >
        <Calendar size={16} color={t.icon.secondary.default} style={{ flexShrink: 0 }} aria-hidden />
        <span style={{ flex: 1, textAlign: 'left', fontSize: tfs, color: hasValue ? t.text.primary.default : t.text.tertiary.default }}>
          {hasValue ? valueText : 'Select a date'}
        </span>
        {uiState === 'error' ? <AlertCircle size={16} color="#D22232" style={{ flexShrink: 0 }} aria-hidden /> : null}
        {uiState === 'success' ? <CheckCircle2 size={16} color="#0A8853" style={{ flexShrink: 0 }} aria-hidden /> : null}
        {clearable && hasValue && !disabled ? (
          <button
            type="button"
            aria-label="Clear"
            onClick={(e) => {
              e.stopPropagation();
              setCleared(true);
            }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
          >
            <X size={16} color={t.text.secondary.default} />
          </button>
        ) : null}
        <ChevronDown size={14} color={t.text.tertiary.default} style={{ flexShrink: 0 }} aria-hidden />
      </button>
      {uiState === 'error' ? (
        <div style={{ fontSize: 12, color: '#D22232', marginTop: 6, paddingLeft: 2 }}>Please select a date</div>
      ) : null}

      {panelOpen && !disabled && (showDayGrid || showMonthGrid) ? (
        <div
          role="dialog"
          aria-label="Choose date"
          style={{
            position: 'absolute',
            top: th + 4,
            left: 0,
            background: t.bg.surface.primary.default,
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 12,
            boxShadow: t.shadow.lg,
            width: 280,
            overflow: 'hidden',
            zIndex: 5,
            ...panelAnim,
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${t.border.default.default}`,
            }}
          >
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                aria-label="Previous year"
                onClick={() => {
                  setViewYear((y) => y - 1);
                  setMonthPick((m) => ({ ...m, y: m.y - 1 }));
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = t.bg.surface.secondary.default;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <ChevronsLeft size={16} color={t.text.primary.default} />
              </button>
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear((y) => y - 1);
                  } else setViewMonth((m) => m - 1);
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = t.bg.surface.secondary.default;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <ChevronLeft size={18} color={t.text.primary.default} />
              </button>
            </div>
            <button
              type="button"
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 700,
                color: t.text.primary.default,
                fontFamily: 'inherit',
              }}
            >
              {showMonthGrid ? `${viewYear}` : `${MONTHS[viewMonth]} ${viewYear}`}
            </button>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear((y) => y + 1);
                  } else setViewMonth((m) => m + 1);
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = t.bg.surface.secondary.default;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <ChevronRight size={18} color={t.text.primary.default} />
              </button>
              <button
                type="button"
                aria-label="Next year"
                onClick={() => {
                  setViewYear((y) => y + 1);
                  setMonthPick((m) => ({ ...m, y: m.y + 1 }));
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = t.bg.surface.secondary.default;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <ChevronsRight size={16} color={t.text.primary.default} />
              </button>
            </div>
          </div>

          {showDayGrid ? (
            <>
              <div style={{ padding: '8px 16px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => (
                  <div
                    key={w}
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: t.text.tertiary.default,
                      textAlign: 'center',
                    }}
                  >
                    {w}
                  </div>
                ))}
              </div>
              <div style={{ padding: '0 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {cells.map((c, i) => {
                  const d = c.date;
                  const isToday = sameDay(d, today);
                  const sel = mode === 'single' || mode === 'time' ? sameDay(d, single) : false;
                  const dis = isDayDisabled(d);
                  const ir = mode === 'range' && inRange(d);
                  const rs = mode === 'range' && isRangeStart(d);
                  const re = mode === 'range' && isRangeEnd(d);
                  let bg = 'transparent';
                  let color = c.inCurrentMonth ? t.text.primary.default : t.text.tertiary.default;
                  let op = c.inCurrentMonth ? 1 : 0.4;
                  if (dis) {
                    op = 0.4;
                    color = t.text.tertiary.default;
                  }
                  if (ir) {
                    bg = branchSubtle;
                    color = t.text.brand.default;
                  }
                  if (rs || re) {
                    bg = t.bg.fill.primary.default;
                    color = '#FFFFFF';
                  }
                  if (sel && (mode === 'single' || mode === 'time')) {
                    bg = t.bg.fill.primary.default;
                    color = '#FFFFFF';
                  }
                  return (
                    <button
                      type="button"
                      key={`${i}-${d.getTime()}`}
                      disabled={dis}
                      onClick={() => onPickDay(d)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: 'none',
                        background: bg,
                        color,
                        fontSize: 12,
                        fontWeight: isToday && !sel && !(rs || re) ? 800 : rs || re || sel ? 700 : 500,
                        cursor: dis ? 'not-allowed' : 'pointer',
                        opacity: op,
                        fontFamily: 'inherit',
                        ...(isToday && !sel && !(rs || re) ? { color: t.text.brand.default, background: 'transparent' } : {}),
                      }}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {showMonthGrid ? (
            <div style={{ padding: '12px 16px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {MONTHS.map((m, mi) => {
                const active = mi === monthPick.m && viewYear === monthPick.y;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMonthPick({ y: viewYear, m: mi });
                      setViewMonth(mi);
                    }}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 8,
                      border: 'none',
                      background: active ? t.bg.fill.primary.default : t.bg.surface.secondary.default,
                      color: active ? '#FFFFFF' : t.text.primary.default,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          ) : null}

          {showFooter ? (
            <div
              style={{
                padding: '10px 16px',
                borderTop: `1px solid ${t.border.default.default}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {showToday ? (
                  <button
                    type="button"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: t.text.brand.default,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      padding: 0,
                    }}
                    onClick={() => {
                      const n = new Date();
                      setCleared(false);
                      setSingle(n);
                      setViewYear(n.getFullYear());
                      setViewMonth(n.getMonth());
                    }}
                  >
                    Today
                  </button>
                ) : (
                  <span />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {showFooterTime ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <button
                      type="button"
                      style={{ ...miniSpin(t), fontFamily: 'inherit' }}
                      onClick={() => setHour12((h) => (h % 12) + 1)}
                    >
                      {String(hour12).padStart(2, '0')}
                    </button>
                    <span>:</span>
                    <button type="button" style={{ ...miniSpin(t), fontFamily: 'inherit' }} onClick={() => setMinute((m) => (m + 5) % 60)}>
                      {String(minute).padStart(2, '0')}
                    </button>
                    <button
                      type="button"
                      style={{ ...miniSpin(t), fontFamily: 'inherit', minWidth: 36 }}
                      onClick={() => setAmpm((a) => (a === 'AM' ? 'PM' : 'AM'))}
                    >
                      {ampm}
                    </button>
                  </div>
                ) : null}
                {showApplyFooter ? (
                  <button
                    type="button"
                    style={{
                      background: t.bg.fill.primary.default,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    Apply
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function miniSpin(t: VDSTheme): CSSProperties {
  return {
    padding: '4px 6px',
    borderRadius: 6,
    border: `1px solid ${t.border.default.default}`,
    background: t.bg.surface.secondary.default,
    color: t.text.primary.default,
    cursor: 'pointer',
    fontWeight: 600,
    minWidth: 28,
  };
}

/** Compact static calendar for docs illustrations */
function MiniCalStatic({
  t,
  variant,
}: {
  t: VDSTheme;
  variant: 'single' | 'range' | 'month' | 'datetime';
}) {
  const branchSubtle = t.bg.fill.brandSubtle.default;
  if (variant === 'month') {
    return (
      <div style={{ padding: 8, width: '100%', maxWidth: 240 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {MONTHS.map((m, i) => (
            <div
              key={m}
              style={{
                padding: '8px 4px',
                borderRadius: 8,
                textAlign: 'center',
                fontSize: 11,
                fontWeight: i === 3 ? 700 : 500,
                background: i === 3 ? t.bg.fill.primary.default : t.bg.surface.tertiary.default,
                color: i === 3 ? '#FFFFFF' : t.text.primary.default,
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>
    );
  }
  const days = buildCalendarCells(2026, 3);
  return (
    <div style={{ padding: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, fontSize: 9, marginBottom: 4 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((x) => (
          <div key={x} style={{ textAlign: 'center', color: t.text.tertiary.default, fontWeight: 700 }}>
            {x}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {days.slice(0, 28).map((c, i) => {
          const d = c.date;
          const visible = d.getMonth() === 3;
          const day = d.getDate();
          let bg = 'transparent';
          let color = visible ? t.text.primary.default : t.text.tertiary.default;
          let op = visible ? 1 : 0.35;
          if (variant === 'single' && day === 15 && visible) {
            bg = t.bg.fill.primary.default;
            color = '#FFFFFF';
          }
          if (variant === 'range' && visible) {
            if (day >= 10 && day <= 20) {
              if (day === 10 || day === 20) {
                bg = t.bg.fill.primary.default;
                color = '#FFFFFF';
              } else {
                bg = branchSubtle;
                color = t.text.brand.default;
              }
            }
          }
          return (
            <div
              key={i}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                background: bg,
                color,
                opacity: op,
              }}
            >
              {visible ? day : day}
            </div>
          );
        })}
      </div>
      {variant === 'datetime' ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10, fontSize: 10 }}>
          <span style={{ padding: '2px 6px', borderRadius: 4, border: `1px solid ${t.border.default.default}`, color: t.text.primary.default }}>02</span>
          <span>:</span>
          <span style={{ padding: '2px 6px', borderRadius: 4, border: `1px solid ${t.border.default.default}`, color: t.text.primary.default }}>30</span>
          <span style={{ padding: '2px 6px', borderRadius: 4, border: `1px solid ${t.border.default.default}`, color: t.text.primary.default }}>PM</span>
        </div>
      ) : null}
    </div>
  );
}

function MiniTrigger({
  t,
  text,
  placeholder,
  h = 32,
  fs = 12,
  error,
  success,
  disabled,
  openStyle,
}: {
  t: VDSTheme;
  text?: string;
  placeholder?: string;
  h?: number;
  fs?: number;
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  openStyle?: boolean;
}) {
  let border = t.border.default.default;
  let shadow: string | undefined;
  if (error) border = '#D22232';
  else if (success) border = t.border.success.default;
  else if (openStyle) {
    border = t.border.brand.focus;
    shadow = `0 0 0 3px ${t.bg.fill.brandSubtle.default}`;
  }
  return (
    <div style={{ width: 200 }}>
      <div
        style={{
          width: '100%',
          height: h,
          background: disabled ? t.bg.surface.tertiary.default : t.bg.surface.primary.default,
          border: `1px solid ${border}`,
          borderRadius: 8,
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'default',
          boxShadow: shadow,
        }}
      >
        <Calendar size={14} color={t.icon.secondary.default} />
        <span style={{ flex: 1, fontSize: fs, color: text ? t.text.primary.default : t.text.tertiary.default }}>{text || placeholder}</span>
        {error ? <AlertCircle size={14} color="#D22232" /> : null}
        {success ? <CheckCircle2 size={14} color="#0A8853" /> : null}
        {text && !disabled ? <X size={14} color={t.text.secondary.default} /> : null}
        <ChevronDown size={12} color={t.text.tertiary.default} />
      </div>
    </div>
  );
}

export default function DatePickerDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [mode, setMode] = useState<DpMode>('single');
  const [size, setSize] = useState<DpSize>('md');
  const [clearable, setClearable] = useState<'off' | 'on'>('on');
  const [showToday, setShowToday] = useState<'off' | 'on'>('on');
  const [disabledWeekends, setDisabledWeekends] = useState<'off' | 'on'>('off');
  const [uiState, setUiState] = useState<DpUiState>('default');
  const [previewOpen, setPreviewOpen] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fn = () => setReducedMotion(mq.matches);
    fn();
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const t = buildTheme(isDark);
  const previewDark = appearance === 'dark';
  const previewT = previewDark ? buildTheme(true) : t;

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-dp', label: 'Principles' },
        { id: 'anatomy-dp', label: 'Anatomy' },
        { id: 'variants-dp', label: 'Variants' },
        { id: 'states-dp', label: 'States' },
        { id: 'sizes-dp', label: 'Sizes' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-dp', label: 'When to use' },
        { id: 'constraints-dp', label: 'Date constraints' },
        { id: 'dos-donts-dp', label: "Do & Don't" },
      ];
    }
    return [];
  }, [activeTab]);

  const datePickerPropsRows = [
    { name: 'mode', type: "'single' | 'range' | 'month' | 'datetime'", default: "'single'", description: 'Selection mode' },
    { name: 'value', type: 'Date | DateRange | null', default: '—', description: 'Controlled value' },
    { name: 'defaultValue', type: 'Date | DateRange', default: '—', description: 'Uncontrolled initial value' },
    { name: 'onChange', type: '(value: Date | DateRange | null) => void', default: '—', description: 'Change handler' },
    { name: 'label', type: 'string', default: '—', description: 'Field label' },
    { name: 'placeholder', type: 'string', default: "'Select a date'", description: 'Trigger placeholder' },
    { name: 'helperText', type: 'string', default: '—', description: 'Helper below trigger' },
    { name: 'errorText', type: 'string', default: '—', description: 'Error message' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Trigger height' },
    { name: 'minDate', type: 'Date', default: '—', description: 'Minimum selectable date' },
    { name: 'maxDate', type: 'Date', default: '—', description: 'Maximum selectable date' },
    { name: 'disabledDates', type: 'Date[]', default: '[]', description: 'Specific disabled dates' },
    { name: 'disabledDays', type: 'number[]', default: '[]', description: 'Disabled weekdays (0=Sun)' },
    { name: 'isClearable', type: 'boolean', default: 'true', description: 'Show clear button' },
    { name: 'isDisabled', type: 'boolean', default: 'false', description: 'Disabled state' },
    { name: 'hasError', type: 'boolean', default: 'false', description: 'Error state' },
    { name: 'showToday', type: 'boolean', default: 'true', description: '"Today" footer link' },
    { name: 'firstDayOfWeek', type: '0 | 1', default: '0', description: '0=Sunday, 1=Monday' },
    { name: 'dateFormat', type: 'string', default: "'MMM d, yyyy'", description: 'Display format' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const codeDateRangeType = `interface DateRange {
  from: Date | null
  to: Date | null
}`;

  const codeEx1 = `<DatePicker
  label="Due date"
  placeholder="Select a due date"
  onChange={(date) => setDueDate(date)}
/>`;

  const codeEx2 = `<DatePicker
  label="Appointment date"
  value={appointmentDate}
  onChange={setAppointmentDate}
  minDate={new Date()}
  disabledDays={[0, 6]} // no weekends
  helperText="Available Monday to Friday only"
/>`;

  const codeEx3 = `<DatePicker
  mode="range"
  label="Report period"
  value={dateRange}
  onChange={setDateRange}
  maxDate={new Date()}
  placeholder="Select date range"
/>`;

  const codeEx4 = `<DatePicker
  mode="month"
  label="Billing month"
  value={billingMonth}
  onChange={setBillingMonth}
  minDate={new Date(2024, 0, 1)}
  maxDate={new Date()}
/>`;

  const codeEx5 = `<DatePicker
  mode="datetime"
  label="Event start"
  value={eventStart}
  onChange={setEventStart}
  minDate={new Date()}
  helperText="Times shown in your local timezone"
/>`;

  const codeEx6 = `<DatePicker
  label="Check-in date"
  value={checkIn}
  onChange={setCheckIn}
  hasError
  errorText="Please select a check-in date to continue"
  minDate={new Date()}
/>`;

  const codeEx7 = `<DatePicker
  label="Delivery date"
  onChange={setDeliveryDate}
  minDate={new Date()}
  disabledDays={[0, 6]}
  disabledDates={holidayDates}
  helperText="We deliver Mon–Fri, excluding public holidays"
/>`;

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Date Picker
      </p>
      <h1 className="page-title">Date Picker</h1>
      <p className="page-lead">
        Date Picker lets users select a date, time, or date range from a visual calendar. It removes ambiguity from date entry — no more wondering if
        &apos;04/05/06&apos; means April 5th or May 4th. A well-designed date picker balances precision with speed: keyboard users can type directly, mouse
        users can click, and both feel at home.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <span style={chipStyleA()}>Stable</span>
        <span style={chipStyleA()}>v1.0</span>
        <span style={chipStyleA()}>Accessible</span>
      </div>

      <ComponentTabs tabs={[...TABS]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'Overview' ? (
        <>
          <section id="live-preview" style={{ marginTop: 32, marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Live preview
            </h2>
            <LivePreviewShell
              t={t}
              canvasIsDark={previewDark}
              controls={
                <>
                  <LivePreviewSegmentRow
                    t={t}
                    label="Mode"
                    options={['single', 'range', 'month', 'time']}
                    value={mode}
                    onChange={(v) => {
                      setMode(v as DpMode);
                      setPreviewOpen(true);
                    }}
                  />
                  <LivePreviewSegmentRow t={t} label="Size" options={['sm', 'md', 'lg']} value={size} onChange={(v) => setSize(v as DpSize)} />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Clearable"
                    options={['off', 'on']}
                    value={clearable}
                    onChange={(v) => setClearable(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show today"
                    options={['off', 'on']}
                    value={showToday}
                    onChange={(v) => setShowToday(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Disabled dates"
                    options={['off', 'on']}
                    value={disabledWeekends}
                    onChange={(v) => setDisabledWeekends(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="State"
                    options={['default', 'error', 'success', 'disabled']}
                    value={uiState}
                    onChange={(v) => setUiState(v as DpUiState)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Appearance"
                    options={['light', 'dark']}
                    value={appearance}
                    onChange={(v) => setAppearance(v as 'light' | 'dark')}
                  />
                </>
              }
            >
              <div
                style={{
                  width: '100%',
                  minHeight: 480,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 32,
                  position: 'relative',
                }}
              >
                <DatePickerDemo
                  t={previewT}
                  mode={mode}
                  size={size}
                  clearable={clearable === 'on'}
                  showToday={showToday === 'on'}
                  disabledWeekends={disabledWeekends === 'on'}
                  uiState={uiState}
                  isOpen={previewOpen}
                  setIsOpen={setPreviewOpen}
                  reducedMotion={reducedMotion}
                />
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-dp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Principles
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ ...dottedZone(t, 200), flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Ambiguous</div>
                      <div style={{ fontSize: 10, color: t.text.secondary.default, marginBottom: 4 }}>Date</div>
                      <input
                        readOnly
                        value="04/05/06"
                        style={{
                          width: 120,
                          padding: '6px 8px',
                          borderRadius: 6,
                          border: `1px solid ${t.border.default.default}`,
                          fontSize: 12,
                          background: t.bg.surface.primary.default,
                          color: t.text.primary.default,
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Unambiguous</div>
                      <MiniTrigger t={t} text="April 15, 2026" h={28} fs={11} />
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Calendar size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Eliminate date ambiguity</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Free text date entry creates format confusion — is it MM/DD/YY or DD/MM/YY? A date picker forces a structured selection that produces an
                    unambiguous result regardless of the user&apos;s locale. The displayed format adapts to the locale; the stored value is always ISO 8601.
                  </p>
                </div>
              </div>

              <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ ...dottedZone(t, 200), flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Date only</div>
                    <MiniCalStatic t={t} variant="single" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Date + time</div>
                    <MiniCalStatic t={t} variant="datetime" />
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Clock size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Date and time are different tasks</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Date selection and time selection have different cognitive loads. Picking a date is spatial — the user navigates a calendar mentally. Picking
                    a time is numerical. Separate them visually: calendar for date, segmented inputs for hour/minute. Never put time selection inside the
                    calendar grid.
                  </p>
                </div>
              </div>

              <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ ...dottedZone(t, 200), flexDirection: 'column', gap: 8, position: 'relative' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: t.text.brand.default, fontFamily: 'var(--font-mono), monospace' }}>minDate = today</div>
                  <div style={{ opacity: 0.9 }}>
                    <MiniCalStatic t={t} variant="single" />
                  </div>
                  <div style={{ fontSize: 9, color: t.text.tertiary.default, maxWidth: 200, textAlign: 'center' }}>
                    Past days disabled; future range available
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <ChevronLeft size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Constrain to valid dates</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Always set minDate and maxDate when the context demands it. A booking system should disable past dates. An age verification should disable
                    future dates. Visual constraints prevent errors before they happen — it&apos;s cheaper to disable a day than to show an error after the user
                    fills the form.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-dp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                position: 'relative',
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                ...dottedZone(t, 400),
                padding: 24,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, maxWidth: 320, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', width: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>A · Trigger input</span>
                  <AnnotationDot letter="A" />
                </div>
                <MiniTrigger t={t} text="April 15, 2026" h={40} fs={13} openStyle />
                <div style={{ position: 'relative', width: 280 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, justifyContent: 'flex-end', width: '100%' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>B · Calendar panel</span>
                    <AnnotationDot letter="B" />
                  </div>
                  <div
                    style={{
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 12,
                      boxShadow: t.shadow.lg,
                      width: 280,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.border.default.default}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AnnotationDot letter="C" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#E8186D' }}>Header nav</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>April 2026</span>
                      <span style={{ width: 40 }} />
                    </div>
                    <div style={{ padding: '0 16px 4px', fontSize: 10, fontWeight: 700, color: '#E8186D' }}>D · Weekday labels</div>
                    <div style={{ padding: '0 16px 8px', display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((x) => (
                        <div key={x} style={{ fontSize: 8, fontWeight: 800, color: t.text.tertiary.default, textAlign: 'center' }}>
                          {x}
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '0 12px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: '#E8186D', fontWeight: 700 }}>E · Day grid</span>
                      <span style={{ fontSize: 10, color: '#E8186D', fontWeight: 700 }}>F · Selected</span>
                    </div>
                    <div style={{ padding: '0 12px 12px', fontFamily: 'monospace', fontSize: 9, color: t.text.secondary.default, lineHeight: 1.4 }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {`┌──────────────────────────────────┐
│ 📅  April 15, 2026          ⌄  │
└──────────────────────────────────┘
  ┌────────────────────────────────┐
  │ «  <   April 2026   >  »      │
  ├────────────────────────────────┤
  │  Su Mo Tu We Th Fr Sa         │
  ├────────────────────────────────┤
  │  ..  1  2  3  4  5  6         │
  │   7  8  9 10 11 12 13         │
  │  14 [15]16 17 18 19 20        │
  │  21 22 23 24 25 26 27         │
  │  28 29 30 ..  ..  ..  ..      │
  ├────────────────────────────────┤
  │  Today                [Apply] │
  └────────────────────────────────┘`}
                      </pre>
                    </div>
                    <div
                      style={{
                        padding: '10px 16px',
                        borderTop: `1px solid ${t.border.default.default}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AnnotationDot letter="G" />
                        <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Footer</span>
                      </div>
                      <div style={{ fontSize: 10, color: t.text.tertiary.default }}>
                        H · Today · I · Disabled
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="variants-dp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {[
                {
                  title: 'Single date',
                  chip: 'mode: single',
                  desc: 'Pick one date. The most common mode — due dates, birthdates, appointment scheduling, publication dates.',
                  el: (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <MiniTrigger t={t} text="April 15, 2026" h={32} fs={11} />
                      <MiniCalStatic t={t} variant="single" />
                    </div>
                  ),
                },
                {
                  title: 'Date range',
                  chip: 'mode: range',
                  desc: 'Pick a start and end date. Use for booking periods, report date ranges, filter windows. The calendar highlights the selected range.',
                  el: (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <MiniTrigger t={t} text="Apr 10 → Apr 20" h={32} fs={11} />
                      <MiniCalStatic t={t} variant="range" />
                    </div>
                  ),
                },
                {
                  title: 'Month picker',
                  chip: 'mode: month',
                  desc: "Pick a month and year only. Use for monthly reports, billing cycles, subscription periods where day precision isn't needed.",
                  el: (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <MiniTrigger t={t} text="April 2026" h={32} fs={11} />
                      <MiniCalStatic t={t} variant="month" />
                    </div>
                  ),
                },
                {
                  title: 'Date + time',
                  chip: 'mode: datetime',
                  desc: 'Pick date and time. Use for scheduling events, setting deadlines with time precision, booking appointments.',
                  el: (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <MiniTrigger t={t} text="Apr 15, 2026 · 14:30" h={32} fs={11} />
                      <MiniCalStatic t={t} variant="datetime" />
                    </div>
                  ),
                },
              ].map((card) => (
                <div
                  key={card.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 200) }}>{card.el}</div>
                  <div style={{ padding: '16px 20px' }}>
                    <span style={chipStyleB(t, { marginBottom: 10 })}>{card.chip}</span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, margin: '12px 0 8px' }}>{card.title}</h3>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="states-dp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              States
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {(
                [
                  { title: 'Default', token: 'color.border.default.default', node: <MiniTrigger t={t} placeholder="Select a date" /> },
                  {
                    title: 'Focused / Open',
                    token: 'color.border.brand.focus',
                    node: <MiniTrigger t={t} text="April 15, 2026" openStyle />,
                  },
                  { title: 'Filled', token: 'color.text.primary.default', node: <MiniTrigger t={t} text="April 15, 2026" /> },
                  {
                    title: 'Error',
                    token: 'color.border.danger.default',
                    node: (
                      <div>
                        <MiniTrigger t={t} placeholder="Select a date" error />
                        <div style={{ fontSize: 11, color: '#D22232', marginTop: 6 }}>Please select a date</div>
                      </div>
                    ),
                  },
                  { title: 'Disabled', token: 'color.interactive.disabled', node: <MiniTrigger t={t} text="April 15, 2026" disabled /> },
                ] as const
              ).map((s) => (
                <div
                  key={s.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 10 }}>{s.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>{s.node}</div>
                  <span style={chipStyleB(t)}>{s.token}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="sizes-dp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {(
                [
                  { sz: 'sm' as const, h: 32, fs: 12, cap: 'Dense forms, compact toolbars, filter bars' },
                  { sz: 'md' as const, h: 40, fs: 13, cap: 'Default — most form contexts' },
                  { sz: 'lg' as const, h: 48, fs: 14, cap: 'Prominent forms, onboarding, standalone pickers' },
                ] as const
              ).map((row) => (
                <div key={row.sz} style={{ textAlign: 'center' }}>
                  <MiniTrigger t={t} text="April 15, 2026" h={row.h} fs={row.fs} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text.primary.default, marginTop: 10 }}>
                    {row.sz} · {row.h}px · {row.fs}px
                  </div>
                  <div style={{ fontSize: 11, color: t.text.tertiary.default, marginTop: 4, maxWidth: 180 }}>{row.cap}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-dp" style={{ marginTop: 32, marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                  DO
                </h3>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.75 }}>
                  <li>Selección de fechas de nacimiento, fechas límite y due dates</li>
                  <li>Rangos de fechas para filtros y reportes</li>
                  <li>Agendar citas y eventos</li>
                  <li>Fechas de inicio/fin de contratos o suscripciones</li>
                </ul>
              </div>
              <div>
                <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                  DON&apos;T
                </h3>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.75 }}>
                  <li>Cuando el usuario conoce la fecha de memoria y prefiere escribirla (ofrecer input de texto como alternativa)</li>
                  <li>Para seleccionar solo un año (usar un Select con años)</li>
                  <li>Cuando el rango de fechas válidas es muy estrecho (3-4 días — usar Radio buttons con los días específicos)</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="tip" title="Always allow keyboard input">
                Power users want to type &apos;04/15/2026&apos; without clicking through a calendar. Support direct text input in the trigger — parse it as the
                user types and sync it with the calendar. The calendar and the text input should always reflect the same value.
              </Callout>
            </div>
          </section>

          <section id="constraints-dp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Date constraints
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    title: 'Min date (no past dates)',
                    code: 'minDate={today}',
                    desc: 'Use for future bookings, appointment scheduling, publication dates.',
                    mini: 'pastOff' as const,
                  },
                  {
                    title: 'Max date (no future dates)',
                    code: 'maxDate={today}',
                    desc: 'Use for birthdates, historical data entry, retroactive records.',
                    mini: 'futureOff' as const,
                  },
                  {
                    title: 'Disabled days of week',
                    code: 'disabledDays={[0, 6]}',
                    desc: 'Use for business day selection — excludes weekends from the valid range.',
                    mini: 'weekends' as const,
                  },
                  {
                    title: 'Disabled specific dates',
                    code: 'disabledDates={[...holidayDates]}',
                    desc: 'Use for holiday blackouts, booked slots, maintenance windows.',
                    mini: 'holidays' as const,
                  },
                ] as const
              ).map((c) => (
                <div
                  key={c.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 120), padding: 8 }}>
                    <ConstraintMiniCal t={t} kind={c.mini} />
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{c.title}</div>
                    <code style={{ fontSize: 11, color: t.text.brand.default, fontFamily: 'var(--font-mono), monospace' }}>{c.code}</code>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, margin: '10px 0 0', lineHeight: 1.5 }}>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="dos-donts-dp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — show the format"
                  caption='Trigger with placeholder "MM/DD/YYYY" when the field accepts direct text input.'
                >
                  <MiniTrigger t={t} placeholder="MM/DD/YYYY" />
                </IllustratedDoDont>
                <IllustratedDoDont t={t} ok={false} title="DON'T — hide the format" caption='Placeholder "Select date" with no indication of expected format.'>
                  <MiniTrigger t={t} placeholder="Select date" />
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — pre-fill sensible defaults"
                  caption='Due date pre-filled to 7 days from today when that is the business default.'
                >
                  <MiniTrigger t={t} text={`Due ${new Date(Date.now() + 7 * 864e5).toLocaleDateString()}`} />
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — empty when predictable"
                  caption="Due date field completely blank even though the product always implies a week-long window."
                >
                  <MiniTrigger t={t} placeholder="Select due date" />
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — two triggers for ranges"
                  caption='Separate "From" and "To" fields — each opens its own calendar.'
                >
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <MiniTrigger t={t} text="Apr 10" h={28} fs={11} />
                    <MiniTrigger t={t} text="Apr 20" h={28} fs={11} />
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — one combined trigger"
                  caption='Single trigger "Apr 10 – Apr 20" forcing two sequential picks in one popover — confusing on mobile.'
                >
                  <MiniTrigger t={t} text="Apr 10 – Apr 20" />
                </IllustratedDoDont>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            Content
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Label writing
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Describe what the date represents:</strong> &apos;Due date&apos;, &apos;Start date&apos;,
                  &apos;Date of birth&apos;, &apos;Check-in&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Never just &apos;Date&apos;</strong> — add context
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>For ranges:</strong> &apos;From&apos; / &apos;To&apos; or &apos;Start date&apos; / &apos;End
                  date&apos; — be consistent
                </li>
              </ul>
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Placeholder text
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Show the format:</strong> &apos;MM/DD/YYYY&apos; or &apos;Select a date&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>For ranges:</strong> &apos;Start date&apos; / &apos;End date&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Never</strong> leave placeholder empty on a date input
                </li>
              </ul>
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Error messages
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Required:</strong> &apos;Please select a [due date / check-in date]&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Out of range:</strong> &apos;Date must be after [minDate]&apos; or &apos;Date must be before
                  [maxDate]&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Invalid:</strong> &apos;Please enter a valid date&apos;
                </li>
              </ul>
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Helper text
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Proactive:</strong> &apos;Dates must be at least 24 hours in advance&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Format hint:</strong> &apos;Use format MM/DD/YYYY&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Constraint:</strong> &apos;Available Mon–Fri only&apos;
                </li>
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              DatePicker props
            </h3>
            <PropsTable props={datePickerPropsRows} />
          </section>
          <section style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              DateRange type
            </h3>
            <CodeBlock code={codeDateRangeType} filename="DateRange" language="tsx" />
          </section>
          <section style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={codeEx1} filename="Single date — basic" language="tsx" />
              <CodeBlock code={codeEx2} filename="Single date — controlled with constraints" language="tsx" />
              <CodeBlock code={codeEx3} filename="Date range — report filter" language="tsx" />
              <CodeBlock code={codeEx4} filename="Month picker — billing cycle" language="tsx" />
              <CodeBlock code={codeEx5} filename="Date + time — event scheduling" language="tsx" />
              <CodeBlock code={codeEx6} filename="With error state" language="tsx" />
              <CodeBlock code={codeEx7} filename="Disabled specific dates (holidays)" language="tsx" />
            </div>
          </section>
          <section style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              The trigger has role=&apos;combobox&apos;, aria-haspopup=&apos;dialog&apos;, aria-expanded, and aria-label. The calendar panel has role=&apos;dialog&apos;
              with aria-label=&apos;Choose date&apos;. Day buttons have aria-label=&apos;[Day], [Month] [Date], [Year]&apos; and aria-pressed for selected state.
              Keyboard in calendar: Arrow keys navigate days, Page Up/Down change months, Home/End jump to first/last day of week, Enter/Space select, Escape closes.
              The component respects prefers-reduced-motion for open/close animations.
            </Callout>
          </section>
        </>
      ) : null}

      {activeTab === 'Changelog' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            Changelog
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                gap: 16,
                padding: '20px 0',
                borderBottom: `1px solid ${t.border.default.default}`,
                alignItems: 'flex-start',
              }}
            >
              <span style={chipStyleB(t)}>v1.0.0</span>
              <span style={{ fontSize: 13, color: t.text.tertiary.default, width: 100, flexShrink: 0 }}>April 2026</span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, flex: 1, margin: 0 }}>
                Initial release. DatePicker with single/range/month/datetime modes, date constraints (minDate, maxDate, disabledDates, disabledDays), 3 sizes, 5
                states, clearable, Today shortcut, full ARIA combobox + dialog pattern, keyboard navigation.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}

function ConstraintMiniCal({ t, kind }: { t: VDSTheme; kind: 'pastOff' | 'futureOff' | 'weekends' | 'holidays' }) {
  const cells = buildCalendarCells(2026, 3);
  const today = new Date(2026, 3, 15);
  return (
    <div style={{ transform: 'scale(0.85)', transformOrigin: 'center top' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {cells.slice(0, 35).map((c, i) => {
          const d = c.date;
          const inM = d.getMonth() === 3;
          const day = d.getDate();
          let dis = false;
          if (kind === 'pastOff') dis = inM && startOfDay(d).getTime() < startOfDay(today).getTime();
          if (kind === 'futureOff') dis = inM && startOfDay(d).getTime() > startOfDay(today).getTime();
          if (kind === 'weekends') dis = inM && (d.getDay() === 0 || d.getDay() === 6);
          if (kind === 'holidays') dis = inM && (day === 7 || day === 14);
          return (
            <div
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                fontSize: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: dis ? t.text.tertiary.default : t.text.primary.default,
                opacity: dis ? 0.4 : inM ? 1 : 0.35,
                cursor: dis ? 'not-allowed' : 'default',
              }}
            >
              {inM ? day : day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
