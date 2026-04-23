'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Check,
  ChevronRight,
  Download,
  Loader2,
  RefreshCw,
  RotateCw,
  Save,
  Search,
  Upload,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '../../../../components/docs/CodeBlock';
import { ComponentTabs } from '../../../../components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '../../../../components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

const SPINNER_SIZES = { xs: 16, sm: 20, md: 28, lg: 40, xl: 56 } as const;
type SpSize = keyof typeof SPINNER_SIZES;
type SpColor = 'brand' | 'white' | 'muted' | 'success' | 'danger';
type SpSpeed = 'slow' | 'normal' | 'fast';

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

function speedToMs(speed: SpSpeed): number {
  if (speed === 'slow') return 1200;
  if (speed === 'fast') return 400;
  return 800;
}

function arcColorFor(t: VDSTheme, color: SpColor): string {
  if (color === 'brand') return t.bg.fill.primary.default;
  if (color === 'white') return '#FFFFFF';
  if (color === 'muted') return t.text.tertiary.default;
  if (color === 'success') return '#0A8853';
  return '#D22232';
}

function SpinnerGlyph({
  sizePx,
  trackColor,
  arcColor,
  durationMs,
}: {
  sizePx: number;
  trackColor: string;
  arcColor: string;
  durationMs: number;
}) {
  return (
    <svg width={sizePx} height={sizePx} viewBox="0 0 100 100" aria-hidden>
      <circle cx={50} cy={50} r={46} fill="none" stroke={trackColor} strokeWidth={2.5} opacity={1} />
      <g
        style={{
          transformBox: 'fill-box',
          transformOrigin: '50px 50px',
          animation: `docsSpinnerRotate ${durationMs}ms linear infinite`,
        }}
      >
        <circle
          cx={50}
          cy={50}
          r={46}
          fill="none"
          stroke={arcColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="75 25"
          opacity={1}
        />
      </g>
    </svg>
  );
}

function DocsSpinner({
  t,
  size = 'md',
  color = 'brand',
  label,
  labelPosition = 'right',
  speed = 'normal',
  className,
}: {
  t: VDSTheme;
  size?: SpSize;
  color?: SpColor;
  label?: string;
  labelPosition?: 'right' | 'below';
  speed?: SpSpeed;
  className?: string;
}) {
  const px = SPINNER_SIZES[size];
  const durationMs = speedToMs(speed);
  const arc = arcColorFor(t, color);
  const track = t.border.default.default;
  const aria = label ?? 'Loading';

  return (
    <span
      className={className}
      role="status"
      aria-label={aria}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: labelPosition === 'below' ? 'column' : 'row',
        gap: labelPosition === 'below' ? 10 : 8,
      }}
    >
      <SpinnerGlyph sizePx={px} trackColor={track} arcColor={arc} durationMs={durationMs} />
      {label ? (
        <span style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.3 }}>{label}</span>
      ) : null}
    </span>
  );
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

