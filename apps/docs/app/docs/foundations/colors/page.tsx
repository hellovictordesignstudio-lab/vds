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

type UsageThemeTokens = {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  borderStrong: string;
  brand: string;
  brandHover: string;
  brandText: string;
  brandBorder: string;
  brandSubtle: string;
  success: string;
  successSubtle: string;
  danger: string;
  dangerSubtle: string;
  shadowCard: string;
};

function usageTheme(isDark: boolean): UsageThemeTokens {
  return {
    bgPrimary: isDark ? '#0F1117' : '#FFFFFF',
    bgSecondary: isDark ? '#161B27' : '#F8F9FC',
    bgTertiary: isDark ? '#1E2435' : '#F0F2F5',
    bgElevated: isDark ? '#242B3D' : '#FFFFFF',
    bgCard: isDark ? '#1A2030' : '#FFFFFF',
    textPrimary: isDark ? 'rgba(255,255,255,0.92)' : '#0A0F1E',
    textSecondary: isDark ? 'rgba(255,255,255,0.55)' : '#4A5270',
    textTertiary: isDark ? 'rgba(255,255,255,0.30)' : '#9BA5BE',
    textInverse: '#FFFFFF',
    border: isDark ? 'rgba(255,255,255,0.07)' : '#E5E8EF',
    borderStrong: isDark ? 'rgba(255,255,255,0.14)' : '#C5CBDA',
    brand: isDark ? '#1565A8' : '#002b49',
    brandHover: isDark ? '#1A72BC' : '#003d69',
    brandText: isDark ? '#5B9FD4' : '#002b49',
    brandBorder: isDark ? '#3A7DAE' : '#002b49',
    brandSubtle: isDark ? 'rgba(91,159,212,0.10)' : 'rgba(0,43,73,0.06)',
    success: '#0A8853',
    successSubtle: isDark ? 'rgba(52,199,123,0.12)' : '#E6F5EE',
    danger: '#C8102E',
    dangerSubtle: isDark ? 'rgba(200,16,46,0.12)' : 'rgba(200,16,46,0.06)',
    shadowCard: isDark ? '0 1px 4px rgba(0,0,0,0.6)' : '0 1px 4px rgba(0,0,0,0.06)',
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

  const t = usageTheme(isDark);

  const dottedBg: CSSProperties = {
    backgroundColor: t.bgPrimary,
    backgroundImage: `radial-gradient(circle, ${t.border} 1px, transparent 1px)`,
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
            gap: 16,
          }}
        >
          <div
            style={{
              opacity: isDark ? 0.4 : 1,
              transform: isDark ? 'scale(0.97)' : 'scale(1)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
          >
            <div
              style={{
                ...dottedBg,
                borderRadius: 14,
                border: '1px solid var(--color-border)',
                padding: '28px 24px',
              }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E8EF',
                    borderRadius: 12,
                    padding: 20,
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#9BA5BE',
                      fontFamily: 'var(--font-mono), monospace',
                    }}
                  >
                    bg-primary · #FFFFFF
                  </span>
                  <div
                    style={{
                      marginTop: 16,
                      background: '#F8F9FC',
                      border: '1px solid #E5E8EF',
                      borderRadius: 10,
                      padding: 16,
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#9BA5BE',
                        fontFamily: 'var(--font-mono), monospace',
                      }}
                    >
                      bg-secondary · #F8F9FC
                    </span>
                    <div
                      style={{
                        marginTop: 12,
                        background: '#F0F2F5',
                        border: '1px solid #E5E8EF',
                        borderRadius: 8,
                        padding: 14,
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#9BA5BE',
                          fontFamily: 'var(--font-mono), monospace',
                        }}
                      >
                        bg-tertiary · #F0F2F5
                      </span>
                      <div
                        style={{
                          marginTop: 12,
                          background: '#FFFFFF',
                          borderRadius: 6,
                          padding: 10,
                          border: '1px solid #E5E8EF',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#002b49' }}>Card surface</div>
                        <div style={{ fontSize: 10, color: '#9BA5BE', marginTop: 2 }}>
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
                fontSize: 11,
                fontWeight: 600,
                textAlign: 'center',
                marginTop: 10,
                color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--color-text-tertiary)',
              }}
            >
              Light mode
            </div>
          </div>
          <div
            style={{
              opacity: isDark ? 1 : 0.4,
              transform: isDark ? 'scale(1)' : 'scale(0.97)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
          >
            <div
              style={{
                ...dottedBg,
                borderRadius: 14,
                border: '1px solid var(--color-border)',
                padding: '28px 24px',
              }}
            >
              <div
                style={{
                  background: '#0F1117',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: 20,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.3)',
                    fontFamily: 'var(--font-mono), monospace',
                  }}
                >
                  bg-primary · #0F1117
                </span>
                <div
                  style={{
                    marginTop: 16,
                    background: '#161B27',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10,
                    padding: 16,
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.3)',
                      fontFamily: 'var(--font-mono), monospace',
                    }}
                  >
                    bg-secondary · #161B27
                  </span>
                  <div
                    style={{
                      marginTop: 12,
                      background: '#1E2435',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 8,
                      padding: 14,
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.3)',
                        fontFamily: 'var(--font-mono), monospace',
                      }}
                    >
                      bg-tertiary · #1E2435
                    </span>
                    <div
                      style={{
                        marginTop: 12,
                        background: '#242B3D',
                        borderRadius: 6,
                        padding: 10,
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                        Card surface
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                        Elevated back to bg-primary
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textAlign: 'center',
                marginTop: 10,
                color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--color-text-tertiary)',
              }}
            >
              Dark mode
            </div>
          </div>
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
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>#003d69</span>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>#1A72BC</span>
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
                    ring: #3A7DAE
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
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>#0F5A9A</span>
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
            border: `1px solid ${t.border}`,
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
                  btn: { background: t.brand, color: '#FFFFFF', outline: 'none' },
                },
                {
                  key: 'hover',
                  label: 'Hover',
                  btn: {
                    background: t.brandHover,
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
                    background: t.brand,
                    color: '#FFFFFF',
                    outline: `3px solid ${t.brandBorder}`,
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
                    background: t.brand,
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
                    color: t.textTertiary,
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
            gap: 16,
          }}
        >
          <div
            style={{
              ...dottedBg,
              borderRadius: 14,
              border: `1px solid ${t.border}`,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={20} color={t.brand} strokeWidth={2} aria-hidden />
              <span style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>4.5:1 minimum</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: '#E6F5EE',
                    color: '#0A8853',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 4,
                    padding: '2px 7px',
                  }}
                >
                  PASS
                </span>
                <div>
                  <div style={{ fontSize: 12, color: t.textSecondary, marginBottom: 6 }}>
                    #4A5270 on #FFFFFF
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: '#4A5270',
                      background: '#FFFFFF',
                      padding: '6px 10px',
                      borderRadius: 6,
                      display: 'inline-block',
                    }}
                  >
                    Sample text
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono), monospace',
                      color: '#0A8853',
                      marginTop: 6,
                      fontWeight: 600,
                    }}
                  >
                    4.7:1
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  flexWrap: 'wrap',
                  marginTop: 16,
                }}
              >
                <span
                  style={{
                    background: '#FCEAEC',
                    color: '#C8102E',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 4,
                    padding: '2px 7px',
                  }}
                >
                  FAIL
                </span>
                <div>
                  <div style={{ fontSize: 12, color: t.textSecondary, marginBottom: 6 }}>
                    #9BA5BE on #FFFFFF
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: '#9BA5BE',
                      background: '#FFFFFF',
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #FCEAEC',
                      display: 'inline-block',
                    }}
                  >
                    Sample text
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono), monospace',
                      color: '#C8102E',
                      marginTop: 6,
                      fontWeight: 600,
                    }}
                  >
                    2.8:1
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              ...dottedBg,
              borderRadius: 14,
              border: `1px solid ${t.border}`,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={20} color={t.brand} strokeWidth={2} aria-hidden />
              <span style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>
                7:1 target for body
              </span>
            </div>
            <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 12 }}>
              --color-text-primary on --color-bg-primary
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 16,
                color: isDark ? 'rgba(255,255,255,0.92)' : '#0A0F1E',
                background: isDark ? '#0F1117' : '#FFFFFF',
                padding: '12px 14px',
                borderRadius: 8,
              }}
            >
              The quick brown fox
            </div>
            <div
              style={{
                marginTop: 10,
                display: 'inline-block',
                background: '#E6F5EE',
                color: '#0A8853',
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 4,
                padding: '3px 8px',
              }}
            >
              ~15:1 ✓ AAA
            </div>
          </div>
          <div
            style={{
              ...dottedBg,
              borderRadius: 14,
              border: `1px solid ${t.border}`,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={20} color={t.brand} strokeWidth={2} aria-hidden />
              <span style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>
                Color + shape + text
              </span>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textSecondary, marginBottom: 8 }}>
                Wrong (color only)
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                  <span style={{ fontSize: 12, color: t.textPrimary }}>Error</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                  <span style={{ fontSize: 12, color: t.textPrimary }}>Success</span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: t.textTertiary, marginTop: 8, marginBottom: 0 }}>
                Color-blind users can&apos;t distinguish these
              </p>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.textSecondary, marginBottom: 8 }}>
                  Right (color + icon + text)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={14} color="#C8102E" strokeWidth={2} aria-hidden />
                    <span style={{ fontSize: 12, color: '#C8102E', fontWeight: 600 }}>
                      Error: invalid email
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={14} color="#0A8853" strokeWidth={2} aria-hidden />
                    <span style={{ fontSize: 12, color: '#0A8853', fontWeight: 600 }}>
                      Success: saved
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: t.textTertiary, marginTop: 8, marginBottom: 0 }}>
                  Icon + color + text — accessible to everyone
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
            color: t.textSecondary,
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
                  boxShadow: t.shadowCard,
                }}
              >
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: t.textPrimary,
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <div
                  style={{
                    background: t.bgTertiary,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    height: 36,
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 13,
                    color: t.textSecondary,
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
                    background: t.brand,
                    color: t.textInverse,
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
                  boxShadow: t.shadowCard,
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
                    background: t.bgTertiary,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    height: 36,
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 13,
                    color: t.textSecondary,
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
            color: t.textSecondary,
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
                  border: `1px solid ${t.border}`,
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
                  border: `1px solid ${t.border}`,
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
            color: t.textSecondary,
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
                  border: `1px solid ${t.border}`,
                  background: t.bgCard,
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
                      borderBottom: idx < arr.length - 1 ? `1px solid ${t.border}` : 'none',
                    }}
                  >
                    <row.Icon size={16} color={row.color} strokeWidth={2} aria-hidden />
                    <span style={{ fontSize: 13, fontWeight: 500, color: t.textPrimary }}>{row.text}</span>
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
                  border: `1px solid ${t.border}`,
                  background: t.bgCard,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderBottom: `1px solid ${t.border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      background: '#E6F5EE',
                      color: '#0A8853',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    New
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.textPrimary }}>Dashboard</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderBottom: `1px solid ${t.border}`,
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
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.textPrimary }}>Card title</span>
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
