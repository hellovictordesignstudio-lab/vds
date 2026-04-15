'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertCircle,
  Check,
  CheckSquare,
  ChevronRight,
  Info,
  Minus,
  Square,
  X,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '../../../../components/docs/CodeBlock';
import { ComponentTabs } from '../../../../components/docs/ComponentTabs';
import { PropsTable } from '../../../../components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

const OPTIONS = ['Design review', 'Engineering review', 'QA sign-off'] as const;

const CB_SIZE = {
  sm: { box: 14, br: 3, icon: 9, label: 13 },
  md: { box: 16, br: 4, icon: 11, label: 14 },
  lg: { box: 20, br: 5, icon: 13, label: 16 },
} as const;

type CbSize = keyof typeof CB_SIZE;

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

type SegOpt<T extends string> = { value: T; label: string };

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: {
  options: readonly SegOpt<T>[];
  value: T;
  onChange: (v: T) => void;
  'aria-label'?: string;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            border: `1px solid ${value === opt.value ? 'var(--color-border-brand)' : 'var(--color-border)'}`,
            background: value === opt.value ? 'var(--color-brand-subtle)' : 'transparent',
            color: value === opt.value ? 'var(--color-brand-text)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CbBox({
  t,
  size,
  mode,
  borderColor,
  extra,
  disabled,
}: {
  t: VDSTheme;
  size: CbSize;
  mode: 'empty' | 'check' | 'minus';
  borderColor?: string;
  extra?: CSSProperties;
  disabled?: boolean;
}) {
  const s = CB_SIZE[size];
  const fill = mode !== 'empty';
  const bc = borderColor ?? (fill ? t.border.brand.default : t.border.strong.default);
  return (
    <div
      style={{
        width: s.box,
        height: s.box,
        borderRadius: s.br,
        border: `2px solid ${bc}`,
        background: fill ? t.bg.fill.primary.default : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 150ms',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...extra,
      }}
    >
      {mode === 'check' ? (
        <Check size={s.icon} color="white" strokeWidth={3} aria-hidden />
      ) : mode === 'minus' ? (
        <Minus size={s.icon} color="white" strokeWidth={3} aria-hidden />
      ) : null}
    </div>
  );
}

type PreviewState = 'default' | 'disabled' | 'error';

function LiveCheckboxPreview({
  t,
  size,
  state,
  indeterminate,
  appearance,
}: {
  t: VDSTheme;
  size: CbSize;
  state: PreviewState;
  indeterminate: 'on' | 'off';
  appearance: 'light' | 'dark';
}) {
  const s = CB_SIZE[size];
  const [checked, setChecked] = useState<string[]>(['Design review']);
  const [indDismissed, setIndDismissed] = useState(false);

  useEffect(() => {
    if (indeterminate === 'on') setIndDismissed(false);
  }, [indeterminate]);

  const showFirstInd = indeterminate === 'on' && !indDismissed;
  const disabled = state === 'disabled';
  const error = state === 'error';

  const toggle = (option: string) => {
    if (disabled) return;
    if (option === OPTIONS[0] && showFirstInd) {
      setIndDismissed(true);
      setChecked((prev) => (prev.includes(option) ? prev : [...prev, option]));
      return;
    }
    setChecked((prev) => (prev.includes(option) ? prev.filter((x) => x !== option) : [...prev, option]));
  };

  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: 320 }}>
      {OPTIONS.map((option, idx) => {
        const isFirst = idx === 0;
        const isInd = isFirst && showFirstInd;
        const isChecked = checked.includes(option) && !isInd;
        const mode: 'empty' | 'check' | 'minus' = isInd ? 'minus' : isChecked ? 'check' : 'empty';
        let borderColor = isChecked || isInd ? t.border.brand.default : t.border.strong.default;
        if (error) borderColor = t.border.danger.default;

        return (
          <div
            key={option}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            onClick={() => toggle(option)}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                toggle(option);
              }
            }}
            role="presentation"
          >
            <CbBox
              t={t}
              size={size}
              mode={mode}
              borderColor={borderColor}
              disabled={disabled}
            />
            <span
              style={{
                fontSize: s.label,
                color: t.text.primary.default,
                fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
                opacity: disabled ? 0.4 : 1,
              }}
            >
              {option}
            </span>
          </div>
        );
      })}
      {error ? (
        <span style={{ fontSize: 12, color: t.text.danger.default, marginTop: 4 }}>This field is required</span>
      ) : null}
    </div>
  );

  if (appearance === 'dark') {
    return (
      <div
        data-theme="dark"
        style={{
          width: '100%',
          minHeight: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 48,
          background: '#0F1117',
        }}
      >
        {inner}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        minHeight: 200,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 48,
        background: t.bg.surface.secondary.default,
      }}
    >
      {inner}
    </div>
  );
}

