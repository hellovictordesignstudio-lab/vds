'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertTriangle,
  AlignLeft,
  ArrowRight,
  ArrowUpCircle,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronsUpDown,
  Download,
  ExternalLink,
  Feather,
  Flame,
  Heart,
  Info,
  LayoutGrid,
  Layers,
  Layers2,
  MinusCircle,
  MousePointer2,
  MousePointerClick,
  Package,
  Plus,
  Ruler,
  Share2,
  ShieldCheck,
  Smartphone,
  Star,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import { Button } from '../../../../components/vds/Button';
import type { ButtonSize, ButtonVariant } from '../../../../components/vds/Button';
import { Callout } from '@/components/docs/Callout';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { CodeBlock } from '../../../../components/docs/CodeBlock';
import { ComponentTabs } from '../../../../components/docs/ComponentTabs';
import { DoCard } from '../../../../components/docs/DoCard';
import { DontCard } from '../../../../components/docs/DontCard';
import { LivePreview } from '../../../../components/docs/LivePreview';
import { PropsTable } from '../../../../components/docs/PropsTable';
import ComponentHero from '../../../../components/docs/ComponentHero';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

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
  brandSubtle2: string;
  success: string;
  successSubtle: string;
  danger: string;
  dangerSubtle: string;
  shadow: string;
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
    brandSubtle2: isDark ? 'rgba(91,159,212,0.18)' : 'rgba(0,43,73,0.12)',
    success: '#0A8853',
    successSubtle: isDark ? 'rgba(52,199,123,0.12)' : '#E6F5EE',
    danger: '#C8102E',
    dangerSubtle: isDark ? 'rgba(200,16,46,0.12)' : 'rgba(200,16,46,0.06)',
    shadow: isDark ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.08)',
    shadowCard: isDark ? '0 1px 4px rgba(0,0,0,0.6)' : '0 1px 4px rgba(0,0,0,0.06)',
  };
}

const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];
const STATE_OPTIONS = ['default', 'loading', 'disabled'] as const;
const ICON_OPTIONS = ['none', 'left', 'right', 'both'] as const;

const VARIANT_ROW_1: { value: ButtonVariant; label: string }[] = [
  { value: 'primary', label: 'primary' },
  { value: 'secondary', label: 'secondary' },
  { value: 'tertiary', label: 'tertiary' },
];
const VARIANT_ROW_2: { value: ButtonVariant; label: string }[] = [
  { value: 'danger', label: 'danger' },
  { value: 'link', label: 'link' },
];

type SegmentedControlProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  'aria-label'?: string;
  compact?: boolean;
};

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
  compact,
}: SegmentedControlProps<T>) {
  return (
    <div className="seg-control" role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`seg-option${value === opt.value ? ' seg-active' : ''}${compact ? ' seg-option--compact' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const anatomyFont = "'Nunito Sans', system-ui, sans-serif";

function ButtonAnatomyDiagram({ t }: { t: UsageThemeTokens }) {
  const legendLetter = {
    fontWeight: 600 as const,
    color: 'var(--color-text-primary)',
  };
  const legendLine = {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
  };
  const legendSectionTitle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: 'var(--color-text-primary)',
    marginBottom: '4px',
  };

  return (
    <div className="anatomy-container">
      <svg
        viewBox="0 0 680 480"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        fontFamily={anatomyFont}
      >
        <defs>
          <pattern id="anatDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#C5CBDA" />
          </pattern>
          <marker
            id="pinkArrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M2 2L8 5L2 8"
              fill="none"
              stroke="#E8186D"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        <rect width="680" height="480" fill="url(#anatDots)" />

        <line x1="0" y1="240" x2="680" y2="240" stroke="#DDE1EA" strokeWidth="1" />
        <line x1="340" y1="0" x2="340" y2="480" stroke="#DDE1EA" strokeWidth="1" />

        {/* Quadrant number badges */}
        <circle cx="28" cy="28" r="14" fill="#E8186D" />
        <text x="28" y="33" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="700">
          1
        </text>
        <circle cx="368" cy="28" r="14" fill="#E8186D" />
        <text x="368" y="33" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="700">
          2
        </text>
        <circle cx="28" cy="268" r="14" fill="#E8186D" />
        <text x="28" y="273" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="700">
          3
        </text>
        <circle cx="368" cy="268" r="14" fill="#E8186D" />
        <text x="368" y="273" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="700">
          4
        </text>

        {/* Q1 */}
        <rect x="70" y="100" width="200" height="44" rx="8" fill={t.brand} />
        <text x="170" y="127" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="700">
          Label
        </text>
        <circle cx="120" cy="122" r="4" fill="#E8186D" />
        <path
          d="M120,118 L120,72 L90,72"
          fill="none"
          stroke="#E8186D"
          strokeWidth="1.5"
          markerEnd="url(#pinkArrow)"
        />
        <circle cx="70" cy="65" r="9" fill="#E8186D" />
        <text x="70" y="68" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
          A
        </text>
        <circle cx="170" cy="144" r="4" fill="#E8186D" />
        <line
          x1="170"
          y1="148"
          x2="170"
          y2="185"
          stroke="#E8186D"
          strokeWidth="1.5"
          markerEnd="url(#pinkArrow)"
        />
        <circle cx="170" cy="195" r="9" fill="#E8186D" />
        <text x="170" y="199" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
          B
        </text>

        {/* Q2 */}
        <rect
          x="390"
          y="98"
          width="240"
          height="44"
          rx="8"
          fill="#FFFFFF"
          stroke={t.brandBorder}
          strokeWidth="1.5"
        />
        <circle cx="416" cy="120" r="8" fill={t.brandText} fillOpacity="0.15" />
        <circle cx="416" cy="120" r="4" fill={t.brandText} />
        <text x="510" y="126" textAnchor="middle" fill={t.brandText} fontSize="15" fontWeight="700">
          Label
        </text>
        <text x="606" y="128" textAnchor="middle" fill={t.brandText} fontSize="18" fontWeight="700">
          ›
        </text>
        <circle cx="510" cy="101" r="4" fill="#E8186D" />
        <line
          x1="510"
          y1="97"
          x2="510"
          y2="62"
          stroke="#E8186D"
          strokeWidth="1.5"
          markerEnd="url(#pinkArrow)"
        />
        <circle cx="510" cy="52" r="9" fill="#E8186D" />
        <text x="510" y="56" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
          A
        </text>
        <circle cx="416" cy="142" r="4" fill="#E8186D" />
        <path
          d="M416,146 L416,175 L395,185"
          fill="none"
          stroke="#E8186D"
          strokeWidth="1.5"
          markerEnd="url(#pinkArrow)"
        />
        <circle cx="385" cy="192" r="9" fill="#E8186D" />
        <text x="385" y="196" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
          C
        </text>
        <circle cx="510" cy="142" r="4" fill="#E8186D" />
        <line
          x1="510"
          y1="146"
          x2="510"
          y2="185"
          stroke="#E8186D"
          strokeWidth="1.5"
          markerEnd="url(#pinkArrow)"
        />
        <circle cx="510" cy="194" r="9" fill="#E8186D" />
        <text x="510" y="198" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
          B
        </text>
        <circle cx="606" cy="128" r="4" fill="#E8186D" />
        <line
          x1="610"
          y1="128"
          x2="645"
          y2="128"
          stroke="#E8186D"
          strokeWidth="1.5"
          markerEnd="url(#pinkArrow)"
        />
        <circle cx="655" cy="128" r="9" fill="#E8186D" />
        <text x="655" y="132" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
          D
        </text>

        {/* Q3 */}
        <text x="170" y="368" textAnchor="middle" fill={t.brandText} fontSize="17" fontWeight="700">
          Link button
        </text>
        <circle cx="120" cy="362" r="4" fill="#E8186D" />
        <path
          d="M120,358 L120,308 L95,308"
          fill="none"
          stroke="#E8186D"
          strokeWidth="1.5"
          markerEnd="url(#pinkArrow)"
        />
        <circle cx="85" cy="308" r="9" fill="#E8186D" />
        <text x="85" y="312" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
          A
        </text>
        <text x="170" y="395" textAnchor="middle" fill="#9BA5BE" fontSize="11" fontStyle="italic">
          <tspan x="170" dy="0">
            Text only — navigational or
          </tspan>
          <tspan x="170" dy="14">
            low-priority inline actions
          </tspan>
        </text>

        {/* Q4 */}
        <rect x="474" y="332" width="72" height="56" rx="8" fill={t.bgTertiary} />
        <text x="510" y="366" textAnchor="middle" fill={t.brandText} fontSize="28" fontWeight="300">
          +
        </text>
        <circle cx="510" cy="335" r="4" fill="#E8186D" />
        <line
          x1="510"
          y1="331"
          x2="510"
          y2="290"
          stroke="#E8186D"
          strokeWidth="1.5"
          markerEnd="url(#pinkArrow)"
        />
        <circle cx="510" cy="280" r="9" fill="#E8186D" />
        <text x="510" y="284" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
          A
        </text>
        <circle cx="546" cy="360" r="4" fill="#E8186D" />
        <line
          x1="550"
          y1="360"
          x2="600"
          y2="360"
          stroke="#E8186D"
          strokeWidth="1.5"
          markerEnd="url(#pinkArrow)"
        />
        <circle cx="610" cy="360" r="9" fill="#E8186D" />
        <text x="610" y="364" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
          B
        </text>
      </svg>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0 40px',
          marginTop: '12px',
          padding: '20px 24px',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={legendSectionTitle}>1. Button (primary)</div>
            <div style={legendLine}>
              <span style={legendLetter}>A.</span> Label — The button text. Keep to 1–3 words.
            </div>
            <div style={legendLine}>
              <span style={legendLetter}>B.</span> Container — The clickable boundary. Always required.
            </div>
          </div>
          <div>
            <div style={legendSectionTitle}>3. Link button</div>
            <div style={legendLine}>
              <span style={legendLetter}>A.</span> Label — Text only; navigational or low-priority inline
              actions.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={legendSectionTitle}>2. Button with icons</div>
            <div style={legendLine}>
              <span style={legendLetter}>A.</span> Label — Center text.
            </div>
            <div style={legendLine}>
              <span style={legendLetter}>B.</span> Container — The full clickable area.
            </div>
            <div style={legendLine}>
              <span style={legendLetter}>C.</span> Leading Icon — Icon before the label. Optional.
            </div>
            <div style={legendLine}>
              <span style={legendLetter}>D.</span> Trailing Icon — Icon after the label. Optional.
            </div>
          </div>
          <div>
            <div style={legendSectionTitle}>4. Icon-only button</div>
            <div style={legendLine}>
              <span style={legendLetter}>A.</span> Icon — Replaces label. Requires aria-label.
            </div>
            <div style={legendLine}>
              <span style={legendLetter}>B.</span> Container — Square or circle container.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobilePaymentCard({ variant, t }: { variant: 'do' | 'dont'; t: UsageThemeTokens }) {
  return (
    <div
      style={{
        width: '260px',
        background: t.bgCard,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: t.shadowCard,
        border: `1px solid ${t.border}`,
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ padding: '20px 20px 16px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: `2px solid ${t.borderStrong}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}
        >
          <Zap size={18} color={t.textSecondary} strokeWidth={1.5} />
        </div>

        <div
          style={{
            fontSize: '28px',
            fontWeight: '900',
            color: t.textPrimary,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '2px',
          }}
        >
          $2.95
        </div>
        <div style={{ fontSize: '12px', color: t.textTertiary, marginBottom: '16px' }}>
          2.95 USDC
        </div>

        <div style={{ height: '1px', background: t.border, marginBottom: '12px' }} />

        {[
          { label: 'Pay with', value: 'USDC Wallet' },
          { label: 'Network', value: 'Ethereum' },
          { label: 'Fee', value: '$0.00' },
          { label: 'Total', value: '$2.95' },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '5px 0',
            }}
          >
            <span style={{ fontSize: '12px', color: t.textSecondary }}>{row.label}</span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: t.textPrimary,
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '12px 16px 20px',
          borderTop: `1px solid ${t.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {variant === 'do' ? (
          <>
            <div
              style={{
                width: '100%',
                height: '44px',
                background: t.bgTertiary,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '700',
                color: t.textPrimary,
                cursor: 'pointer',
              }}
            >
              Cancel
            </div>
            <div
              style={{
                width: '100%',
                height: '44px',
                background: t.brand,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '700',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              Confirm payment
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                width: '100%',
                height: '44px',
                background: t.brand,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '700',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              Save for later
            </div>
            <div
              style={{
                width: '100%',
                height: '44px',
                background: t.brand,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '700',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              Confirm payment
            </div>
          </>
        )}

        <div
          style={{
            width: '48px',
            height: '4px',
            background: t.borderStrong,
            borderRadius: '2px',
            margin: '4px auto 0',
          }}
        />
      </div>
    </div>
  );
}

function LoginFormMockup({ variant, t }: { variant: 'do' | 'dont'; t: UsageThemeTokens }) {
  const primaryBtn = {
    width: '100%' as const,
    height: 44,
    background: t.brand,
    borderRadius: 10,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: 13,
    fontWeight: 700,
    color: '#ffffff',
    fontFamily: 'var(--font-sans)',
  };
  const secondaryBtn = {
    width: '100%' as const,
    height: 44,
    background: t.bgTertiary,
    borderRadius: 10,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: 13,
    fontWeight: 700,
    color: t.textPrimary,
    fontFamily: 'var(--font-sans)',
    border: 'none',
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 280,
        background: t.bgCard,
        borderRadius: 16,
        padding: 24,
        boxShadow: t.shadowCard,
        border: `1px solid ${t.border}`,
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            color: t.textSecondary,
            marginBottom: 6,
          }}
        >
          Email
        </label>
        <div
          style={{
            height: 40,
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            fontSize: 14,
            color: t.textPrimary,
            background: t.bgTertiary,
          }}
        >
          john@example.com
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            color: t.textSecondary,
            marginBottom: 6,
          }}
        >
          Password
        </label>
        <div
          style={{
            height: 40,
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            fontSize: 14,
            color: t.textPrimary,
            letterSpacing: '0.08em',
            background: t.bgTertiary,
          }}
        >
          ••••••••••
        </div>
      </div>

      {variant === 'do' ? (
        <>
          <div style={primaryBtn}>Next Step</div>
          <div style={{ ...secondaryBtn, marginTop: 8 }}>Cancel</div>
        </>
      ) : (
        <>
          <div style={primaryBtn}>Next Step</div>
          <div style={{ ...primaryBtn, marginTop: 8 }}>Cancel</div>
        </>
      )}
    </div>
  );
}

const DANGER_RED = '#C8102E';

function dangerRowLabelStyle(t: UsageThemeTokens): CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 600,
    color: t.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 10,
    textAlign: 'center',
  };
}

function GhostDangerInteractiveButton({
  height,
  padH,
  fontSize,
}: {
  height: number;
  padH: number;
  fontSize: number;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height,
        padding: `0 ${padH}px`,
        fontSize,
        fontWeight: 600,
        color: DANGER_RED,
        background: hover ? 'rgba(200,16,46,0.08)' : 'transparent',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
      }}
    >
      Delete
    </button>
  );
}

function DangerVariantShowcase({ t }: { t: UsageThemeTokens }) {
  const filled = (h: number, pad: number, fs: number): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: h,
    padding: `0 ${pad}px`,
    fontSize: fs,
    fontWeight: 600,
    background: DANGER_RED,
    color: '#ffffff',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  });

  const rowWrap: CSSProperties = {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  return (
    <div
      style={{
        backgroundColor: t.bgPrimary,
        backgroundImage: `radial-gradient(circle, ${t.border} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        padding: '32px 24px',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={dangerRowLabelStyle(t)}>Filled</div>
          <div style={rowWrap}>
            <button type="button" style={filled(32, 12, 13)}>
              Delete
            </button>
            <button type="button" style={filled(40, 16, 14)}>
              Delete
            </button>
            <button type="button" style={filled(48, 20, 15)}>
              Delete
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={dangerRowLabelStyle(t)}>With icon</div>
          <div style={rowWrap}>
            <button
              type="button"
              style={{
                ...filled(32, 12, 13),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Trash2 size={16} color="#ffffff" strokeWidth={2} aria-hidden />
              Delete
            </button>
            <button
              type="button"
              style={{
                ...filled(40, 16, 14),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Trash2 size={16} color="#ffffff" strokeWidth={2} aria-hidden />
              Delete
            </button>
            <button
              type="button"
              style={{
                ...filled(48, 20, 15),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Trash2 size={16} color="#ffffff" strokeWidth={2} aria-hidden />
              Delete
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={dangerRowLabelStyle(t)}>Icon only</div>
          <div style={rowWrap}>
            {[32, 40, 48].map((s) => (
              <button
                key={s}
                type="button"
                style={{
                  width: s,
                  height: s,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: DANGER_RED,
                  color: '#ffffff',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
                aria-label="Delete"
              >
                <Trash2 size={16} color="#ffffff" strokeWidth={2} aria-hidden />
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={dangerRowLabelStyle(t)}>Ghost danger</div>
          <div style={rowWrap}>
            <GhostDangerInteractiveButton height={32} padH={12} fontSize={13} />
            <GhostDangerInteractiveButton height={40} padH={16} fontSize={14} />
            <GhostDangerInteractiveButton height={48} padH={20} fontSize={15} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DangerConfirmDialogMockup({ t }: { t: UsageThemeTokens }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 320,
        background: t.bgCard,
        borderRadius: 16,
        padding: 24,
        boxShadow: t.shadowCard,
        border: `1px solid ${t.border}`,
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(200,16,46,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Trash2 size={16} color={DANGER_RED} strokeWidth={2} aria-hidden />
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: t.textPrimary, marginTop: 12 }}>Delete project?</div>
      <p
        style={{
          fontSize: 13,
          color: t.textSecondary,
          marginTop: 6,
          marginBottom: 0,
          lineHeight: 1.5,
        }}
      >
        This will permanently delete &apos;Brand Assets&apos; and all its contents. This action cannot be
        undone.
      </p>
      <div style={{ height: 1, background: t.border, margin: '16px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <button
          type="button"
          style={{
            width: '100%',
            height: 44,
            background: DANGER_RED,
            color: '#ffffff',
            borderRadius: 10,
            border: 'none',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Delete project
        </button>
        <button
          type="button"
          style={{
            width: '100%',
            height: 44,
            background: t.bgTertiary,
            color: t.textPrimary,
            borderRadius: 10,
            border: 'none',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function DangerInlineListMockup({ t }: { t: UsageThemeTokens }) {
  const rows = ['brand-assets.zip', 'logo-v2.png', 'style-guide.pdf'];
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 320,
        background: t.bgCard,
        borderRadius: 16,
        padding: 0,
        overflow: 'hidden',
        boxShadow: t.shadowCard,
        border: `1px solid ${t.border}`,
        fontFamily: 'var(--font-sans)',
      }}
    >
      {rows.map((name, i) => (
        <div
          key={name}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${t.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: hovered === i ? t.bgTertiary : undefined,
          }}
        >
          <span style={{ fontSize: 14, color: t.textPrimary }}>{name}</span>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: DANGER_RED,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

const TOUCH_TARGET_OK = '#0a8853';
const TOUCH_TARGET_BAD = '#e8186d';

function TouchTargetsMockup({ variant, t }: { variant: 'do' | 'dont'; t: UsageThemeTokens }) {
  const isDo = variant === 'do';
  const overlayBorder = isDo
    ? `1.5px dashed ${TOUCH_TARGET_OK}`
    : `1.5px dashed ${TOUCH_TARGET_BAD}`;
  const tagBg = isDo ? TOUCH_TARGET_OK : TOUCH_TARGET_BAD;
  const tagLabel = isDo ? '48' : '24';
  const noteColor = isDo ? TOUCH_TARGET_OK : TOUCH_TARGET_BAD;
  const noteText = isDo
    ? '↕ 48px minimum tap zone — always'
    : '↕ Undersized tap zones cause missed taps and user errors';

  const renderTouchTag = () => (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        background: tagBg,
        color: '#ffffff',
        padding: '1px 4px',
        borderRadius: 3,
        position: 'absolute',
        top: -8,
        left: -8,
        zIndex: 2,
        lineHeight: 1.2,
      }}
    >
      {tagLabel}
    </span>
  );

  const iconWrapperBase: CSSProperties = {
    position: 'relative',
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-sans)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={iconWrapperBase}>
          {renderTouchTag()}
          {isDo ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                border: overlayBorder,
                borderRadius: 10,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                width: 28,
                height: 28,
                left: '50%',
                top: '50%',
                marginLeft: -14,
                marginTop: -14,
                border: overlayBorder,
                borderRadius: 8,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          )}
          <button
            type="button"
            aria-label="Favorite"
            style={{
              position: 'relative',
              zIndex: 1,
              width: 36,
              height: 36,
              background: t.brand,
              borderRadius: 8,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'default',
              padding: 0,
            }}
          >
            <Heart size={16} color="#ffffff" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div style={iconWrapperBase}>
          {renderTouchTag()}
          {isDo ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                border: overlayBorder,
                borderRadius: 10,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                width: 28,
                height: 28,
                left: '50%',
                top: '50%',
                marginLeft: -14,
                marginTop: -14,
                border: overlayBorder,
                borderRadius: 8,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          )}
          <button
            type="button"
            aria-label="Bookmark"
            style={{
              position: 'relative',
              zIndex: 1,
              width: 36,
              height: 36,
              background: t.bgTertiary,
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'default',
              padding: 0,
            }}
          >
            <Bookmark size={16} color={t.brandText} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div
          style={{
            position: 'relative',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          paddingLeft: 10,
          paddingRight: 10,
        }}
        >
          {renderTouchTag()}
          {isDo ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: overlayBorder,
                borderRadius: 10,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 28,
                top: '50%',
                marginTop: -14,
                border: overlayBorder,
                borderRadius: 8,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          )}
          <button
            type="button"
            style={{
              position: 'relative',
              zIndex: 1,
              background: t.bgTertiary,
              color: t.brandText,
              height: 36,
              padding: '0 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'default',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <Plus size={15} color={t.brandText} strokeWidth={2} aria-hidden />
            Add item
          </button>
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          color: noteColor,
          fontWeight: 600,
          marginTop: 16,
          textAlign: 'center',
        }}
      >
        {noteText}
      </div>
    </div>
  );
}

function ButtonUsageStatesSection({ t, isDark }: { t: UsageThemeTokens; isDark: boolean }) {
  const variantLabelStyle: CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: t.textTertiary,
    marginBottom: 10,
  };

  const dottedStripStyle: CSSProperties = {
    backgroundColor: t.bgPrimary,
    backgroundImage: `radial-gradient(circle, ${t.border} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    borderRadius: 14,
    border: `1px solid ${t.border}`,
    padding: '28px 24px',
  };

  const rowStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    width: '100%',
  };

  const chipStyle: CSSProperties = {
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    background: isDark ? 'rgba(255,255,255,0.06)' : '#F0F2F5',
    color: isDark ? 'rgba(255,255,255,0.4)' : '#6B7694',
    borderRadius: 4,
    padding: '2px 6px',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    textAlign: 'center',
    width: '100%',
    display: 'block',
  };

  const cardShellStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    background: t.bgCard,
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    padding: '20px 16px',
  };

  const btnBase: CSSProperties = {
    height: 40,
    padding: '0 20px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-sans)',
    cursor: 'default',
    boxSizing: 'border-box',
  };

  function StateCard({
    stateName,
    tokens,
    demo,
  }: {
    stateName: string;
    tokens: string[];
    demo: ReactNode;
  }) {
    return (
      <div style={cardShellStyle}>
        {demo}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: t.textPrimary,
          }}
        >
          {stateName}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            width: '100%',
            alignItems: 'stretch',
            alignSelf: 'stretch',
          }}
        >
          {tokens.map((token) => (
            <div key={token} style={chipStyle}>
              {token}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function VariantStrip({
    label,
    marginBottom,
    children,
  }: {
    label: string;
    marginBottom: number;
    children: ReactNode;
  }) {
    return (
      <div style={{ marginBottom }}>
        <div style={variantLabelStyle}>{label}</div>
        <div style={dottedStripStyle}>
          <div style={rowStyle}>{children}</div>
        </div>
      </div>
    );
  }

  function LoadingSpinnerInner({
    borderMuted,
    borderTop,
  }: {
    borderMuted: string;
    borderTop: string;
  }) {
    return (
      <span
        style={{
          width: 16,
          height: 16,
          border: `2px solid ${borderMuted}`,
          borderTopColor: borderTop,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          flexShrink: 0,
        }}
        aria-hidden
      />
    );
  }

  const tertiaryOutline: CSSProperties = {
    ...btnBase,
    background: 'transparent',
    border: `1.5px solid ${t.brandBorder}`,
  };

  return (
    <div className="component-section">
      <h2 id="states" className="component-section-title">
        States
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: t.textSecondary,
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        Every button communicates its status through visual states. Each state is a deliberate signal —
        telling users what&apos;s interactive, what&apos;s happening, and what&apos;s off-limits.
      </p>

      <VariantStrip label="Primary" marginBottom={32}>
        <StateCard
          stateName="Enabled"
          tokens={['bg: brand', 'color: white']}
          demo={
            <button type="button" style={{ ...btnBase, background: t.brand, color: '#FFFFFF' }}>
              Enabled
            </button>
          }
        />
        <StateCard
          stateName="Hover"
          tokens={['bg: brand-hover', 'color: white']}
          demo={
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button type="button" style={{ ...btnBase, background: t.brandHover, color: '#FFFFFF' }}>
                Hover
              </button>
              <MousePointer2
                size={12}
                color="#FFFFFF"
                strokeWidth={2}
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -4,
                  opacity: 0.7,
                  pointerEvents: 'none',
                }}
                aria-hidden
              />
            </div>
          }
        />
        <StateCard
          stateName="Focus"
          tokens={['bg: brand', 'ring: accent-3px']}
          demo={
            <button
              type="button"
              style={{
                ...btnBase,
                background: t.brand,
                color: '#FFFFFF',
                outline: `3px solid ${t.brandBorder}`,
                outlineOffset: 3,
              }}
            >
              Focus
            </button>
          }
        />
        <StateCard
          stateName="Pressed"
          tokens={['bg: brand-pressed', 'overlay: white-15%']}
          demo={
            <button
              type="button"
              style={{
                ...btnBase,
                background:
                  isDark
                    ? 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%), #0F5A9A'
                    : 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%), #001e35',
                color: '#FFFFFF',
              }}
            >
              Pressed
            </button>
          }
        />
        <StateCard
          stateName="Disabled"
          tokens={['bg: disabled', 'color: disabled']}
          demo={
            <button
              type="button"
              disabled
              style={{
                ...btnBase,
                background: t.bgTertiary,
                color: t.textTertiary,
                cursor: 'not-allowed',
              }}
            >
              Disabled
            </button>
          }
        />
        <StateCard
          stateName="Loading"
          tokens={['bg: brand', 'spinner: white']}
          demo={
            <button
              type="button"
              aria-label="Loading"
              style={{
                ...btnBase,
                background: t.brand,
                color: 'transparent',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <LoadingSpinnerInner borderMuted="rgba(255,255,255,0.25)" borderTop="#FFFFFF" />
              </span>
              Loading
            </button>
          }
        />
      </VariantStrip>

      <VariantStrip label="Secondary" marginBottom={32}>
        <StateCard
          stateName="Enabled"
          tokens={['bg: surface-2', 'color: brand']}
          demo={
            <button type="button" style={{ ...btnBase, background: t.bgTertiary, color: t.brandText }}>
              Enabled
            </button>
          }
        />
        <StateCard
          stateName="Hover"
          tokens={['bg: surface-2-hover']}
          demo={
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                style={{
                  ...btnBase,
                  background: isDark ? 'rgba(255,255,255,0.08)' : '#E5E8EE',
                  color: t.brandText,
                }}
              >
                Hover
              </button>
              <MousePointer2
                size={12}
                color={t.brandText}
                strokeWidth={2}
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -4,
                  opacity: 0.7,
                  pointerEvents: 'none',
                }}
                aria-hidden
              />
            </div>
          }
        />
        <StateCard
          stateName="Focus"
          tokens={['bg: surface-2', 'ring: accent']}
          demo={
            <button
              type="button"
              style={{
                ...btnBase,
                background: t.bgTertiary,
                color: t.brandText,
                outline: `3px solid ${t.brandBorder}`,
                outlineOffset: 3,
              }}
            >
              Focus
            </button>
          }
        />
        <StateCard
          stateName="Pressed"
          tokens={['bg: surface-2-pressed']}
          demo={
            <button
              type="button"
              style={{
                ...btnBase,
                background: isDark ? 'rgba(255,255,255,0.12)' : '#D8DCE5',
                color: t.brandText,
              }}
            >
              Pressed
            </button>
          }
        />
        <StateCard
          stateName="Disabled"
          tokens={['bg: disabled', 'color: disabled']}
          demo={
            <button
              type="button"
              disabled
              style={{
                ...btnBase,
                background: t.bgTertiary,
                color: t.textTertiary,
                cursor: 'not-allowed',
              }}
            >
              Disabled
            </button>
          }
        />
        <StateCard
          stateName="Loading"
          tokens={['bg: surface-2', 'spinner: brand']}
          demo={
            <button
              type="button"
              aria-label="Loading"
              style={{
                ...btnBase,
                background: t.bgTertiary,
                color: 'transparent',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <LoadingSpinnerInner
                  borderMuted={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,43,73,0.2)'}
                  borderTop={t.brandBorder}
                />
              </span>
              Loading
            </button>
          }
        />
      </VariantStrip>

      <VariantStrip label="Tertiary" marginBottom={32}>
        <StateCard
          stateName="Enabled"
          tokens={['bg: transparent', 'border: brand']}
          demo={
            <button type="button" style={{ ...tertiaryOutline, color: t.brandText }}>
              Enabled
            </button>
          }
        />
        <StateCard
          stateName="Hover"
          tokens={['bg: brand-subtle']}
          demo={
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                style={{
                  ...tertiaryOutline,
                  background: t.brandSubtle,
                  color: t.brandText,
                }}
              >
                Hover
              </button>
              <MousePointer2
                size={12}
                color={t.brandText}
                strokeWidth={2}
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -4,
                  opacity: 0.7,
                  pointerEvents: 'none',
                }}
                aria-hidden
              />
            </div>
          }
        />
        <StateCard
          stateName="Focus"
          tokens={['ring: accent-3px']}
          demo={
            <button
              type="button"
              style={{
                ...tertiaryOutline,
                color: t.brandText,
                outline: `3px solid ${t.brandBorder}`,
                outlineOffset: 3,
              }}
            >
              Focus
            </button>
          }
        />
        <StateCard
          stateName="Pressed"
          tokens={['bg: brand-subtle-pressed']}
          demo={
            <button
              type="button"
              style={{
                ...tertiaryOutline,
                background: t.brandSubtle2,
                color: t.brandText,
              }}
            >
              Pressed
            </button>
          }
        />
        <StateCard
          stateName="Disabled"
          tokens={['border: disabled', 'color: disabled']}
          demo={
            <button
              type="button"
              disabled
              style={{
                ...tertiaryOutline,
                border: `1.5px solid ${t.border}`,
                color: t.textTertiary,
                cursor: 'not-allowed',
              }}
            >
              Disabled
            </button>
          }
        />
        <StateCard
          stateName="Loading"
          tokens={['bg: transparent', 'spinner: brand']}
          demo={
            <button
              type="button"
              aria-label="Loading"
              style={{
                ...tertiaryOutline,
                color: 'transparent',
                position: 'relative',
                border: `1.5px solid ${t.brandBorder}`,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <LoadingSpinnerInner
                  borderMuted={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,43,73,0.2)'}
                  borderTop={t.brandText}
                />
              </span>
              Loading
            </button>
          }
        />
      </VariantStrip>

      <VariantStrip label="Danger" marginBottom={0}>
        <StateCard
          stateName="Enabled"
          tokens={['bg: danger', 'color: white']}
          demo={
            <button type="button" style={{ ...btnBase, background: '#C8102E', color: '#ffffff' }}>
              Enabled
            </button>
          }
        />
        <StateCard
          stateName="Hover"
          tokens={['bg: danger-hover']}
          demo={
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button type="button" style={{ ...btnBase, background: '#A50D25', color: '#ffffff' }}>
                Hover
              </button>
              <MousePointer2
                size={12}
                color="#ffffff"
                strokeWidth={2}
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -4,
                  opacity: 0.7,
                  pointerEvents: 'none',
                }}
                aria-hidden
              />
            </div>
          }
        />
        <StateCard
          stateName="Focus"
          tokens={['ring: danger-light']}
          demo={
            <button
              type="button"
              style={{
                ...btnBase,
                background: '#C8102E',
                color: '#ffffff',
                outline: '3px solid #F28B9B',
                outlineOffset: 3,
              }}
            >
              Focus
            </button>
          }
        />
        <StateCard
          stateName="Pressed"
          tokens={['bg: danger-pressed']}
          demo={
            <button
              type="button"
              style={{
                ...btnBase,
                background:
                  'radial-gradient(circle at center, rgba(255,255,255,0.12) 0%, transparent 70%), #8B0B1E',
                color: '#ffffff',
              }}
            >
              Pressed
            </button>
          }
        />
        <StateCard
          stateName="Disabled"
          tokens={['bg: danger-disabled']}
          demo={
            <button
              type="button"
              disabled
              style={{
                ...btnBase,
                background: '#F5E6E8',
                color: '#E8A0A8',
                cursor: 'not-allowed',
              }}
            >
              Disabled
            </button>
          }
        />
      </VariantStrip>

      <div style={{ marginTop: 24 }}>
        <Callout icon={<Info size={20} />} title="Focus is not optional">
          Every interactive button must show a visible focus ring for keyboard and assistive technology
          users. VDS uses a 3px accent-colored outline with 3px offset — meeting WCAG 2.1 AA focus visibility
          requirements across all variants.
        </Callout>
      </div>
    </div>
  );
}

function ButtonUsageWidthSection({ t, isDark }: { t: UsageThemeTokens; isDark: boolean }) {
  const W_ANNOT = '#E8186D';
  const dottedPad: CSSProperties = {
    backgroundColor: t.bgPrimary,
    backgroundImage: `radial-gradient(circle, ${t.border} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    borderRadius: 14,
    border: `1px solid ${t.border}`,
    padding: '48px 40px',
    marginBottom: 32,
  };

  const grid3: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 320px) minmax(0, 1fr)',
    alignItems: 'center',
    gap: 24,
  };

  function WidthPricingCardMockup({ fullWidthPrimary }: { fullWidthPrimary: boolean }) {
    const features = [
      'Unlimited projects & collaborators',
      'Advanced analytics & reporting',
      'Priority support & SLA',
    ];
    return (
      <div
        style={{
          width: '100%',
          maxWidth: 320,
          background: t.bgCard,
          borderRadius: 16,
          padding: '24px',
          boxShadow: t.shadowCard,
          border: `1px solid ${t.border}`,
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: t.bgTertiary,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Package size={20} color={t.textTertiary} strokeWidth={2} aria-hidden />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary }}>Pro Plan</div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: 11, color: t.textTertiary }}>Billed yearly</span>
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
                Save 40%
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 14, gap: 2 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: t.textPrimary, lineHeight: 1 }}>$12</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: t.textTertiary,
              marginBottom: 4,
            }}
          >
            .99/mo
          </span>
        </div>
        <div style={{ height: 1, background: t.border, margin: '16px 0' }} />
        {features.map((f) => (
          <div
            key={f}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 8 }}
          >
            <CheckCircle2
              size={15}
              color="#0A8853"
              strokeWidth={2}
              style={{ flexShrink: 0 }}
              aria-hidden
            />
            <span style={{ fontSize: 12, color: t.textSecondary }}>{f}</span>
          </div>
        ))}
        <div style={{ height: 1, background: t.border, margin: '16px 0' }} />
        {fullWidthPrimary ? (
          <button
            type="button"
            style={{
              width: '100%',
              background: t.brand,
              color: '#ffffff',
              height: 44,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 20px',
              cursor: 'default',
              fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
            }}
          >
            Start free trial
            <ArrowRight
              size={16}
              color="#ffffff"
              strokeWidth={2}
              style={{ marginLeft: 'auto', opacity: 0.6 }}
              aria-hidden
            />
          </button>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 20px',
                margin: '0 auto',
                background: t.brand,
                color: '#ffffff',
                height: 44,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'default',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box',
              }}
            >
              Start free trial
              <ArrowRight
                size={16}
                color="#ffffff"
                strokeWidth={2}
                style={{ marginLeft: 'auto', opacity: 0.6 }}
                aria-hidden
              />
            </button>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12,
          }}
        >
          <span style={{ fontSize: 11, color: t.textTertiary }}>No credit card required</span>
          <button
            type="button"
            style={{
              background: t.bgTertiary,
              color: t.textPrimary,
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 6,
              border: `1px solid ${t.border}`,
              cursor: 'default',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Compare plans
          </button>
        </div>
      </div>
    );
  }

  type ContactRow = {
    name: string;
    sub: string;
    label: string;
    avatarSrc: string;
    avatarAlt: string;
  };
  function WidthContactsMockup({ fullWidthButtons }: { fullWidthButtons: boolean }) {
    const followPillBg = isDark ? t.brandSubtle : '#E8F0FF';
    const rows: ContactRow[] = [
      {
        name: 'Sarah Chen',
        sub: 'at Design Co.',
        label: 'Follow',
        avatarSrc:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=72&h=72&fit=crop&crop=face',
        avatarAlt: 'Sarah Chen',
      },
      {
        name: 'Marcus Webb',
        sub: 'at Stripe',
        label: 'Follow',
        avatarSrc:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=72&h=72&fit=crop&crop=face',
        avatarAlt: 'Marcus Webb',
      },
      {
        name: 'Priya Kapoor',
        sub: 'at Vercel',
        label: 'Requested',
        avatarSrc:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=72&h=72&fit=crop&crop=face',
        avatarAlt: 'Priya Kapoor',
      },
    ];
    return (
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          background: t.bgCard,
          borderRadius: 16,
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
          boxShadow: t.shadowCard,
          border: `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${t.border}`,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>Find friends</span>
          <span style={{ fontSize: 12, color: t.textTertiary, marginLeft: 'auto' }}>27 friends</span>
        </div>
        {rows.map((row, i) => (
          <div
            key={row.name}
            style={{
              padding: '12px 20px',
              borderBottom: i < rows.length - 1 ? `1px solid ${t.border}` : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <img
              src={row.avatarSrc}
              alt={row.avatarAlt}
              width={36}
              height={36}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            <div
              style={{
                flex: fullWidthButtons ? '0 1 auto' : 1,
                minWidth: 0,
                maxWidth: fullWidthButtons ? '45%' : undefined,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.textPrimary,
                  overflow: fullWidthButtons ? 'hidden' : undefined,
                  textOverflow: fullWidthButtons ? 'ellipsis' : undefined,
                  whiteSpace: fullWidthButtons ? 'nowrap' : undefined,
                }}
              >
                {row.name}
              </div>
              <div style={{ fontSize: 11, color: t.textTertiary }}>{row.sub}</div>
            </div>
            {fullWidthButtons ? (
              <div style={{ flex: 1, minWidth: 0 }}>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    display: 'block',
                    background: t.brand,
                    color: '#ffffff',
                    height: 36,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'default',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {row.label}
                </button>
              </div>
            ) : (
              <button
                type="button"
                style={{
                  marginLeft: 'auto',
                  background: row.label === 'Requested' ? t.bgTertiary : followPillBg,
                  color: row.label === 'Requested' ? t.textTertiary : t.brandText,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  whiteSpace: 'nowrap',
                  cursor: 'default',
                  fontFamily: 'var(--font-sans)',
                  flexShrink: 0,
                }}
              >
                {row.label}
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="component-section">
      <h2 id="width" className="component-section-title">
        Width
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: t.textSecondary,
          lineHeight: 1.6,
          marginBottom: 28,
        }}
      >
        Buttons come in two width behaviors: fixed and intrinsic. Choosing the right one prevents layout
        tension and keeps hierarchy intact across every screen size.
      </p>

      <h3
        id="fixed-width"
        className="component-section-title"
        style={{ fontSize: 16, marginTop: 0, marginBottom: 12 }}
      >
        Fixed width — fill container
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: t.textSecondary,
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        The button stretches to match the width of its container minus padding. Use this for primary
        actions in forms, modals, and mobile sheets where the action should be unmissable.
      </p>

      <div style={dottedPad}>
        <div style={grid3}>
          <div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: W_ANNOT }}>Fill container</div>
              <div style={{ fontSize: 11, color: W_ANNOT, opacity: 0.75, marginTop: 4 }}>
                In Figma: set width to Fill in Auto Layout
              </div>
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12 }}
            >
              <div style={{ width: 40, height: 1, background: W_ANNOT }} />
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: W_ANNOT,
                  flexShrink: 0,
                }}
              />
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                color: W_ANNOT,
                fontWeight: 600,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Button stretches to fill container width
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                width: '100%',
                marginBottom: 10,
              }}
            >
              <span style={{ color: W_ANNOT, fontSize: 12, lineHeight: 1 }} aria-hidden>
                ←
              </span>
              <div style={{ flex: 1, height: 1, background: W_ANNOT }} />
              <span style={{ color: W_ANNOT, fontSize: 12, lineHeight: 1 }} aria-hidden>
                →
              </span>
            </div>
            <div
              style={{
                width: '100%',
                border: `1.5px dashed ${W_ANNOT}`,
                borderRadius: 12,
                padding: 16,
                position: 'relative',
                boxSizing: 'border-box',
              }}
            >
              <button
                type="button"
                style={{
                  width: '100%',
                  background: t.bgTertiary,
                  color: t.textPrimary,
                  height: '44px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0 20px',
                  border: 'none',
                  cursor: 'default',
                  fontFamily: 'var(--font-sans)',
                  boxSizing: 'border-box',
                }}
              >
                <Download size={16} color={t.textPrimary} strokeWidth={2} aria-hidden />
                Export report
                <ArrowRight
                  size={16}
                  color={t.textPrimary}
                  strokeWidth={2}
                  style={{ marginLeft: 'auto', opacity: 0.6 }}
                  aria-hidden
                />
              </button>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 4,
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <div style={{ width: 1, height: 14, background: W_ANNOT }} />
                  <span style={{ fontSize: 10, color: W_ANNOT, fontWeight: 600 }}>16px</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: W_ANNOT,
                  flexShrink: 0,
                }}
              />
              <div style={{ width: 40, height: 1, background: W_ANNOT }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: W_ANNOT }}>Trailing icon pins right</div>
              <div style={{ fontSize: 11, color: W_ANNOT, opacity: 0.75, marginTop: 4 }}>
                Reaches button edge minus padding — always
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3
        id="intrinsic-width"
        className="component-section-title"
        style={{ fontSize: 16, marginTop: 8, marginBottom: 12 }}
      >
        Intrinsic width — hug contents
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: t.textSecondary,
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        The button is only as wide as its content: label + icons + padding. Use this for secondary and
        tertiary actions, inline CTAs, and anywhere the button should feel lightweight.
      </p>

      <div style={{ ...dottedPad, marginBottom: 36 }}>
        <div style={grid3}>
          <div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.textSecondary }}>Hug contents</div>
              <div style={{ fontSize: 11, color: t.textTertiary, marginTop: 4 }}>
                In Figma: set width to Hug in Auto Layout
              </div>
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12 }}
            >
              <div style={{ width: 40, height: 1, background: t.border }} />
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: t.border,
                  flexShrink: 0,
                }}
              />
            </div>
          </div>

          <div>
            <div
              style={{
                width: '100%',
                border: `1.5px dashed ${t.borderStrong}`,
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: t.textTertiary,
                  fontWeight: 600,
                  textAlign: 'center',
                  marginBottom: 6,
                }}
              >
                container width
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  marginBottom: 16,
                }}
              >
                <div style={{ flex: 1, height: 1, background: t.borderStrong }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: t.bgTertiary,
                    color: t.textPrimary,
                    height: 40,
                    padding: '0 18px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'default',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <Star size={16} color={t.brandText} strokeWidth={2} aria-hidden />
                  Save draft
                  <ChevronDown size={15} color={t.textTertiary} strokeWidth={2} aria-hidden />
                </button>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: W_ANNOT,
                  fontWeight: 600,
                  marginTop: 12,
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                button width = label + icons + padding
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: t.border,
                  flexShrink: 0,
                }}
              />
              <div style={{ width: 40, height: 1, background: t.border }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.textSecondary }}>
                Icons stay 8px from label
              </div>
              <div style={{ fontSize: 11, color: t.textTertiary, marginTop: 4 }}>
                Gap never changes regardless of label length
              </div>
            </div>
          </div>
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
        }}
      >
        Fixed width
      </div>
      <div className="do-dont-grid">
        <div>
          <div className="do-card" style={{ padding: '32px 24px' }}>
            <div className="do-card-preview do-card-preview--tall">
              <WidthPricingCardMockup fullWidthPrimary />
            </div>
          </div>
          <div className="do-label">✓ Do</div>
          <p className="guidelines-caption">
            Fixed-width primary fills the card. The CTA is unmissable. Secondary action recedes naturally.
          </p>
        </div>
        <div>
          <div className="dont-card" style={{ padding: '32px 24px' }}>
            <div className="dont-card-preview dont-card-preview--tall">
              <WidthPricingCardMockup fullWidthPrimary={false} />
            </div>
          </div>
          <div className="dont-label">× Don&apos;t</div>
          <p className="guidelines-caption">
            A hugging button in a fixed layout looks lost. Users hesitate — is this really the main action?
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
        Intrinsic width
      </div>
      <div className="do-dont-grid">
        <div>
          <div className="do-card">
            <div className="do-card-preview do-card-preview--tall">
              <WidthContactsMockup fullWidthButtons={false} />
            </div>
          </div>
          <div className="do-label">✓ Do</div>
          <p className="guidelines-caption">
            Intrinsic buttons in list rows never compete with each other. Each hugs its own label.
          </p>
        </div>
        <div>
          <div className="dont-card">
            <div className="dont-card-preview dont-card-preview--tall">
              <WidthContactsMockup fullWidthButtons />
            </div>
          </div>
          <div className="dont-label">× Don&apos;t</div>
          <p className="guidelines-caption">
            Full-width buttons in list rows destroy the layout. The action swallows the content it belongs
            to.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Callout icon={<Ruler size={20} />} title="The simple rule">
          Fixed width when the button IS the hero of its container. Intrinsic width when the button lives
          alongside other content. When in doubt — if it&apos;s the only button in a card or modal footer,
          make it fixed.
        </Callout>
      </div>
    </div>
  );
}

