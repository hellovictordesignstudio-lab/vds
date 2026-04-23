'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  BarChart2,
  Bell,
  ChevronRight,
  DollarSign,
  Filter,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { buildTheme, type VDSTheme } from '@/lib/theme';

function getResolvedIsDark(): boolean {
  if (typeof document === 'undefined') return false;
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);

  useLayoutEffect(() => {
    setIsDark(getResolvedIsDark());
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(getResolvedIsDark());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setIsDark(getResolvedIsDark());
    mq.addEventListener('change', onChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', onChange);
    };
  }, []);

  return isDark;
}

const mono = "'JetBrains Mono', var(--font-mono), monospace";

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

function RevenueTooltip({
  active,
  payload,
  label,
  t,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  t: VDSTheme;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: t.shadow.md,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default, fontFamily: mono }}>
        ${payload[0].value.toLocaleString()}
      </div>
    </div>
  );
}

type FrameChip = { label: string; href: string };

const COMPONENT_GROUPS: { title: string; chips: FrameChip[] }[] = [
  {
    title: 'Navigation',
    chips: [
      { label: 'Navigation', href: '/docs/components/navigation' },
      { label: 'Avatar', href: '/docs/components/avatar' },
      { label: 'Badge', href: '/docs/components/badge' },
    ],
  },
  {
    title: 'Stats',
    chips: [
      { label: 'Stat Card', href: '/docs/components/stat-card' },
      { label: 'TrendingUp/Down icons', href: '/docs/foundations/icons' },
    ],
  },
  {
    title: 'Charts',
    chips: [
      { label: 'Area Chart (Recharts)', href: '/docs/components/charts' },
      { label: 'Progress bar', href: '/docs/components/progress' },
    ],
  },
  {
    title: 'Table',
    chips: [
      { label: 'Table', href: '/docs/components/table' },
      { label: 'Badge (status)', href: '/docs/components/badge' },
      { label: 'Avatar', href: '/docs/components/avatar' },
    ],
  },
  {
    title: 'Feed',
    chips: [
      { label: 'Avatar', href: '/docs/components/avatar' },
      { label: 'Divider', href: '/docs/components/divider' },
      { label: 'Relative timestamps', href: '/docs/components/calendar' },
    ],
  },
];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const REVENUE_VALUES = [4200, 5800, 5200, 7800, 6900, 9200, 8400, 11200, 10500, 13400, 12800, 15600] as const;

const ORDERS = [
  { order: '#4821', customer: 'Jane Lim', amount: '$127.00', status: 'Completed' as const, date: 'Apr 15' },
  { order: '#4820', customer: 'Marcus Chen', amount: '$89.50', status: 'Processing' as const, date: 'Apr 15' },
  { order: '#4819', customer: 'Sophie R.', amount: '$234.00', status: 'Completed' as const, date: 'Apr 14' },
  { order: '#4818', customer: 'Tom K.', amount: '$56.75', status: 'Cancelled' as const, date: 'Apr 14' },
  { order: '#4817', customer: 'Priya N.', amount: '$178.25', status: 'Completed' as const, date: 'Apr 13' },
];

const TRAFFIC = [
  { label: 'Organic', pct: 62, colorKey: 'brand' as const },
  { label: 'Paid', pct: 23, color: '#7C3AED' },
  { label: 'Referral', pct: 11, colorKey: 'green' as const },
  { label: 'Direct', pct: 4, colorKey: 'orange' as const },
];

function trafficBarColor(
  row: (typeof TRAFFIC)[number],
  t: VDSTheme,
): string {
  if ('color' in row && row.color) return row.color;
  if (row.colorKey === 'brand') return t.text.brand.default;
  if (row.colorKey === 'green') return '#0A8853';
  return '#F07332';
}

