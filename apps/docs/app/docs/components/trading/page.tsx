'use client';

import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Minus,
  RefreshCw,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

const FIN = {
  positive: '#0A8853',
  negative: '#D22232',
  positiveBg: 'rgba(10,136,83,0.10)',
  negativeBg: 'rgba(210,34,50,0.10)',
} as const;

const MONO = "'JetBrains Mono', var(--font-mono), monospace";

function chipStyleA(overrides?: CSSProperties): CSSProperties {
  return {
    background: FIN.positiveBg,
    color: FIN.positive,
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
    fontFamily: MONO,
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

type ChangeDirection = 'up' | 'down' | 'neutral';

interface PriceChange {
  value: number;
  pct: number;
  direction: ChangeDirection;
}

type AssetCategory = 'crypto' | 'stock' | 'forex';

interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  mcap: string;
  category: AssetCategory;
}

interface OHLCCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  __i?: number;
}

interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

function buildCandleData(): OHLCCandle[] {
  return Array.from({ length: 30 }, (_, i) => {
    const base = 65000 + Math.sin(i / 5) * 3000 + Math.random() * 1000;
    const open = base + (Math.random() - 0.5) * 500;
    const close = base + (Math.random() - 0.5) * 800;
    const high = Math.max(open, close) + Math.random() * 400;
    const low = Math.min(open, close) - Math.random() * 400;
    return {
      date: new Date(2026, 2, 1 + i).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume: Math.floor(500000 + Math.random() * 1500000),
    };
  });
}

const orderBookData = {
  asks: [
    { price: 67850.0, size: 0.234, total: 15.89 },
    { price: 67820.5, size: 0.891, total: 60.52 },
    { price: 67810.0, size: 1.234, total: 83.78 },
    { price: 67800.0, size: 0.567, total: 38.48 },
    { price: 67790.5, size: 2.103, total: 142.8 },
    { price: 67780.0, size: 0.445, total: 30.19 },
    { price: 67770.0, size: 1.876, total: 127.34 },
    { price: 67760.5, size: 0.321, total: 21.78 },
  ] as OrderBookLevel[],
  bids: [
    { price: 67750.0, size: 1.543, total: 104.74 },
    { price: 67740.0, size: 0.876, total: 59.46 },
    { price: 67730.5, size: 2.234, total: 151.71 },
    { price: 67720.0, size: 0.654, total: 44.41 },
    { price: 67710.0, size: 1.123, total: 76.27 },
    { price: 67700.5, size: 0.432, total: 29.33 },
    { price: 67690.0, size: 0.987, total: 67.01 },
    { price: 67680.0, size: 1.654, total: 112.34 },
  ] as OrderBookLevel[],
  spread: 0.5,
  spreadPct: '0.0007%',
  lastPrice: 67752.3,
};

const portfolioData = {
  totalValue: 124856.34,
  currency: 'USD',
  change24h: { value: 3421.2, pct: 2.82 },
  change7d: { value: 8234.5, pct: 7.06 },
  holdings: [
    { symbol: 'BTC', name: 'Bitcoin', value: 67432.5, allocation: 54.0, change: 2.34, color: '#F07332' },
    { symbol: 'ETH', name: 'Ethereum', value: 31695.0, allocation: 25.4, change: -0.87, color: '#7C3AED' },
    { symbol: 'SOL', name: 'Solana', value: 12485.6, allocation: 10.0, change: 5.12, color: '#0A8853' },
    { symbol: 'BNB', name: 'BNB', value: 8743.24, allocation: 7.0, change: 1.23, color: '#F07332' },
    { symbol: 'Other', name: 'Other', value: 4500.0, allocation: 3.6, change: 0.45, color: '#6B7694' },
  ],
};

const pnlData = {
  totalPnL: { value: 12847.5, pct: 10.29 },
  realizedPnL: { value: 8234.2, pct: 6.6 },
  unrealizedPnL: { value: 4613.3, pct: 3.7 },
  positions: [
    { symbol: 'BTC', side: 'LONG' as const, entry: 62000, current: 67432, size: 0.5, pnl: 2716.0, pct: 8.76 },
    { symbol: 'ETH', side: 'LONG' as const, entry: 3200, current: 3521, size: 5.0, pnl: 1605.0, pct: 10.03 },
    { symbol: 'SOL', side: 'SHORT' as const, entry: 185, current: 172, size: 50.0, pnl: 650.0, pct: 7.03 },
    { symbol: 'BNB', side: 'LONG' as const, entry: 420, current: 398, size: 10.0, pnl: -220.0, pct: -5.24 },
  ],
};

const marketData: MarketAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67432.5, change: 2.34, volume: '$28.4B', mcap: '$1.32T', category: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', price: 3521.8, change: -0.87, volume: '$12.1B', mcap: '$423B', category: 'crypto' },
  { symbol: 'SOL', name: 'Solana', price: 172.4, change: 5.12, volume: '$3.2B', mcap: '$79B', category: 'crypto' },
  { symbol: 'AAPL', name: 'Apple', price: 189.25, change: 0.43, volume: '$4.8B', mcap: '$2.91T', category: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA', price: 875.4, change: 3.21, volume: '$9.2B', mcap: '$2.15T', category: 'stock' },
  { symbol: 'TSLA', name: 'Tesla', price: 248.5, change: -1.87, volume: '$7.1B', mcap: '$792B', category: 'stock' },
  { symbol: 'EUR/USD', name: 'Euro', price: 1.08542, change: 0.12, volume: '$89.2B', mcap: '—', category: 'forex' },
  { symbol: 'GBP/USD', name: 'Pound', price: 1.27834, change: -0.23, volume: '$42.1B', mcap: '—', category: 'forex' },
];

const tradingPairData = {
  base: 'BTC',
  quote: 'USDT',
  price: 67432.5,
  change: 2.34,
  open: 65934.2,
  high: 68200.0,
  low: 65400.0,
  volume: '28,432 BTC',
  volUSDT: '$1.92B',
};

const PAIR_OPTIONS = [
  { base: 'BTC', quote: 'USDT', price: 67432.5, change: 2.34 },
  { base: 'ETH', quote: 'USDT', price: 3521.8, change: -0.87 },
  { base: 'SOL', quote: 'USDT', price: 172.4, change: 5.12 },
  { base: 'EUR', quote: 'USD', price: 1.08542, change: 0.12 },
] as const;

const TICKER_DEMOS = [
  { symbol: 'BTC/USDT', exchange: 'BINANCE', price: 67432.5, pct: 2.34, vol: '$28.4B', fx: false },
  { symbol: 'ETH/USDT', exchange: 'BINANCE', price: 3521.8, pct: -0.87, vol: '$12.1B', fx: false },
  { symbol: 'EUR/USD', exchange: 'FX', price: 1.08542, pct: 0.12, vol: '$89.2B', fx: true },
] as const;

function directionFromPct(pct: number): ChangeDirection {
  if (pct > 0) return 'up';
  if (pct < 0) return 'down';
  return 'neutral';
}

