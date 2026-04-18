'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { AlignCenter, AlignLeft, AlignRight, ChevronRight, Minus, MoreHorizontal } from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { CodeBlock } from '../../../../components/docs/CodeBlock';
import { ComponentTabs } from '../../../../components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '../../../../components/docs/PropsTable';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type LineVariant = 'solid' | 'dashed' | 'dotted' | 'label';
type LabelAlign = 'left' | 'center' | 'right';
type Orientation = 'horizontal' | 'vertical';
type Strength = 'subtle' | 'default' | 'strong';
type SpacingKey = 'sm' | 'md' | 'lg' | 'xl';
type EdgeMode = 'flush' | 'inset';

const SPACING_PX: Record<SpacingKey, number> = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

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

function lineColorForStrength(t: VDSTheme, strength: Strength): string {
  return strength === 'subtle' ? t.border.default.default : t.border.strong.default;
}

function lineThickness(strength: Strength, variant: LineVariant): number {
  if (variant === 'dotted') return 2;
  return strength === 'strong' ? 2 : 1;
}

function HorizontalLineSegment({
  t,
  variant,
  strength,
}: {
  t: VDSTheme;
  variant: LineVariant;
  strength: Strength;
}) {
  const color = lineColorForStrength(t, strength);
  const w = lineThickness(strength, variant === 'label' ? 'solid' : variant);
  const vv = variant === 'label' ? 'solid' : variant;

  if (vv === 'solid') {
    return <div style={{ width: '100%', height: w, background: color, borderRadius: 1, flexShrink: 0 }} />;
  }
  if (vv === 'dashed') {
    return <div style={{ width: '100%', height: 0, borderTop: `${w}px dashed ${color}`, flexShrink: 0 }} />;
  }
  return <div style={{ width: '100%', height: 0, borderTop: `2px dotted ${color}`, flexShrink: 0 }} />;
}

function LabeledDividerPreview({
  t,
  label,
  labelAlign,
  strength,
  variant,
  inset,
}: {
  t: VDSTheme;
  label: string;
  labelAlign: LabelAlign;
  strength: Strength;
  variant: LineVariant;
  inset: boolean;
}) {
  const labelStyle: CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: t.text.tertiary.default,
    padding: '0 12px',
    background: t.bg.surface.primary.default,
    flexShrink: 0,
  };

  const insetPad = inset ? 24 : 0;
  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginLeft: insetPad,
    marginRight: insetPad,
    boxSizing: 'border-box',
  };

  const seg = <HorizontalLineSegment t={t} variant={variant} strength={strength} />;

  if (labelAlign === 'center') {
    return (
      <div style={rowStyle}>
        <div style={{ flex: 1, minWidth: 0 }}>{seg}</div>
        <span style={labelStyle}>{label}</span>
        <div style={{ flex: 1, minWidth: 0 }}>{seg}</div>
      </div>
    );
  }
  if (labelAlign === 'left') {
    return (
      <div style={rowStyle}>
        <span style={labelStyle}>{label}</span>
        <div style={{ flex: 1, minWidth: 0 }}>{seg}</div>
      </div>
    );
  }
  return (
    <div style={rowStyle}>
      <div style={{ flex: 1, minWidth: 0 }}>{seg}</div>
      <span style={labelStyle}>{label}</span>
    </div>
  );
}

function SimpleHorizontalRule({
  t,
  variant,
  strength,
  inset,
}: {
  t: VDSTheme;
  variant: Exclude<LineVariant, 'label'>;
  strength: Strength;
  inset: boolean;
}) {
  const color = lineColorForStrength(t, strength);
  const w = lineThickness(strength, variant);
  const insetPad = inset ? 24 : 0;
  const base: CSSProperties = {
    width: '100%',
    marginLeft: insetPad,
    marginRight: insetPad,
    boxSizing: 'border-box',
    border: 'none',
    padding: 0,
    display: 'block',
  };

  if (variant === 'solid') {
    return <hr style={{ ...base, height: w, background: color }} />;
  }
  if (variant === 'dashed') {
    return <hr style={{ ...base, height: 0, borderTop: `${w}px dashed ${color}` }} />;
  }
  return <hr style={{ ...base, height: 0, borderTop: `2px dotted ${color}` }} />;
}

