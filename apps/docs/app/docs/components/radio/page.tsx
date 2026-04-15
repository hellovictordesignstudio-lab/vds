'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Circle,
  Info,
  X,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '../../../../components/docs/CodeBlock';
import { ComponentTabs } from '../../../../components/docs/ComponentTabs';
import { PropsTable } from '../../../../components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

const PLAN_OPTIONS = [
  { value: 'free', label: 'Free', desc: 'Up to 3 projects' },
  { value: 'pro', label: 'Pro', desc: '$12/month · Unlimited projects' },
  { value: 'team', label: 'Team', desc: '$49/month · Up to 10 members' },
  { value: 'enterprise', label: 'Enterprise', desc: 'Custom pricing · Unlimited everything' },
] as const;

const RB_SIZE = {
  sm: { outer: 14, dot: 6, label: 13, desc: 11 },
  md: { outer: 16, dot: 8, label: 14, desc: 12 },
  lg: { outer: 20, dot: 10, label: 16, desc: 13 },
} as const;

type RbSize = keyof typeof RB_SIZE;

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

function RadioCircle({
  t,
  size,
  selected,
  error,
  focus,
  disabled,
}: {
  t: VDSTheme;
  size: RbSize;
  selected: boolean;
  error?: boolean;
  focus?: boolean;
  disabled?: boolean;
}) {
  const s = RB_SIZE[size];
  const borderColor = error
    ? t.border.danger.default
    : selected
      ? t.border.brand.default
      : t.border.strong.default;
  return (
    <div
      style={{
        width: s.outer,
        height: s.outer,
        borderRadius: '50%',
        border: `2px solid ${borderColor}`,
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 2,
        boxShadow: focus ? `0 0 0 3px ${t.bg.fill.brandSubtle.default}` : 'none',
        transition: 'all 150ms',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {selected ? (
        <div
          style={{
            width: s.dot,
            height: s.dot,
            borderRadius: '50%',
            background: t.bg.fill.primary.default,
          }}
        />
      ) : null}
    </div>
  );
}

type PreviewState = 'default' | 'disabled' | 'error';

function LiveRadioPreview({
  t,
  size,
  state,
  orientation,
}: {
  t: VDSTheme;
  size: RbSize;
  state: PreviewState;
  orientation: 'vertical' | 'horizontal';
}) {
  const s = RB_SIZE[size];
  const [selected, setSelected] = useState<string>('pro');
  const [focused, setFocused] = useState<string | null>('pro');
  const disabled = state === 'disabled';
  const error = state === 'error';
  const isDisabled = disabled;

  const inner = (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: orientation === 'vertical' ? 'column' : 'row',
          flexWrap: orientation === 'horizontal' ? 'wrap' : undefined,
          gap: orientation === 'horizontal' ? 20 : 0,
          width: '100%',
          justifyContent: orientation === 'horizontal' ? 'center' : undefined,
        }}
      >
        {PLAN_OPTIONS.map((option) => (
          <div
            key={option.value}
            role="radio"
            aria-checked={selected === option.value}
            tabIndex={0}
            onClick={() => {
              if (isDisabled) return;
              setSelected(option.value);
              setFocused(option.value);
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!isDisabled) {
                  setSelected(option.value);
                  setFocused(option.value);
                }
              }
            }}
            onFocus={() => setFocused(option.value)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              marginBottom: orientation === 'vertical' ? 14 : 0,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.4 : 1,
            }}
          >
            <RadioCircle
              t={t}
              size={size}
              selected={selected === option.value}
              error={error}
              focus={focused === option.value}
              disabled={isDisabled}
            />
            <div>
              <div
                style={{
                  fontSize: s.label,
                  fontWeight: 600,
                  color: t.text.primary.default,
                  fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
                }}
              >
                {option.label}
              </div>
              {option.desc ? (
                <div style={{ fontSize: s.desc, color: t.text.secondary.default, marginTop: 2 }}>{option.desc}</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {error ? (
        <div
          style={{
            fontSize: 12,
            color: t.text.danger.default,
            marginTop: 12,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <AlertCircle size={12} color={t.text.danger.default} aria-hidden />
          Select a plan to continue
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

export default function RadioDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [previewSize, setPreviewSize] = useState<RbSize>('md');
  const [previewState, setPreviewState] = useState<PreviewState>('default');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
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
        { id: 'principles-rb', label: 'Principles' },
        { id: 'anatomy-rb', label: 'Anatomy' },
        { id: 'variants-rb', label: 'Variants' },
        { id: 'sizes-rb', label: 'Sizes' },
        { id: 'group-rb', label: 'Radio group' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-rb', label: 'When to use' },
        { id: 'defaults-rb', label: 'Default selection' },
        { id: 'dos-donts-rb', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'label-writing-rb', label: 'Label writing' },
        { id: 'group-label-rb', label: 'Group label writing' },
        { id: 'error-msgs-rb', label: 'Error messages' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-rb', label: 'Installation' },
        { id: 'import-rb', label: 'Import' },
        { id: 'examples-rb', label: 'Usage examples' },
        { id: 'props-group-rb', label: 'RadioGroup props' },
        { id: 'props-radio-rb', label: 'Radio props' },
        { id: 'a11y-rb', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const propsRowsGroup = [
    { name: 'value', type: 'string', default: '—', description: 'Controlled selected value' },
    { name: 'defaultValue', type: 'string', default: '—', description: 'Uncontrolled default value' },
    { name: 'onChange', type: '(value: string) => void', default: '—', description: 'Selection change handler' },
    { name: 'name', type: 'string', default: '—', description: 'Form field name (shared by all radios in group)' },
    { name: 'label', type: 'string', default: '—', description: 'Group label' },
    { name: 'description', type: 'string', default: '—', description: 'Group helper text' },
    { name: 'errorText', type: 'string', default: '—', description: 'Group-level error message' },
    { name: 'hasError', type: 'boolean', default: 'false', description: 'Show error state when true' },
    {
      name: 'orientation',
      type: "'vertical' | 'horizontal'",
      default: "'vertical'",
      description: 'Layout direction',
    },
    { name: 'isDisabled', type: 'boolean', default: 'false', description: 'Disables the entire group' },
    { name: 'isRequired', type: 'boolean', default: 'false', description: 'Sets aria-required on group' },
  ];

  const propsRowsRadio = [
    { name: 'value', type: 'string', default: '—', description: 'Option value (required)' },
    { name: 'label', type: 'string | ReactNode', default: '—', description: 'Option label (required)' },
    { name: 'description', type: 'string', default: '—', description: 'Secondary text below label' },
    { name: 'isDisabled', type: 'boolean', default: 'false', description: 'Disables this option only' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Circle size' },
  ];

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Radio
      </p>
      <h1 className="page-title">Radio</h1>
      <p className="page-lead">
        Radio buttons handle mutually exclusive choices. When the user selects one option, all others deselect
        automatically. Use Radio when the options are visible, finite, and only one can be true at a time.
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
                    label="Orientation"
                    options={['vertical', 'horizontal']}
                    value={orientation}
                    onChange={setOrientation}
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
              <LiveRadioPreview
                t={previewT}
                size={previewSize}
                state={previewState}
                orientation={orientation}
              />
            </LivePreviewShell>
          </section>

          <section id="principles-rb" style={{ marginBottom: 48 }}>
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
                  <Circle size={18} color={t.text.brand.default} style={{ opacity: 0.4, marginBottom: 12 }} aria-hidden />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                      <RadioCircle t={t} size="sm" selected={false} />
                      <span style={{ fontSize: 10, color: t.text.tertiary.default }}>A</span>
                    </div>
                    <ChevronRight size={14} color="#E8186D" aria-hidden />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                      <RadioCircle t={t} size="sm" selected />
                      <span style={{ fontSize: 10, color: t.text.tertiary.default }}>B</span>
                    </div>
                    <ChevronRight size={14} color="#E8186D" aria-hidden />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                      <RadioCircle t={t} size="sm" selected={false} />
                      <span style={{ fontSize: 10, color: t.text.tertiary.default }}>C</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 10, color: t.text.secondary.default, textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
                    Selecting B clears A; selecting C clears B.
                  </p>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    One and only one
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Selecting a radio button deselects all others in the group. This mutual exclusivity is enforced
                    automatically — it&apos;s the core contract of the component.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 24, display: 'flex', gap: 16 }}>
                  <CheckCircle size={18} color={t.text.brand.default} style={{ opacity: 0.4, flexShrink: 0 }} aria-hidden />
                  <div style={{ flex: 1, display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>
                        With default
                      </div>
                      <RadioCircle t={t} size="md" selected />
                      <div style={{ fontSize: 11, marginTop: 4, color: t.text.secondary.default }}>Monthly</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>
                        No default
                      </div>
                      <RadioCircle t={t} size="md" selected={false} />
                      <div style={{ fontSize: 11, marginTop: 4, color: t.text.tertiary.default }}>—</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Always pre-select
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Radio groups should always have a default selection. An empty radio group forces the user to make a
                    decision before they understand the options. Pick the most common or safest default.
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
                  <div style={{ display: 'flex', gap: 12, flex: 1, alignItems: 'stretch' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>
                        ≤5 options
                      </div>
                      {[0, 1, 2].map((i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <RadioCircle t={t} size="sm" selected={i === 0} />
                          <span style={{ fontSize: 10, color: t.text.secondary.default }}>Opt {i + 1}</span>
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        width: 1,
                        background: t.border.default.default,
                        alignSelf: 'stretch',
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: -28,
                          transform: 'translateY(-50%)',
                          fontSize: 9,
                          color: t.text.tertiary.default,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        &gt;5 options
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          height: 28,
                          borderRadius: 8,
                          border: `1.5px solid ${t.border.strong.default}`,
                          background: t.bg.surface.primary.default,
                          padding: '0 8px',
                          fontSize: 10,
                          color: t.text.tertiary.default,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        Choose…
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Visible options only
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Radio works best with 2–5 options that are always visible. If you have more than 5 options, use a
                    Select — hiding options in a dropdown reduces cognitive load for long lists.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-rb" style={{ marginBottom: 48 }}>
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
              }}
            >
              <div style={{ maxWidth: 440, margin: '0 auto', position: 'relative', paddingTop: 36 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AnnotationDot letter="G" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>Group label</span>
                </div>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ position: 'relative' }}>
                      <AnnotationDot letter="A" />
                      <div style={{ marginLeft: 28, marginTop: -20 }}>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            border: `2px solid ${t.border.strong.default}`,
                            flexShrink: 0,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AnnotationDot letter="C" />
                        <span style={{ fontSize: 14, fontWeight: 600, color: t.text.primary.default }}>Option label</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <AnnotationDot letter="D" />
                        <span style={{ fontSize: 12, color: t.text.secondary.default }}>Description text</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ position: 'relative', marginLeft: 28 }}>
                      <div style={{ position: 'absolute', left: -30, top: -6 }}>
                        <AnnotationDot letter="F" />
                      </div>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: `2px solid ${t.border.brand.default}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          boxShadow: `0 0 0 3px ${t.bg.fill.brandSubtle.default}`,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: t.bg.fill.primary.default,
                          }}
                        />
                      </div>
                      <div style={{ position: 'absolute', right: -28, top: -2 }}>
                        <AnnotationDot letter="B" />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: t.text.primary.default }}>Selected option</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 26 }}>
                    <AnnotationDot letter="E" />
                    <div style={{ fontSize: 12, color: t.text.danger.default, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertCircle size={12} color={t.text.danger.default} aria-hidden />
                      Error message
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 12, lineHeight: 1.6 }}>
              A Outer ring 16px · B Inner dot 8px · C Label 14px/600 · D Description 12px · E Error + icon · F Focus
              ring · G Group label 14px/700
            </p>
          </section>

          <section id="variants-rb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    title: 'Unselected',
                    token: 'color.border.strong.default',
                    desc: 'Default resting state. Option is available but not chosen.',
                    node: <RadioCircle t={t} size="md" selected={false} />,
                  },
                  {
                    title: 'Selected',
                    token: 'color.bg.fill.primary.default',
                    desc: 'Active selection. Brand border and filled inner dot communicate the choice.',
                    node: <RadioCircle t={t} size="md" selected />,
                  },
                  {
                    title: 'Focused (unselected)',
                    token: 'color.border.brand.focus',
                    desc: 'Keyboard navigation. Focus ring visible on both selected and unselected states.',
                    node: <RadioCircle t={t} size="md" selected={false} focus />,
                  },
                  {
                    title: 'Focused (selected)',
                    token: 'color.border.brand.focus',
                    desc: 'Keyboard focus on the currently selected item.',
                    node: <RadioCircle t={t} size="md" selected focus />,
                  },
                  {
                    title: 'Disabled',
                    token: 'color.text.primary.disabled',
                    desc: 'Option is locked. The group or this specific option is not interactive.',
                    node: <RadioCircle t={t} size="md" selected={false} disabled />,
                  },
                  {
                    title: 'Error',
                    token: 'color.border.danger.default',
                    desc: 'Required selection not made. All option borders turn red; error text appears below the group.',
                    node: (
                      <div>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                          <RadioCircle t={t} size="md" selected={false} error />
                          <RadioCircle t={t} size="md" selected={false} error />
                        </div>
                        <div style={{ fontSize: 12, color: t.text.danger.default, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <AlertCircle size={12} color="#E8186D" aria-hidden />
                          Select an option
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
                      height: 120,
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

          <section id="sizes-rb" style={{ marginBottom: 48 }}>
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
                const ann = sz === 'sm' ? '14px' : sz === 'md' ? '16px' : '20px';
                return (
                  <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', fontFamily: 'var(--font-mono), monospace', width: 36 }}>
                      {ann}
                    </span>
                    <RadioCircle t={t} size={sz} selected={sz === 'md'} />
                    <span style={{ fontSize: RB_SIZE[sz].label, color: t.text.primary.default }}>Label</span>
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
                    {['SIZE', 'OUTER RING', 'INNER DOT', 'FONT SIZE', 'USE CASE'].map((h) => (
                      <th key={h} style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['sm', '14px', '6px', '13px', 'Dense lists, compact forms'],
                    ['md', '16px', '8px', '14px', 'Default — settings, forms'],
                    ['lg', '20px', '10px', '16px', 'Mobile, prominent selections'],
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
                      <td style={{ padding: 12 }}>{row[3]}</td>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="group-rb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Radio group
            </h2>
            <p style={sectionLead}>
              Radio buttons always live inside a group. A standalone radio button is meaningless — the exclusivity only
              makes sense in the context of alternatives.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div
                style={{
                  background: t.bg.surface.secondary.default,
                  borderRadius: 14,
                  border: `1px solid ${t.border.default.default}`,
                  padding: 24,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 4 }}>Payment method</div>
                <div style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 16 }}>Choose how you want to pay</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { v: 'card', label: 'Credit card', sel: true },
                    { v: 'pp', label: 'PayPal', sel: false },
                    { v: 'bank', label: 'Bank transfer', sel: false },
                    { v: 'crypto', label: 'Crypto', sel: false },
                  ].map((row) => (
                    <div key={row.v} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <RadioCircle t={t} size="md" selected={row.sel} />
                      <span style={{ fontSize: 14, color: t.text.primary.default }}>{row.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  background: t.bg.surface.secondary.default,
                  borderRadius: 14,
                  border: `1px solid ${t.border.default.default}`,
                  padding: 24,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 16 }}>Size</div>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
                  {['XS', 'S', 'M', 'L', 'XL'].map((sz, i) => (
                    <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RadioCircle t={t} size="md" selected={i === 2} />
                      <span style={{ fontSize: 14, color: t.text.primary.default }}>{sz}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              style={{
                background: t.bg.surface.secondary.default,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 16 }}>
                Notification frequency
              </div>
              {(
                [
                  { t: 'Real-time', d: 'Get notified immediately when something happens', sel: true },
                  { t: 'Daily digest', d: 'One email per day with all updates', sel: false },
                  { t: 'Weekly summary', d: 'A weekly roundup every Monday morning', sel: false },
                ] as const
              ).map((row) => (
                <div key={row.t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                  <RadioCircle t={t} size="md" selected={row.sel} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.text.primary.default }}>{row.t}</div>
                    <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 2 }}>{row.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-rb" style={{ marginTop: 32, marginBottom: 40 }}>
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
                  'Mutually exclusive options (only one can be true)',
                  '2–5 options that should all be visible at once',
                  'Settings where the current selection is important to show',
                  'Questions with a single correct answer',
                ].map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <CheckCircle size={16} color="#0A8853" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
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
                  'More than 5 options → use Select',
                  'Multiple selections → use Checkbox',
                  'Immediate-effect binary toggle → use Switch',
                  'Actions (submit, navigate) → use Button',
                ].map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <X size={16} color="#E8186D" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                    <span style={{ fontSize: 13, color: t.text.secondary.default }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="info" title="Radio vs Select — the 5-option rule">
                If you have 5 or fewer options and screen space allows, use Radio — all options are visible and scannable.
                If you have 6 or more, use Select — the dropdown keeps the form compact. This rule is a starting point,
                not a hard boundary.
              </Callout>
            </div>
          </section>

          <section id="defaults-rb" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Default selection
            </h2>
            <p style={sectionLead}>
              Always set a default. An empty radio group is an antipattern — it forces a decision before the user has
              processed the options.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>
                    Subscription plan
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RadioCircle t={t} size="sm" selected />
                      <span style={{ fontSize: 12, color: t.text.primary.default }}>Monthly</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RadioCircle t={t} size="sm" selected={false} />
                      <span style={{ fontSize: 12, color: t.text.secondary.default }}>Annual</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Pre-select the most common
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    If one option is chosen by the majority of users, pre-select it. This reduces clicks for most users
                    and establishes a clear default.
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
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>
                    Data sharing
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RadioCircle t={t} size="sm" selected />
                      <span style={{ fontSize: 12, color: t.text.primary.default }}>Private</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RadioCircle t={t} size="sm" selected={false} />
                      <span style={{ fontSize: 12, color: t.text.secondary.default }}>Team</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Pre-select the safest
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    For privacy, security, or destructive action choices, default to the safest option. Don&apos;t
                    default to &apos;Delete all&apos; or &apos;Share publicly&apos;.
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
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>
                    Language
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RadioCircle t={t} size="sm" selected />
                    <span style={{ fontSize: 12, color: t.text.primary.default }}>English (detected)</span>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Pre-select contextually
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    When context is available (user&apos;s previous choice, system preference, location), use it. A smart
                    default reduces friction significantly.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="dos-donts-rb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <IllustratedDoDont
                t={t}
                ok
                title="Always have a default"
                caption="A default selection communicates the recommended or most common choice."
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <RadioCircle t={t} size="md" selected />
                  <RadioCircle t={t} size="md" selected={false} />
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Nothing selected"
                caption="Empty radio groups create decision paralysis. The user doesn't know where to start."
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <RadioCircle t={t} size="md" selected={false} />
                  <RadioCircle t={t} size="md" selected={false} />
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Keep options parallel"
                caption="Parallel options are easy to compare. Same grammatical structure, same level of detail."
              >
                <div style={{ fontSize: 12, color: t.text.primary.default, lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <RadioCircle t={t} size="sm" selected />
                    <span>Email</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <RadioCircle t={t} size="sm" selected={false} />
                    <span>SMS</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RadioCircle t={t} size="sm" selected={false} />
                    <span>Push</span>
                  </div>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Mixed abstraction"
                caption="Inconsistent label format makes comparison harder. Users have to read more carefully."
              >
                <div style={{ fontSize: 11, color: t.text.primary.default, lineHeight: 1.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <RadioCircle t={t} size="sm" selected />
                    <span>Email</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <RadioCircle t={t} size="sm" selected={false} />
                    <span>Send me a text please</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RadioCircle t={t} size="sm" selected={false} />
                    <span>Push</span>
                  </div>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Radio then confirm"
                caption="Radio selects a value. A button performs the action. They have different roles."
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                  <RadioCircle t={t} size="md" selected />
                  <div
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      background: t.bg.fill.primary.default,
                      color: t.text.inverse.default,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Continue
                  </div>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Radio as navigation"
                caption="Selecting a radio should never cause immediate navigation or destructive side effects. It's a selection, not a command."
              >
                <div style={{ fontSize: 11, color: t.text.secondary.default }}>Selecting → instant page change</div>
              </IllustratedDoDont>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="label-writing-rb" style={{ marginTop: 32, marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Label writing
            </h2>
            <div
              style={{
                background: t.bg.surface.secondary.default,
                borderRadius: 12,
                border: `1px solid ${t.border.default.default}`,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, fontSize: 13, lineHeight: 1.7 }}>
                <li>Noun or short phrase: &apos;Monthly&apos;, not &apos;Pay every month&apos;</li>
                <li>Sentence case, no punctuation</li>
                <li>Keep all options to similar length when possible</li>
                <li>For yes/no: use &apos;Yes&apos; and &apos;No&apos;, or the specific positive/negative</li>
              </ul>
            </div>
            <div
              style={{
                background: t.bg.surface.primary.default,
                borderRadius: 12,
                border: `1px solid ${t.border.default.default}`,
                padding: 16,
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <th style={{ textAlign: 'left', padding: 8, color: t.text.tertiary.default }}>Good</th>
                    <th style={{ textAlign: 'left', padding: 8, color: t.text.tertiary.default }}>Bad</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Monthly', 'Pay on a monthly basis'],
                    ['English', 'English language'],
                    ['Public', 'Make it public so everyone can see'],
                    ['Credit card', 'I want to pay with my credit card'],
                  ].map((row) => (
                    <tr key={row[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 8, color: '#0A8853' }}>✓ {row[0]}</td>
                      <td style={{ padding: 8, color: '#E8186D' }}>✗ {row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="group-label-rb" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Group label writing
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
                <li>States what the user is choosing, not how to choose it</li>
                <li>
                  Never: &quot;Select one of the following options&quot; — Instead: &quot;Billing cycle&quot; / &quot;Notification
                  frequency&quot; / &quot;Account type&quot;
                </li>
              </ul>
            </div>
          </section>

          <section id="error-msgs-rb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Error messages
            </h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.7 }}>
              <strong style={{ color: t.text.primary.default }}>Group-level:</strong> &quot;Select a billing cycle to continue&quot;
            </p>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.7, marginTop: 8 }}>
              <strong style={{ color: t.text.primary.default }}>Never:</strong> &quot;This field is required&quot; — name the thing they need to
              select.
            </p>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="install-rb" style={{ marginTop: 32, marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-rb" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock code={`import { Radio, RadioGroup } from '@vds/react'`} filename="component.tsx" language="tsx" />
          </section>
          <section id="examples-rb" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock
                code={`<RadioGroup
  label="Billing cycle"
  defaultValue="monthly"
  onChange={setBillingCycle}
>
  <Radio value="monthly" label="Monthly" description="$12/month" />
  <Radio value="annual" label="Annual" description="$99/year · Save 31%" />
</RadioGroup>`}
                filename="Basic group"
                language="tsx"
              />
              <CodeBlock
                code={`<RadioGroup
  label="Account type"
  value={accountType}
  onChange={setAccountType}
>
  <Radio value="personal" label="Personal" />
  <Radio value="business" label="Business" />
  <Radio value="nonprofit" label="Non-profit" isDisabled />
</RadioGroup>`}
                filename="Controlled"
                language="tsx"
              />
              <CodeBlock
                code={`<RadioGroup
  label="Size"
  defaultValue="m"
  orientation="horizontal"
>
  {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
    <Radio key={s} value={s.toLowerCase()} label={s} />
  ))}
</RadioGroup>`}
                filename="Horizontal"
                language="tsx"
              />
              <CodeBlock
                code={`<RadioGroup
  label="Subscription plan"
  isRequired
  errorText="Select a plan to continue"
  hasError={submitted && !plan}
  value={plan}
  onChange={setPlan}
>
  <Radio value="free" label="Free" />
  <Radio value="pro" label="Pro" />
  <Radio value="team" label="Team" />
</RadioGroup>`}
                filename="With error"
                language="tsx"
              />
            </div>
          </section>
          <section id="props-group-rb" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              RadioGroup props
            </h3>
            <PropsTable props={propsRowsGroup} />
          </section>
          <section id="props-radio-rb" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Radio props
            </h3>
            <PropsTable props={propsRowsRadio} />
          </section>
          <section id="a11y-rb" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Accessibility
            </h3>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="info" title="Built-in accessibility">
                RadioGroup renders a fieldset with legend for the group label. Each Radio is a native input[type=
                &apos;radio&apos;] — keyboard navigation (arrow keys between options), aria-required, aria-describedby for error
                text, and visible focus rings are all handled automatically.
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
                Initial release. All sizes, states, group support, horizontal/vertical orientation.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