function formatUsd(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MiniSparkline({ pts, color }: { pts: number[]; color: string }) {
  if (pts.length < 2) return null;
  return (
    <svg width={64} height={24} viewBox="0 0 64 24" preserveAspectRatio="none" aria-hidden>
      <path
        d={pts
          .map((p, i) => {
            const min = Math.min(...pts);
            const max = Math.max(...pts);
            const r = max - min || 1;
            const x = (i / (pts.length - 1)) * 60 + 2;
            const y = 20 - ((p - min) / r) * 16;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          })
          .join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function sparkPtsDeterministic(symbol: string, up: boolean): number[] {
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i) * (i + 1);
  const out: number[] = [];
  let v = 40 + (seed % 15);
  for (let i = 0; i < 8; i++) {
    const jitter = ((seed * (i + 3)) % 5) - 2;
    v += (up ? 1.4 : -1.4) * jitter;
    out.push(v);
  }
  return out;
}

const TICKER_SIZES = {
  sm: { price: 16, symbol: 11, pad: '10px 14px', minW: 140 },
  md: { price: 22, symbol: 13, pad: '14px 18px', minW: 160 },
  lg: { price: 28, symbol: 15, pad: '18px 22px', minW: 180 },
} as const;

function PriceTickerCard({
  t,
  symbol,
  exchange,
  price,
  pct,
  volume,
  showVolume,
  size,
  flash,
}: {
  t: VDSTheme;
  symbol: string;
  exchange: string;
  price: number;
  pct: number;
  volume: string;
  showVolume: boolean;
  size: keyof typeof TICKER_SIZES;
  flash: 'up' | 'down' | 'none';
}) {
  const s = TICKER_SIZES[size];
  const dir = directionFromPct(pct);
  const TrendIc = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : Minus;
  const fx = symbol.includes('EUR') || symbol.includes('GBP');
  const priceStr = fx ? price.toFixed(5) : `$${formatUsd(price)}`;
  const anim =
    flash === 'up' ? 'vdsPriceFlashUp 300ms ease-out' : flash === 'down' ? 'vdsPriceFlashDown 300ms ease-out' : 'none';

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 4,
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 12,
        padding: s.pad,
        minWidth: s.minW,
        animation: anim,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: s.symbol, fontWeight: 800, color: t.text.primary.default, fontFamily: MONO }}>{symbol}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            background: t.bg.surface.tertiary.default,
            color: t.text.tertiary.default,
            borderRadius: 4,
            padding: '2px 6px',
          }}
        >
          {exchange}
        </span>
      </div>
      <div
        style={{
          fontSize: s.price,
          fontWeight: 800,
          color: t.text.primary.default,
          fontFamily: MONO,
          letterSpacing: '-0.02em',
        }}
      >
        {priceStr}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: MONO,
            padding: '3px 8px',
            borderRadius: 6,
            background:
              dir === 'up' ? FIN.positiveBg : dir === 'down' ? FIN.negativeBg : t.bg.surface.tertiary.default,
            color: dir === 'up' ? FIN.positive : dir === 'down' ? FIN.negative : t.text.tertiary.default,
          }}
        >
          <TrendIc size={12} aria-hidden />
          {pct > 0 ? '+' : ''}
          {pct.toFixed(2)}%
        </span>
        <span style={{ fontSize: 10, color: t.text.tertiary.default }}>24h</span>
      </div>
      {showVolume ? (
        <div>
          <span style={{ fontSize: 10, color: t.text.tertiary.default }}>Vol: </span>
          <span style={{ fontSize: 10, fontFamily: MONO, color: t.text.secondary.default }}>{volume}</span>
        </div>
      ) : null}
    </div>
  );
}

function CandleShape(props: {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: OHLCCandle;
  active?: boolean;
  onEnter?: () => void;
}) {
  const { x, y, width, height, payload, active, onEnter } = props;
  const { open, high, low, close } = payload;
  const range = high - low || 1;
  const py = (p: number) => y + ((high - p) / range) * height;
  const c = x + width / 2;
  const isUp = close >= open;
  const col = isUp ? FIN.positive : FIN.negative;
  const yTop = py(Math.max(open, close));
  const yBot = py(Math.min(open, close));
  const bodyH = Math.max(yBot - yTop, 1);
  const barW = Math.max(width - 2, 2);
  const left = x + (width - barW) / 2;
  const op = active ? 0.8 : 1;

  return (
    <g opacity={op} style={{ cursor: 'crosshair' }} onMouseEnter={onEnter}>
      <line x1={c} y1={py(high)} x2={c} y2={py(low)} stroke={col} strokeWidth={1.5} />
      <rect x={left} y={yTop} width={barW} height={bodyH} fill={col} stroke={col} strokeWidth={1} />
    </g>
  );
}

