'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Info,
  Layers,
  MousePointer2,
  Palette,
  ShieldCheck,
  SunMedium,
  Zap,
} from 'lucide-react';
import { Callout } from '@/components/docs/Callout';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { buildTheme, type VDSTheme } from '@/lib/theme';

function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const [R, G, B] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function labelColorForBg(hex: string): string {
  return relativeLuminance(hex) > 0.4 ? '#0A0A0A' : '#FFFFFF';
}

/** Navy ramp — matches `color.primitive.brand.navy` in packages/tokens/src/tokens.json. */
const BRAND_SCALE: {
  hex: string;
  name: string;
  token?: string;
  isIdentity?: boolean;
}[] = [
  { hex: '#E6EDF2', name: 'navy/50' },
  { hex: '#C0D3E0', name: 'navy/100' },
  { hex: '#8BAFC6', name: 'navy/200' },
  { hex: '#5A8BAD', name: 'navy/300' },
  { hex: '#2E6A94', name: 'navy/400' },
  { hex: '#002b49', name: 'navy/500', token: 'identity / default', isIdentity: true },
  { hex: '#001e35', name: 'navy/600', token: 'hover (light)' },
  { hex: '#001528', name: 'navy/700', token: 'active (light)' },
  { hex: '#000D1A', name: 'navy/800' },
  { hex: '#00070D', name: 'navy/900' },
];

/** Neutral ramp — matches `color.primitive.neutral` in packages/tokens/src/tokens.json (plus named dark surfaces). */
const NEUTRAL_SCALE: { hex: string; name: string; token?: string }[] = [
  { hex: '#FFFFFF', name: 'neutral/0' },
  { hex: '#F8F9FC', name: 'neutral/50', token: 'bg-primary (light)' },
  { hex: '#F0F2F5', name: 'neutral/100', token: 'bg-tertiary (light)' },
  { hex: '#E5E8EF', name: 'neutral/200', token: 'border (light)' },
  { hex: '#C5CBDA', name: 'neutral/300' },
  { hex: '#9BA5BE', name: 'neutral/400', token: 'text-tertiary (light)' },
  { hex: '#6B7694', name: 'neutral/500' },
  { hex: '#4A5270', name: 'neutral/600', token: 'text-secondary (light)' },
  { hex: '#2E3550', name: 'neutral/700' },
  { hex: '#1A2030', name: 'neutral/800', token: 'bg-card (dark)' },
  { hex: '#161B27', name: 'neutral/850', token: 'bg-secondary (dark)' },
  { hex: '#0F1117', name: 'neutral/900', token: 'bg-primary (dark)' },
  { hex: '#070809', name: 'neutral/950' },
];

/** Legacy-friendly alias names — light/dark resolved values match semantic tokens in globals.css. */
const SEMANTIC_TOKEN_ROWS: { token: string; light: string; dark: string; usage: string }[] = [
  {
    token: '--color-brand',
    light: '#002b49',
    dark: '#1565A8',
    usage: 'Primary button fills',
  },
  {
    token: '--color-brand-text',
    light: '#002b49',
    dark: '#5B9FD4',
    usage: 'Brand text/icons on bg',
  },
  {
    token: '--color-brand-border',
    light: '#002b49',
    dark: '#3A85C0',
    usage: 'Brand borders/outlines',
  },
  {
    token: '--color-brand-subtle',
    light: 'rgba(0,43,73,0.06)',
    dark: 'rgba(91,159,212,0.10)',
    usage: 'Tinted surfaces',
  },
  { token: '--color-bg-primary', light: '#FFFFFF', dark: '#0F1117', usage: 'Page background' },
  {
    token: '--color-bg-secondary',
    light: '#F8F9FC',
    dark: '#161B27',
    usage: 'Card/panel background',
  },
  {
    token: '--color-bg-tertiary',
    light: '#F0F2F5',
    dark: '#1E2435',
    usage: 'Input/chip background',
  },
  {
    token: '--color-text-primary',
    light: '#0A0F1E',
    dark: 'rgba(255,255,255,0.92)',
    usage: 'Body text',
  },
  {
    token: '--color-text-secondary',
    light: '#4A5270',
    dark: 'rgba(255,255,255,0.55)',
    usage: 'Descriptions',
  },
  {
    token: '--color-text-tertiary',
    light: '#9BA5BE',
    dark: 'rgba(255,255,255,0.30)',
    usage: 'Captions/labels',
  },
  {
    token: '--color-border',
    light: '#E5E8EF',
    dark: 'rgba(255,255,255,0.07)',
    usage: 'Default borders',
  },
  {
    token: '--color-border-strong',
    light: '#C5CBDA',
    dark: 'rgba(255,255,255,0.14)',
    usage: 'Emphasized borders',
  },
  { token: '--color-success', light: '#0A8853', dark: '#34C77B', usage: 'Success states' },
  { token: '--color-danger', light: '#C8102E', dark: '#FF4D6A', usage: 'Destructive actions' },
  { token: '--color-warning', light: '#F07332', dark: '#FFB547', usage: 'Warning states' },
];

// DOCUMENTATION ONLY — these colors are shown as reference in the Colors page
// but are NOT part of the VDS token system. Do not use in components.
type ExtendedPaletteDocItem = {
  name: string;
  hex: string;
  textColor: string;
  height: number;
  token: string;
  usage: string;
};

