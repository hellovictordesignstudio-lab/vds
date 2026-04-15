'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Bell, ChevronRight, Circle, Hash, Tag, X } from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '../../../../components/docs/CodeBlock';
import { ComponentTabs } from '../../../../components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '../../../../components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'neutral';
type BadgeSize = 'sm' | 'md';

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

function AnnotationDot({ letter }: { letter: string }) {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#E8186D',
        color: 'white',
        fontSize: 10,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {letter}
    </div>
  );
}

function variantStyles(t: VDSTheme): Record<BadgeVariant, { bg: string; color: string; border: string }> {
  return {
    default: {
      bg: t.bg.fill.brandSubtle.default,
      color: t.text.brand.default,
      border: t.border.brand.default,
    },
    success: {
      bg: t.bg.fill.success.default,
      color: t.text.success.default,
      border: t.border.success.default,
    },
    danger: {
      bg: t.bg.fill.danger.default,
      color: t.text.danger.default,
      border: t.border.danger.default,
    },
    warning: {
      bg: t.bg.fill.warning.default,
      color: t.text.warning.default,
      border: t.border.warning.default,
    },
    neutral: {
      bg: t.bg.surface.tertiary.default,
      color: t.text.secondary.default,
      border: t.border.default.default,
    },
  };
}

const VARIANT_LABELS: Record<BadgeVariant, string> = {
  default: 'In progress',
  success: 'Completed',
  danger: 'Failed',
  warning: 'Expiring soon',
  neutral: 'Draft',
};

function LiveBadgePreview({
  t,
  variant,
  size,
  showDot,
  showIcon,
  showRemove,
}: {
  t: VDSTheme;
  variant: BadgeVariant;
  size: BadgeSize;
  showDot: boolean;
  showIcon: boolean;
  showRemove: boolean;
}) {
  const vs = variantStyles(t)[variant];
  const label = VARIANT_LABELS[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: size === 'sm' ? 20 : 24,
        padding: size === 'sm' ? '0 7px' : '0 9px',
        borderRadius: 9999,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 700,
        background: vs.bg,
        color: vs.color,
        border: `1px solid ${vs.border}`,
        fontFamily: 'var(--font-sans), Nunito Sans, system-ui, sans-serif',
      }}
    >
      {showDot ? (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: vs.color,
            flexShrink: 0,
          }}
        />
      ) : null}
      {showIcon ? <Tag size={11} aria-hidden /> : null}
      {label}
      {showRemove ? (
        <span style={{ cursor: 'pointer', opacity: 0.7, display: 'flex' }} role="presentation">
          <X size={11} aria-hidden />
        </span>
      ) : null}
    </span>
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

function miniBadge(
  t: VDSTheme,
  v: BadgeVariant,
  text: string,
  opts?: { size?: BadgeSize; dot?: boolean },
) {
  const vs = variantStyles(t)[v];
  const s = opts?.size ?? 'sm';
  const isSmall = s === 'sm';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: isSmall ? 20 : 24,
        padding: isSmall ? '0 7px' : '0 9px',
        borderRadius: 9999,
        fontSize: isSmall ? 11 : 12,
        fontWeight: 700,
        background: vs.bg,
        color: vs.color,
        border: `1px solid ${vs.border}`,
        fontFamily: 'var(--font-sans), Nunito Sans, system-ui, sans-serif',
      }}
    >
      {opts?.dot ? (
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: vs.color, flexShrink: 0 }} />
      ) : null}
      {text}
    </span>
  );
}

