'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BarChart2,
  ChevronRight,
  DollarSign,
  Eye,
  Minus,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type TrendDirection = 'up' | 'down' | 'neutral';

interface TrendConfig {
  value: string;
  direction: TrendDirection;
  label?: string;
}

type StatVariant = 'default' | 'minimal' | 'bordered' | 'colored';
type StatSize = 'sm' | 'md' | 'lg';
type IconColor = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';

const SIZE_MAP: Record<StatSize, { padding: number; valuePx: number; iconBox: number; glyph: number }> = {
  sm: { padding: 16, valuePx: 22, iconBox: 28, glyph: 14 },
  md: { padding: 20, valuePx: 28, iconBox: 32, glyph: 16 },
  lg: { padding: 24, valuePx: 36, iconBox: 40, glyph: 20 },
};

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

function iconContainerStyle(t: VDSTheme, iconColor: IconColor): { bg: string; fg: string } {
  switch (iconColor) {
    case 'success':
      return { bg: '#0A8853', fg: '#FFFFFF' };
    case 'warning':
      return { bg: '#F07332', fg: '#FFFFFF' };
    case 'danger':
      return { bg: '#D22232', fg: '#FFFFFF' };
    case 'neutral':
      return { bg: t.bg.surface.tertiary.default, fg: t.text.secondary.default };
    default:
      return { bg: t.bg.fill.primary.default, fg: '#FFFFFF' };
  }
}

function coloredShell(t: VDSTheme, iconColor: IconColor): { bg: string; border: string; value: string } {
  switch (iconColor) {
    case 'success':
      return { bg: t.bg.fill.success.default, border: t.border.success.default, value: t.text.success.default };
    case 'warning':
      return { bg: t.bg.fill.warning.default, border: t.border.warning.default, value: t.text.warning.default };
    case 'danger':
      return { bg: t.bg.fill.danger.default, border: t.border.danger.default, value: t.text.danger.default };
    case 'neutral':
      return { bg: t.bg.surface.tertiary.default, border: t.border.default.default, value: t.text.primary.default };
    default:
      return { bg: t.bg.fill.brandSubtle.default, border: t.border.brand.default, value: t.text.brand.default };
  }
}

function trendSemantic(direction: TrendDirection, trendInverted: boolean): { bg: string; color: string } {
  if (direction === 'neutral') {
    return { bg: 'rgba(128,128,128,0.08)', color: '#888888' };
  }
  const good = { bg: 'rgba(10,136,83,0.10)', color: '#0A8853' };
  const bad = { bg: 'rgba(210,34,50,0.10)', color: '#D22232' };
  if (!trendInverted) {
    return direction === 'up' ? good : bad;
  }
  return direction === 'up' ? bad : good;
}

function sparklineColor(direction: TrendDirection, trendInverted: boolean, t: VDSTheme): string {
  if (direction === 'neutral') return t.text.tertiary.default;
  if (!trendInverted) return direction === 'up' ? '#0A8853' : '#D22232';
  return direction === 'up' ? '#D22232' : '#0A8853';
}

function buildStatAriaLabel(label: string, value: string | number, trend?: TrendConfig): string {
  const base = `${label}: ${value}`;
  if (!trend) return base;
  const period = trend.label ? trend.label.replace(/^vs\s+/i, 'versus ') : '';
  if (trend.direction === 'neutral') {
    return `${base}, flat ${trend.value}${period ? ` ${period}` : ''}`.trim();
  }
  const dirWord = trend.direction === 'up' ? 'up' : 'down';
  const valClean = trend.value.replace(/^[+]/, '');
  return `${base}, ${dirWord} ${valClean}${period ? ` ${period}` : ''}`.trim();
}