const EXTENDED_PALETTE_REFERENCE: {
  gridCols: 2 | 3;
  marginTop: number;
  items: ExtendedPaletteDocItem[];
}[] = [
  {
    gridCols: 2,
    marginTop: 20,
    items: [
      {
        name: 'FLAME',
        hex: '#F55B23',
        textColor: '#FFFFFF',
        height: 220,
        token: '--color-extended-flame',
        usage: 'Energy, CTAs in marketing, data series 1. Strava/dashboard orange.',
      },
      {
        name: 'ACID',
        hex: '#D4FF1A',
        textColor: '#141414',
        height: 220,
        token: '--color-extended-acid',
        usage: 'Highlights, badges, data series 2. Maximum attention. Dark text only.',
      },
    ],
  },
  {
    gridCols: 2,
    marginTop: 10,
    items: [
      {
        name: 'DEEP OCEAN',
        hex: '#0D1B2A',
        textColor: '#FFFFFF',
        height: 220,
        token: '--color-extended-deep-ocean',
        usage: 'Dark editorial backgrounds, dashboard bases, night hero sections.',
      },
      {
        name: 'VOLT',
        hex: '#00C164',
        textColor: '#0A0A0A',
        height: 220,
        token: '--color-extended-volt',
        usage: 'Growth metrics, success moments in marketing. More vivid than semantic green.',
      },
    ],
  },
  {
    gridCols: 2,
    marginTop: 10,
    items: [
      {
        name: 'ELECTRIC',
        hex: '#4545E8',
        textColor: '#FFFFFF',
        height: 160,
        token: '--color-extended-electric',
        usage: 'Analytics graphs, data series 3, AI/tech product moments.',
      },
      {
        name: 'VIOLET',
        hex: '#7B4FE8',
        textColor: '#FFFFFF',
        height: 160,
        token: '--color-extended-violet',
        usage: 'Creative accents, data series. Warmer and more purple than Electric.',
      },
    ],
  },
  {
    gridCols: 2,
    marginTop: 10,
    items: [
      {
        name: 'PULSE',
        hex: '#FF2D78',
        textColor: '#FFFFFF',
        height: 160,
        token: '--color-extended-pulse',
        usage: 'Marketing CTAs, data series 4. Bolder sibling of DS annotation color #E8186D.',
      },
      {
        name: 'SOLAR',
        hex: '#F5C800',
        textColor: '#141414',
        height: 160,
        token: '--color-extended-solar',
        usage: 'Warm highlights, data labels. Golden — warmer than Acid lime.',
      },
    ],
  },
  {
    gridCols: 3,
    marginTop: 10,
    items: [
      {
        name: 'SAGE',
        hex: '#6B7B52',
        textColor: '#FFFFFF',
        height: 120,
        token: '--color-extended-sage',
        usage: 'Nature, sustainability, data series 5.',
      },
      {
        name: 'CREAM',
        hex: '#F5F0E6',
        textColor: '#3A3530',
        height: 120,
        token: '--color-extended-cream',
        usage: 'Warm editorial surfaces, print-feel layouts.',
      },
      {
        name: 'INK',
        hex: '#141414',
        textColor: '#FFFFFF',
        height: 120,
        token: '--color-extended-ink',
        usage: 'Maximum contrast, editorial type, dark overlays.',
      },
    ],
  },
];

function vdsSuccessChipStyle(t: Pick<VDSTheme, 'bg' | 'text'>): CSSProperties {
  return {
    background: t.bg.fill.success.default,
    color: t.text.success.default,
    fontSize: 12,
    fontFamily: 'inherit',
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  };
}

type ScaleSwatchProps = {
  hex: string;
  name: string;
  token?: string;
  isIdentity?: boolean;
  copied: string | null;
  onCopy: (hex: string) => void;
};

function ScaleSwatch({ hex, name, token, isIdentity, copied, onCopy }: ScaleSwatchProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onCopy(hex)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCopy(hex);
        }
      }}
      style={{
        width: '100%',
        minWidth: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: '72px',
          flexShrink: 0,
          background: hex,
          position: 'relative',
        }}
      >
        {isIdentity ? (
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            identity
          </span>
        ) : null}
        {copied === hex ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={16} color="white" aria-hidden />
          </div>
        ) : null}
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          background: 'var(--color-bg-secondary)',
          padding: '8px',
          minHeight: '72px',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Copy
            size={10}
            strokeWidth={2}
            aria-hidden
            style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono), monospace',
              color: 'var(--color-text-tertiary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {hex}
          </span>
        </div>
        {token && token.trim() !== '' && (
          <span
            style={{
              fontSize: 9,
              color: 'var(--color-brand-text)',
              marginTop: 3,
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3,
            }}
          >
            {token}
          </span>
        )}
      </div>
    </div>
  );
}

type EdSwatchProps = {
  hex: string;
  name: string;
  token: string;
  usage: string;
  height: number;
  textColor: string;
  copied: string | null;
  onCopy: (hex: string) => void;
};

function EdSwatch({ hex, name, token, usage, height, textColor, copied, onCopy }: EdSwatchProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onCopy(hex)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCopy(hex);
        }
      }}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          height,
          background: hex,
          position: 'relative',
          padding: 16,
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: textColor }}>{name}</div>
          <div
            style={{
              fontSize: 12,
              fontFamily: 'var(--font-mono), monospace',
              color: textColor,
              opacity: 0.75,
              marginTop: 2,
            }}
          >
            {hex}
          </div>
          <div style={{ fontSize: 10, color: textColor, opacity: 0.55, marginTop: 1 }}>{token}</div>
        </div>
        {copied === hex ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={16} color="white" aria-hidden />
          </div>
        ) : null}
      </div>
      <div
        style={{
          background: 'var(--color-bg-secondary)',
          padding: '8px 12px',
          fontSize: 11,
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
        }}
      >
        {usage}
      </div>
    </div>
  );
}

type StatusSwatch = { hex: string; step: string };