export default function SpinnerDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [size, setSize] = useState<SpSize>('md');
  const [color, setColor] = useState<SpColor>('brand');
  const [labelMode, setLabelMode] = useState<'off' | 'on'>('off');
  const [labelPosition, setLabelPosition] = useState<'below' | 'right'>('right');
  const [speed, setSpeed] = useState<SpSpeed>('normal');
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
        { id: 'principles-sp', label: 'Principles' },
        { id: 'anatomy-sp', label: 'Anatomy' },
        { id: 'sizes-sp', label: 'Sizes' },
        { id: 'variants-sp', label: 'Variants' },
        { id: 'contexts-sp', label: 'In context' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-sp', label: 'When to use' },
        { id: 'spinner-vs', label: 'Spinner vs. Skeleton' },
        { id: 'dos-donts-sp', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'content-label-sp', label: 'Label writing' },
        { id: 'content-sr-sp', label: 'Screen reader text' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-sp', label: 'Installation' },
        { id: 'import-sp', label: 'Import' },
        { id: 'examples-sp', label: 'Usage examples' },
        { id: 'props-sp', label: 'Props' },
        { id: 'a11y-sp', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const propsRows = [
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: "'md'",
      description: 'Spinner diameter',
    },
    {
      name: 'color',
      type: "'brand' | 'white' | 'muted' | 'success' | 'danger'",
      default: "'brand'",
      description: 'Arc color',
    },
    { name: 'label', type: 'string', default: '—', description: 'Visible label text' },
    {
      name: 'labelPosition',
      type: "'right' | 'below'",
      default: "'right'",
      description: 'Label placement',
    },
    {
      name: 'speed',
      type: "'slow' | 'normal' | 'fast'",
      default: "'normal'",
      description: 'Animation duration',
    },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  return (
    <div className="docs-page-with-toc">
      <style>{`
        @keyframes docsSpinnerRotate {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Spinner
      </p>
      <h1 className="page-title">Spinner</h1>
      <p className="page-lead">
        Spinners communicate that the system is working. They replace uncertainty with a visible signal — something is happening, even if we
        don&apos;t know exactly when it will finish. Use spinners for short, indeterminate loading states. For longer operations or operations with
        measurable progress, use a Progress bar instead.
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
                    label="Size"
                    options={['xs', 'sm', 'md', 'lg', 'xl']}
                    value={size}
                    onChange={setSize}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Color"
                    options={['brand', 'white', 'muted', 'success', 'danger']}
                    value={color}
                    onChange={setColor}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Label"
                    options={['off', 'on']}
                    value={labelMode}
                    onChange={setLabelMode}
                  />
                  {labelMode === 'on' ? (
                    <LivePreviewSegmentRow
                      t={t}
                      label="Label position"
                      options={['below', 'right']}
                      value={labelPosition}
                      onChange={setLabelPosition}
                    />
                  ) : null}
                  <LivePreviewSegmentRow
                    t={t}
                    label="Speed"
                    options={['slow', 'normal', 'fast']}
                    value={speed}
                    onChange={setSpeed}
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
              <DocsSpinner
                t={previewT}
                size={size}
                color={color}
                speed={speed}
                labelPosition={labelPosition}
                label={labelMode === 'on' ? 'Loading...' : undefined}
              />
            </LivePreviewShell>
          </section>

          <section id="principles-sp" style={{ marginBottom: 48 }}>
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 20 }}>
                  <Loader2 size={18} color={t.text.brand.default} style={{ opacity: 0.4, marginBottom: 12 }} aria-hidden />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                    <Upload size={16} color={t.icon.secondary.default} aria-hidden />
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: t.bg.surface.primary.default,
                        border: `1px solid ${t.border.default.default}`,
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <RefreshCw size={12} color={t.icon.secondary.default} aria-hidden />
                      Click
                    </div>
                    <ChevronRight size={14} color={t.icon.tertiary.default} aria-hidden />
                    <DocsSpinner t={t} size="md" color="brand" speed="normal" />
                    <ChevronRight size={14} color={t.icon.tertiary.default} aria-hidden />
                    <Download size={16} color={t.text.success.default} aria-hidden />
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: t.text.tertiary.default }}>&lt; 3 seconds</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden' }}>
                      <div style={{ width: '70%', height: '100%', background: t.bg.fill.primary.default }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: t.text.brand.default, textAlign: 'center' }}>indeterminate</div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>For indeterminate waits</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Use a spinner when you don&apos;t know how long an operation will take. For operations you can measure — file uploads,
                    multi-step processes — use a Progress bar. Spinners say &apos;working on it&apos;; progress bars say &apos;here&apos;s how far along we
                    are.&apos;
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 16 }}>
                  <Search size={18} color={t.text.brand.default} style={{ opacity: 0.4, marginBottom: 10 }} aria-hidden />
                  <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                    <div
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        border: `1px dashed ${t.border.danger.default}`,
                        position: 'relative',
                        minHeight: 96,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: t.bg.surface.primary.default,
                      }}
                    >
                      <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 9, fontWeight: 800, color: '#E8186D' }}>DON&apos;T</div>
                      <DocsSpinner t={t} size="xl" color="brand" speed="normal" />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        border: `1px dashed ${'#0A8853'}`,
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        justifyContent: 'center',
                        background: t.bg.surface.primary.default,
                      }}
                    >
                      <div style={{ fontSize: 9, fontWeight: 800, color: '#0A8853' }}>DO</div>
                      <div style={{ fontSize: 11, color: t.text.secondary.default, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Save size={12} color={t.icon.tertiary.default} aria-hidden />
                        Form fields unchanged…
                      </div>
                      <button
                        type="button"
                        disabled
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          height: 40,
                          padding: '0 16px',
                          borderRadius: 8,
                          border: 'none',
                          background: t.bg.fill.primary.default,
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: 'not-allowed',
                          opacity: 0.95,
                          alignSelf: 'flex-start',
                        }}
                      >
                        <SpinnerGlyph
                          sizePx={16}
                          trackColor="rgba(255,255,255,0.25)"
                          arcColor="#FFFFFF"
                          durationMs={800}
                        />
                        Saving...
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Scope to the loading element</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A spinner should be as close as possible to what is loading. Replacing an entire page with a spinner when only one section is
                    loading creates unnecessary disruption. Scope the spinner to the button, card, or section that triggered the operation.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 20 }}>
                  <RotateCw size={18} color={t.text.brand.default} style={{ opacity: 0.4, marginBottom: 12 }} aria-hidden />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <DocsSpinner t={t} size="md" color="brand" speed="normal" />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <ChevronRight size={16} color={t.icon.secondary.default} aria-hidden />
                      <span style={{ fontSize: 10, fontWeight: 700, color: t.text.brand.default }}>200ms fade</span>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(10,136,83,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={22} color="#0A8853" strokeWidth={2.5} aria-hidden />
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Replace, don&apos;t stack</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    When loading completes, replace the spinner with the result — don&apos;t show both simultaneously. A smooth transition (fade out
                    spinner, fade in content) prevents layout shifts and feels intentional.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-sp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                backgroundColor: t.bg.surface.secondary.default,
                backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                backgroundSize: '12px 12px',
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                padding: 24,
                minHeight: 260,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: '1px dashed #E8186D',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', left: -8, top: -8 }} aria-hidden>
                    <AnnotationDot letter="C" />
                  </div>
                  <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <SpinnerGlyph
                      sizePx={SPINNER_SIZES.md}
                      trackColor={t.border.default.default}
                      arcColor={t.bg.fill.primary.default}
                      durationMs={800}
                    />
                    <div style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)' }}>
                      <AnnotationDot letter="A" />
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ fontSize: 13, color: t.text.secondary.default }}>Loading...</span>
                    <div style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)' }}>
                      <AnnotationDot letter="B" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 12, lineHeight: 1.6 }}>
              A → SVG spinner (track circle + animated arc, size prop controls diameter) — Track: full circle, stroke{' '}
              <span style={{ fontFamily: 'var(--font-mono), monospace' }}>border.default</span>, opacity 1 · Arc:{' '}
              <span style={{ fontFamily: 'var(--font-mono), monospace' }}>strokeDasharray 75 25</span>, stroke color prop,{' '}
              <span style={{ fontFamily: 'var(--font-mono), monospace' }}>strokeLinecap</span> round · Animation: rotate 800ms linear infinite · B →
              Label (optional, fontSize 13px, color <span style={{ fontFamily: 'var(--font-mono), monospace' }}>text.secondary</span>, gap 8px from
              spinner) · C → Wrapper (display inline-flex, alignItems center, gap según{' '}
              <span style={{ fontFamily: 'var(--font-mono), monospace' }}>labelPosition</span>)
            </p>
          </section>

          <section id="sizes-sp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 28, flexWrap: 'wrap', marginBottom: 24 }}>
              {(
                [
                  { key: 'xs' as const, title: 'Inline text, table cells, dense UI' },
                  { key: 'sm' as const, title: 'Buttons, input suffixes, chips' },
                  { key: 'md' as const, title: 'Default — cards, sections' },
                  { key: 'lg' as const, title: 'Page sections, empty states' },
                  { key: 'xl' as const, title: 'Full page loading, splash screens' },
                ] as const
              ).map((row) => (
                <div key={row.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, maxWidth: 120, textAlign: 'center' }}>
                  <DocsSpinner t={t} size={row.key} color="brand" speed="normal" />
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>{row.key}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono), monospace', color: t.text.tertiary.default }}>{SPINNER_SIZES[row.key]}px</div>
                  <div style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.4 }}>{row.title}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={chipStyleB(t)}>--spinner-xs: 16px</span>
              <span style={chipStyleB(t)}>--spinner-sm: 20px</span>
              <span style={chipStyleB(t)}>--spinner-md: 28px</span>
              <span style={chipStyleB(t)}>--spinner-lg: 40px</span>
              <span style={chipStyleB(t)}>--spinner-xl: 56px</span>
            </div>
          </section>

          <section id="variants-sp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    title: 'Default',
                    chip: 'color: brand',
                    desc: 'Default spinner for most loading states. Uses the brand color on light surfaces.',
                    node: (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140 }}>
                        <DocsSpinner t={t} size="md" color="brand" speed="normal" />
                      </div>
                    ),
                  },
                  {
                    title: 'On dark background',
                    chip: 'color: white',
                    desc: 'Use on dark or brand-colored surfaces — inside filled buttons, dark panels, overlays.',
                    node: (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 140,
                          background: t.bg.fill.primary.default,
                          borderRadius: 10,
                          margin: -1,
                        }}
                      >
                        <DocsSpinner t={buildTheme(true)} size="md" color="white" speed="normal" />
                      </div>
                    ),
                  },
                  {
                    title: 'Muted',
                    chip: 'color: muted',
                    desc: 'Low-emphasis loading indicator. Use in secondary sections, placeholders, or when the spinner should not draw attention.',
                    node: (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140 }}>
                        <DocsSpinner t={t} size="md" color="muted" speed="normal" />
                      </div>
                    ),
                  },
                  {
                    title: 'With label',
                    chip: 'showLabel: true',
                    desc: 'Label adds context to longer or less obvious loading states. Always use a concise, actionable label.',
                    node: (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140 }}>
                        <DocsSpinner t={t} size="md" color="brand" speed="normal" label="Loading..." labelPosition="right" />
                      </div>
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
                  <div
                    style={{
                      background: t.bg.surface.secondary.default,
                      backgroundImage: v.title === 'On dark background' ? undefined : `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                      backgroundSize: '12px 12px',
                      padding: 16,
                    }}
                  >
                    {v.node}
                  </div>
                  <div style={{ padding: '16px 18px 12px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{v.title}</div>
                    <span style={chipStyleB(t)}>{v.chip}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '12px 0 0' }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="contexts-sp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              In context
            </h2>
            <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              Spinners adapt to their container. Here are the most common placement patterns.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
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
                    minHeight: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: t.bg.surface.secondary.default,
                    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                    backgroundSize: '12px 12px',
                    padding: 16,
                  }}
                >
                  <button
                    type="button"
                    disabled
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      height: 40,
                      padding: '0 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: t.bg.fill.primary.default,
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'not-allowed',
                    }}
                  >
                    <SpinnerGlyph sizePx={16} trackColor="rgba(255,255,255,0.25)" arcColor="#FFFFFF" durationMs={800} />
                    Saving...
                  </button>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Button loading state</div>
                  <span style={chipStyleB(t)}>size: xs · color: white</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '12px 0 0' }}>
                    Replace button label with spinner + short verb. Disable the button while loading.
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
                <div
                  style={{
                    minHeight: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: t.bg.surface.secondary.default,
                    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                    backgroundSize: '12px 12px',
                    padding: 16,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: t.text.secondary.default }}>
                    Syncing your data <DocsSpinner t={t} size="xs" color="muted" speed="normal" />
                  </span>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Inline in text</div>
                  <span style={chipStyleB(t)}>size: xs · color: muted</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '12px 0 0' }}>
                    Inline spinner for background sync or non-blocking status updates.
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
                <div
                  style={{
                    minHeight: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: t.bg.surface.secondary.default,
                    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                    backgroundSize: '12px 12px',
                    padding: 16,
                  }}
                >
                  <div style={{ width: '100%', maxWidth: 220, minHeight: 88, borderRadius: 12, background: t.bg.surface.secondary.default, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DocsSpinner t={t} size="md" color="brand" speed="normal" />
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Card loading</div>
                  <span style={chipStyleB(t)}>size: md · color: brand</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '12px 0 0' }}>
                    Centered spinner while card content is fetching. Optionally pair with a Skeleton instead for richer feedback.
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
                <div
                  style={{
                    minHeight: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: t.bg.surface.secondary.default,
                    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                    backgroundSize: '12px 12px',
                    padding: 16,
                  }}
                >
                  <div style={{ width: '100%', minHeight: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DocsSpinner t={t} size="lg" color="brand" speed="normal" label="Loading results..." labelPosition="below" />
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Full section</div>
                  <span style={chipStyleB(t)}>size: lg · showLabel: true</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '12px 0 0' }}>
                    Section-level loading. Center horizontally and vertically within the loading area. Add a label for operations over 1 second.
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
                <div
                  style={{
                    minHeight: 120,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: t.bg.surface.primary.default,
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.04)', pointerEvents: 'none' }} />
                  <DocsSpinner t={t} size="xl" color="brand" speed="normal" label="Loading..." labelPosition="below" />
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Full page</div>
                  <span style={chipStyleB(t)}>size: xl · showLabel: true</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '12px 0 0' }}>
                    Full page initial load. Use sparingly — only for app-level navigation or authentication states.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-sp" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div
                style={{
                  background: t.bg.surface.secondary.default,
                  borderRadius: 12,
                  border: `1px solid ${t.border.default.default}`,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: '#0A8853', marginBottom: 12 }}>DO</div>
                <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, fontSize: 13, lineHeight: 1.75 }}>
                  <li>Operaciones de menos de 3 segundos sin progreso medible (guardar, enviar, autenticar)</li>
                  <li>Estados de carga dentro de botones</li>
                  <li>Fetch de datos en secciones específicas</li>
                  <li>Operaciones en segundo plano (sync, auto-save)</li>
                </ul>
              </div>
              <div
                style={{
                  background: t.bg.surface.secondary.default,
                  borderRadius: 12,
                  border: `1px solid ${t.border.default.default}`,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: '#E8186D', marginBottom: 12 }}>DON&apos;T</div>
                <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, fontSize: 13, lineHeight: 1.75 }}>
                  <li>Operaciones con progreso medible (usar Progress bar)</li>
                  <li>Cargas de contenido con estructura conocida (usar Skeleton)</li>
                  <li>Operaciones que toman más de 5 segundos sin feedback adicional (añadir mensaje de estado)</li>
                  <li>En múltiples lugares simultáneamente en la misma vista</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <Callout variant="info" title="The 1-second rule">
                If an operation consistently takes less than 1 second, consider not showing a spinner at all — a sudden flash of a spinner followed
                immediately by content can feel more disruptive than just loading. Add a 300ms delay before showing the spinner to avoid this
                flicker.
              </Callout>
            </div>
          </section>

          <section id="spinner-vs" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Spinner vs. Skeleton
            </h2>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderBottom: `1px solid ${t.border.default.default}`,
                      color: t.text.tertiary.default,
                      fontWeight: 700,
                      width: 140,
                    }}
                  >
                    PATTERN
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.tertiary.default, fontWeight: 700 }}>
                    USE WHEN
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Spinner', 'Short operation, structure unknown, button or small element loading'],
                  ['Skeleton', 'Content structure is known, loading takes 1–3+ seconds, layout should be preserved'],
                  ['Progress', 'Operation has measurable progress (%, steps, file size)'],
                  ['None', 'Operation < 300ms — no loading indicator needed'],
                ].map(([a, b]) => (
                  <tr key={String(a)}>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.primary.default, fontWeight: 600 }}>{a}</td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.secondary.default }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="dos-donts-sp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do & Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.text.primary.default, marginBottom: 12 }}>Scope correctly</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <IllustratedDoDont
                    t={t}
                    ok
                    title="Do"
                    caption="Solo el botón &apos;Submit&apos; muestra spinner xs mientras el form se envía."
                  >
                    <button
                      type="button"
                      disabled
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        height: 36,
                        padding: '0 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: t.bg.fill.primary.default,
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'not-allowed',
                      }}
                    >
                      <SpinnerGlyph sizePx={16} trackColor="rgba(255,255,255,0.25)" arcColor="#FFFFFF" durationMs={800} />
                      Submit
                    </button>
                  </IllustratedDoDont>
                  <IllustratedDoDont
                    t={t}
                    ok={false}
                    title="Don&apos;t"
                    caption="Overlay de spinner xl bloqueando toda la página para enviar un formulario."
                  >
                    <div style={{ position: 'relative', width: 200, height: 100, borderRadius: 8, background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}` }}>
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(15,17,23,0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <DocsSpinner t={t} size="xl" color="white" speed="normal" />
                      </div>
                    </div>
                  </IllustratedDoDont>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.text.primary.default, marginBottom: 12 }}>Add label for longer waits</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <IllustratedDoDont
                    t={t}
                    ok
                    title="Do"
                    caption="Spinner lg + &apos;Analyzing your data...&apos; para una operación de 2-4 segundos."
                  >
                    <DocsSpinner t={t} size="lg" color="brand" speed="normal" label="Analyzing your data..." labelPosition="below" />
                  </IllustratedDoDont>
                  <IllustratedDoDont
                    t={t}
                    ok={false}
                    title="Don&apos;t"
                    caption="Spinner lg solo, sin contexto, para una operación que tarda varios segundos."
                  >
                    <DocsSpinner t={t} size="lg" color="brand" speed="normal" />
                  </IllustratedDoDont>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.text.primary.default, marginBottom: 12 }}>Disable the trigger</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <IllustratedDoDont
                    t={t}
                    ok
                    title="Do"
                    caption="Botón con spinner — isDisabled=true, cursor not-allowed, no puede hacerse click de nuevo."
                  >
                    <button
                      type="button"
                      disabled
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        height: 40,
                        padding: '0 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: t.bg.fill.primary.default,
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'not-allowed',
                      }}
                    >
                      <SpinnerGlyph sizePx={16} trackColor="rgba(255,255,255,0.25)" arcColor="#FFFFFF" durationMs={800} />
                      Saving...
                    </button>
                  </IllustratedDoDont>
                  <IllustratedDoDont
                    t={t}
                    ok={false}
                    title="Don&apos;t"
                    caption="Botón con spinner pero seguía siendo clickeable — el usuario puede disparar múltiples requests."
                  >
                    <button
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        height: 40,
                        padding: '0 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: t.bg.fill.primary.default,
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      <SpinnerGlyph sizePx={16} trackColor="rgba(255,255,255,0.25)" arcColor="#FFFFFF" durationMs={800} />
                      Saving...
                    </button>
                  </IllustratedDoDont>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="content-label-sp" style={{ marginTop: 32, marginBottom: 32 }}>
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
                <li>Present continuous verb: &apos;Loading...&apos;, &apos;Saving...&apos;, &apos;Uploading...&apos;, &apos;Analyzing...&apos;</li>
                <li>Specific when possible: &apos;Loading results...&apos; not just &apos;Loading...&apos;</li>
                <li>Max 3 words + ellipsis</li>
                <li>Never &apos;Please wait&apos; — it sounds like a warning, not a status</li>
              </ul>
            </div>
          </section>

          <section id="content-sr-sp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Screen reader text
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
                <li>The spinner includes a visually hidden aria-label: &apos;Loading&apos; by default</li>
                <li>Pass a custom label prop to override: label=&apos;Saving your changes&apos;</li>
                <li>The label text also serves as the aria-label when visible</li>
              </ul>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="install-sp" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-sp" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock code={`import { Spinner } from '@vds/react'`} filename="component.tsx" language="tsx" />
          </section>
          <section id="examples-sp" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={`// Default
<Spinner />`} filename="Default" language="tsx" />
              <CodeBlock
                code={`// Inside a button
<Button variant="primary" isDisabled>
  <Spinner size="xs" color="white" label="Saving..." />
</Button>`}
                filename="Button"
                language="tsx"
              />
              <CodeBlock
                code={`// Section loading
<div style={{ display: 'flex', alignItems: 'center',
  justifyContent: 'center', minHeight: 200 }}>
  <Spinner size="lg" label="Loading results..." labelPosition="below" />
</div>`}
                filename="Section"
                language="tsx"
              />
              <CodeBlock
                code={`// Inline with text
<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
  Syncing <Spinner size="xs" color="muted" />
</span>`}
                filename="Inline"
                language="tsx"
              />
              <CodeBlock
                code={`// Conditional rendering
{isLoading ? (
  <Spinner size="md" label="Loading..." labelPosition="below" />
) : (
  <DataTable rows={rows} />
)}`}
                filename="Conditional"
                language="tsx"
              />
              <CodeBlock code={`// Custom speed
<Spinner size="md" speed="slow" />`} filename="Speed" language="tsx" />
              <CodeBlock
                code={`// With delay to avoid flicker (recommended for < 1s operations)
const [showSpinner, setShowSpinner] = useState(false)
useEffect(() => {
  if (!isLoading) { setShowSpinner(false); return }
  const timer = setTimeout(() => setShowSpinner(true), 300)
  return () => clearTimeout(timer)
}, [isLoading])
{showSpinner && <Spinner />}`}
                filename="Delay"
                language="tsx"
              />
            </div>
          </section>
          <section id="props-sp" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Props
            </h3>
            <PropsTable props={propsRows} />
          </section>
          <section id="a11y-sp" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Accessibility
            </h3>
            <Callout variant="info" title="Accessibility">
              Spinner renders with role=&apos;status&apos; and aria-label derived from the label prop (or &apos;Loading&apos; by default). This
              ensures screen readers announce the loading state when the spinner appears. When loading completes, the live region is cleared
              automatically.
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
                Initial release. Spinner with 5 sizes, 5 colors, optional label with 2 positions, 3 animation speeds, SVG arc implementation with
                CSS animation.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
