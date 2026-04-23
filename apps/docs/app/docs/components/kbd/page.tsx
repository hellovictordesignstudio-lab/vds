'use client';

import { Fragment, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronRight,
  ChevronUp,
  Command,
  CornerDownLeft,
  Keyboard,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type KbdVariant = 'default' | 'outline' | 'brand';
type KbdSize = 'xs' | 'sm' | 'md' | 'lg';
type KbdSeparator = '+' | 'then' | '/';

const SIZE_MAP: Record<KbdSize, { fontSize: number; padding: string; minWidth: number; height: number }> = {
  xs: { fontSize: 10, padding: '2px 5px', minWidth: 18, height: 18 },
  sm: { fontSize: 11, padding: '3px 6px', minWidth: 22, height: 22 },
  md: { fontSize: 12, padding: '4px 8px', minWidth: 26, height: 26 },
  lg: { fontSize: 13, padding: '5px 10px', minWidth: 32, height: 32 },
};

const SYMBOL_TO_ARIA: Record<string, string> = {
  '⌘': 'Command',
  '⌃': 'Control',
  '⌥': 'Option',
  '⇧': 'Shift',
  '↵': 'Return',
  '⌫': 'Delete',
  '⎋': 'Escape',
  '⇥': 'Tab',
  '↑': 'Up arrow',
  '↓': 'Down arrow',
  '←': 'Left arrow',
  '→': 'Right arrow',
  '␣': 'Space',
};

function keyToAriaLabelPart(k: string): string {
  return SYMBOL_TO_ARIA[k] ?? k;
}

function buildComboAriaLabel(keys: string[], separator: KbdSeparator): string {
  const parts = keys.map(keyToAriaLabelPart);
  if (separator === 'then') return parts.join(' then ');
  if (separator === '/') return parts.join(' or ');
  return parts.join(' ');
}

function kbdBaseStyle(
  t: VDSTheme,
  variant: KbdVariant,
  size: KbdSize,
  surfaceDark: boolean,
): CSSProperties {
  const s = SIZE_MAP[size];
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
    lineHeight: 1,
    fontSize: s.fontSize,
    padding: s.padding,
    minWidth: s.minWidth,
    height: s.height,
    boxSizing: 'border-box',
    borderRadius: 6,
  };

  if (variant === 'default') {
    return {
      ...base,
      background: surfaceDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      border: `1px solid ${surfaceDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)'}`,
      borderBottom: `2px solid ${surfaceDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.20)'}`,
      color: t.text.primary.default,
      boxShadow: 'none',
    };
  }
  if (variant === 'outline') {
    return {
      ...base,
      background: 'transparent',
      border: `1px solid ${t.border.strong.default}`,
      borderBottom: `2px solid ${t.border.strong.default}`,
      color: t.text.secondary.default,
    };
  }
  return {
    ...base,
    background: t.bg.fill.brandSubtle.default,
    border: `1px solid ${t.border.brand.default}`,
    borderBottom: `2px solid ${t.border.brand.default}`,
    color: t.text.brand.default,
  };
}

function Kbd({
  t,
  children,
  variant = 'default',
  size = 'md',
  className,
  surfaceDark = false,
  ariaHidden,
}: {
  t: VDSTheme;
  children: string;
  variant?: KbdVariant;
  size?: KbdSize;
  className?: string;
  surfaceDark?: boolean;
  ariaHidden?: boolean;
}) {
  return (
    <kbd className={className} style={kbdBaseStyle(t, variant, size, surfaceDark)} aria-hidden={ariaHidden}>
      {children}
    </kbd>
  );
}

function KbdSeparatorText({ t, sep }: { t: VDSTheme; sep: KbdSeparator }) {
  const text = sep === 'then' ? 'then' : sep;
  return (
    <span
      style={{
        fontSize: 11,
        color: t.text.tertiary.default,
        margin: '0 4px',
        fontFamily: 'var(--font-sans), system-ui, sans-serif',
        fontWeight: 500,
        userSelect: 'none',
      }}
    >
      {text}
    </span>
  );
}

