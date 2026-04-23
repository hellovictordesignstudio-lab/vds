'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, BarChart2, Bell, ChevronDown, ChevronRight, Search, Star, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
  useLayoutEffect(() => setIsDark(getResolvedIsDark()), []);
  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(getResolvedIsDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
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
const PAIR = { base: 'BTC', quote: 'USDT' } as const;
const PRICE = 67432.5;
const CHANGE = { value: 1578.3, pct: 2.34, direction: 'up' } as const;
const CANDLE_DATA = Array.from({ length: 30 }, (_, i) => {
  const base = 65000 + Math.sin(i / 5) * 3000;
  const open = base + (Math.random() - 0.5) * 500;
  const close = base + (Math.random() - 0.5) * 800;
  const high = Math.max(open, close) + Math.random() * 400;
  const low = Math.min(open, close) - Math.random() * 400;
  return { date: `Apr ${i + 1}`, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2), volume: Math.floor(500000 + Math.random() * 1500000) };
});
const ORDER_BOOK = {
  asks: [{ price: 67850, size: 0.234, total: 15.89 }, { price: 67820.5, size: 0.891, total: 60.52 }, { price: 67810, size: 1.234, total: 83.78 }, { price: 67800, size: 0.567, total: 38.48 }, { price: 67790.5, size: 2.103, total: 142.8 }, { price: 67780, size: 0.445, total: 30.19 }, { price: 67770, size: 1.876, total: 127.34 }],
  bids: [{ price: 67750, size: 1.543, total: 104.74 }, { price: 67740, size: 0.876, total: 59.46 }, { price: 67730.5, size: 2.234, total: 151.71 }, { price: 67720, size: 0.654, total: 44.41 }, { price: 67710, size: 1.123, total: 76.27 }, { price: 67700.5, size: 0.432, total: 29.33 }, { price: 67690, size: 0.987, total: 67.01 }],
  spread: 0.5,
  lastPrice: 67752.3,
} as const;
const PORTFOLIO = [
  { symbol: 'BTC', amount: 0.42, value: 28321.65, change: 2.34, color: '#F07332', pct: 48, muted: false },
  { symbol: 'ETH', amount: 4.8, value: 16904.64, change: -0.87, color: '#7C3AED', pct: 29, muted: false },
  { symbol: 'SOL', amount: 52, value: 8964.8, change: 5.12, color: '#0A8853', pct: 15, muted: false },
  { symbol: 'BNB', amount: 12, value: 4776, change: 1.23, color: '#F07332', pct: 8, muted: true },
] as const;

type FrameChip = { label: string; href: string };
const GROUPS: { title: string; chips: FrameChip[] }[] = [
  { title: 'Header & Nav', chips: [{ label: 'Navigation (topbar)', href: '/docs/components/navigation' }, { label: 'Badge', href: '/docs/components/badge' }, { label: 'Avatar', href: '/docs/components/avatar' }] },
  { title: 'Trading Pair', chips: [{ label: 'TradingPair', href: '/docs/components/trading' }, { label: 'PriceTicker', href: '/docs/components/trading' }, { label: 'Kbd (shortcuts)', href: '/docs/components/kbd' }] },
  { title: 'Chart', chips: [{ label: 'AreaChart (Recharts)', href: '/docs/components/charts' }, { label: 'Sparkline', href: '/docs/components/charts' }] },
  { title: 'Order Book', chips: [{ label: 'OrderBook', href: '/docs/components/trading' }, { label: 'Divider', href: '/docs/components/divider' }, { label: 'Progress (depth bars)', href: '/docs/components/progress' }] },
  { title: 'Order Form', chips: [{ label: 'TextInput', href: '/docs/components/text-input' }, { label: 'Button', href: '/docs/components/button' }, { label: 'Switch', href: '/docs/components/switch' }, { label: 'Select', href: '/docs/components/select' }] },
  { title: 'Portfolio', chips: [{ label: 'PortfolioCard', href: '/docs/components/trading' }, { label: 'StatCard', href: '/docs/components/stat-card' }, { label: 'Avatar', href: '/docs/components/avatar' }] },
];

function chipStyleA(overrides?: CSSProperties): CSSProperties {
  return { background: 'rgba(10,136,83,0.10)', color: '#0A8853', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6, border: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, ...overrides };
}

function ChartTooltip({ active, payload, label, t }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; t: VDSTheme }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 8, padding: '6px 10px', fontSize: 11, color: t.text.primary.default, fontFamily: mono }}>
      <div style={{ fontSize: 10, color: t.text.tertiary.default, marginBottom: 2 }}>{label}</div>
      <div>${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
    </div>
  );
}

