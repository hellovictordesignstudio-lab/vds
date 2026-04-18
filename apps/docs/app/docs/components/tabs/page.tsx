'use client';

import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  BarChart2,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Code,
  CreditCard,
  Eye,
  FileText,
  Inbox,
  LayoutGrid,
  List,
  Settings,
  Shield,
  User,
  X,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '../../../../components/docs/CodeBlock';
import { ComponentTabs } from '../../../../components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '../../../../components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS_MAIN = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type TabVariant = 'line' | 'pill' | 'boxed';
type TabSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<TabSize, { fontSize: number; padding: string; height: number }> = {
  sm: { fontSize: 12, padding: '6px 12px', height: 32 },
  md: { fontSize: 13, padding: '8px 16px', height: 40 },
  lg: { fontSize: 14, padding: '10px 20px', height: 44 },
};

const PANEL_COPY: Record<string, string> = {
  overview: 'Summary metrics and key actions for this workspace.',
  settings: 'Configure notifications, permissions, and integrations.',
  activity: 'A chronological feed of recent changes and events.',
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

function tabTriggerInner(
  t: VDSTheme,
  label: string,
  active: boolean,
  sz: (typeof SIZE_MAP)['md'],
  showIcons: boolean,
  icon: ReactNode,
) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {showIcons ? <span style={{ display: 'flex', color: active ? t.text.brand.default : t.icon.secondary.default }}>{icon}</span> : null}
      <span>{label}</span>
    </span>
  );
}

