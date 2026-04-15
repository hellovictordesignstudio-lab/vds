'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { AlertCircle, Bell, ChevronRight, Info, Moon, Sun, ToggleRight, Wifi, X } from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '../../../../components/docs/CodeBlock';
import { ComponentTabs } from '../../../../components/docs/ComponentTabs';
import { PropsTable } from '../../../../components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

const SW_DIMS = {
  sm: { track: [28, 16] as const, thumb: 12, offset: 14 },
  md: { track: [36, 20] as const, thumb: 16, offset: 18 },
  lg: { track: [44, 24] as const, thumb: 20, offset: 22 },
} as const;

type SwSize = keyof typeof SW_DIMS;

const SETTINGS_DEF = [
  { id: 'darkMode' as const, label: 'Dark mode', desc: 'Use dark theme across the app', icon: Moon },
  { id: 'notifications' as const, label: 'Push notifications', desc: 'Receive alerts on your device', icon: Bell },
  { id: 'wifi' as const, label: 'Wi-Fi', desc: 'Connect to available networks', icon: Wifi },
  { id: 'analytics' as const, label: 'Usage analytics', desc: 'Help improve VDS with usage data', icon: null as null },
];

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

function SwitchControl({
  t,
  size,
  checked,
  onChange,
  disabled,
  focused,
  error,
  onFocus,
  onBlur,
}: {
  t: VDSTheme;
  size: SwSize;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  focused?: boolean;
  error?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const d = SW_DIMS[size];
  const [tw, th] = d.track;
  const borderColor = error
    ? t.border.danger.default
    : checked
      ? t.border.brand.default
      : t.border.strong.default;
  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => !disabled && onChange(!checked)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }
      }}
      style={{
        width: tw,
        height: th,
        borderRadius: 9999,
        background: checked ? t.bg.fill.primary.default : t.bg.surface.tertiary.default,
        border: `1.5px solid ${borderColor}`,
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 200ms, border-color 200ms',
        flexShrink: 0,
        boxShadow: focused ? `0 0 0 3px ${t.bg.fill.brandSubtle.default}` : 'none',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div
        style={{
          width: d.thumb,
          height: d.thumb,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: `translateY(-50%) translateX(${checked ? d.offset : 2}px)`,
          transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </div>
  );
}

type PreviewState = 'default' | 'disabled' | 'error';

function LiveSwitchPreview({
  t,
  size,
  state,
  labelPosition,
}: {
  t: VDSTheme;
  size: SwSize;
  state: PreviewState;
  labelPosition: 'left' | 'right';
}) {
  const [states, setStates] = useState({
    darkMode: false,
    notifications: true,
    wifi: true,
    analytics: false,
  });
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const isDisabled = state === 'disabled';
  const isError = state === 'error';

  const inner = (
    <div>
      {SETTINGS_DEF.map((s) => {
        const sw = (
          <SwitchControl
            t={t}
            size={size}
            checked={states[s.id]}
            onChange={(v) => setStates((p) => ({ ...p, [s.id]: v }))}
            disabled={isDisabled}
            focused={focusedId === s.id}
            error={isError}
            onFocus={() => setFocusedId(s.id)}
            onBlur={() => setFocusedId(null)}
          />
        );
        const leftBlock = (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            {s.icon ? <s.icon size={18} color={t.icon.secondary.default} aria-hidden /> : null}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text.primary.default }}>{s.label}</div>
              <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 2 }}>{s.desc}</div>
            </div>
          </div>
        );
        return (
          <div
            key={s.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'row',
              padding: '14px 0',
              borderBottom: `1px solid ${t.border.default.default}`,
              width: 360,
              gap: 16,
              opacity: isDisabled ? 0.4 : 1,
            }}
          >
            {labelPosition === 'right' ? (
              <>
                {sw}
                {leftBlock}
              </>
            ) : (
              <>
                {leftBlock}
                {sw}
              </>
            )}
          </div>
        );
      })}
      {isError ? (
        <div
          style={{
            fontSize: 12,
            color: t.text.danger.default,
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <AlertCircle size={12} color={t.text.danger.default} aria-hidden />
          Review your settings
        </div>
      ) : null}
    </div>
  );

  return inner;
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

export default function SwitchDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [previewSize, setPreviewSize] = useState<SwSize>('md');
  const [previewState, setPreviewState] = useState<PreviewState>('default');
  const [labelPosition, setLabelPosition] = useState<'left' | 'right'>('left');
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

  const sectionLead: CSSProperties = {
    fontSize: 17,
    color: t.text.secondary.default,
    lineHeight: 1.6,
    maxWidth: 640,
    marginBottom: 24,
  };

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-sw', label: 'Principles' },
        { id: 'anatomy-sw', label: 'Anatomy' },
        { id: 'variants-sw', label: 'Variants' },
        { id: 'sizes-sw', label: 'Sizes' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-sw', label: 'When to use' },
        { id: 'labeling-sw', label: 'Labeling' },
        { id: 'dos-donts-sw', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'content-labels-sw', label: 'Label writing' },
        { id: 'content-desc-sw', label: 'Description writing' },
        { id: 'content-confirm-sw', label: 'Confirmation patterns' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-sw', label: 'Installation' },
        { id: 'import-sw', label: 'Import' },
        { id: 'examples-sw', label: 'Usage examples' },
        { id: 'props-sw', label: 'Props' },
        { id: 'a11y-sw', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const propsRows = [
    { name: 'checked', type: 'boolean', default: '—', description: 'Controlled on/off state' },
    { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Uncontrolled initial state' },
    { name: 'onChange', type: '(checked: boolean) => void', default: '—', description: 'Change handler — fires immediately on toggle' },
    { name: 'label', type: 'string | ReactNode', default: '—', description: 'Setting label. Required for accessibility.' },
    { name: 'description', type: 'string', default: '—', description: 'Secondary text below label' },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Track size variant',
    },
    {
      name: 'labelPosition',
      type: "'right' | 'left'",
      default: "'right'",
      description: 'Label position relative to track',
    },
    { name: 'isDisabled', type: 'boolean', default: 'false', description: 'Prevents interaction' },
    { name: 'hasError', type: 'boolean', default: 'false', description: 'Error state (red ring)' },
    { name: 'errorText', type: 'string', default: '—', description: 'Error message below switch' },
    { name: 'id', type: 'string', default: '—', description: 'HTML id, linked to label' },
    { name: 'name', type: 'string', default: '—', description: 'Form field name (if used in form context)' },
    { name: 'className', type: 'string', default: '—', description: 'Additional CSS classes' },
  ];

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Switch
      </p>
      <h1 className="page-title">Switch</h1>
      <p className="page-lead">
        Switch controls a binary state with immediate effect. When the user flips it, something changes right now — no
        submit button required. Use it for settings, preferences, and feature toggles that apply instantly.
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
                    options={['sm', 'md', 'lg']}
                    value={previewSize}
                    onChange={setPreviewSize}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="State"
                    options={['default', 'disabled', 'error']}
                    value={previewState}
                    onChange={setPreviewState}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Label position"
                    options={['right', 'left']}
                    value={labelPosition}
                    onChange={setLabelPosition}
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
              <LiveSwitchPreview
                t={previewT}
                size={previewSize}
                state={previewState}
                labelPosition={labelPosition}
              />
            </LivePreviewShell>
          </section>

          <section id="principles-sw" style={{ marginBottom: 48 }}>
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 24 }}>
                  <ToggleRight size={18} color={t.text.brand.default} style={{ opacity: 0.4, marginBottom: 12 }} aria-hidden />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: t.text.secondary.default }}>
                      <span>t=0</span>
                      <span style={{ color: '#0A8853', fontWeight: 700 }}>flip</span>
                      <ChevronRight size={14} color="#0A8853" />
                      <span style={{ color: '#0A8853', fontWeight: 700 }}>instant</span>
                    </div>
                    <SwitchControl t={t} size="sm" checked={false} onChange={() => {}} focused />
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Immediate effect
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Flipping a switch changes something right now. No confirmation, no save button. If the action requires a
                    submit step, use a Checkbox instead — the visual implies immediacy.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 24, display: 'flex', gap: 12 }}>
                  <Sun size={16} color="#F07332" aria-hidden />
                  <Moon size={16} color={t.icon.secondary.default} aria-hidden />
                  <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                    <div
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        border: `1.5px solid ${t.border.strong.default}`,
                        background: t.bg.surface.primary.default,
                        padding: 12,
                        fontSize: 10,
                        color: t.text.secondary.default,
                      }}
                    >
                      Light UI
                      <div style={{ marginTop: 8 }}>
                        <SwitchControl t={t} size="sm" checked={false} onChange={() => {}} />
                      </div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        border: `1.5px solid ${t.border.brand.default}`,
                        background: t.bg.surface.primary.default,
                        padding: 12,
                        fontSize: 10,
                        color: t.text.secondary.default,
                      }}
                    >
                      Dark UI
                      <div style={{ marginTop: 8 }}>
                        <SwitchControl t={t} size="sm" checked onChange={() => {}} />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    One switch, one setting
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Each switch controls exactly one binary setting. Never use a switch to trigger multi-step flows, open
                    dialogs, or perform actions beyond flipping the state it labels.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 24, display: 'flex', gap: 12 }}>
                  <Info size={18} color={t.text.brand.default} style={{ opacity: 0.4, flexShrink: 0 }} aria-hidden />
                  <div style={{ display: 'flex', gap: 12, flex: 1, alignItems: 'center' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#0A8853', marginBottom: 6 }}>instant</div>
                      <SwitchControl t={t} size="sm" checked onChange={() => {}} />
                    </div>
                    <div
                      style={{
                        width: 1,
                        height: 48,
                        background: t.border.default.default,
                        position: 'relative',
                      }}
                    />
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>
                        on submit
                      </div>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          border: `2px solid ${t.border.brand.default}`,
                          background: t.bg.fill.primary.default,
                          margin: '0 auto',
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Switch vs Checkbox
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    The key distinction is timing. Switch = immediate effect. Checkbox = effect on form submit. When in
                    doubt: if removing a &apos;Save&apos; button would break the UX, use Checkbox.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-sw" style={{ marginBottom: 48 }}>
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
                minHeight: 240,
              }}
            >
              <div style={{ maxWidth: 440, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <AnnotationDot letter="G" />
                  <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 600 }}>focus ring</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <AnnotationDot letter="E" />
                      <span style={{ fontSize: 14, fontWeight: 600, color: t.text.primary.default }}>Label text</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AnnotationDot letter="F" />
                      <span style={{ fontSize: 12, color: t.text.secondary.default }}>Description text</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AnnotationDot letter="A" />
                      <AnnotationDot letter="C" />
                      <div
                        style={{
                          width: 36,
                          height: 20,
                          borderRadius: 9999,
                          background: t.bg.surface.tertiary.default,
                          border: `1.5px solid ${t.border.strong.default}`,
                          position: 'relative',
                          boxShadow: `0 0 0 3px ${t.bg.fill.brandSubtle.default}`,
                        }}
                      >
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                            position: 'absolute',
                            top: '50%',
                            left: 2,
                            transform: 'translateY(-50%)',
                          }}
                        />
                      </div>
                      <AnnotationDot letter="B" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: t.text.tertiary.default }}>
                      <AnnotationDot letter="D" />
                      <span>ON state: brand fill + border (see Variants)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 12, lineHeight: 1.6 }}>
              A Track · B Thumb · C OFF track (tertiary + strong border) · D ON track (brand fill + border) · E Label
              14px/600 · F Description 12px · G Focus ring 3px offset
            </p>
          </section>

          <section id="variants-sw" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    title: 'Off (default)',
                    token: 'color.bg.surface.tertiary.default',
                    desc: 'Default off state. Neutral background communicates inactive.',
                    node: <SwitchControl t={t} size="md" checked={false} onChange={() => {}} />,
                  },
                  {
                    title: 'On',
                    token: 'color.bg.fill.primary.default',
                    desc: 'Active state. Brand fill confirms the setting is enabled.',
                    node: <SwitchControl t={t} size="md" checked onChange={() => {}} />,
                  },
                  {
                    title: 'Focused (off)',
                    token: 'color.border.brand.focus',
                    desc: 'Keyboard navigation on inactive switch.',
                    node: <SwitchControl t={t} size="md" checked={false} onChange={() => {}} focused />,
                  },
                  {
                    title: 'Focused (on)',
                    token: 'color.border.brand.focus',
                    desc: 'Keyboard focus on active switch. Both brand fill and ring visible.',
                    node: <SwitchControl t={t} size="md" checked onChange={() => {}} focused />,
                  },
                  {
                    title: 'Disabled (off)',
                    token: 'color.text.primary.disabled',
                    desc: 'Setting is locked by the system. Show tooltip explaining why if possible.',
                    node: <SwitchControl t={t} size="md" checked={false} onChange={() => {}} disabled />,
                  },
                  {
                    title: 'Disabled (on)',
                    token: 'color.text.primary.disabled',
                    desc: 'Setting is active but cannot be changed. Communicate why via tooltip or helper text.',
                    node: <SwitchControl t={t} size="md" checked onChange={() => {}} disabled />,
                  },
                  {
                    title: 'With label (right)',
                    token: 'color.text.primary.default',
                    desc: 'Default label position. Label describes the setting; description adds context.',
                    node: (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, maxWidth: 280 }}>
                        <SwitchControl t={t} size="md" checked onChange={() => {}} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: t.text.primary.default }}>Dark mode</div>
                          <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 2 }}>
                            Use dark theme across all surfaces
                          </div>
                        </div>
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
                      minHeight: 120,
                      background: t.bg.surface.secondary.default,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 24,
                    }}
                  >
                    {v.node}
                  </div>
                  <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{v.title}</div>
                    <span style={chipStyleB(t, { marginBottom: 8 })}>{v.token}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="sizes-sw" style={{ marginBottom: 48 }}>
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
                gap: 20,
              }}
            >
              {(['sm', 'md', 'lg'] as const).map((sz) => {
                const d = SW_DIMS[sz];
                const ann = `${d.track[0]} × ${d.track[1]}px`;
                return (
                  <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', fontFamily: 'var(--font-mono), monospace', minWidth: 88 }}>
                      {ann}
                    </span>
                    <SwitchControl t={t} size={sz} checked={sz === 'md'} onChange={() => {}} />
                    {sz === 'md' ? <span style={chipStyleA({ fontSize: 10, padding: '2px 8px' })}>default</span> : null}
                  </div>
                );
              })}
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
                    {['SIZE', 'TRACK', 'THUMB', 'USE CASE'].map((h) => (
                      <th key={h} style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['sm', '28×16px', '12px', 'Dense settings lists, compact panels'],
                    ['md', '36×20px', '16px', 'Default — settings pages, forms'],
                    ['lg', '44×24px', '20px', 'Mobile-first, prominent toggles, touch targets'],
                  ].map((row, i) => (
                    <tr key={row[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>
                        {row[0]}
                        {i === 1 ? (
                          <span style={{ marginLeft: 8 }}>
                            <span style={chipStyleA({ fontSize: 10, padding: '2px 8px' })}>default</span>
                          </span>
                        ) : null}
                      </td>
                      <td style={{ padding: 12 }}>{row[1]}</td>
                      <td style={{ padding: 12 }}>{row[2]}</td>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>{row[3]}</td>
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
          <section id="when-to-use-sw" style={{ marginTop: 32, marginBottom: 40 }}>
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
                  'Settings that apply immediately (dark mode, notifications, Wi-Fi)',
                  'Feature flags and toggles in admin/settings panels',
                  'Binary preferences without a save step',
                  'Mobile-style on/off controls',
                ].map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <ToggleRight size={16} color="#0A8853" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
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
                  'Form fields that need a submit → use Checkbox',
                  'Multiple related selections → use Checkbox group',
                  'Mutually exclusive options → use Radio',
                  'Actions or commands → use Button',
                ].map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <X size={16} color="#E8186D" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                    <span style={{ fontSize: 13, color: t.text.secondary.default }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="warning" title="Never use Switch in a form">
                If your Switch lives inside a form with a submit button, it&apos;s the wrong component. The user expects
                flipping a switch to work immediately — then clicking submit and having it apply again is confusing. Use
                Checkbox for form contexts.
              </Callout>
            </div>
          </section>

          <section id="labeling-sw" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Labeling
            </h2>
            <p style={sectionLead}>
              The label describes the setting, not the state. The switch itself communicates on/off — the label should
              never say &apos;Enable X&apos; or &apos;Disable X&apos;.
            </p>
            <div
              style={{
                background: t.bg.surface.primary.default,
                borderRadius: 12,
                border: `1px solid ${t.border.default.default}`,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <th style={{ padding: 12, textAlign: 'left', color: '#0A8853' }}>✓ Good</th>
                    <th style={{ padding: 12, textAlign: 'left', color: '#E8186D' }}>✗ Bad</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Dark mode', 'Enable dark mode'],
                    ['Push notifications', 'Turn on notifications'],
                    ['Two-factor authentication', '2FA enabled'],
                    ['Marketing emails', 'Receive marketing emails: On'],
                  ].map((row) => (
                    <tr key={row[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 12 }}>{row[0]}</td>
                      <td style={{ padding: 12 }}>{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Callout variant="tip" title="The label should make sense in both states">
                &apos;Dark mode&apos; makes sense whether the switch is on or off. &apos;Enable dark mode&apos; only makes sense when
                it&apos;s off. Write labels that work for both states simultaneously.
              </Callout>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text.primary.default, marginBottom: 12 }}>Label position</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div
                style={{
                  background: t.bg.surface.secondary.default,
                  borderRadius: 14,
                  border: `1px solid ${t.border.default.default}`,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 10 }}>
                  Right label (default)
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <SwitchControl t={t} size="md" checked={false} onChange={() => {}} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.text.primary.default }}>Dark mode</div>
                    <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 2 }}>Use dark theme across all surfaces</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 12, marginBottom: 0, lineHeight: 1.5 }}>
                  Default. Label to the right, aligned to the top of the switch. Description below the label if needed.
                </p>
              </div>
              <div
                style={{
                  background: t.bg.surface.secondary.default,
                  borderRadius: 14,
                  border: `1px solid ${t.border.default.default}`,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 10 }}>Left label</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.text.primary.default }}>Dark mode</div>
                    <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 2 }}>Use dark theme across all surfaces</div>
                  </div>
                  <SwitchControl t={t} size="md" checked onChange={() => {}} />
                </div>
                <p style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 12, marginBottom: 0, lineHeight: 1.5 }}>
                  Use when switches appear in a list with right-aligned controls — common in settings panels and property
                  panels.
                </p>
              </div>
            </div>
          </section>

          <section id="dos-donts-sw" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <IllustratedDoDont
                t={t}
                ok
                title="Immediate effect"
                caption="The switch communicates immediate effect. The user flips it and it works."
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: t.text.secondary.default }}>Email notifications</span>
                  <SwitchControl t={t} size="sm" checked onChange={() => {}} />
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Switch + Save"
                caption="A switch inside a form breaks the mental model. The user flipped it — why do they need to save?"
              >
                <div style={{ fontSize: 11, color: t.text.tertiary.default }}>Switch + &quot;Save changes&quot;</div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="One setting per switch"
                caption="Each switch is self-contained. Toggling one has no effect on the others."
              >
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <SwitchControl t={t} size="sm" checked onChange={() => {}} />
                  <SwitchControl t={t} size="sm" checked={false} onChange={() => {}} />
                  <SwitchControl t={t} size="sm" checked onChange={() => {}} />
                  <SwitchControl t={t} size="sm" checked={false} onChange={() => {}} />
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Hidden side effects"
                caption="Hidden side effects destroy trust. If a toggle changes multiple settings, show which ones — or use a more explicit control."
              >
                <div style={{ fontSize: 11, color: t.text.secondary.default }}>One toggle → 5 hidden prefs</div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Label = setting"
                caption="The label names the thing being controlled. The switch shows its state."
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Dark mode</span>
                  <SwitchControl t={t} size="sm" checked onChange={() => {}} />
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Label narrates state"
                caption="The label shouldn't narrate the switch state — that's what the visual control is for."
              >
                <div style={{ fontSize: 11, color: t.text.secondary.default }}>Enable dark mode / Dark mode: ON</div>
              </IllustratedDoDont>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="content-labels-sw" style={{ marginTop: 32, marginBottom: 32 }}>
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
                <li>Noun or noun phrase: &apos;Dark mode&apos;, not &apos;Enable dark mode&apos;</li>
                <li>Sentence case, no punctuation</li>
                <li>Should make sense in both on and off states</li>
                <li>Avoid &apos;Enable&apos;, &apos;Turn on&apos;, &apos;Activate&apos; — the switch already says that</li>
              </ul>
            </div>
          </section>

          <section id="content-desc-sw" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Description writing
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
                <li>Optional — only add when the consequence of the setting is not obvious</li>
                <li>One line max. If you need two lines, the setting may be too complex for a switch</li>
                <li>Describes what happens when on: &apos;Receive alerts on your device&apos;</li>
                <li>Not: &apos;Toggle this to enable or disable push notifications&apos;</li>
              </ul>
            </div>
          </section>

          <section id="content-confirm-sw" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Confirmation patterns
            </h2>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="warning" title="Never ask for confirmation on a switch">
                &apos;Are you sure you want to enable dark mode?&apos; — no. Switches are for low-stakes, reversible settings. If
                the action is high-stakes or irreversible, it&apos;s not a switch. If you feel the need to confirm, use a
                different pattern entirely.
              </Callout>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="install-sw" style={{ marginTop: 32, marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-sw" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock code={`import { Switch } from '@vds/react'`} filename="component.tsx" language="tsx" />
          </section>
          <section id="examples-sw" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={`<Switch label="Dark mode" defaultChecked={false} />`} filename="Basic" language="tsx" />
              <CodeBlock
                code={`<Switch
  label="Push notifications"
  description="Receive alerts on your device"
  checked={notificationsEnabled}
  onChange={setNotificationsEnabled}
/>`}
                filename="Controlled"
                language="tsx"
              />
              <CodeBlock
                code={`<Switch
  label="Two-factor authentication"
  description="Managed by your organization"
  checked={true}
  isDisabled
/>`}
                filename="Disabled"
                language="tsx"
              />
              <CodeBlock
                code={`<Switch
  label="Wi-Fi"
  labelPosition="left"
  checked={wifiEnabled}
  onChange={setWifiEnabled}
/>`}
                filename="Left label"
                language="tsx"
              />
              <CodeBlock
                code={`<div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
  {settings.map((setting) => (
    <div
      key={setting.id}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid var(--color-border-default-default)',
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{setting.label}</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary-default)' }}>
          {setting.description}
        </div>
      </div>
      <Switch
        checked={states[setting.id]}
        onChange={(v) => updateSetting(setting.id, v)}
        aria-label={setting.label}
      />
    </div>
  ))}
</div>`}
                filename="Settings list"
                language="tsx"
              />
            </div>
          </section>
          <section id="props-sw" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Props
            </h3>
            <PropsTable props={propsRows} />
          </section>
          <section id="a11y-sw" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Accessibility
            </h3>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="info" title="Built-in accessibility">
                Switch renders with role=&apos;switch&apos; and aria-checked. Label is linked via htmlFor/id. Keyboard: Space
                toggles, Tab navigates. Focus ring meets WCAG 2.1 AA (3px, 3px offset). aria-disabled used instead of HTML
                disabled to keep the element focusable for screen readers.
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
                Initial release. All sizes, states, label positions, immediate-effect pattern.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
