'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { CheckCircle2, ChevronRight, Download, Loader2, RefreshCw, Upload, X } from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '../../../../components/docs/CodeBlock';
import { ComponentTabs } from '../../../../components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '../../../../components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

const TRACK_H = { xs: 2, sm: 4, md: 8, lg: 12 } as const;
type PgSize = keyof typeof TRACK_H;

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

type Variant = 'default' | 'success' | 'danger' | 'warning';

function fillForVariant(t: VDSTheme, v: Variant): string {
  if (v === 'success') return t.text.success.default;
  if (v === 'danger') return t.text.danger.default;
  if (v === 'warning') return t.text.warning.default;
  return t.bg.fill.primary.default;
}

function LiveProgressPreview({
  t,
  value,
  onValueChange,
  variant,
  size,
  isIndeterminate,
  showValue,
}: {
  t: VDSTheme;
  value: number;
  onValueChange: (n: number) => void;
  variant: Variant;
  size: PgSize;
  isIndeterminate: boolean;
  showValue: boolean;
}) {
  const trackHeight = TRACK_H[size];
  const fillColor = fillForVariant(t, variant);

  return (
    <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default }}>Uploading files</span>
          {showValue ? (
            <span style={{ fontSize: 13, fontFamily: 'var(--font-mono), monospace', color: t.text.secondary.default }}>
              {isIndeterminate ? '—' : `${value}%`}
            </span>
          ) : null}
        </div>
        <div
          style={{
            width: '100%',
            height: trackHeight,
            borderRadius: 9999,
            background: t.bg.surface.tertiary.default,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {isIndeterminate ? (
            <div
              style={{
                position: 'absolute',
                height: '100%',
                width: '40%',
                background: fillColor,
                borderRadius: 9999,
                animation: 'docsProgressIndeterminate 1.5s ease-in-out infinite',
              }}
            />
          ) : (
            <div
              style={{
                width: `${value}%`,
                height: '100%',
                background: fillColor,
                borderRadius: 9999,
                transition: 'width 300ms ease',
              }}
            />
          )}
        </div>
        {!isIndeterminate ? (
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onValueChange(Number(e.target.value))}
            style={{ width: '100%', marginTop: 8, accentColor: fillColor }}
          />
        ) : null}
    </div>
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

export default function ProgressDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [pv, setPv] = useState(65);
  const [variant, setVariant] = useState<Variant>('default');
  const [size, setSize] = useState<PgSize>('md');
  const [indeterminate, setIndeterminate] = useState<'off' | 'on'>('off');
  const [showValue, setShowValue] = useState<'off' | 'on'>('on');
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
        { id: 'principles-pg', label: 'Principles' },
        { id: 'anatomy-pg', label: 'Anatomy' },
        { id: 'variants-pg', label: 'Variants' },
        { id: 'sizes-pg', label: 'Sizes' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-pg', label: 'When to use' },
        { id: 'patterns-pg', label: 'Progress patterns' },
        { id: 'dos-donts-pg', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'content-labels-pg', label: 'Label writing' },
        { id: 'content-value-pg', label: 'Value display' },
        { id: 'content-error-pg', label: 'Error messages' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-pg', label: 'Installation' },
        { id: 'import-pg', label: 'Import' },
        { id: 'examples-pg', label: 'Usage examples' },
        { id: 'props-pg', label: 'Props' },
        { id: 'a11y-pg', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const propsRows = [
    { name: 'value', type: 'number', default: '—', description: 'Progress percentage (0–100). Required unless isIndeterminate.' },
    { name: 'max', type: 'number', default: '100', description: 'Maximum value (for non-percentage use cases)' },
    { name: 'label', type: 'string', default: '—', description: 'Descriptive label above the bar' },
    { name: 'showValue', type: 'boolean', default: 'false', description: 'Show percentage value top-right' },
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Track height',
    },
    {
      name: 'variant',
      type: "'default' | 'success' | 'danger' | 'warning'",
      default: "'default'",
      description: 'Fill color semantic',
    },
    { name: 'isIndeterminate', type: 'boolean', default: 'false', description: 'Unknown duration animation mode' },
    { name: 'helperText', type: 'string', default: '—', description: 'Text below the bar' },
    { name: 'className', type: 'string', default: '—', description: 'Additional CSS classes' },
  ];

  const isIndeterminate = indeterminate === 'on';
  const showVal = showValue === 'on';

  return (
    <div className="docs-page-with-toc">
      <style>{`
        @keyframes docsProgressIndeterminate {
          0% { left: -40%; }
          100% { left: 100%; }
        }
      `}</style>
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Progress
      </p>
      <h1 className="page-title">Progress</h1>
      <p className="page-lead">
        Progress communicates system status. It tells users that something is happening, how far along it is, and — when
        possible — how long it will take. The right progress pattern prevents users from abandoning a process they think
        is frozen.
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
                    options={['default', 'success', 'danger', 'warning']}
                    value={variant}
                    onChange={setVariant}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Size"
                    options={['xs', 'sm', 'md', 'lg']}
                    value={size}
                    onChange={setSize}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Indeterminate"
                    options={['off', 'on']}
                    value={indeterminate}
                    onChange={setIndeterminate}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show value"
                    options={['off', 'on']}
                    value={showValue}
                    onChange={setShowValue}
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
              <LiveProgressPreview
                t={previewT}
                value={pv}
                onValueChange={setPv}
                variant={variant}
                size={size}
                isIndeterminate={isIndeterminate}
                showValue={showVal}
              />
            </LivePreviewShell>
          </section>

          <section id="principles-pg" style={{ marginBottom: 48 }}>
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 24, display: 'flex', gap: 12 }}>
                  <Upload size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                  <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <Loader2 size={24} color={t.icon.secondary.default} style={{ marginBottom: 8 }} aria-hidden />
                      <div style={{ fontSize: 10, color: t.text.tertiary.default }}>Spinner only</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ height: 4, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden', marginBottom: 8 }}>
                        <div style={{ width: '60%', height: '100%', background: t.bg.fill.primary.default }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0A8853' }}>60% complete</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Known vs unknown duration
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Use a determinate progress bar when you know the percentage. Use indeterminate (animated) only when you
                    genuinely cannot calculate progress — users find it more reassuring to see a number.
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
                  <CheckCircle2 size={18} color={t.text.brand.default} style={{ opacity: 0.4, marginBottom: 12 }} aria-hidden />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[0, 65, 100].map((pct, i) => (
                      <div key={pct} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: i === 2 ? t.text.success.default : t.bg.fill.primary.default }} />
                        </div>
                        <span style={{ fontSize: 11, color: t.text.secondary.default, width: 48 }}>{i === 2 ? '✓' : `${pct}%`}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Always show completion
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    When a process completes, communicate it explicitly — change the color to success, show a check icon, or
                    update the label. A progress bar that sits at 100% without any feedback leaves users uncertain.
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
                  <RefreshCw size={18} color={t.text.brand.default} style={{ opacity: 0.4, marginBottom: 12 }} aria-hidden />
                  <div style={{ height: 6, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: '45%', height: '100%', background: t.text.danger.default }} />
                  </div>
                  <div style={{ fontSize: 11, color: t.text.danger.default, marginBottom: 8 }}>Upload failed — connection lost</div>
                  <button
                    type="button"
                    style={{
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.primary.default,
                      cursor: 'pointer',
                      color: t.text.primary.default,
                    }}
                  >
                    Retry
                  </button>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Errors need recovery
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    If a process fails mid-progress, show the exact point of failure and provide a clear recovery action.
                    Don&apos;t just reset to zero — that erases the user&apos;s context.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-pg" style={{ marginBottom: 48 }}>
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
                minHeight: 220,
              }}
            >
              <div style={{ maxWidth: 440, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="C" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default }}>Label text</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="D" />
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono), monospace', color: t.text.secondary.default }}>65%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <AnnotationDot letter="A" />
                  <div style={{ flex: 1, position: 'relative', paddingRight: 36 }}>
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <div style={{ width: 1, height: 10, background: '#E8186D' }} />
                      <AnnotationDot letter="F" />
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#E8186D' }}>8px</span>
                      <div style={{ width: 1, height: 10, background: '#E8186D' }} />
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 999,
                        background: t.bg.surface.tertiary.default,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: '65%',
                          height: '100%',
                          background: t.bg.fill.primary.default,
                          borderRadius: 999,
                          position: 'relative',
                        }}
                      >
                        <div style={{ position: 'absolute', left: 8, top: -26 }}>
                          <AnnotationDot letter="B" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AnnotationDot letter="E" />
                  <span style={{ fontSize: 12, color: t.text.tertiary.default }}>Helper text or status message</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 12, lineHeight: 1.6 }}>
              A Track · B Fill · C Label · D Value label · E Helper text · F Track height
            </p>
          </section>

          <section id="variants-pg" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    title: 'Default',
                    token: 'color.bg.fill.primary.default',
                    desc: 'Standard progress. Use for uploads, downloads, and general loading states.',
                    node: (
                      <div style={{ width: '100%' }}>
                        <div style={{ height: 8, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden' }}>
                          <div style={{ width: '65%', height: '100%', background: t.bg.fill.primary.default }} />
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Success',
                    token: 'color.text.success.default',
                    desc: 'Process completed successfully. Transition from default to success on completion.',
                    node: (
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Complete</span>
                          <CheckCircle2 size={14} color={t.text.success.default} />
                        </div>
                        <div style={{ height: 8, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden' }}>
                          <div style={{ width: '100%', height: '100%', background: t.text.success.default }} />
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Danger',
                    token: 'color.text.danger.default',
                    desc: 'Process failed. Shows the point of failure. Always pair with an error message and recovery action.',
                    node: (
                      <div style={{ width: '100%' }}>
                        <div style={{ fontSize: 11, color: t.text.danger.default, marginBottom: 6 }}>Upload failed</div>
                        <div style={{ height: 8, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden' }}>
                          <div style={{ width: '45%', height: '100%', background: t.text.danger.default }} />
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Warning',
                    token: 'color.text.warning.default',
                    desc: 'Approaching a limit or threshold. Use for storage usage, quota tracking, resource consumption.',
                    node: (
                      <div style={{ width: '100%' }}>
                        <div style={{ fontSize: 11, marginBottom: 6, color: t.text.secondary.default }}>Low storage — 80% used</div>
                        <div style={{ height: 8, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden' }}>
                          <div style={{ width: '80%', height: '100%', background: t.text.warning.default }} />
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Indeterminate',
                    token: 'color.bg.fill.primary.default',
                    desc: 'Unknown duration. Use only when percentage cannot be calculated. The animation communicates activity without false precision.',
                    node: (
                      <div style={{ width: '100%', height: 8, borderRadius: 999, background: t.bg.surface.tertiary.default, position: 'relative', overflow: 'hidden' }}>
                        <div
                          style={{
                            position: 'absolute',
                            height: '100%',
                            width: '40%',
                            background: t.bg.fill.primary.default,
                            borderRadius: 999,
                            animation: 'docsProgressIndeterminate 1.5s ease-in-out infinite',
                          }}
                        />
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
                  <div style={{ minHeight: 100, background: t.bg.surface.secondary.default, padding: 24, display: 'flex', alignItems: 'center' }}>{v.node}</div>
                  <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>{v.title}</div>
                    <span style={chipStyleB(t, { marginBottom: 8 })}>{v.token}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="sizes-pg" style={{ marginBottom: 48 }}>
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
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {(
                [
                  { k: 'xs' as const, h: 2, ann: '2px', use: 'Inline loaders, bottom of cards, subtle page progress' },
                  { k: 'sm' as const, h: 4, ann: '4px', use: 'Compact file lists, notification progress' },
                  { k: 'md' as const, h: 8, ann: '8px', use: 'Standard forms, upload/download UI' },
                  { k: 'lg' as const, h: 12, ann: '12px', use: 'Prominent progress, onboarding steps, storage indicators' },
                ] as const
              ).map((row) => (
                <div key={row.k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', width: 40, fontFamily: 'var(--font-mono)' }}>{row.ann}</span>
                  <div style={{ flex: 1, maxWidth: 280, height: row.h, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden' }}>
                    <div style={{ width: '60%', height: '100%', background: t.bg.fill.primary.default }} />
                  </div>
                  <span style={{ fontSize: 11, color: t.text.secondary.default, flex: 1 }}>{row.use}</span>
                  {row.k === 'md' ? <span style={chipStyleA({ fontSize: 10, padding: '2px 8px' })}>default</span> : null}
                </div>
              ))}
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
                    {['SIZE', 'HEIGHT', 'USE CASE'].map((h) => (
                      <th key={h} style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['xs', '2px', 'Inline, subtle, bottom-of-component loaders'],
                    ['sm', '4px', 'Compact file lists, notification areas'],
                    ['md', '8px', 'Default — forms, uploads, downloads'],
                    ['lg', '12px', 'Prominent progress, storage, onboarding'],
                  ].map((r, i) => (
                    <tr key={r[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>
                        {r[0]}
                        {i === 2 ? (
                          <span style={{ marginLeft: 8 }}>
                            <span style={chipStyleA({ fontSize: 10, padding: '2px 8px' })}>default</span>
                          </span>
                        ) : null}
                      </td>
                      <td style={{ padding: 12 }}>{r[1]}</td>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-pg" style={{ marginTop: 32, marginBottom: 40 }}>
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
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {[
                  'File uploads and downloads',
                  'Multi-step form completion',
                  'Background processing (import, export, sync)',
                  'Resource usage indicators (storage, quota)',
                  'Loading sequences with measurable steps',
                ].map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Download size={16} color="#0A8853" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                    <span style={{ fontSize: 13, color: t.text.secondary.default }}>{text}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: 'rgba(232,24,109,0.04)',
                  border: '1px solid rgba(232,24,109,0.2)',
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {[
                  'Page loading (use Skeleton instead)',
                  'Button loading states (use Spinner instead)',
                  'Short operations < 1 second (no feedback needed)',
                  'Decorative visual elements',
                ].map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <X size={16} color="#E8186D" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                    <span style={{ fontSize: 13, color: t.text.secondary.default }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="info" title="The 1-second rule">
                Operations under 1 second don&apos;t need a progress indicator — showing one creates more anxiety than relief.
                Show progress only when the wait is long enough that the user might wonder if something is wrong.
              </Callout>
            </div>
          </section>

          <section id="patterns-pg" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Progress patterns
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {(
                [
                  {
                    title: 'Per-file progress',
                    desc: 'Show individual progress for each file in a multi-file upload. Users need to track each item independently.',
                    node: (
                      <div style={{ fontSize: 12, width: '100%' }}>
                        {[
                          ['document.pdf', 80, 'uploading'],
                          ['image.png', 100, 'done'],
                          ['report.xlsx', 40, 'uploading'],
                        ].map(([name, pct, st]) => (
                          <div key={String(name)} style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span>{name}</span>
                              <span>{st === 'done' ? 'Done ✓' : `${pct}%`}</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  background: st === 'done' ? t.text.success.default : t.bg.fill.primary.default,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    title: 'Step progress',
                    desc: 'For multi-step flows, show the step count and highlight the current position. Completed steps stay filled.',
                    node: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        {[1, 2, 3, 4].map((step) => (
                          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                background: step <= 2 ? t.bg.fill.primary.default : t.bg.surface.tertiary.default,
                                border: step === 3 ? `2px solid ${t.border.brand.default}` : 'none',
                              }}
                            />
                            {step < 4 ? <div style={{ width: 24, height: 2, background: t.border.default.default }} /> : null}
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    title: 'Resource usage',
                    desc: 'For storage and quota indicators, use the warning variant when usage exceeds ~75%, and danger when approaching 90%+.',
                    node: (
                      <div style={{ width: '100%' }}>
                        <div style={{ fontSize: 11, marginBottom: 6 }}>Storage usage</div>
                        <div style={{ height: 10, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden', marginBottom: 6 }}>
                          <div style={{ width: '80%', height: '100%', background: t.text.warning.default }} />
                        </div>
                        <div style={{ fontSize: 10, color: t.text.secondary.default }}>12.4 GB of 15 GB used · 2.6 GB free</div>
                      </div>
                    ),
                  },
                  {
                    title: 'In-context progress',
                    desc: 'Embed progress inside the component triggering the operation — toast, card, or inline. Keep it close to what it’s tracking.',
                    node: (
                      <div
                        style={{
                          border: `1px solid ${t.border.default.default}`,
                          borderRadius: 10,
                          padding: 12,
                          background: t.bg.surface.primary.default,
                          width: '100%',
                        }}
                      >
                        <div style={{ fontSize: 11, marginBottom: 8 }}>↗ Exporting report…</div>
                        <div style={{ height: 4, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden', marginBottom: 8 }}>
                          <div style={{ width: '78%', height: '100%', background: t.bg.fill.primary.default }} />
                        </div>
                        <button type="button" style={{ fontSize: 11, color: t.text.brand.default, background: 'none', border: 'none', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    ),
                  },
                ] as const
              ).map((c) => (
                <div
                  key={c.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ background: t.bg.surface.secondary.default, padding: 20, minHeight: 140, display: 'flex', alignItems: 'center' }}>{c.node}</div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>{c.title}</div>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="dos-donts-pg" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <IllustratedDoDont
                t={t}
                ok
                title="Show completion explicitly"
                caption="Completion is a distinct state. Color, icon, and text all confirm success."
              >
                <div style={{ width: 220 }}>
                  <div style={{ height: 6, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ width: '100%', height: '100%', background: t.text.success.default }} />
                  </div>
                  <div style={{ fontSize: 11, color: t.text.success.default, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={12} /> Upload complete
                  </div>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="100% — no feedback"
                caption="100% without feedback leaves users checking if it actually worked. Always close the loop."
              >
                <div style={{ width: 220, height: 6, borderRadius: 999, background: t.bg.surface.tertiary.default, overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: t.bg.fill.primary.default }} />
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Pair with context"
                caption="Context makes progress meaningful. Users know exactly what's happening."
              >
                <div style={{ fontSize: 11, color: t.text.secondary.default }}>Uploading 3 files (2 of 3 complete)</div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Bar only"
                caption="A progress bar with no label is ambiguous. Loading what? Users can't assess whether the wait is reasonable."
              >
                <div style={{ width: 160, height: 6, background: t.bg.surface.tertiary.default, borderRadius: 999 }} />
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Indeterminate when honest"
                caption="Indeterminate is honest when you can't calculate progress. The animation confirms activity."
              >
                <div style={{ fontSize: 11 }}>Analyzing your data…</div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Fake indeterminate"
                caption="Using indeterminate when you could show a percentage feels evasive. Users prefer honest numbers."
              >
                <div style={{ fontSize: 11, color: t.text.tertiary.default }}>Upload (unknown % but known)</div>
              </IllustratedDoDont>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="content-labels-pg" style={{ marginTop: 32, marginBottom: 32 }}>
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
                <li>Describe what&apos;s happening: &apos;Uploading files&apos;, not &apos;Loading...&apos;</li>
                <li>Use present progressive: &apos;Exporting report&apos;, &apos;Syncing data&apos;</li>
                <li>For completion: &apos;Upload complete&apos;, &apos;Export ready&apos;</li>
                <li>For errors: &apos;Upload failed — connection lost&apos;</li>
              </ul>
            </div>
          </section>

          <section id="content-value-pg" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Value display
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
                <li>Percentage: &quot;65%&quot; — default for most cases</li>
                <li>Fraction: &quot;2 of 5 files&quot; — better for discrete items</li>
                <li>Remaining: &quot;2 minutes left&quot; — better for time-based progress</li>
                <li>Bytes: &quot;4.2 MB of 10 MB&quot; — better for file sizes</li>
              </ul>
            </div>
          </section>

          <section id="content-error-pg" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Error messages
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
                <li>Always include a recovery action: &apos;Upload failed — Retry&apos;</li>
                <li>Show what failed, not just that something failed</li>
                <li>Keep the progress at the failure point — don&apos;t reset to 0</li>
              </ul>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="install-pg" style={{ marginTop: 32, marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-pg" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock code={`import { Progress } from '@vds/react'`} filename="component.tsx" language="tsx" />
          </section>
          <section id="examples-pg" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={`<Progress value={65} label="Uploading files" />`} filename="Basic" language="tsx" />
              <CodeBlock
                code={`<Progress
  value={65}
  label="Uploading files"
  showValue
  size="md"
/>`}
                filename="With value"
                language="tsx"
              />
              <CodeBlock
                code={`<Progress
  value={100}
  variant="success"
  label="Upload complete"
  showValue
/>`}
                filename="Success"
                language="tsx"
              />
              <CodeBlock
                code={`<Progress
  value={45}
  variant="danger"
  label="Upload failed"
  helperText="Connection lost — check your network and retry"
/>`}
                filename="Error"
                language="tsx"
              />
              <CodeBlock
                code={`<Progress
  isIndeterminate
  label="Analyzing your data..."
/>`}
                filename="Indeterminate"
                language="tsx"
              />
              <CodeBlock
                code={`<Progress
  value={80}
  variant="warning"
  label="Storage usage"
  helperText="12.4 GB of 15 GB used · 2.6 GB free"
  showValue
  size="lg"
/>`}
                filename="Storage"
                language="tsx"
              />
              <CodeBlock
                code={`<Progress value={60} size="xs" />
<Progress value={60} size="sm" />
<Progress value={60} size="md" />  {/* default */}
<Progress value={60} size="lg" />`}
                filename="Sizes"
                language="tsx"
              />
            </div>
          </section>
          <section id="props-pg" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Props
            </h3>
            <PropsTable props={propsRows} />
          </section>
          <section id="a11y-pg" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Accessibility
            </h3>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="info" title="Built-in accessibility">
                Progress renders with role=&apos;progressbar&apos;, aria-valuenow, aria-valuemin, aria-valuemax, and aria-label from
                the label prop. Indeterminate mode omits aria-valuenow per ARIA spec. Screen readers announce the progress
                value on update. The component respects prefers-reduced-motion — indeterminate animation pauses automatically.
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
                Initial release. All sizes, variants, indeterminate mode, value display.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
