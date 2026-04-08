'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Info,
  Layers,
  Palette,
  SunMedium,
  Zap,
} from 'lucide-react';
import { Callout } from '@/components/docs/Callout';
import { TableOfContents } from '@/components/docs/TableOfContents';

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

const BRAND_SCALE: {
  hex: string;
  name: string;
  token?: string;
  isIdentity?: boolean;
}[] = [
  { hex: '#EBF2F7', name: 'navy/50' },
  { hex: '#C8DBE9', name: 'navy/100' },
  { hex: '#97BCE0', name: 'navy/200' },
  { hex: '#5B9FD4', name: 'navy/300', token: 'brand-text-dark' },
  { hex: '#3A7DAE', name: 'navy/400', token: 'brand-border-dark' },
  { hex: '#1E5A8A', name: 'navy/500' },
  { hex: '#1565A8', name: 'navy/600', token: 'brand-dark' },
  { hex: '#003d69', name: 'navy/700', token: 'brand-hover' },
  { hex: '#002b49', name: 'navy/800', token: 'brand / identity', isIdentity: true },
  { hex: '#001A2E', name: 'navy/900' },
];

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
    dark: '#3A7DAE',
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
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'brand', label: 'Brand' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'status', label: 'Status' },
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
        <span className="page-badge">Stable</span>
        <span className="page-badge">v1.0</span>
      </div>

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
            { dot: '#5B9FD4', label: 'navy/300 — brand-text-dark (dark mode text/icons)' },
            { dot: '#3A7DAE', label: 'navy/400 — brand-border-dark (dark mode borders)' },
            { dot: '#1565A8', label: 'navy/600 — brand-dark (dark mode button fill)' },
            { dot: '#002b49', label: 'navy/800 — brand identity (light mode everything)' },
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 20,
          }}
        >
          <EdSwatch
            name="FLAME"
            hex="#F55B23"
            textColor="#FFFFFF"
            height={220}
            token="--color-extended-flame"
            usage="Energy, CTAs in marketing, data series 1. Strava/dashboard orange."
            copied={copied}
            onCopy={copyHex}
          />
          <EdSwatch
            name="ACID"
            hex="#D4FF1A"
            textColor="#141414"
            height={220}
            token="--color-extended-acid"
            usage="Highlights, badges, data series 2. Maximum attention. Dark text only."
            copied={copied}
            onCopy={copyHex}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 10,
          }}
        >
          <EdSwatch
            name="DEEP OCEAN"
            hex="#0D1B2A"
            textColor="#FFFFFF"
            height={220}
            token="--color-extended-deep-ocean"
            usage="Dark editorial backgrounds, dashboard bases, night hero sections."
            copied={copied}
            onCopy={copyHex}
          />
          <EdSwatch
            name="VOLT"
            hex="#00C164"
            textColor="#0A0A0A"
            height={220}
            token="--color-extended-volt"
            usage="Growth metrics, success moments in marketing. More vivid than semantic green."
            copied={copied}
            onCopy={copyHex}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 10,
          }}
        >
          <EdSwatch
            name="ELECTRIC"
            hex="#4545E8"
            textColor="#FFFFFF"
            height={160}
            token="--color-extended-electric"
            usage="Analytics graphs, data series 3, AI/tech product moments."
            copied={copied}
            onCopy={copyHex}
          />
          <EdSwatch
            name="VIOLET"
            hex="#7B4FE8"
            textColor="#FFFFFF"
            height={160}
            token="--color-extended-violet"
            usage="Creative accents, data series. Warmer and more purple than Electric."
            copied={copied}
            onCopy={copyHex}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 10,
          }}
        >
          <EdSwatch
            name="PULSE"
            hex="#FF2D78"
            textColor="#FFFFFF"
            height={160}
            token="--color-extended-pulse"
            usage="Marketing CTAs, data series 4. Bolder sibling of DS annotation color #E8186D."
            copied={copied}
            onCopy={copyHex}
          />
          <EdSwatch
            name="SOLAR"
            hex="#F5C800"
            textColor="#141414"
            height={160}
            token="--color-extended-solar"
            usage="Warm highlights, data labels. Golden — warmer than Acid lime."
            copied={copied}
            onCopy={copyHex}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10,
            marginTop: 10,
          }}
        >
          <EdSwatch
            name="SAGE"
            hex="#6B7B52"
            textColor="#FFFFFF"
            height={120}
            token="--color-extended-sage"
            usage="Nature, sustainability, data series 5."
            copied={copied}
            onCopy={copyHex}
          />
          <EdSwatch
            name="CREAM"
            hex="#F5F0E6"
            textColor="#3A3530"
            height={120}
            token="--color-extended-cream"
            usage="Warm editorial surfaces, print-feel layouts."
            copied={copied}
            onCopy={copyHex}
          />
          <EdSwatch
            name="INK"
            hex="#141414"
            textColor="#FFFFFF"
            height={120}
            token="--color-extended-ink"
            usage="Maximum contrast, editorial type, dark overlays."
            copied={copied}
            onCopy={copyHex}
          />
        </div>
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