function SparklinePath({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2) return null;
  const w = 100;
  const h = 40;
  const pad = 2;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = pad + (i / (points.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (p - min) / range) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  return (
    <svg width="100%" height={40} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function StatCard({
  t,
  label,
  value,
  trend,
  icon,
  iconColor = 'brand',
  variant = 'default',
  size = 'md',
  trendInverted = false,
  sparkline,
  footer,
  className,
}: {
  t: VDSTheme;
  label: string;
  value: string | number;
  trend?: TrendConfig;
  icon?: ReactNode;
  iconColor?: IconColor;
  variant?: StatVariant;
  size?: StatSize;
  trendInverted?: boolean;
  sparkline?: number[];
  footer?: string;
  className?: string;
}) {
  const s = SIZE_MAP[size];
  const ic = iconContainerStyle(t, iconColor);
  const colored = coloredShell(t, iconColor);
  const trendSt = trend ? trendSemantic(trend.direction, trendInverted) : null;
  const TrendIcon = trend ? (trend.direction === 'up' ? TrendingUp : trend.direction === 'down' ? TrendingDown : Minus) : Minus;
  const aria = buildStatAriaLabel(label, value, trend);

  const baseCard: CSSProperties = {
    borderRadius: 14,
    padding: s.padding,
    overflow: 'hidden',
    boxSizing: 'border-box',
    width: '100%',
  };

  let shell: CSSProperties = { ...baseCard };
  if (variant === 'default') {
    shell = {
      ...shell,
      background: t.bg.surface.primary.default,
      border: `1px solid ${t.border.default.default}`,
    };
  } else if (variant === 'minimal') {
    shell = {
      ...shell,
      background: 'transparent',
      border: 'none',
    };
  } else if (variant === 'bordered') {
    const left =
      trend && trend.direction !== 'neutral'
        ? !trendInverted
          ? trend.direction === 'up'
            ? '#0A8853'
            : '#D22232'
          : trend.direction === 'up'
            ? '#D22232'
            : '#0A8853'
        : t.border.default.default;
    shell = {
      ...shell,
      background: t.bg.surface.primary.default,
      border: `1px solid ${t.border.default.default}`,
      borderLeft: `3px solid ${left}`,
    };
  } else {
    shell = {
      ...shell,
      background: colored.bg,
      border: `1px solid ${colored.border}`,
    };
  }

  const valueColor = variant === 'colored' ? colored.value : t.text.primary.default;

  return (
    <article className={className} aria-label={aria} style={shell}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: t.text.tertiary.default,
          }}
        >
          {label}
        </div>
        {icon ? (
          <div
            style={{
              width: s.iconBox,
              height: s.iconBox,
              borderRadius: 8,
              background: ic.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ display: 'flex', color: ic.fg }}>{icon}</span>
          </div>
        ) : null}
      </div>
      <div
        style={{
          fontSize: s.valuePx,
          fontWeight: 800,
          color: valueColor,
          letterSpacing: '-0.02em',
          marginTop: 8,
          marginBottom: 8,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {trend && trendSt ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 6,
                padding: '3px 8px',
                background:
                  trend.direction === 'neutral' ? t.bg.surface.tertiary.default : trendSt.bg,
                color: trend.direction === 'neutral' ? t.text.tertiary.default : trendSt.color,
              }}
            >
              <TrendIcon size={12} aria-hidden />
              {trend.value}
            </span>
            {trend.label ? (
              <span style={{ fontSize: 11, color: t.text.tertiary.default }}>{trend.label}</span>
            ) : null}
          </div>
          {sparkline && sparkline.length > 1 ? (
            <SparklinePath points={sparkline} color={sparklineColor(trend.direction, trendInverted, t)} />
          ) : null}
        </div>
      ) : null}
      {footer ? (
        <div
          style={{
            borderTop: `1px solid ${t.border.default.default}`,
            marginTop: 12,
            paddingTop: 12,
            fontSize: 12,
            color: t.text.tertiary.default,
          }}
        >
          {footer}
        </div>
      ) : null}
    </article>
  );
}

type DemoKpi = {
  label: string;
  value: string;
  trend?: TrendConfig;
  icon: typeof DollarSign;
  iconColor: IconColor;
  trendInverted?: boolean;
  sparkline?: number[];
};

const DEMO_KPIS: DemoKpi[] = [
  {
    label: 'Total revenue',
    value: '$48,295',
    trend: { value: '+12.5%', direction: 'up', label: 'vs last month' },
    icon: DollarSign,
    iconColor: 'brand',
  },
  {
    label: 'Active users',
    value: '8,492',
    trend: { value: '+3.2%', direction: 'up', label: 'vs last week' },
    icon: Users,
    iconColor: 'success',
  },
  {
    label: 'Bounce rate',
    value: '24.8%',
    trend: { value: '-1.4%', direction: 'down', label: 'vs last month' },
    icon: Activity,
    iconColor: 'warning',
    trendInverted: true,
  },
  {
    label: 'Avg. order value',
    value: '$127',
    trend: { value: '0.0%', direction: 'neutral', label: 'vs last month' },
    icon: ShoppingCart,
    iconColor: 'neutral',
  },
];