export default function BadgeDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [variant, setVariant] = useState<BadgeVariant>('default');
  const [size, setSize] = useState<BadgeSize>('md');
  const [dot, setDot] = useState<'off' | 'on'>('off');
  const [icon, setIcon] = useState<'off' | 'on'>('off');
  const [remove, setRemove] = useState<'off' | 'on'>('off');
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const t = buildTheme(isDark);
  const previewT = appearance === 'dark' ? buildTheme(true) : t;

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-bd', label: 'Principles' },
        { id: 'anatomy-bd', label: 'Anatomy' },
        { id: 'variants-bd', label: 'Variants' },
        { id: 'sizes-bd', label: 'Sizes' },
        { id: 'types-bd', label: 'Types' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-bd', label: 'When to use' },
        { id: 'placement-bd', label: 'Placement' },
        { id: 'dos-donts-bd', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'content-labels-bd', label: 'Label writing' },
        { id: 'content-status-bd', label: 'Status vocabulary' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-bd', label: 'Installation' },
        { id: 'import-bd', label: 'Import' },
        { id: 'examples-bd', label: 'Usage examples' },
        { id: 'props-bd', label: 'Props' },
        { id: 'a11y-bd', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const propsRows = [
    {
      name: 'variant',
      type: "'default' | 'success' | 'danger' | 'warning' | 'neutral'",
      default: "'default'",
      description: 'Color and semantic style',
    },
    { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Height variant' },
    { name: 'dot', type: 'boolean', default: 'false', description: 'Show colored dot before label' },
    { name: 'leftIcon', type: 'ReactNode', default: '—', description: 'Icon before label' },
    { name: 'onRemove', type: '() => void', default: '—', description: 'Show X button and handle removal' },
    { name: 'count', type: 'number', default: '—', description: 'Numeric display mode' },
    { name: 'maxCount', type: 'number', default: '99', description: 'Show N+ when count exceeds this' },
    { name: 'children', type: 'ReactNode', default: '—', description: 'Badge label content' },
    { name: 'className', type: 'string', default: '—', description: 'Additional CSS classes' },
  ];

  const showDot = dot === 'on';
  const showIcon = icon === 'on';
  const showRemove = remove === 'on';

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Badge
      </p>
      <h1 className="page-title">Badge</h1>
      <p className="page-lead">
        Badges label, categorize, and quantify. A badge adds a layer of meaning to the element it accompanies — status, count,
        category, or state. It never stands alone; it always supports another piece of content.
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
              canvasIsDark={appearance === 'dark'}
              controls={
                <>
                  <LivePreviewSegmentRow
                    t={t}
                    label="Variant"
                    options={['default', 'success', 'danger', 'warning', 'neutral']}
                    value={variant}
                    onChange={setVariant}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Size"
                    options={['sm', 'md']}
                    value={size}
                    onChange={setSize}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Dot"
                    options={['off', 'on']}
                    value={dot}
                    onChange={setDot}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Icon"
                    options={['off', 'on']}
                    value={icon}
                    onChange={setIcon}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Remove"
                    options={['off', 'on']}
                    value={remove}
                    onChange={setRemove}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Appearance"
                    options={['Light', 'Dark']}
                    value={appearance === 'dark' ? 'Dark' : 'Light'}
                    onChange={(v) => setAppearance(v === 'Dark' ? 'dark' : 'light')}
                    showDivider={false}
                  />
                </>
              }
            >
              <LiveBadgePreview
                t={previewT}
                variant={variant}
                size={size}
                showDot={showDot}
                showIcon={showIcon}
                showRemove={showRemove}
              />
            </LivePreviewShell>
          </section>

          <section id="principles-bd" style={{ marginBottom: 48 }}>
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 24, minHeight: 140 }}>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['New', 'Sale', 'Out of stock'].map((label, i) => (
                      <div
                        key={label}
                        style={{
                          width: 88,
                          height: 72,
                          borderRadius: 10,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          position: 'relative',
                          padding: 8,
                          fontSize: 9,
                          color: t.text.tertiary.default,
                        }}
                      >
                        {i === 0 ? miniBadge(t, 'success', 'New', { size: 'sm' }) : null}
                        {i === 1 ? miniBadge(t, 'danger', 'Sale', { size: 'sm' }) : null}
                        {i === 2 ? miniBadge(t, 'neutral', 'Out of stock', { size: 'sm' }) : null}
                        <div style={{ marginTop: 24 }}>Product</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Tag size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Always supplementary</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A badge never stands alone. It adds a layer of meaning to existing content — a card, a nav item, an avatar, a
                    list item. Remove the badge and the content should still make sense.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 24, display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ position: 'relative' }}>
                      <Bell size={22} color={t.text.secondary.default} aria-hidden />
                      <span
                        style={{
                          position: 'absolute',
                          top: -4,
                          right: -6,
                          minWidth: 18,
                          height: 18,
                          padding: '0 5px',
                          borderRadius: 999,
                          background: t.bg.fill.danger.default,
                          color: t.text.danger.default,
                          border: `1px solid ${t.border.danger.default}`,
                          fontSize: 10,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        12
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: t.text.tertiary.default }}>count</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Hash size={16} color={t.text.tertiary.default} aria-hidden />
                    {miniBadge(t, 'default', 'Design')}
                    <span style={{ fontSize: 11, color: t.text.tertiary.default }}>label</span>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Hash size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Label or count — not both</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A badge is either a label (text describing a category or status) or a count (number). Never combine both in a
                    single badge — the visual becomes too dense. If you need both, use two badges.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 24, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {miniBadge(t, 'danger', 'Error')}
                  {miniBadge(t, 'warning', 'Review')}
                  {miniBadge(t, 'neutral', 'Category')}
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Bell size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Semantic color</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Use the variant that matches the severity or meaning — not the one that looks best. Danger is reserved for
                    errors and critical states. Warning for non-blocking issues. Default for categories and general labels.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-bd" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                minHeight: 180,
                backgroundColor: t.bg.surface.secondary.default,
                backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                backgroundSize: '12px 12px',
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                padding: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Circle size={10} style={{ color: t.text.success.default }} aria-hidden />
                  <Tag size={12} color={t.text.tertiary.default} aria-hidden />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="D" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>Label text</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="E" />
                    <span style={{ color: t.icon.tertiary.default }}>
                      <X size={14} aria-hidden />
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    height: 24,
                    padding: '0 9px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 700,
                    background: variantStyles(t).default.bg,
                    color: variantStyles(t).default.color,
                    border: `1px solid ${variantStyles(t).default.border}`,
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: 10, color: '#E8186D', position: 'absolute', left: -28, top: 4 }}>A</span>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: variantStyles(t).default.color,
                    }}
                  />
                  <span style={{ fontSize: 10, color: '#E8186D', marginLeft: 2 }}>B</span>
                  <Tag size={11} aria-hidden />
                  <span style={{ fontSize: 10, color: '#E8186D', marginLeft: 2 }}>C</span>
                  Label
                  <X size={11} aria-hidden />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <AnnotationDot letter="F" />
                  <span style={{ fontSize: 11, color: t.text.tertiary.default }}>Border (1px, variant color)</span>
                </div>
              </div>
            </div>
          </section>

          <section id="variants-bd" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {(
                [
                  {
                    v: 'default' as const,
                    token: 'color.bg.fill.brandSubtle.default',
                    label: 'In progress',
                    desc: 'General labels, categories, states. The neutral starting point.',
                  },
                  {
                    v: 'success' as const,
                    token: 'color.bg.fill.success.default',
                    label: 'Completed',
                    desc: 'Positive outcome, completed state, available status.',
                  },
                  {
                    v: 'danger' as const,
                    token: 'color.bg.fill.danger.default',
                    label: 'Failed',
                    desc: 'Error state, failed operation, critical condition.',
                  },
                  {
                    v: 'warning' as const,
                    token: 'color.bg.fill.warning.default',
                    label: 'Expiring soon',
                    desc: 'Non-blocking issue, approaching threshold, requires attention.',
                  },
                  {
                    v: 'neutral' as const,
                    token: 'color.bg.surface.tertiary.default',
                    label: 'Draft',
                    desc: 'Inactive, draft, archived, or de-emphasized states.',
                  },
                ] as const
              ).map((row) => {
                const vs = variantStyles(t)[row.v];
                return (
                  <div
                    key={row.v}
                    style={{
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: 80,
                        background: t.bg.surface.secondary.default,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          height: 24,
                          padding: '0 9px',
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: vs.bg,
                          color: vs.color,
                          border: `1px solid ${vs.border}`,
                          fontFamily: 'var(--font-sans), Nunito Sans, system-ui, sans-serif',
                        }}
                      >
                        {row.label}
                      </span>
                    </div>
                    <div style={{ padding: '12px 16px', borderTop: `1px solid ${t.border.default.default}` }}>
                      <span style={chipStyleB(t, { marginBottom: 8 })}>{row.token}</span>
                      <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>{row.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="sizes-bd" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div
              style={{
                backgroundColor: t.bg.surface.secondary.default,
                backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                backgroundSize: '10px 10px',
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                padding: 32,
                display: 'flex',
                gap: 32,
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', fontFamily: 'var(--font-mono)' }}>20px</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: 20,
                    padding: '0 7px',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 700,
                    background: variantStyles(t).default.bg,
                    color: variantStyles(t).default.color,
                    border: `1px solid ${variantStyles(t).default.border}`,
                    fontFamily: 'var(--font-sans), Nunito Sans, system-ui, sans-serif',
                  }}
                >
                  SM
                </span>
                <span style={{ fontSize: 10, color: t.text.tertiary.default }}>sm</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', fontFamily: 'var(--font-mono)' }}>24px</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: 24,
                    padding: '0 9px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 700,
                    background: variantStyles(t).default.bg,
                    color: variantStyles(t).default.color,
                    border: `1px solid ${variantStyles(t).default.border}`,
                    fontFamily: 'var(--font-sans), Nunito Sans, system-ui, sans-serif',
                  }}
                >
                  MD
                </span>
                <span style={{ fontSize: 10, color: t.text.tertiary.default }}>md — default</span>
              </div>
            </div>
            <div
              style={{
                background: t.bg.surface.primary.default,
                borderRadius: 12,
                border: `1px solid ${t.border.default.default}`,
                overflow: 'hidden',
                marginTop: 16,
              }}
            >
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    {['SIZE', 'HEIGHT', 'PADDING', 'FONT SIZE', 'USE CASE'].map((h) => (
                      <th key={h} style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['sm', '20px', '0 7px', '11px', 'Dense tables, compact lists, sidebar nav'],
                    ['md', '24px', '0 9px', '12px', 'Default — cards, headings, standard UI'],
                  ].map((r, i) => (
                    <tr key={r[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>
                        {r[0]}
                        {i === 1 ? (
                          <span style={{ marginLeft: 8 }}>
                            <span style={chipStyleA({ fontSize: 10, padding: '2px 8px' })}>default</span>
                          </span>
                        ) : null}
                      </td>
                      <td style={{ padding: 12 }}>{r[1]}</td>
                      <td style={{ padding: 12 }}>{r[2]}</td>
                      <td style={{ padding: 12 }}>{r[3]}</td>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>{r[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="types-bd" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Types
            </h2>
            <p style={{ fontSize: 17, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              Four badge types cover all labeling and counting needs.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ background: t.bg.surface.secondary.default, padding: 24, minHeight: 100, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                  {['Design', 'Engineering', 'Marketing'].map((lab) => (
                    <span key={lab}>{miniBadge(t, 'default', lab)}</span>
                  ))}
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Label</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '0 0 8px' }}>
                    Text describing a category, status, or property. The most common type.
                  </p>
                  <p style={{ fontSize: 12, color: t.text.tertiary.default, margin: 0 }}>
                    Examples: &quot;New&quot; · &quot;Draft&quot; · &quot;Beta&quot; · &quot;Deprecated&quot; · &quot;Pro&quot;
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 24, display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <Bell size={24} color={t.text.secondary.default} aria-hidden />
                    <span
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -8,
                        minWidth: 20,
                        height: 20,
                        padding: '0 6px',
                        borderRadius: 999,
                        background: t.bg.fill.danger.default,
                        color: t.text.danger.default,
                        border: `1px solid ${t.border.danger.default}`,
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      12
                    </span>
                  </div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: t.bg.surface.tertiary.default,
                      color: t.text.secondary.default,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      position: 'relative',
                    }}
                  >
                    A
                    <span
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: t.bg.fill.danger.default,
                        color: t.text.danger.default,
                        border: `1px solid ${t.border.danger.default}`,
                        fontSize: 10,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      3
                    </span>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Count</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '0 0 8px' }}>
                    Numeric value indicating quantity. Shows on nav items, avatars, and icons.
                  </p>
                  <p style={{ fontSize: 12, color: t.text.tertiary.default, margin: 0 }}>
                    Show &quot;99+&quot; when count &gt; 99. Show &quot;0&quot; only when zero is meaningful.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 24, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                  {miniBadge(t, 'success', 'Online', { dot: true })}
                  {miniBadge(t, 'neutral', 'Offline', { dot: true })}
                  {miniBadge(t, 'warning', 'Busy', { dot: true })}
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: t.text.success.default,
                      display: 'inline-block',
                    }}
                  />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Dot</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '0 0 8px' }}>
                    Colored dot for subtle status indication. Use when color alone communicates the meaning clearly.
                  </p>
                  <p style={{ fontSize: 12, color: t.text.tertiary.default, margin: 0 }}>
                    Examples: ● Online · ● Offline · ● Busy
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 24 }}>
                  <div
                    style={{
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      background: t.bg.surface.primary.default,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                      fontSize: 12,
                    }}
                  >
                    {['React', 'TypeScript', 'Next.js'].map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          height: 24,
                          padding: '0 8px 0 9px',
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: variantStyles(t).default.bg,
                          color: variantStyles(t).default.color,
                          border: `1px solid ${variantStyles(t).default.border}`,
                        }}
                      >
                        {tag}
                        <X size={11} aria-hidden />
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Removable</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Badge with X button for user-removable tags. Common in filter chips, multi-select inputs, and tag lists.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-bd" style={{ marginTop: 32, marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div
                style={{
                  background: 'rgba(10,136,83,0.04)',
                  border: '1px solid rgba(10,136,83,0.2)',
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0A8853', marginBottom: 12, letterSpacing: '0.06em' }}>DO</div>
                {['Status labels on list items', 'Counts on nav icons', 'Category tags on cards', 'Filter chips'].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: 'rgba(232,24,109,0.04)',
                  border: '1px solid rgba(232,24,109,0.2)',
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: '#E8186D', marginBottom: 12, letterSpacing: '0.06em' }}>
                  DON&apos;T
                </div>
                {['As the only interactive element', 'As buttons', 'For long text (>3 words)', 'Nested inside other badges'].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="placement-bd" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Placement
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {(
                [
                  {
                    title: 'On nav items',
                    body: 'Badge for unread count — top-right of the nav icon.',
                    node: (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Bell size={28} color={t.text.secondary.default} aria-hidden />
                        <span
                          style={{
                            position: 'absolute',
                            top: -4,
                            right: -6,
                            minWidth: 18,
                            height: 18,
                            padding: '0 5px',
                            borderRadius: 999,
                            background: t.bg.fill.danger.default,
                            color: t.text.danger.default,
                            border: `1px solid ${t.border.danger.default}`,
                            fontSize: 10,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          5
                        </span>
                      </div>
                    ),
                  },
                  {
                    title: 'On cards',
                    body: '“New” at the top of the card; “Sale” on the image corner.',
                    node: (
                      <div
                        style={{
                          width: 120,
                          height: 80,
                          borderRadius: 10,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ position: 'absolute', top: 8, left: 8 }}>{miniBadge(t, 'success', 'New', { size: 'sm' })}</div>
                        <div style={{ position: 'absolute', bottom: 8, right: 8 }}>{miniBadge(t, 'danger', 'Sale', { size: 'sm' })}</div>
                      </div>
                    ),
                  },
                  {
                    title: 'Inline text',
                    body: '“Beta” next to a feature name in a heading.',
                    node: (
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, display: 'flex', alignItems: 'center', gap: 8 }}>
                        Feature name
                        {miniBadge(t, 'default', 'Beta', { size: 'sm' })}
                      </div>
                    ),
                  },
                ] as const
              ).map((p) => (
                <div
                  key={p.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ background: t.bg.surface.secondary.default, padding: 24, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.node}
                  </div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>{p.title}</div>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="dos-donts-bd" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <IllustratedDoDont
                t={t}
                ok
                title="Keep labels short"
                caption="Short labels scan quickly and stay readable at small sizes."
              >
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['New', 'Pro', 'Beta', 'Draft'].map((x) => (
                    <span key={x}>{miniBadge(t, 'default', x, { size: 'sm' })}</span>
                  ))}
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Keep labels short"
                caption="Long phrases defeat the purpose of a compact badge."
              >
                <span style={{ fontSize: 11, maxWidth: 260, textAlign: 'center' }}>
                  {miniBadge(t, 'neutral', 'Currently in beta testing', { size: 'sm' })}
                </span>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="One badge per element"
                caption="A single badge keeps hierarchy clear."
              >
                <div style={{ width: 120, height: 72, borderRadius: 10, border: `1px solid ${t.border.default.default}`, position: 'relative', background: t.bg.surface.primary.default }}>
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>{miniBadge(t, 'success', 'New', { size: 'sm' })}</div>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="One badge per element"
                caption="Stacking many badges creates noise and competing focal points."
              >
                <div style={{ width: 140, height: 88, borderRadius: 10, border: `1px solid ${t.border.default.default}`, position: 'relative', background: t.bg.surface.primary.default, padding: 8 }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {miniBadge(t, 'success', 'New', { size: 'sm' })}
                    {miniBadge(t, 'danger', 'Sale', { size: 'sm' })}
                    {miniBadge(t, 'warning', 'Limited', { size: 'sm' })}
                  </div>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Color matches meaning"
                caption="Danger signals errors — use the variant that matches severity."
              >
                {miniBadge(t, 'danger', 'Error')}
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Color matches meaning"
                caption="Don’t pick default for errors just because it fits the layout."
              >
                {miniBadge(t, 'default', 'Error')}
              </IllustratedDoDont>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="content-labels-bd" style={{ marginTop: 32, marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Label writing
            </h2>
            <div
              style={{
                background: t.bg.surface.secondary.default,
                borderRadius: 12,
                border: `1px solid ${t.border.default.default}`,
                padding: 20,
              }}
            >
              <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, fontSize: 13, lineHeight: 1.7 }}>
                <li>One or two words max</li>
                <li>Sentence case: &apos;In progress&apos;, not &apos;IN PROGRESS&apos;</li>
                <li>Noun or adjective: &apos;Draft&apos;, &apos;New&apos;, &apos;Beta&apos; — not verbs</li>
                <li>For counts: show &apos;+&apos; after max (99+), never truncate silently</li>
              </ul>
            </div>
          </section>

          <section id="content-status-bd" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Status vocabulary
            </h2>
            <p style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 12 }}>
              Standard status labels for consistency across VDS:
            </p>
            <div
              style={{
                background: t.bg.surface.primary.default,
                borderRadius: 12,
                border: `1px solid ${t.border.default.default}`,
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <th style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>State</th>
                    <th style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>Label</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Active', 'Active'],
                    ['Inactive', 'Inactive'],
                    ['Draft', 'Draft'],
                    ['Published', 'Published'],
                    ['Archived', 'Archived'],
                    ['Deprecated', 'Deprecated'],
                    ['New', 'New'],
                    ['Beta', 'Beta'],
                    ['Pro', 'Pro'],
                  ].map((r) => (
                    <tr key={r[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>{r[0]}</td>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>&quot;{r[1]}&quot;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="install-bd" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-bd" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock code={`import { Badge } from '@vds/react'`} filename="component.tsx" language="tsx" />
          </section>
          <section id="examples-bd" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock
                code={`<Badge variant="default">In progress</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="danger">Failed</Badge>
<Badge variant="warning">Expiring soon</Badge>
<Badge variant="neutral">Draft</Badge>`}
                filename="Basic label"
                language="tsx"
              />
              <CodeBlock
                code={`<Badge variant="success" dot>Online</Badge>
<Badge variant="danger" dot>Offline</Badge>`}
                filename="With dot"
                language="tsx"
              />
              <CodeBlock
                code={`<Badge variant="danger" count={12} />
<Badge variant="default" count={150} maxCount={99} />  {/* shows "99+" */}`}
                filename="Count badge"
                language="tsx"
              />
              <CodeBlock
                code={`<Badge variant="default" onRemove={() => removeTag('react')}>
  React
</Badge>`}
                filename="Removable"
                language="tsx"
              />
              <CodeBlock
                code={`<Badge size="sm">New</Badge>
<Badge size="md">New</Badge>  {/* default */}`}
                filename="Sizes"
                language="tsx"
              />
              <CodeBlock
                code={`<NavItem icon={<Bell />} label="Notifications">
  <Badge variant="danger" count={unreadCount} size="sm" />
</NavItem>`}
                filename="In context"
                language="tsx"
              />
            </div>
          </section>
          <section id="props-bd" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Props
            </h3>
            <PropsTable props={propsRows} />
          </section>
          <section id="a11y-bd" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Accessibility
            </h3>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="info" title="Accessibility notes">
                Badge text is read by screen readers as inline content. For count badges, consider aria-label on the parent
                element: &apos;Notifications, 12 unread&apos;. For removable badges, the X button has aria-label=&apos;Remove
                [label]&apos;. Color is never the only indicator — the label text always carries the meaning.
              </Callout>
            </div>
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
                Initial release. All variants, sizes, dot, count, removable.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