export default function ButtonDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [variant, setVariant] = useState<ButtonVariant>('primary');
  const [size, setSize] = useState<ButtonSize>('md');
  const [state, setState] = useState<(typeof STATE_OPTIONS)[number]>('default');
  const [icons, setIcons] = useState<(typeof ICON_OPTIONS)[number]>('none');
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDark(theme === 'dark');
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const t = usageTheme(isDark);

  const leftIcon =
    icons === 'left' || icons === 'both' ? <Plus size={16} aria-hidden /> : undefined;
  const rightIcon =
    icons === 'right' || icons === 'both' ? <ArrowRight size={16} aria-hidden /> : undefined;

  const previewButton = (
    <Button
      variant={variant}
      size={size}
      isLoading={state === 'loading'}
      isDisabled={state === 'disabled'}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
    >
      Button
    </Button>
  );

  const tocItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'principles', label: 'Principles' },
    { id: 'anatomy', label: 'Anatomy' },
    { id: 'shape', label: 'Shape' },
    { id: 'hierarchy', label: 'Hierarchy' },
    { id: 'pairing-guide', label: 'Pairing guide', level: 2 as const },
    { id: 'primary', label: 'Primary', level: 2 as const },
    { id: 'secondary', label: 'Secondary', level: 2 as const },
    { id: 'danger', label: 'Danger', level: 2 as const },
    { id: 'icons', label: 'Icons' },
    { id: 'behavior', label: 'Behavior' },
    { id: 'touch-targets', label: 'Touch targets', level: 2 as const },
    { id: 'states', label: 'States' },
    { id: 'width', label: 'Width' },
    { id: 'fixed-width', label: 'Fixed width', level: 2 as const },
    { id: 'intrinsic-width', label: 'Intrinsic width', level: 2 as const },
  ];

  return (
    <>
      <div>
          <div id="overview">
            <header className="component-header">
        <p className="breadcrumb">Components</p>
        <h1 className="page-title">Button</h1>
        <p className="page-lead">
          Buttons let users take action, make choices, and move forward. They are one of the most
          fundamental interactive elements in any interface.
        </p>
        <div className="component-status">
          <span className="status-badge react">React</span>
          <span className="status-badge version">v0.1.0</span>
          <span className="status-badge accessible">Accessible</span>
          <span className="status-badge stable">Stable</span>
        </div>
            </header>

            <ComponentHero />
          </div>

          <ComponentTabs tabs={[...TABS]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'Overview' ? (
        <div className="component-tab-panel">
          <section className="component-section">
            <h2 className="component-section-title">Live interactive preview</h2>
            <div className="preview-shell">
              <div
                className={`preview-canvas${appearance === 'dark' ? ' dark-canvas' : ''}`}
              >
                {appearance === 'dark' ? (
                  <div data-theme="dark">{previewButton}</div>
                ) : (
                  previewButton
                )}
              </div>
              <div className="preview-panel">
                <div className="panel-group">
                  <span className="panel-label">Variant</span>
                  <div className="seg-control-row" role="group" aria-label="Variant">
                    <SegmentedControl
                      compact
                      options={VARIANT_ROW_1}
                      value={variant}
                      onChange={setVariant}
                    />
                    <SegmentedControl
                      compact
                      options={VARIANT_ROW_2}
                      value={variant}
                      onChange={setVariant}
                    />
                  </div>
                </div>
                <div className="panel-group">
                  <span className="panel-label">Size</span>
                  <SegmentedControl
                    options={SIZES.map((s) => ({ value: s, label: s }))}
                    value={size}
                    onChange={setSize}
                    aria-label="Size"
                  />
                </div>
                <div className="panel-group">
                  <span className="panel-label">State</span>
                  <SegmentedControl
                    options={STATE_OPTIONS.map((s) => ({ value: s, label: s }))}
                    value={state}
                    onChange={setState}
                    aria-label="State"
                  />
                </div>
                <div className="panel-group">
                  <span className="panel-label">Icons</span>
                  <SegmentedControl
                    compact
                    options={ICON_OPTIONS.map((s) => ({ value: s, label: s }))}
                    value={icons}
                    onChange={setIcons}
                    aria-label="Icons"
                  />
                </div>
                <div className="panel-group">
                  <span className="panel-label">Appearance</span>
                  <SegmentedControl
                    options={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                    ]}
                    value={appearance}
                    onChange={setAppearance}
                    aria-label="Appearance"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="component-section">
            <h2 id="principles" className="component-section-title">
              Principles
            </h2>
            <div className="cards-grid-3">
              <div className="info-card">
                <div className="principle-icon" aria-hidden>
                  <MousePointerClick size={20} strokeWidth={1.5} color="var(--color-brand)" />
                </div>
                <div className="info-card-title">Actionable</div>
                <p className="info-card-body">
                  Every button label tells users exactly what happens when they click. No mystery, no
                  ambiguity — just clear intent distilled into a word or phrase.
                </p>
              </div>
              <div className="info-card">
                <div className="principle-icon" aria-hidden>
                  <Layers size={20} strokeWidth={1.5} color="var(--color-brand)" />
                </div>
                <div className="info-card-title">Contextual</div>
                <p className="info-card-body">
                  Buttons work alongside other elements to surface the right action at the right moment.
                  The most important action always gets the most visual weight.
                </p>
              </div>
              <div className="info-card">
                <div className="principle-icon" aria-hidden>
                  <AlignLeft size={20} strokeWidth={1.5} color="var(--color-brand)" />
                </div>
                <div className="info-card-title">Concise</div>
                <p className="info-card-body">
                  Button labels capture user intent in as few words as possible — ideally 1 to 3. Every
                  word earns its place.
                </p>
              </div>
            </div>
          </section>

          <section className="component-section">
            <h2 id="anatomy" className="component-section-title">
              Anatomy
            </h2>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              A button is built from a container, a label, and optional icons. Every element plays a
              specific role.
            </p>
            <ButtonAnatomyDiagram t={t} />
          </section>

          <section className="component-section">
            <h2 id="shape" className="component-section-title">
              Shape
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: '20px',
                marginTop: '-8px',
              }}
            >
              VDS buttons come in five shapes. Each serves a specific layout context and level of visual
              emphasis.
            </p>
            <div className="shape-grid">
              <div className="shape-row">
                <div className="shape-canvas">
                  <Button variant="primary" size="md">
                    Label
                  </Button>
                </div>
                <div className="shape-info">
                  <div className="shape-name">Rect — Default</div>
                  <div className="shape-desc">
                    The standard VDS button shape. 8px border radius gives it a clean, modern feel that works
                    across all contexts — forms, dialogs, toolbars, and content areas.
                  </div>
                  <div className="shape-bestfor">
                    <strong>Best for:</strong> Most UI contexts. Forms, dialogs, toolbars, cards.
                  </div>
                </div>
              </div>
              <div className="shape-row">
                <div className="shape-canvas">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      background: 'var(--color-brand)',
                      color: '#ffffff',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: '700',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    Label
                  </span>
                </div>
                <div className="shape-info">
                  <div className="shape-name">Pill</div>
                  <div className="shape-desc">
                    Full border-radius creates a capsule shape. Softer and more playful than rect. Often used
                    for tags, status indicators, and inline CTAs where the button needs to feel lightweight.
                  </div>
                  <div className="shape-bestfor">
                    <strong>Best for:</strong> Filter chips, tags, inline actions, marketing CTAs.
                  </div>
                </div>
              </div>
              <div className="shape-row">
                <div className="shape-canvas">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      background: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border-strong)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={18} color="var(--color-text-primary)" strokeWidth={1.5} />
                  </span>
                </div>
                <div className="shape-info">
                  <div className="shape-name">Square</div>
                  <div className="shape-desc">
                    Equal width and height with a rectangular border radius. Used exclusively for icon-only
                    buttons in toolbars, sidebars, and compact UI surfaces. Always requires an aria-label.
                  </div>
                  <div className="shape-bestfor">
                    <strong>Best for:</strong> Toolbars, action menus, compact interfaces.
                  </div>
                </div>
              </div>
              <div className="shape-row">
                <div className="shape-canvas">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        background: 'var(--color-brand)',
                        borderRadius: '50%',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={18} color="#ffffff" strokeWidth={2} />
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        background: 'transparent',
                        border: '1px solid var(--color-border-strong)',
                        borderRadius: '50%',
                        cursor: 'pointer',
                      }}
                    >
                      <Bookmark size={16} color="var(--color-text-secondary)" strokeWidth={1.5} />
                    </span>
                  </div>
                </div>
                <div className="shape-info">
                  <div className="shape-name">Circle</div>
                  <div className="shape-desc">
                    Fully round. The circular shape draws maximum attention to the icon inside. Use the
                    primary variant for the most important floating action, and tertiary/secondary for supporting
                    actions nearby.
                  </div>
                  <div className="shape-bestfor">
                    <strong>Best for:</strong> FABs, floating actions, avatar buttons, icon-only CTAs.
                  </div>
                </div>
              </div>
              <div className="shape-row">
                <div className="shape-canvas">
                  <div style={{ width: '200px' }}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        height: '44px',
                        background: 'var(--color-brand)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '700',
                        fontFamily: 'var(--font-sans)',
                        cursor: 'pointer',
                      }}
                    >
                      <ArrowRight size={16} color="#ffffff" strokeWidth={2} />
                      Continue
                    </span>
                  </div>
                </div>
                <div className="shape-info">
                  <div className="shape-name">Full Width</div>
                  <div className="shape-desc">
                    Stretches to fill the full width of its parent container. Used for primary CTAs in
                    single-column layouts, mobile screens, and confirmation dialogs where the action should be
                    unmissable.
                  </div>
                  <div className="shape-bestfor">
                    <strong>Best for:</strong> Mobile CTAs, login/signup forms, confirmation dialogs.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="component-section">
            <h2 className="component-section-title">Variants</h2>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              VDS buttons come in five variants, each with a specific purpose and level of visual
              emphasis.
            </p>
            <LivePreview>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="tertiary">Tertiary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="link">Link</Button>
            </LivePreview>
          </section>

          <section className="component-section">
            <h2 className="component-section-title">Sizes</h2>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              Three sizes adapt to different layout densities and context needs.
            </p>
            <table className="token-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Height</th>
                  <th>Padding</th>
                  <th>Font size</th>
                  <th>Use when</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>sm</td>
                  <td>32px</td>
                  <td>0 12px</td>
                  <td>13px</td>
                  <td>Tight spaces, inline actions, table rows</td>
                </tr>
                <tr>
                  <td>md</td>
                  <td>40px</td>
                  <td>0 16px</td>
                  <td>14px</td>
                  <td>Default. Forms, dialogs, most UI contexts</td>
                </tr>
                <tr>
                  <td>lg</td>
                  <td>48px</td>
                  <td>0 20px</td>
                  <td>15px</td>
                  <td>Hero sections, primary CTAs, onboarding</td>
                </tr>
              </tbody>
            </table>
            <LivePreview>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </LivePreview>
          </section>

          <section className="component-section">
            <h2 className="component-section-title">States</h2>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              Buttons communicate their current condition through visual state changes.
            </p>
            <LivePreview>
              <div
                style={{
                  display: 'flex',
                  gap: 32,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ textAlign: 'center', maxWidth: 220 }}>
                  <Button>Default</Button>
                  <p className="guidelines-caption">Ready for interaction</p>
                </div>
                <div style={{ textAlign: 'center', maxWidth: 220 }}>
                  <Button isLoading>Loading</Button>
                  <p className="guidelines-caption">
                    Processing. Spinner replaces icon. Click is blocked.
                  </p>
                </div>
                <div style={{ textAlign: 'center', maxWidth: 220 }}>
                  <Button isDisabled>Disabled</Button>
                  <p className="guidelines-caption">
                    Not available. Use sparingly — always explain why.
                  </p>
                </div>
              </div>
            </LivePreview>
          </section>
        </div>
      ) : null}

      {activeTab === 'Usage' ? (
        <div className="component-tab-panel">
          <section className="component-section">
            <h2 id="hierarchy" className="component-section-title">
              Hierarchy
            </h2>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              Not all buttons are equal — and that&apos;s intentional. Hierarchy uses visual weight to
              guide users to the right action at the right moment. One variant leads. The rest support.
            </p>

            <div
              style={{
                marginBottom: '32px',
                border: `1px solid ${t.border}`,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  background: t.bgSecondary,
                  borderBottom: `1px solid ${t.border}`,
                  padding: '10px 0',
                }}
              >
                {['Highest', 'High', 'Medium', 'Low', 'Minimal'].map((label, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: '10px',
                      fontWeight: '800',
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: t.textTertiary,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div
                style={{
                  height: '6px',
                  background: isDark
                    ? `linear-gradient(to right, ${t.brand} 0%, ${t.brand} 20%, rgba(21,101,168,0.5) 40%, rgba(21,101,168,0.2) 60%, rgba(21,101,168,0.08) 80%, transparent 100%)`
                    : `linear-gradient(to right, ${t.brand} 0%, ${t.brand} 20%, rgba(0,43,73,0.5) 40%, rgba(0,43,73,0.2) 60%, rgba(0,43,73,0.08) 80%, transparent 100%)`,
                }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: t.bgSecondary,
                  backgroundImage: `radial-gradient(circle, ${t.border} 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                  padding: '28px 0',
                  borderTop: `1px solid ${t.border}`,
                }}
              >
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      background: '#C8102E',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      fontFamily: 'var(--font-sans)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <AlertTriangle size={14} color="#fff" strokeWidth={2} /> Danger
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      background: t.brand,
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      fontFamily: 'var(--font-sans)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Flame size={14} color="#fff" strokeWidth={2} /> Primary
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 16px',
                      background: t.bgTertiary,
                      color: t.textPrimary,
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      fontFamily: 'var(--font-sans)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Layers2 size={14} strokeWidth={2} /> Secondary
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 16px',
                      background: 'transparent',
                      color: t.brandText,
                      border: `1.5px solid ${t.brandBorder}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      fontFamily: 'var(--font-sans)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Feather size={14} strokeWidth={2} /> Tertiary
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 16px',
                      background: 'transparent',
                      color: t.brandText,
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      fontFamily: 'var(--font-sans)',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                      textDecorationColor: isDark ? 'rgba(91,159,212,0.45)' : 'rgba(0,43,73,0.4)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Link <ExternalLink size={13} strokeWidth={2} />
                  </span>
                </div>
              </div>
            </div>

            <table className="token-table hierarchy-reference-table">
              <thead>
                <tr>
                  <th
                    style={{
                      background: t.bgSecondary,
                      borderBottom: `2px solid ${t.borderStrong}`,
                      color: t.textTertiary,
                    }}
                  >
                    Variant
                  </th>
                  <th
                    style={{
                      background: t.bgSecondary,
                      borderBottom: `2px solid ${t.borderStrong}`,
                      color: t.textTertiary,
                    }}
                  >
                    Emphasis
                  </th>
                  <th
                    style={{
                      background: t.bgSecondary,
                      borderBottom: `2px solid ${t.borderStrong}`,
                      color: t.textTertiary,
                    }}
                  >
                    Per view
                  </th>
                  <th
                    style={{
                      background: t.bgSecondary,
                      borderBottom: `2px solid ${t.borderStrong}`,
                      color: t.textTertiary,
                    }}
                  >
                    Icon
                  </th>
                  <th
                    style={{
                      background: t.bgSecondary,
                      borderBottom: `2px solid ${t.borderStrong}`,
                      color: t.textTertiary,
                    }}
                  >
                    Use for
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: t.bgPrimary }}>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textPrimary }}>
                    Primary
                  </td>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>High</td>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>
                    <span className="emphasis-pill-high">1 only</span>
                  </td>
                  <td
                    className="hierarchy-reference-table__icon"
                    style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}
                  >
                    <Flame size={14} aria-hidden />
                  </td>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>
                    The single most important action. Move forward, confirm, submit.
                  </td>
                </tr>
                <tr style={{ background: t.bgPrimary }}>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textPrimary }}>
                    Secondary
                  </td>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>Medium</td>
                  <td
                    className="hierarchy-reference-table__per-view"
                    style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}
                  >
                    Several
                  </td>
                  <td
                    className="hierarchy-reference-table__icon"
                    style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}
                  >
                    <Layers2 size={14} aria-hidden />
                  </td>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>
                    Supporting actions that accompany a primary. Cancel, go back, learn more.
                  </td>
                </tr>
                <tr style={{ background: t.bgPrimary }}>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textPrimary }}>
                    Tertiary
                  </td>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>Low</td>
                  <td
                    className="hierarchy-reference-table__per-view"
                    style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}
                  >
                    A few
                  </td>
                  <td
                    className="hierarchy-reference-table__icon"
                    style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}
                  >
                    <Feather size={14} aria-hidden />
                  </td>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>
                    Dismissive or low-priority actions. Skip, close, not now.
                  </td>
                </tr>
                <tr style={{ background: t.bgPrimary }}>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textPrimary }}>Danger</td>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>High</td>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>
                    <span className="emphasis-pill-high">1 only</span>
                  </td>
                  <td
                    className="hierarchy-reference-table__icon"
                    style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}
                  >
                    <AlertTriangle size={14} aria-hidden />
                  </td>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>
                    Irreversible, destructive actions. Delete, remove, reset. Always confirm.
                  </td>
                </tr>
                <tr style={{ background: t.bgPrimary }}>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textPrimary }}>Link</td>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>Minimal</td>
                  <td
                    className="hierarchy-reference-table__per-view"
                    style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}
                  >
                    Many
                  </td>
                  <td
                    className="hierarchy-reference-table__icon"
                    style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}
                  >
                    <ExternalLink size={14} aria-hidden />
                  </td>
                  <td style={{ borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>
                    Inline navigation. Feels like a hyperlink but triggers an action.
                  </td>
                </tr>
              </tbody>
            </table>

            <h3
              id="pairing-guide"
              className="component-section-title"
              style={{ fontSize: 16, marginTop: 32, marginBottom: 8 }}
            >
              Pairing guide
            </h3>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              Good button pairings create clear hierarchy. Bad pairings compete.
            </p>
            <div className="do-dont-grid">
              <div>
                <DoCard>
                  <Button variant="tertiary">Cancel</Button>
                  <Button variant="primary">Save changes</Button>
                </DoCard>
                <p className="guidelines-caption">
                  One primary leads. Tertiary recedes. The choice is obvious.
                </p>
              </div>
              <div>
                <DontCard>
                  <Button variant="primary">Delete</Button>
                  <Button variant="primary">Save</Button>
                </DontCard>
                <p className="guidelines-caption">
                  Two primaries compete. Users freeze. Pick one leader.
                </p>
              </div>
              <div>
                <DoCard>
                  <Button variant="secondary">Learn more</Button>
                  <Button variant="primary">Get started</Button>
                </DoCard>
                <p className="guidelines-caption">
                  Secondary supports without distracting from the main CTA.
                </p>
              </div>
              <div>
                <DontCard>
                  <Button variant="danger">Remove</Button>
                  <Button variant="secondary">Cancel</Button>
                </DontCard>
                <p className="guidelines-caption">
                  Danger as a default action feels alarming. Reserve it for confirmation dialogs only.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <Callout title="The rule of one">
                In any given view, there should be at most one Primary button and one Danger button.
                Everything else supports them. When in doubt, ask:{' '}
                <em>&quot;What&apos;s the single most important thing a user can do right now?&quot;</em> —
                that gets Primary.
              </Callout>
            </div>
          </section>

          <div className="component-section">
            <h2 id="primary" className="component-section-title">
              Primary
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: t.textSecondary,
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              Use one primary button per view — the action you most want users to take. It should be
              unmistakable.
            </p>

            <div className="do-dont-grid">
              <div>
                <div className="do-card">
                  <div className="do-card-preview do-card-preview--tall">
                    <MobilePaymentCard variant="do" t={t} />
                  </div>
                </div>
                <div className="do-label">✓ Do</div>
                <p className="guidelines-caption">
                  One primary action leads at the bottom. Secondary button recedes. Users know exactly
                  what to do next.
                </p>
              </div>

              <div>
                <div className="dont-card">
                  <div className="dont-card-preview dont-card-preview--tall">
                    <MobilePaymentCard variant="dont" t={t} />
                  </div>
                </div>
                <div className="dont-label">× Don&apos;t</div>
                <p className="guidelines-caption">
                  Two primary buttons compete for attention. Users hesitate. Which action matters more?
                  The hierarchy is broken.
                </p>
              </div>
            </div>
          </div>

          <div className="component-section">
            <h2 id="secondary" className="component-section-title">
              Secondary
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: t.textSecondary,
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              Secondary buttons are the workhorses of UI. Pair them with a primary button to create clear
              hierarchy — the secondary recedes so the primary can lead.
            </p>

            <div className="do-dont-grid">
              <div>
                <div className="do-card">
                  <div className="do-card-preview do-card-preview--tall">
                    <LoginFormMockup variant="do" t={t} />
                  </div>
                </div>
                <div className="do-label">✓ Do</div>
                <p className="guidelines-caption">
                  One action leads. The other follows. Users always know which button matters more.
                </p>
              </div>

              <div>
                <div className="dont-card">
                  <div className="dont-card-preview dont-card-preview--tall">
                    <LoginFormMockup variant="dont" t={t} />
                  </div>
                </div>
                <div className="dont-label">× Don&apos;t</div>
                <p className="guidelines-caption">
                  Two primaries compete for attention. The secondary&apos;s job is to support, not to match.
                </p>
              </div>
            </div>
          </div>

          <div className="component-section">
            <h2 id="danger" className="component-section-title">
              Danger
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: t.textSecondary,
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              Reserved for irreversible, destructive actions — deleting data, revoking access, canceling a
              subscription. Because they cannot be undone, danger buttons must always be paired with a
              confirmation step.
            </p>

            <div
              style={{
                backgroundColor: t.bgPrimary,
                backgroundImage: `radial-gradient(circle, ${t.border} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                padding: '32px 24px',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: t.textTertiary,
                  }}
                >
                  Primary
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: t.textTertiary,
                  }}
                >
                  Secondary
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: t.textTertiary,
                  }}
                >
                  Tertiary
                </div>
              </div>
              <div
                style={{
                  height: 1,
                  background: t.border,
                  margin: '12px 0',
                }}
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  alignItems: 'center',
                  justifyItems: 'center',
                }}
              >
                <button
                  type="button"
                  style={{
                    background: '#C8102E',
                    color: '#ffffff',
                    height: 40,
                    padding: '0 20px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  style={{
                    background: 'rgba(200,16,46,0.08)',
                    color: '#C8102E',
                    height: 40,
                    padding: '0 20px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    color: '#C8102E',
                    height: 40,
                    padding: '0 20px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    border: '1.5px solid #C8102E',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Delete
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  marginTop: 10,
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: t.textSecondary,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  High emphasis. For modal confirmations and irreversible primary actions.
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: t.textSecondary,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Medium emphasis. Use when danger exists alongside other actions in a view.
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: t.textSecondary,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Low emphasis. Inline destructive actions where space or context is limited.
                </p>
              </div>
            </div>

            <DangerVariantShowcase t={t} />

            <div className="do-dont-grid">
              <div>
                <div className="do-card">
                  <div className="do-card-preview do-card-preview--tall">
                    <DangerConfirmDialogMockup t={t} />
                  </div>
                </div>
                <div className="do-label">✓ Do</div>
                <p className="guidelines-caption">
                  Always confirm before destroying. Pair danger with a secondary escape route.
                </p>
              </div>

              <div>
                <div className="dont-card">
                  <div className="dont-card-preview dont-card-preview--tall">
                    <DangerInlineListMockup t={t} />
                  </div>
                </div>
                <div className="dont-label">× Don&apos;t</div>
                <p className="guidelines-caption">
                  Don&apos;t scatter danger buttons inline without friction. Every click is one mistake away
                  from data loss.
                </p>
              </div>
            </div>
          </div>

          <div className="component-section">
            <h2 id="icons" className="component-section-title">
              Leading icons convey meaning, trailing icons indicate affordance
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: t.textSecondary,
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              Leading icons reinforce what a button does. Trailing icons hint at what happens after you
              interact — a dropdown, an external link, or a next step.
            </p>

            <div
              style={{
                backgroundColor: t.bgPrimary,
                backgroundImage: `radial-gradient(circle, ${t.border} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                padding: '40px 32px',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 0,
              }}
            >
              <div
                style={{
                  background: t.bgCard,
                  borderRadius: 14,
                  padding: '32px 40px',
                  boxShadow: t.shadowCard,
                  border: `1px solid ${t.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: 0,
                    rowGap: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      textAlign: 'right',
                      maxWidth: 200,
                      paddingRight: 0,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#E8186D' }}>Leading icon</div>
                    <div style={{ fontSize: 12, color: '#E8186D', marginTop: 2 }}>
                      Reinforces the meaning of the label
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 40, height: 1, background: '#E8186D' }} />
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: '#E8186D',
                        flexShrink: 0,
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    style={{
                      background: t.bgTertiary,
                      color: t.textPrimary,
                      height: 44,
                      padding: '0 18px',
                      borderRadius: 10,
                      fontSize: 15,
                      fontWeight: 600,
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'default',
                      fontFamily: 'var(--font-sans)',
                      flexShrink: 0,
                    }}
                  >
                    <Download size={18} color={t.textPrimary} strokeWidth={2} aria-hidden />
                    Export report
                    <ChevronDown size={16} color={t.textTertiary} strokeWidth={2} aria-hidden />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: '#E8186D',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ width: 40, height: 1, background: '#E8186D' }} />
                  </div>
                  <div style={{ maxWidth: 180, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#E8186D' }}>Trailing icon</div>
                    <div style={{ fontSize: 12, color: '#E8186D', marginTop: 2 }}>
                      Signals what happens after interaction — opens a menu, navigates, expands
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginTop: 16,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    backgroundColor: t.bgPrimary,
                    backgroundImage: `radial-gradient(circle, ${t.border} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    padding: '32px 24px',
                    borderRadius: 14,
                    border: `1px solid ${t.border}`,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
                    {[
                      { Icon: Upload, label: 'Upload file' },
                      { Icon: Share2, label: 'Share' },
                      { Icon: Download, label: 'Download' },
                      { Icon: Star, label: 'Add to favorites' },
                    ].map(({ Icon, label }) => (
                      <button
                        key={label}
                        type="button"
                        style={{
                          background: t.bgTertiary,
                          color: t.brandText,
                          borderRadius: 10,
                          height: 40,
                          padding: '0 16px',
                          border: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'default',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        <Icon size={18} color={t.brandText} strokeWidth={2} aria-hidden />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 12 }}>Leading icon examples</div>
                <p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.5, margin: '8px 0 0' }}>
                  Leading icons, placed to the left of the label, reinforce the meaning of the action.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    backgroundColor: t.bgPrimary,
                    backgroundImage: `radial-gradient(circle, ${t.border} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    padding: '32px 24px',
                    borderRadius: 14,
                    border: `1px solid ${t.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <button
                    type="button"
                    style={{
                      background: t.bgTertiary,
                      color: t.textPrimary,
                      borderRadius: 10,
                      height: 40,
                      padding: '0 16px',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'default',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    Sort by
                    <ChevronsUpDown size={16} color={t.textTertiary} strokeWidth={2} aria-hidden />
                  </button>
                  <div
                    style={{
                      marginTop: 8,
                      background: t.bgElevated,
                      borderRadius: 10,
                      border: `1px solid ${t.border}`,
                      boxShadow: t.shadow,
                      padding: '6px 0',
                      width: '100%',
                      maxWidth: 220,
                    }}
                  >
                    {[
                      { text: 'Newest first', selected: true },
                      { text: 'Oldest first', selected: false },
                      { text: 'A → Z', selected: false },
                      { text: 'Z → A', selected: false },
                    ].map((item) => (
                      <div
                        key={item.text}
                        style={{
                          padding: '10px 16px',
                          fontSize: 14,
                          color: t.textPrimary,
                          background: item.selected ? t.bgTertiary : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span style={{ width: 14, flexShrink: 0, display: 'flex', justifyContent: 'flex-start' }}>
                          {item.selected ? (
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: t.brandText,
                              }}
                              aria-hidden
                            />
                          ) : null}
                        </span>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 12 }}>Trailing icon example</div>
                <p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.5, margin: '8px 0 0' }}>
                  Trailing icons, placed to the right of the label, hint at interactivity — dropdowns,
                  external links, or next steps.
                </p>
              </div>
            </div>
          </div>

          <div className="component-section">
            <h2 id="behavior" className="component-section-title">
              Behavior
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: t.textSecondary,
                lineHeight: 1.6,
                marginBottom: 0,
              }}
            >
              Buttons trigger actions or navigate to a new destination. How they behave — their size,
              feedback, and placement — is just as important as how they look.
            </p>

            <div
              style={{
                height: 1,
                background: t.border,
                margin: '32px 0',
              }}
            />

            <h3
              id="touch-targets"
              className="component-section-title"
              style={{ fontSize: 16, marginTop: 0, marginBottom: 12 }}
            >
              Touch targets
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: t.textSecondary,
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              Every button in VDS has a minimum touch target of 48×48px — even when the visual size appears
              smaller. The invisible tap area extends beyond the visible button, reducing missed taps and user
              frustration.
            </p>
            <p
              style={{
                fontSize: '14px',
                color: t.textSecondary,
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              A 32px icon-only button still occupies a 48×48px interaction zone through padding. Users tap
              the area, not the pixel.
            </p>

            <div className="do-dont-grid">
              <div>
                <div className="do-card">
                  <div className="do-card-preview do-card-preview--tall">
                    <TouchTargetsMockup variant="do" t={t} />
                  </div>
                </div>
                <div className="do-label">✓ Do</div>
                <p className="guidelines-caption">
                  The tap area extends beyond the visible button. Users hit the target every time.
                </p>
              </div>

              <div>
                <div className="dont-card">
                  <div className="dont-card-preview dont-card-preview--tall">
                    <TouchTargetsMockup variant="dont" t={t} />
                  </div>
                </div>
                <div className="dont-label">× Don&apos;t</div>
                <p className="guidelines-caption">
                  Tight tap zones match only the visual size. Small buttons become nearly untappable,
                  especially on mobile.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <Callout icon={<Smartphone size={20} />} title="Why 48px?">
                Apple HIG and Material Design both recommend 44–48px as the minimum touch target. VDS
                follows the stricter 48px to ensure accessible, error-free interactions across all device
                sizes and input methods.
              </Callout>
            </div>
          </div>

          <ButtonUsageStatesSection t={t} isDark={isDark} />

          <ButtonUsageWidthSection t={t} isDark={isDark} />

          <section className="component-section">
            <h2 className="component-section-title">Tertiary</h2>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              Tertiary buttons are for low-stakes, dismissive actions. The outlined style recedes so the
              primary action can lead.
            </p>
            <div className="do-dont-grid">
              <div>
                <DoCard>
                  <Button variant="tertiary">Skip for now</Button>
                  <Button variant="primary">Set up profile</Button>
                </DoCard>
                <p className="guidelines-caption">
                  Tertiary gives users an escape without competing with the main action.
                </p>
              </div>
              <div>
                <DontCard>
                  <Button variant="tertiary">Delete account</Button>
                </DontCard>
                <p className="guidelines-caption">
                  Never use tertiary for destructive actions. Low visual weight suggests low consequence.
                </p>
              </div>
            </div>
          </section>

          <section className="component-section">
            <h2 className="component-section-title">Best practices</h2>

            <h3 className="component-section-title" style={{ fontSize: 15, marginTop: 8 }}>
              Avoid disabled buttons
            </h3>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              Disabled buttons frustrate users and are hard for low-vision users to see. Instead: let users
              click the button and show an inline error explaining what&apos;s missing. Only disable a
              button when the action is genuinely impossible — not just incomplete.
            </p>
            <div className="do-dont-grid">
              <div>
                <DoCard>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    <Button variant="primary">Continue</Button>
                    <span style={{ fontSize: 12, color: '#d22232', textAlign: 'center' }}>
                      Please enter your email to continue
                    </span>
                  </div>
                </DoCard>
                <p className="guidelines-caption">Button enabled + clear inline error.</p>
              </div>
              <div>
                <DontCard>
                  <Button variant="primary" isDisabled>
                    Continue
                  </Button>
                </DontCard>
                <p className="guidelines-caption">Greyed out button with no explanation.</p>
              </div>
            </div>

            <h3 className="component-section-title" style={{ fontSize: 15, marginTop: 24 }}>
              Buttons, not links
            </h3>
            <p className="component-header__desc" style={{ marginBottom: 0 }}>
              If an element triggers an action (submit, open dialog, delete), it should be a button — even
              if it looks like a link. Links navigate. Buttons act. This distinction matters for keyboard
              users and screen readers.
            </p>

            <h3 className="component-section-title" style={{ fontSize: 15, marginTop: 24 }}>
              Touch targets
            </h3>
            <p className="component-header__desc" style={{ marginBottom: 0 }}>
              All VDS buttons have a minimum touch target of 48×48px — even when visually smaller. The
              invisible padding ensures accurate tapping on mobile. Never override this with custom CSS.
            </p>
          </section>

          <section className="component-section">
            <h2 className="component-section-title">Width and icons</h2>

            <h3 className="component-section-title" style={{ fontSize: 15, marginTop: 0 }}>
              Width
            </h3>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              Buttons come in two width behaviors:
            </p>
            <div className="width-grid">
              <div className="width-card">
                <div className="width-card-preview">
                  <Button variant="primary">Save changes</Button>
                </div>
                <div className="width-card-info">
                  <div className="width-card-title">Intrinsic (default)</div>
                  <p className="width-card-desc">
                    Width hugs the label content plus padding. Use for most buttons — in forms, dialogs,
                    toolbars.
                  </p>
                </div>
              </div>
              <div className="width-card">
                <div className="width-card-preview width-card-preview--full">
                  <Button variant="primary" fullWidth>
                    Continue
                  </Button>
                </div>
                <div className="width-card-info">
                  <div className="width-card-title">Full width</div>
                  <p className="width-card-desc">
                    Stretches to fill its container. Use for primary CTAs in mobile layouts, hero sections,
                    or single-column forms.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="component-section-title" style={{ fontSize: 15, marginTop: 24 }}>
              Icons
            </h3>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              Leading icons reinforce the label&apos;s meaning. Trailing icons signal what will happen
              after clicking.
            </p>
            <LivePreview>
              <Button variant="primary" leftIcon={<Plus size={16} aria-hidden />}>
                New project
              </Button>
              <Button variant="secondary" rightIcon={<ArrowRight size={16} aria-hidden />}>
                Continue
              </Button>
              <Button variant="tertiary" leftIcon={<Download size={16} aria-hidden />}>
                Export
              </Button>
            </LivePreview>
            <p className="guidelines-caption" style={{ marginTop: 12 }}>
              Use 16px icons for sm/md buttons. Use 18px for lg buttons. Always pair icons with a label —
              icon-only buttons need an aria-label.
            </p>
          </section>

          <section className="component-section">
            <h2 className="component-section-title">Related components</h2>
            <div className="related-grid">
              <Link href="/docs/components/buttongroup" className="related-card">
                <div>
                  <div className="related-card-title">Button Group</div>
                  <p className="related-card-desc">
                    When you need multiple related actions side by side with consistent spacing.
                  </p>
                </div>
                <span className="related-card-arrow" aria-hidden>
                  →
                </span>
              </Link>
              <Link href="/docs/components/iconbutton" className="related-card">
                <div>
                  <div className="related-card-title">IconButton</div>
                  <p className="related-card-desc">
                    A button with only an icon and no visible label. Requires aria-label.
                  </p>
                </div>
                <span className="related-card-arrow" aria-hidden>
                  →
                </span>
              </Link>
              <Link href="/docs/components/link" className="related-card">
                <div>
                  <div className="related-card-title">Link</div>
                  <p className="related-card-desc">
                    For navigation. When you want button-like visuals but the destination is a URL.
                  </p>
                </div>
                <span className="related-card-arrow" aria-hidden>
                  →
                </span>
              </Link>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === 'Content' ? (
        <div className="component-tab-panel">
          <section className="component-section">
            <h2 className="component-section-title">Writing button labels</h2>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              Button labels are microcopy with outsized impact. A clear label removes hesitation. A vague
              one breaks trust.
            </p>
            <div className="content-rules">
              <div className="content-rule">
                <span className="content-rule-icon do" style={{ color: 'var(--color-brand)' }}>
                  ✓
                </span>
                <span>Use 1–3 words. If you need more, simplify the action or the flow.</span>
              </div>
              <div className="content-rule">
                <span className="content-rule-icon do" style={{ color: 'var(--color-brand)' }}>
                  ✓
                </span>
                <span>
                  Use sentence case always. &quot;Save changes&quot; not &quot;Save Changes&quot; not
                  &quot;SAVE CHANGES&quot;.
                </span>
              </div>
              <div className="content-rule">
                <span className="content-rule-icon do" style={{ color: 'var(--color-brand)' }}>
                  ✓
                </span>
                <span>Use action verbs. Start with a verb: Save, Delete, Send, Continue, Cancel.</span>
              </div>
              <div className="content-rule">
                <span className="content-rule-icon do" style={{ color: 'var(--color-brand)' }}>
                  ✓
                </span>
                <span>
                  Be specific. &quot;Send invoice&quot; beats &quot;Submit&quot;. &quot;Delete account&quot;
                  beats &quot;Confirm&quot;.
                </span>
              </div>
              <div className="content-rule">
                <span className="content-rule-icon do" style={{ color: 'var(--color-brand)' }}>
                  ✓
                </span>
                <span>Skip articles when space is tight. &quot;Add card&quot; works. &quot;Add a card&quot; also works if space allows.</span>
              </div>
              <div className="content-rule">
                <span className="content-rule-icon dont">✗</span>
                <span>No symbols: no +, /, &, or → inside the label text itself.</span>
              </div>
              <div className="content-rule">
                <span className="content-rule-icon dont">✗</span>
                <span>No punctuation: no periods, commas, exclamation points.</span>
              </div>
              <div className="content-rule">
                <span className="content-rule-icon dont">✗</span>
                <span>No pronouns: avoid &quot;I&quot;, &quot;me&quot;, &quot;my&quot;.</span>
              </div>
              <div className="content-rule">
                <span className="content-rule-icon dont">✗</span>
                <span>No &quot;now&quot;: it&apos;s implied. &quot;Save now&quot; → &quot;Save&quot;.</span>
              </div>
              <div className="content-rule">
                <span className="content-rule-icon dont">✗</span>
                <span>No wrapping: labels must fit on one line.</span>
              </div>
            </div>
          </section>

          <section className="component-section">
            <h2 className="component-section-title">Labels by variant</h2>

            <h3 className="component-section-title" style={{ fontSize: 15, marginTop: 8 }}>
              Primary buttons
            </h3>
            <table className="token-table">
              <thead>
                <tr>
                  <th>Use</th>
                  <th>Avoid</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Save changes</td>
                  <td>Submit</td>
                  <td>&quot;Save changes&quot; is specific</td>
                </tr>
                <tr>
                  <td>Continue</td>
                  <td>Next (sometimes)</td>
                  <td>&quot;Continue&quot; implies progress</td>
                </tr>
                <tr>
                  <td>Confirm</td>
                  <td>Yes</td>
                  <td>&quot;Confirm&quot; is action-oriented</td>
                </tr>
                <tr>
                  <td>Try again</td>
                  <td>Retry</td>
                  <td>More conversational</td>
                </tr>
                <tr>
                  <td>Send report</td>
                  <td>Send</td>
                  <td>More specific</td>
                </tr>
                <tr>
                  <td>Delete account</td>
                  <td>OK</td>
                  <td>Clear, irreversible</td>
                </tr>
              </tbody>
            </table>

            <h3 className="component-section-title" style={{ fontSize: 15, marginTop: 24 }}>
              Secondary buttons
            </h3>
            <table className="token-table">
              <thead>
                <tr>
                  <th>Use</th>
                  <th>Avoid</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Edit</td>
                  <td>Edit address (when near address)</td>
                  <td>Context makes it clear</td>
                </tr>
                <tr>
                  <td>Change</td>
                  <td>Change destination (near destination field)</td>
                  <td>Nearby content provides the noun</td>
                </tr>
                <tr>
                  <td>View details</td>
                  <td>Click here for details</td>
                  <td>&quot;Click here&quot; is meaningless</td>
                </tr>
                <tr>
                  <td>Learn more</td>
                  <td>More info</td>
                  <td>Actionable and clear</td>
                </tr>
              </tbody>
            </table>

            <h3 className="component-section-title" style={{ fontSize: 15, marginTop: 24 }}>
              Tertiary buttons
            </h3>
            <table className="token-table">
              <thead>
                <tr>
                  <th>Use</th>
                  <th>Avoid</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Skip for now</td>
                  <td>Maybe later</td>
                  <td>More decisive</td>
                </tr>
                <tr>
                  <td>No thanks</td>
                  <td>No</td>
                  <td>More polite, clearer</td>
                </tr>
                <tr>
                  <td>Cancel reservation</td>
                  <td>Cancel (when task is canceling)</td>
                  <td>Avoids self-referential Cancel</td>
                </tr>
                <tr>
                  <td>Go back</td>
                  <td>Back</td>
                  <td>More natural</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="component-section">
            <h2 className="component-section-title">Opposite actions</h2>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              When two buttons represent inverse choices, use verbs with opposite meaning. Users should
              understand the outcome of each option without reading anything else on screen.
            </p>
            <div className="do-dont-grid">
              <div>
                <DoCard>
                  <div className="opposite-demo">
                    <Button variant="tertiary">Cancel order</Button>
                    <Button variant="primary">Keep order</Button>
                  </div>
                </DoCard>
                <p className="guidelines-caption">Opposite verbs make the choice crystal clear.</p>
              </div>
              <div>
                <DontCard>
                  <div className="opposite-demo">
                    <Button variant="tertiary">No</Button>
                    <Button variant="primary">Yes</Button>
                  </div>
                </DontCard>
                <p className="guidelines-caption">
                  Yes/No provide no context. What does &apos;Yes&apos; confirm?
                </p>
              </div>
            </div>
            <div className="do-dont-grid">
              <div>
                <DoCard>
                  <div className="opposite-demo">
                    <Button variant="tertiary">Discard changes</Button>
                    <Button variant="primary">Save changes</Button>
                  </div>
                </DoCard>
                <p className="guidelines-caption">
                  The verb pair (Discard / Save) mirrors the stakes of each choice.
                </p>
              </div>
              <div>
                <DontCard>
                  <div className="opposite-demo">
                    <Button variant="tertiary">Cancel</Button>
                    <Button variant="primary">Cancel trip</Button>
                  </div>
                </DontCard>
                <p className="guidelines-caption">
                  Using &apos;Cancel&apos; for the dismissive action when the task IS canceling creates
                  confusion.
                </p>
              </div>
            </div>
          </section>

          <section className="component-section">
            <h2 className="component-section-title">In practice</h2>
            <div className="app-placeholder">
              <LayoutGrid size={40} className="app-placeholder-icon" strokeWidth={1.25} aria-hidden />
              <div className="app-placeholder-title">Application examples coming soon</div>
              <p className="app-placeholder-desc">
                Real UI patterns using VDS Button across different product contexts — dashboards, forms,
                mobile views, and more.
              </p>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === 'Code' ? (
        <div className="component-tab-panel">
          <section className="component-section">
            <h2 className="component-section-title">Installation</h2>
            <CodeBlock
              filename="terminal"
              language="bash"
              code={`npm install @vds/react
# or
pnpm add @vds/react`}
            />
          </section>

          <section className="component-section">
            <h2 className="component-section-title">Import</h2>
            <CodeBlock filename="Button.tsx" code={`import { Button } from '@vds/react'`} />
          </section>

          <section className="component-section">
            <h2 className="component-section-title">Usage examples</h2>
            <p className="code-example-label">Default primary</p>
            <CodeBlock
              filename="Button.tsx"
              code={`'use client'

import { Button } from '@vds/react'

export function SaveForm() {
  return (
    <Button variant="primary" onClick={() => handleSubmit()}>
      Save changes
    </Button>
  )
}

function handleSubmit() {
  // submit logic
}`}
            />

            <p className="code-example-label">All variants</p>
            <CodeBlock
              filename="Button.tsx"
              code={`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="tertiary">Tertiary</Button>
<Button variant="danger">Delete account</Button>
<Button variant="link">Learn more</Button>`}
            />

            <p className="code-example-label">Sizes</p>
            <CodeBlock
              filename="Button.tsx"
              code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}
            />

            <p className="code-example-label">With icons (lucide-react)</p>
            <CodeBlock
              filename="Button.tsx"
              code={`import { Plus, ArrowRight, Download } from 'lucide-react'

<Button variant="primary" leftIcon={<Plus size={16} />}>
  New project
</Button>

<Button variant="secondary" rightIcon={<ArrowRight size={16} />}>
  Continue
</Button>

<Button variant="tertiary" leftIcon={<Download size={16} />} rightIcon={<ArrowRight size={16} />}>
  Export
</Button>`}
            />

            <p className="code-example-label">Loading state</p>
            <CodeBlock
              filename="Button.tsx"
              code={`import { useState } from 'react'
import { Button } from '@vds/react'

export function SubmitExample() {
  const [loading, setLoading] = useState(false)

  return (
    <Button
      variant="primary"
      isLoading={loading}
      onClick={() => {
        setLoading(true)
        // your async action here
      }}
    >
      Submit form
    </Button>
  )
}`}
            />

            <p className="code-example-label">Disabled state</p>
            <CodeBlock
              filename="Button.tsx"
              code={`<Button variant="primary" isDisabled>
  Unavailable
</Button>`}
            />

            <p className="code-example-label">Full width</p>
            <CodeBlock
              filename="Button.tsx"
              code={`<Button variant="primary" fullWidth>
  Sign in to your account
</Button>`}
            />

            <p className="code-example-label">Click handler</p>
            <CodeBlock
              filename="Button.tsx"
              code={`import { Button } from '@vds/react'

<Button
  variant="secondary"
  onClick={() => {
    console.info('Button clicked')
  }}
>
  Run action
</Button>`}
            />
          </section>

          <section className="component-section">
            <h2 className="component-section-title">Props</h2>
            <PropsTable
              props={[
                {
                  name: 'variant',
                  type: "'primary' | 'secondary' | 'tertiary' | 'danger' | 'link'",
                  default: "'primary'",
                  description: 'Controls the visual style and semantic meaning of the button.',
                  required: false,
                },
                {
                  name: 'size',
                  type: "'sm' | 'md' | 'lg'",
                  default: "'md'",
                  description: 'Controls height, padding, and font size.',
                  required: false,
                },
                {
                  name: 'isLoading',
                  type: 'boolean',
                  default: 'false',
                  description: 'Shows a spinner, hides icons, and blocks interaction.',
                  required: false,
                },
                {
                  name: 'isDisabled',
                  type: 'boolean',
                  default: 'false',
                  description: 'Visually disables the button and removes pointer events.',
                  required: false,
                },
                {
                  name: 'fullWidth',
                  type: 'boolean',
                  default: 'false',
                  description: 'Stretches the button to fill its parent container.',
                  required: false,
                },
                {
                  name: 'leftIcon',
                  type: 'React.ReactNode',
                  default: '—',
                  description: 'Icon rendered before the label. Use 16px icons for sm/md, 18px for lg.',
                  required: false,
                },
                {
                  name: 'rightIcon',
                  type: 'React.ReactNode',
                  default: '—',
                  description: 'Icon rendered after the label. Use to signal what happens after clicking.',
                  required: false,
                },
                {
                  name: 'onClick',
                  type: '() => void',
                  default: '—',
                  description: 'Fired when the button is clicked. Not fired when isLoading or isDisabled.',
                  required: false,
                },
                {
                  name: 'children',
                  type: 'React.ReactNode',
                  default: '—',
                  description: 'The button label. Keep to 1–3 words. Must be text content.',
                  required: true,
                },
                {
                  name: 'type',
                  type: "'button' | 'submit' | 'reset'",
                  default: "'button'",
                  description: 'HTML button type. Use "submit" inside forms.',
                  required: false,
                },
                {
                  name: 'aria-label',
                  type: 'string',
                  default: '—',
                  description: 'Required when using icon-only buttons (no children text).',
                  required: false,
                },
              ]}
            />

            <div style={{ marginTop: '32px' }}>
              <Callout icon={<ShieldCheck size={20} />} title="Accessibility built in">
                All VDS buttons render as native {'<button>'} elements. They support keyboard navigation (Tab,
                Enter, Space), have visible focus rings (:focus-visible), and include proper ARIA states for
                loading (aria-busy) and disabled (aria-disabled) conditions.
              </Callout>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === 'Changelog' ? (
        <div className="component-tab-panel">
          <section className="component-section">
            <h2 className="component-section-title">Status</h2>
            <p className="component-header__desc" style={{ marginBottom: 16 }}>
              Availability across frameworks and platforms.
            </p>
            <table className="token-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Version</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>React</td>
                  <td>
                    <span className="status-dot stable" />
                    <span className="status-label-text stable">Stable</span>
                  </td>
                  <td>0.1.0</td>
                </tr>
                <tr>
                  <td>TypeScript types</td>
                  <td>
                    <span className="status-dot stable" />
                    <span className="status-label-text stable">Included</span>
                  </td>
                  <td>0.1.0</td>
                </tr>
                <tr>
                  <td>Figma</td>
                  <td>
                    <span className="status-dot progress" />
                    <span className="status-label-text progress">In progress</span>
                  </td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>React Native</td>
                  <td>
                    <span className="status-dot planned" />
                    <span className="status-label-text planned">Planned</span>
                  </td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>Web Components</td>
                  <td>
                    <span className="status-dot planned" />
                    <span className="status-label-text planned">Planned</span>
                  </td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="component-section">
            <h2 className="component-section-title">Changelog</h2>
            <div className="changelog-list">
              <div className="changelog-entry">
                <div className="changelog-date">2025-04-07</div>
                <div className="changelog-rail" aria-hidden />
                <div className="changelog-content">
                  <div className="changelog-tags">
                    <span className="changelog-tag tag-nonbreaking">Non-breaking</span>
                    <span className="changelog-tag tag-initial">Initial</span>
                  </div>
                  <p className="changelog-text">
                    Initial release. Button component with 5 variants (primary, secondary, tertiary,
                    danger, link), 3 sizes (sm, md, lg), loading state, disabled state, icon support, and
                    full width mode.
                  </p>
                </div>
              </div>
            </div>
            <p className="changelog-footnote">
              Changes to this component will be documented here with migration guides for breaking
              changes.
            </p>
          </section>
        </div>
      ) : null}
      </div>
      <TableOfContents items={tocItems} />
    </>
  );
}