function StatCardLiveGrid({
  t,
  variant,
  size,
  showIcon,
  showTrend,
  showSpark,
  iconColor,
}: {
  t: VDSTheme;
  variant: StatVariant;
  size: StatSize;
  showIcon: boolean;
  showTrend: boolean;
  showSpark: boolean;
  iconColor: IconColor;
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 680,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
      }}
    >
      {DEMO_KPIS.map((k) => {
        const Icon = k.icon;
        const spark =
          showSpark && k.trend
            ? k.label === 'Total revenue'
              ? [38000, 40000, 42000, 44000, 46000, 47500, 48295]
              : k.label === 'Active users'
                ? [4200, 4800, 5100, 4900, 6200, 7400, 8492]
                : k.label === 'Bounce rate'
                  ? [28, 27, 26.5, 25.8, 25.2, 24.9, 24.8]
                  : [120, 118, 122, 125, 124, 126, 127]
            : undefined;
        return (
          <StatCard
            key={k.label}
            t={t}
            label={k.label}
            value={k.value}
            trend={showTrend ? k.trend : undefined}
            icon={showIcon ? <Icon size={SIZE_MAP[size].glyph} /> : undefined}
            iconColor={iconColor}
            variant={variant}
            size={size}
            trendInverted={k.trendInverted}
            sparkline={spark}
          />
        );
      })}
    </div>
  );
}