function VerticalRule({
  t,
  variant,
  strength,
  spacing,
}: {
  t: VDSTheme;
  variant: Exclude<LineVariant, 'label'>;
  strength: Strength;
  spacing: SpacingKey;
}) {
  const color = lineColorForStrength(t, strength);
  const w = lineThickness(strength, variant);
  const sp = SPACING_PX[spacing];
  const base: CSSProperties = {
    alignSelf: 'stretch',
    minHeight: 80,
    marginLeft: sp,
    marginRight: sp,
    flexShrink: 0,
  };

  if (variant === 'solid') {
    return <div style={{ ...base, width: w, background: color }} role="separator" aria-orientation="vertical" />;
  }
  if (variant === 'dashed') {
    return (
      <div
        style={{ ...base, width: 0, borderLeft: `${w}px dashed ${color}` }}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }
  return (
    <div
      style={{ ...base, width: 0, borderLeft: `2px dotted ${color}` }}
      role="separator"
      aria-orientation="vertical"
    />
  );
}

function LiveDividerCanvas({
  t,
  lineVariant,
  labelAlign,
  orientation,
  strength,
  spacing,
  edge,
}: {
  t: VDSTheme;
  lineVariant: LineVariant;
  labelAlign: LabelAlign;
  orientation: Orientation;
  strength: Strength;
  spacing: SpacingKey;
  edge: EdgeMode;
}) {
  const sp = SPACING_PX[spacing];
  const inset = edge === 'inset';

  const textAbove = (
    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>
      Plan and track work in one place. Organize projects, assign owners, and keep everyone aligned with shared context.
    </p>
  );
  const textBelow = (
    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>
      Notifications keep you informed without overwhelming your inbox. Tune delivery per channel and workspace.
    </p>
  );

  const blockStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: t.text.secondary.default,
    lineHeight: 1.45,
  };

  if (orientation === 'vertical') {
    const vVariant: Exclude<LineVariant, 'label'> = lineVariant === 'label' ? 'solid' : lineVariant;
    return (
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: t.bg.surface.primary.default,
          borderRadius: 12,
          border: `1px solid ${t.border.default.default}`,
          padding: 40,
          boxShadow: t.shadow.card,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, minHeight: 80 }}>
          <div style={blockStyle}>
            Launch faster with templates, reusable components, and design tokens that stay in sync with code.
          </div>
          <VerticalRule t={t} variant={vVariant} strength={strength} spacing={spacing} />
          <div style={blockStyle}>
            Review changes in context, leave feedback inline, and ship with confidence using automated checks.
          </div>
        </div>
      </div>
    );
  }

  const marginWrap: CSSProperties = {
    marginTop: sp,
    marginBottom: sp,
  };

  const inner =
    lineVariant === 'label' ? (
      <div style={marginWrap}>
        <LabeledDividerPreview
          t={t}
          label="Section title"
          labelAlign={labelAlign}
          strength={strength}
          variant="solid"
          inset={inset}
        />
      </div>
    ) : (
      <div style={marginWrap}>
        <SimpleHorizontalRule t={t} variant={lineVariant} strength={strength} inset={inset} />
      </div>
    );

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 440,
        background: t.bg.surface.primary.default,
        borderRadius: 12,
        border: `1px solid ${t.border.default.default}`,
        padding: 40,
        boxShadow: t.shadow.card,
      }}
    >
      {textAbove}
      {inner}
      {textBelow}
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

