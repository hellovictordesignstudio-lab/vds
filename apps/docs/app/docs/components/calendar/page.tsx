'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlignJustify,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Circle,
  Clock,
  MapPin,
  Minus,
  MoreHorizontal,
  Plus,
  Square,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type CalendarEventColor = 'brand' | 'purple' | 'green' | 'orange' | 'red';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  allDay?: boolean;
  time?: string;
  duration?: number;
  color?: CalendarEventColor;
  description?: string;
  location?: string;
  attendees?: string[];
  multiDay?: boolean;
}

interface CalendarDateRange {
  start: Date;
  end: Date;
}

function chunkSegmentOptions<T>(arr: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function IOSegmentBar<T extends string>({
  t,
  options,
  value,
  onChange,
}: {
  t: VDSTheme;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const chunkSize = options.length === 4 ? 2 : 3;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        background: t.bg.surface.tertiary.default,
        borderRadius: 10,
        padding: 4,
        width: '100%',
        maxWidth: 320,
      }}
    >
      {chunkSegmentOptions(options, chunkSize).map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex', gap: 4 }}>
          {row.map((opt) => (
            <button
              key={String(opt)}
              type="button"
              onClick={() => onChange(opt)}
              style={{
                flex: 1,
                padding: '7px 10px',
                borderRadius: 7,
                border: 'none',
                fontSize: 13,
                fontWeight: value === opt ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                background: value === opt ? t.bg.surface.primary.default : 'transparent',
                color: value === opt ? t.text.primary.default : t.text.secondary.default,
                boxShadow: value === opt ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                transition: 'all 150ms',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

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
      <div
        style={{
          background: t.bg.surface.secondary.default,
          padding: 24,
          minHeight: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
      <div style={{ padding: '12px 16px 0', fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>{title}</div>
      <div style={{ height: 3, background: ok ? '#0A8853' : '#E8186D' }} />
      <p style={{ padding: '16px 20px', fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{caption}</p>
    </div>
  );
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const WD_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const WD_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function parseTimeToMinutes(time?: string): number {
  if (!time) return 9 * 60;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

function formatHour12(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function eventColorStyle(color: CalendarEventColor | undefined, isDark: boolean): { bg: string; fg: string } {
  const c = color ?? 'brand';
  const map: Record<CalendarEventColor, { bg: string; fg: string; bgD: string; fgD: string }> = {
    brand: { bg: 'rgba(0,43,73,0.12)', fg: '#002b49', bgD: 'rgba(21,101,168,0.20)', fgD: '#5B9FD4' },
    purple: { bg: 'rgba(124,58,237,0.12)', fg: '#7C3AED', bgD: 'rgba(124,58,237,0.18)', fgD: '#A78BFA' },
    green: { bg: 'rgba(10,136,83,0.12)', fg: '#0A8853', bgD: 'rgba(10,136,83,0.18)', fgD: '#34D399' },
    orange: { bg: 'rgba(240,115,50,0.12)', fg: '#F07332', bgD: 'rgba(240,115,50,0.18)', fgD: '#FDBA74' },
    red: { bg: 'rgba(210,34,50,0.12)', fg: '#D22232', bgD: 'rgba(210,34,50,0.18)', fgD: '#F87171' },
  };
  const row = map[c];
  return { bg: isDark ? row.bgD : row.bg, fg: isDark ? row.fgD : row.fg };
}

function buildDemoEvents(today: Date): CalendarEvent[] {
  const t0 = startOfDay(today);
  return [
    { id: '1', title: 'Team standup', date: t0, time: '09:00', duration: 30, color: 'brand' },
    { id: '2', title: 'Design review', date: addDays(t0, 1), time: '14:00', duration: 60, color: 'purple' },
    {
      id: '3',
      title: 'Sprint planning',
      date: t0,
      time: '10:00',
      duration: 120,
      color: 'brand',
      multiDay: true,
      endDate: addDays(t0, 1),
    },
    { id: '4', title: 'Q2 deadline', date: addDays(t0, 3), allDay: true, color: 'red' },
    { id: '5', title: 'Design system sync', date: addDays(t0, 6), time: '15:00', duration: 45, color: 'green' },
    {
      id: '6',
      title: 'Conference',
      date: addDays(t0, 8),
      allDay: true,
      color: 'orange',
      multiDay: true,
      endDate: addDays(t0, 10),
    },
    { id: '7', title: '1:1 with manager', date: t0, time: '11:00', duration: 30, color: 'brand' },
    { id: '8', title: 'Team lunch', date: t0, time: '12:30', duration: 60, color: 'green' },
    { id: '9', title: 'Release v1.0', date: addDays(t0, 2), allDay: true, color: 'red' },
    { id: '10', title: 'Retrospective', date: addDays(t0, 5), time: '16:00', duration: 60, color: 'purple' },
  ];
}

function eventEndDate(ev: CalendarEvent): Date {
  if (ev.multiDay && ev.endDate) return startOfDay(ev.endDate);
  return startOfDay(ev.date);
}

function eventCoversDay(ev: CalendarEvent, day: Date): boolean {
  const s = startOfDay(ev.date);
  const e = eventEndDate(ev);
  const d = startOfDay(day);
  return d.getTime() >= s.getTime() && d.getTime() <= e.getTime();
}

function timedEventsForDay(ev: CalendarEvent, day: Date): boolean {
  if (!sameDay(startOfDay(ev.date), day)) return false;
  if (ev.allDay) return false;
  return Boolean(ev.time);
}

function allDayEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((ev) => eventCoversDay(ev, day) && (ev.allDay || (ev.multiDay && !ev.time)));
}

function timedEventsOnDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((ev) => timedEventsForDay(ev, day));
}

type PreviewView = 'Month' | 'Week' | 'Day' | 'Mini';

/* ─── Calendar docs live shell (segmented above canvas column only) ─── */
function CalendarDocsLiveShell({
  t,
  canvasIsDark,
  topSegmented,
  canvas,
  controls,
}: {
  t: VDSTheme;
  canvasIsDark: boolean;
  topSegmented: ReactNode;
  canvas: ReactNode;
  controls: ReactNode;
}) {
  const canvasInner = (
    <div
      style={{
        minHeight: 560,
        backgroundColor: canvasIsDark ? '#0F1117' : t.bg.surface.secondary.default,
        backgroundImage: `radial-gradient(circle, ${canvasIsDark ? 'rgba(255,255,255,0.06)' : t.border.default.default} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: 24,
        overflow: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 16 }}>{topSegmented}</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
        {canvasIsDark ? (
          <div data-theme="dark" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {canvas}
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>{canvas}</div>
        )}
      </div>
    </div>
  );

  return (
    <div
      style={{
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 14,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gridTemplateRows: '1fr',
      }}
    >
      <div style={{ gridColumn: 1, gridRow: 1, minWidth: 0 }}>{canvasInner}</div>
      <div
        style={{
          gridColumn: 2,
          gridRow: 1,
          width: 280,
          minWidth: 280,
          borderLeft: `1px solid ${t.border.default.default}`,
          backgroundColor: t.bg.surface.primary.default,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          flexShrink: 0,
        }}
      >
        {controls}
      </div>
    </div>
  );
}

function navIconBtn(t: VDSTheme): CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: t.icon.secondary.default,
  };
}

function smButton(t: VDSTheme, variant: 'primary' | 'secondary', label: string) {
  const base: CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    padding: '6px 12px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
  if (variant === 'primary') {
    return { ...base, background: t.bg.fill.primary.default, color: '#FFFFFF' };
  }
  return { ...base, background: t.bg.surface.secondary.default, color: t.text.primary.default, border: `1px solid ${t.border.default.default}` };
}

function monthMatrix(year: number, month: number, firstDayOfWeek: 0 | 1): { date: Date; inMonth: boolean }[] {
  const first = new Date(year, month, 1);
  let startPad = first.getDay() - firstDayOfWeek;
  if (startPad < 0) startPad += 7;
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = startPad; i > 0; i--) {
    cells.push({ date: new Date(year, month, 1 - i), inMonth: false });
  }
  const last = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= last; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const lastD = cells[cells.length - 1].date;
    cells.push({ date: addDays(lastD, 1), inMonth: false });
  }
  while (cells.length < 42) {
    const lastD = cells[cells.length - 1].date;
    cells.push({ date: addDays(lastD, 1), inMonth: false });
  }
  return cells;
}

function weekDaysForView(anchor: Date, firstDayOfWeek: 0 | 1, showWeekends: boolean): Date[] {
  const sod = startOfDay(anchor);
  let dow = sod.getDay() - firstDayOfWeek;
  if (dow < 0) dow += 7;
  const start = addDays(sod, -dow);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) days.push(addDays(start, i));
  if (!showWeekends) {
    return days.filter((d) => {
      const wd = d.getDay();
      return wd !== 0 && wd !== 6;
    });
  }
  return days;
}

function CalendarMonthDemo({
  previewT,
  events,
  year,
  month,
  setYearMonth,
  selected,
  onSelect,
  firstDayOfWeek,
  showWeekends,
  today,
  canvasDark,
}: {
  previewT: VDSTheme;
  events: CalendarEvent[];
  year: number;
  month: number;
  setYearMonth: (y: number, m: number) => void;
  selected: Date | null;
  onSelect: (d: Date) => void;
  firstDayOfWeek: 0 | 1;
  showWeekends: boolean;
  today: Date;
  canvasDark: boolean;
}) {
  const labels = firstDayOfWeek === 0 ? WD_SUN : WD_MON;
  const visibleLabels = showWeekends ? [...labels] : labels.filter((_, i) => (firstDayOfWeek === 0 ? i !== 0 && i !== 6 : i < 5));
  let cells = monthMatrix(year, month, firstDayOfWeek);
  if (!showWeekends) {
    cells = cells.filter((c) => {
      const wd = c.date.getDay();
      return wd !== 0 && wd !== 6;
    });
    while (cells.length % 5 !== 0) {
      const last = cells[cells.length - 1].date;
      let n = addDays(last, 1);
      while (n.getDay() === 0 || n.getDay() === 6) n = addDays(n, 1);
      cells.push({ date: n, inMonth: n.getMonth() === month });
    }
    while (cells.length < 30) {
      const last = cells[cells.length - 1].date;
      let n = addDays(last, 1);
      while (n.getDay() === 0 || n.getDay() === 6) n = addDays(n, 1);
      cells.push({ date: n, inMonth: n.getMonth() === month });
    }
  }
  const cols = showWeekends ? 7 : 5;

  const monthEvents = (d: Date) => events.filter((ev) => eventCoversDay(ev, d) && !ev.allDay && ev.time);

  const cellEvents = (d: Date) => {
    const timed = monthEvents(d);
    const alld = events.filter((ev) => eventCoversDay(ev, d) && (ev.allDay || (ev.multiDay && !ev.time)));
    return [...alld, ...timed].slice(0, 10);
  };

  const maxChip = 3;

  return (
    <div
      role="grid"
      aria-label="Month calendar"
      style={{
        width: '100%',
        maxWidth: 900,
        background: previewT.bg.surface.primary.default,
        border: `1px solid ${previewT.border.default.default}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: `1px solid ${previewT.border.default.default}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button type="button" aria-label="Previous year" style={navIconBtn(previewT)} onClick={() => setYearMonth(year - 1, month)}>
            <ChevronsLeft size={16} />
          </button>
          <button type="button" aria-label="Previous month" style={navIconBtn(previewT)} onClick={() => setYearMonth(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)}>
            <ChevronLeft size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: previewT.text.primary.default }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button type="button" style={smButton(previewT, 'secondary', 'Today')} onClick={() => onSelect(today)}>
            Today
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button type="button" aria-label="Next month" style={navIconBtn(previewT)} onClick={() => setYearMonth(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1)}>
            <ChevronRight size={16} />
          </button>
          <button type="button" aria-label="Next year" style={navIconBtn(previewT)} onClick={() => setYearMonth(year + 1, month)}>
            <ChevronsRight size={16} />
          </button>
          <button type="button" style={{ ...smButton(previewT, 'primary', '+ New event'), marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> New event
          </button>
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          borderBottom: `1px solid ${previewT.border.default.default}`,
          background: previewT.bg.surface.secondary.default,
        }}
      >
        {visibleLabels.map((lab) => (
          <div
            key={lab}
            style={{
              padding: '8px 0',
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: previewT.text.tertiary.default,
            }}
          >
            {lab}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: 'minmax(100px, auto)' }}>
        {cells.map((cell) => {
          const isToday = sameDay(cell.date, today);
          const isSel = selected && sameDay(cell.date, selected);
          const list = cellEvents(cell.date);
          const shown = list.slice(0, maxChip);
          const more = list.length - shown.length;
          return (
            <button
              key={dayKey(cell.date)}
              type="button"
              role="gridcell"
              aria-label={cell.date.toDateString()}
              aria-selected={Boolean(isSel)}
              aria-current={isToday ? 'date' : undefined}
              onClick={() => onSelect(cell.date)}
              style={{
                border: `1px solid ${previewT.border.default.default}`,
                padding: '6px 8px',
                minHeight: 100,
                position: 'relative',
                textAlign: 'left',
                cursor: 'pointer',
                background: isToday
                  ? previewT.bg.fill.brandSubtle.default
                  : !cell.inMonth
                    ? previewT.bg.surface.secondary.default
                    : previewT.bg.surface.primary.default,
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 600,
                  color: isToday ? '#FFFFFF' : previewT.text.secondary.default,
                  background: isToday ? previewT.bg.fill.primary.default : isSel ? previewT.bg.surface.tertiary.default : 'transparent',
                  opacity: cell.inMonth ? 1 : 0.4,
                }}
              >
                {cell.date.getDate()}
              </span>
              <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {shown.map((ev) => {
                  const st = eventColorStyle(ev.color, canvasDark);
                  const s = startOfDay(ev.date);
                  const e = eventEndDate(ev);
                  const isStart = sameDay(cell.date, s);
                  const isEnd = sameDay(cell.date, e);
                  const span = ev.multiDay || (ev.endDate && !sameDay(s, e));
                  const rad = span ? `${isStart ? 4 : 0}px ${isEnd ? 4 : 0}px ${isEnd ? 4 : 0}px ${isStart ? 4 : 0}px` : '4px';
                  const timePrefix = ev.time && !ev.allDay ? `${ev.time.slice(0, 5)} ` : '';
                  return (
                    <div
                      key={ev.id + dayKey(cell.date)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${ev.title} ${timePrefix}`}
                      style={{
                        padding: '2px 6px',
                        borderRadius: rad,
                        fontSize: 11,
                        fontWeight: 600,
                        background: st.bg,
                        color: st.fg,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {timePrefix}
                      {ev.title}
                    </div>
                  );
                })}
              </div>
              {more > 0 ? (
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 11,
                    color: previewT.text.brand.default,
                    cursor: 'pointer',
                    padding: '1px 6px',
                    borderRadius: 4,
                  }}
                >
                  +{more} more
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function overlapsTime(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Greedy lane assignment within each overlap-connected cluster. */
function layoutTimedOverlaps(items: { id: string; start: number; end: number }[]): Map<string, { col: number; cols: number }> {
  const result = new Map<string, { col: number; cols: number }>();
  if (items.length === 0) return result;
  const n = items.length;
  const parent = items.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (overlapsTime(items[i], items[j])) union(i, j);
    }
  }
  const groups = new Map<number, { id: string; start: number; end: number }[]>();
  for (let i = 0; i < n; i++) {
    const r = find(i);
    const g = groups.get(r) ?? [];
    g.push(items[i]);
    groups.set(r, g);
  }
  for (const g of groups.values()) {
    const sorted = [...g].sort((a, b) => a.start - b.start || a.end - b.end);
    const colEnds: number[] = [];
    for (const ev of sorted) {
      let c = 0;
      while (colEnds[c] !== undefined && colEnds[c]! > ev.start) c++;
      colEnds[c] = ev.end;
      result.set(ev.id, { col: c, cols: 1 });
    }
    const cols = Math.max(0, ...sorted.map((ev) => result.get(ev.id)!.col)) + 1;
    for (const ev of sorted) {
      const cur = result.get(ev.id)!;
      result.set(ev.id, { col: cur.col, cols });
    }
  }
  return result;
}

function CalendarWeekDemo({
  previewT,
  weekStart,
  setWeekStart,
  events,
  firstDayOfWeek,
  showWeekends,
  today,
  hourHeight,
  canvasDark,
}: {
  previewT: VDSTheme;
  weekStart: Date;
  setWeekStart: (d: Date) => void;
  events: CalendarEvent[];
  firstDayOfWeek: 0 | 1;
  showWeekends: boolean;
  today: Date;
  hourHeight: number;
  canvasDark: boolean;
}) {
  const days = weekDaysForView(weekStart, firstDayOfWeek, showWeekends);
  const startHour = 0;
  const endHour = 24;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const now = new Date();
  const showNow = days.some((d) => sameDay(d, today)) && sameDay(today, now);

  const rangeLabel = `${MONTH_SHORT[days[0].getMonth()]} ${days[0].getDate()} – ${MONTH_SHORT[days[days.length - 1].getMonth()]} ${days[days.length - 1].getDate()}, ${days[0].getFullYear()}`;

  const gridCols = `64px repeat(${days.length}, 1fr)`;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 960,
        background: previewT.bg.surface.primary.default,
        border: `1px solid ${previewT.border.default.default}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${previewT.border.default.default}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" style={navIconBtn(previewT)} aria-label="Previous week" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" style={navIconBtn(previewT)} aria-label="Next week" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <ChevronRight size={16} />
          </button>
          <button type="button" style={smButton(previewT, 'secondary', 'Today')} onClick={() => setWeekStart(today)}>
            Today
          </button>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: previewT.text.primary.default }}>{rangeLabel}</div>
        <button type="button" style={{ ...smButton(previewT, 'primary', '+ New'), display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> New event
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, borderBottom: `2px solid ${previewT.border.strong.default}`, background: previewT.bg.surface.secondary.default, minHeight: 32 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', color: previewT.text.tertiary.default, textAlign: 'right', paddingRight: 8, paddingTop: 8 }}>all-day</div>
        {days.map((d) => {
          const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
          const isT = sameDay(d, today);
          return (
            <div key={dayKey(d)} style={{ padding: '6px 4px', textAlign: 'center', borderLeft: `1px solid ${previewT.border.default.default}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: previewT.text.tertiary.default }}>{wd}</div>
              <div
                style={{
                  display: 'inline-flex',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  marginTop: 4,
                  background: isT ? previewT.bg.fill.primary.default : 'transparent',
                  color: isT ? '#FFFFFF' : previewT.text.secondary.default,
                }}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, borderBottom: `1px solid ${previewT.border.default.default}`, background: previewT.bg.surface.secondary.default, minHeight: 36 }}>
        <div />
        {days.map((d) => (
          <div key={`ad-${dayKey(d)}`} style={{ borderLeft: `1px solid ${previewT.border.default.default}`, padding: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {allDayEventsForDay(events, d).map((ev) => {
              const st = eventColorStyle(ev.color, canvasDark);
              return (
                <div
                  key={ev.id}
                  role="button"
                  style={{
                    flex: 1,
                    minWidth: 40,
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    background: st.bg,
                    color: st.fg,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ev.title}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, maxHeight: 480, overflowY: 'auto' }}>
        <div style={{ position: 'relative' }}>
          {hours.map((h) => (
            <div
              key={h}
              style={{
                height: hourHeight,
                fontSize: 11,
                color: previewT.text.tertiary.default,
                textAlign: 'right',
                paddingRight: 8,
                marginTop: -8,
                borderTop: h === startHour ? 'none' : undefined,
              }}
            >
              {formatHour12(h)}
            </div>
          ))}
        </div>
        {days.map((d) => {
          const isTodayCol = sameDay(d, today);
          const timed = timedEventsOnDay(events, d).map((ev) => {
            const start = parseTimeToMinutes(ev.time);
            const dur = ev.duration ?? 60;
            return { id: ev.id, ev, start, end: start + dur };
          });
          const layout = layoutTimedOverlaps(timed.map((x) => ({ id: x.id, start: x.start, end: x.end })));
          const totalH = (endHour - startHour) * hourHeight;
          const nowMin = now.getHours() * 60 + now.getMinutes();
          const nowTop = ((nowMin - startHour * 60) / 60) * hourHeight;
          return (
            <div
              key={`col-${dayKey(d)}`}
              style={{
                position: 'relative',
                borderLeft: `1px solid ${previewT.border.default.default}`,
                minHeight: totalH,
                background: isTodayCol ? `color-mix(in srgb, ${previewT.bg.fill.brandSubtle.default} 30%, transparent)` : undefined,
              }}
            >
              {hours.map((h, idx) => (
                <div key={h} style={{ position: 'absolute', left: 0, right: 0, top: idx * hourHeight, height: hourHeight, borderTop: `1px solid ${previewT.border.default.default}`, pointerEvents: 'none' }} />
              ))}
              {hours.map((h, idx) => (
                <div
                  key={`half-${idx}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: idx * hourHeight + hourHeight / 2,
                    borderTop: `1px dashed ${previewT.border.default.default}`,
                    opacity: 0.3,
                    pointerEvents: 'none',
                  }}
                />
              ))}
              {showNow && isTodayCol ? (
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: Math.max(0, nowTop),
                    height: 2,
                    background: '#D22232',
                    zIndex: 4,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#D22232',
                      left: -4,
                      top: -3,
                    }}
                  />
                </div>
              ) : null}
              {timed.map(({ ev, start, end }) => {
                const st = eventColorStyle(ev.color, canvasDark);
                const top = ((start - startHour * 60) / 60) * hourHeight;
                const h = Math.max(20, ((end - start) / 60) * hourHeight - 2);
                const lay = layout.get(ev.id) ?? { col: 0, cols: 1 };
                const gap = 2;
                const innerGaps = (lay.cols - 1) * gap;
                return (
                  <div
                    key={ev.id}
                    role="button"
                    style={{
                      position: 'absolute',
                      top,
                      height: h,
                      left: `calc(4px + ${lay.col} * ((100% - 8px - ${innerGaps}px) / ${lay.cols}) + ${lay.col * gap}px)`,
                      width: `calc((100% - 8px - ${innerGaps}px) / ${lay.cols})`,
                      borderRadius: 6,
                      padding: '3px 6px',
                      fontSize: 11,
                      fontWeight: 600,
                      background: st.bg,
                      color: st.fg,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      zIndex: 2,
                    }}
                  >
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                    {h > 40 ? <div style={{ fontSize: 10, opacity: 0.85 }}>{ev.time}</div> : null}
                    {h > 60 && ev.location ? (
                      <div style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={10} /> {ev.location}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function startOfWeekContaining(d: Date, firstDayOfWeek: 0 | 1): Date {
  const sod = startOfDay(d);
  let dow = sod.getDay() - firstDayOfWeek;
  if (dow < 0) dow += 7;
  return addDays(sod, -dow);
}

function CalendarDayDemo({
  previewT,
  dayDate,
  setDayDate,
  events,
  today,
  hourHeight,
  canvasDark,
  showAside,
}: {
  previewT: VDSTheme;
  dayDate: Date;
  setDayDate: (d: Date) => void;
  events: CalendarEvent[];
  today: Date;
  hourHeight: number;
  canvasDark: boolean;
  showAside: boolean;
}) {
  const startHour = 0;
  const endHour = 24;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const now = new Date();
  const isToday = sameDay(dayDate, today);
  const showNow = isToday;
  const totalH = (endHour - startHour) * hourHeight;
  const timed = timedEventsOnDay(events, dayDate).map((ev) => {
    const start = parseTimeToMinutes(ev.time);
    const dur = ev.duration ?? 60;
    return { id: ev.id, ev, start, end: start + dur };
  });
  const layout = layoutTimedOverlaps(timed.map((x) => ({ id: x.id, start: x.start, end: x.end })));
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMin - startHour * 60) / 60) * hourHeight;
  const wdLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayDate.getDay()];

  const dayEvents = events.filter((ev) => eventCoversDay(ev, dayDate));

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', width: '100%', maxWidth: showAside ? 1100 : 720 }}>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          background: previewT.bg.surface.primary.default,
          border: `1px solid ${previewT.border.default.default}`,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${previewT.border.default.default}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" style={navIconBtn(previewT)} aria-label="Previous day" onClick={() => setDayDate(addDays(dayDate, -1))}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" style={navIconBtn(previewT)} aria-label="Next day" onClick={() => setDayDate(addDays(dayDate, 1))}>
              <ChevronRight size={16} />
            </button>
            <button type="button" style={smButton(previewT, 'secondary', 'Today')} onClick={() => setDayDate(today)}>
              Today
            </button>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: isToday ? previewT.text.brand.default : previewT.text.primary.default }}>
            {wdLong}, {MONTH_NAMES[dayDate.getMonth()]} {dayDate.getDate()}, {dayDate.getFullYear()}
          </div>
          <button type="button" style={{ ...smButton(previewT, 'primary', 'New'), display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> New event
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', borderBottom: `2px solid ${previewT.border.strong.default}`, background: previewT.bg.surface.secondary.default, minHeight: 36 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', color: previewT.text.tertiary.default, textAlign: 'right', paddingRight: 8, paddingTop: 8 }}>all-day</div>
          <div style={{ borderLeft: `1px solid ${previewT.border.default.default}`, padding: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {allDayEventsForDay(events, dayDate).map((ev) => {
              const st = eventColorStyle(ev.color, canvasDark);
              return (
                <div key={ev.id} role="button" style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: st.bg, color: st.fg }}>
                  {ev.title}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', maxHeight: 520, overflowY: 'auto' }}>
          <div style={{ position: 'relative' }}>
            {hours.map((h) => (
              <div key={h} style={{ height: hourHeight, fontSize: 11, color: previewT.text.tertiary.default, textAlign: 'right', paddingRight: 8, marginTop: -8 }}>
                {formatHour12(h)}
              </div>
            ))}
          </div>
          <div style={{ position: 'relative', borderLeft: `1px solid ${previewT.border.default.default}`, minHeight: totalH }}>
            {hours.map((h, idx) => (
              <div key={`hl-${h}`} style={{ position: 'absolute', left: 0, right: 0, top: idx * hourHeight, height: hourHeight, borderTop: `1px solid ${previewT.border.default.default}`, pointerEvents: 'none' }} />
            ))}
            {hours.map((_, idx) => (
              <div
                key={`hd-${idx}`}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: idx * hourHeight + hourHeight / 2,
                  borderTop: `1px dashed ${previewT.border.default.default}`,
                  opacity: 0.3,
                  pointerEvents: 'none',
                }}
              />
            ))}
            {showNow ? (
              <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: Math.max(0, nowTop), height: 2, background: '#D22232', zIndex: 4, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: '#D22232', left: -4, top: -3 }} />
              </div>
            ) : null}
            {timed.map(({ ev, start, end }) => {
              const st = eventColorStyle(ev.color, canvasDark);
              const top = ((start - startHour * 60) / 60) * hourHeight;
              const h = Math.max(24, ((end - start) / 60) * hourHeight - 2);
              const lay = layout.get(ev.id) ?? { col: 0, cols: 1 };
              const gap = 2;
              const innerGaps = (lay.cols - 1) * gap;
              const past = end < nowMin && isToday;
              return (
                <div
                  key={ev.id}
                  role="button"
                  style={{
                    position: 'absolute',
                    top,
                    height: h,
                    left: `calc(8px + ${lay.col} * ((100% - 16px - ${innerGaps}px) / ${lay.cols}) + ${lay.col * gap}px)`,
                    width: `calc((100% - 16px - ${innerGaps}px) / ${lay.cols})`,
                    borderRadius: 6,
                    padding: '4px 8px',
                    background: st.bg,
                    color: st.fg,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    zIndex: 2,
                    filter: past ? 'saturate(0.65) opacity(0.85)' : undefined,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: previewT.text.secondary.default }}>
                    {ev.time} · {ev.duration ?? 60} min
                  </div>
                  {h > 52 && ev.location ? (
                    <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={11} /> {ev.location}
                    </div>
                  ) : null}
                  {h > 68 && (ev.attendees?.length ?? 0) > 0 ? (
                    <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Users size={11} /> {ev.attendees!.length}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {showAside ? (
        <aside style={{ width: 280, flexShrink: 0, background: previewT.bg.surface.primary.default, border: `1px solid ${previewT.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
          <CalendarMiniDemo
            previewT={previewT}
            monthAnchor={dayDate}
            setMonthAnchor={() => {}}
            selected={dayDate}
            onSelectDate={(d) => setDayDate(d)}
            events={events}
            firstDayOfWeek={1}
            mode="single"
            showFooter={false}
            hoverRange={null}
            today={today}
          />
          <div style={{ padding: '12px 14px', borderTop: `1px solid ${previewT.border.default.default}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: previewT.text.tertiary.default, marginBottom: 8 }}>EVENTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {dayEvents.map((ev) => (
                <div key={ev.id} style={{ fontSize: 12, fontWeight: 600, color: previewT.text.primary.default }}>
                  {ev.title}
                </div>
              ))}
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

function CalendarMiniDemo({
  previewT,
  monthAnchor,
  setMonthAnchor,
  selected,
  onSelectDate,
  events,
  firstDayOfWeek,
  mode,
  showFooter,
  hoverRange,
  today,
  onHoverDate,
}: {
  previewT: VDSTheme;
  monthAnchor: Date;
  setMonthAnchor: (d: Date) => void;
  selected: Date | null;
  onSelectDate: (d: Date) => void;
  events: CalendarEvent[];
  firstDayOfWeek: 0 | 1;
  mode: 'single' | 'range';
  showFooter: boolean;
  hoverRange: { start: Date; end: Date } | null;
  today: Date;
  onHoverDate?: (d: Date | null) => void;
}) {
  const y = monthAnchor.getFullYear();
  const m = monthAnchor.getMonth();
  const cells = monthMatrix(y, m, firstDayOfWeek);
  const labels = firstDayOfWeek === 0 ? WD_SUN : WD_MON;

  const inPreviewRange = (d: Date) => {
    if (!hoverRange) return false;
    const t0 = startOfDay(hoverRange.start).getTime();
    const t1 = startOfDay(hoverRange.end).getTime();
    const v = startOfDay(d).getTime();
    const lo = Math.min(t0, t1);
    const hi = Math.max(t0, t1);
    return v >= lo && v <= hi;
  };

  return (
    <div style={{ width: 280, background: previewT.bg.surface.primary.default, border: `1px solid ${previewT.border.default.default}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button type="button" style={navIconBtn(previewT)} aria-label="Previous month" onClick={() => setMonthAnchor(new Date(y, m - 1, 1))}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: previewT.text.primary.default }}>
          {MONTH_NAMES[m]} {y}
        </span>
        <button type="button" style={navIconBtn(previewT)} aria-label="Next month" onClick={() => setMonthAnchor(new Date(y, m + 1, 1))}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
        {labels.map((lab) => (
          <div key={lab} style={{ fontSize: 10, textTransform: 'uppercase', color: previewT.text.tertiary.default, padding: '6px 0', textAlign: 'center' }}>
            {lab.slice(0, 2)}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 8px 8px', gap: 4 }}>
        {cells.slice(0, 42).map((cell) => {
          const isToday = sameDay(cell.date, today);
          const isSel = selected && sameDay(cell.date, selected);
          const hasEv = events.some((ev) => eventCoversDay(ev, cell.date));
          const rangeFill = mode === 'range' && inPreviewRange(cell.date);
          return (
            <button
              key={dayKey(cell.date)}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              onMouseEnter={() => onHoverDate?.(cell.date)}
              onMouseLeave={() => onHoverDate?.(null)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                position: 'relative',
                fontSize: 12,
                fontWeight: isToday ? 700 : 500,
                background: rangeFill
                  ? previewT.bg.fill.brandSubtle.default
                  : isToday
                    ? previewT.bg.fill.primary.default
                    : isSel && !isToday
                      ? previewT.bg.surface.tertiary.default
                      : 'transparent',
                color: isToday || (isSel && !isToday && !rangeFill) ? (isToday ? '#FFFFFF' : previewT.text.brand.default) : previewT.text.secondary.default,
                opacity: cell.inMonth ? 1 : 0.3,
              }}
            >
              {cell.date.getDate()}
              {hasEv ? (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 3,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: previewT.text.brand.default,
                  }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
      {showFooter ? (
        <div style={{ borderTop: `1px solid ${previewT.border.default.default}`, padding: '8px 14px' }}>
          <button type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', color: previewT.text.brand.default, fontSize: 12, fontWeight: 600, padding: 0 }}>
            Today
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function CalendarDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [previewView, setPreviewView] = useState<PreviewView>('Month');
  const [firstDayLabel, setFirstDayLabel] = useState<'Sunday' | 'Monday'>('Sunday');
  const [weekends, setWeekends] = useState<'off' | 'on'>('on');
  const [appearance, setAppearance] = useState<'Light' | 'Dark'>('Light');
  const [miniMode, setMiniMode] = useState<'single' | 'range'>('single');
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverEnd, setHoverEnd] = useState<Date | null>(null);

  const today = useMemo(() => new Date(), []);
  const events = useMemo(() => buildDemoEvents(today), [today]);
  const [cursor, setCursor] = useState(() => startOfDay(today));
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(() => startOfDay(today));
  const [miniMonth, setMiniMonth] = useState(() => startOfDay(today));
  const firstDayOfWeek: 0 | 1 = firstDayLabel === 'Sunday' ? 0 : 1;
  const showWeekends = weekends === 'on';
  const previewDark = appearance === 'Dark';

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const t = buildTheme(isDark);
  const previewT = previewDark ? buildTheme(true) : t;
  const hourHeight = 60;

  const weekStart = useMemo(() => startOfWeekContaining(cursor, firstDayOfWeek), [cursor, firstDayOfWeek]);

  const setYearMonth = (year: number, month: number) => {
    const dim = new Date(year, month + 1, 0).getDate();
    setCursor(new Date(year, month, Math.min(cursor.getDate(), dim)));
  };

  const miniHoverRange =
    miniMode === 'range' && rangeStart && (hoverEnd || rangeEnd)
      ? { start: rangeStart, end: hoverEnd ?? rangeEnd! }
      : miniMode === 'range' && rangeStart && rangeEnd
        ? { start: rangeStart, end: rangeEnd }
        : null;

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-cal', label: 'Principles' },
        { id: 'month-view', label: 'Month view' },
        { id: 'week-view', label: 'Week view' },
        { id: 'day-view', label: 'Day view' },
        { id: 'mini-calendar', label: 'Mini calendar' },
        { id: 'event-types', label: 'Event types' },
        { id: 'day-states', label: 'Day states' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-cal', label: 'When to use' },
        { id: 'view-guide', label: 'Choosing a view' },
        { id: 'dos-donts-cal', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'code-types-cal', label: 'CalendarEvent' },
        { id: 'code-month-cal', label: 'CalendarMonth' },
        { id: 'code-week-cal', label: 'CalendarWeek' },
        { id: 'code-day-cal', label: 'CalendarDay' },
        { id: 'code-mini-cal', label: 'CalendarMini' },
        { id: 'code-a11y-cal', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const monthPropsRows = [
    { name: 'events', type: 'CalendarEvent[]', default: '[]', description: 'Events to display' },
    { name: 'defaultDate', type: 'Date', default: 'new Date()', description: 'Initially shown month' },
    { name: 'value', type: 'Date', default: '—', description: 'Controlled selected date' },
    { name: 'onDateSelect', type: '(date: Date) => void', default: '—', description: 'Day click handler' },
    { name: 'onEventClick', type: '(event: CalendarEvent) => void', default: '—', description: 'Event click handler' },
    { name: 'onEventCreate', type: '(date: Date) => void', default: '—', description: 'New event trigger' },
    { name: 'firstDayOfWeek', type: '0 | 1', default: '0', description: '0 = Sun, 1 = Mon' },
    { name: 'showWeekends', type: 'boolean', default: 'true', description: 'Show Sat / Sun' },
    { name: 'dense', type: 'boolean', default: 'false', description: 'Compact cell height' },
    { name: 'maxEventsPerCell', type: 'number', default: '3', description: 'Before +N more' },
  ];

  const weekPropsRows = [
    { name: 'events', type: 'CalendarEvent[]', default: '[]', description: 'Events to display' },
    { name: 'defaultDate', type: 'Date', default: 'new Date()', description: 'Initially shown week' },
    { name: 'value', type: 'Date', default: '—', description: 'Controlled selected date' },
    { name: 'onDateSelect', type: '(date: Date) => void', default: '—', description: 'Day header click' },
    { name: 'onEventClick', type: '(event: CalendarEvent) => void', default: '—', description: 'Event click' },
    { name: 'onEventCreate', type: '(date: Date, time: string) => void', default: '—', description: 'Slot click' },
    { name: 'firstDayOfWeek', type: '0 | 1', default: '0', description: 'Week start' },
    { name: 'showWeekends', type: 'boolean', default: 'true', description: 'Show Sat / Sun columns' },
    { name: 'startHour', type: 'number', default: '0', description: 'First visible hour (0–23)' },
    { name: 'endHour', type: 'number', default: '24', description: 'Last visible hour (1–24)' },
    { name: 'hourHeight', type: 'number', default: '60', description: 'Pixels per hour' },
  ];

  const dayPropsRows = [
    { name: 'events', type: 'CalendarEvent[]', default: '[]', description: 'Events to display' },
    { name: 'defaultDate', type: 'Date', default: 'new Date()', description: 'Initially shown day' },
    { name: 'value', type: 'Date', default: '—', description: 'Controlled date' },
    { name: 'onEventClick', type: '(event: CalendarEvent) => void', default: '—', description: 'Event click' },
    { name: 'onEventCreate', type: '(date: Date, time: string) => void', default: '—', description: 'Slot click' },
    { name: 'startHour', type: 'number', default: '0', description: 'First visible hour' },
    { name: 'endHour', type: 'number', default: '24', description: 'Last visible hour' },
    { name: 'hourHeight', type: 'number', default: '60', description: 'Pixels per hour' },
    { name: 'showAside', type: 'boolean', default: 'false', description: 'Mini calendar aside' },
  ];

  const miniPropsRows = [
    { name: 'value', type: 'Date | CalendarDateRange | null', default: '—', description: 'Selected date(s)' },
    { name: 'defaultValue', type: 'Date', default: 'new Date()', description: 'Initial month' },
    { name: 'onChange', type: '(value: Date | CalendarDateRange) => void', default: '—', description: 'Selection handler' },
    { name: 'mode', type: "'single' | 'range'", default: "'single'", description: 'Selection mode' },
    { name: 'events', type: 'CalendarEvent[]', default: '[]', description: 'For event dots' },
    { name: 'firstDayOfWeek', type: '0 | 1', default: '0', description: 'Week start' },
    { name: 'showToday', type: 'boolean', default: 'true', description: 'Footer Today link' },
    { name: 'minDate', type: 'Date', default: '—', description: 'Min selectable' },
    { name: 'maxDate', type: 'Date', default: '—', description: 'Max selectable' },
  ];

  const canvas = (
    <>
      {previewView === 'Month' ? (
        <CalendarMonthDemo
          previewT={previewT}
          events={events}
          year={cursor.getFullYear()}
          month={cursor.getMonth()}
          setYearMonth={setYearMonth}
          selected={selectedMonth}
          onSelect={(d) => {
            setSelectedMonth(d);
            setCursor(d);
          }}
          firstDayOfWeek={firstDayOfWeek}
          showWeekends={showWeekends}
          today={today}
          canvasDark={previewDark}
        />
      ) : null}
      {previewView === 'Week' ? (
        <CalendarWeekDemo
          previewT={previewT}
          weekStart={weekStart}
          setWeekStart={(d) => setCursor(startOfDay(d))}
          events={events}
          firstDayOfWeek={firstDayOfWeek}
          showWeekends={showWeekends}
          today={today}
          hourHeight={hourHeight}
          canvasDark={previewDark}
        />
      ) : null}
      {previewView === 'Day' ? (
        <CalendarDayDemo
          previewT={previewT}
          dayDate={cursor}
          setDayDate={setCursor}
          events={events.map((e) => (e.id === '1' ? { ...e, location: 'Zoom', attendees: ['a', 'b', 'c'] } : e))}
          today={today}
          hourHeight={hourHeight}
          canvasDark={previewDark}
          showAside
        />
      ) : null}
      {previewView === 'Mini' ? (
        <CalendarMiniDemo
          previewT={previewT}
          monthAnchor={miniMonth}
          setMonthAnchor={(d) => setMiniMonth(startOfDay(d))}
          selected={miniMode === 'range' ? rangeEnd ?? rangeStart : cursor}
          onSelectDate={(d) => {
            if (miniMode === 'single') {
              setCursor(d);
              return;
            }
            if (!rangeStart || (rangeStart && rangeEnd)) {
              setRangeStart(d);
              setRangeEnd(null);
              setHoverEnd(null);
            } else {
              setRangeEnd(d);
            }
          }}
          events={events}
          firstDayOfWeek={firstDayOfWeek}
          mode={miniMode}
          showFooter
          hoverRange={miniHoverRange}
          today={today}
          onHoverDate={miniMode === 'range' && rangeStart && !rangeEnd ? setHoverEnd : undefined}
        />
      ) : null}
    </>
  );

  const controls = (
    <>
      <LivePreviewSegmentRow t={t} label="View" options={['Month', 'Week', 'Day', 'Mini']} value={previewView} onChange={(v) => setPreviewView(v as PreviewView)} />
      <LivePreviewSegmentRow t={t} label="First day" options={['Sunday', 'Monday']} value={firstDayLabel} onChange={(v) => setFirstDayLabel(v as 'Sunday' | 'Monday')} />
      <LivePreviewSegmentRow t={t} label="Show weekends" options={['off', 'on']} value={weekends} onChange={(v) => setWeekends(v as 'off' | 'on')} />
      <LivePreviewSegmentRow t={t} label="Appearance" options={['Light', 'Dark']} value={appearance} onChange={(v) => setAppearance(v as 'Light' | 'Dark')} />
      {previewView === 'Mini' ? (
        <LivePreviewSegmentRow t={t} label="Mini mode" options={['single', 'range']} value={miniMode} onChange={(v) => setMiniMode(v as 'single' | 'range')} />
      ) : null}
    </>
  );

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Calendar
      </p>
      <h1 className="page-title">Calendar</h1>
      <p className="page-lead">
        The Calendar component provides four complementary views of time: Month for broad overview, Week for scheduling precision, Day for hourly detail, and Mini for compact date navigation. All views share the same event data model and can be combined in a full scheduling application.
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
            <CalendarDocsLiveShell
              t={t}
              canvasIsDark={previewDark}
              topSegmented={
                <IOSegmentBar t={t} options={['Month', 'Week', 'Day', 'Mini']} value={previewView} onChange={(v) => setPreviewView(v as PreviewView)} />
              }
              canvas={canvas}
              controls={controls}
            />
          </section>

          <section id="principles-cal" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Principles
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 14, padding: 20, background: t.bg.surface.primary.default }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <CalendarIcon size={20} color={t.icon.brand.default} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: t.text.primary.default }}>Four views, one data model</span>
                </div>
                <div style={{ height: 120, borderRadius: 10, background: t.bg.surface.secondary.default, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative' }}>
                  <div style={{ width: 44, height: 72, borderRadius: 6, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, display: 'grid', gridTemplateRows: '10px 1fr', gap: 2, padding: 2 }}>
                    <Minus size={10} style={{ margin: '0 auto', color: t.text.tertiary.default }} />
                    <AlignJustify size={14} style={{ margin: '0 auto', color: t.text.secondary.default }} />
                  </div>
                  <div style={{ width: 36, height: 72, borderRadius: 6, border: `1px solid ${t.border.default.default}`, display: 'flex', gap: 2, padding: 2 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ flex: 1, background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                    ))}
                  </div>
                  <div style={{ width: 28, height: 72, borderRadius: 6, border: `1px solid ${t.border.default.default}`, position: 'relative', background: t.bg.surface.primary.default }}>
                    <div style={{ position: 'absolute', left: 4, right: 4, top: 24, height: 2, background: '#D22232' }} />
                  </div>
                  <div style={{ width: 40, height: 72, borderRadius: 6, border: `1px solid ${t.border.default.default}`, display: 'grid', placeItems: 'center', fontSize: 10, color: t.text.secondary.default }}>15</div>
                  <ChevronRight size={14} style={{ color: t.text.tertiary.default }} />
                  <Tag size={14} style={{ position: 'absolute', right: 8, bottom: 8, color: t.text.tertiary.default }} />
                </div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>
                  Month, Week, Day, and Mini views all consume the same CalendarEvent array. Switching views doesn&apos;t reload data — it reframes the same events in a different temporal resolution. Month gives overview, Week gives structure, Day gives precision, Mini gives navigation.
                </p>
              </div>
              <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 14, padding: 20, background: t.bg.surface.primary.default }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Clock size={20} color={t.icon.brand.default} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: t.text.primary.default }}>Time flows vertically</span>
                </div>
                <div style={{ height: 120, borderRadius: 10, background: t.bg.surface.secondary.default, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <div style={{ width: 120, height: 88, borderRadius: 8, border: `1px solid ${t.border.default.default}`, position: 'relative', background: t.bg.surface.primary.default }}>
                    <div style={{ position: 'absolute', left: 28, right: 4, top: 40, height: 2, background: '#D22232' }} />
                    <div style={{ position: 'absolute', left: 32, top: 12, right: 8, height: 22, borderRadius: 4, background: 'rgba(0,43,73,0.12)', opacity: 0.55 }} />
                    <div style={{ position: 'absolute', left: 32, top: 52, right: 8, height: 28, borderRadius: 4, background: 'rgba(0,43,73,0.12)' }} />
                  </div>
                </div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>
                  In week and day views, time flows top-to-bottom. The current time is always marked with a red indicator line so the user knows exactly where &apos;now&apos; is in the day. Events are positioned precisely by their start time and sized proportionally to their duration.
                </p>
              </div>
              <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 14, padding: 20, background: t.bg.surface.primary.default }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Square size={20} color={t.icon.brand.default} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: t.text.primary.default }}>Overlapping events share space</span>
                </div>
                <div style={{ height: 120, borderRadius: 10, background: t.bg.surface.secondary.default, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 140, height: 88, borderRadius: 8, border: `1px solid ${t.border.default.default}`, position: 'relative', background: t.bg.surface.primary.default }}>
                    <div style={{ position: 'absolute', left: 8, width: 38, top: 28, height: 36, borderRadius: 4, background: 'rgba(0,43,73,0.12)', fontSize: 8, padding: 4 }}>A</div>
                    <div style={{ position: 'absolute', left: 50, width: 38, top: 28, height: 36, borderRadius: 4, background: 'rgba(124,58,237,0.12)', fontSize: 8, padding: 4 }}>B</div>
                    <div style={{ position: 'absolute', left: 92, width: 38, top: 28, height: 36, borderRadius: 4, background: 'rgba(10,136,83,0.12)', fontSize: 8, padding: 4 }}>C</div>
                    <div style={{ position: 'absolute', left: 36, top: 4, fontSize: 9, fontWeight: 800, color: '#E8186D' }}>overlap</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>
                  When events overlap in the week or day view, they split the available column width proportionally. Two overlapping events each get 50% of the width; three get 33%. This prevents events from hiding each other while preserving temporal accuracy.
                </p>
              </div>
            </div>
          </section>

          <section id="month-view" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Month view
            </h2>
            <div style={{ ...dottedZone(t, 360), position: 'relative', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: '100%', maxWidth: 520, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden', background: t.bg.surface.primary.default }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${t.border.default.default}` }}>
                  <AnnotationDot letter="B" />
                  <span style={{ fontSize: 11, fontWeight: 700 }}>April 2026</span>
                  <MoreHorizontal size={14} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: `1px solid ${t.border.default.default}`, background: t.bg.surface.secondary.default, fontSize: 9, textAlign: 'center', padding: '4px 0' }}>
                  {WD_SUN.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', fontSize: 10, minHeight: 160 }}>
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} style={{ border: `1px solid ${t.border.default.default}`, padding: 4, position: 'relative' }}>
                      <Circle size={8} style={{ position: 'absolute', top: 2, right: 2, opacity: i === 2 ? 1 : 0 }} />
                      {i === 6 ? <AnnotationDot letter="G" /> : null}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AnnotationDot letter="A" />
                <span style={{ fontSize: 11, color: t.text.secondary.default }}>Container</span>
              </div>
            </div>
          </section>

          <section id="week-view" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Week view
            </h2>
            <div style={{ ...dottedZone(t, 360), flexDirection: 'column', gap: 8 }}>
              <div style={{ width: '100%', maxWidth: 520, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden', background: t.bg.surface.primary.default }}>
                <div style={{ padding: 8, borderBottom: `1px solid ${t.border.default.default}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AnnotationDot letter="B" />
                  <span style={{ fontSize: 11, fontWeight: 700 }}>Apr 14 – Apr 20</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7,1fr)', fontSize: 8, textAlign: 'center', borderBottom: `2px solid ${t.border.strong.default}` }}>
                  <div />
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x, i) => (
                    <div key={i} style={{ padding: 4, borderLeft: `1px solid ${t.border.default.default}` }}>
                      {i === 3 ? <AnnotationDot letter="C" /> : x}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7,1fr)', height: 80, borderBottom: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 8, textAlign: 'right', padding: 4 }}>all-day</div>
                  <div style={{ gridColumn: 'span 7', borderLeft: `1px solid ${t.border.default.default}`, padding: 4 }}>
                    <AnnotationDot letter="D" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7,1fr)', height: 120 }}>
                  <div style={{ fontSize: 8, padding: 4, textAlign: 'right' }}>
                    <AnnotationDot letter="E" />9 AM
                  </div>
                  <div style={{ gridColumn: 'span 7', borderLeft: `1px solid ${t.border.default.default}`, position: 'relative' }}>
                    <AnnotationDot letter="F" />
                    <div style={{ position: 'absolute', left: '42%', top: 24, width: '12%', height: 36, background: 'rgba(0,43,73,0.12)', borderRadius: 4 }} />
                    <div style={{ position: 'absolute', left: '42%', top: 56, height: 2, width: '30%', background: '#D22232' }}>
                      <AnnotationDot letter="G" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="day-view" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Day view
            </h2>
            <div style={{ ...dottedZone(t, 360), flexDirection: 'column' }}>
              <div style={{ width: '100%', maxWidth: 480, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden', background: t.bg.surface.primary.default }}>
                <div style={{ padding: 8, borderBottom: `1px solid ${t.border.default.default}`, display: 'flex', justifyContent: 'space-between' }}>
                  <AnnotationDot letter="B" />
                  <X size={14} color={t.icon.tertiary.default} aria-hidden />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', borderBottom: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 8, padding: 4 }}>all-day</div>
                  <div style={{ padding: 4, borderLeft: `1px solid ${t.border.default.default}` }}>
                    <AnnotationDot letter="C" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', height: 140 }}>
                  <div style={{ fontSize: 8, padding: 4 }}>
                    <AnnotationDot letter="D" />
                  </div>
                  <div style={{ borderLeft: `1px solid ${t.border.default.default}`, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 8, right: 8, top: 16, height: 48, borderRadius: 6, background: 'rgba(0,43,73,0.12)' }}>
                      <AnnotationDot letter="E" />
                    </div>
                    <div style={{ position: 'absolute', left: 8, width: '44%', top: 72, height: 32, background: 'rgba(0,43,73,0.12)', borderRadius: 4 }} />
                    <div style={{ position: 'absolute', right: 8, width: '44%', top: 72, height: 32, background: 'rgba(124,58,237,0.12)', borderRadius: 4 }}>
                      <AnnotationDot letter="G" />
                    </div>
                    <div style={{ position: 'absolute', left: 8, right: 8, top: 112, height: 2, background: '#D22232' }}>
                      <AnnotationDot letter="H" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="mini-calendar" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Mini calendar
            </h2>
            <div style={{ ...dottedZone(t, 300), flexDirection: 'column' }}>
              <div style={{ width: 220, border: `1px solid ${t.border.default.default}`, borderRadius: 12, overflow: 'hidden', background: t.bg.surface.primary.default }}>
                <div style={{ padding: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AnnotationDot letter="B" />
                  <span style={{ fontSize: 11, fontWeight: 700 }}>April 2026</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', fontSize: 8, textAlign: 'center', color: t.text.tertiary.default }}>
                  {WD_SUN.map((d) => (
                    <span key={d}>{d.slice(0, 2)}</span>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, padding: 8, fontSize: 10, placeItems: 'center' }}>
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', opacity: i < 3 ? 0.3 : 1 }}>
                      {i === 14 ? <AnnotationDot letter="D" /> : i === 17 ? <AnnotationDot letter="E" /> : i % 5 === 0 ? <AnnotationDot letter="G" /> : i + 1}
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: `1px solid ${t.border.default.default}`, padding: 6 }}>
                  <AnnotationDot letter="H" />
                </div>
              </div>
            </div>
          </section>

          <section id="event-types" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Event types
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {[
                {
                  title: 'Timed',
                  chip: "allDay: false · time: '09:00'",
                  desc: 'Event with start time and optional duration. Shows time prefix in month view, positioned by time in week/day view.',
                  ill: '● 9:00 AM Team standup',
                },
                {
                  title: 'All-day',
                  chip: 'allDay: true',
                  desc: 'Spans the entire day. Shown in the all-day row in week/day views, at the top of cells in month view.',
                  ill: 'Q2 deadline',
                },
                {
                  title: 'Multi-day',
                  chip: 'multiDay: true · endDate: Date',
                  desc: 'Spans multiple days. Chip connects visually across cells/columns with rounded ends only at start and end.',
                  ill: '████ Sprint ████',
                },
                {
                  title: 'Overlapping',
                  chip: 'overlap detection',
                  desc: 'When events share time in week/day view, they split the column width proportionally. Detected automatically.',
                  ill: '▌ ▌',
                },
              ].map((x) => (
                <div key={x.title} style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 14, padding: 16, background: t.bg.surface.primary.default }}>
                  <div style={{ height: 72, borderRadius: 8, background: t.bg.surface.secondary.default, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: t.text.primary.default }}>
                    {x.ill}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8, color: t.text.primary.default }}>{x.title}</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>{x.chip}</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>{x.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="day-states" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Day states
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {[
                { label: 'DEFAULT', sub: 'color secondary, no bg' },
                { label: 'TODAY', sub: 'bg fill.primary circle, color white' },
                { label: 'SELECTED', sub: 'bg surface.tertiary circle, color primary' },
                { label: 'OTHER MONTH', sub: 'opacity 0.4, cell bg surface.secondary' },
                { label: 'HOVER', sub: 'bg surface.secondary, cursor pointer' },
              ].map((s) => (
                <div key={s.label} style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 12, padding: 12, background: t.bg.surface.primary.default }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: t.text.primary.default, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: t.text.secondary.default }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-cal" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              When to use
            </h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.7, margin: '0 0 12px' }}>
              <strong style={{ color: t.text.primary.default }}>Do:</strong> scheduling apps, project timelines, booking systems, team calendars, content calendars, sprint planning, event management, resource allocation.
            </p>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: t.text.primary.default }}>Don&apos;t:</strong> seleccionar una fecha en un formulario (→ DatePicker), mostrar un único evento con detalles (→ Card o Modal), mostrar una línea de tiempo horizontal (→ Gantt/Timeline component).
            </p>
            <div style={{ marginTop: 16 }}>
              <Callout variant="tip" title="Default to Month, let users drill down">
                Always start in Month view — it gives the broadest context. Let users click a day to jump to Day view, or click a week number to jump to Week view. This drill-down pattern is universal and expected.
              </Callout>
            </div>
          </section>

          <section id="view-guide" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Choosing a view
            </h2>
            <div className="props-table-wrap" style={{ marginBottom: 8 }}>
              <table className="props-table">
                <thead>
                  <tr>
                    <th>View</th>
                    <th>Temporal scope</th>
                    <th>Primary use</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="props-table__name">Month</td>
                    <td>4–5 weeks</td>
                    <td className="props-table__desc">Overview, planning, spotting busy periods</td>
                  </tr>
                  <tr>
                    <td className="props-table__name">Week</td>
                    <td>7 days</td>
                    <td className="props-table__desc">Scheduling, daily structure, time blocking</td>
                  </tr>
                  <tr>
                    <td className="props-table__name">Day</td>
                    <td>24 hours</td>
                    <td className="props-table__desc">Precision scheduling, detailed day management</td>
                  </tr>
                  <tr>
                    <td className="props-table__name">Mini</td>
                    <td>1 month compact</td>
                    <td className="props-table__desc">Date navigation, sidebar companion, date picker</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="dos-donts-cal" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <IllustratedDoDont
                t={t}
                ok
                title="Preserve date across view switches"
                caption="Do: usuario en Month ve &quot;April 15&quot; → switch a Week → week view muestra la semana del 15. Don&apos;t: switch a Week → week view muestra la semana actual sin relación al contexto previo."
              >
                <div style={{ fontSize: 11, color: t.text.secondary.default }}>Month · Week · mismo cursor de fecha</div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Show current time in week/day"
                caption="Do: línea roja en la hora actual, siempre visible al abrir la vista. Don&apos;t: time grid sin indicador de &apos;ahora&apos; — el usuario tiene que calcular mentalmente dónde está en el día."
              >
                <div style={{ width: 120, height: 40, border: `1px solid ${t.border.default.default}`, position: 'relative', borderRadius: 6 }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 18, height: 2, background: '#D22232' }} />
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Event colors consistent across views"
                caption="Do: &quot;Team standup&quot; siempre en brand azul en Month, Week, y Day view. Don&apos;t: mismo evento con diferente color según la vista — rompe el reconocimiento."
              >
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(0,43,73,0.12)', color: '#002b49', fontSize: 10 }}>Standup</span>
                  <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(0,43,73,0.12)', color: '#002b49', fontSize: 10 }}>Standup</span>
                </div>
              </IllustratedDoDont>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title" style={{ marginBottom: 12 }}>
            Event title writing
          </h2>
          <ul style={{ margin: '0 0 24px', paddingLeft: 20, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.75 }}>
            <li>Short: &apos;Team standup&apos;, &apos;Q2 deadline&apos;, &apos;1:1 with Ana&apos;.</li>
            <li>Max 3–4 words — chip truncates at ~20 chars in month cells.</li>
            <li>Timed events: no repitas el tiempo en el título — se muestra automáticamente.</li>
            <li>All-day events: noun phrase — &apos;Conference&apos;, &apos;Public holiday&apos;.</li>
          </ul>
          <h2 className="section-title" style={{ marginBottom: 12 }}>
            Color assignment
          </h2>
          <ul style={{ margin: '0 0 24px', paddingLeft: 20, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.75 }}>
            <li>Define una clave de colores y mantenla: brand=reuniones, red=deadlines, green=personal.</li>
            <li>Documenta los significados en tu producto.</li>
            <li>Nunca más de 5 colores — más allá pierden su función como señal.</li>
          </ul>
          <h2 className="section-title" style={{ marginBottom: 12 }}>
            Time formatting
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.75 }}>
            <li>Use 12h or 24h consistently throughout the product.</li>
            <li>Duration: &apos;30 min&apos;, &apos;1 hr&apos;, &apos;1 hr 30 min&apos; — not &apos;90 min&apos;.</li>
          </ul>
        </section>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="code-types-cal" style={{ marginTop: 32, marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              CalendarEvent type
            </h2>
            <CodeBlock
              filename="CalendarEvent"
              language="tsx"
              code={`interface CalendarEvent {
  id: string
  title: string
  date: Date
  endDate?: Date
  allDay?: boolean
  time?: string           // '09:00' 24h format
  duration?: number       // minutes
  color?: 'brand' | 'purple' | 'green' | 'orange' | 'red'
  description?: string
  location?: string
  attendees?: string[]
  multiDay?: boolean
}`}
            />
          </section>
          <section id="code-month-cal" style={{ marginBottom: 16 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              CalendarMonth props
            </h3>
            <PropsTable props={monthPropsRows} />
          </section>
          <section id="code-week-cal" style={{ marginBottom: 16 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              CalendarWeek props
            </h3>
            <PropsTable props={weekPropsRows} />
          </section>
          <section id="code-day-cal" style={{ marginBottom: 16 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              CalendarDay props
            </h3>
            <PropsTable props={dayPropsRows} />
          </section>
          <section id="code-mini-cal" style={{ marginBottom: 16 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              CalendarMini props
            </h3>
            <PropsTable props={miniPropsRows} />
          </section>
          <section style={{ marginBottom: 16 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Code examples
            </h3>
            <CodeBlock
              filename="events.ts"
              language="tsx"
              code={`// ─── Shared events array ───
const events: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team standup',
    date: new Date(),
    time: '09:00',
    duration: 30,
    color: 'brand',
  },
  {
    id: '2',
    title: 'Conference',
    date: new Date('2026-04-20'),
    endDate: new Date('2026-04-22'),
    allDay: true,
    color: 'orange',
  },
]`}
            />
            <CodeBlock
              filename="Month.tsx"
              language="tsx"
              code={`<CalendarMonth
  events={events}
  onDateSelect={(date) => setActiveDate(date)}
  onEventClick={(event) => openEventDetail(event)}
  onEventCreate={(date) => openCreateModal(date)}
  firstDayOfWeek={1}
/>`}
            />
            <CodeBlock
              filename="Week.tsx"
              language="tsx"
              code={`<CalendarWeek
  events={events}
  defaultDate={activeDate}
  onEventClick={(event) => openEventDetail(event)}
  onEventCreate={(date, time) => openCreateModal(date, time)}
  startHour={7}
  endHour={22}
/>`}
            />
            <CodeBlock
              filename="Day.tsx"
              language="tsx"
              code={`<CalendarDay
  events={events}
  defaultDate={activeDate}
  onEventClick={(event) => openEventDetail(event)}
  onEventCreate={(date, time) => openCreateModal(date, time)}
  showAside
/>`}
            />
            <CodeBlock
              filename="Mini.tsx"
              language="tsx"
              code={`<CalendarMini
  value={selectedDate}
  onChange={setSelectedDate}
  events={events}
  firstDayOfWeek={1}
/>`}
            />
            <CodeBlock
              filename="App.tsx"
              language="tsx"
              code={`const [view, setView] = useState<'month'|'week'|'day'>('month')
const [activeDate, setActiveDate] = useState(new Date())
const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)

// View switcher segmented control
<div style={{ display: 'flex', gap: 4 }}>
  {(['month','week','day'] as const).map(v => (
    <button key={v} onClick={() => setView(v)}
      style={{ padding: '6px 14px', borderRadius: 8, fontWeight: 600,
        background: view === v ? t.bg.fill.primary.default : 'transparent',
        color: view === v ? 'white' : t.text.secondary.default,
        border: \`1px solid \${view === v ? 'transparent' : t.border.default.default}\` }}>
      {v.charAt(0).toUpperCase() + v.slice(1)}
    </button>
  ))}
</div>

{view === 'month' && (
  <CalendarMonth
    events={events}
    value={activeDate}
    onDateSelect={(d) => { setActiveDate(d); setView('day') }}
    onEventClick={handleEventClick}
    onEventCreate={handleEventCreate}
  />
)}
{view === 'week' && (
  <CalendarWeek
    events={events}
    defaultDate={activeDate}
    onEventClick={handleEventClick}
    onEventCreate={handleEventCreate}
  />
)}
{view === 'day' && (
  <CalendarDay
    events={events}
    defaultDate={activeDate}
    onEventClick={handleEventClick}
    onEventCreate={handleEventCreate}
    showAside
  />
)}`}
            />
          </section>
          <section id="code-a11y-cal" style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              All calendar views use role=&apos;grid&apos; with role=&apos;row&apos; and role=&apos;gridcell&apos;. Day cells have aria-label=&apos;[Full date]&apos; and aria-selected. Today has aria-current=&apos;date&apos;. Event elements have role=&apos;button&apos; with aria-label including title and time. The current time indicator has aria-hidden=&apos;true&apos;. Navigation buttons have descriptive aria-labels. Keyboard navigation: Arrow keys move between days/cells, Enter selects, Tab moves to interactive elements within the focused cell.
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
            <div style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: `1px solid ${t.border.default.default}`, alignItems: 'flex-start' }}>
              <span style={chipStyleB(t)}>v1.0.0</span>
              <span style={{ fontSize: 13, color: t.text.tertiary.default, width: 100, flexShrink: 0 }}>April 2026</span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, flex: 1, margin: 0 }}>
                Initial release. Calendar with four views — Month (grid with overflow), Week (time grid with all-day row and current time indicator), Day (hourly timeline with overlap detection), Mini (compact date navigator with event dots and range selection). Shared CalendarEvent data model across all views.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
