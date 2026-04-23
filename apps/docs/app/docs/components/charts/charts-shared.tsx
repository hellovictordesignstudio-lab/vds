'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { VDSTheme } from '@/lib/theme';

export const lineData = [
  { month: 'Jan', revenue: 4200, users: 820 },
  { month: 'Feb', revenue: 5800, users: 932 },
  { month: 'Mar', revenue: 5200, users: 901 },
  { month: 'Apr', revenue: 7800, users: 1290 },
  { month: 'May', revenue: 6900, users: 1100 },
  { month: 'Jun', revenue: 9200, users: 1450 },
  { month: 'Jul', revenue: 8400, users: 1320 },
  { month: 'Aug', revenue: 11200, users: 1820 },
  { month: 'Sep', revenue: 10500, users: 1650 },
  { month: 'Oct', revenue: 13400, users: 2100 },
  { month: 'Nov', revenue: 12800, users: 1980 },
  { month: 'Dec', revenue: 15600, users: 2450 },
] as const;

export const barData = [
  { quarter: 'Q1', design: 4200, code: 3800, consulting: 2100 },
  { quarter: 'Q2', design: 5800, code: 4200, consulting: 3400 },
  { quarter: 'Q3', design: 5200, code: 5600, consulting: 2800 },
  { quarter: 'Q4', design: 7800, code: 6900, consulting: 4200 },
] as const;

export function seriesPalette(isDark: boolean): string[] {
  return [isDark ? '#1565A8' : '#002b49', '#7C3AED', '#0A8853', '#F07332', '#D22232'];
}

export function chipStyleA(overrides?: CSSProperties): CSSProperties {
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

export function chipStyleB(t: VDSTheme, overrides?: CSSProperties): CSSProperties {
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

export interface ChartTooltipPayloadEntry {
  name: string;
  value: number;
  color?: string;
  dataKey: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadEntry[];
  label?: string;
  formatter?: (value: number, name: string) => string;
  labelFormatter?: (label: string) => string;
}

export function ChartTooltip({ t, active, payload, label, formatter, labelFormatter }: ChartTooltipProps & { t: VDSTheme }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: t.shadow.md,
        minWidth: 140,
      }}
    >
      {label ? (
        <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      ) : null}
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: entry.color ?? t.text.brand.default,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, color: t.text.secondary.default, flex: 1 }}>{entry.name}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>
            {formatter ? formatter(entry.value, entry.name) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

type SparkVariant = 'line' | 'bar' | 'area' | 'dots';

export function Sparkline({
  data,
  color = '#002b49',
  width = 80,
  height = 28,
  showDot = true,
  fill = false,
  variant = 'line',
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showDot?: boolean;
  fill?: boolean;
  variant?: SparkVariant;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;
  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + ((max - v) / range) * (height - pad * 2),
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const fillD =
    fill || variant === 'area'
      ? `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      : '';
  const last = points[points.length - 1];
  const useFill = Boolean(fillD);

  if (variant === 'dots') {
    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 3 : 2} fill={color} />
        ))}
      </svg>
    );
  }
  if (variant === 'bar') {
    const n = data.length;
    const gap = 2;
    const barW = Math.max(2, (width - pad * 2 - gap * (n - 1)) / n);
    const x0 = pad;
    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {data.map((v, i) => {
          const px = x0 + i * (barW + gap);
          const barH = ((v - min) / range) * (height - pad * 2);
          const py = pad + (height - pad * 2) - barH;
          return <rect key={i} x={px} y={py} width={barW} height={barH} rx={1} fill={color} />;
        })}
      </svg>
    );
  }
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {useFill ? <path d={fillD} fill={color} fillOpacity={variant === 'area' ? 0.15 : 0.12} /> : null}
      <path d={pathD} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {showDot ? <circle cx={last.x} cy={last.y} r={3} fill={color} stroke="white" strokeWidth={1.5} /> : null}
    </svg>
  );
}

export function IllustratedDoDont({
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

export function variantCardShell(t: VDSTheme, title: string, children: ReactNode): ReactNode {
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
          padding: '10px 14px',
          fontSize: 12,
          fontWeight: 700,
          color: t.text.secondary.default,
          borderBottom: `1px solid ${t.border.default.default}`,
        }}
      >
        {title}
      </div>
      <div style={{ padding: 16, minHeight: 200 }}>{children}</div>
    </div>
  );
}

export function mapTooltipPayload(
  raw: readonly { name?: string; value?: unknown; color?: string; dataKey?: unknown; payload?: Record<string, unknown> }[] | undefined,
): ChartTooltipPayloadEntry[] | undefined {
  if (!raw?.length) return undefined;
  return raw.map((p) => ({
    name: String(p.name ?? p.dataKey ?? ''),
    value: Number(p.value),
    color: p.color ?? (typeof p.payload?.fill === 'string' ? p.payload.fill : undefined),
    dataKey: String(p.dataKey ?? ''),
  }));
}

export function DonutLegend({
  t,
  items,
  total,
  showPct,
  position,
}: {
  t: VDSTheme;
  items: { name: string; value: number; color: string }[];
  total: number;
  showPct: boolean;
  position: 'bottom' | 'right';
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: position === 'right' ? 'column' : 'row',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: position === 'right' ? 'flex-start' : 'center',
        justifyContent: position === 'bottom' ? 'center' : 'flex-start',
        marginTop: position === 'bottom' ? 12 : 0,
        paddingLeft: position === 'right' ? 8 : 0,
        minWidth: position === 'right' ? 120 : undefined,
      }}
    >
      {items.map((d) => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: t.text.secondary.default }}>{d.name}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>{d.value.toLocaleString()}</span>
          {showPct ? (
            <span style={{ fontSize: 11, color: t.text.tertiary.default }}>{((d.value / total) * 100).toFixed(1)}%</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