/** Interactive tabs for the live preview canvas. */
function DocTabsInteractive({
  t,
  variant,
  size,
  fullWidth,
  showIcons,
  activeId,
  onChange,
}: {
  t: VDSTheme;
  variant: TabVariant;
  size: TabSize;
  fullWidth: boolean;
  showIcons: boolean;
  activeId: string;
  onChange: (id: string) => void;
}) {
  const uid = useId();
  const sz = SIZE_MAP[size];
  const tabDefs = [
    { id: 'overview', label: 'Overview', icon: <LayoutGrid size={16} strokeWidth={2} aria-hidden /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} strokeWidth={2} aria-hidden /> },
    { id: 'activity', label: 'Activity', icon: <BarChart2 size={16} strokeWidth={2} aria-hidden /> },
  ];

  const renderTriggers = (opts: { inPillTrack: boolean }) => {
    const rowStyle: CSSProperties =
      variant === 'pill' && opts.inPillTrack
        ? {
            display: 'flex',
            gap: fullWidth ? 4 : 6,
            background: t.bg.surface.tertiary.default,
            borderRadius: 10,
            padding: 4,
            width: fullWidth ? '100%' : 'auto',
          }
        : {
            display: 'flex',
            gap: fullWidth ? 0 : 8,
            width: fullWidth ? '100%' : 'auto',
            position: 'relative' as const,
            alignItems: 'stretch',
          };

    return (
      <div role="tablist" style={rowStyle}>
        {tabDefs.map((tab) => {
          const active = activeId === tab.id;
          const id = `${uid}-tab-${tab.id}`;
          const panelId = `${uid}-panel-${tab.id}`;

          const baseBtn: CSSProperties = {
            flex: fullWidth ? 1 : undefined,
            fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
            fontSize: sz.fontSize,
            fontWeight: active ? 600 : 500,
            padding: sz.padding,
            minHeight: sz.height,
            boxSizing: 'border-box',
            cursor: 'pointer',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            position: 'relative',
            borderRadius: variant === 'pill' ? 8 : variant === 'boxed' ? undefined : 0,
          };

          let extra: CSSProperties = {};
          if (variant === 'line') {
            extra = {
              background: 'transparent',
              color: active ? t.text.brand.default : t.text.secondary.default,
              boxShadow: active ? `inset 0 -2px 0 0 ${t.border.brand.default}` : 'none',
            };
          } else if (variant === 'pill') {
            extra = {
              background: active ? t.bg.surface.primary.default : 'transparent',
              color: active ? t.text.primary.default : t.text.secondary.default,
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
            };
          } else {
            extra = {
              background: active ? t.bg.surface.primary.default : 'transparent',
              color: active ? t.text.primary.default : t.text.secondary.default,
              borderBottom: active ? `2px solid ${t.border.brand.default}` : `2px solid transparent`,
              borderLeft: `1px solid ${active ? t.border.default.default : 'transparent'}`,
              borderRight: `1px solid ${active ? t.border.default.default : 'transparent'}`,
              borderTop: `1px solid ${active ? t.border.default.default : 'transparent'}`,
              marginBottom: active ? -1 : 0,
              zIndex: active ? 2 : 1,
            };
          }

          return (
            <button
              key={tab.id}
              type="button"
              id={id}
              role="tab"
              aria-selected={active}
              aria-controls={panelId}
              onClick={() => onChange(tab.id)}
              style={{ ...baseBtn, ...extra }}
            >
              {tabTriggerInner(t, tab.label, active, sz, showIcons, tab.icon)}
            </button>
          );
        })}
      </div>
    );
  };

  const panel = (
    <div
      id={`${uid}-panel-${activeId}`}
      role="tabpanel"
      aria-labelledby={`${uid}-tab-${activeId}`}
      style={{
        paddingTop: variant === 'boxed' ? 0 : 20,
        width: '100%',
      }}
    >
      <div
        style={{
          borderRadius: variant === 'boxed' ? '0 0 8px 8px' : 12,
          border:
            variant === 'boxed'
              ? `1px solid ${t.border.default.default}`
              : `1px solid ${t.border.default.default}`,
          borderTop: variant === 'boxed' ? `1px solid ${t.border.default.default}` : undefined,
          background: t.bg.surface.primary.default,
          padding: 16,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
          {tabDefs.find((x) => x.id === activeId)?.label}
        </div>
        <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>{PANEL_COPY[activeId] ?? ''}</p>
      </div>
    </div>
  );

  if (variant === 'boxed') {
    return (
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div
          style={{
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 8,
            overflow: 'hidden',
            background: t.bg.surface.secondary.default,
          }}
        >
          {renderTriggers({ inPillTrack: false })}
          {panel}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <div style={{ position: 'relative' }}>
        {variant === 'pill' ? (
          renderTriggers({ inPillTrack: true })
        ) : (
          <div style={{ borderBottom: variant === 'line' ? `1px solid ${t.border.default.default}` : undefined }}>
            {renderTriggers({ inPillTrack: false })}
          </div>
        )}
      </div>
      {panel}
    </div>
  );
}

/** Small static strip for diagrams — `mode` maps to design specs. */
function MiniTabsStrip({
  t,
  variant,
  activeIndex,
  tabCount = 3,
  size = 'sm',
}: {
  t: VDSTheme;
  variant: TabVariant;
  activeIndex: number;
  tabCount?: number;
  size?: TabSize;
}) {
  const sz = SIZE_MAP[size];
  const labels = ['Overview', 'Settings', 'Activity', 'Members', 'Billing', 'Archive', 'Exports', 'More'];
  const slice = labels.slice(0, tabCount);

  if (variant === 'pill') {
    return (
      <div
        style={{
          display: 'flex',
          gap: 4,
          background: t.bg.surface.tertiary.default,
          borderRadius: 10,
          padding: 4,
          width: 'fit-content',
          maxWidth: '100%',
        }}
      >
        {slice.map((lab, i) => {
          const active = i === activeIndex;
          return (
            <div
              key={lab}
              style={{
                fontSize: sz.fontSize,
                fontWeight: active ? 600 : 500,
                padding: sz.padding,
                borderRadius: 8,
                background: active ? t.bg.surface.primary.default : 'transparent',
                color: active ? t.text.primary.default : t.text.secondary.default,
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {lab}
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'boxed') {
    return (
      <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 8, overflow: 'hidden', width: 'fit-content', maxWidth: '100%' }}>
        <div style={{ display: 'flex', background: t.bg.surface.secondary.default }}>
          {slice.map((lab, i) => {
            const active = i === activeIndex;
            return (
              <div
                key={lab}
                style={{
                  fontSize: sz.fontSize,
                  fontWeight: active ? 600 : 500,
                  padding: sz.padding,
                  background: active ? t.bg.surface.primary.default : 'transparent',
                  borderBottom: active ? `2px solid ${t.border.brand.default}` : `2px solid ${t.border.default.default}`,
                  borderLeft: i > 0 ? `1px solid ${t.border.default.default}` : undefined,
                  color: active ? t.text.primary.default : t.text.secondary.default,
                }}
              >
                {lab}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // line
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 6, borderBottom: `1px solid ${t.border.default.default}`, paddingBottom: 0 }}>
        {slice.map((lab, i) => {
          const active = i === activeIndex;
          return (
            <div
              key={lab}
              style={{
                fontSize: sz.fontSize,
                fontWeight: active ? 600 : 500,
                padding: sz.padding,
                color: active ? t.text.brand.default : t.text.secondary.default,
                boxShadow: active ? `inset 0 -2px 0 0 ${t.border.brand.default}` : 'none',
              }}
            >
              {lab}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniBadgeCount(t: VDSTheme, n: number) {
  const show = n > 99 ? '99+' : String(n);
  return (
    <span
      style={{
        marginLeft: 6,
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 8,
        background: t.bg.surface.tertiary.default,
        color: t.text.secondary.default,
        border: `1px solid ${t.border.default.default}`,
      }}
    >
      {show}
    </span>
  );
}

export default function TabsDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [demoTab, setDemoTab] = useState('overview');
  const [variant, setVariant] = useState<TabVariant>('line');
  const [size, setSize] = useState<TabSize>('md');
  const [showIcons, setShowIcons] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);
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
        { id: 'principles-tb', label: 'Principles' },
        { id: 'anatomy-tb', label: 'Anatomy' },
        { id: 'variants-tb', label: 'Variants' },
        { id: 'sizes-tb', label: 'Sizes' },
        { id: 'with-icons', label: 'With icons & badges' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-tb', label: 'When to use' },
        { id: 'variant-guide', label: 'Choosing a variant' },
        { id: 'dos-donts-tb', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'label-writing-tb', label: 'Label writing' },
        { id: 'badge-counts-tb', label: 'Badge counts' },
        { id: 'icon-usage-tb', label: 'Icon usage' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'props-tabs-tb', label: 'Tabs props' },
        { id: 'props-tab-item-tb', label: 'Tab props' },
        { id: 'examples-tb', label: 'Examples' },
        { id: 'keyboard-tb', label: 'Keyboard navigation' },
      ];
    }
    return [];
  }, [activeTab]);

  const tabsPropsRows = [
    { name: 'defaultTab', type: 'string', default: 'first tab', description: 'Initially active tab id' },
    { name: 'activeTab', type: 'string', default: '—', description: 'Controlled active tab' },
    { name: 'onChange', type: '(id: string) => void', default: '—', description: 'Called on tab change' },
    { name: 'variant', type: "'line' | 'pill' | 'boxed'", default: "'line'", description: 'Visual style' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Trigger size' },
    { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Tabs fill available width' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const tabItemPropsRows = [
    { name: 'id', type: 'string', default: '—', description: 'Unique identifier (required)', required: true as const },
    { name: 'label', type: 'string', default: '—', description: 'Trigger label text' },
    { name: 'icon', type: 'ReactNode', default: '—', description: 'Leading icon' },
    { name: 'badge', type: 'number', default: '—', description: 'Trailing count badge' },
    { name: 'isDisabled', type: 'boolean', default: 'false', description: 'Avoid — see Usage' },
    { name: 'children', type: 'ReactNode', default: '—', description: 'Panel content' },
  ];

  const codeDefault = `// Default — line variant
<Tabs defaultTab="overview">
  <Tab id="overview" label="Overview">
    <p>Overview content</p>
  </Tab>
  <Tab id="members" label="Members">
    <p>Members content</p>
  </Tab>
  <Tab id="settings" label="Settings">
    <p>Settings content</p>
  </Tab>
</Tabs>`;

  const codePill = `// Pill variant — inside a card
<Tabs variant="pill" defaultTab="list">
  <Tab id="list"  label="List">…</Tab>
  <Tab id="grid"  label="Grid">…</Tab>
  <Tab id="chart" label="Chart">…</Tab>
</Tabs>`;

  const codeIcons = `// With icons and badge
<Tabs defaultTab="inbox">
  <Tab id="overview" label="Overview" icon={<LayoutGrid size={15} />}>…</Tab>
  <Tab id="inbox"    label="Inbox"    icon={<Inbox size={15} />} badge={3}>…</Tab>
  <Tab id="settings" label="Settings" icon={<Settings size={15} />}>…</Tab>
</Tabs>`;

  const codeControlled = `// Controlled
const [active, setActive] = useState('overview')
<Tabs activeTab={active} onChange={setActive} variant="boxed">
  <Tab id="overview" label="Overview">…</Tab>
  <Tab id="activity" label="Activity">…</Tab>
</Tabs>`;

  const codeFullWidth = `// Full width — pill
<Tabs variant="pill" fullWidth defaultTab="a">
  <Tab id="a" label="Month">…</Tab>
  <Tab id="b" label="Quarter">…</Tab>
  <Tab id="c" label="Year">…</Tab>
</Tabs>`;

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Tabs
      </p>
      <h1 className="page-title">Tabs</h1>
      <p className="page-lead">
        Tabs organize content into parallel sections at the same level of hierarchy. They let users switch context without leaving
        the page. Use them when content sections are mutually exclusive and users need to move between them frequently.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <span style={chipStyleA()}>Stable</span>
        <span style={chipStyleA()}>v1.0</span>
        <span style={chipStyleA()}>Accessible</span>
      </div>

      <ComponentTabs tabs={[...TABS_MAIN]} activeTab={activeTab} onChange={setActiveTab} />

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
                  <LivePreviewSegmentRow t={t} label="Variant" options={['line', 'pill', 'boxed']} value={variant} onChange={(v) => setVariant(v as TabVariant)} />
                  <LivePreviewSegmentRow t={t} label="Size" options={['sm', 'md', 'lg']} value={size} onChange={(v) => setSize(v as TabSize)} />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Icons"
                    options={['off', 'on']}
                    value={showIcons ? 'on' : 'off'}
                    onChange={(v) => setShowIcons(v === 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Full width"
                    options={['off', 'on']}
                    value={fullWidth ? 'on' : 'off'}
                    onChange={(v) => setFullWidth(v === 'on')}
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
              <DocTabsInteractive
                t={previewT}
                variant={variant}
                size={size}
                fullWidth={fullWidth}
                showIcons={showIcons}
                activeId={demoTab}
                onChange={setDemoTab}
              />
            </LivePreviewShell>
          </section>

          <section id="principles-tb" style={{ marginBottom: 48 }}>
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
                    <div>
                      <MiniTabsStrip t={t} variant="line" activeIndex={0} tabCount={3} size="sm" />
                      <div
                        style={{
                          marginTop: 8,
                          border: `1px solid ${t.border.default.default}`,
                          borderRadius: 8,
                          padding: 8,
                          fontSize: 10,
                          color: t.text.secondary.default,
                          background: t.bg.surface.primary.default,
                        }}
                      >
                        Single shared panel
                      </div>
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginTop: 6, textAlign: 'center' }}>Tabs</div>
                    </div>
                    <div>
                      {['One', 'Two', 'Three'].map((x, i) => (
                        <div
                          key={x}
                          style={{
                            border: `1px solid ${t.border.default.default}`,
                            borderRadius: 6,
                            padding: 6,
                            marginBottom: 6,
                            fontSize: 10,
                            background: t.bg.surface.primary.default,
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>{x}</div>
                          <div style={{ color: t.text.tertiary.default, lineHeight: 1.35 }}>{i === 0 ? 'Expanded panel body…' : 'Collapsed'}</div>
                        </div>
                      ))}
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginTop: 2, textAlign: 'center' }}>Accordion</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <LayoutGrid size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Parallel, not sequential</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Tabs are for content at the same level — sections a user switches between freely. If the sections have a natural
                    order or depend on each other, use a stepper. If content can coexist simultaneously, use an accordion instead.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 16, minHeight: 140 }}>
                  <MiniTabsStrip t={t} variant="line" activeIndex={0} tabCount={3} size="sm" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'center' }}>
                    <ChevronLeft size={14} color={t.text.tertiary.default} aria-hidden />
                    <span style={{ fontSize: 10, color: t.text.tertiary.default }}>one visible</span>
                    <ChevronRight size={14} color={t.text.tertiary.default} aria-hidden />
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      border: `1px dashed ${t.border.brand.default}`,
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 10,
                      color: t.text.secondary.default,
                      background: t.bg.surface.primary.default,
                    }}
                  >
                    Active panel only — others hidden from view.
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Eye size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>One panel at a time</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Only one tab panel is visible at a time. The active tab is always visually distinct from inactive tabs. The
                    indicator — underline, pill, or border — must be unambiguous even in dark mode and at small sizes.
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
                  <div style={{ marginBottom: 12 }}>
                    <MiniTabsStrip t={t} variant="line" activeIndex={0} tabCount={6} size="sm" />
                  </div>
                  <div style={{ position: 'relative', overflowX: 'auto', paddingBottom: 4 }}>
                    <div style={{ minWidth: 360 }}>
                      <MiniTabsStrip t={t} variant="line" activeIndex={0} tabCount={8} size="sm" />
                    </div>
                    <div style={{ fontSize: 9, color: '#E8186D', fontWeight: 700, marginTop: 6 }}>overflow: scroll</div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <List size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Keep the list short</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Aim for 2–7 tabs. More than that overwhelms the user and creates navigation debt. If you need more sections,
                    reconsider the information architecture — a sidebar nav or a secondary menu may serve better.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-tb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                position: 'relative',
                height: 300,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                backgroundColor: t.bg.surface.secondary.default,
                backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                overflow: 'hidden',
                padding: 16,
              }}
            >
              <div style={{ maxWidth: 420, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <AnnotationDot letter="A" />
                  <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Tab list</span>
                </div>
                <div style={{ borderBottom: `1px solid ${t.border.default.default}`, position: 'relative' }}>
                  <div role="presentation" style={{ display: 'flex', gap: 12, padding: '4px 0 0' }}>
                    <div style={{ position: 'relative', padding: '8px 4px', fontSize: 13, fontWeight: 600, color: t.text.brand.default }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AnnotationDot letter="E" />
                        Overview
                      </span>
                      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: t.border.brand.default }} />
                    </div>
                    <div style={{ padding: '8px 4px', fontSize: 13, fontWeight: 500, color: t.text.secondary.default }}>Settings</div>
                    <div style={{ padding: '8px 4px', fontSize: 13, fontWeight: 500, color: t.text.secondary.default }}>Activity</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'absolute', right: 8, bottom: 26 }}>
                    <AnnotationDot letter="B" />
                    <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Active indicator</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <AnnotationDot letter="C" />
                  <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Track divider</span>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 20,
                    borderTop: `1px solid ${t.border.default.default}`,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <AnnotationDot letter="D" />
                    <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Tab panel</span>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, margin: 0 }}>Panel content</p>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, marginTop: 16, marginBottom: 0 }}>
              <strong style={{ color: t.text.primary.default }}>A</strong> → Tab list (role=&quot;tablist&quot;, flex row, gap between triggers){' '}
              <strong style={{ color: t.text.primary.default }}>B</strong> → Active indicator (2px underline brand color, position absolute bottom-0){' '}
              <strong style={{ color: t.text.primary.default }}>C</strong> → Track divider (1px solid border.default, full width, position relative){' '}
              <strong style={{ color: t.text.primary.default }}>D</strong> → Tab panel (role=&quot;tabpanel&quot;, padding top 20px, contenido del tab activo){' '}
              <strong style={{ color: t.text.primary.default }}>E</strong> → Tab trigger (role=&quot;tab&quot;, aria-selected, padding según size, fontWeight 600 activo / 500 inactivo).
            </p>
          </section>

          <section id="variants-tb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
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
                    height: 140,
                    background: t.bg.surface.secondary.default,
                    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                  }}
                >
                  <div style={{ width: '100%', maxWidth: 260 }}>
                    <MiniTabsStrip t={t} variant="line" activeIndex={0} />
                  </div>
                </div>
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Line (default)</div>
                  <span style={chipStyleB(t, { marginBottom: 8, display: 'inline-block' })}>variant: line</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>
                    The default. Clean underline indicator. Use in main page navigation, doc pages, and anywhere the tab sits on a
                    flat surface.
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
                    height: 140,
                    background: t.bg.surface.secondary.default,
                    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                  }}
                >
                  <MiniTabsStrip t={t} variant="pill" activeIndex={0} />
                </div>
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Pill</div>
                  <span style={chipStyleB(t, { marginBottom: 8, display: 'inline-block' })}>variant: pill</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>
                    Segmented control feel. Use inside cards, panels, or toolbars where the tabs are a secondary control rather than
                    primary navigation.
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
                    height: 140,
                    background: t.bg.surface.secondary.default,
                    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                  }}
                >
                  <MiniTabsStrip t={t} variant="boxed" activeIndex={0} />
                </div>
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Boxed</div>
                  <span style={chipStyleB(t, { marginBottom: 8, display: 'inline-block' })}>variant: boxed</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>
                    Classic folder tab. The active tab visually connects to its panel. Use for structured content like settings
                    pages or data tables with multiple views.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="sizes-tb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(
                [
                  ['sm', '32px', 'Dense toolbars, compact panels'],
                  ['md', '40px', 'Default — most contexts'],
                  ['lg', '44px', 'Page-level navigation, prominent placement'],
                ] as const
              ).map(([key, h, use]) => (
                <div
                  key={key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 200px',
                    gap: 16,
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: `1px solid ${t.border.default.default}`,
                    background: t.bg.surface.primary.default,
                  }}
                >
                  <MiniTabsStrip t={t} variant="line" activeIndex={1} size={key} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>
                      {key}{' '}
                      <span style={{ color: t.text.tertiary.default, fontWeight: 500 }}>· {h}</span>
                    </div>
                    <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 4 }}>{use}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="with-icons" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              With icons &amp; badges
            </h2>
            <p style={{ fontSize: 17, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              Tab triggers can include a leading icon and/or a trailing badge count. Icons reinforce meaning; badges communicate
              unread or pending items.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div
                style={{
                  borderRadius: 12,
                  border: `1px solid ${t.border.default.default}`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: 120,
                    background: t.bg.surface.secondary.default,
                    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                  }}
                >
                  <div style={{ borderBottom: `1px solid ${t.border.default.default}`, width: '100%', maxWidth: 320 }}>
                    <div style={{ display: 'flex', gap: 12, padding: '4px 0' }}>
                      {[
                        { lab: 'Inbox', el: <Inbox size={16} strokeWidth={2} aria-hidden /> },
                        { lab: 'Settings', el: <Settings size={16} strokeWidth={2} aria-hidden /> },
                        { lab: 'Profile', el: <User size={16} strokeWidth={2} aria-hidden /> },
                      ].map((row, i) => (
                        <div
                          key={row.lab}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 13,
                            fontWeight: i === 0 ? 600 : 500,
                            color: i === 0 ? t.text.brand.default : t.text.secondary.default,
                            boxShadow: i === 0 ? `inset 0 -2px 0 0 ${t.border.brand.default}` : 'none',
                            padding: '6px 4px',
                          }}
                        >
                          {row.el}
                          {row.lab}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: 12, borderTop: `1px solid ${t.border.default.default}`, fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>
                  With icons
                </div>
              </div>

              <div
                style={{
                  borderRadius: 12,
                  border: `1px solid ${t.border.default.default}`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: 120,
                    background: t.bg.surface.secondary.default,
                    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                  }}
                >
                  <div style={{ borderBottom: `1px solid ${t.border.default.default}`, width: '100%', maxWidth: 320 }}>
                    <div style={{ display: 'flex', gap: 16, padding: '4px 0' }}>
                      {[
                        { lab: 'Overview', n: 0 },
                        { lab: 'Inbox', n: 3 },
                        { lab: 'Activity', n: 12 },
                      ].map((row, i) => (
                        <div
                          key={row.lab}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: 13,
                            fontWeight: i === 1 ? 600 : 500,
                            color: i === 1 ? t.text.brand.default : t.text.secondary.default,
                            boxShadow: i === 1 ? `inset 0 -2px 0 0 ${t.border.brand.default}` : 'none',
                            padding: '6px 4px',
                          }}
                        >
                          {row.lab}
                          {row.n > 0 ? MiniBadgeCount(t, row.n) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: 12, borderTop: `1px solid ${t.border.default.default}`, fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>
                  With badge count
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <Callout variant="tip" title="Icon-only tabs">
                Icon-only tabs are acceptable at sm size in dense toolbars. Always add aria-label to each trigger so screen readers
                announce the section name.
              </Callout>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-tb" style={{ marginTop: 32, marginBottom: 40 }}>
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
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#0A8853',
                    marginBottom: 12,
                    letterSpacing: '0.06em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Check size={14} aria-hidden /> DO
                </div>
                {[
                  'Alternate between views of the same dataset (list / grid / chart)',
                  'Configuration sections (General / Security / Billing)',
                  'Entity detail with multiple aspects (Overview / Activity / Members)',
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
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#E8186D',
                    marginBottom: 12,
                    letterSpacing: '0.06em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <X size={14} aria-hidden /> DON&apos;T
                </div>
                {[
                  'Content that must be compared side by side (use a split view)',
                  'Steps in an ordered process (use a stepper)',
                  'Primary site navigation (use nav / sidebar)',
                ].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="warning" title="Tabs vs. navigation">
                Tabs are not a substitute for site navigation. If clicking a tab changes the URL to a completely different page,
                use a nav link. Tabs are for switching views within the same page context.
              </Callout>
            </div>
          </section>

          <section id="variant-guide" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Choosing a variant
            </h2>
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
                    {['VARIANT', 'SURFACE', 'TYPICAL USE'].map((h) => (
                      <th key={h} style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['line', 'Flat page', 'Doc sections, profile pages, main content areas'],
                    ['pill', 'Card / panel', 'Secondary controls, compact selectors inside a card'],
                    ['boxed', 'Settings / forms', 'Structured data, admin panels, settings sections'],
                  ].map((r) => (
                    <tr key={r[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>{r[0]}</td>
                      <td style={{ padding: 12 }}>{r[1]}</td>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="dos-donts-tb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title='DO — labels are nouns'
                  caption='Short labels: “Overview”, “Members”, “Settings” — quick to scan.'
                >
                  <MiniTabsStrip t={t} variant="line" activeIndex={0} tabCount={3} size="sm" />
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title='DON&apos;T — verb phrases'
                  caption='“See the overview”, “Manage members”, “Configure settings” are long and feel like buttons, not sections.'
                >
                  <div style={{ fontSize: 10, color: t.text.secondary.default, textAlign: 'center', lineHeight: 1.4 }}>
                    See the overview · Manage members · Configure settings
                  </div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title='DO — show the tab, empty state inside'
                  caption='Keep “Billing” visible; if empty, explain why inside the panel — navigation stays predictable.'
                >
                  <MiniTabsStrip t={t} variant="line" activeIndex={2} tabCount={3} size="sm" />
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title='DON&apos;T — disable tabs'
                  caption='A disabled “Billing” tab hides navigation — users can’t discover what’s missing.'
                >
                  <div style={{ fontSize: 11, color: t.text.tertiary.default, textDecoration: 'line-through' }}>
                    Billing (disabled)
                  </div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title='DO — consistent density'
                  caption='Each panel delivers a similar amount of content so switching tabs feels balanced.'
                >
                  <div style={{ fontSize: 10, color: t.text.secondary.default, textAlign: 'center' }}>Three panels · similar weight</div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title='DON&apos;T — one tiny, one huge'
                  caption='Avoid one panel with two lines and another with a 50-row table — it confounds expectations.'
                >
                  <div style={{ fontSize: 10, color: t.text.secondary.default, textAlign: 'center' }}>2 lines vs. 50 rows</div>
                </IllustratedDoDont>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="label-writing-tb" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
              Label writing
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>1–2 words max. Noun or noun phrase.</li>
              <li>No verbs: &apos;Settings&apos; not &apos;Manage settings&apos;</li>
              <li>No articles: &apos;Overview&apos; not &apos;The overview&apos;</li>
              <li>Capitalize first word only (sentence case)</li>
            </ul>
          </section>
          <section id="badge-counts-tb" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
              Badge counts
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Show count only when it adds actionable context (unread messages, pending items)</li>
              <li>Cap display at 99+. Never show 0.</li>
              <li>Remove the badge when the user visits that tab</li>
            </ul>
          </section>
          <section id="icon-usage-tb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
              Icon usage
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Use icons that are universally understood or already used elsewhere in the product</li>
              <li>Pair icon with label — icon-only is only acceptable at sm in dense toolbars</li>
            </ul>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 16,
                marginTop: 16,
                fontSize: 13,
                color: t.text.tertiary.default,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Shield size={14} strokeWidth={2} aria-hidden /> Security
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CreditCard size={14} strokeWidth={2} aria-hidden /> Billing
              </span>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="props-tabs-tb" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Tabs props
            </h3>
            <PropsTable props={tabsPropsRows} />
          </section>
          <section id="props-tab-item-tb" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Tab props (child)
            </h3>
            <PropsTable props={tabItemPropsRows} />
          </section>
          <section id="examples-tb" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={codeDefault} filename="Default — line variant" language="tsx" />
              <CodeBlock code={codePill} filename="Pill variant — inside a card" language="tsx" />
              <CodeBlock code={codeIcons} filename="With icons and badge" language="tsx" />
              <CodeBlock code={codeControlled} filename="Controlled" language="tsx" />
              <CodeBlock code={codeFullWidth} filename="Full width — pill" language="tsx" />
            </div>
          </section>
          <section id="keyboard-tb" style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Keyboard navigation">
              Tabs implement the ARIA Tabs pattern. Arrow Left/Right moves between triggers. Enter/Space activates. Home/End jump to
              first/last. Tab key moves focus into the active panel. Each trigger has role=&apos;tab&apos;, aria-selected, and
              aria-controls pointing to its panel.
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
                Initial release. Tabs with line / pill / boxed variants, 3 sizes, icons, badge counts, controlled + uncontrolled
                modes, full ARIA keyboard pattern.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