export default function ApplicationsDashboardPage() {
  const router = useRouter();
  const docDark = useIsDark();
  const tDoc = buildTheme(docDark);

  const [frameIsDark, setFrameIsDark] = useState(false);
  const t = buildTheme(frameIsDark);
  const gid = useId().replace(/:/g, '');
  const [chartRange, setChartRange] = useState<'Month' | 'Quarter' | 'Year'>('Month');
  const [userHover, setUserHover] = useState(false);

  const revenueData = MONTHS_SHORT.map((month, i) => ({
    month,
    revenue: REVENUE_VALUES[i],
  }));

  const goChip = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const statusBadge = (status: (typeof ORDERS)[number]['status']) => {
    if (status === 'Completed') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 4,
            background: 'rgba(10,136,83,0.10)',
            color: '#0A8853',
          }}
        >
          {status}
        </span>
      );
    }
    if (status === 'Processing') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 4,
            background: t.bg.fill.brandSubtle.default,
            color: t.text.brand.default,
          }}
        >
          {status}
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: 10,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 4,
          background: t.bg.fill.danger.default,
          color: t.text.danger.default,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <>
      <p
        className="breadcrumb"
        style={{ display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 'normal' }}
      >
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Applications</span>
        <ChevronRight size={14} aria-hidden style={{ opacity: 0.5 }} />
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dashboard</span>
      </p>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-lead">
        A complete analytics dashboard built entirely from VDS components. Demonstrates how Navigation, StatCards, Charts,
        Tables, and Activity feeds compose into a production-ready interface.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 16 }}>
        <span style={chipStyleA()}>Application layout</span>
        <span style={{ color: tDoc.text.tertiary.default, fontSize: 12 }}>·</span>
        <span style={chipStyleA()}>Real components</span>
        <span style={{ color: tDoc.text.tertiary.default, fontSize: 12 }}>·</span>
        <span style={chipStyleA()}>Light &amp; Dark</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: tDoc.text.secondary.default }}>Appearance</span>
        <div
          className="seg-control"
          style={{ width: 'auto', minWidth: 0 }}
          role="group"
          aria-label="App frame appearance"
        >
          <button
            type="button"
            className={`seg-option seg-option--compact${!frameIsDark ? ' seg-active' : ''}`}
            onClick={() => setFrameIsDark(false)}
          >
            Light
          </button>
          <button
            type="button"
            className={`seg-option seg-option--compact${frameIsDark ? ' seg-active' : ''}`}
            onClick={() => setFrameIsDark(true)}
          >
            Dark
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          border: `1px solid ${t.border.default.default}`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: t.shadow.lg,
          height: 700,
          display: 'flex',
          flexDirection: 'column',
          background: t.bg.surface.primary.default,
        }}
        data-theme={frameIsDark ? 'dark' : 'light'}
      >
        {/* Window chrome */}
        <div
          style={{
            height: 36,
            background: t.bg.surface.secondary.default,
            borderBottom: `1px solid ${t.border.default.default}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
          </div>
          <div
            style={{
              flex: 1,
              background: t.bg.surface.tertiary.default,
              borderRadius: 6,
              padding: '3px 12px',
              fontSize: 11,
              color: t.text.tertiary.default,
              textAlign: 'center',
            }}
          >
            app.example.com/dashboard
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {/* App sidebar */}
          <aside
            style={{
              width: 220,
              flexShrink: 0,
              background: t.bg.surface.primary.default,
              borderRight: `1px solid ${t.border.default.default}`,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <div
              style={{
                height: 52,
                padding: '0 16px',
                borderBottom: `1px solid ${t.border.default.default}`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: t.bg.fill.primary.default,
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                V
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: t.text.primary.default }}>VDS App</span>
            </div>

            <nav style={{ padding: '8px 0', flex: 1, overflow: 'auto' }} aria-label="Main">
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: t.text.tertiary.default,
                  padding: '10px 14px 4px',
                }}
              >
                Main
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <li>
                  <div
                    role="button"
                    tabIndex={0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      padding: '7px 10px',
                      margin: '0 4px',
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'default',
                      transition: 'all 100ms',
                      background: t.bg.fill.brandSubtle.default,
                      color: t.text.brand.default,
                      borderLeft: `2px solid ${t.text.brand.default}`,
                    }}
                  >
                    <LayoutDashboard size={15} aria-hidden />
                    Dashboard
                  </div>
                </li>
                {[
                  { Icon: BarChart2, label: 'Analytics' },
                  { Icon: Users, label: 'Customers' },
                  { Icon: ShoppingCart, label: 'Orders', badge: '12' },
                  { Icon: FolderOpen, label: 'Projects' },
                ].map(({ Icon, label, badge }) => (
                  <li key={label}>
                    <div
                      role="button"
                      tabIndex={0}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        padding: '7px 10px',
                        margin: '0 4px',
                        borderRadius: 7,
                        fontSize: 12,
                        fontWeight: 600,
                        color: t.text.secondary.default,
                        cursor: 'pointer',
                        transition: 'all 100ms',
                      }}
                    >
                      <Icon size={15} aria-hidden />
                      <span style={{ flex: 1 }}>{label}</span>
                      {badge ? (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: t.bg.fill.danger.default,
                            color: t.text.danger.default,
                          }}
                        >
                          {badge}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>

              <div
                style={{
                  height: 1,
                  background: t.border.default.default,
                  margin: '8px 12px',
                }}
              />

              <div
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: t.text.tertiary.default,
                  padding: '10px 14px 4px',
                }}
              >
                System
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {[
                  { Icon: Settings, label: 'Settings' },
                  { Icon: HelpCircle, label: 'Help' },
                ].map(({ Icon, label }) => (
                  <li key={label}>
                    <div
                      role="button"
                      tabIndex={0}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        padding: '7px 10px',
                        margin: '0 4px',
                        borderRadius: 7,
                        fontSize: 12,
                        fontWeight: 600,
                        color: t.text.secondary.default,
                        cursor: 'pointer',
                        transition: 'all 100ms',
                      }}
                    >
                      <Icon size={15} aria-hidden />
                      {label}
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            <div
              style={{
                marginTop: 'auto',
                borderTop: `1px solid ${t.border.default.default}`,
                padding: 8,
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onMouseEnter={() => setUserHover(true)}
                onMouseLeave={() => setUserHover(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'background 100ms',
                  background: userHover ? t.bg.surface.secondary.default : 'transparent',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: t.bg.fill.primary.default,
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  VM
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: t.text.primary.default, flex: 1 }}>Victor M.</span>
                <LogOut size={14} style={{ color: t.text.tertiary.default }} aria-hidden />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: 'auto',
              background: t.bg.surface.secondary.default,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: t.text.primary.default, margin: 0 }}>Dashboard</h2>
                <p style={{ fontSize: 12, color: t.text.tertiary.default, margin: '2px 0 0' }}>Welcome back, Victor 👋</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {[
                  { Icon: Search, label: 'Search' },
                  { Icon: Filter, label: 'Filter' },
                  { Icon: RefreshCw, label: 'Refresh' },
                ].map(({ Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    className="vds-button vds-button--tertiary vds-button--sm"
                    aria-label={label}
                    style={{ padding: '0 8px', minWidth: 32 }}
                  >
                    <Icon size={14} aria-hidden />
                  </button>
                ))}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="vds-button vds-button--tertiary vds-button--sm"
                    aria-label="Notifications"
                    style={{ padding: '0 8px', minWidth: 32 }}
                  >
                    <Bell size={14} aria-hidden />
                  </button>
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#D22232',
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: t.bg.fill.primary.default,
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  VM
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <KpiCard
                t={t}
                label="Total Revenue"
                value="$48,295"
                trend="+12.5%"
                trendUp
                sub="vs last month"
                icon={
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: t.bg.fill.brandSubtle.default,
                      color: t.text.brand.default,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <DollarSign size={14} aria-hidden />
                  </div>
                }
              />
              <KpiCard
                t={t}
                label="Active Users"
                value="8,492"
                trend="+3.2%"
                trendUp
                sub="vs last month"
                icon={
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: 'rgba(10,136,83,0.10)',
                      color: '#0A8853',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Users size={14} aria-hidden />
                  </div>
                }
              />
              <KpiCard
                t={t}
                label="Orders"
                value="1,284"
                trend="+8.1%"
                trendUp
                sub="vs last month"
                icon={
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: 'rgba(124,58,237,0.10)',
                      color: '#7C3AED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShoppingCart size={14} aria-hidden />
                  </div>
                }
              />
              <KpiCard
                t={t}
                label="Bounce Rate"
                value="24.8%"
                trend="-1.4%"
                trendUp={false}
                trendInverted
                sub="vs last month"
                icon={
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: 'rgba(240,115,50,0.10)',
                      color: '#F07332',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Activity size={14} aria-hidden />
                  </div>
                }
              />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, minHeight: 0 }}>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 12,
                  padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>Revenue overview</div>
                    <div style={{ fontSize: 11, color: t.text.tertiary.default, marginTop: 2 }}>Last 12 months</div>
                  </div>
                  <div
                    className="seg-control"
                    style={{ width: 'auto', minWidth: 0, flexShrink: 0 }}
                    role="group"
                    aria-label="Revenue range"
                  >
                    {(['Month', 'Quarter', 'Year'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`seg-option seg-option--compact${chartRange === r ? ' seg-active' : ''}`}
                        onClick={() => setChartRange(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`rv-${gid}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={t.text.brand.default} stopOpacity={0.22} />
                        <stop offset="100%" stopColor={t.text.brand.default} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.border.default.default} vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: t.text.tertiary.default, fontSize: 10 }}
                    />
                    <YAxis hide tickLine={false} axisLine={false} tick={false} />
                    <Tooltip content={<RevenueTooltip t={t} />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={t.text.brand.default}
                      strokeWidth={2}
                      fill={`url(#rv-${gid})`}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 12,
                  padding: '16px 18px',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 16 }}>
                  Traffic sources
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {TRAFFIC.map((row) => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{ fontSize: 11, fontWeight: 600, color: t.text.secondary.default, width: 64, flexShrink: 0 }}
                      >
                        {row.label}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 4,
                          background: t.bg.surface.tertiary.default,
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: 4,
                            borderRadius: 2,
                            width: `${row.pct}%`,
                            background: trafficBarColor(row, t),
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: mono,
                          color: t.text.primary.default,
                          width: 32,
                          textAlign: 'right',
                          flexShrink: 0,
                        }}
                      >
                        {row.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 12, minHeight: 0 }}>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: `1px solid ${t.border.default.default}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>Recent orders</span>
                  <button
                    type="button"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: t.text.brand.default,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    View all →
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: t.bg.surface.secondary.default }}>
                      {['Order', 'Customer', 'Amount', 'Status', 'Date'].map((col) => (
                        <th
                          key={col}
                          style={{
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: t.text.tertiary.default,
                            padding: '6px 16px',
                            textAlign: 'left',
                            fontWeight: 700,
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ORDERS.map((row) => (
                      <tr
                        key={row.order}
                        style={{
                          borderBottom: `1px solid ${t.border.default.default}`,
                          transition: 'background 100ms',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = t.bg.surface.secondary.default;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td
                          style={{
                            fontSize: 12,
                            padding: '9px 16px',
                            fontFamily: mono,
                            fontWeight: 600,
                            color: t.text.primary.default,
                          }}
                        >
                          {row.order}
                        </td>
                        <td style={{ fontSize: 12, color: t.text.secondary.default, padding: '9px 16px' }}>
                          {row.customer}
                        </td>
                        <td style={{ fontSize: 12, color: t.text.secondary.default, padding: '9px 16px', fontFamily: mono }}>
                          {row.amount}
                        </td>
                        <td style={{ padding: '9px 16px' }}>{statusBadge(row.status)}</td>
                        <td style={{ fontSize: 12, color: t.text.secondary.default, padding: '9px 16px' }}>{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 14 }}>Activity</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { initial: 'J', bold: 'Jane Lim', rest: ' placed a new order for $127.00', time: '2m ago', bg: t.text.brand.default },
                    { initial: 'M', bold: 'Marcus Chen', rest: ' joined as a new customer', time: '8m ago', bg: '#0A8853' },
                    { initial: 'O', bold: 'Order #4819', rest: ' was completed', time: '15m ago', bg: '#7C3AED' },
                    { initial: 'S', bold: 'Sophie R.', rest: ' left a 5-star review', time: '32m ago', bg: '#F07332' },
                    { initial: 'S', bold: 'Server', rest: ' response time improved 12%', time: '1h ago', bg: '#0A8853' },
                    { initial: 'N', bold: 'New feature', rest: ' deployed to production', time: '2h ago', bg: t.text.brand.default },
                  ].map((item, i, arr) => (
                    <div
                      key={`${item.time}-${i}`}
                      style={{
                        display: 'flex',
                        gap: 10,
                        padding: '8px 0',
                        borderBottom: i < arr.length - 1 ? `1px solid ${t.border.default.default}` : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: item.bg,
                          color: '#FFFFFF',
                          fontSize: 10,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {item.initial}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 700, color: t.text.primary.default }}>{item.bold}</span>
                          {item.rest}
                        </div>
                        <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 2 }}>{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component map */}
      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: tDoc.text.primary.default, marginBottom: 16 }}>Components used</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {COMPONENT_GROUPS.map((group) => (
            <div
              key={group.title}
              style={{
                background: tDoc.bg.surface.secondary.default,
                borderRadius: 10,
                padding: 14,
                border: `1px solid ${tDoc.border.default.default}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  color: tDoc.text.tertiary.default,
                  fontWeight: 800,
                  marginBottom: 8,
                  letterSpacing: '0.06em',
                }}
              >
                {group.title}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {group.chips.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => goChip(c.href)}
                    style={{
                      background: tDoc.bg.surface.primary.default,
                      border: `1px solid ${tDoc.border.default.default}`,
                      fontSize: 11,
                      fontWeight: 600,
                      color: tDoc.text.secondary.default,
                      borderRadius: 5,
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = tDoc.border.brand.default;
                      e.currentTarget.style.color = tDoc.text.brand.default;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = tDoc.border.default.default;
                      e.currentTarget.style.color = tDoc.text.secondary.default;
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function trendColors(up: boolean, inverted: boolean): { bg: string; fg: string } {
  const green = { bg: 'rgba(10,136,83,0.10)', fg: '#0A8853' };
  const red = { bg: 'rgba(210,34,50,0.10)', fg: '#D22232' };
  const good = inverted ? !up : up;
  return good ? green : red;
}

function KpiCard({
  t,
  label,
  value,
  trend,
  trendUp,
  trendInverted = false,
  sub,
  icon,
}: {
  t: VDSTheme;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  trendInverted?: boolean;
  sub: string;
  icon: ReactNode;
}) {
  const tc = trendColors(trendUp, trendInverted);
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;
  return (
    <article
      style={{
        borderRadius: 12,
        padding: 14,
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: t.text.tertiary.default,
          }}
        >
          {label}
        </span>
        {icon}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: mono, color: t.text.primary.default, marginTop: 6 }}>{value}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 6,
            width: 'fit-content',
            background: tc.bg,
            color: tc.fg,
          }}
        >
          <TrendIcon size={11} aria-hidden />
          {trend}
        </span>
        <span style={{ fontSize: 10, color: t.text.tertiary.default }}>{sub}</span>
      </div>
    </article>
  );
}