function KbdCombo({
  t,
  keys,
  separator = '+',
  variant = 'default',
  size = 'md',
  className,
  surfaceDark = false,
}: {
  t: VDSTheme;
  keys: string[];
  separator?: KbdSeparator;
  variant?: KbdVariant;
  size?: KbdSize;
  className?: string;
  surfaceDark?: boolean;
}) {
  const ariaLabel = buildComboAriaLabel(keys, separator);
  return (
    <span
      role="group"
      aria-label={ariaLabel}
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
    >
      {keys.map((k, i) => (
        <Fragment key={`${k}-${i}`}>
          {i > 0 ? <KbdSeparatorText t={t} sep={separator} /> : null}
          <Kbd t={t} variant={variant} size={size} surfaceDark={surfaceDark} ariaHidden>
            {k}
          </Kbd>
        </Fragment>
      ))}
    </span>
  );
}

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
      <div style={{ background: t.bg.surface.secondary.default, padding: 24, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
      <div style={{ padding: '12px 16px 0', fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>{title}</div>
      <div style={{ height: 3, background: ok ? '#0A8853' : '#E8186D' }} />
      <p style={{ padding: '16px 20px', fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{caption}</p>
    </div>
  );
}

function KbdLiveGallery({
  t,
  variant,
  size,
  separator,
  surfaceDark,
}: {
  t: VDSTheme;
  variant: KbdVariant;
  size: KbdSize;
  separator: KbdSeparator;
  surfaceDark: boolean;
}) {
  const rowStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const comboRow: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignItems: 'stretch',
    width: '100%',
    maxWidth: 520,
  };

  const comboLine: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'center', width: '100%' }}>
      <div style={rowStyle}>
        {['⌘', '⌃', '⌥', '⇧'].map((k) => (
          <Kbd key={k} t={t} variant={variant} size={size} surfaceDark={surfaceDark}>
            {k}
          </Kbd>
        ))}
      </div>
      <div style={{ ...rowStyle, alignItems: 'center' }}>
        <ArrowUp size={14} color={t.icon.secondary.default} aria-hidden style={{ opacity: 0.5 }} />
        <Kbd t={t} variant={variant} size={size} surfaceDark={surfaceDark}>
          ↑
        </Kbd>
        <ArrowDown size={14} color={t.icon.secondary.default} aria-hidden style={{ opacity: 0.5 }} />
        <Kbd t={t} variant={variant} size={size} surfaceDark={surfaceDark}>
          ↓
        </Kbd>
        <ArrowLeft size={14} color={t.icon.secondary.default} aria-hidden style={{ opacity: 0.5 }} />
        <Kbd t={t} variant={variant} size={size} surfaceDark={surfaceDark}>
          ←
        </Kbd>
        <ArrowRight size={14} color={t.icon.secondary.default} aria-hidden style={{ opacity: 0.5 }} />
        <Kbd t={t} variant={variant} size={size} surfaceDark={surfaceDark}>
          →
        </Kbd>
      </div>
      <div style={{ ...rowStyle, alignItems: 'center' }}>
        <CornerDownLeft size={14} color={t.icon.secondary.default} aria-hidden style={{ opacity: 0.5 }} />
        <Kbd t={t} variant={variant} size={size} surfaceDark={surfaceDark}>
          ↵
        </Kbd>
        {['Esc', 'Tab', 'Del'].map((k) => (
          <Kbd key={k} t={t} variant={variant} size={size} surfaceDark={surfaceDark}>
            {k}
          </Kbd>
        ))}
      </div>

      <div style={comboRow}>
        {(
          [
            { keys: ['⌘', 'K'] as const, label: 'Open command palette' },
            { keys: ['⌘', 'S'] as const, label: 'Save' },
            { keys: ['⌘', '⇧', 'P'] as const, label: 'Command menu' },
            { keys: ['⌃', 'C'] as const, label: 'Copy' },
          ] as const
        ).map((row) => (
          <div key={row.label} style={comboLine}>
            <KbdCombo t={t} keys={[...row.keys]} separator={separator} variant={variant} size={size} surfaceDark={surfaceDark} />
            <span style={{ fontSize: 13, color: t.text.secondary.default }}>{row.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
        <p style={{ fontSize: 14, color: t.text.secondary.default, margin: 0, lineHeight: 1.65 }}>
          Press{' '}
          <Kbd t={t} variant={variant} size="sm" surfaceDark={surfaceDark}>
            ⌘
          </Kbd>{' '}
          <Kbd t={t} variant={variant} size="sm" surfaceDark={surfaceDark}>
            K
          </Kbd>{' '}
          to open the command palette
        </p>
        <p style={{ fontSize: 14, color: t.text.secondary.default, margin: 0, lineHeight: 1.65 }}>
          Use{' '}
          <Kbd t={t} variant={variant} size="sm" surfaceDark={surfaceDark}>
            Tab
          </Kbd>{' '}
          to move between fields
        </p>
        <p style={{ fontSize: 14, color: t.text.secondary.default, margin: 0, lineHeight: 1.65 }}>
          Hit{' '}
          <Kbd t={t} variant={variant} size="sm" surfaceDark={surfaceDark}>
            Esc
          </Kbd>{' '}
          to dismiss
        </p>
      </div>
    </div>
  );
}

export default function KbdDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [variant, setVariant] = useState<KbdVariant>('default');
  const [size, setSize] = useState<KbdSize>('md');
  const [separator, setSeparator] = useState<KbdSeparator>('+');

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
        { id: 'principles-kb', label: 'Principles' },
        { id: 'anatomy-kb', label: 'Anatomy' },
        { id: 'variants-kb', label: 'Variants' },
        { id: 'sizes-kb', label: 'Sizes' },
        { id: 'combos-kb', label: 'Key combinations' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-kb', label: 'When to use' },
        { id: 'key-symbols', label: 'Key symbols reference' },
        { id: 'dos-donts-kb', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'content-labels', label: 'Key label conventions' },
        { id: 'content-order', label: 'Combination order' },
        { id: 'content-sep', label: 'Separator usage' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'props-kbd', label: 'Kbd props' },
        { id: 'props-combo', label: 'KbdCombo props' },
        { id: 'code-examples-kb', label: 'Examples' },
        { id: 'a11y-kb', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const kbdPropsRows = [
    { name: 'children', type: 'string', default: '—', description: 'Key label or symbol (required)', required: true as boolean },
    { name: 'variant', type: "'default' | 'outline' | 'brand'", default: "'default'", description: 'Visual style' },
    { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Key size' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const kbdComboPropsRows = [
    { name: 'keys', type: 'string[]', default: '—', description: 'Ordered key labels (required)', required: true as boolean },
    { name: 'separator', type: "'+' | 'then' | '/'", default: "'+'", description: 'Between-key separator' },
    { name: 'variant', type: "'default' | 'outline' | 'brand'", default: "'default'", description: 'Applied to all keys' },
    { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Applied to all keys' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const codeExamples = `// Single key
<Kbd>⌘</Kbd>
<Kbd>Esc</Kbd>
<Kbd>Tab</Kbd>
<Kbd>↑</Kbd>

// Key combination — simultaneous (default)
<KbdCombo keys={['⌘', 'K']} />
<KbdCombo keys={['⌘', '⇧', 'P']} />
<KbdCombo keys={['⌃', 'Alt', 'Del']} />

// Sequential
<KbdCombo keys={['G', 'D']} separator="then" />

// Alternatives (Mac / Windows)
<KbdCombo keys={['⌘', 'S']} /> / <KbdCombo keys={['Ctrl', 'S']} />

// Variants
<KbdCombo keys={['⌘', 'K']} variant="brand" />
<KbdCombo keys={['Esc']} variant="outline" />

// Sizes
<Kbd size="xs">⌘</Kbd>
<Kbd size="sm">⌘</Kbd>
<Kbd size="md">⌘</Kbd>
<Kbd size="lg">⌘</Kbd>

// Inline in text
<p style={{ fontSize: 14, color: t.text.secondary.default }}>
  Press <Kbd size="sm">⌘</Kbd><Kbd size="sm">K</Kbd> to open the command palette.
</p>

// In a tooltip
<Tooltip
  content={
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      Save <KbdCombo keys={['⌘', 'S']} size="xs" variant="outline" />
    </span>
  }
>
  <Button variant="primary">Save</Button>
</Tooltip>

// In a command palette result
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <span>Open settings</span>
  <KbdCombo keys={['⌘', ',']} size="xs" />
</div>

// Keyboard shortcuts reference list
const shortcuts = [
  { label: 'Command palette', keys: ['⌘', 'K'] },
  { label: 'Save',            keys: ['⌘', 'S'] },
  { label: 'Undo',            keys: ['⌘', 'Z'] },
  { label: 'Redo',            keys: ['⌘', '⇧', 'Z'] },
  { label: 'Find',            keys: ['⌘', 'F'] },
]
{shortcuts.map(s => (
  <div key={s.label} style={{
    display: 'flex', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: \`1px solid \${t.border.default.default}\`
  }}>
    <span style={{ fontSize: 13, color: t.text.secondary.default }}>{s.label}</span>
    <KbdCombo keys={s.keys} size="sm" />
  </div>
))}`;

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components{' '}
        <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Kbd
      </p>
      <h1 className="page-title">Kbd</h1>
      <p className="page-lead">
        Kbd renders keyboard shortcuts and key combinations in a consistent, legible style. It communicates to users exactly which keys to
        press — reducing ambiguity in documentation, tooltips, command palettes, and onboarding flows. A well-styled Kbd makes shortcuts feel
        discoverable and approachable, not intimidating.
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
                    options={['default', 'outline', 'brand']}
                    value={variant}
                    onChange={(v) => setVariant(v as KbdVariant)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Size"
                    options={['xs', 'sm', 'md', 'lg']}
                    value={size}
                    onChange={(v) => setSize(v as KbdSize)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Separator"
                    options={['+', 'then', '/']}
                    value={separator}
                    onChange={(v) => setSeparator(v as KbdSeparator)}
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
                  minHeight: 360,
                  padding: 40,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <KbdLiveGallery t={previewT} variant={variant} size={size} separator={separator} surfaceDark={previewDark} />
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-kb" style={{ marginBottom: 48 }}>
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
                <div
                  style={{
                    ...dottedZone(t, 168),
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 340 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default }}>Plain text</div>
                      <div
                        style={{
                          position: 'relative',
                          padding: '10px 12px',
                          borderRadius: 8,
                          background: t.bg.surface.primary.default,
                          border: `1px solid ${t.border.default.default}`,
                          fontSize: 11,
                          color: t.text.secondary.default,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}
                      >
                        Shortcut: Cmd+K
                        <div
                          style={{
                            position: 'absolute',
                            bottom: -20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: `6px solid ${t.border.default.default}`,
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          fontSize: 12,
                          fontWeight: 600,
                          color: t.text.primary.default,
                          cursor: 'default',
                        }}
                      >
                        Action
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default }}>Kbd component</div>
                      <div
                        style={{
                          padding: '10px 12px',
                          borderRadius: 8,
                          background: t.bg.surface.primary.default,
                          border: `1px solid ${t.border.default.default}`,
                          fontSize: 11,
                          color: t.text.secondary.default,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexWrap: 'wrap',
                          justifyContent: 'center',
                        }}
                      >
                        <span>Shortcut:</span>
                        <Kbd t={t} size="sm">
                          ⌘
                        </Kbd>
                        <Kbd t={t} size="sm">
                          K
                        </Kbd>
                      </div>
                      <button
                        type="button"
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          fontSize: 12,
                          fontWeight: 600,
                          color: t.text.primary.default,
                          cursor: 'default',
                        }}
                      >
                        Action
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Keyboard size={18} color={t.icon.brand.default} aria-hidden />
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Visual distinction signals &apos;press this&apos;</div>
                </div>
                <p style={{ padding: '0 20px 20px', fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>
                  Keyboard shortcuts embedded in plain text are easy to miss. The Kbd component creates a visual affordance that immediately
                  reads as &apos;this is a key to press&apos; — not just a letter in a sentence. The raised border mimics a physical key,
                  activating the user&apos;s motor memory.
                </p>
              </div>

              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 168), flexDirection: 'column', gap: 10, alignItems: 'stretch' }}>
                  {(
                    [
                      { label: 'Cmd+K', ok: false },
                      { label: 'Command+K', ok: false },
                      { label: '⌘K', ok: true },
                      { label: 'Kbd pair', ok: true, render: 'kbd' as const },
                    ] as const
                  ).map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        fontSize: 12,
                        color: t.text.secondary.default,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {'render' in row && row.render === 'kbd' ? (
                          <>
                            <Kbd t={t} size="sm">
                              ⌘
                            </Kbd>
                            <Kbd t={t} size="sm">
                              K
                            </Kbd>
                          </>
                        ) : (
                          row.label
                        )}
                      </span>
                      {row.ok ? <Check size={16} color="#0A8853" aria-label="Preferred" /> : <span style={{ color: t.text.tertiary.default, fontSize: 11 }}>—</span>}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Command size={18} color={t.icon.brand.default} aria-hidden />
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Consistency across all surfaces</div>
                </div>
                <p style={{ padding: '0 20px 20px', fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>
                  Shortcuts appear in tooltips, docs, command palettes, empty states, and onboarding. Without a shared component, each surface
                  invents its own style. Kbd enforces one style everywhere — same font, same spacing, same visual weight.
                </p>
              </div>

              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 168), padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 320 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default, textAlign: 'center' }}>Simultaneous (+)</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Kbd t={t} size="sm">
                          ⌘
                        </Kbd>
                        <span style={{ color: t.text.tertiary.default, fontSize: 11 }}>+</span>
                        <Kbd t={t} size="sm">
                          S
                        </Kbd>
                      </div>
                      <p style={{ fontSize: 11, color: t.text.secondary.default, margin: 0, textAlign: 'center', lineHeight: 1.45 }}>All keys at once</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default, textAlign: 'center' }}>Sequential (then)</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Kbd t={t} size="sm">
                          G
                        </Kbd>
                        <span style={{ fontSize: 11, color: t.text.tertiary.default, margin: '0 4px' }}>then</span>
                        <Kbd t={t} size="sm">
                          D
                        </Kbd>
                      </div>
                      <p style={{ fontSize: 11, color: t.text.secondary.default, margin: 0, textAlign: 'center', lineHeight: 1.45 }}>One after another</p>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ChevronUp size={18} color={t.icon.brand.default} aria-hidden />
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Simultaneous vs. sequential</div>
                </div>
                <p style={{ padding: '0 20px 20px', fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>
                  Key combinations fall into two categories: simultaneous (hold all keys at once, like ⌘S) and sequential (press one after another,
                  like G then D in Vim). Use the &apos;+&apos; separator for simultaneous, &apos;then&apos; for sequential. The distinction
                  matters — it&apos;s the difference between a shortcut that works and one that doesn&apos;t.
                </p>
              </div>
            </div>
          </section>

          <section id="anatomy-kb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div style={{ ...dottedZone(t, 260), flexDirection: 'column', gap: 20, padding: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    padding: 12,
                    outline: `1px dashed ${t.border.brand.default}`,
                    borderRadius: 10,
                  }}
                  title="KbdCombo wrapper"
                >
                  <KbdCombo t={t} keys={['⌘', 'K', 'S']} separator="+" size="lg" />
                </div>
                <div style={{ fontSize: 11, color: t.text.tertiary.default }}>
                  <span style={{ color: '#E8186D', fontWeight: 700 }}>C</span> — KbdCombo wrapper ·{' '}
                  <span style={{ color: '#E8186D', fontWeight: 700 }}>D</span> — thicker bottom border on each key
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Kbd t={t} size="lg">
                    ⌘
                  </Kbd>
                  <KbdSeparatorText t={t} sep="+" />
                  <Kbd t={t} size="lg">
                    K
                  </Kbd>
                  <KbdSeparatorText t={t} sep="+" />
                  <Kbd t={t} size="lg">
                    S
                  </Kbd>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <AnnotationDot letter="A" />
                    <span style={{ fontSize: 10, color: t.text.tertiary.default }}>Kbd</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <AnnotationDot letter="B" />
                    <span style={{ fontSize: 10, color: t.text.tertiary.default }}>Sep</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <AnnotationDot letter="A" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <AnnotationDot letter="B" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <AnnotationDot letter="A" />
                  </div>
                </div>
              </div>
            </div>
            <ul style={{ margin: '16px 0 0', paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.65 }}>
              <li>
                <strong style={{ color: t.text.primary.default }}>A</strong> — Kbd element (background, border 1px top/left/right, borderBottom
                2px, borderRadius 6px, JetBrains Mono, fontSize and padding per size)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>B</strong> — Separator (fontSize 11px, color tertiary, margin 0 4px,
                sans-serif — &quot;+&quot; / &quot;then&quot; / &quot;/&quot;)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>C</strong> — KbdCombo wrapper (display inline-flex, alignItems center, gap
                2px)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>D</strong> — borderBottom 2px — the &quot;raised key&quot; effect (thicker
                bottom than top/sides)
              </li>
            </ul>
          </section>

          <section id="variants-kb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {(
                [
                  {
                    title: 'Default',
                    chip: 'variant: default',
                    desc: 'Standard keyboard key style. Use in documentation, tooltips, command palettes, and most UI contexts.',
                    variant: 'default' as const,
                    secondKey: 'S' as const,
                  },
                  {
                    title: 'Outline',
                    chip: 'variant: outline',
                    desc: 'Lighter visual weight. Use on darker surfaces or when the default variant feels too prominent for the context.',
                    variant: 'outline' as const,
                    secondKey: 'K' as const,
                  },
                  {
                    title: 'Brand',
                    chip: 'variant: brand',
                    desc: 'Brand-colored key. Use to highlight the primary shortcut of the current feature — the one shortcut users should learn first.',
                    variant: 'brand' as const,
                    secondKey: 'K' as const,
                  },
                ] as const
              ).map((card) => (
                <div
                  key={card.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 140), gap: 10 }}>
                    <Kbd t={t} variant={card.variant} size="md">
                      ⌘
                    </Kbd>
                    <Kbd t={t} variant={card.variant} size="md">
                      {card.secondKey}
                    </Kbd>
                  </div>
                  <div style={{ padding: '16px 20px 20px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{card.title}</div>
                    <span style={chipStyleB(t, { marginBottom: 12 })}>{card.chip}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '12px 0 0' }}>{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="sizes-kb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end', marginBottom: 20 }}>
              {(
                [
                  { k: 'xs' as const, px: 18, note: 'Footnotes, dense tables, command palette hints' },
                  { k: 'sm' as const, px: 22, note: 'Tooltips, inline text, compact UI' },
                  { k: 'md' as const, px: 26, note: 'Default — docs, settings, onboarding' },
                  { k: 'lg' as const, px: 32, note: 'Hero sections, feature callouts, prominent placement' },
                ] as const
              ).map((row) => (
                <div key={row.k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 100 }}>
                  <Kbd t={t} size={row.k}>
                    ⌘
                  </Kbd>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>{row.k}</div>
                    <div style={{ fontSize: 11, color: t.text.tertiary.default }}>{row.px}px</div>
                    <div style={{ fontSize: 11, color: t.text.secondary.default, maxWidth: 140, lineHeight: 1.45, marginTop: 4 }}>{row.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={chipStyleB(t)}>--kbd-xs: 18px</span>
              <span style={chipStyleB(t)}>--kbd-sm: 22px</span>
              <span style={chipStyleB(t)}>--kbd-md: 26px</span>
              <span style={chipStyleB(t)}>--kbd-lg: 32px</span>
            </div>
          </section>

          <section id="combos-kb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Key combinations
            </h2>
            <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.65, marginBottom: 20, maxWidth: 720 }}>
              KbdCombo renders a sequence of Kbd elements with a separator. Use the right separator to communicate the interaction type.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 140), flexDirection: 'column', gap: 12 }}>
                  <KbdCombo t={t} keys={['⌘', 'S']} separator="+" />
                  <KbdCombo t={t} keys={['⌘', '⇧', 'Z']} separator="+" />
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Simultaneous (+)</div>
                  <span style={chipStyleB(t, { marginBottom: 12 })}>separator: &quot;+&quot;</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '12px 0 0' }}>
                    Hold all keys at the same time. The default separator. Use for modifier + key combinations.
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
                <div style={{ ...dottedZone(t, 140), flexDirection: 'column', gap: 12 }}>
                  <KbdCombo t={t} keys={['G', 'D']} separator="then" />
                  <KbdCombo t={t} keys={['Z', 'Z']} separator="then" />
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Sequential (then)</div>
                  <span style={chipStyleB(t, { marginBottom: 12 })}>separator: &quot;then&quot;</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '12px 0 0' }}>
                    Press keys one after another. Use for Vim-style or multi-step shortcuts where order matters.
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
                <div style={{ ...dottedZone(t, 140), flexDirection: 'column', gap: 12 }}>
                  <KbdCombo t={t} keys={['⌘', '/']} separator="/" />
                  <KbdCombo t={t} keys={['Ctrl', '/']} separator="/" />
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Alternative (/)</div>
                  <span style={chipStyleB(t, { marginBottom: 12 })}>separator: &quot;/&quot;</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '12px 0 0' }}>
                    Alternative keys that achieve the same result. Use to show Mac vs. Windows equivalents side by side.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-kb" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: t.text.tertiary.default, marginBottom: 12 }}>DO</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                  <li>Tooltips on buttons when the action has a keyboard shortcut</li>
                  <li>Command palette — shortcut hints on result rows</li>
                  <li>Documentation and onboarding guides</li>
                  <li>Empty states that teach one important shortcut</li>
                  <li>Settings pages with a keyboard shortcuts list</li>
                </ul>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: t.text.tertiary.default, marginBottom: 12 }}>DON&apos;T</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                  <li>In notifications or error messages (users are not looking to learn shortcuts)</li>
                  <li>On mobile where there is no physical keyboard</li>
                  <li>As decoration with no real keyboard action behind it</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="tip" title="Teach one shortcut at a time">
                Don&apos;t list 20 shortcuts at once — users won&apos;t remember them. Teach shortcuts contextually: show the shortcut in the
                tooltip of the button it replaces. Users learn shortcuts organically, at the moment of relevance.
              </Callout>
            </div>
          </section>

          <section id="key-symbols" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Key symbols reference
            </h2>
            <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.65, marginBottom: 16 }}>
              Use these standard symbols for consistency across all surfaces.
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
                    {['SYMBOL', 'MAC KEY', 'WINDOWS/LINUX', 'DISPLAY'].map((h) => (
                      <th key={h} style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <td style={{ padding: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>⌘</td>
                    <td style={{ padding: 12 }}>Command</td>
                    <td style={{ padding: 12, color: t.text.secondary.default }}>—</td>
                    <td style={{ padding: 12 }}>
                      <Kbd t={t} size="sm">
                        ⌘
                      </Kbd>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <td style={{ padding: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>⌃</td>
                    <td style={{ padding: 12 }}>Control</td>
                    <td style={{ padding: 12, color: t.text.secondary.default }}>Ctrl</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        <Kbd t={t} size="sm">
                          ⌃
                        </Kbd>
                        <span style={{ color: t.text.tertiary.default, fontSize: 12 }}>/</span>
                        <Kbd t={t} size="sm">
                          Ctrl
                        </Kbd>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <td style={{ padding: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>⌥</td>
                    <td style={{ padding: 12 }}>Option/Alt</td>
                    <td style={{ padding: 12, color: t.text.secondary.default }}>Alt</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        <Kbd t={t} size="sm">
                          ⌥
                        </Kbd>
                        <span style={{ color: t.text.tertiary.default, fontSize: 12 }}>/</span>
                        <Kbd t={t} size="sm">
                          Alt
                        </Kbd>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <td style={{ padding: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>⇧</td>
                    <td style={{ padding: 12 }}>Shift</td>
                    <td style={{ padding: 12, color: t.text.secondary.default }}>Shift</td>
                    <td style={{ padding: 12 }}>
                      <Kbd t={t} size="sm">
                        ⇧
                      </Kbd>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <td style={{ padding: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>↵</td>
                    <td style={{ padding: 12 }}>Return/Enter</td>
                    <td style={{ padding: 12, color: t.text.secondary.default }}>Enter</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        <Kbd t={t} size="sm">
                          ↵
                        </Kbd>
                        <span style={{ color: t.text.tertiary.default, fontSize: 12 }}>/</span>
                        <Kbd t={t} size="sm">
                          Enter
                        </Kbd>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <td style={{ padding: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>⌫</td>
                    <td style={{ padding: 12 }}>Delete</td>
                    <td style={{ padding: 12, color: t.text.secondary.default }}>Backspace</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        <Kbd t={t} size="sm">
                          ⌫
                        </Kbd>
                        <span style={{ color: t.text.tertiary.default, fontSize: 12 }}>/</span>
                        <Kbd t={t} size="sm">
                          Bksp
                        </Kbd>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <td style={{ padding: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>⎋</td>
                    <td style={{ padding: 12 }}>Escape</td>
                    <td style={{ padding: 12, color: t.text.secondary.default }}>Esc</td>
                    <td style={{ padding: 12 }}>
                      <Kbd t={t} size="sm">
                        Esc
                      </Kbd>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <td style={{ padding: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>⇥</td>
                    <td style={{ padding: 12 }}>Tab</td>
                    <td style={{ padding: 12, color: t.text.secondary.default }}>Tab</td>
                    <td style={{ padding: 12 }}>
                      <Kbd t={t} size="sm">
                        Tab
                      </Kbd>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <td style={{ padding: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>↑↓←→</td>
                    <td style={{ padding: 12 }}>Arrow keys</td>
                    <td style={{ padding: 12, color: t.text.secondary.default }}>Arrow keys</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        {(['↑', '↓', '←', '→'] as const).map((a) => (
                          <Kbd key={a} t={t} size="sm">
                            {a}
                          </Kbd>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <td style={{ padding: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>␣</td>
                    <td style={{ padding: 12 }}>Space</td>
                    <td style={{ padding: 12, color: t.text.secondary.default }}>Space</td>
                    <td style={{ padding: 12 }}>
                      <Kbd t={t} size="sm">
                        Space
                      </Kbd>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 20 }}>
              <Callout variant="info" title="Mac symbols vs. text labels">
                Use symbols (⌘⌥⇧⌃) for modifier keys on Mac — they&apos;re universally understood and compact. Use text labels (Ctrl, Alt,
                Shift) for Windows/Linux. If your product supports both, detect the OS and render accordingly, or show both with a &apos;/&apos;
                separator.
              </Callout>
            </div>
          </section>

          <section id="dos-donts-kb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — use symbols for Mac modifiers"
                  caption="Compact symbols keep shortcuts scannable and aligned with platform conventions."
                >
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Kbd t={t} size="sm">
                      ⌘
                    </Kbd>
                    <Kbd t={t} size="sm">
                      K
                    </Kbd>
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — spell out Command on Mac"
                  caption="“Command” is too long — it breaks visual rhythm next to single-letter keys."
                >
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Kbd t={t} size="sm">
                      Command
                    </Kbd>
                    <Kbd t={t} size="sm">
                      K
                    </Kbd>
                  </div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — Kbd in context"
                  caption="Tell users what the shortcut does in the same sentence — not keys floating alone."
                >
                  <p style={{ fontSize: 13, color: t.text.secondary.default, margin: 0, textAlign: 'center', maxWidth: 320, lineHeight: 1.55 }}>
                    Press{' '}
                    <Kbd t={t} size="sm">
                      ⌘
                    </Kbd>
                    <Kbd t={t} size="sm">
                      S
                    </Kbd>{' '}
                    to save your changes
                  </p>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — keys without context"
                  caption="Users cannot infer the action from ⌘S alone when it sits by itself."
                >
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Kbd t={t} size="sm">
                      ⌘
                    </Kbd>
                    <Kbd t={t} size="sm">
                      S
                    </Kbd>
                  </div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — one size per block"
                  caption="Matching sizes in the same tooltip or paragraph keeps the line rhythm even."
                >
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Kbd t={t} size="sm">
                      ⌘
                    </Kbd>
                    <Kbd t={t} size="sm">
                      K
                    </Kbd>
                    <span style={{ fontSize: 12, color: t.text.tertiary.default }}>·</span>
                    <Kbd t={t} size="sm">
                      ⌘
                    </Kbd>
                    <Kbd t={t} size="sm">
                      S
                    </Kbd>
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — mix sizes in one block"
                  caption="Jumping from xs to lg in the same line destroys visual hierarchy."
                >
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Kbd t={t} size="xs">
                      ⌘
                    </Kbd>
                    <Kbd t={t} size="lg">
                      K
                    </Kbd>
                  </div>
                </IllustratedDoDont>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="content-labels" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Key label conventions
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>
                Single letters: uppercase —{' '}
                <Kbd t={t} size="sm">
                  K
                </Kbd>
                ,{' '}
                <Kbd t={t} size="sm">
                  S
                </Kbd>
                ,{' '}
                <Kbd t={t} size="sm">
                  Z
                </Kbd>
              </li>
              <li>Modifier keys: use symbols on Mac — ⌘ ⌃ ⌥ ⇧</li>
              <li>Named keys: short form — &apos;Esc&apos; not &apos;Escape&apos;, &apos;Del&apos; not &apos;Delete&apos;, &apos;Tab&apos; not &apos;Tabulator&apos;</li>
              <li>Arrow keys: use Unicode arrows — ↑ ↓ ← → (not &apos;Up&apos;, &apos;Down&apos;)</li>
              <li>Function keys: &apos;F1&apos;–&apos;F12&apos; (no space)</li>
            </ul>
          </section>
          <section id="content-order" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Combination order (always in this order)
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Mac: ⌃ then ⌥ then ⇧ then ⌘ then key — e.g. ⌘⇧K not ⇧⌘K</li>
              <li>Windows: Ctrl then Alt then Shift then key</li>
              <li>Consistent order makes shortcuts instantly recognizable</li>
            </ul>
          </section>
          <section id="content-sep" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Separator usage
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>
                + for simultaneous:{' '}
                <Kbd t={t} size="sm">
                  ⌘
                </Kbd>{' '}
                +{' '}
                <Kbd t={t} size="sm">
                  K
                </Kbd>
              </li>
              <li>
                &apos;then&apos; for sequential:{' '}
                <Kbd t={t} size="sm">
                  G
                </Kbd>{' '}
                then{' '}
                <Kbd t={t} size="sm">
                  D
                </Kbd>
              </li>
              <li>
                &apos;/&apos; for alternatives:{' '}
                <Kbd t={t} size="sm">
                  ⌘
                </Kbd>{' '}
                /{' '}
                <Kbd t={t} size="sm">
                  Ctrl
                </Kbd>{' '}
                +{' '}
                <Kbd t={t} size="sm">
                  S
                </Kbd>
              </li>
            </ul>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="props-kbd" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Kbd props
            </h3>
            <PropsTable props={kbdPropsRows} />
          </section>
          <section id="props-combo" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              KbdCombo props
            </h3>
            <PropsTable props={kbdComboPropsRows} />
          </section>
          <section id="code-examples-kb" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Examples
            </h3>
            <CodeBlock code={codeExamples} filename="Kbd.tsx" language="tsx" />
          </section>
          <section id="a11y-kb" style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              Kbd renders a semantic &lt;kbd&gt; HTML element, which screen readers announce as keyboard input. KbdCombo wraps keys in a
              &lt;span&gt; with aria-label describing the full combination — e.g. aria-label=&apos;Command K&apos; for ⌘K. This ensures screen
              reader users hear &apos;Command K&apos; rather than individual symbol characters that may not be announced correctly.
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
                Initial release. Kbd with default/outline/brand variants, 4 sizes, semantic &lt;kbd&gt; element. KbdCombo with +/then//
                separators, key symbols reference, full aria-label support.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