function dottedZoneStyle(t: VDSTheme, minH: number): CSSProperties {
  return {
    backgroundColor: t.bg.surface.secondary.default,
    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
    backgroundSize: '10px 10px',
    borderRadius: 14,
    border: `1px solid ${t.border.default.default}`,
    padding: 20,
    minHeight: minH,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export default function DividerDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [lineVariant, setLineVariant] = useState<LineVariant>('solid');
  const [labelAlign, setLabelAlign] = useState<LabelAlign>('center');
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [strength, setStrength] = useState<Strength>('default');
  const [spacing, setSpacing] = useState<SpacingKey>('md');
  const [edge, setEdge] = useState<EdgeMode>('flush');
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
        { id: 'principles-dv', label: 'Principles' },
        { id: 'anatomy-dv', label: 'Anatomy' },
        { id: 'variants-dv', label: 'Variants' },
        { id: 'orientation-dv', label: 'Orientation' },
        { id: 'spacing-dv', label: 'Spacing' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-dv', label: 'When to use' },
        { id: 'patterns-dv', label: 'Common patterns' },
        { id: 'dos-donts-dv', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'label-text-dv', label: 'Label text' },
        { id: 'when-label-dv', label: 'When to use a label' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-dv', label: 'Installation' },
        { id: 'import-dv', label: 'Import' },
        { id: 'examples-dv', label: 'Usage examples' },
        { id: 'props-dv', label: 'Props' },
        { id: 'a11y-dv', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const propsRows = [
    {
      name: 'variant',
      type: "'solid' | 'dashed' | 'dotted'",
      default: "'solid'",
      description: 'Line style',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Direction',
    },
    {
      name: 'spacing',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      default: "'md'",
      description: 'Margin around divider',
    },
    {
      name: 'strength',
      type: "'subtle' | 'default' | 'strong'",
      default: "'default'",
      description: 'Line weight and opacity',
    },
    {
      name: 'label',
      type: 'string',
      default: '—',
      description: 'Text label (enables label variant)',
    },
    {
      name: 'labelAlign',
      type: "'left' | 'center' | 'right'",
      default: "'center'",
      description: 'Label position',
    },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Divider
      </p>
      <h1 className="page-title">Divider</h1>
      <p className="page-lead">
        Dividers create visual separation between sections of content. They&apos;re one of the most understated components in a
        design system — used correctly, they add clarity and rhythm without adding noise. Used incorrectly, they fragment layouts
        and create visual clutter.
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
                    options={['solid', 'dashed', 'dotted', 'label']}
                    value={lineVariant}
                    onChange={(v) => setLineVariant(v as LineVariant)}
                  />
                  {lineVariant === 'label' ? (
                    <LivePreviewSegmentRow
                      t={t}
                      label="Label align"
                      options={['left', 'center', 'right']}
                      value={labelAlign}
                      onChange={(v) => setLabelAlign(v as LabelAlign)}
                    />
                  ) : null}
                  <LivePreviewSegmentRow
                    t={t}
                    label="Orientation"
                    options={['horizontal', 'vertical']}
                    value={orientation}
                    onChange={(v) => setOrientation(v as Orientation)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Strength"
                    options={['subtle', 'default', 'strong']}
                    value={strength}
                    onChange={(v) => setStrength(v as Strength)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Spacing"
                    options={['sm', 'md', 'lg', 'xl']}
                    value={spacing}
                    onChange={(v) => setSpacing(v as SpacingKey)}
                  />
                  {orientation === 'horizontal' ? (
                    <LivePreviewSegmentRow
                      t={t}
                      label="Edge"
                      options={['flush', 'inset']}
                      value={edge}
                      onChange={(v) => setEdge(v as EdgeMode)}
                    />
                  ) : null}
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
              <LiveDividerCanvas
                t={previewT}
                lineVariant={lineVariant}
                labelAlign={labelAlign}
                orientation={orientation}
                strength={strength}
                spacing={spacing}
                edge={edge}
              />
            </LivePreviewShell>
          </section>

          <section id="principles-dv" style={{ marginBottom: 48 }}>
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
                <div style={{ ...dottedZoneStyle(t, 140), flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: '#E8186D', marginBottom: 6 }}>DON&apos;T</div>
                      <div
                        style={{
                          background: t.bg.surface.primary.default,
                          borderRadius: 8,
                          border: `1px solid ${t.border.default.default}`,
                          padding: 8,
                          fontSize: 10,
                          color: t.text.secondary.default,
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i}>
                            {i > 1 ? <div style={{ height: 1, background: t.border.default.default, margin: '6px 0' }} /> : null}
                            <div>Item {i}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: '#0A8853', marginBottom: 6 }}>DO</div>
                      <div
                        style={{
                          background: t.bg.surface.primary.default,
                          borderRadius: 8,
                          border: `1px solid ${t.border.default.default}`,
                          padding: 8,
                          fontSize: 10,
                          color: t.text.secondary.default,
                        }}
                      >
                        <div>Alpha · Beta · Gamma</div>
                        <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
                        <div>Delta · Epsilon</div>
                        <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
                        <div>Zeta</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Minus size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Separate groups, not items</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A divider separates logical groups of content — not individual items within a group. If every list item has a
                    divider, the dividers become noise. Use spacing to separate items, dividers to separate sections.
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
                <div style={{ ...dottedZoneStyle(t, 140), flexDirection: 'row', gap: 16 }}>
                  <div style={{ flex: 1, maxWidth: 120 }}>
                    <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 6 }}>Full bleed</div>
                    <div
                      style={{
                        background: t.bg.surface.primary.default,
                        borderRadius: 8,
                        border: `1px solid ${t.border.default.default}`,
                        padding: 10,
                        fontSize: 10,
                        color: t.text.secondary.default,
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>Settings</div>
                      <div style={{ height: 1, background: t.border.strong.default, margin: '0 -10px 8px' }} />
                      <div>Profile fields</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, maxWidth: 120 }}>
                    <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 6 }}>Inset rhythm</div>
                    <div
                      style={{
                        background: t.bg.surface.primary.default,
                        borderRadius: 8,
                        border: `1px solid ${t.border.default.default}`,
                        padding: 10,
                        fontSize: 10,
                        color: t.text.secondary.default,
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>Settings</div>
                      <div style={{ height: 1, background: t.border.strong.default, margin: '0 0 8px' }} />
                      <div>Profile fields</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <AlignCenter size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Respect the layout rhythm</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A full-width divider that bleeds to the edges feels heavy. In most cases, an inset divider — one that respects
                    the same horizontal padding as the content — feels more intentional and less disruptive.
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
                <div style={{ ...dottedZoneStyle(t, 160), flexDirection: 'column', gap: 12, alignItems: 'stretch' }}>
                  <div
                    style={{
                      background: t.bg.surface.primary.default,
                      borderRadius: 8,
                      border: `1px solid ${t.border.default.default}`,
                      padding: 10,
                      fontSize: 10,
                      color: t.text.secondary.default,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1, padding: 6, borderRadius: 6, border: `1px dashed ${t.border.default.default}` }}>
                        Email
                      </div>
                      <div style={{ flex: 1, padding: 6, borderRadius: 6, border: `1px dashed ${t.border.default.default}` }}>
                        Google
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 1, background: t.border.default.default }} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, padding: '0 6px' }}>OR</span>
                      <div style={{ flex: 1, height: 1, background: t.border.default.default }} />
                    </div>
                  </div>
                  <div
                    style={{
                      background: t.bg.surface.primary.default,
                      borderRadius: 8,
                      border: `1px solid ${t.border.default.default}`,
                      padding: 10,
                      fontSize: 10,
                      color: t.text.secondary.default,
                    }}
                  >
                    <div style={{ marginBottom: 6 }}>Account</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          color: t.text.tertiary.default,
                          padding: '0 8px',
                          background: t.bg.surface.primary.default,
                          flexShrink: 0,
                        }}
                      >
                        Advanced settings
                      </span>
                      <div style={{ flex: 1, height: 1, background: t.border.default.default }} />
                    </div>
                    <div style={{ marginTop: 8 }}>Theme · Locale</div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <MoreHorizontal size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Labels add meaning</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A divider with a label is a lightweight section header. Use it to name a boundary without the visual weight of
                    a full heading. Common uses: &apos;OR&apos; between alternatives, section names in long forms, category
                    separators in lists.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-dv" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 420px', minWidth: 280 }}>
                <div
                  style={{
                    position: 'relative',
                    height: 260,
                    ...dottedZoneStyle(t, 260),
                    padding: 24,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 0,
                  }}
                >
                  <div style={{ fontSize: 11, color: t.text.secondary.default, textAlign: 'center', marginBottom: 8 }}>
                    Content above
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 280, margin: '0 auto' }}>
                    <div style={{ position: 'absolute', left: 24, top: '42%', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AnnotationDot letter="A" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ height: 1, background: t.border.default.default }} />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: t.text.tertiary.default,
                          padding: '0 12px',
                          background: t.bg.surface.primary.default,
                        }}
                      >
                        OR
                      </span>
                      <div style={{ position: 'absolute', right: -28, top: '50%', transform: 'translateY(-50%)' }}>
                        <AnnotationDot letter="B" />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ height: 1, background: t.border.default.default }} />
                    </div>
                    <div style={{ position: 'absolute', right: 24, top: '42%', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AnnotationDot letter="C" />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: t.text.secondary.default, textAlign: 'center', marginTop: 8 }}>
                    Content below
                  </div>
                  <div style={{ position: 'absolute', left: 8, bottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="D" />
                    <span style={{ fontSize: 10, color: t.text.tertiary.default }}>Full line (no label)</span>
                  </div>
                  <div style={{ position: 'absolute', right: 8, bottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="E" />
                    <span style={{ fontSize: 10, color: t.text.tertiary.default }}>Spacing margins</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: '0 1 200px', minWidth: 180 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Vertical</div>
                <div style={{ ...dottedZoneStyle(t, 120), padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, height: 72, width: '100%', maxWidth: 200 }}>
                    <div style={{ flex: 1, fontSize: 10, color: t.text.secondary.default }}>Left block</div>
                    <div
                      style={{
                        width: 1,
                        alignSelf: 'stretch',
                        background: t.border.default.default,
                        marginLeft: 12,
                        marginRight: 12,
                      }}
                      role="separator"
                      aria-orientation="vertical"
                    />
                    <div style={{ flex: 1, fontSize: 10, color: t.text.secondary.default }}>Right block</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: t.text.tertiary.default, marginTop: 8, lineHeight: 1.5, marginBottom: 0 }}>
                  Vertical line: 1px, height 100%, border color, horizontal margin from spacing.
                </p>
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: t.text.secondary.default }}>
              <p style={{ margin: 0 }}>
                <strong style={{ color: t.text.primary.default }}>A</strong> — Divider container (width 100%, display flex,
                alignItems center, vertical margin from spacing).
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: t.text.primary.default }}>B</strong> — Label (12px, semibold, tertiary text, padding 0
                12px, flexShrink 0, surface background).
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: t.text.primary.default }}>C</strong> — Line segments (flex 1, 1px, border.default — one
                on each side of the label).
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: t.text.primary.default }}>D</strong> — Full line without label (width 100%, 1px,
                border.default).
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: t.text.primary.default }}>E</strong> — Spacing (margin-top + margin-bottom from the
                spacing prop — sm / md / lg / xl).
              </p>
            </div>
          </section>

          <section id="variants-dv" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    title: 'Solid',
                    token: 'variant: solid',
                    desc: 'Default. Clean 1px line. Use for most section separations — nav items, list groups, form sections.',
                    node: (
                      <>
                        <div style={{ fontSize: 11, color: t.text.secondary.default, marginBottom: 8 }}>Paragraph text</div>
                        <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
                        <div style={{ fontSize: 11, color: t.text.secondary.default }}>Paragraph text</div>
                      </>
                    ),
                  },
                  {
                    title: 'Dashed',
                    token: 'variant: dashed',
                    desc: 'Softer visual boundary. Use when the separation should feel lighter or provisional — draft states, optional sections, incomplete content.',
                    node: (
                      <>
                        <div style={{ fontSize: 11, color: t.text.secondary.default, marginBottom: 8 }}>Paragraph text</div>
                        <div style={{ height: 0, borderTop: `1px dashed ${t.border.default.default}`, margin: '8px 0' }} />
                        <div style={{ fontSize: 11, color: t.text.secondary.default }}>Paragraph text</div>
                      </>
                    ),
                  },
                  {
                    title: 'Dotted',
                    token: 'variant: dotted',
                    desc: 'Decorative boundary. Use sparingly — in marketing sections, feature lists, or anywhere a touch of texture serves the design.',
                    node: (
                      <>
                        <div style={{ fontSize: 11, color: t.text.secondary.default, marginBottom: 8 }}>Paragraph text</div>
                        <div style={{ height: 0, borderTop: `2px dotted ${t.border.default.default}`, margin: '8px 0' }} />
                        <div style={{ fontSize: 11, color: t.text.secondary.default }}>Paragraph text</div>
                      </>
                    ),
                  },
                  {
                    title: 'With label',
                    token: 'variant: label',
                    desc: 'Labeled divider. Combines separation with a lightweight heading. labelAlign controls position: center, left, or right.',
                    node: (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <AlignLeft size={14} color={t.icon.tertiary.default} aria-hidden />
                          <AlignCenter size={14} color={t.icon.tertiary.default} aria-hidden />
                          <AlignRight size={14} color={t.icon.tertiary.default} aria-hidden />
                        </div>
                        <div style={{ fontSize: 11, color: t.text.secondary.default, marginBottom: 8 }}>Paragraph text</div>
                        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                          <div style={{ flex: 1, height: 1, background: t.border.default.default }} />
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: t.text.tertiary.default,
                              padding: '0 8px',
                              background: t.bg.surface.primary.default,
                            }}
                          >
                            Section
                          </span>
                          <div style={{ flex: 1, height: 1, background: t.border.default.default }} />
                        </div>
                        <div style={{ fontSize: 11, color: t.text.secondary.default }}>Paragraph text</div>
                      </>
                    ),
                  },
                ] as const
              ).map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZoneStyle(t, 120), minHeight: 120 }}>{item.node}</div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>{item.title}</div>
                    <span style={chipStyleB(t, { marginBottom: 8 })}>{item.token}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="orientation-dv" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Orientation
            </h2>
            <p style={{ fontSize: 17, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              Dividers are horizontal by default. Use vertical dividers to separate inline elements — stat groups, toolbar
              actions, breadcrumb segments.
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
                <div style={{ ...dottedZoneStyle(t, 160), minHeight: 160, flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 11, color: t.text.secondary.default }}>Block A</div>
                  <div style={{ width: '100%', height: 1, background: t.border.default.default }} />
                  <div style={{ fontSize: 11, color: t.text.secondary.default }}>Block B</div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                    orientation: horizontal (default)
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Separates stacked content. Use in lists, forms, sections, page layouts.
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
                <div style={{ ...dottedZoneStyle(t, 160), minHeight: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontSize: 12, fontWeight: 600, color: t.text.secondary.default }}>
                    <span>24 projects</span>
                    <div style={{ width: 1, height: 16, background: t.border.default.default, margin: '0 12px' }} />
                    <span>8 members</span>
                    <div style={{ width: 1, height: 16, background: t.border.default.default, margin: '0 12px' }} />
                    <span>4 active</span>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                    orientation: vertical
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Separates inline content. Use in stat groups, toolbars, breadcrumbs, nav items.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="spacing-dv" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Spacing
            </h2>
            <p style={{ fontSize: 17, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              The spacing prop controls the margin-top and margin-bottom (or margin-left/right for vertical) of the divider.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(
                [
                  ['sm', '8px', 'Dense lists, compact components'],
                  ['md', '16px', 'Default — most contexts'],
                  ['lg', '24px', 'Section separations, forms'],
                  ['xl', '32px', 'Page-level section breaks'],
                ] as const
              ).map(([key, px, use]) => {
                const n = Number(px.replace('px', ''));
                return (
                  <div
                    key={key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 1fr 2fr',
                      gap: 12,
                      alignItems: 'center',
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 12,
                      padding: '12px 16px',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{key}</span>
                    <span style={{ fontSize: 13, color: t.text.tertiary.default }}>{px}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                      <div style={{ width: n, alignSelf: 'stretch', minHeight: 24, background: t.bg.fill.brandSubtle.default, borderRadius: 4 }} />
                      <div style={{ width: 1, height: 20, background: t.border.default.default }} />
                      <div style={{ width: n, alignSelf: 'stretch', minHeight: 24, background: t.bg.fill.brandSubtle.default, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 13, color: t.text.secondary.default }}>{use}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              <span style={chipStyleB(t)}>--divider-spacing-sm: 8px</span>
              <span style={chipStyleB(t)}>--divider-spacing-md: 16px</span>
              <span style={chipStyleB(t)}>--divider-spacing-lg: 24px</span>
              <span style={chipStyleB(t)}>--divider-spacing-xl: 32px</span>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-dv" style={{ marginTop: 32, marginBottom: 40 }}>
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
                {[
                  'Separate logical groups in lists and menus',
                  'Divide sections in long forms',
                  'Separate header/footer from body in cards and modals',
                  'Separate groups in nav and sidebar',
                  'Create an “OR” between login alternatives',
                ].map((x) => (
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
                {[
                  'Separate every item in a list (use spacing)',
                  'Add decorative dividers with no structural role',
                  'Use dividers to compensate for missing spacing',
                  'Use in very dense layouts where the line adds more noise than clarity',
                ].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <Callout variant="tip" title="Spacing instead of dividers">
                Before adding a divider, try increasing the gap between elements. White space is often a lighter and more elegant
                separator than a line. Dividers are best reserved for logical group boundaries, not item separation.
              </Callout>
            </div>
          </section>

          <section id="patterns-dv" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Common patterns
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
                <div style={{ ...dottedZoneStyle(t, 140), minHeight: 140, flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Recent</div>
                  {['A', 'B', 'C'].map((x) => (
                    <div key={x} style={{ fontSize: 11, padding: '4px 0', color: t.text.secondary.default }}>
                      Item {x}
                    </div>
                  ))}
                  <div style={{ height: 1, background: t.border.default.default, margin: '6px 0' }} />
                  <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Archived</div>
                  {['D', 'E', 'F'].map((x) => (
                    <div key={x} style={{ fontSize: 11, padding: '4px 0', color: t.text.secondary.default }}>
                      Item {x}
                    </div>
                  ))}
                  <div style={{ height: 1, background: t.border.default.default, margin: '6px 0' }} />
                  <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Shared</div>
                  {['G', 'H'].map((x) => (
                    <div key={x} style={{ fontSize: 11, padding: '4px 0', color: t.text.secondary.default }}>
                      Item {x}
                    </div>
                  ))}
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>List groups</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Use between logical groups in lists, menus, and nav. No divider before the first group or after the last.
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
                <div style={{ ...dottedZoneStyle(t, 140), minHeight: 140, flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Personal info</div>
                  <div style={{ height: 28, borderRadius: 6, border: `1px solid ${t.border.default.default}`, marginBottom: 6 }} />
                  <div style={{ height: 28, borderRadius: 6, border: `1px solid ${t.border.default.default}` }} />
                  <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                    <div style={{ flex: 1, height: 1, background: t.border.default.default }} />
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Preferences</div>
                  <div style={{ height: 28, borderRadius: 6, border: `1px solid ${t.border.default.default}`, marginBottom: 6 }} />
                  <div style={{ height: 28, borderRadius: 6, border: `1px solid ${t.border.default.default}` }} />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Form sections</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Divide long forms into named sections. Use spacing=&quot;lg&quot; to give sections room to breathe.
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
                <div style={{ ...dottedZoneStyle(t, 140), minHeight: 140 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>
                    <span>128</span>
                    <div style={{ width: 1, height: 20, background: t.border.default.default, margin: '0 12px' }} />
                    <span>4.9★</span>
                    <div style={{ width: 1, height: 20, background: t.border.default.default, margin: '0 12px' }} />
                    <span>12k</span>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Stat row</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Vertical divider between inline stats, toolbar items, or breadcrumb segments.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="dos-donts-dv" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <IllustratedDoDont
                t={t}
                ok
                title="Between groups, not items"
                caption="Prefer one divider between two groups of list items — not a divider after every row."
              >
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#0A8853', fontWeight: 800, marginBottom: 6 }}>DO</div>
                    <div style={{ background: t.bg.surface.primary.default, borderRadius: 8, border: `1px solid ${t.border.default.default}`, padding: 8, width: 100, fontSize: 10 }}>
                      {['a', 'b', 'c'].map((x) => (
                        <div key={x} style={{ padding: '3px 0' }}>
                          {x}
                        </div>
                      ))}
                      <div style={{ height: 1, background: t.border.default.default, margin: '4px 0' }} />
                      {['d', 'e', 'f'].map((x) => (
                        <div key={x} style={{ padding: '3px 0' }}>
                          {x}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#E8186D', fontWeight: 800, marginBottom: 6 }}>DON&apos;T</div>
                    <div style={{ background: t.bg.surface.primary.default, borderRadius: 8, border: `1px solid ${t.border.default.default}`, padding: 8, width: 100, fontSize: 10 }}>
                      {['a', 'b', 'c', 'd', 'e', 'f'].map((x, i) => (
                        <div key={x}>
                          {i > 0 ? <div style={{ height: 1, background: t.border.default.default, margin: '2px 0' }} /> : null}
                          <div style={{ padding: '3px 0' }}>{x}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </IllustratedDoDont>

              <IllustratedDoDont
                t={t}
                ok
                title="Consistent spacing"
                caption="Use the same spacing value for every divider in a form unless the hierarchy calls for a change."
              >
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#0A8853', fontWeight: 800, marginBottom: 6 }}>DO</div>
                    <div style={{ background: t.bg.surface.primary.default, borderRadius: 8, border: `1px solid ${t.border.default.default}`, padding: 8, width: 110, fontSize: 9 }}>
                      <div style={{ marginBottom: 6 }}>Section A</div>
                      <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
                      <div style={{ marginBottom: 6 }}>Section B</div>
                      <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
                      <div>Section C</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#E8186D', fontWeight: 800, marginBottom: 6 }}>DON&apos;T</div>
                    <div style={{ background: t.bg.surface.primary.default, borderRadius: 8, border: `1px solid ${t.border.default.default}`, padding: 8, width: 110, fontSize: 9 }}>
                      <div style={{ marginBottom: 4 }}>Section A</div>
                      <div style={{ height: 1, background: t.border.default.default, margin: '4px 0' }} />
                      <div style={{ marginBottom: 4 }}>Section B</div>
                      <div style={{ height: 1, background: t.border.default.default, margin: '16px 0' }} />
                      <div>Section C</div>
                    </div>
                  </div>
                </div>
              </IllustratedDoDont>

              <IllustratedDoDont
                t={t}
                ok
                title="Don&apos;t use as decoration"
                caption="Dividers should mark real boundaries — not break up long copy for visual texture."
              >
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#0A8853', fontWeight: 800, marginBottom: 6 }}>DO</div>
                    <div style={{ background: t.bg.surface.primary.default, borderRadius: 8, border: `1px solid ${t.border.default.default}`, padding: 8, width: 120, fontSize: 9 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Billing</div>
                      <div style={{ color: t.text.secondary.default }}>Payment method</div>
                      <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Shipping</div>
                      <div style={{ color: t.text.secondary.default }}>Address</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#E8186D', fontWeight: 800, marginBottom: 6 }}>DON&apos;T</div>
                    <div style={{ background: t.bg.surface.primary.default, borderRadius: 8, border: `1px solid ${t.border.default.default}`, padding: 8, width: 120, fontSize: 8, lineHeight: 1.4 }}>
                      <div>Lorem ipsum dolor sit amet...</div>
                      <div style={{ height: 1, background: t.border.default.default, margin: '6px 0' }} />
                      <div>Consectetur adipiscing elit...</div>
                      <div style={{ height: 1, background: t.border.default.default, margin: '6px 0' }} />
                      <div>Sed do eiusmod tempor...</div>
                    </div>
                  </div>
                </div>
              </IllustratedDoDont>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="label-text-dv" style={{ marginTop: 32, marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Label text
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
                <li>Ultra-short: 1–2 words or a symbol (&apos;OR&apos;, &apos;AND&apos;, &apos;More&apos;, &apos;Section 2&apos;)</li>
                <li>Sentence case, no punctuation</li>
                <li>Never a full sentence — use a heading or callout instead</li>
                <li>All caps acceptable for &apos;OR&apos; / &apos;AND&apos; — functional symbols, not labels</li>
              </ul>
            </div>
          </section>

          <section id="when-label-dv" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use a label
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
                <li>Use when the boundary needs a name — form sections, content categories</li>
                <li>Use &apos;OR&apos; / &apos;AND&apos; between mutually exclusive or additive alternatives</li>
                <li>Omit when the separation is self-evident from the surrounding content</li>
              </ul>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="install-dv" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-dv" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock code={`import { Divider } from '@vds/react'`} filename="component.tsx" language="tsx" />
          </section>
          <section id="examples-dv" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock
                code={`// Basic horizontal divider
<Divider />`}
                filename="Basic"
                language="tsx"
              />
              <CodeBlock
                code={`// With custom spacing
<Divider spacing="lg" />`}
                filename="Spacing"
                language="tsx"
              />
              <CodeBlock
                code={`// Dashed
<Divider variant="dashed" />`}
                filename="Dashed"
                language="tsx"
              />
              <CodeBlock
                code={`// With label — centered (default)
<Divider label="OR" />`}
                filename="Label center"
                language="tsx"
              />
              <CodeBlock
                code={`// With label — left aligned
<Divider label="Advanced settings" labelAlign="left" />`}
                filename="Label left"
                language="tsx"
              />
              <CodeBlock
                code={`// Subtle strength
<Divider strength="subtle" />`}
                filename="Strength"
                language="tsx"
              />
              <CodeBlock
                code={`// Vertical — between inline elements
<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  <span>128 projects</span>
  <Divider orientation="vertical" spacing="sm" />
  <span>4.9 ★</span>
  <Divider orientation="vertical" spacing="sm" />
  <span>12k users</span>
</div>`}
                filename="Vertical"
                language="tsx"
              />
              <CodeBlock
                code={`// In a form — section separator
<form>
  <TextInput label="First name" />
  <TextInput label="Last name" />
  <Divider label="Preferences" labelAlign="left" spacing="lg" />
  <Select label="Language" options={langOptions} />
  <Select label="Timezone" options={tzOptions} />
</form>`}
                filename="Form"
                language="tsx"
              />
              <CodeBlock
                code={`// In a list — group separator
<ul>
  {groupA.map(item => <li key={item.id}>{item.name}</li>)}
  <Divider spacing="sm" />
  {groupB.map(item => <li key={item.id}>{item.name}</li>)}
</ul>`}
                filename="List"
                language="tsx"
              />
            </div>
          </section>
          <section id="props-dv" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Props
            </h3>
            <PropsTable props={propsRows} />
          </section>
          <section id="a11y-dv" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Accessibility
            </h3>
            <Callout variant="info" title="Accessibility">
              Divider renders as &lt;hr&gt; for horizontal and as a styled &lt;div role=&apos;separator&apos;
              aria-orientation=&apos;vertical&apos;&gt; for vertical. The hr element is natively announced by screen readers as a
              thematic break. When using a label, it is included as visible text — no aria-label needed.
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
                Initial release. Divider with solid/dashed/dotted variants, horizontal/vertical orientation, 4 spacing levels, 3
                strength levels, label support with left/center/right alignment.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