function CandlestickPanel({
  t,
  data,
  timeframe,
  onTf,
  showVolume,
  showGrid,
  activeIndex,
  setActiveIndex,
}: {
  t: VDSTheme;
  data: OHLCCandle[];
  timeframe: string;
  onTf: (tf: string) => void;
  showVolume: boolean;
  showGrid: boolean;
  activeIndex: number | null;
  setActiveIndex: (i: number | null) => void;
}) {
  const rows = useMemo(() => data.map((d, i) => ({ ...d, __i: i })), [data]);
  const active = activeIndex != null ? data[activeIndex] : data[data.length - 1];
  const tfs = ['1H', '4H', '1D', '1W', '1M'] as const;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 720,
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 14,
        overflow: 'hidden',
        padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 800, fontFamily: MONO, color: t.text.primary.default }}>BTC/USDT</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {tfs.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onTf(tf)}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: timeframe === tf ? t.bg.surface.primary.default : 'transparent',
                  color: timeframe === tf ? t.text.primary.default : t.text.secondary.default,
                  boxShadow: timeframe === tf ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                  fontFamily: MONO,
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, fontFamily: MONO, color: t.text.tertiary.default, textAlign: 'right' }}>
          O:{' '}
          <span style={{ fontWeight: 600, color: t.text.primary.default }}>${formatUsd(active.open)}</span> H:{' '}
          <span style={{ fontWeight: 600, color: t.text.primary.default }}>${formatUsd(active.high)}</span> L:{' '}
          <span style={{ fontWeight: 600, color: t.text.primary.default }}>${formatUsd(active.low)}</span> C:{' '}
          <span style={{ fontWeight: 600, color: t.text.primary.default }}>${formatUsd(active.close)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={rows}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {showGrid ? <CartesianGrid strokeDasharray="3 3" stroke={t.border.default.default} /> : null}
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: t.text.tertiary.default }} axisLine={false} tickLine={false} />
              <YAxis
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 10, fill: t.text.tertiary.default, fontFamily: MONO }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={(v) => (typeof v === 'number' ? v.toFixed(0) : v)}
              />
              <Tooltip cursor={{ stroke: t.border.default.default }} content={() => null} />
              <Bar
                isAnimationActive={false}
                dataKey={(d: OHLCCandle) => [d.low, d.high]}
                shape={(p: unknown) => {
                  const props = p as { x: number; y: number; width: number; height: number; payload: OHLCCandle };
                  const i = props.payload.__i;
                  return (
                    <CandleShape
                      x={props.x}
                      y={props.y}
                      width={props.width}
                      height={props.height}
                      payload={props.payload}
                      active={i != null && activeIndex === i}
                      onEnter={() => i != null && setActiveIndex(i)}
                    />
                  );
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {showVolume ? (
          <div style={{ height: 72 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={[0, 'dataMax']} />
                <Bar dataKey="volume" isAnimationActive={false}>
                  {rows.map((e, i) => (
                    <Cell key={i} fill={e.close >= e.open ? FIN.positive : FIN.negative} opacity={0.5} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OrderBookPanel({
  t,
  asks,
  bids,
  lastPrice,
  spread,
  spreadPct,
  depth,
  view,
}: {
  t: VDSTheme;
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
  lastPrice: number;
  spread: number;
  spreadPct: string;
  depth: number;
  view: 'full' | 'bids' | 'asks';
}) {
  const askSlice = asks.slice(-depth).reverse();
  const bidSlice = bids.slice(0, depth);
  const maxT = Math.max(...askSlice.map((a) => a.total), ...bidSlice.map((b) => b.total), 1);

  const row = (level: OrderBookLevel, side: 'ask' | 'bid') => {
    const w = `${(level.total / maxT) * 100}%`;
    const col = side === 'ask' ? FIN.negative : FIN.positive;
    const bg = side === 'ask' ? 'rgba(210,34,50,0.08)' : 'rgba(10,136,83,0.08)';
    return (
      <div
        key={`${side}-${level.price}`}
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          padding: '3px 16px',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = t.bg.surface.secondary.default;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        }}
      >
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: w, background: bg, pointerEvents: 'none' }} />
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: MONO, color: col, zIndex: 1 }}>{formatUsd(level.price)}</span>
        <span style={{ fontSize: 12, fontFamily: MONO, color: t.text.secondary.default, zIndex: 1 }}>{level.size.toFixed(3)}</span>
        <span style={{ fontSize: 12, fontFamily: MONO, color: t.text.tertiary.default, zIndex: 1 }}>{level.total.toFixed(2)}</span>
      </div>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 400,
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${t.border.default.default}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>Order Book</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['10', '20', '50'] as const).map((d) => (
            <span
              key={d}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                background: String(depth) === d ? t.bg.surface.primary.default : t.bg.surface.tertiary.default,
                color: t.text.tertiary.default,
              }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          padding: '6px 16px',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: t.text.tertiary.default,
        }}
      >
        <span>Price (USDT)</span>
        <span>Size (BTC)</span>
        <span>Total (BTC)</span>
      </div>
      {(() => {
        const spreadRow = (
          <div
            style={{
              padding: '6px 16px',
              background: t.bg.surface.secondary.default,
              borderTop: `1px solid ${t.border.default.default}`,
              borderBottom: `1px solid ${t.border.default.default}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 800, fontFamily: MONO, color: t.text.primary.default }}>{formatUsd(lastPrice)}</span>
            <span
              style={{
                fontSize: 10,
                background: t.bg.surface.tertiary.default,
                color: t.text.tertiary.default,
                borderRadius: 4,
                padding: '2px 6px',
                fontFamily: MONO,
              }}
            >
              Spread {formatUsd(spread)} · {spreadPct}
            </span>
          </div>
        );
        return (
          <>
            {view !== 'bids' ? (
              <div>
                {askSlice.map((lvl) => row(lvl, 'ask'))}
                {view === 'asks' || view === 'full' ? spreadRow : null}
              </div>
            ) : null}
            {view !== 'asks' ? (
              <div>
                {view === 'bids' ? spreadRow : null}
                {bidSlice.map((lvl) => row(lvl, 'bid'))}
              </div>
            ) : null}
          </>
        );
      })()}
    </div>
  );
}

function PortfolioPanel({
  showAllocation,
  showHoldings,
  showSpark,
  previewT,
}: {
  showAllocation: boolean;
  showHoldings: boolean;
  showSpark: boolean;
  previewT: VDSTheme;
}) {
  const gradId = `pf${useId().replace(/:/g, '')}`;
  const spark = [118000, 119200, 120400, 121000, 122800, 123900, 124856];
  return (
    <div
      style={{
        background: previewT.bg.surface.primary.default,
        border: `1px solid ${previewT.border.default.default}`,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 520,
      }}
    >
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: previewT.text.tertiary.default }}>
        Total portfolio value
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          fontFamily: MONO,
          letterSpacing: '-0.02em',
          color: previewT.text.primary.default,
          marginTop: 4,
        }}
      >
        ${formatUsd(portfolioData.totalValue)}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: MONO,
            padding: '3px 8px',
            borderRadius: 6,
            background: FIN.positiveBg,
            color: FIN.positive,
          }}
        >
          <TrendingUp size={12} aria-hidden />+{portfolioData.change24h.pct.toFixed(2)}%
        </span>
        <span style={{ fontSize: 11, color: previewT.text.tertiary.default }}>today</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 700,
            fontFamily: MONO,
            padding: '2px 6px',
            borderRadius: 6,
            background: FIN.positiveBg,
            color: FIN.positive,
          }}
        >
          +{portfolioData.change7d.pct.toFixed(2)}%
        </span>
        <span style={{ fontSize: 10, color: previewT.text.tertiary.default }}>7d</span>
      </div>
      {showAllocation ? (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: previewT.text.tertiary.default, marginTop: 20 }}>Allocation</div>
          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
            {portfolioData.holdings.map((h) => (
              <div key={h.symbol} style={{ flex: h.allocation, background: h.color }} title={`${h.symbol} ${h.allocation}%`} />
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {portfolioData.holdings.map((h) => (
              <div key={h.symbol} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: h.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: previewT.text.primary.default }}>{h.symbol}</span>
                <span style={{ fontSize: 11, color: previewT.text.tertiary.default }}>{h.allocation.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
      {showHoldings ? (
        <div style={{ borderTop: `1px solid ${previewT.border.default.default}`, marginTop: 20, paddingTop: 16 }}>
          {portfolioData.holdings.map((h, idx) => (
            <div
              key={h.symbol}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: idx < portfolioData.holdings.length - 1 ? `1px solid ${previewT.border.default.default}` : 'none',
              }}
            >
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: h.color,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {h.symbol[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: previewT.text.primary.default }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: previewT.text.tertiary.default }}>{h.symbol}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: previewT.text.primary.default, marginRight: 12 }}>
                ${formatUsd(h.value)}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: MONO,
                  padding: '2px 6px',
                  borderRadius: 6,
                  background: h.change >= 0 ? FIN.positiveBg : FIN.negativeBg,
                  color: h.change >= 0 ? FIN.positive : FIN.negative,
                }}
              >
                {h.change > 0 ? '+' : ''}
                {h.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {showSpark ? (
        <div style={{ height: 48, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark.map((v, i) => ({ i, v }))}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={FIN.positive} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={FIN.positive} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={FIN.positive} fill={`url(#${gradId})`} strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}

function PnLPanel({ showPositions, btcMode, previewT }: { showPositions: boolean; btcMode: boolean; previewT: VDSTheme }) {
  const sym = btcMode ? '₿' : '$';
  const fmt = (n: number) => (btcMode ? (n / 67000).toFixed(4) : formatUsd(n));

  return (
    <div
      style={{
        background: previewT.bg.surface.primary.default,
        border: `1px solid ${previewT.border.default.default}`,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 640,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {(
          [
            ['Total P&L', pnlData.totalPnL.value, pnlData.totalPnL.pct],
            ['Realized P&L', pnlData.realizedPnL.value, pnlData.realizedPnL.pct],
            ['Unrealized P&L', pnlData.unrealizedPnL.value, pnlData.unrealizedPnL.pct],
          ] as const
        ).map(([lab, val, pct]) => (
          <div
            key={lab}
            style={{
              background: previewT.bg.surface.secondary.default,
              borderRadius: 10,
              padding: 12,
            }}
          >
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: previewT.text.tertiary.default }}>{lab}</div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: MONO, color: FIN.positive, marginTop: 4 }}>
              {sym}
              {fmt(val)} · +{pct.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
      {showPositions ? (
        <div style={{ borderTop: `1px solid ${previewT.border.default.default}`, marginTop: 20, paddingTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: previewT.text.tertiary.default, marginBottom: 12 }}>Open positions</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 60px 80px 80px 80px 80px',
              fontSize: 10,
              textTransform: 'uppercase',
              color: previewT.text.tertiary.default,
              letterSpacing: '0.06em',
              paddingBottom: 8,
            }}
          >
            <span>Asset</span>
            <span>Side</span>
            <span>Entry</span>
            <span>Mark</span>
            <span>Size</span>
            <span>P&L</span>
          </div>
          {pnlData.positions.map((p) => (
            <div
              key={p.symbol}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 60px 80px 80px 80px 80px',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: `1px solid ${previewT.border.default.default}`,
                fontFamily: MONO,
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 13, color: previewT.text.primary.default }}>{p.symbol}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: p.side === 'LONG' ? FIN.positiveBg : FIN.negativeBg,
                  color: p.side === 'LONG' ? FIN.positive : FIN.negative,
                  width: 'fit-content',
                }}
              >
                {p.side}
              </span>
              <span style={{ fontSize: 12, color: previewT.text.secondary.default }}>{btcMode ? (p.entry / 67000).toFixed(4) : p.entry}</span>
              <span style={{ fontSize: 12, color: previewT.text.primary.default }}>{btcMode ? (p.current / 67000).toFixed(4) : p.current}</span>
              <span style={{ fontSize: 12, color: previewT.text.secondary.default }}>{p.size}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: p.pnl >= 0 ? FIN.positive : FIN.negative }}>
                {p.pnl >= 0 ? '+' : ''}
                {btcMode ? (p.pnl / 67000).toFixed(4) : formatUsd(p.pnl)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MarketOverviewPanel({
  rows,
  category,
  search,
  onSearchChange,
  sortBy,
  sortDir,
  previewT,
}: {
  rows: MarketAsset[];
  category: 'all' | 'crypto' | 'stock' | 'forex';
  search: string;
  onSearchChange: (v: string) => void;
  sortBy: 'price' | 'change' | 'volume';
  sortDir: 'asc' | 'desc';
  previewT: VDSTheme;
}) {
  const chip = (active: boolean, lab: string) => (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 6,
        background: active ? previewT.bg.surface.primary.default : 'transparent',
        color: active ? previewT.text.primary.default : previewT.text.secondary.default,
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
      }}
    >
      {lab}
    </span>
  );

  const sorted = useMemo(() => {
    const f = rows.filter((r) => {
      if (category !== 'all' && r.category !== category) return false;
      if (search && !(`${r.symbol} ${r.name}`.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
    const m = { price: 'price' as const, change: 'change' as const, volume: 'volume' as const };
    const key = m[sortBy];
    return [...f].sort((a, b) => {
      const av = key === 'volume' ? parseFloat(a.volume.replace(/[^0-9.]/g, '')) || 0 : (a as never)[key];
      const bv = key === 'volume' ? parseFloat(b.volume.replace(/[^0-9.]/g, '')) || 0 : (b as never)[key];
      const c = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? c : -c;
    });
  }, [rows, category, search, sortBy, sortDir]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 720,
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
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: previewT.text.primary.default }}>Market Overview</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, background: previewT.bg.surface.tertiary.default, borderRadius: 10, padding: 4 }}>
            {chip(category === 'all', 'All')}
            {chip(category === 'crypto', 'Crypto')}
            {chip(category === 'stock', 'Stocks')}
            {chip(category === 'forex', 'Forex')}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 8,
              border: `1px solid ${previewT.border.default.default}`,
              background: previewT.bg.surface.secondary.default,
            }}
          >
            <Search size={14} color={previewT.text.tertiary.default} aria-hidden />
            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 12,
                color: previewT.text.primary.default,
                width: 120,
              }}
            />
          </div>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: previewT.bg.surface.secondary.default, borderBottom: `2px solid ${previewT.border.strong.default}` }}>
            {['Asset', 'Price', '24h Change', 'Volume', 'Mkt Cap', ''].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  padding: '8px 16px',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: previewT.text.tertiary.default,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((a) => {
            const catColor = a.category === 'crypto' ? '#7C3AED' : a.category === 'stock' ? '#2563EB' : '#0A8853';
            const up = a.change > 0;
            const down = a.change < 0;
            const TrendIc = up ? TrendingUp : down ? TrendingDown : Minus;
            const pts = sparkPtsDeterministic(a.symbol, up);
            return (
              <tr key={a.symbol} style={{ borderBottom: `1px solid ${previewT.border.default.default}` }}>
                <td style={{ padding: '8px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: catColor,
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {a.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: previewT.text.primary.default }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: previewT.text.tertiary.default }}>{a.symbol}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, fontFamily: MONO, color: previewT.text.primary.default }}>
                  {a.category === 'forex' ? a.price.toFixed(5) : `$${formatUsd(a.price)}`}
                </td>
                <td style={{ padding: '8px 16px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: MONO,
                      padding: '2px 6px',
                      borderRadius: 6,
                      background: up ? FIN.positiveBg : down ? FIN.negativeBg : previewT.bg.surface.tertiary.default,
                      color: up ? FIN.positive : down ? FIN.negative : previewT.text.tertiary.default,
                    }}
                  >
                    <TrendIc size={12} aria-hidden />
                    {a.change > 0 ? '+' : ''}
                    {a.change.toFixed(2)}%
                  </span>
                </td>
                <td style={{ padding: '8px 16px', fontSize: 12, fontFamily: MONO, color: previewT.text.secondary.default }}>{a.volume}</td>
                <td style={{ padding: '8px 16px', fontSize: 12, fontFamily: MONO, color: previewT.text.secondary.default }}>{a.mcap}</td>
                <td style={{ padding: '8px 16px' }}>
                  <MiniSparkline pts={pts} color={up ? FIN.positive : down ? FIN.negative : previewT.text.tertiary.default} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div
        style={{
          padding: '10px 20px',
          borderTop: `1px solid ${previewT.border.default.default}`,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: previewT.text.tertiary.default,
        }}
      >
        <span>Showing {sorted.length} of 2,847 assets</span>
        <span style={{ color: previewT.text.brand.default, fontWeight: 600, cursor: 'pointer' }}>View all</span>
      </div>
    </div>
  );
}

function TradingPairBar({
  pairIdx,
  showStats,
  showActions,
  openSearch,
  setOpenSearch,
  onSelectPair,
  previewT,
}: {
  pairIdx: number;
  showStats: boolean;
  showActions: boolean;
  openSearch: boolean;
  setOpenSearch: (v: boolean) => void;
  onSelectPair: (i: number) => void;
  previewT: VDSTheme;
}) {
  const p = PAIR_OPTIONS[pairIdx];
  const up = p.change > 0;
  const stats = tradingPairData;
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 720 }}>
      <div
        style={{
          background: previewT.bg.surface.primary.default,
          border: `1px solid ${previewT.border.default.default}`,
          borderRadius: 12,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setOpenSearch(!openSearch)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: 8,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = previewT.bg.surface.secondary.default;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: '#F07332',
              color: '#fff',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {p.base[0]}
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, fontFamily: MONO, color: previewT.text.primary.default }}>
            {p.base} / {p.quote}
          </span>
          <ChevronDown size={16} color={previewT.text.tertiary.default} aria-hidden />
        </button>
        <div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              fontFamily: MONO,
              letterSpacing: '-0.02em',
              color: up ? FIN.positive : p.change < 0 ? FIN.negative : previewT.text.primary.default,
            }}
          >
            {p.quote === 'USD' ? p.price.toFixed(5) : `$${formatUsd(p.price)}`}
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 4,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: MONO,
              padding: '3px 8px',
              borderRadius: 6,
              background: up ? FIN.positiveBg : FIN.negativeBg,
              color: up ? FIN.positive : FIN.negative,
            }}
          >
            {up ? <TrendingUp size={12} aria-hidden /> : <TrendingDown size={12} aria-hidden />}
            {p.change > 0 ? '+' : ''}
            {p.change.toFixed(2)}%
          </span>
        </div>
        {showStats ? (
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              ['24h Open', formatUsd(stats.open), previewT.text.secondary.default],
              ['24h High', formatUsd(stats.high), FIN.positive],
              ['24h Low', formatUsd(stats.low), FIN.negative],
              ['24h Volume', stats.volume, previewT.text.secondary.default],
              ['24h Vol(USDT)', stats.volUSDT, previewT.text.secondary.default],
            ].map(([lab, val, col]) => (
              <div key={String(lab)} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: previewT.text.tertiary.default }}>
                  {lab}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, fontFamily: MONO, color: col as string }}>{val}</span>
              </div>
            ))}
          </div>
        ) : null}
        {showActions ? (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button
              type="button"
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: `1px solid ${previewT.border.default.default}`,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <Star size={16} color={previewT.text.secondary.default} aria-hidden />
            </button>
            <button
              type="button"
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: `1px solid ${previewT.border.default.default}`,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <AlertCircle size={16} color={previewT.text.secondary.default} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
      {openSearch ? (
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 0,
            zIndex: 5,
            width: 320,
            background: previewT.bg.surface.primary.default,
            border: `1px solid ${previewT.border.default.default}`,
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 8,
              border: `1px solid ${previewT.border.default.default}`,
              marginBottom: 8,
            }}
          >
            <Search size={14} aria-hidden />
            <span style={{ fontSize: 12, color: previewT.text.tertiary.default }}>Search pairs…</span>
          </div>
          {PAIR_OPTIONS.map((opt, i) => (
            <button
              key={`${opt.base}-${opt.quote}`}
              type="button"
              onClick={() => {
                onSelectPair(i);
                setOpenSearch(false);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                border: 'none',
                background: 'transparent',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = previewT.bg.surface.secondary.default;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: '#7C3AED',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {opt.base[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontFamily: MONO, fontSize: 13, color: previewT.text.primary.default }}>
                  {opt.base}/{opt.quote}
                </div>
                <div style={{ fontSize: 11, color: previewT.text.tertiary.default }}>
                  {opt.quote === 'USD' ? opt.price.toFixed(5) : `$${formatUsd(opt.price)}`}
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: opt.change >= 0 ? FIN.positive : FIN.negative }}>
                {opt.change > 0 ? '+' : ''}
                {opt.change.toFixed(2)}%
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function jitterOrderBook(base: typeof orderBookData, tick: number) {
  const w = 1 + Math.sin(tick / 2) * 0.015;
  return {
    ...base,
    asks: base.asks.map((r) => ({ ...r, size: +(r.size * w).toFixed(3), total: +(r.total * w).toFixed(2) })),
    bids: base.bids.map((r) => ({ ...r, size: +(r.size / w).toFixed(3), total: +(r.total / w).toFixed(2) })),
  };
}

export default function TradingDocsPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isDark, setIsDark] = useState(false);

  const [tkAsset, setTkAsset] = useState<'BTC/USDT' | 'ETH/USDT' | 'EUR/USD'>('BTC/USDT');
  const [tkSize, setTkSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [tkVol, setTkVol] = useState<'off' | 'on'>('on');
  const [tkApp, setTkApp] = useState<'Light' | 'Dark'>('Light');
  const [tkPrices, setTkPrices] = useState([67432.5, 3521.8, 1.08542]);
  const [tkFlash, setTkFlash] = useState<Array<'none' | 'up' | 'down'>>(['none', 'none', 'none']);

  const [cTf, setCTf] = useState('1D');
  const [cVol, setCVol] = useState<'off' | 'on'>('on');
  const [cGrid, setCGrid] = useState<'off' | 'on'>('on');
  const [cApp, setCApp] = useState<'Light' | 'Dark'>('Light');
  const [cIdx, setCIdx] = useState<number | null>(null);

  const [obDepth, setObDepth] = useState<'10' | '20' | '50'>('10');
  const [obView, setObView] = useState<'full' | 'bids only' | 'asks only'>('full');
  const [obAnim, setObAnim] = useState<'off' | 'on'>('off');
  const [obApp, setObApp] = useState<'Light' | 'Dark'>('Light');
  const [obTick, setObTick] = useState(0);

  const [pfPer, setPfPer] = useState<'24h' | '7d' | '30d' | 'YTD'>('24h');
  const [pfAlloc, setPfAlloc] = useState<'off' | 'on'>('on');
  const [pfHold, setPfHold] = useState<'off' | 'on'>('on');
  const [pfSpark, setPfSpark] = useState<'off' | 'on'>('on');
  const [pfApp, setPfApp] = useState<'Light' | 'Dark'>('Light');

  const [pnlPer, setPnlPer] = useState<'Today' | 'Week' | 'Month' | 'All time'>('Today');
  const [pnlPos, setPnlPos] = useState<'off' | 'on'>('on');
  const [pnlCur, setPnlCur] = useState<'USD' | 'BTC'>('USD');
  const [pnlApp, setPnlApp] = useState<'Light' | 'Dark'>('Light');

  const [mkCat, setMkCat] = useState<'All' | 'Crypto' | 'Stocks' | 'Forex'>('All');
  const [mkSort, setMkSort] = useState<'Price' | 'Change' | 'Volume'>('Price');
  const [mkDir, setMkDir] = useState<'asc' | 'desc'>('desc');
  const [mkApp, setMkApp] = useState<'Light' | 'Dark'>('Light');
  const [mkSearch, setMkSearch] = useState('');

  const [tpPair, setTpPair] = useState<'BTC/USDT' | 'ETH/USDT' | 'SOL/USDT' | 'EUR/USD'>('BTC/USDT');
  const [tpStats, setTpStats] = useState<'off' | 'on'>('on');
  const [tpAct, setTpAct] = useState<'off' | 'on'>('on');
  const [tpApp, setTpApp] = useState<'Light' | 'Dark'>('Light');
  const [tpOpen, setTpOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (obAnim !== 'on') return;
    const id = window.setInterval(() => setObTick((x) => x + 1), 2000);
    return () => window.clearInterval(id);
  }, [obAnim]);

  const t = buildTheme(isDark);
  const candles = useMemo(() => buildCandleData(), []);
  const obData = useMemo(() => jitterOrderBook(orderBookData, obTick), [obTick]);
  const obViewMode: 'full' | 'bids' | 'asks' =
    obView === 'full' ? 'full' : obView === 'bids only' ? 'bids' : 'asks';

  const mkCategory: 'all' | 'crypto' | 'stock' | 'forex' =
    mkCat === 'All' ? 'all' : mkCat === 'Crypto' ? 'crypto' : mkCat === 'Stocks' ? 'stock' : 'forex';
  const mkSortKey: 'price' | 'change' | 'volume' =
    mkSort === 'Price' ? 'price' : mkSort === 'Change' ? 'change' : 'volume';

  const previewT = (app: 'Light' | 'Dark') => (app === 'Dark' ? buildTheme(true) : t);

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'price-ticker', label: 'Price Ticker' },
        { id: 'candlestick', label: 'Candlestick Chart' },
        { id: 'order-book', label: 'Order Book' },
        { id: 'portfolio-card', label: 'Portfolio Card' },
        { id: 'pnl-display', label: 'P&L Display' },
        { id: 'market-overview', label: 'Market Overview' },
        { id: 'trading-pair', label: 'Trading Pair' },
        { id: 'principles', label: 'Principles' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-tr', label: 'When to use' },
        { id: 'asset-types', label: 'Crypto vs Stocks vs Forex' },
        { id: 'dos-donts-tr', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'num-format-tr', label: 'Number formatting' },
        { id: 'labels-tr', label: 'Labels and identifiers' },
        { id: 'change-period-tr', label: 'Change period' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'types-tr', label: 'Shared types' },
        { id: 'props-ticker', label: 'PriceTicker props' },
        { id: 'props-candle', label: 'CandlestickChart props' },
        { id: 'props-book', label: 'OrderBook props' },
        { id: 'props-portfolio', label: 'PortfolioCard props' },
        { id: 'props-market', label: 'MarketOverview props' },
        { id: 'props-pair', label: 'TradingPair props' },
        { id: 'code-ex-tr', label: 'Examples' },
      ];
    }
    return [];
  }, [activeTab]);

  const tkPreview = previewT(tkApp);
  const tkIdx = tkAsset === 'BTC/USDT' ? 0 : tkAsset === 'ETH/USDT' ? 1 : 2;
  const demos = TICKER_DEMOS.map((d, i) => ({
    ...d,
    price: i === 0 ? tkPrices[0] : i === 1 ? tkPrices[1] : tkPrices[2],
    flash: tkFlash[i],
  }));

  const simulateFlash = () => {
    const prev = tkPrices[tkIdx];
    const dir = Math.random() > 0.5 ? 1 : -1;
    const nudge = prev > 100 ? prev * 0.0005 * dir : prev * 0.0008 * dir;
    setTkPrices((p) => p.map((v, j) => (j === tkIdx ? +(v + nudge).toFixed(j === 2 ? 5 : 2) : v)));
    setTkFlash((f) => f.map((x, j) => (j === tkIdx ? (dir > 0 ? 'up' : 'down') : x)));
    window.setTimeout(() => {
      setTkFlash((f) => f.map((x, j) => (j === tkIdx ? 'none' : x)));
    }, 320);
  };

  const codeExamples = `// ─── Price Ticker ───
<PriceTicker
  symbol="BTC/USDT"
  price={67432.50}
  change={{ value: 1578.30, pct: 2.34, direction: 'up' }}
  exchange="BINANCE"
  volume="$28.4B"
  showVolume
/>`;

  return (
    <div className="docs-page-with-toc">
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes vdsPriceFlashUp{0%{background-color:rgba(10,136,83,0.10)}100%{background-color:transparent}}@keyframes vdsPriceFlashDown{0%{background-color:rgba(210,34,50,0.10)}100%{background-color:transparent}}`,
        }}
      />
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Trading
      </p>
      <h1 className="page-title">Trading</h1>
      <p className="page-lead">
        Trading components are purpose-built for financial interfaces — crypto, stocks, and forex. They handle real-time price display, OHLC
        charts, order books, portfolio summaries, and market overviews. All components are designed for high information density, fast
        scanning, and precise numerical display.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <span style={chipStyleA()}>Stable</span>
        <span style={chipStyleA()}>v1.0</span>
        <span style={chipStyleA({ color: '#002b49', background: 'rgba(0,43,73,0.08)' })}>Financial</span>
      </div>

      <ComponentTabs tabs={[...TABS]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'Overview' ? (
        <>
          <section id="price-ticker" style={{ marginTop: 32, marginBottom: 48 }}>
            <h2 className="section-title">Price Ticker</h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              Displays the current price of an asset with its change. The color flashes briefly on price update to signal new data.
            </p>
            <LivePreviewShell
              t={t}
              canvasIsDark={tkApp === 'Dark'}
              controls={
                <>
                  <LivePreviewSegmentRow
                    t={t}
                    label="Asset"
                    options={['BTC/USDT', 'ETH/USDT', 'EUR/USD']}
                    value={tkAsset}
                    onChange={(v) => setTkAsset(v as typeof tkAsset)}
                  />
                  <LivePreviewSegmentRow t={t} label="Size" options={['sm', 'md', 'lg']} value={tkSize} onChange={(v) => setTkSize(v as typeof tkSize)} />
                  <LivePreviewSegmentRow t={t} label="Show volume" options={['off', 'on']} value={tkVol} onChange={(v) => setTkVol(v as 'off' | 'on')} />
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: t.text.tertiary.default,
                        marginBottom: 8,
                      }}
                    >
                      Flash
                    </div>
                    <button
                      type="button"
                      onClick={simulateFlash}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.tertiary.default,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        color: t.text.primary.default,
                      }}
                    >
                      <RefreshCw size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
                      Simulate update
                    </button>
                  </div>
                  <LivePreviewSegmentRow t={t} label="Appearance" options={['Light', 'Dark']} value={tkApp} onChange={(v) => setTkApp(v as 'Light' | 'Dark')} showDivider={false} />
                </>
              }
            >
              <div
                style={{
                  width: '100%',
                  minHeight: 200,
                  padding: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                {demos.map((d, i) => (
                  <PriceTickerCard
                    key={`${d.symbol}-${d.flash}`}
                    t={tkPreview}
                    symbol={d.symbol}
                    exchange={d.exchange}
                    price={d.price}
                    pct={d.pct}
                    volume={d.vol}
                    showVolume={tkVol === 'on'}
                    size={tkSize}
                    flash={d.flash}
                  />
                ))}
              </div>
            </LivePreviewShell>
            <h3 className="section-title" style={{ marginTop: 28, fontSize: 16 }}>
              Ticker variants
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
              {(['Compact (sm)', 'Standard (md)', 'Hero (lg)'] as const).map((lab, i) => (
                <div
                  key={lab}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 12 }}>{lab}</div>
                  <PriceTickerCard
                    t={t}
                    symbol="BTC/USDT"
                    exchange="BINANCE"
                    price={67432.5}
                    pct={2.34}
                    volume="$28.4B"
                    showVolume={i > 0}
                    size={i === 0 ? 'sm' : i === 1 ? 'md' : 'lg'}
                    flash="none"
                  />
                </div>
              ))}
            </div>
          </section>

          <section id="candlestick" style={{ marginBottom: 48 }}>
            <h2 className="section-title">Candlestick Chart</h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              OHLC candlestick chart for price history. Each candle shows Open, High, Low, and Close prices for a time period. Green candles
              close higher than open; red candles close lower.
            </p>
            <LivePreviewShell
              t={t}
              canvasIsDark={cApp === 'Dark'}
              controls={
                <>
                  <LivePreviewSegmentRow
                    t={t}
                    label="Timeframe"
                    options={['1H', '4H', '1D', '1W', '1M']}
                    value={cTf}
                    onChange={setCTf}
                  />
                  <LivePreviewSegmentRow t={t} label="Show volume" options={['off', 'on']} value={cVol} onChange={(v) => setCVol(v as 'off' | 'on')} />
                  <LivePreviewSegmentRow t={t} label="Show grid" options={['off', 'on']} value={cGrid} onChange={(v) => setCGrid(v as 'off' | 'on')} />
                  <LivePreviewSegmentRow t={t} label="Appearance" options={['Light', 'Dark']} value={cApp} onChange={(v) => setCApp(v as 'Light' | 'Dark')} showDivider={false} />
                </>
              }
            >
              <CandlestickPanel
                t={previewT(cApp)}
                data={candles}
                timeframe={cTf}
                onTf={setCTf}
                showVolume={cVol === 'on'}
                showGrid={cGrid === 'on'}
                activeIndex={cIdx}
                setActiveIndex={setCIdx}
              />
            </LivePreviewShell>
          </section>

          <section id="order-book" style={{ marginBottom: 48 }}>
            <h2 className="section-title">Order Book</h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              The order book shows pending buy (bid) and sell (ask) orders at each price level. It reveals market depth — where support and
              resistance clusters are forming.
            </p>
            <LivePreviewShell
              t={t}
              canvasIsDark={obApp === 'Dark'}
              controls={
                <>
                  <LivePreviewSegmentRow t={t} label="Depth" options={['10', '20', '50']} value={obDepth} onChange={(v) => setObDepth(v as typeof obDepth)} />
                  <LivePreviewSegmentRow
                    t={t}
                    label="View"
                    options={['full', 'bids only', 'asks only']}
                    value={obView}
                    onChange={(v) => setObView(v as typeof obView)}
                  />
                  <LivePreviewSegmentRow t={t} label="Animate" options={['off', 'on']} value={obAnim} onChange={(v) => setObAnim(v as 'off' | 'on')} />
                  <LivePreviewSegmentRow t={t} label="Appearance" options={['Light', 'Dark']} value={obApp} onChange={(v) => setObApp(v as 'Light' | 'Dark')} showDivider={false} />
                </>
              }
            >
              <OrderBookPanel
                t={previewT(obApp)}
                asks={obData.asks}
                bids={obData.bids}
                lastPrice={obData.lastPrice}
                spread={obData.spread}
                spreadPct={obData.spreadPct}
                depth={Number(obDepth)}
                view={obViewMode}
              />
            </LivePreviewShell>
          </section>

          <section id="portfolio-card" style={{ marginBottom: 48 }}>
            <h2 className="section-title">Portfolio Card</h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              Summarizes a portfolio&apos;s total value, daily change, and allocation breakdown. The primary card for a portfolio overview screen.
            </p>
            <LivePreviewShell
              t={t}
              canvasIsDark={pfApp === 'Dark'}
              controls={
                <>
                  <LivePreviewSegmentRow t={t} label="Period" options={['24h', '7d', '30d', 'YTD']} value={pfPer} onChange={(v) => setPfPer(v as typeof pfPer)} />
                  <LivePreviewSegmentRow t={t} label="Show allocation" options={['off', 'on']} value={pfAlloc} onChange={(v) => setPfAlloc(v as 'off' | 'on')} />
                  <LivePreviewSegmentRow t={t} label="Show holdings" options={['off', 'on']} value={pfHold} onChange={(v) => setPfHold(v as 'off' | 'on')} />
                  <LivePreviewSegmentRow t={t} label="Show sparkline" options={['off', 'on']} value={pfSpark} onChange={(v) => setPfSpark(v as 'off' | 'on')} />
                  <LivePreviewSegmentRow t={t} label="Appearance" options={['Light', 'Dark']} value={pfApp} onChange={(v) => setPfApp(v as 'Light' | 'Dark')} showDivider={false} />
                </>
              }
            >
              <PortfolioPanel
                showAllocation={pfAlloc === 'on'}
                showHoldings={pfHold === 'on'}
                showSpark={pfSpark === 'on'}
                previewT={previewT(pfApp)}
              />
            </LivePreviewShell>
          </section>

          <section id="pnl-display" style={{ marginBottom: 48 }}>
            <h2 className="section-title">P&L Display</h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              Profit &amp; Loss display breaks down realized and unrealized gains across positions. Designed for clarity under emotional pressure —
              traders need to read P&amp;L instantly, without calculation.
            </p>
            <LivePreviewShell
              t={t}
              canvasIsDark={pnlApp === 'Dark'}
              controls={
                <>
                  <LivePreviewSegmentRow
                    t={t}
                    label="Period"
                    options={['Today', 'Week', 'Month', 'All time']}
                    value={pnlPer}
                    onChange={(v) => setPnlPer(v as typeof pnlPer)}
                  />
                  <LivePreviewSegmentRow t={t} label="Show positions" options={['off', 'on']} value={pnlPos} onChange={(v) => setPnlPos(v as 'off' | 'on')} />
                  <LivePreviewSegmentRow t={t} label="Currency" options={['USD', 'BTC']} value={pnlCur} onChange={(v) => setPnlCur(v as 'USD' | 'BTC')} />
                  <LivePreviewSegmentRow t={t} label="Appearance" options={['Light', 'Dark']} value={pnlApp} onChange={(v) => setPnlApp(v as 'Light' | 'Dark')} showDivider={false} />
                </>
              }
            >
              <PnLPanel showPositions={pnlPos === 'on'} btcMode={pnlCur === 'BTC'} previewT={previewT(pnlApp)} />
            </LivePreviewShell>
          </section>

          <section id="market-overview" style={{ marginBottom: 48 }}>
            <h2 className="section-title">Market Overview</h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              A scannable table of multiple assets with real-time price, change, volume, and market cap. The primary entry point for discovering
              market-wide movements.
            </p>
            <LivePreviewShell
              t={t}
              canvasIsDark={mkApp === 'Dark'}
              controls={
                <>
                  <LivePreviewSegmentRow
                    t={t}
                    label="Category"
                    options={['All', 'Crypto', 'Stocks', 'Forex']}
                    value={mkCat}
                    onChange={(v) => setMkCat(v as typeof mkCat)}
                  />
                  <LivePreviewSegmentRow t={t} label="Sort by" options={['Price', 'Change', 'Volume']} value={mkSort} onChange={(v) => setMkSort(v as typeof mkSort)} />
                  <LivePreviewSegmentRow t={t} label="Sort direction" options={['asc', 'desc']} value={mkDir} onChange={(v) => setMkDir(v as 'asc' | 'desc')} />
                  <LivePreviewSegmentRow t={t} label="Appearance" options={['Light', 'Dark']} value={mkApp} onChange={(v) => setMkApp(v as 'Light' | 'Dark')} showDivider={false} />
                </>
              }
            >
              <MarketOverviewPanel
                rows={marketData}
                category={mkCategory}
                search={mkSearch}
                onSearchChange={setMkSearch}
                sortBy={mkSortKey}
                sortDir={mkDir}
                previewT={previewT(mkApp)}
              />
            </LivePreviewShell>
          </section>

          <section id="trading-pair" style={{ marginBottom: 48 }}>
            <h2 className="section-title">Trading Pair</h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              The Trading Pair header is the top-level context component for a trading interface. It combines asset identity, current price, OHLC
              stats, and a pair selector into one compact row.
            </p>
            <LivePreviewShell
              t={t}
              canvasIsDark={tpApp === 'Dark'}
              controls={
                <>
                  <LivePreviewSegmentRow
                    t={t}
                    label="Pair"
                    options={['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'EUR/USD']}
                    value={tpPair}
                    onChange={(v) => setTpPair(v as typeof tpPair)}
                  />
                  <LivePreviewSegmentRow t={t} label="Show stats" options={['off', 'on']} value={tpStats} onChange={(v) => setTpStats(v as 'off' | 'on')} />
                  <LivePreviewSegmentRow t={t} label="Show actions" options={['off', 'on']} value={tpAct} onChange={(v) => setTpAct(v as 'off' | 'on')} />
                  <LivePreviewSegmentRow t={t} label="Appearance" options={['Light', 'Dark']} value={tpApp} onChange={(v) => setTpApp(v as 'Light' | 'Dark')} showDivider={false} />
                </>
              }
            >
              <TradingPairBar
                pairIdx={Math.max(
                  0,
                  PAIR_OPTIONS.findIndex((p) => `${p.base}/${p.quote}` === tpPair),
                )}
                showStats={tpStats === 'on'}
                showActions={tpAct === 'on'}
                openSearch={tpOpen}
                setOpenSearch={setTpOpen}
                onSelectPair={(i) => setTpPair(`${PAIR_OPTIONS[i].base}/${PAIR_OPTIONS[i].quote}` as typeof tpPair)}
                previewT={previewT(tpApp)}
              />
            </LivePreviewShell>
          </section>

          <section id="principles" style={{ marginBottom: 48 }}>
            <h2 className="section-title">Trading UI principles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: 20, background: t.bg.surface.secondary.default, minHeight: 140 }}>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'flex-end' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: t.text.primary.default }}>$67,432.50</div>
                      <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 4 }}>Proportional</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: MONO, color: t.text.primary.default }}>$67,432.50</div>
                      <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 4 }}>Monospace</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Activity size={18} color={t.text.brand.default} style={{ opacity: 0.5 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Monospace for all numbers</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Financial interfaces display numbers that change frequently and need precise alignment. Use JetBrains Mono for all prices,
                    volumes, percentages, and quantities.
                  </p>
                </div>
              </div>
              <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: 16, background: t.bg.surface.secondary.default, minHeight: 140 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10, fontFamily: MONO }}>
                    {['+2.1%', '-0.8%', '+5.2%', '-1.1%', '+0.3%', '-2.4%', '+1.0%', '-0.2%'].map((c, i) => (
                      <span key={i} style={{ color: c.startsWith('+') ? FIN.positive : FIN.negative }}>
                        {c}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 8 }}>Color at a glance</div>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <TrendingUp size={18} color={FIN.positive} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Green up, red down — always</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    The green/red convention for positive/negative change is universal in financial interfaces. Never invert this convention.
                  </p>
                </div>
              </div>
              <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: 16, background: t.bg.surface.secondary.default, minHeight: 140 }}>
                  <div style={{ fontSize: 11, fontFamily: MONO, fontWeight: 800, padding: 8, borderRadius: 8, animation: 'vdsPriceFlashUp 2.5s ease-in-out infinite' }}>
                    $67,432.50 → $67,441.20
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: t.text.tertiary.default, marginTop: 10 }}>
                    <span>Update</span>
                    <span>300ms flash</span>
                    <span>Idle</span>
                  </div>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Zap size={18} color={t.text.warning.default} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Flash confirms live data</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A brief color flash when a price updates confirms that the data is live — not static. 200–300ms duration registers without distracting.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title" id="when-to-use-tr">
            When to use
          </h2>
          <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.7 }}>
            <strong style={{ color: t.text.primary.default }}>DO:</strong> exchange interfaces, portfolio trackers, market screeners, trading dashboards,
            financial news platforms, investment apps.
          </p>
          <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.7, marginTop: 12 }}>
            <strong style={{ color: t.text.primary.default }}>DON&apos;T:</strong> general-purpose apps that only show one or two prices occasionally (use Stat Card instead), or when data is not
            updated frequently (flash animation is confusing if the price never moves).
          </p>
          <Callout variant="warning" title="Real-time data requires WebSocket">
            Trading components are designed for real-time data via WebSocket or SSE. Polling REST endpoints every 1s is inefficient and creates
            rate-limiting issues. Use WebSocket for price ticks and order book updates. Use REST for historical OHLC data.
          </Callout>
          <h2 className="section-title" id="asset-types" style={{ marginTop: 32 }}>
            Crypto vs Stocks vs Forex
          </h2>
          <div className="props-table-wrap" style={{ marginTop: 16 }}>
            <table className="props-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Crypto</th>
                  <th>Stocks</th>
                  <th>Forex</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="props-table__name">Trading hours</td>
                  <td>24/7</td>
                  <td>Market hours</td>
                  <td>24/5</td>
                </tr>
                <tr>
                  <td className="props-table__name">Price format</td>
                  <td>Variable decimals</td>
                  <td>2 decimals</td>
                  <td>4–5 decimals</td>
                </tr>
                <tr>
                  <td className="props-table__name">Volume unit</td>
                  <td>Base asset + USD</td>
                  <td>Shares + USD</td>
                  <td>Base currency</td>
                </tr>
                <tr>
                  <td className="props-table__name">Identifier</td>
                  <td>BTC/USDT</td>
                  <td>AAPL</td>
                  <td>EUR/USD</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h2 className="section-title" id="dos-donts-tr" style={{ marginTop: 32 }}>
            Do &amp; Don&apos;t
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
            {[
              {
                ok: true,
                title: 'Monospace numbers',
                cap: 'Use JetBrains Mono for all prices — digits stay aligned when values tick.',
              },
              {
                ok: true,
                title: 'Consistent color semantics',
                cap: 'Green = positive change, red = negative change, everywhere.',
              },
              {
                ok: true,
                title: 'Flash duration',
                cap: 'Use a ~300ms flash — noticeable but not anxiety-inducing.',
              },
            ].map((c) => (
              <div
                key={c.title}
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{c.title}</div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, margin: 0, lineHeight: 1.5 }}>{c.cap}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === 'Content' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title" id="num-format-tr">
            Number formatting
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>Crypto prices: variable decimals by magnitude — over $1,000: 2 decimals; $1–$1,000: 2–4; under $1: 4–8.</li>
            <li>Stock prices: always 2 decimals — $189.25</li>
            <li>Forex: 4–5 decimals — 1.08542</li>
            <li>Volume: abbreviate — $28.4B, $1.32T</li>
            <li>Percentages: 2 decimals with sign — +2.34%, -0.87%</li>
          </ul>
          <h2 className="section-title" id="labels-tr" style={{ marginTop: 28 }}>
            Labels and identifiers
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>Crypto: BTC/USDT — base/quote format</li>
            <li>Stocks: ticker only — AAPL, NVDA</li>
            <li>Forex: ISO 4217 pair — EUR/USD</li>
            <li>Never spell out &apos;Bitcoin&apos; in tight spaces — use BTC</li>
          </ul>
          <h2 className="section-title" id="change-period-tr" style={{ marginTop: 28 }}>
            Change period
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>Always label the period: 24h, 7d, MTD</li>
            <li>Never show a percentage without its period</li>
            <li>Default: 24h for crypto/forex; session for stocks</li>
          </ul>
        </section>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="types-tr" style={{ marginTop: 32, marginBottom: 24 }}>
            <h2 className="section-title">Shared types</h2>
            <CodeBlock
              language="tsx"
              code={`type AssetCategory = 'crypto' | 'stock' | 'forex'
type ChangeDirection = 'up' | 'down' | 'neutral'

interface PriceChange {
  value: number
  pct: number
  direction: ChangeDirection
}

interface MarketAsset {
  symbol: string
  name: string
  price: number
  change24h: PriceChange
  volume: string
  category: AssetCategory
}

interface OHLCCandle {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}`}
            />
          </section>
          <section id="props-ticker" style={{ marginBottom: 24 }}>
            <h2 className="section-title">PriceTicker props</h2>
            <PropsTable
              props={[
                { name: 'symbol', type: 'string', default: '—', description: 'Asset symbol (required)', required: true },
                { name: 'price', type: 'number', default: '—', description: 'Current price (required)', required: true },
                { name: 'change', type: 'PriceChange', default: '—', description: '24h change', required: true },
                { name: 'exchange', type: 'string', default: '—', description: 'Exchange label' },
                { name: 'volume', type: 'string', default: '—', description: '24h volume' },
                { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Ticker size' },
                { name: 'showVolume', type: 'boolean', default: 'false', description: 'Show volume row' },
                { name: 'onUpdate', type: '(price: number) => void', default: '—', description: 'Called on price update (flash)' },
              ]}
            />
          </section>
          <section id="props-candle" style={{ marginBottom: 24 }}>
            <h2 className="section-title">CandlestickChart props</h2>
            <PropsTable
              props={[
                { name: 'data', type: 'OHLCCandle[]', default: '—', description: 'OHLC data (required)', required: true },
                { name: 'symbol', type: 'string', default: '—', description: 'Trading pair label' },
                { name: 'timeframe', type: "'1H' | '4H' | '1D' | '1W' | '1M'", default: "'1D'", description: 'Active timeframe' },
                { name: 'onTimeframeChange', type: '(tf) => void', default: '—', description: 'Timeframe handler' },
                { name: 'showVolume', type: 'boolean', default: 'true', description: 'Volume bars' },
                { name: 'height', type: 'number', default: '400', description: 'Chart height (px)' },
              ]}
            />
          </section>
          <section id="props-book" style={{ marginBottom: 24 }}>
            <h2 className="section-title">OrderBook props</h2>
            <PropsTable
              props={[
                { name: 'asks', type: 'OrderBookLevel[]', default: '—', description: 'Ask levels (required)', required: true },
                { name: 'bids', type: 'OrderBookLevel[]', default: '—', description: 'Bid levels (required)', required: true },
                { name: 'lastPrice', type: 'number', default: '—', description: 'Last traded price', required: true },
                { name: 'spread', type: 'number', default: '—', description: 'Bid-ask spread', required: true },
                { name: 'depth', type: '10 | 20 | 50', default: '10', description: 'Visible levels' },
                { name: 'view', type: "'full' | 'bids' | 'asks'", default: "'full'", description: 'Display mode' },
                { name: 'onLevelClick', type: '(level, side) => void', default: '—', description: 'Row click handler' },
              ]}
            />
          </section>
          <section id="props-portfolio" style={{ marginBottom: 24 }}>
            <h2 className="section-title">PortfolioCard props</h2>
            <PropsTable
              props={[
                { name: 'totalValue', type: 'number', default: '—', description: 'Total USD value (required)', required: true },
                { name: 'change24h', type: 'PriceChange', default: '—', description: '24h change' },
                { name: 'change7d', type: 'PriceChange', default: '—', description: '7d change' },
                { name: 'holdings', type: 'Holding[]', default: '[]', description: 'Breakdown' },
                { name: 'sparklineData', type: 'number[]', default: '[]', description: '7-day history' },
                { name: 'showAllocation', type: 'boolean', default: 'true', description: 'Allocation bar' },
                { name: 'showHoldings', type: 'boolean', default: 'true', description: 'Holdings table' },
                { name: 'currency', type: "'USD' | 'BTC'", default: "'USD'", description: 'Display currency' },
              ]}
            />
          </section>
          <section id="props-market" style={{ marginBottom: 24 }}>
            <h2 className="section-title">MarketOverview props</h2>
            <PropsTable
              props={[
                { name: 'assets', type: 'MarketAsset[]', default: '—', description: 'Market rows (required)', required: true },
                { name: 'category', type: "'all' | 'crypto' | 'stock' | 'forex'", default: "'all'", description: 'Filter' },
                { name: 'onAssetClick', type: '(asset) => void', default: '—', description: 'Row click' },
                { name: 'searchable', type: 'boolean', default: 'true', description: 'Search input' },
                { name: 'sortable', type: 'boolean', default: 'true', description: 'Sortable columns' },
              ]}
            />
          </section>
          <section id="props-pair" style={{ marginBottom: 24 }}>
            <h2 className="section-title">TradingPair props</h2>
            <PropsTable
              props={[
                { name: 'base', type: 'string', default: '—', description: 'Base symbol (required)', required: true },
                { name: 'quote', type: 'string', default: '—', description: 'Quote asset (required)', required: true },
                { name: 'price', type: 'number', default: '—', description: 'Price (required)', required: true },
                { name: 'change24h', type: 'PriceChange', default: '—', description: '24h change' },
                { name: 'stats', type: 'TradingPairStats', default: '—', description: 'OHLCV stats' },
                { name: 'pairs', type: 'TradingPairOption[]', default: '[]', description: 'Selector list' },
                { name: 'onPairChange', type: '(base, quote) => void', default: '—', description: 'Pair change' },
                { name: 'showStats', type: 'boolean', default: 'true', description: 'Stats row' },
                { name: 'showActions', type: 'boolean', default: 'true', description: 'Watchlist + alerts' },
              ]}
            />
          </section>
          <section id="code-ex-tr" style={{ marginBottom: 24 }}>
            <h2 className="section-title">Examples</h2>
            <CodeBlock code={codeExamples} language="tsx" />
          </section>
          <Callout variant="info" title="Price flash implementation">
            Apply a CSS keyframe class for 300ms when price changes; use a ref to compare previous price for flash direction (green/red).
          </Callout>
          <Callout variant="warning" title="Financial data disclaimer">
            VDS trading components are UI primitives — integrate with exchange APIs or market data providers for production. Never ship mock data in real trading interfaces.
          </Callout>
        </>
      ) : null}

      {activeTab === 'Changelog' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title">Changelog</h2>
          <div style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: `1px solid ${t.border.default.default}`, alignItems: 'flex-start' }}>
            <span style={chipStyleB(t)}>v1.0.0</span>
            <span style={{ fontSize: 13, color: t.text.tertiary.default, width: 100, flexShrink: 0 }}>April 2026</span>
            <p style={{ fontSize: 13, color: t.text.secondary.default, flex: 1, margin: 0 }}>
              Initial release: PriceTicker (flash, 3 sizes), CandlestickChart (OHLC SVG candles, volume), OrderBook (depth bars, spread), PortfolioCard,
              PnLDisplay, MarketOverview (filters, sparklines), TradingPair (selector + stats). JetBrains Mono for numbers; green/red financial semantics.
            </p>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