export default function StatCardDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [variant, setVariant] = useState<StatVariant>('default');
  const [size, setSize] = useState<StatSize>('md');
  const [showIcon, setShowIcon] = useState<'off' | 'on'>('on');
  const [showTrend, setShowTrend] = useState<'off' | 'on'>('on');
  const [showSpark, setShowSpark] = useState<'off' | 'on'>('off');
  const [iconColor, setIconColor] = useState<IconColor>('brand');

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const t = buildTheme(isDark);
  const previewDark = appearance === 'dark';
  const previewT = previewDark ? buildTheme(true) : t;

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-sc', label: 'Principles' },
        { id: 'anatomy-sc', label: 'Anatomy' },
        { id: 'variants-sc', label: 'Variants' },
        { id: 'trend-types', label: 'Trend types' },
        { id: 'sizes-sc', label: 'Sizes' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-sc', label: 'When to use' },
        { id: 'grid-patterns', label: 'Grid patterns' },
        { id: 'dos-donts-sc', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'content-labels-sc', label: 'Label writing' },
        { id: 'content-values-sc', label: 'Value formatting' },
        { id: 'content-trend-sc', label: 'Trend label' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'props-stat', label: 'StatCard props' },
        { id: 'type-trend', label: 'TrendConfig' },
        { id: 'code-examples-sc', label: 'Examples' },
        { id: 'a11y-sc', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const statCardPropsRows = [
    { name: 'label', type: 'string', default: '—', description: 'Metric name (required)', required: true as boolean },
    { name: 'value', type: 'string | number', default: '—', description: 'Primary metric value (required)', required: true as boolean },
    { name: 'trend', type: 'TrendConfig', default: '—', description: 'Trend/comparison data' },
    { name: 'icon', type: 'ReactNode', default: '—', description: 'Leading icon' },
    {
      name: 'iconColor',
      type: "'brand' | 'success' | 'warning' | 'danger' | 'neutral'",
      default: "'brand'",
      description: 'Icon container color',
    },
    {
      name: 'variant',
      type: "'default' | 'minimal' | 'bordered' | 'colored'",
      default: "'default'",
      description: 'Visual style',
    },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Card size' },
    { name: 'trendInverted', type: 'boolean', default: 'false', description: 'Flip trend colors' },
    { name: 'sparkline', type: 'number[]', default: '—', description: 'Data points for sparkline SVG' },
    { name: 'footer', type: 'string', default: '—', description: 'Footer comparison text' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const codeExamples = `// Basic stat card
<StatCard
  label="Total revenue"
  value="$48,295"
  trend={{ value: '+12.5%', direction: 'up', label: 'vs last month' }}
  icon={<DollarSign size={16} />}
  iconColor="brand"
/>

// Inverted metric (down = good)
<StatCard
  label="Bounce rate"
  value="24.8%"
  trend={{ value: '-1.4%', direction: 'down', label: 'vs last month' }}
  icon={<Activity size={16} />}
  iconColor="warning"
  trendInverted
/>

// With sparkline
<StatCard
  label="Active users"
  value="8,492"
  trend={{ value: '+3.2%', direction: 'up', label: 'vs last week' }}
  icon={<Users size={16} />}
  iconColor="success"
  sparkline={[4200, 4800, 5100, 4900, 6200, 7400, 8492]}
/>

// Minimal variant — inside a card
<Card>
  <Card.Body>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
      <StatCard label="Orders"   value="1,284" trend={{ value: '+8%', direction: 'up' }}   variant="minimal" />
      <StatCard label="Revenue"  value="$42K"  trend={{ value: '+12%', direction: 'up' }}  variant="minimal" />
      <StatCard label="Refunds"  value="23"    trend={{ value: '+2%', direction: 'up' }}    variant="minimal" trendInverted />
    </div>
  </Card.Body>
</Card>

// Hero KPI — large
<StatCard
  label="Annual recurring revenue"
  value="$1.24M"
  trend={{ value: '+34.2%', direction: 'up', label: 'vs last year' }}
  icon={<TrendingUp size={20} />}
  iconColor="success"
  variant="colored"
  size="lg"
  footer="$923K last year"
/>

// Dashboard grid
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
  {kpis.map(kpi => (
    <StatCard
      key={kpi.id}
      label={kpi.label}
      value={kpi.value}
      trend={kpi.trend}
      icon={kpi.icon}
      iconColor={kpi.color}
      trendInverted={kpi.invertTrend}
    />
  ))}
</div>`;

  const trendConfigSnippet = `interface TrendConfig {
  value: string       // e.g. '+12.5%' or '-3.2%'
  direction: 'up' | 'down' | 'neutral'
  label?: string      // e.g. 'vs last month'
}`;

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components{' '}
        <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Stat Card
      </p>
      <h1 className="page-title">Stat Card</h1>
      <p className="page-lead">
        Stat Cards surface a single key metric with context. They answer the question a decision-maker asks first: &apos;What&apos;s the number,
        and is it going in the right direction?&apos; A good stat card shows the value, its label, and a trend or comparison — nothing more.
        Clarity beats density every time.
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
                    label="Variant"
                    options={['default', 'minimal', 'bordered', 'colored']}
                    value={variant}
                    onChange={(v) => setVariant(v as StatVariant)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Size"
                    options={['sm', 'md', 'lg']}
                    value={size}
                    onChange={(v) => setSize(v as StatSize)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show icon"
                    options={['off', 'on']}
                    value={showIcon}
                    onChange={(v) => setShowIcon(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show trend"
                    options={['off', 'on']}
                    value={showTrend}
                    onChange={(v) => setShowTrend(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show sparkline"
                    options={['off', 'on']}
                    value={showSpark}
                    onChange={(v) => setShowSpark(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Icon color"
                    options={['brand', 'success', 'warning', 'danger', 'neutral']}
                    value={iconColor}
                    onChange={(v) => setIconColor(v as IconColor)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Appearance"
                    options={['Light', 'Dark']}
                    value={previewDark ? 'Dark' : 'Light'}
                    onChange={(v) => setAppearance(v === 'Dark' ? 'dark' : 'light')}
                    showDivider={false}
                  />
                </>
              }
            >
              <div
                style={{
                  width: '100%',
                  minHeight: 400,
                  padding: 32,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StatCardLiveGrid
                  t={previewT}
                  variant={variant}
                  size={size}
                  showIcon={showIcon === 'on'}
                  showTrend={showTrend === 'on'}
                  showSpark={showSpark === 'on'}
                  iconColor={iconColor}
                />
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-sc" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Principles
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 200), padding: 16 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div
                      style={{
                        width: 150,
                        padding: 10,
                        borderRadius: 14,
                        background: t.bg.surface.primary.default,
                        border: `1px solid ${t.border.default.default}`,
                        fontSize: 9,
                        color: t.text.secondary.default,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: t.text.tertiary.default }}>KPI</span>
                        <Eye size={12} aria-hidden />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        <span>12.4K</span>
                        <span>3.2%</span>
                        <span>8.1K</span>
                        <span>44%</span>
                        <span>0.4</span>
                        <span>91</span>
                      </div>
                      <div style={{ height: 22, marginTop: 6, borderRadius: 4, background: t.bg.surface.tertiary.default }} />
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        <button type="button" style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, border: 'none', background: t.bg.fill.primary.default, color: '#fff' }}>
                          Act
                        </button>
                        <button type="button" style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, border: `1px solid ${t.border.default.default}`, background: 'transparent' }}>
                          More
                        </button>
                      </div>
                      <div style={{ fontSize: 8, color: t.text.tertiary.default, marginTop: 4 }}>Too much</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <StatCard
                        t={t}
                        label="Total revenue"
                        value="$48,295"
                        trend={{ value: '+12.5%', direction: 'up', label: 'vs last month' }}
                        icon={<DollarSign size={16} />}
                        iconColor="brand"
                        size="sm"
                      />
                      <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 6 }}>Just right</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <BarChart2 size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>One metric, one card</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A stat card answers one question. The moment you add a second metric, the user has to decide which one to look at first —
                    and both lose impact. If two numbers are equally important, give them each their own card. If one is subordinate, show it
                    as the trend comparison.
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 200), padding: 16 }}>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <StatCard t={t} label="Total revenue" value="$48,295" variant="minimal" size="sm" />
                      <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 6, textAlign: 'center' }}>No trend</div>
                    </div>
                    <div>
                      <StatCard
                        t={t}
                        label="Total revenue"
                        value="$48,295"
                        trend={{ value: '+12.5%', direction: 'up', label: 'vs last month' }}
                        variant="minimal"
                        size="sm"
                      />
                      <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 6, textAlign: 'center' }}>Number + context</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <TrendingUp size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Context transforms a number into insight</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A number without context is ambiguous — $48,295 could be amazing or terrible. The trend chip answers the implicit question:
                    &apos;compared to what?&apos; Always show a comparison period. &apos;vs last month&apos; or &apos;vs last week&apos; turns raw
                    data into actionable insight.
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 200), padding: 16 }}>
                  <div style={{ width: '100%', maxWidth: 420 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>Inverted metric — down is good</div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: 8,
                      }}
                    >
                      <StatCard
                        t={t}
                        label="Sessions"
                        value="12.4K"
                        trend={{ value: '+4.1%', direction: 'up', label: 'vs last week' }}
                        icon={<Zap size={16} />}
                        iconColor="success"
                        size="sm"
                      />
                      <StatCard
                        t={t}
                        label="Leads"
                        value="842"
                        trend={{ value: '+2.0%', direction: 'up', label: 'vs last week' }}
                        icon={<Users size={16} />}
                        iconColor="success"
                        size="sm"
                      />
                      <StatCard
                        t={t}
                        label="Bounce rate"
                        value="24.8%"
                        trend={{ value: '-1.4%', direction: 'down', label: 'vs last month' }}
                        icon={<Activity size={16} />}
                        iconColor="warning"
                        size="sm"
                        trendInverted
                      />
                      <StatCard
                        t={t}
                        label="Latency"
                        value="120ms"
                        trend={{ value: '+6%', direction: 'up', label: 'vs last week' }}
                        icon={<ArrowUp size={16} />}
                        iconColor="success"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <AlertCircle size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Invert trends for inverted metrics</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Not all metrics improve when they go up. Bounce rate, error rate, churn — these improve when the number decreases. Use
                    trendInverted to flip the color logic: a downward trend shows green, an upward trend shows red. The color must match the
                    semantic meaning, not the mathematical direction.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-sc" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                minHeight: 320,
                ...dottedZone(t, 320),
                padding: 24,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 420, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'flex-start' }}>
                  <AnnotationDot letter="A" />
                  <span style={{ fontSize: 12, color: t.text.tertiary.default }}>Card container</span>
                </div>
                <div style={{ position: 'relative', width: '100%' }}>
                  <StatCard
                    t={t}
                    label="Total revenue"
                    value="$48,295"
                    trend={{ value: '+12.5%', direction: 'up', label: 'vs last month' }}
                    icon={<DollarSign size={16} />}
                    iconColor="brand"
                    size="md"
                    sparkline={[38000, 40000, 42000, 44000, 46000, 47500, 48295]}
                    footer="$42,930 last month"
                  />
                  <div style={{ position: 'absolute', top: 8, left: -36, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <AnnotationDot letter="B" />
                    <AnnotationDot letter="C" />
                  </div>
                  <div style={{ position: 'absolute', top: 72, left: -36 }}>
                    <AnnotationDot letter="D" />
                  </div>
                  <div style={{ position: 'absolute', top: 128, left: -36, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <AnnotationDot letter="E" />
                    <AnnotationDot letter="F" />
                  </div>
                  <div style={{ position: 'absolute', bottom: 52, right: -36 }}>
                    <AnnotationDot letter="I" />
                  </div>
                  <div style={{ position: 'absolute', bottom: 8, left: -36, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <AnnotationDot letter="G" />
                    <AnnotationDot letter="H" />
                  </div>
                </div>
              </div>
            </div>
            <ul style={{ marginTop: 16, paddingLeft: 20, color: t.text.secondary.default, fontSize: 13, lineHeight: 1.7 }}>
              <li>
                <strong style={{ color: t.text.primary.default }}>A</strong> → Card container (bg surface.primary, border 1px, borderRadius 14px, padding per size)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>B</strong> → Label (fontSize 12px, uppercase, letterSpacing 0.06em, color tertiary)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>C</strong> → Icon container (32px, borderRadius 8px, bg per iconColor, icon 16px white)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>D</strong> → Value (fontSize 28px, fontWeight 800, letterSpacing -0.02em, color primary)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>E</strong> → Trend badge (inline-flex, fontSize 12px, fontWeight 700, borderRadius 6px, bg/color per direction,
                TrendingUp/Down/Minus 12px icon)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>F</strong> → Trend label (fontSize 11px, color tertiary — &quot;vs last month&quot;)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>G</strong> → Footer divider (borderTop 1px border.default, marginTop 12px, paddingTop 12px)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>H</strong> → Comparison value (fontSize 12px, color tertiary — prior period value)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>I</strong> → Sparkline (SVG, width 100%, height 40px, line color per trend direction)
              </li>
            </ul>
          </section>

          <section id="variants-sc" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    title: 'Default',
                    token: 'variant: default',
                    desc: 'Standard card with border and subtle background. Use in dashboards and admin panels where multiple stat cards appear together.',
                    node: (
                      <StatCard
                        t={t}
                        label="Total revenue"
                        value="$48,295"
                        trend={{ value: '+12.5%', direction: 'up', label: 'vs last month' }}
                        icon={<DollarSign size={16} />}
                        iconColor="brand"
                        variant="default"
                      />
                    ),
                  },
                  {
                    title: 'Minimal',
                    token: 'variant: minimal',
                    desc: 'No border, no background. Use inside an already-bordered container (a panel, a card) where the outer border provides sufficient grouping.',
                    node: (
                      <StatCard
                        t={t}
                        label="Total revenue"
                        value="$48,295"
                        trend={{ value: '+12.5%', direction: 'up', label: 'vs last month' }}
                        icon={<DollarSign size={16} />}
                        iconColor="brand"
                        variant="minimal"
                      />
                    ),
                  },
                  {
                    title: 'Bordered',
                    token: 'variant: bordered',
                    desc: 'Left accent border colored by the metric&apos;s status. Adds a strong visual cue — useful when the trend direction is the most important signal.',
                    node: (
                      <StatCard
                        t={t}
                        label="Total revenue"
                        value="$48,295"
                        trend={{ value: '+12.5%', direction: 'up', label: 'vs last month' }}
                        icon={<DollarSign size={16} />}
                        iconColor="brand"
                        variant="bordered"
                      />
                    ),
                  },
                  {
                    title: 'Colored',
                    token: 'variant: colored',
                    desc: 'Tinted background matching the icon color. Use to highlight a primary KPI or to create visual differentiation in a mixed dashboard.',
                    node: (
                      <StatCard
                        t={t}
                        label="Total revenue"
                        value="$48,295"
                        trend={{ value: '+12.5%', direction: 'up', label: 'vs last month' }}
                        icon={<DollarSign size={16} />}
                        iconColor="brand"
                        variant="colored"
                      />
                    ),
                  },
                ] as const
              ).map((v) => (
                <div
                  key={v.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 180), padding: 16 }}>{v.node}</div>
                  <div style={{ padding: '16px 16px 12px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{v.title}</div>
                    <span style={chipStyleB(t)}>{v.token}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '12px 0 0' }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="trend-types" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Trend types
            </h2>
            <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.65, marginBottom: 20 }}>
              The trend chip communicates direction and magnitude. Always pair the numerical change with a comparison label.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    title: 'Positive (up)',
                    token: 'direction: up',
                    desc: 'Value increased vs comparison period. Green by default. Red if trendInverted.',
                    metricValue: '$48,295',
                    trend: { value: '+12.5%', direction: 'up' as const, label: 'vs last month' },
                    inverted: false,
                  },
                  {
                    title: 'Negative (down)',
                    token: 'direction: down',
                    desc: 'Value decreased vs comparison period. Red by default. Green if trendInverted (e.g. bounce rate, churn).',
                    metricValue: '$42,100',
                    trend: { value: '-3.2%', direction: 'down' as const, label: 'vs last month' },
                    inverted: false,
                  },
                  {
                    title: 'Neutral (flat)',
                    token: 'direction: neutral',
                    desc: 'No meaningful change. Always neutral gray regardless of trendInverted.',
                    metricValue: '$127',
                    trend: { value: '0.0%', direction: 'neutral' as const, label: 'vs last month' },
                    inverted: false,
                  },
                  {
                    title: 'Inverted metric',
                    token: 'trendInverted: true',
                    desc: 'Flip color logic for metrics where decrease = improvement. Bounce rate, error rate, support tickets, churn.',
                    custom: (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: t.text.tertiary.default }}>trendInverted: true</span>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 700,
                              borderRadius: 6,
                              padding: '3px 8px',
                              background: 'rgba(10,136,83,0.10)',
                              color: '#0A8853',
                            }}
                          >
                            <TrendingDown size={12} aria-hidden />
                            Bounce rate ↓ -1.4%
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 700,
                              borderRadius: 6,
                              padding: '3px 8px',
                              background: 'rgba(210,34,50,0.10)',
                              color: '#D22232',
                            }}
                          >
                            <TrendingUp size={12} aria-hidden />
                            Bounce rate ↑ +2.1%
                          </span>
                        </div>
                      </div>
                    ),
                  },
                ]
              ).map((row) => (
                <div
                  key={row.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 120), padding: 12 }}>
                    {'custom' in row && row.custom ? (
                      row.custom
                    ) : (
                      <StatCard
                        t={t}
                        label="Metric"
                        value={'metricValue' in row && row.metricValue ? row.metricValue : '—'}
                        trend={'trend' in row ? row.trend : undefined}
                        trendInverted={'inverted' in row ? Boolean(row.inverted) : false}
                        variant="minimal"
                        size="sm"
                      />
                    )}
                  </div>
                  <div style={{ padding: '16px 16px 12px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{row.title}</div>
                    <span style={chipStyleB(t)}>{row.token}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '12px 0 0' }}>{row.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="sizes-sc" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
              {(
                [
                  { sz: 'sm' as const, pad: '16px', val: '22px', note: 'Compact dashboards, sidebar widgets, mobile' },
                  { sz: 'md' as const, pad: '20px', val: '28px', note: 'Default — most dashboard contexts' },
                  { sz: 'lg' as const, pad: '24px', val: '36px', note: 'Hero KPIs, executive dashboards, prominent placement' },
                ] as const
              ).map((r) => (
                <div key={r.sz} style={{ flex: '1 1 200px', maxWidth: 280 }}>
                  <StatCard
                    t={t}
                    label="Total revenue"
                    value="$48,295"
                    trend={{ value: '+12.5%', direction: 'up', label: 'vs last month' }}
                    icon={<DollarSign size={SIZE_MAP[r.sz].glyph} />}
                    iconColor="brand"
                    size={r.sz}
                  />
                  <div style={{ textAlign: 'center', marginTop: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>{r.sz}</div>
                    <div style={{ fontSize: 11, color: t.text.tertiary.default }}>
                      padding {r.pad} · value {r.val}
                    </div>
                    <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 4 }}>{r.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-sc" style={{ marginTop: 32, marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 12 }}>Do</h3>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Dashboards de overview con KPIs principales</li>
                  <li>Resúmenes de performance en reportes</li>
                  <li>Header de una sección con el número más importante</li>
                  <li>Widgets de sidebar con métricas contextuales</li>
                  <li>Confirmación de acción (&quot;Your order · $127 · 3 items&quot;)</li>
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 12 }}>Don&apos;t</h3>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Para mostrar datos detallados o desglosados (usar Table)</li>
                  <li>Cuando el usuario necesita el histórico completo (usar Chart)</li>
                  <li>Como reemplazo de un formulario o input</li>
                  <li>Para métricas que cambian tan rápido que el número es irrelevante en segundos</li>
                </ul>
              </div>
            </div>
            <Callout variant="tip" title="Limit to 4–6 per view">
              More than 6 stat cards on the same screen creates metric overload. The user can&apos;t process all numbers equally — they&apos;ll
              ignore most of them. Choose the 4–6 metrics that answer the primary question of that page, and save the rest for a detail view.
            </Callout>
          </section>

          <section id="grid-patterns" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Grid patterns
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ ...dottedZone(t, 140), marginBottom: 12 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 8,
                      width: '100%',
                      maxWidth: 420,
                    }}
                  >
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          height: 56,
                          borderRadius: 10,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          fontSize: 10,
                          padding: 8,
                          color: t.text.tertiary.default,
                        }}
                      >
                        KPI {i}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>3-column equal</div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                  Standard dashboard header. Equal visual weight for all three KPIs.
                </p>
              </div>
              <div>
                <div style={{ ...dottedZone(t, 140), marginBottom: 12 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr',
                      gap: 8,
                      width: '100%',
                      maxWidth: 420,
                      alignItems: 'stretch',
                    }}
                  >
                    <div
                      style={{
                        minHeight: 96,
                        borderRadius: 10,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        fontSize: 10,
                        padding: 8,
                        color: t.text.tertiary.default,
                        gridColumn: '1 / 2',
                      }}
                    >
                      Stat lg (hero)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div
                        style={{
                          flex: 1,
                          borderRadius: 10,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          fontSize: 10,
                          padding: 8,
                          color: t.text.tertiary.default,
                        }}
                      >
                        sm
                      </div>
                      <div
                        style={{
                          flex: 1,
                          borderRadius: 10,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          fontSize: 10,
                          padding: 8,
                          color: t.text.tertiary.default,
                        }}
                      >
                        sm
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>1 hero + 3 small</div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                  Emphasize the primary metric. Use when one number is significantly more important than the others.
                </p>
              </div>
              <div>
                <div style={{ ...dottedZone(t, 140), marginBottom: 12 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                      gap: 8,
                      width: '100%',
                      maxWidth: 420,
                    }}
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          height: 48,
                          borderRadius: 10,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          fontSize: 9,
                          padding: 6,
                          color: t.text.tertiary.default,
                        }}
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>4-column responsive</div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                  Responsive grid that adapts to any viewport. The go-to for most dashboard implementations.
                </p>
              </div>
            </div>
          </section>

          <section id="dos-donts-sc" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <IllustratedDoDont
                t={t}
                ok
                title="Always show a comparison"
                caption="DO: StatCard &quot;Total revenue · $48,295 · +12.5% vs last month&quot;. DON&apos;T: StatCard &quot;Total revenue · $48,295&quot; sin trend — el número solo no da contexto."
              >
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <StatCard
                    t={t}
                    label="Total revenue"
                    value="$48,295"
                    trend={{ value: '+12.5%', direction: 'up', label: 'vs last month' }}
                    icon={<DollarSign size={16} />}
                    size="sm"
                  />
                  <StatCard t={t} label="Total revenue" value="$48,295" icon={<DollarSign size={16} />} size="sm" />
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Invert colors for inverted metrics"
                caption='DO: "Bounce rate · 24.8% · ↓ -1.4%" en VERDE — bajó, es bueno. DON&apos;T: "Bounce rate · 24.8% · ↓ -1.4%" en ROJO — bajó pero se muestra como negativo.'
              >
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <StatCard
                    t={t}
                    label="Bounce rate"
                    value="24.8%"
                    trend={{ value: '-1.4%', direction: 'down', label: 'vs last month' }}
                    icon={<Activity size={16} />}
                    iconColor="warning"
                    size="sm"
                    trendInverted
                  />
                  <StatCard
                    t={t}
                    label="Bounce rate"
                    value="24.8%"
                    trend={{ value: '-1.4%', direction: 'down', label: 'vs last month' }}
                    icon={<Activity size={16} />}
                    iconColor="warning"
                    size="sm"
                  />
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Consistent comparison periods"
                caption='DO: todos los stat cards en el mismo dashboard comparan "vs last month". DON&apos;T: un card "vs last month", otro "vs last week", otro "vs last year" — los números no son comparables entre sí.'
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: t.text.success.default, fontWeight: 600 }}>
                    <ArrowUp size={14} aria-hidden />
                    vs last month · vs last month · vs last month
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: t.text.danger.default, fontWeight: 600 }}>
                    <ArrowDown size={14} aria-hidden />
                    vs last month · vs last week · vs last year
                  </div>
                </div>
              </IllustratedDoDont>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title" id="content-labels-sc" style={{ marginBottom: 16 }}>
            Label writing
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>Short noun phrase: &apos;Total revenue&apos;, &apos;Active users&apos;, &apos;Bounce rate&apos;, &apos;Avg. order value&apos;</li>
            <li>2–4 words max</li>
            <li>All caps or sentence case — pick one and be consistent across all cards in the same view</li>
            <li>Never a verb: &apos;Revenue generated&apos; → &apos;Total revenue&apos;</li>
          </ul>
          <h2 className="section-title" id="content-values-sc" style={{ marginTop: 32, marginBottom: 16 }}>
            Value formatting
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>Currency: use locale-appropriate format — &apos;$48,295&apos; not &apos;$48295.00&apos;</li>
            <li>Large numbers: abbreviate above 10,000 — &apos;8.4K&apos;, &apos;1.2M&apos;, &apos;$48.3K&apos;</li>
            <li>Percentages: 1 decimal place — &apos;24.8%&apos; not &apos;24.83471%&apos;</li>
            <li>Duration: &apos;2h 34m&apos; not &apos;154 minutes&apos;</li>
          </ul>
          <h2 className="section-title" id="content-trend-sc" style={{ marginTop: 32, marginBottom: 16 }}>
            Trend label
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>Always include period: &apos;vs last month&apos;, &apos;vs last week&apos;, &apos;vs last year&apos;</li>
            <li>Or absolute: &apos;+$5,365 since last month&apos;</li>
            <li>Never just &apos;+12.5%&apos; without a period — the comparison is meaningless without it</li>
          </ul>
        </section>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="props-stat" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              StatCard props
            </h2>
            <PropsTable props={statCardPropsRows} />
          </section>
          <section id="type-trend" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              TrendConfig type
            </h2>
            <CodeBlock code={trendConfigSnippet} language="tsx" />
          </section>
          <section id="code-examples-sc" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Examples
            </h2>
            <CodeBlock code={codeExamples} language="tsx" />
          </section>
          <section id="a11y-sc" style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              StatCard renders as an &lt;article&gt; element with aria-label combining the label and value — e.g. &apos;Total revenue:
              $48,295&apos;. The trend is included in the aria-label as a natural language description: &apos;up 12.5% versus last month&apos;. This
              ensures screen readers announce the full context of each metric without requiring the user to navigate individual elements.
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
                Initial release. StatCard with default/minimal/bordered/colored variants, 3 sizes, up/down/neutral trends, trendInverted
                support, icon with 5 color options, optional sparkline SVG, optional footer comparison, full ARIA article pattern.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