function StatusGroup({
  title,
  icon,
  accentHex,
  swatches,
  onCopy,
}: {
  title: string;
  icon: ReactNode;
  accentHex: string;
  swatches: StatusSwatch[];
  onCopy: (hex: string) => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: accentHex, display: 'flex' }} aria-hidden>
          {icon}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {title}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          marginTop: 10,
        }}
      >
        {swatches.map(({ hex, step }) => {
          const fg = labelColorForBg(hex);
          return (
            <button
              key={hex}
              type="button"
              onClick={() => onCopy(hex)}
              style={{
                height: 40,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 10px',
                cursor: 'pointer',
                border: 'none',
                background: hex,
                color: fg,
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700 }}>{step}</span>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono), monospace' }}>{hex}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const tocItems = [
  { id: 'token-architecture', label: 'Token architecture' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'brand', label: 'Brand' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'status', label: 'Status' },
  { id: 'layering', label: 'Layering model' },
  { id: 'roles', label: 'Color roles' },
  { id: 'interaction-states', label: 'Interaction states' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'usage', label: 'Usage' },
  { id: 'extended', label: 'Extended palette' },
  { id: 'tokens', label: 'Semantic tokens' },
];

export default function ColorsFoundationsPage() {
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  }

  const t = buildTheme(isDark);

  const dottedBg: CSSProperties = {
    backgroundColor: t.bg.surface.primary.default,
    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
  };

  const sectionLead: CSSProperties = {
    fontSize: 17,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
    maxWidth: 640,
    marginBottom: 24,
  };

  const sectionHeadingStyle: CSSProperties = { marginBottom: 8 };

  const scaleSwatchGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
    gap: 8,
    width: '100%',
    alignItems: 'stretch',
  };

  const LAYER_DIMS = {
    outerPadding: '28px 24px',
    layer1Padding: '20px',
    layer1Radius: 12,
    layer2Margin: '16px',
    layer2Padding: '16px',
    layer2Radius: 10,
    layer3Margin: '12px',
    layer3Padding: '14px',
    layer3Radius: 8,
    cardPadding: '12px 14px',
    cardRadius: 6,
    labelFontSize: '10px',
    labelFontWeight: 700,
    labelFontFamily: 'monospace',
    minHeight: '400px',
  } as const;

  const layeringLabelStyle = (labelColor: string): CSSProperties => ({
    fontSize: LAYER_DIMS.labelFontSize,
    fontWeight: LAYER_DIMS.labelFontWeight,
    fontFamily: `var(--font-mono), ${LAYER_DIMS.labelFontFamily}`,
    color: labelColor,
  });

  const layeringDiagrams = [
    {
      caption: 'Light mode',
      colors: {
        outerBg: '#FFFFFF',
        outerBgImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
        outerBorder: '1px solid #E5E8EF',
        layer1Bg: '#FFFFFF',
        layer1Border: '1px solid #E5E8EF',
        layer2Bg: '#F8F9FC',
        layer2Border: '1px solid #E5E8EF',
        layer3Bg: '#F0F2F5',
        layer3Border: '1px solid #E5E8EF',
        cardBg: '#FFFFFF',
        cardBorder: '1px solid #E5E8EF',
        labelColor: '#9BA5BE',
        cardTitle: '#0A0F1E',
        cardSubtitle: '#9BA5BE',
      },
      hexLabels: {
        primary: 'bg-primary · #FFFFFF',
        secondary: 'bg-secondary · #F8F9FC',
        tertiary: 'bg-tertiary · #F0F2F5',
      },
    },
    {
      caption: 'Dark mode',
      colors: {
        outerBg: '#0F1117',
        outerBgImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
        outerBorder: '1px solid rgba(255,255,255,0.08)',
        layer1Bg: '#0F1117',
        layer1Border: '1px solid rgba(255,255,255,0.12)',
        layer2Bg: '#161B27',
        layer2Border: '1px solid rgba(255,255,255,0.10)',
        layer3Bg: '#1E2435',
        layer3Border: '1px solid rgba(255,255,255,0.10)',
        cardBg: '#242B3D',
        cardBorder: '1px solid rgba(255,255,255,0.12)',
        labelColor: 'rgba(255,255,255,0.35)',
        cardTitle: 'rgba(255,255,255,0.88)',
        cardSubtitle: 'rgba(255,255,255,0.40)',
      },
      hexLabels: {
        primary: 'bg-primary · #0F1117',
        secondary: 'bg-secondary · #161B27',
        tertiary: 'bg-tertiary · #1E2435',
      },
    },
  ] as const;

  return (
    <>
      <p className="breadcrumb">Foundations</p>
      <h1 className="page-title">Color</h1>
      <p className="page-lead">
        VDS uses a purposeful color system — a restrained primary palette for UI clarity, and an
        editorial extended palette for expressive data, marketing, and product moments. Every color has
        a job.
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <span
          style={{
            background: 'rgba(10,136,83,0.10)',
            color: '#0A8853',
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 6,
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Stable
        </span>
        <span
          style={{
            background: 'rgba(10,136,83,0.10)',
            color: '#0A8853',
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 6,
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          v1.0
        </span>
      </div>

      <section id="token-architecture" style={{ marginTop: 40, marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Token architecture
        </h2>
        <p style={sectionLead}>
          Every VDS color token follows a five-level naming convention. Each segment narrows the
          token&apos;s meaning — from what it styles, to how it behaves, to when it activates. This makes
          every token self-documenting and machine-readable.
        </p>

        {/* Block 1 — Token anatomy */}
        <div
          style={{
            background: t.bg.surface.secondary.default,
            borderRadius: 14,
            border: `1px solid ${t.border.default.default}`,
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {(
              [
                { label: 'color', style: { background: 'rgba(0,43,73,0.06)', color: t.text.brand.default } },
                { label: 'bg', style: { background: 'rgba(0,43,73,0.10)', color: t.text.brand.default } },
                { label: 'fill', style: { background: 'rgba(0,43,73,0.10)', color: t.text.brand.default } },
                { label: 'primary', style: { background: 'rgba(0,43,73,0.10)', color: t.text.brand.default } },
                { label: 'hover', style: { background: 'rgba(10,136,83,0.10)', color: '#0A8853' } },
              ] as const
            ).map((seg, i, arr) => (
              <span key={seg.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'var(--font-mono), monospace',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    ...seg.style,
                  }}
                >
                  {seg.label}
                </span>
                {i < arr.length - 1 ? (
                  <span
                    style={{
                      fontSize: 20,
                      color: t.text.tertiary.default,
                      fontWeight: 300,
                      margin: '0 2px',
                    }}
                  >
                    .
                  </span>
                ) : null}
              </span>
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 8,
              width: '100%',
              maxWidth: 700,
            }}
          >
            {(
              [
                { level: 'Namespace', desc: 'Always color. Reserved prefix.' },
                { level: 'Element', desc: 'What it styles. bg · text · border · icon' },
                { level: 'Subtype', desc: "How it's used. surface · fill" },
                { level: 'Priority', desc: 'Importance level. primary · secondary · tertiary' },
                { level: 'State', desc: 'When active. default · hover · active · disabled · focus' },
              ] as const
            ).map((row) => (
              <div
                key={row.level}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: t.text.tertiary.default,
                  }}
                >
                  {row.level}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: t.text.secondary.default,
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  {row.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Block 2 — Live examples */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {(
            [
              {
                light: '#FFFFFF',
                dark: '#0F1117',
                token: 'color.bg.surface.primary.default',
                desc: 'Base page and card background. The foundation layer.',
              },
              {
                light: '#001e35',
                dark: '#3A85C0',
                token: 'color.bg.fill.primary.hover',
                desc: 'Button background on cursor hover. Communicates interactivity.',
              },
              {
                light: '#9BA5BE',
                dark: 'rgba(255,255,255,0.25)',
                token: 'color.text.secondary.disabled',
                desc: 'Muted text in disabled state. Never the only indicator.',
              },
              {
                light: '#002b49',
                dark: '#3A85C0',
                token: 'color.border.brand.focus',
                desc: 'Focus ring on brand elements. 3px, 3px offset.',
              },
            ] as const
          ).map((row) => (
            <div
              key={row.token}
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 10,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: `1px solid ${t.border.default.default}`,
                  flexShrink: 0,
                  background: isDark ? row.dark : row.light,
                }}
                aria-hidden
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.text.brand.default,
                  flex: 1,
                }}
              >
                {row.token}
              </span>
              <span style={{ fontSize: 13, color: t.text.secondary.default, flex: 2 }}>{row.desc}</span>
            </div>
          ))}
        </div>

        {/* Block 3 — Elements */}
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: t.text.primary.default,
            marginBottom: 8,
          }}
        >
          Elements
        </h3>
        <p style={{ ...sectionLead, marginBottom: 16 }}>
          Four elements cover every surface a color can touch in a UI.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 32,
          }}
        >
          {(
            [
              {
                el: 'bg',
                lines: [
                  'surface.primary',
                  'surface.secondary',
                  'surface.tertiary',
                  'surface.inverse',
                  'fill.primary',
                  'fill.secondary',
                  'fill.brandSubtle',
                  'fill.success',
                  'fill.danger',
                  'fill.warning',
                ],
              },
              {
                el: 'text',
                lines: [
                  'primary',
                  'secondary',
                  'tertiary',
                  'inverse',
                  'brand',
                  'success',
                  'danger',
                  'warning',
                ],
              },
              {
                el: 'border',
                lines: ['default', 'strong', 'brand', 'success', 'danger', 'warning'],
              },
              {
                el: 'icon',
                lines: [
                  'primary',
                  'secondary',
                  'tertiary',
                  'inverse',
                  'brand',
                  'success',
                  'danger',
                  'warning',
                ],
              },
            ] as const
          ).map((card) => (
            <div
              key={card.el}
              style={{
                background: t.bg.surface.secondary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: 13,
                  fontWeight: 700,
                  color: t.text.brand.default,
                  background: t.bg.fill.brandSubtle.default,
                  padding: '4px 10px',
                  borderRadius: 6,
                  width: 'fit-content',
                }}
              >
                {card.el}
              </span>
              <div style={{ fontSize: 12, color: t.text.secondary.default, fontFamily: 'var(--font-mono), monospace', lineHeight: 1.8 }}>
                {card.lines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Block 4 — States */}
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: t.text.primary.default,
            marginBottom: 8,
          }}
        >
          States
        </h3>
        <p style={{ ...sectionLead, marginBottom: 16 }}>
          Every interactive token exists in at least two states: default and one interaction state.
          Non-interactive tokens only have default.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {(
            [
              {
                name: 'default',
                bg: t.bg.surface.tertiary.default,
                color: t.text.secondary.default,
                desc: 'Resting. Always defined.',
              },
              {
                name: 'hover',
                bg: 'rgba(0,43,73,0.08)',
                color: t.text.brand.default,
                desc: 'Cursor over element.',
              },
              {
                name: 'active',
                bg: 'rgba(0,43,73,0.14)',
                color: t.text.brand.default,
                desc: 'Press/click down.',
              },
              {
                name: 'disabled',
                bg: t.bg.surface.secondary.default,
                color: t.text.tertiary.default,
                desc: 'Not interactive.',
              },
              {
                name: 'focus',
                bg: 'rgba(0,43,73,0.08)',
                color: t.text.brand.default,
                desc: 'Keyboard focus.',
              },
            ] as const
          ).map((st) => (
            <div
              key={st.name}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                background: st.bg,
                boxShadow:
                  st.name === 'focus' ? `0 0 0 2px ${t.border.brand.focus}` : 'none',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono), monospace', color: st.color }}>
                {st.name}
              </span>
              <span style={{ fontSize: 11, opacity: 0.8, color: st.color }}>{st.desc}</span>
            </div>
          ))}
        </div>

        <Callout variant="tip" title="Designed for AI">
          The five-level hierarchy is a machine-readable contract. Every token maps deterministically to a
          Figma variable, a CSS custom property (--color-bg-fill-primary-hover), and a TypeScript path in
          buildTheme(). When the MCP agent reads a component, it knows exactly what each color means — no
          ambiguity, no guessing.
        </Callout>
      </section>

      <section id="philosophy" style={{ marginTop: 40, marginBottom: 64 }}>
        <div className="cards-grid-3">
          <div className="info-card">
            <div className="principle-icon" aria-hidden>
              <Layers size={20} strokeWidth={1.5} color="var(--color-brand)" />
            </div>
            <div className="info-card-title">Purposeful restraint</div>
            <p className="info-card-body">
              The UI palette stays minimal. Fewer colors means faster decisions. Reserve bold color for
              moments that earn it.
            </p>
          </div>
          <div className="info-card">
            <div className="principle-icon" aria-hidden>
              <SunMedium size={20} strokeWidth={1.5} color="var(--color-brand)" />
            </div>
            <div className="info-card-title">Dual expression</div>
            <p className="info-card-body">
              Every color has a light and dark mode value. Contrast is mathematically verified — minimum
              4.5:1, target 7:1 for all text.
            </p>
          </div>
          <div className="info-card">
            <div className="principle-icon" aria-hidden>
              <Palette size={20} strokeWidth={1.5} color="var(--color-brand)" />
            </div>
            <div className="info-card-title">Editorial range</div>
            <p className="info-card-body">
              The extended palette is bold by design. Use it for data visualization, illustrations,
              marketing, and branded product moments.
            </p>
          </div>
        </div>
      </section>

      <section id="brand" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Brand
        </h2>
        <p style={sectionLead}>
          The primary brand color and its full scale. #002b49 is the identity anchor — logos, hero fills,
          and primary actions in light mode. In dark mode, the scale shifts lighter to maintain contrast.
        </p>
        <div style={scaleSwatchGridStyle}>
          {BRAND_SCALE.map((s) => (
            <ScaleSwatch
              key={s.name}
              hex={s.hex}
              name={s.name}
              token={s.token}
              isIdentity={s.isIdentity}
              copied={copied}
              onCopy={copyHex}
            />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 20px',
            marginTop: 14,
          }}
        >
          {[
            { dot: '#5B9FD4', label: 'blue/300 — brand text (dark mode)' },
            { dot: '#3A85C0', label: 'blue/400 — brand border (dark mode)' },
            { dot: '#1565A8', label: 'blue/500 — brand fill (dark mode)' },
            { dot: '#002b49', label: 'navy/500 — brand identity (light mode)' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: item.dot,
                  flexShrink: 0,
                }}
                aria-hidden
              />
              <span>★ {item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="neutral" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Neutral
        </h2>
        <p style={sectionLead}>
          The backbone of every layout. Backgrounds, surfaces, borders, and text all live here. Thirteen
          steps from white to near-black.
        </p>
        <div style={scaleSwatchGridStyle}>
          {NEUTRAL_SCALE.map((s) => (
            <ScaleSwatch
              key={s.name}
              hex={s.hex}
              name={s.name}
              token={s.token}
              copied={copied}
              onCopy={copyHex}
            />
          ))}
        </div>
      </section>

      <section id="status" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Status
        </h2>
        <p style={sectionLead}>
          Semantic colors with a clear job. Never use for decoration — they carry functional meaning users
          have learned to trust.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16,
          }}
        >
          <StatusGroup
            title="Success"
            accentHex="#0A8853"
            icon={<CheckCircle2 size={16} strokeWidth={2} />}
            swatches={[
              { hex: '#E6F5EE', step: '50' },
              { hex: '#80CCAA', step: '200' },
              { hex: '#0A8853', step: '400 ★' },
              { hex: '#086B42', step: '500' },
              { hex: '#044228', step: '700' },
            ]}
            onCopy={copyHex}
          />
          <StatusGroup
            title="Danger"
            accentHex="#C8102E"
            icon={<AlertCircle size={16} strokeWidth={2} />}
            swatches={[
              { hex: '#FCEAEC', step: '50' },
              { hex: '#F0959E', step: '200' },
              { hex: '#C8102E', step: '400 ★' },
              { hex: '#A10D25', step: '500' },
              { hex: '#640817', step: '700' },
            ]}
            onCopy={copyHex}
          />
          <StatusGroup
            title="Warning"
            accentHex="#F07332"
            icon={<AlertTriangle size={16} strokeWidth={2} />}
            swatches={[
              { hex: '#FEF2EB', step: '50' },
              { hex: '#F9B484', step: '200' },
              { hex: '#F07332', step: '400 ★' },
              { hex: '#C05C28', step: '500' },
              { hex: '#7A3A19', step: '700' },
            ]}
            onCopy={copyHex}
          />
          <StatusGroup
            title="Info"
            accentHex="#1E72B3"
            icon={<Info size={16} strokeWidth={2} />}
            swatches={[
              { hex: '#EBF3FB', step: '50' },
              { hex: '#97C3E8', step: '200' },
              { hex: '#1E72B3', step: '400 ★' },
              { hex: '#1565A8', step: '500' },
              { hex: '#0D3F6B', step: '700' },
            ]}
            onCopy={copyHex}
          />
        </div>
      </section>

      <section id="layering" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Layering model
        </h2>
        <p style={sectionLead}>
          VDS surfaces stack using three background levels. Each level is one step lighter in light mode
          and one step lighter in dark mode — creating depth without using shadows alone.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            alignItems: 'start',
          }}
        >
          {layeringDiagrams.map(({ caption, colors, hexLabels }) => (
            <div key={caption}>
              <div
                style={{
                  backgroundColor: colors.outerBg,
                  backgroundImage: colors.outerBgImage,
                  backgroundSize: '20px 20px',
                  border: colors.outerBorder,
                  borderRadius: '14px',
                  width: '100%',
                  minHeight: LAYER_DIMS.minHeight,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  opacity: 1,
                  padding: LAYER_DIMS.outerPadding,
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      background: colors.layer1Bg,
                      border: colors.layer1Border,
                      borderRadius: LAYER_DIMS.layer1Radius,
                      padding: LAYER_DIMS.layer1Padding,
                      position: 'relative',
                    }}
                  >
                    <span style={layeringLabelStyle(colors.labelColor)}>{hexLabels.primary}</span>
                    <div
                      style={{
                        margin: LAYER_DIMS.layer2Margin,
                        background: colors.layer2Bg,
                        border: colors.layer2Border,
                        borderRadius: LAYER_DIMS.layer2Radius,
                        padding: LAYER_DIMS.layer2Padding,
                        position: 'relative',
                      }}
                    >
                      <span style={layeringLabelStyle(colors.labelColor)}>{hexLabels.secondary}</span>
                      <div
                        style={{
                          margin: LAYER_DIMS.layer3Margin,
                          background: colors.layer3Bg,
                          border: colors.layer3Border,
                          borderRadius: LAYER_DIMS.layer3Radius,
                          padding: LAYER_DIMS.layer3Padding,
                          position: 'relative',
                        }}
                      >
                        <span style={layeringLabelStyle(colors.labelColor)}>{hexLabels.tertiary}</span>
                        <div
                          style={{
                            marginTop: LAYER_DIMS.layer3Margin,
                            background: colors.cardBg,
                            borderRadius: LAYER_DIMS.cardRadius,
                            padding: LAYER_DIMS.cardPadding,
                            border: colors.cardBorder,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: colors.cardTitle,
                            }}
                          >
                            Card surface
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: colors.cardSubtitle,
                              marginTop: 4,
                            }}
                          >
                            Elevated back to bg-primary
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  textAlign: 'center',
                  marginTop: '12px',
                  color: '#9BA5BE',
                }}
              >
                {caption}
              </div>
            </div>
          ))}
        </div>
        <Callout variant="info" title="The rule">
          Always use bg-secondary or bg-tertiary for cards and panels — never create a new color. The
          layering model ensures visual hierarchy is automatic and consistent.
        </Callout>
      </section>

      <section id="roles" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Color roles
        </h2>
        <p style={sectionLead}>
          Every surface color has a paired &apos;on&apos; color — the color used for text and icons placed
          ON that surface. This pairing guarantees contrast is always correct by design, not by accident.
        </p>
        <p style={{ ...sectionLead, marginBottom: 20 }}>
          Inspired by Material Design 3&apos;s role system and Carbon&apos;s token groups, VDS defines
          explicit pairs for every semantic surface.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {(
            [
              {
                surfaceTop: isDark ? '#1565A8' : '#002b49',
                textOnTop: '#FFFFFF',
                surfaceToken: '--color-brand',
                onToken: '--color-text-inverse',
                contrast: '5.6:1 ✓ AA',
                badgeLight: false,
              },
              {
                surfaceTop: isDark ? 'rgba(91,159,212,0.10)' : 'rgba(0,43,73,0.06)',
                textOnTop: isDark ? '#5B9FD4' : '#002b49',
                surfaceToken: '--color-brand-subtle',
                onToken: '--color-brand-text',
                contrast: '7.4:1 ✓ AAA',
                badgeLight: true,
              },
              {
                surfaceTop: isDark ? '#0F1117' : '#FFFFFF',
                textOnTop: isDark ? 'rgba(255,255,255,0.92)' : '#0A0F1E',
                surfaceToken: '--color-bg-primary',
                onToken: '--color-text-primary',
                contrast: '~15:1 ✓ AAA',
                badgeLight: true,
              },
              {
                surfaceTop: isDark ? '#161B27' : '#F8F9FC',
                textOnTop: isDark ? 'rgba(255,255,255,0.92)' : '#0A0F1E',
                surfaceToken: '--color-bg-secondary',
                onToken: '--color-text-primary',
                contrast: '~13:1 ✓ AAA',
                badgeLight: true,
              },
              {
                surfaceTop: '#0A8853',
                textOnTop: '#FFFFFF',
                surfaceToken: '--color-success',
                onToken: '#FFFFFF',
                contrast: '5.2:1 ✓ AA',
                badgeLight: false,
              },
              {
                surfaceTop: isDark ? 'rgba(52,199,123,0.12)' : '#E6F5EE',
                textOnTop: isDark ? '#34C77B' : '#0A8853',
                surfaceToken: '--color-success-subtle',
                onToken: '--color-success',
                contrast: '4.8:1 ✓ AA',
                badgeLight: true,
              },
              {
                surfaceTop: '#C8102E',
                textOnTop: '#FFFFFF',
                surfaceToken: '--color-danger',
                onToken: '#FFFFFF',
                contrast: '5.5:1 ✓ AA',
                badgeLight: false,
              },
              {
                surfaceTop: isDark ? 'rgba(200,16,46,0.15)' : 'rgba(200,16,46,0.08)',
                textOnTop: isDark ? '#FF4D6A' : '#C8102E',
                surfaceToken: '--color-danger-subtle',
                onToken: '--color-danger',
                contrast: '4.8:1 ✓ AA',
                badgeLight: true,
              },
            ] as const
          ).map((pair, i) => (
            <div
              key={i}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                cursor: 'default',
              }}
            >
              <div
                style={{
                  height: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '0 16px',
                  gap: 4,
                  background: pair.surfaceTop,
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: pair.textOnTop }}>on-color text</span>
                <span style={{ fontSize: 11, color: pair.textOnTop, opacity: 0.7 }}>
                  Icons & labels
                </span>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    background: pair.badgeLight ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.2)',
                    color: pair.badgeLight ? 'rgba(0,0,0,0.6)' : '#FFFFFF',
                    fontSize: 9,
                    fontWeight: 700,
                    borderRadius: 4,
                    padding: '2px 6px',
                  }}
                >
                  {pair.contrast}
                </span>
              </div>
              <div
                style={{
                  background: 'var(--color-bg-secondary)',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: 'var(--color-text-tertiary)',
                    }}
                  >
                    Surface
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono), monospace',
                      color: 'var(--color-text-secondary)',
                      marginTop: 2,
                      wordBreak: 'break-word',
                    }}
                  >
                    {pair.surfaceToken}
                  </div>
                </div>
                <div
                  style={{
                    width: 1,
                    alignSelf: 'stretch',
                    background: 'var(--color-border)',
                    flexShrink: 0,
                  }}
                  aria-hidden
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: 'var(--color-text-tertiary)',
                    }}
                  >
                    On surface
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono), monospace',
                      color: 'var(--color-text-secondary)',
                      marginTop: 2,
                      wordBreak: 'break-word',
                    }}
                  >
                    {pair.onToken}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="interaction-states" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Interaction states
        </h2>
        <p style={sectionLead}>
          Color communicates interactivity. Each state uses a predictable, systematic color shift — never
          arbitrary.
        </p>
        <div className="props-table-wrap">
          <table className="props-table">
            <thead>
              <tr>
                <th>State</th>
                <th>Color rule</th>
                <th>Light value</th>
                <th>Dark value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Default</td>
                <td>Base surface or brand color</td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>
                    --color-brand: #002b49
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>#1565A8</span>
                </td>
              </tr>
              <tr>
                <td>Hover</td>
                <td>+10% white overlay on brand</td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>#001e35</span>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>#3A85C0</span>
                </td>
              </tr>
              <tr>
                <td>Focus</td>
                <td>Base + 3px ring, accent color</td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>
                    ring: #5B9FD4 offset 2px
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>
                    ring: #3A85C0
                  </span>
                </td>
              </tr>
              <tr>
                <td>Pressed</td>
                <td>+20% black overlay</td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>#001e35</span>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>#0F4F85</span>
                </td>
              </tr>
              <tr>
                <td>Disabled</td>
                <td>Neutral surface, muted text</td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>
                    bg: #F0F2F5, text: #9BA5BE
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>
                    bg: #1E2435, text: rgba(255,255,255,0.25)
                  </span>
                </td>
              </tr>
              <tr>
                <td>Loading</td>
                <td>Base color preserved, spinner</td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>
                    spinner: white on brand
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>
                    spinner: white on #1565A8
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          style={{
            ...dottedBg,
            borderRadius: 14,
            border: `1px solid ${t.border.default.default}`,
            padding: '32px 24px',
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {(
              [
                {
                  key: 'default',
                  label: 'Default',
                  btn: { background: t.bg.fill.primary.default, color: '#FFFFFF', outline: 'none' },
                },
                {
                  key: 'hover',
                  label: 'Hover',
                  btn: {
                    background: t.bg.fill.primary.hover,
                    color: '#FFFFFF',
                    outline: 'none',
                    cursor: 'pointer',
                  },
                  hoverIcon: true,
                },
                {
                  key: 'focus',
                  label: 'Focus',
                  btn: {
                    background: t.bg.fill.primary.default,
                    color: '#FFFFFF',
                    outline: `3px solid ${t.border.brand.default}`,
                    outlineOffset: 3,
                  },
                },
                {
                  key: 'pressed',
                  label: 'Pressed',
                  btn: {
                    background: isDark ? '#0F5A9A' : '#001e35',
                    color: '#FFFFFF',
                    outline: 'none',
                  },
                },
                {
                  key: 'disabled',
                  label: 'Disabled',
                  btn: {
                    background: isDark ? '#1E2435' : '#F0F2F5',
                    color: isDark ? 'rgba(255,255,255,0.25)' : '#9BA5BE',
                    outline: 'none',
                    cursor: 'not-allowed',
                  },
                },
                {
                  key: 'loading',
                  label: 'Loading',
                  btn: {
                    background: t.bg.fill.primary.default,
                    color: 'transparent',
                    outline: 'none',
                  },
                  loading: true,
                },
              ] as const
            ).map((item) => (
              <div
                key={item.key}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}
              >
                <button
                  type="button"
                  disabled={item.key === 'disabled'}
                  style={{
                    height: 40,
                    padding: '0 20px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'inherit',
                    ...(item.key === 'pressed'
                      ? {
                          background: `radial-gradient(circle at center, rgba(255,255,255,0.12), transparent 60%), ${isDark ? '#0F5A9A' : '#001e35'}`,
                          color: '#FFFFFF',
                        }
                      : item.btn),
                  }}
                >
                  {item.key === 'loading' ? (
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,0.25)',
                        borderTopColor: '#FFFFFF',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                      aria-hidden
                    />
                  ) : (
                    item.label
                  )}
                  {'hoverIcon' in item && item.hoverIcon ? (
                    <MousePointer2
                      size={10}
                      color="#FFFFFF"
                      strokeWidth={2}
                      style={{ position: 'absolute', top: 4, right: 6, opacity: 0.6 }}
                      aria-hidden
                    />
                  ) : null}
                </button>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: t.text.tertiary.default,
                    marginTop: 8,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="accessibility" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Accessibility
        </h2>
        <p style={sectionLead}>
          Color is not decoration — it must work for everyone. VDS requires WCAG 2.1 AA compliance for all
          UI colors, and targets AAA for body text.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: t.shadow.card,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <Eye size={18} color={t.text.brand.default} strokeWidth={2} aria-hidden />
              <span style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>4.5:1 minimum</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  background: t.bg.surface.secondary.default,
                  borderRadius: '10px',
                  padding: '14px 16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <span style={vdsSuccessChipStyle(t)}>PASS</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono), monospace',
                      color: t.text.tertiary.default,
                    }}
                  >
                    #4A5270 on #FFFFFF
                  </span>
                </div>
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '7px',
                    padding: '10px 14px',
                    border: `1px solid ${t.border.default.default}`,
                  }}
                >
                  <span style={{ fontSize: 14, color: '#4A5270', fontWeight: 500 }}>
                    The quick brown fox jumps
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                  }}
                >
                  <span style={{ fontSize: 11, color: t.text.tertiary.default }}>Contrast ratio:</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#0A8853',
                      fontFamily: 'var(--font-mono), monospace',
                    }}
                  >
                    4.7:1 ✓
                  </span>
                </div>
              </div>
              <div
                style={{
                  background: t.bg.surface.secondary.default,
                  borderRadius: '10px',
                  padding: '14px 16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <span
                    style={{
                      background: '#FCEAEC',
                      color: '#C8102E',
                      fontSize: 10,
                      fontWeight: 800,
                      borderRadius: '5px',
                      padding: '3px 8px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    FAIL
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono), monospace',
                      color: t.text.tertiary.default,
                    }}
                  >
                    #9BA5BE on #FFFFFF
                  </span>
                </div>
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '7px',
                    padding: '10px 14px',
                    border: `1px solid ${t.border.default.default}`,
                  }}
                >
                  <span style={{ fontSize: 14, color: '#9BA5BE', fontWeight: 500 }}>
                    The quick brown fox jumps
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                  }}
                >
                  <span style={{ fontSize: 11, color: t.text.tertiary.default }}>Contrast ratio:</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#C8102E',
                      fontFamily: 'var(--font-mono), monospace',
                    }}
                  >
                    2.8:1 ✗
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: t.shadow.card,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <BookOpen size={18} color={t.text.brand.default} strokeWidth={2} aria-hidden />
              <span style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>
                7:1 target for body
              </span>
            </div>
            <div style={{ marginTop: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  color: t.text.tertiary.default,
                  marginBottom: '12px',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                --color-text-primary on --color-bg-primary
              </div>
              <div
                style={{
                  background: t.bg.surface.secondary.default,
                  borderRadius: '10px',
                  padding: '16px',
                  border: `1px solid ${t.border.default.default}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      background: t.text.brand.default,
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: t.text.tertiary.default,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Body text sample
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: t.text.primary.default,
                    lineHeight: 1.6,
                    fontWeight: 400,
                  }}
                >
                  The quick brown fox jumps over the lazy dog.
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: t.text.secondary.default,
                    lineHeight: 1.5,
                    marginTop: '6px',
                  }}
                >
                  Secondary text is readable too.
                </div>
              </div>
              <div style={{ marginTop: '14px', display: 'inline-flex', ...vdsSuccessChipStyle(t) }}>
                <CheckCircle2 size={14} color={t.text.success.default} strokeWidth={2} aria-hidden />
                <span style={{ fontSize: 12, fontWeight: 600, color: t.text.success.default }}>~15:1 AAA certified</span>
              </div>
            </div>
          </div>
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: t.shadow.card,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <ShieldCheck size={18} color={t.text.brand.default} strokeWidth={2} aria-hidden />
              <span style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>
                Color + shape + text
              </span>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#C8102E',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Color only
              </div>
              <div
                style={{
                  background: t.bg.surface.secondary.default,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: '1px solid #FCEAEC',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      background: '#C8102E',
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                  <span style={{ fontSize: 13, color: t.text.primary.default }}>Error</span>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      background: '#0A8853',
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                  <span style={{ fontSize: 13, color: t.text.primary.default }}>Success</span>
                </div>
                <p style={{ fontSize: 11, color: t.text.tertiary.default, lineHeight: 1.5, marginTop: '8px', marginBottom: 0 }}>
                  Color-blind users cannot distinguish these.
                </p>
              </div>
              <div style={{ borderTop: `1px solid ${t.border.default.default}`, margin: '16px 0' }} />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#0A8853',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Color + icon + text
              </div>
              <div
                style={{
                  background: t.bg.surface.secondary.default,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: '1px solid #80CCAA',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle
                      size={16}
                      color="#C8102E"
                      strokeWidth={2}
                      fill="none"
                      aria-hidden
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#C8102E' }}>
                      Error: invalid email
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#0A8853" strokeWidth={2} aria-hidden />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0A8853' }}>
                      Success: changes saved
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: t.text.tertiary.default, marginTop: '8px', marginBottom: 0 }}>
                  Icon + color + text — works for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Callout variant="warning" title="Test in both modes">
          A color that passes contrast in light mode may fail in dark mode. Always verify contrast ratios
          for both themes. VDS dark mode brand text (#5B9FD4) achieves 7.4:1 on dark backgrounds — AAA
          certified.
        </Callout>
      </section>

      <section id="usage" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Usage
        </h2>
        <p style={sectionLead}>
          Color has rules. These are the most common mistakes — and how to avoid them.
        </p>

        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: t.text.secondary.default,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 12,
          }}
        >
          Don&apos;t use extended colors in UI
        </div>
        <div className="do-dont-grid">
          <div>
            <div className="do-card" style={{ padding: '24px 20px' }}>
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: t.shadow.card,
                }}
              >
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: t.text.primary.default,
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <div
                  style={{
                    background: t.bg.surface.tertiary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 8,
                    height: 36,
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 13,
                    color: t.text.secondary.default,
                  }}
                >
                  you@example.com
                </div>
                <button
                  type="button"
                  style={{
                    marginTop: 12,
                    width: '100%',
                    height: 40,
                    borderRadius: 8,
                    border: 'none',
                    background: t.bg.fill.primary.default,
                    color: t.text.inverse.default,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'default',
                    fontFamily: 'inherit',
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>
            <div className="do-label">✓ Do</div>
            <p className="guidelines-caption">
              Brand color for actions only. UI stays calm and intentional.
            </p>
          </div>
          <div>
            <div className="dont-card" style={{ padding: '24px 20px' }}>
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: t.shadow.card,
                }}
              >
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#FF2D78',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <div
                  style={{
                    background: t.bg.surface.tertiary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 8,
                    height: 36,
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 13,
                    color: t.text.secondary.default,
                  }}
                >
                  you@example.com
                </div>
                <button
                  type="button"
                  style={{
                    marginTop: 12,
                    width: '100%',
                    height: 40,
                    borderRadius: 8,
                    border: 'none',
                    background: '#D4FF1A',
                    color: '#141414',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'default',
                    fontFamily: 'inherit',
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>
            <div className="dont-label">× Don&apos;t</div>
            <p className="guidelines-caption">
              Extended colors in everyday UI compete for attention. They lose their power.
            </p>
          </div>
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: t.text.secondary.default,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 12,
            marginTop: 28,
          }}
        >
          Don&apos;t hardcode colors
        </div>
        <div className="do-dont-grid">
          <div>
            <div className="do-card" style={{ padding: '24px 20px' }}>
              <div
                style={{
                  background: isDark ? '#0F1117' : '#F8F9FC',
                  borderRadius: 10,
                  padding: 16,
                  border: `1px solid ${t.border.default.default}`,
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                <div style={{ fontSize: 12, lineHeight: 1.8, color: '#CBA6F7' }}>button {'{'}</div>
                <div style={{ fontSize: 12, lineHeight: 1.8, color: '#A6E3A1' }}>
                  &nbsp;&nbsp;background: var(--color-brand);
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.8, color: '#A6E3A1' }}>
                  &nbsp;&nbsp;color: var(--color-text-inverse);
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.8, color: '#CBA6F7' }}>{'}'}</div>
              </div>
            </div>
            <div className="do-label">✓ Do</div>
            <p className="guidelines-caption">CSS variables adapt to both themes automatically.</p>
          </div>
          <div>
            <div className="dont-card" style={{ padding: '24px 20px' }}>
              <div
                style={{
                  background: isDark ? '#0F1117' : '#F8F9FC',
                  borderRadius: 10,
                  padding: 16,
                  border: `1px solid ${t.border.default.default}`,
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                <div style={{ fontSize: 12, lineHeight: 1.8, color: '#CBA6F7' }}>button {'{'}</div>
                <div style={{ fontSize: 12, lineHeight: 1.8, color: '#F38BA8' }}>
                  &nbsp;&nbsp;background: #002b49; /* breaks in dark */
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.8, color: '#F38BA8' }}>
                  &nbsp;&nbsp;color: #ffffff;
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.8, color: '#585B70' }}>
                  &nbsp;&nbsp;/* what about dark mode? */
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.8, color: '#CBA6F7' }}>{'}'}</div>
              </div>
            </div>
            <div className="dont-label">× Don&apos;t</div>
            <p className="guidelines-caption">
              Hardcoded hex values break dark mode and create maintenance debt.
            </p>
          </div>
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: t.text.secondary.default,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 12,
            marginTop: 28,
          }}
        >
          Don&apos;t use status colors decoratively
        </div>
        <div className="do-dont-grid">
          <div>
            <div className="do-card" style={{ padding: '24px 20px' }}>
              <div
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: `1px solid ${t.border.default.default}`,
                  background: t.bg.surface.primary.default,
                }}
              >
                {(
                  [
                    { Icon: CheckCircle2, color: '#0A8853', text: 'Payment confirmed' },
                    { Icon: AlertCircle, color: '#C8102E', text: 'Card declined' },
                    { Icon: AlertTriangle, color: '#F07332', text: 'Expires soon' },
                  ] as const
                ).map((row, idx, arr) => (
                  <div
                    key={row.text}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderBottom: idx < arr.length - 1 ? `1px solid ${t.border.default.default}` : 'none',
                    }}
                  >
                    <row.Icon size={16} color={row.color} strokeWidth={2} aria-hidden />
                    <span style={{ fontSize: 13, fontWeight: 500, color: t.text.primary.default }}>{row.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="do-label">✓ Do</div>
            <p className="guidelines-caption">
              Status colors signal meaning — success, error, warning.
            </p>
          </div>
          <div>
            <div className="dont-card" style={{ padding: '24px 20px' }}>
              <div
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: `1px solid ${t.border.default.default}`,
                  background: t.bg.surface.primary.default,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderBottom: `1px solid ${t.border.default.default}`,
                  }}
                >
                  <span style={vdsSuccessChipStyle(t)}>New</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.text.primary.default }}>Dashboard</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderBottom: `1px solid ${t.border.default.default}`,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#C8102E' }}>Settings</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      background: '#FEF2EB',
                      color: '#F07332',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    Popular
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.text.primary.default }}>Card title</span>
                </div>
              </div>
            </div>
            <div className="dont-label">× Don&apos;t</div>
            <p className="guidelines-caption">
              Using status colors for decoration trains users to ignore them.
            </p>
          </div>
        </div>
      </section>

      <section id="extended" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Extended palette
        </h2>
        <p style={sectionLead}>
          Bold by design. These colors are not for everyday UI — they exist for data visualization,
          illustration, branded campaigns, and product moments that need to stop the scroll.
        </p>
        <Callout variant="tip" icon={<Zap size={20} />} title="Use sparingly">
          Extended colors work because they&apos;re rare. The moment they appear everywhere, they lose
          their power. One bold color per composition.
        </Callout>

        {EXTENDED_PALETTE_REFERENCE.map((row) => (
          <div
            key={row.items.map((i) => i.name).join('-')}
            style={{
              display: 'grid',
              gridTemplateColumns:
                row.gridCols === 3 ? '1fr 1fr 1fr' : '1fr 1fr',
              gap: 10,
              marginTop: row.marginTop,
            }}
          >
            {row.items.map((item) => (
              <EdSwatch
                key={item.name}
                name={item.name}
                hex={item.hex}
                textColor={item.textColor}
                height={item.height}
                token={item.token}
                usage={item.usage}
                copied={copied}
                onCopy={copyHex}
              />
            ))}
          </div>
        ))}
      </section>

      <section id="tokens" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Semantic tokens
        </h2>
        <p style={sectionLead}>
          These CSS custom properties are what you use in components. They point to palette values and
          automatically switch between light and dark.
        </p>
        <div className="props-table-wrap">
          <table className="props-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Light value</th>
                <th>Dark value</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {SEMANTIC_TOKEN_ROWS.map((row) => (
                <tr key={row.token}>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono), monospace',
                        fontWeight: 600,
                        fontSize: 12,
                        color: 'var(--color-brand-text)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {row.token}
                    </span>
                  </td>
                  <td
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: 11,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {row.light}
                  </td>
                  <td
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: 11,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {row.dark}
                  </td>
                  <td>{row.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {copied !== null ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: isDark ? '#5B9FD4' : '#002b49',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            zIndex: 999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {copied} copied
        </div>
      ) : null}

      <TableOfContents items={tocItems} />
    </>
  );
}