function SelectAllIllustration({ t }: { t: VDSTheme }) {
  const [c, setC] = useState([false, true, false, true]);
  const count = c.filter(Boolean).length;
  const parentMode: 'empty' | 'check' | 'minus' =
    count === 0 ? 'empty' : count === 4 ? 'check' : 'minus';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        onClick={() => {
          if (count === 4) setC([false, false, false, false]);
          else setC([true, true, true, true]);
        }}
        role="presentation"
      >
        <CbBox t={t} size="md" mode={parentMode} />
        <span style={{ fontSize: 12, fontWeight: 600, color: t.text.primary.default }}>Select all</span>
      </div>
      {['A', 'B', 'C', 'D'].map((label, i) => (
        <div
          key={label}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12, cursor: 'pointer' }}
          onClick={() => {
            const next = [...c];
            next[i] = !next[i];
            setC(next);
          }}
          role="presentation"
        >
          <CbBox t={t} size="md" mode={c[i] ? 'check' : 'empty'} />
          <span style={{ fontSize: 12, color: t.text.secondary.default }}>Item {label}</span>
        </div>
      ))}
    </div>
  );
}

function NotificationGroupDemo({ t }: { t: VDSTheme }) {
  type Key = 'product' | 'security' | 'marketing' | 'digest';
  const keys: Key[] = ['product', 'security', 'marketing', 'digest'];
  const [sel, setSel] = useState<Record<Key, boolean>>({
    product: true,
    security: true,
    marketing: false,
    digest: false,
  });

  const count = keys.filter((k) => sel[k]).length;
  const parentMode: 'empty' | 'check' | 'minus' =
    count === 0 ? 'empty' : count === 4 ? 'check' : 'minus';

  const labels: Record<Key, string> = {
    product: 'Product updates',
    security: 'Security alerts',
    marketing: 'Marketing emails',
    digest: 'Weekly digest',
  };

  const toggle = (k: Key) => setSel((s) => ({ ...s, [k]: !s[k] }));

  const toggleAll = () => {
    if (count === 4) setSel({ product: false, security: false, marketing: false, digest: false });
    else setSel({ product: true, security: true, marketing: true, digest: true });
  };

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 4 }}>
        Notification preferences
      </div>
      <div style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 16 }}>
        Select which updates to receive
      </div>
      {keys.map((k) => (
        <div
          key={k}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
            cursor: 'pointer',
          }}
          onClick={() => toggle(k)}
          role="presentation"
        >
          <CbBox t={t} size="md" mode={sel[k] ? 'check' : 'empty'} />
          <span style={{ fontSize: 14, color: t.text.primary.default, fontFamily: 'Nunito Sans, var(--font-sans), sans-serif' }}>
            {labels[k]}
          </span>
        </div>
      ))}
      <div style={{ borderTop: `1px solid ${t.border.default.default}`, margin: '16px 0', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={toggleAll} role="presentation">
          <CbBox t={t} size="md" mode={parentMode} />
          <span style={{ fontSize: 14, fontWeight: 600, color: t.text.primary.default }}>Select all</span>
        </div>
      </div>
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

export default function CheckboxDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [previewSize, setPreviewSize] = useState<CbSize>('md');
  const [previewState, setPreviewState] = useState<PreviewState>('default');
  const [indeterminate, setIndeterminate] = useState<'on' | 'off'>('off');
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
        { id: 'principles-cb', label: 'Principles' },
        { id: 'anatomy-cb', label: 'Anatomy' },
        { id: 'variants-cb', label: 'Variants' },
        { id: 'sizes-cb', label: 'Sizes' },
        { id: 'group-cb', label: 'Checkbox group' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-cb', label: 'When to use' },
        { id: 'selection-cb', label: 'Selection patterns' },
        { id: 'dos-donts-cb', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'label-writing-cb', label: 'Label writing' },
        { id: 'error-msgs-cb', label: 'Error messages' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-cb', label: 'Installation' },
        { id: 'import-cb', label: 'Import' },
        { id: 'examples-cb', label: 'Usage examples' },
        { id: 'props-cb', label: 'Props' },
        { id: 'a11y-cb', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const propsRows = [
    { name: 'checked', type: 'boolean', default: '—', description: 'Controlled checked state' },
    { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Uncontrolled initial state' },
    { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Partial selection state (programmatic only)' },
    { name: 'onChange', type: '(checked: boolean) => void', default: '—', description: 'Change handler' },
    { name: 'label', type: 'string | ReactNode', default: '—', description: 'Label text. Required for accessibility.' },
    { name: 'description', type: 'string', default: '—', description: 'Secondary descriptive text below label' },
    { name: 'errorText', type: 'string', default: '—', description: 'Error message (also triggers error state)' },
    { name: 'hasError', type: 'boolean', default: 'false', description: 'Error state without message' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Box size variant' },
    { name: 'isDisabled', type: 'boolean', default: 'false', description: 'Prevents interaction' },
    { name: 'isRequired', type: 'boolean', default: 'false', description: 'Sets aria-required, shows required indicator' },
    { name: 'name', type: 'string', default: '—', description: 'Form field name' },
    { name: 'value', type: 'string', default: '—', description: 'Form value when checked' },
    { name: 'id', type: 'string', default: '—', description: 'HTML id' },
    { name: 'className', type: 'string', default: '—', description: 'Additional CSS classes' },
  ];

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Checkbox
      </p>
      <h1 className="page-title">Checkbox</h1>
      <p className="page-lead">
        Checkboxes handle binary choices and multi-selection. They are the right component when users can select zero,
        one, or many items from a list — and when that selection needs to be visible at all times.
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
            <div
              style={{
                background: t.bg.surface.secondary.default,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                overflow: 'hidden',
              }}
            >
              <LiveCheckboxPreview
                t={previewT}
                size={previewSize}
                state={previewState}
                indeterminate={indeterminate}
                appearance={appearance}
              />
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  borderTop: `1px solid ${t.border.default.default}`,
                  padding: 20,
                  display: 'flex',
                  gap: 24,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>Size</div>
                  <SegmentedControl
                    aria-label="Size"
                    options={[
                      { value: 'sm', label: 'sm' },
                      { value: 'md', label: 'md' },
                      { value: 'lg', label: 'lg' },
                    ]}
                    value={previewSize}
                    onChange={setPreviewSize}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>State</div>
                  <SegmentedControl
                    aria-label="State"
                    options={[
                      { value: 'default', label: 'default' },
                      { value: 'disabled', label: 'disabled' },
                      { value: 'error', label: 'error' },
                    ]}
                    value={previewState}
                    onChange={setPreviewState}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>
                    Indeterminate
                  </div>
                  <SegmentedControl
                    aria-label="Indeterminate"
                    options={[
                      { value: 'off', label: 'off' },
                      { value: 'on', label: 'on' },
                    ]}
                    value={indeterminate}
                    onChange={setIndeterminate}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>
                    Appearance
                  </div>
                  <SegmentedControl
                    aria-label="Appearance"
                    options={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                    ]}
                    value={appearance}
                    onChange={setAppearance}
                  />
                </div>
              </div>
            </div>
          </section>

          <section id="principles-cb" style={{ marginBottom: 48 }}>
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
                  <CheckSquare size={18} color={t.text.brand.default} style={{ opacity: 0.4, marginBottom: 12 }} aria-hidden />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CbBox t={t} size="md" mode="empty" />
                      <span style={{ fontSize: 12, color: t.text.secondary.default }}>Unchecked</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CbBox t={t} size="md" mode="check" />
                      <span style={{ fontSize: 12, color: t.text.secondary.default }}>Checked</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CbBox t={t} size="md" mode="minus" />
                      <span style={{ fontSize: 12, color: t.text.secondary.default }}>Indeterminate</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Three visual states
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Checkbox has three distinct states: unchecked (empty), checked (filled with check), and indeterminate
                    (filled with dash). Each communicates a different level of selection.
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
                  <Square size={18} color={t.text.brand.default} style={{ opacity: 0.4, marginBottom: 12 }} aria-hidden />
                  <SelectAllIllustration t={t} />
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Indeterminate signals partial
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Use indeterminate when a parent checkbox represents a group where some — but not all — children are
                    selected. Never use it as a &apos;maybe&apos; state for a single item.
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
                  <Info size={18} color={t.text.brand.default} style={{ opacity: 0.4, flexShrink: 0 }} aria-hidden />
                  <div style={{ display: 'flex', gap: 16, flex: 1, alignItems: 'stretch' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>
                        Multi-select
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <CbBox t={t} size="sm" mode="check" />
                        <CbBox t={t} size="sm" mode="check" />
                      </div>
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
                          left: -20,
                          transform: 'translateY(-50%)',
                          fontSize: 9,
                          color: t.text.tertiary.default,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        vs
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>
                        Single-select
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[0, 1].map((i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div
                              style={{
                                width: 14,
                                height: 14,
                                borderRadius: 7,
                                border: `2px solid ${t.border.strong.default}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {i === 0 ? <div style={{ width: 6, height: 6, borderRadius: 3, background: t.border.brand.default }} /> : null}
                            </div>
                            <span style={{ fontSize: 11, color: t.text.secondary.default }}>Option {i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>
                    Multi-select, not exclusive
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Use checkboxes when multiple items can be selected simultaneously. When only one item can be selected,
                    use Radio. When it&apos;s a single yes/no, consider a Toggle instead.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-cb" style={{ marginBottom: 48 }}>
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
                position: 'relative',
              }}
            >
              <div style={{ maxWidth: 440, margin: '0 auto', position: 'relative', paddingLeft: 28 }}>
                <div style={{ position: 'absolute', left: 0, top: 0 }}>
                  <AnnotationDot letter="A" />
                </div>
                <div style={{ position: 'absolute', left: 22, top: 0 }}>
                  <AnnotationDot letter="G" />
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      border: `2px solid ${t.border.brand.default}`,
                      background: t.bg.fill.primary.default,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 0 3px ${t.bg.fill.brandSubtle.default}`,
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ position: 'absolute', right: -26, top: -22 }}>
                      <AnnotationDot letter="B" />
                    </div>
                    <Check size={11} color="white" strokeWidth={3} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AnnotationDot letter="C" />
                        <span style={{ fontSize: 14, fontWeight: 600, color: t.text.primary.default }}>Label text</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: '#E8186D', fontWeight: 600 }}>*</span>
                        <AnnotationDot letter="D" />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      Description or helper text
                      <AnnotationDot letter="E" />
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: t.text.danger.default,
                        marginTop: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <AlertCircle size={12} color={t.text.danger.default} aria-hidden />
                      Error message text
                      <AnnotationDot letter="F" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 12, lineHeight: 1.6 }}>
              A Checkbox box 16×16 · B Check icon 11px · C Label 14px/600 · D Required * · E Description 12px · F Error
              12px · G Focus ring 3px offset brand
            </p>
          </section>

          <section id="variants-cb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
              }}
            >
              {(
                [
                  {
                    title: 'Unchecked',
                    token: 'color.border.strong.default',
                    desc: 'Default resting state. No selection has been made.',
                    node: <CbBox t={t} size="md" mode="empty" />,
                  },
                  {
                    title: 'Checked',
                    token: 'color.bg.fill.primary.default',
                    desc: 'Item is selected. Brand fill communicates positive action.',
                    node: <CbBox t={t} size="md" mode="check" />,
                  },
                  {
                    title: 'Indeterminate',
                    token: 'color.bg.fill.primary.default',
                    desc: 'Partial selection in a group. Parent checkbox when some children are checked.',
                    node: <CbBox t={t} size="md" mode="minus" />,
                  },
                  {
                    title: 'Focused (unchecked)',
                    token: 'color.border.brand.focus',
                    desc: 'Keyboard navigation active state. Focus ring is always visible.',
                    node: (
                      <CbBox
                        t={t}
                        size="md"
                        mode="empty"
                        extra={{ boxShadow: `0 0 0 3px ${t.bg.fill.brandSubtle.default}` }}
                      />
                    ),
                  },
                  {
                    title: 'Focused (checked)',
                    token: 'color.border.brand.focus',
                    desc: 'Keyboard focus on a checked item. Both brand fill and focus ring visible simultaneously.',
                    node: (
                      <CbBox
                        t={t}
                        size="md"
                        mode="check"
                        extra={{ boxShadow: `0 0 0 3px ${t.bg.fill.brandSubtle.default}` }}
                      />
                    ),
                  },
                  {
                    title: 'Disabled (unchecked)',
                    token: 'color.text.primary.disabled',
                    desc: 'Not interactive. The option is locked by the system. Show a tooltip explaining why if possible.',
                    node: <CbBox t={t} size="md" mode="empty" disabled />,
                  },
                  {
                    title: 'Error',
                    token: 'color.border.danger.default',
                    desc: 'Required selection was not made. Border and error text both signal the problem.',
                    node: (
                      <div>
                        <CbBox t={t} size="md" mode="empty" borderColor={t.border.danger.default} />
                        <div
                          style={{
                            fontSize: 12,
                            color: t.text.danger.default,
                            marginTop: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <AlertCircle size={12} color={t.text.danger.default} aria-hidden />
                          Required
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

          <section id="sizes-cb" style={{ marginBottom: 48 }}>
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
                flexWrap: 'wrap',
                alignItems: 'flex-start',
              }}
            >
              {(['sm', 'md', 'lg'] as const).map((sz) => {
                const dim = CB_SIZE[sz];
                const ann = sz === 'sm' ? '14px' : sz === 'md' ? '16px' : '20px';
                return (
                  <div key={sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', fontFamily: 'var(--font-mono), monospace' }}>
                        {ann}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CbBox t={t} size={sz} mode="check" />
                        <span style={{ fontSize: dim.label, color: t.text.primary.default }}>Label</span>
                        {sz === 'md' ? <span style={chipStyleA({ fontSize: 10, padding: '2px 8px' })}>default</span> : null}
                      </div>
                    </div>
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
                    {['SIZE', 'BOX', 'BORDER RADIUS', 'ICON', 'FONT SIZE', 'USE CASE'].map((h) => (
                      <th key={h} style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['sm', '14px', '3px', '9px', '13px', 'Dense tables, compact lists'],
                    ['md', '16px', '4px', '11px', '14px', 'Default — forms, settings'],
                    ['lg', '20px', '5px', '13px', '16px', 'Mobile-first, touch targets, prominent lists'],
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
                      <td style={{ padding: 12 }}>{row[4]}</td>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>{row[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="group-cb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Checkbox group
            </h2>
            <p style={sectionLead}>
              Groups combine multiple checkboxes under a shared label. The group label provides context; individual
              labels describe each option.
            </p>
            <div
              style={{
                background: t.bg.surface.secondary.default,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                padding: 32,
                marginBottom: 24,
              }}
            >
              <NotificationGroupDemo t={t} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 12 }}>Orientation</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div
                style={{
                  background: t.bg.surface.secondary.default,
                  borderRadius: 14,
                  border: `1px solid ${t.border.default.default}`,
                  padding: 24,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 12 }}>Vertical (default)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CbBox t={t} size="md" mode="check" />
                    <span style={{ fontSize: 14, color: t.text.primary.default }}>Option A</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CbBox t={t} size="md" mode="empty" />
                    <span style={{ fontSize: 14, color: t.text.primary.default }}>Option B</span>
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
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 12 }}>Horizontal</div>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CbBox t={t} size="md" mode="check" />
                    <span style={{ fontSize: 14, color: t.text.primary.default }}>Option A</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CbBox t={t} size="md" mode="empty" />
                    <span style={{ fontSize: 14, color: t.text.primary.default }}>Option B</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-cb" style={{ marginTop: 32, marginBottom: 40 }}>
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
                  'Multi-select from a list (pick any number)',
                  'Binary preferences (enable/disable a feature)',
                  'Form agreement (terms of service, consent)',
                  'Bulk selection in tables',
                ].map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Check size={16} color="#0A8853" style={{ flexShrink: 0, marginTop: 2 }} strokeWidth={3} aria-hidden />
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
                  'Mutually exclusive options → use Radio',
                  'Immediate effect toggles → use Switch',
                  'Single binary decision with instant effect → use Switch',
                  'Navigation or actions → use Button',
                ].map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <X size={16} color="#E8186D" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                    <span style={{ fontSize: 13, color: t.text.secondary.default }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="info" title="Checkbox vs Toggle">
                The difference is timing. A checkbox selection takes effect on form submit. A toggle takes effect
                immediately. If the user has to click &apos;Save&apos; after, use checkbox. If it applies the moment they
                click, use toggle.
              </Callout>
            </div>
          </section>

          <section id="selection-cb" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Selection patterns
            </h2>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>
              Select all / deselect all
            </h3>
            <p style={sectionLead}>
              The &apos;Select all&apos; pattern uses the indeterminate state as the visual anchor for partial selection.
            </p>
            <div
              style={{
                backgroundColor: t.bg.surface.secondary.default,
                backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                backgroundSize: '12px 12px',
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                marginBottom: 24,
              }}
            >
              {(
                [
                  {
                    title: 'None selected',
                    lines: ['Select all: unchecked', 'All children: unchecked', 'Click → selects all'],
                  },
                  {
                    title: 'Some selected (indeterminate)',
                    lines: ['Select all: minus icon (indeterminate)', 'Some children checked, some not', 'Click → selects all (not deselects)'],
                  },
                  {
                    title: 'All selected',
                    lines: ['Select all: checked', 'All children: checked', 'Click → deselects all'],
                  },
                ] as const
              ).map((block) => (
                <div
                  key={block.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{block.title}</div>
                  {block.lines.map((line) => (
                    <div key={line} style={{ fontSize: 12, color: t.text.secondary.default, marginBottom: 4 }}>
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="tip" title="Indeterminate is programmatic only">
                Indeterminate state cannot be set by the user clicking — only by code. It&apos;s a visual representation of
                computed state, not a user choice.
              </Callout>
            </div>
          </section>

          <section id="dos-donts-cb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <IllustratedDoDont
                t={t}
                ok
                title="Always use a label"
                caption="Every checkbox needs a label. The label is what the user is agreeing to or selecting."
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CbBox t={t} size="md" mode="check" />
                  <span style={{ fontSize: 13, color: t.text.primary.default }}>I agree to the Terms of Service</span>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="No label"
                caption="A bare checkbox communicates nothing. Screen readers have nothing to announce. Users don't know what they're checking."
              >
                <CbBox t={t} size="md" mode="empty" />
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Positive framing"
                caption="Checking a box should mean 'yes, I want this'. Positive framing makes the intent unambiguous."
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CbBox t={t} size="md" mode="check" />
                  <span style={{ fontSize: 13, color: t.text.primary.default }}>Send me product updates</span>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Negative framing"
                caption="Negative framing creates cognitive load. Users have to invert the logic before they can decide. Avoid double negatives entirely."
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CbBox t={t} size="md" mode="check" />
                  <span style={{ fontSize: 13, color: t.text.primary.default }}>Don&apos;t send me product updates</span>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Group related items"
                caption="Shared group labels reduce cognitive load. The user understands the context before reading each option."
              >
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Notification preferences</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CbBox t={t} size="sm" mode="check" />
                    <span style={{ fontSize: 12, color: t.text.secondary.default }}>Email</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CbBox t={t} size="sm" mode="check" />
                    <span style={{ fontSize: 12, color: t.text.secondary.default }}>SMS</span>
                  </div>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Isolated options"
                caption="Isolated checkboxes without context force the user to evaluate each one independently."
              >
                <div style={{ display: 'flex', gap: 24 }}>
                  <CbBox t={t} size="md" mode="empty" />
                  <CbBox t={t} size="md" mode="empty" />
                </div>
              </IllustratedDoDont>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="label-writing-cb" style={{ marginTop: 32, marginBottom: 40 }}>
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
                <li>Sentence case, no punctuation: &apos;Send weekly digest&apos; not &apos;Send Weekly Digest.&apos;</li>
                <li>Start with the action or outcome: &apos;Notify me when...&apos; not &apos;When... notify me&apos;</li>
                <li>Keep it to one line — if you need two, the option may be too complex</li>
                <li>For agreements: state what they&apos;re agreeing to, link to the full document</li>
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
                    ['Send me product updates', 'Product Updates'],
                    ['I agree to the Terms of Service', 'Terms accepted'],
                    ['Enable two-factor authentication', '2FA'],
                    ['Receive notifications by email', 'Email notifications: yes'],
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

          <section id="error-msgs-cb" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Error messages
            </h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.7, marginBottom: 16 }}>
              <strong style={{ color: t.text.primary.default }}>Required:</strong> &quot;You must accept the Terms of Service to continue&quot;
              <br />
              <strong style={{ color: t.text.primary.default }}>Group required:</strong> &quot;Select at least one notification preference&quot;
              <br />
              <strong style={{ color: t.text.primary.default }}>Never:</strong> &quot;This field is required&quot; — be specific about what&apos;s needed.
            </p>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="install-cb" style={{ marginTop: 32, marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-cb" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock code={`import { Checkbox, CheckboxGroup } from '@vds/react'`} filename="component.tsx" language="tsx" />
          </section>
          <section id="examples-cb" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={`<Checkbox label="Send me product updates" />`} filename="Basic" language="tsx" />
              <CodeBlock
                code={`<Checkbox
  label="Enable notifications"
  checked={enabled}
  onChange={setEnabled}
/>`}
                filename="Controlled"
                language="tsx"
              />
              <CodeBlock
                code={`<Checkbox
  label="Select all"
  checked={allSelected}
  indeterminate={someSelected && !allSelected}
  onChange={handleSelectAll}
/>`}
                filename="Indeterminate"
                language="tsx"
              />
              <CodeBlock
                code={`<Checkbox
  label="I agree to the Terms of Service"
  description="By checking this box, you agree to our Terms of Service and Privacy Policy."
  isRequired
  hasError={!agreed && submitted}
  errorText="You must accept the Terms of Service to continue"
  checked={agreed}
  onChange={setAgreed}
/>`}
                filename="Description + error"
                language="tsx"
              />
              <CodeBlock
                code={`<Checkbox
  label="Two-factor authentication (managed by admin)"
  checked={true}
  isDisabled
/>`}
                filename="Disabled"
                language="tsx"
              />
              <CodeBlock
                code={`<CheckboxGroup
  label="Notification preferences"
  description="Select which updates to receive"
>
  <Checkbox label="Product updates" value="product" />
  <Checkbox label="Security alerts" value="security" />
  <Checkbox label="Marketing emails" value="marketing" />
</CheckboxGroup>`}
                filename="Group"
                language="tsx"
              />
            </div>
          </section>
          <section id="props-cb" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Props
            </h3>
            <PropsTable props={propsRows} />
          </section>
          <section id="a11y-cb" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Accessibility
            </h3>
            <Callout variant="info" title="Built-in accessibility">
              Checkbox automatically sets role=&apos;checkbox&apos;, aria-checked (including &apos;mixed&apos; for indeterminate),
              aria-required, aria-disabled, and aria-describedby for error and description text. The visible focus ring
              meets WCAG 2.1 AA.
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
                Initial release. All sizes, states, indeterminate, group support.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