export default function ApplicationsTradingAppPage() {
  const router = useRouter();
  const isDark = useIsDark();
  const tDoc = buildTheme(isDark);
  const [frameIsDark, setFrameIsDark] = useState(false);
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | '1D' | '1W' | '1M'>('1D');
  const t = buildTheme(frameIsDark);
  const maxVolume = useMemo(() => Math.max(...CANDLE_DATA.map((d) => d.volume)), []);
  const maxAsk = useMemo(() => Math.max(...ORDER_BOOK.asks.map((a) => a.total)), []);
  const maxBid = useMemo(() => Math.max(...ORDER_BOOK.bids.map((b) => b.total)), []);
  const goChip = useCallback((href: string) => router.push(href), [router]);

  return (
    <>
      <p className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 'normal' }}><span style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Applications</span><ChevronRight size={14} aria-hidden style={{ opacity: 0.5 }} /><span style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Trading App</span></p>
      <h1 className="page-title">Trading App</h1>
      <p className="page-lead">A complete crypto/stock trading interface built from VDS components. Demonstrates TradingPair, CandlestickChart, OrderBook, Portfolio, and real-time price patterns composing into a production exchange UI.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 16 }}>
        <span style={chipStyleA()}>Exchange interface</span><span style={{ color: tDoc.text.tertiary.default, fontSize: 12 }}>·</span><span style={chipStyleA()}>Financial components</span><span style={{ color: tDoc.text.tertiary.default, fontSize: 12 }}>·</span><span style={chipStyleA()}>Light &amp; Dark</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}><span style={{ fontSize: 12, fontWeight: 700, color: tDoc.text.secondary.default }}>Appearance</span><div className="seg-control" style={{ width: 'auto', minWidth: 0 }}><button type="button" className={`seg-option seg-option--compact${!frameIsDark ? ' seg-active' : ''}`} onClick={() => setFrameIsDark(false)}>Light</button><button type="button" className={`seg-option seg-option--compact${frameIsDark ? ' seg-active' : ''}`} onClick={() => setFrameIsDark(true)}>Dark</button></div></div>

      <div style={{ marginTop: 32, border: `1px solid ${t.border.default.default}`, borderRadius: 16, overflow: 'hidden', boxShadow: t.shadow.lg, height: 760, display: 'flex', flexDirection: 'column', background: t.bg.surface.primary.default }} data-theme={frameIsDark ? 'dark' : 'light'}>
        <div style={{ height: 36, background: t.bg.surface.secondary.default, borderBottom: `1px solid ${t.border.default.default}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} /><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} /><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} /></div>
          <div style={{ flex: 1, background: t.bg.surface.tertiary.default, borderRadius: 6, padding: '3px 12px', fontSize: 11, color: t.text.tertiary.default, textAlign: 'center' }}>exchange.example.com/trade/BTC-USDT</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ height: 48, background: t.bg.surface.primary.default, borderBottom: `1px solid ${t.border.default.default}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 20, height: 20, borderRadius: '50%', background: t.bg.fill.primary.default, color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>V</div><span style={{ fontSize: 13, fontWeight: 800, color: t.text.primary.default }}>VDS Exchange</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>{['Trade', 'Markets', 'Portfolio', 'History'].map((item) => <button key={item} type="button" style={{ border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: item === 'Trade' ? t.bg.fill.brandSubtle.default : t.bg.surface.secondary.default, color: item === 'Trade' ? t.text.brand.default : t.text.tertiary.default }}>{item}</button>)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><button type="button" className="vds-button vds-button--tertiary vds-button--xs" style={{ minWidth: 28, padding: 0 }}><Search size={14} aria-hidden /></button><button type="button" className="vds-button vds-button--tertiary vds-button--xs" style={{ minWidth: 28, padding: 0 }}><Bell size={14} aria-hidden /></button><button type="button" className="vds-button vds-button--primary vds-button--xs">Deposit</button><div style={{ width: 24, height: 24, borderRadius: '50%', background: t.bg.fill.primary.default, color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>V</div></div>
          </div>
          <div style={{ background: t.bg.surface.primary.default, borderBottom: `1px solid ${t.border.default.default}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, padding: '4px 8px' }}><div style={{ width: 20, height: 20, borderRadius: '50%', background: '#F07332', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>BTC</div><span style={{ fontSize: 15, fontWeight: 800, fontFamily: mono, color: t.text.primary.default }}>{PAIR.base} / {PAIR.quote}</span><ChevronDown size={14} color={t.text.tertiary.default} /></div>
            <div><div style={{ fontSize: 20, fontWeight: 900, color: '#0A8853', fontFamily: mono }}>${PRICE.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div><div style={{ marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: 'rgba(10,136,83,0.10)', color: '#0A8853' }}><TrendingUp size={11} />+{CHANGE.pct}%</div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>{[{ label: '24H Open', value: '$65,934' }, { label: '24H High', value: '$68,200', color: '#0A8853' }, { label: '24H Low', value: '$65,400', color: '#D22232' }, { label: '24H Vol', value: '28,432 BTC' }, { label: '24H Vol$', value: '$1.92B' }].map((s) => <div key={s.label}><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', color: t.text.tertiary.default }}>{s.label}</div><div style={{ fontSize: 11, fontWeight: 600, fontFamily: mono, color: s.color ?? t.text.secondary.default }}>{s.value}</div></div>)}</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}><button type="button" className="vds-button vds-button--tertiary vds-button--xs"><Star size={13} />Watchlist</button><button type="button" className="vds-button vds-button--tertiary vds-button--xs"><Bell size={13} />Alert</button></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px 260px', height: '100%', minHeight: 0 }}>
            <section style={{ background: t.bg.surface.primary.default, borderRight: `1px solid ${t.border.default.default}`, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${t.border.default.default}`, display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ display: 'flex', gap: 4 }}>{(['1H', '4H', '1D', '1W', '1M'] as const).map((tf) => <button key={tf} type="button" onClick={() => setTimeframe(tf)} style={{ border: 'none', borderRadius: 5, padding: '4px 8px', fontSize: 11, fontWeight: 700, background: tf === timeframe ? t.bg.fill.primary.default : t.bg.surface.secondary.default, color: tf === timeframe ? '#fff' : t.text.tertiary.default }}>{tf}</button>)}</div><div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}><button type="button" className="vds-button vds-button--tertiary vds-button--xs" style={{ minWidth: 26, padding: 0 }}><BarChart2 size={13} /></button><button type="button" className="vds-button vds-button--tertiary vds-button--xs" style={{ minWidth: 26, padding: 0 }}><Activity size={13} /></button></div></div>
              <div style={{ flex: 1, minHeight: 0 }}><ResponsiveContainer width="100%" height="100%"><AreaChart data={CANDLE_DATA} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}><defs><linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#002b49" stopOpacity={frameIsDark ? 0.3 : 0.15} /><stop offset="95%" stopColor="#002b49" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="2 4" stroke={t.border.default.default} vertical={false} /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: t.text.tertiary.default, fontSize: 10 }} interval={4} /><YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: t.text.tertiary.default, fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} width={52} /><Tooltip content={<ChartTooltip t={t} />} /><Area type="monotone" dataKey="close" stroke={frameIsDark ? '#1565A8' : '#002b49'} strokeWidth={2} fill="url(#chartGradient)" dot={false} /></AreaChart></ResponsiveContainer></div>
              <div style={{ height: 48, borderTop: `1px solid ${t.border.default.default}`, padding: '4px 10px 6px', display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)', gap: 1, alignItems: 'flex-end' }}>{CANDLE_DATA.map((p, i) => <div key={p.date} style={{ height: Math.max(2, Math.round((p.volume / maxVolume) * 36)), background: i % 2 === 0 ? 'rgba(0,43,73,0.4)' : 'rgba(0,43,73,0.25)', borderRadius: 1 }} />)}</div>
            </section>
            <section style={{ background: t.bg.surface.primary.default, borderRight: `1px solid ${t.border.default.default}`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${t.border.default.default}`, fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>Order Book</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '5px 10px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: t.text.tertiary.default }}><span>Price</span><span>Size</span><span>Total</span></div>
              {ORDER_BOOK.asks.map((row) => <div key={`a-${row.price}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '3px 10px', position: 'relative', fontSize: 11, fontFamily: mono }}><span style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${(row.total / maxAsk) * 100}%`, background: 'rgba(210,34,50,0.08)' }} /><span style={{ color: '#D22232', fontWeight: 700, zIndex: 1 }}>{row.price.toFixed(2)}</span><span style={{ color: t.text.secondary.default, zIndex: 1 }}>{row.size.toFixed(3)}</span><span style={{ color: t.text.tertiary.default, zIndex: 1 }}>{row.total.toFixed(2)}</span></div>)}
              <div style={{ padding: '5px 10px', background: t.bg.surface.secondary.default, borderTop: `1px solid ${t.border.default.default}`, borderBottom: `1px solid ${t.border.default.default}`, display: 'flex', justifyContent: 'center', gap: 8 }}><span style={{ fontSize: 12, fontWeight: 800, fontFamily: mono, color: t.text.primary.default }}>${ORDER_BOOK.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><span style={{ fontSize: 9, borderRadius: 4, padding: '1px 5px', background: t.bg.surface.tertiary.default, color: t.text.tertiary.default }}>{ORDER_BOOK.spread.toFixed(2)}</span></div>
              {ORDER_BOOK.bids.map((row) => <div key={`b-${row.price}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '3px 10px', position: 'relative', fontSize: 11, fontFamily: mono }}><span style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${(row.total / maxBid) * 100}%`, background: 'rgba(10,136,83,0.08)' }} /><span style={{ color: '#0A8853', fontWeight: 700, zIndex: 1 }}>{row.price.toFixed(2)}</span><span style={{ color: t.text.secondary.default, zIndex: 1 }}>{row.size.toFixed(3)}</span><span style={{ color: t.text.tertiary.default, zIndex: 1 }}>{row.total.toFixed(2)}</span></div>)}
            </section>
            <section style={{ background: t.bg.surface.primary.default, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border.default.default}` }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}><button type="button" style={{ flex: 1, height: 32, border: 'none', borderRadius: 7, background: '#0A8853', color: '#fff', fontSize: 12, fontWeight: 700 }}>Buy</button><button type="button" style={{ flex: 1, height: 32, borderRadius: 7, border: `1px solid ${t.border.default.default}`, background: 'transparent', color: t.text.secondary.default, fontSize: 12, fontWeight: 700 }}>Sell</button></div>
                <div style={{ marginTop: 10 }}><div style={{ fontSize: 10, color: t.text.tertiary.default, marginBottom: 4 }}>Price (USDT)</div><div style={{ height: 34, background: t.bg.surface.secondary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 7, padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 13, fontFamily: mono }}>67,432.50</span><span style={{ fontSize: 10, color: t.text.tertiary.default }}>USDT</span></div></div>
                <div style={{ marginTop: 10 }}><div style={{ fontSize: 10, color: t.text.tertiary.default, marginBottom: 4 }}>Amount (BTC)</div><div style={{ height: 34, background: t.bg.surface.secondary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 7, padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 13, fontFamily: mono }}>0.10</span><span style={{ fontSize: 10, color: t.text.tertiary.default }}>BTC</span></div></div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>{['25%', '50%', '75%', '100%'].map((p) => <span key={p} style={{ fontSize: 10, background: t.bg.surface.tertiary.default, color: t.text.tertiary.default, borderRadius: 5, padding: '2px 7px' }}>{p}</span>)}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}><span style={{ fontSize: 11, color: t.text.tertiary.default }}>Total</span><span style={{ fontSize: 12, fontWeight: 700, fontFamily: mono }}>$6,743.25</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}><span style={{ fontSize: 10, color: t.text.tertiary.default }}>Available</span><span style={{ fontSize: 10, fontFamily: mono, color: t.text.secondary.default }}>12,450.00 USDT</span></div>
                <button type="button" style={{ width: '100%', marginTop: 12, height: 36, border: 'none', borderRadius: 8, background: '#0A8853', color: '#fff', fontSize: 13, fontWeight: 700 }}>Buy BTC</button>
              </div>
              <div style={{ padding: '12px 14px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}><span style={{ fontSize: 12, fontWeight: 700 }}>Portfolio</span><span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, fontFamily: mono }}>$58,967.09</span></div>
                {PORTFOLIO.map((a) => <div key={a.symbol} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8 }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: a.color, color: '#fff', fontSize: 8, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{a.symbol}</span><span style={{ fontSize: 11, fontWeight: 700, width: 28 }}>{a.symbol}</span><span style={{ fontSize: 10, fontFamily: mono, color: t.text.tertiary.default, flex: 1 }}>{a.amount.toFixed(a.symbol === 'SOL' ? 1 : 2)}</span><span style={{ fontSize: 11, fontWeight: 700, fontFamily: mono }}>${a.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><span style={{ fontSize: 10, fontWeight: 700, fontFamily: mono, color: a.change >= 0 ? '#0A8853' : '#D22232' }}>{a.change >= 0 ? '+' : ''}{a.change.toFixed(2)}%</span></div>)}
                <div style={{ marginTop: 10, height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex' }}>{PORTFOLIO.map((a) => <span key={`bar-${a.symbol}`} style={{ width: `${a.pct}%`, background: a.color, opacity: a.muted ? 0.6 : 1 }} />)}</div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: tDoc.text.primary.default, marginBottom: 16 }}>Components used</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {GROUPS.map((group) => <div key={group.title} style={{ background: tDoc.bg.surface.secondary.default, borderRadius: 10, padding: 14, border: `1px solid ${tDoc.border.default.default}` }}><div style={{ fontSize: 10, textTransform: 'uppercase', color: tDoc.text.tertiary.default, fontWeight: 800, marginBottom: 8, letterSpacing: '0.06em' }}>{group.title}</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{group.chips.map((c) => <button key={c.label} type="button" onClick={() => goChip(c.href)} style={{ background: tDoc.bg.surface.primary.default, border: `1px solid ${tDoc.border.default.default}`, fontSize: 11, fontWeight: 600, color: tDoc.text.secondary.default, borderRadius: 5, padding: '3px 8px', cursor: 'pointer' }}>{c.label}</button>)}</div></div>)}
        </div>
      </section>
    </>
  );
}
