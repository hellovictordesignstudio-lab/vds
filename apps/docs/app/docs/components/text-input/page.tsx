'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertCircle,
  AtSign,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  Search,
  User,
  X,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '../../../../components/docs/CodeBlock';
import { ComponentTabs } from '../../../../components/docs/ComponentTabs';
import { PropsTable } from '../../../../components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

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

const SIZE_MAP = {
  sm: { h: 32, px: '0 10px', fs: 13 },
  md: { h: 40, px: '0 12px', fs: 14 },
  lg: { h: 48, px: '0 14px', fs: 15 },
} as const;

type PreviewSize = keyof typeof SIZE_MAP;
type PreviewState = 'default' | 'focused' | 'error' | 'success' | 'disabled';
type IconOpt = 'none' | 'icon';

function LiveTextInputPreview({
  t,
  size,
  state,
  leftIcon,
  rightIcon,
  appearance,
}: {
  t: VDSTheme;
  size: PreviewSize;
  state: PreviewState;
  leftIcon: IconOpt;
  rightIcon: IconOpt;
  appearance: 'light' | 'dark';
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const s = SIZE_MAP[size];

  useEffect(() => {
    if (state === 'focused') {
      inputRef.current?.focus();
    }
  }, [state]);

  const showFocusedStyle = state === 'focused' || (state === 'default' && isFocused);

  let borderColor = t.border.strong.default;
  let boxShadow: string | undefined;
  let bg = t.bg.surface.primary.default;
  let opacity = 1;
  let cursor: CSSProperties['cursor'] = 'text';
  let disabled = false;

  if (state === 'error') {
    borderColor = t.border.danger.default;
  } else if (state === 'success') {
    borderColor = t.border.success.default;
  } else if (showFocusedStyle) {
    borderColor = t.border.brand.default;
    boxShadow = `0 0 0 3px ${t.bg.fill.brandSubtle.default}`;
  }
  if (state === 'disabled') {
    bg = t.bg.surface.tertiary.default;
    opacity = 0.5;
    cursor = 'not-allowed';
    disabled = true;
  }

  const LeftIcon =
    leftIcon === 'icon' ? <AtSign size={16} color={t.icon.secondary.default} aria-hidden /> : null;
  let RightEl: ReactNode = null;
  if (state === 'error') {
    RightEl = <AlertCircle size={16} color="#E8186D" aria-hidden />;
  } else if (state === 'success') {
    RightEl = <CheckCircle2 size={16} color="#0A8853" aria-hidden />;
  } else if (rightIcon === 'icon') {
    RightEl = <Search size={16} color={t.icon.secondary.default} aria-hidden />;
  }

  const helper =
    state === 'error'
      ? { text: 'This field is required', color: '#E8186D' as const }
      : state === 'success'
        ? { text: 'Email is available', color: '#0A8853' as const }
        : { text: "We'll never share your email.", color: t.text.tertiary.default };

  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 320 }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: t.text.primary.default,
          fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
        }}
      >
        Email address
      </label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: s.h,
          border: `1.5px solid ${borderColor}`,
          borderRadius: 8,
          background: bg,
          padding: s.px,
          gap: 8,
          boxShadow,
          opacity,
          cursor,
          transition: 'border-color 150ms, box-shadow 150ms',
        }}
      >
        {LeftIcon}
        <input
          ref={inputRef}
          disabled={disabled}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: s.fs,
            color: t.text.primary.default,
            fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
            cursor,
          }}
          placeholder="you@example.com"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {RightEl}
      </div>
      <span style={{ fontSize: 12, color: helper.color }}>{helper.text}</span>
    </div>
  );

  if (appearance === 'dark') {
    return (
      <div
        data-theme="dark"
        style={{
          width: '100%',
          minHeight: 180,
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
        minHeight: 180,
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

export default function TextInputDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [previewSize, setPreviewSize] = useState<PreviewSize>('md');
  const [previewState, setPreviewState] = useState<PreviewState>('default');
  const [leftIcon, setLeftIcon] = useState<IconOpt>('icon');
  const [rightIcon, setRightIcon] = useState<IconOpt>('none');
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
        { id: 'principles-ti', label: 'Principles' },
        { id: 'anatomy-ti', label: 'Anatomy' },
        { id: 'variants-ti', label: 'Variants' },
        { id: 'sizes-ti', label: 'Sizes' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use', label: 'When to use' },
        { id: 'labels-ti', label: 'Labels & helper text' },
        { id: 'validation', label: 'Validation' },
        { id: 'icons-ti', label: 'Icons' },
        { id: 'dos-donts-ti', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'label-writing', label: 'Label writing' },
        { id: 'placeholder-writing', label: 'Placeholder writing' },
        { id: 'helper-writing', label: 'Helper & error text' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-ti', label: 'Installation' },
        { id: 'import-ti', label: 'Import' },
        { id: 'examples-ti', label: 'Usage examples' },
        { id: 'props-ti', label: 'Props' },
        { id: 'a11y-ti', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const propsRows = [
    { name: 'label', type: 'string', default: '—', description: 'Field label. Always required (use aria-label only for icon-only inputs)' },
    { name: 'placeholder', type: 'string', default: '—', description: 'Example value. Never use as label substitute' },
    { name: 'value', type: 'string', default: '—', description: 'Controlled value' },
    { name: 'defaultValue', type: 'string', default: '—', description: 'Uncontrolled default value' },
    { name: 'onChange', type: '(value: string) => void', default: '—', description: 'Change handler' },
    {
      name: 'type',
      type: "'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'",
      default: "'text'",
      description: 'Input type',
    },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height variant' },
    { name: 'leftIcon', type: 'ReactNode', default: '—', description: 'Icon before input text' },
    { name: 'rightIcon', type: 'ReactNode', default: '—', description: 'Icon after input text (overridden by state icons)' },
    { name: 'prefix', type: 'string', default: '—', description: 'Static text prepended inside the input' },
    { name: 'suffix', type: 'string', default: '—', description: 'Static text appended inside the input' },
    { name: 'helperText', type: 'string', default: '—', description: 'Instructional text below input' },
    { name: 'errorText', type: 'string', default: '—', description: 'Error message. Setting this also triggers error state' },
    { name: 'successText', type: 'string', default: '—', description: 'Success message. Setting this triggers success state' },
    { name: 'hasError', type: 'boolean', default: 'false', description: 'Manually trigger error state without error text' },
    { name: 'hasSuccess', type: 'boolean', default: 'false', description: 'Manually trigger success state without success text' },
    { name: 'isDisabled', type: 'boolean', default: 'false', description: 'Prevents interaction. Reduces opacity.' },
    { name: 'isReadOnly', type: 'boolean', default: 'false', description: 'Value visible but not editable' },
    { name: 'isRequired', type: 'boolean', default: 'false', description: 'Shows required indicator and sets aria-required' },
    { name: 'maxLength', type: 'number', default: '—', description: 'Maximum characters. Enables character count' },
    { name: 'showCount', type: 'boolean', default: 'false', description: 'Show character count (requires maxLength)' },
    { name: 'autoComplete', type: 'string', default: '—', description: 'HTML autocomplete attribute' },
    { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focus input on mount' },
    { name: 'name', type: 'string', default: '—', description: 'Form field name' },
    { name: 'id', type: 'string', default: '—', description: 'HTML id, linked to label htmlFor' },
    { name: 'className', type: 'string', default: '—', description: 'Additional CSS classes' },
  ];

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Text Input
      </p>
      <h1 className="page-title">Text Input</h1>
      <p className="page-lead">
        The foundation of every form. Text Input handles all single-line text entry — from simple search fields
        to complex validated forms. It communicates state clearly, fails gracefully, and never leaves the user
        guessing.
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
              <LiveTextInputPreview
                t={previewT}
                size={previewSize}
                state={previewState}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
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
                      { value: 'focused', label: 'focused' },
                      { value: 'error', label: 'error' },
                      { value: 'success', label: 'success' },
                      { value: 'disabled', label: 'disabled' },
                    ]}
                    value={previewState}
                    onChange={setPreviewState}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>Left icon</div>
                  <SegmentedControl
                    aria-label="Left icon"
                    options={[
                      { value: 'none', label: 'none' },
                      { value: 'icon', label: 'icon' },
                    ]}
                    value={leftIcon}
                    onChange={setLeftIcon}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>Right icon</div>
                  <SegmentedControl
                    aria-label="Right icon"
                    options={[
                      { value: 'none', label: 'none' },
                      { value: 'icon', label: 'icon' },
                    ]}
                    value={rightIcon}
                    onChange={setRightIcon}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>Appearance</div>
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

          <section id="principles-ti" style={{ marginBottom: 48 }}>
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
                  <Info size={18} color={t.text.brand.default} style={{ flexShrink: 0, opacity: 0.5 }} aria-hidden />
                  <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, marginBottom: 4, color: t.text.secondary.default }}>Default</div>
                      <div
                        style={{
                          height: 36,
                          borderRadius: 8,
                          border: `1.5px solid ${t.border.strong.default}`,
                          background: t.bg.surface.primary.default,
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, marginBottom: 4, color: '#E8186D' }}>Error</div>
                      <div
                        style={{
                          height: 36,
                          borderRadius: 8,
                          border: `1.5px solid ${t.border.danger.default}`,
                          background: t.bg.surface.primary.default,
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 8px',
                          gap: 6,
                        }}
                      >
                        <AlertCircle size={14} color="#E8186D" />
                        <span style={{ fontSize: 11, color: '#E8186D' }}>Required</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>State is always visible</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Every input state — focus, error, success, disabled — is communicated through at least two visual
                    signals: color and icon or text. Never color alone.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 24, position: 'relative' }}>
                  <CheckCircle2 size={18} color={t.text.brand.default} style={{ position: 'absolute', top: 16, right: 16, opacity: 0.35 }} aria-hidden />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 260 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.text.primary.default }}>Email</span>
                    <div
                      style={{
                        height: 36,
                        borderRadius: 8,
                        border: `1.5px solid ${t.border.strong.default}`,
                        background: t.bg.surface.primary.default,
                        padding: '0 10px',
                        fontSize: 12,
                        color: t.text.tertiary.default,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      you@example.com
                    </div>
                    <span style={{ fontSize: 11, color: t.text.tertiary.default }}>Work email preferred</span>
                    <span style={{ fontSize: 11, color: t.text.tertiary.default, textAlign: 'right' }}>12/50</span>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      left: 20,
                      top: 48,
                      width: 1,
                      height: 40,
                      background: '#E8186D',
                      opacity: 0.6,
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: 8,
                      top: 88,
                      fontSize: 9,
                      color: '#E8186D',
                      fontFamily: 'var(--font-mono), monospace',
                    }}
                  >
                    parts
                  </span>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Every part has a role</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Label names the field. Placeholder suggests format. Helper text guides completion. Error text
                    explains failure. Each serves a distinct purpose — never mix their functions.
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
                  <Lock size={18} color={t.text.brand.default} style={{ opacity: 0.35 }} aria-hidden />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, marginBottom: 4, color: t.text.tertiary.default }}>Disabled</div>
                    <div
                      style={{
                        height: 36,
                        borderRadius: 8,
                        border: `1.5px solid ${t.border.default.default}`,
                        background: t.bg.surface.tertiary.default,
                        opacity: 0.5,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, marginBottom: 4, color: t.text.tertiary.default }}>Read-only</div>
                    <div
                      style={{
                        height: 36,
                        borderRadius: 8,
                        border: `1.5px solid ${t.border.default.default}`,
                        background: t.bg.surface.secondary.default,
                        padding: '0 10px',
                        fontSize: 12,
                        color: t.text.primary.default,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      jane@vds.io
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Disabled ≠ Read-only</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Disabled means the user cannot interact — the field is locked by the system. Read-only means the
                    value exists but the user doesn&apos;t need to change it. They look similar but mean different
                    things.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-ti" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                ...{
                  backgroundColor: t.bg.surface.secondary.default,
                  backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                  backgroundSize: '12px 12px',
                },
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                padding: 24,
                minHeight: 280,
                position: 'relative',
              }}
            >
              <div style={{ maxWidth: 480, margin: '0 auto' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default, marginBottom: 8 }}>
                  Email <span style={{ color: '#E8186D' }}>*</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 40,
                    border: `1.5px solid ${t.border.strong.default}`,
                    borderRadius: 8,
                    background: t.bg.surface.primary.default,
                    padding: '0 12px',
                    gap: 8,
                  }}
                >
                  <Search size={16} color={t.icon.secondary.default} />
                  <span style={{ color: t.text.tertiary.default, fontSize: 14 }}>Placeholder text</span>
                  <div style={{ flex: 1 }} />
                  <CheckCircle2 size={16} color={t.text.success.default} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: t.text.tertiary.default }}>Helper text or character count</span>
                  <span style={{ fontSize: 12, color: t.text.tertiary.default }}>12/50</span>
                </div>
              </div>
              {(['A: Label', 'B: *', 'C: Left icon', 'D: Field', 'E: Placeholder', 'F: Right icon', 'G: Helper', 'H: Count'] as const).map(
                (label, i) => (
                  <div
                    key={label}
                    style={{
                      position: 'absolute',
                      left: 16 + i * 14,
                      top: 40 + i * 8,
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
                    {label[0]}
                  </div>
                ),
              )}
            </div>
            <p style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 12, lineHeight: 1.6 }}>
              A Label 13px/600 · B Required * · C Left icon 16px · D Container 40px · E Placeholder · F State icon · G
              Helper 12px · H Character count 12px
            </p>
          </section>

          <section id="variants-ti" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {(
                [
                  {
                    title: 'Default',
                    token: 'color.border.strong.default',
                    desc: 'Resting state. The neutral starting point before any interaction.',
                    node: (
                      <div
                        style={{
                          height: 36,
                          width: '100%',
                          maxWidth: 200,
                          border: `1.5px solid ${t.border.strong.default}`,
                          borderRadius: 8,
                          background: t.bg.surface.primary.default,
                        }}
                      />
                    ),
                  },
                  {
                    title: 'Focused',
                    token: 'color.border.brand.default',
                    desc: 'Active editing state. Border becomes brand, focus ring appears.',
                    node: (
                      <div
                        style={{
                          height: 36,
                          width: '100%',
                          maxWidth: 200,
                          border: `1.5px solid ${t.border.brand.default}`,
                          borderRadius: 8,
                          background: t.bg.surface.primary.default,
                          boxShadow: `0 0 0 3px ${t.bg.fill.brandSubtle.default}`,
                        }}
                      />
                    ),
                  },
                  {
                    title: 'Error',
                    token: 'color.border.danger.default',
                    desc: 'Validation failed. Border, icon, and helper text all signal the error.',
                    node: (
                      <div style={{ width: '100%', maxWidth: 220 }}>
                        <div
                          style={{
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            border: `1.5px solid ${t.border.danger.default}`,
                            borderRadius: 8,
                            padding: '0 10px',
                            background: t.bg.surface.primary.default,
                          }}
                        >
                          <AlertCircle size={16} color="#E8186D" />
                        </div>
                        <div style={{ fontSize: 11, color: '#E8186D', marginTop: 4 }}>This field is required</div>
                      </div>
                    ),
                  },
                  {
                    title: 'Success',
                    token: 'color.border.success.default',
                    desc: 'Validation passed. Used for real-time validation with clear positive feedback.',
                    node: (
                      <div style={{ width: '100%', maxWidth: 220 }}>
                        <div
                          style={{
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            border: `1.5px solid ${t.border.success.default}`,
                            borderRadius: 8,
                            padding: '0 10px',
                            background: t.bg.surface.primary.default,
                          }}
                        >
                          <CheckCircle2 size={16} color="#0A8853" />
                        </div>
                        <div style={{ fontSize: 11, color: '#0A8853', marginTop: 4 }}>Email is available</div>
                      </div>
                    ),
                  },
                  {
                    title: 'Disabled',
                    token: 'color.bg.surface.tertiary.default',
                    desc: 'Not interactive. The system has locked this field. Never use for read-only data.',
                    node: (
                      <div
                        style={{
                          height: 36,
                          width: '100%',
                          maxWidth: 200,
                          border: `1.5px solid ${t.border.default.default}`,
                          borderRadius: 8,
                          background: t.bg.surface.tertiary.default,
                          opacity: 0.5,
                        }}
                      />
                    ),
                  },
                  {
                    title: 'Read-only',
                    token: 'color.bg.surface.secondary.default',
                    desc: 'Value is visible but not editable. Different from disabled — the data is valid and current.',
                    node: (
                      <div
                        style={{
                          height: 36,
                          width: '100%',
                          maxWidth: 200,
                          border: `1.5px solid ${t.border.default.default}`,
                          borderRadius: 8,
                          background: t.bg.surface.secondary.default,
                          padding: '0 10px',
                          fontSize: 13,
                          color: t.text.primary.default,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        read-only value
                      </div>
                    ),
                  },
                  {
                    title: 'With prefix/suffix',
                    token: 'color.bg.surface.tertiary.default',
                    desc: 'Prepended or appended static content. Use for URLs, currency, units.',
                    node: (
                      <div style={{ display: 'flex', height: 36, maxWidth: 240, borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${t.border.strong.default}` }}>
                        <div
                          style={{
                            background: t.bg.surface.tertiary.default,
                            borderRight: `1px solid ${t.border.default.default}`,
                            padding: '0 12px',
                            fontSize: 14,
                            color: t.text.secondary.default,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          https://
                        </div>
                        <div style={{ flex: 1, background: t.bg.surface.primary.default }} />
                      </div>
                    ),
                  },
                  {
                    title: 'With character count',
                    token: 'color.text.tertiary.default',
                    desc: 'Shows remaining characters. Appears when maxLength is set.',
                    node: (
                      <div style={{ width: '100%', maxWidth: 220 }}>
                        <div
                          style={{
                            height: 36,
                            border: `1.5px solid ${t.border.strong.default}`,
                            borderRadius: 8,
                            background: t.bg.surface.primary.default,
                            padding: '0 10px',
                            fontSize: 13,
                            color: t.text.primary.default,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          Partial value here…
                        </div>
                        <div style={{ fontSize: 12, color: t.text.tertiary.default, textAlign: 'right', marginTop: 4 }}>24/50</div>
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
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>{v.title}</div>
                    <span style={chipStyleB(t, { fontSize: 11, marginBottom: 8, display: 'inline-flex' })}>{v.token}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="sizes-ti" style={{ marginBottom: 48 }}>
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
                const m = SIZE_MAP[sz];
                return (
                  <div key={sz} style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: -28, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#E8186D', fontFamily: 'var(--font-mono), monospace' }}>
                      {m.h}px
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 11, color: t.text.secondary.default }}>
                        {sz === 'md' ? (
                          <>
                            Medium <span style={chipStyleA({ fontSize: 10, padding: '2px 6px' })}>default</span>
                          </>
                        ) : (
                          sz
                        )}
                      </span>
                      <div
                        style={{
                          height: m.h,
                          minWidth: 200,
                          padding: m.px,
                          borderRadius: 8,
                          border: `1.5px solid ${t.border.strong.default}`,
                          background: t.bg.surface.primary.default,
                          fontSize: m.fs,
                          display: 'flex',
                          alignItems: 'center',
                          color: t.text.tertiary.default,
                        }}
                      >
                        Text
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${t.border.strong.default}` }}>
                    {['SIZE', 'HEIGHT', 'H. PADDING', 'FONT SIZE', 'USE CASE'].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '10px 16px',
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: '0.07em',
                          color: t.text.tertiary.default,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['sm', '32px', '10px', '13px', 'Compact tables, dense forms, toolbars'],
                    ['md', '40px', '12px', '14px', 'Default — forms, search, standard UI'],
                    ['lg', '48px', '14px', '15px', 'Landing pages, prominent search, auth forms'],
                  ].map((row, idx) => (
                    <tr key={row[0]} style={{ background: idx % 2 === 0 ? t.bg.surface.secondary.default : t.bg.surface.primary.default }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono), monospace', fontWeight: 600 }}>
                        {row[0]}
                        {row[0] === 'md' ? (
                          <span style={{ marginLeft: 8 }}>
                            <span style={chipStyleA({ fontSize: 10, padding: '2px 6px' })}>default</span>
                          </span>
                        ) : null}
                      </td>
                      {row.slice(1).map((c) => (
                        <td key={c} style={{ padding: '12px 16px', color: t.text.secondary.default }}>
                          {c}
                        </td>
                      ))}
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
          <section id="when-to-use" style={{ marginTop: 32, marginBottom: 40 }}>
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
                  'Single-line text entry (name, email, URL, search)',
                  'Values with known format (phone, postal code, credit card)',
                  'Real-time search and filter',
                  'Form fields with validation requirements',
                ].map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <CheckCircle2 size={16} color="#0A8853" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
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
                  'Multi-line content → use Textarea',
                  'Choosing from options → use Select',
                  'Yes/No decisions → use Toggle or Checkbox',
                  'Dates → use DatePicker',
                ].map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <X size={16} color="#E8186D" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                    <span style={{ fontSize: 13, color: t.text.secondary.default }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="labels-ti" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Labels &amp; helper text
            </h2>
            <Callout variant="warning" title="Always use a visible label">
              Placeholder text is not a label. When the user starts typing, the placeholder disappears — and so does
              the context. Every input needs a persistent label above it. aria-label is only acceptable for
              icon-only inputs with a visible tooltip.
            </Callout>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
              {(
                [
                  {
                    title: 'Label placement',
                    do: 'Label above input, persistent',
                    dont: 'Label as placeholder only',
                  },
                  {
                    title: 'Helper text purpose',
                    do: 'Helper explains format — “Use your work email”',
                    dont: 'Helper repeats the label — “Enter your email”',
                  },
                  {
                    title: 'Required indication',
                    do: 'Required * on label + “* Required” at form top',
                    dont: '“(optional)” on every non-required field',
                  },
                ] as const
              ).map((pair) => (
                <div
                  key={pair.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: t.text.primary.default }}>{pair.title}</div>
                  <div style={{ fontSize: 12, color: '#0A8853', marginBottom: 8 }}>✓ {pair.do}</div>
                  <div style={{ fontSize: 12, color: '#E8186D' }}>✗ {pair.dont}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="validation" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Validation
            </h2>
            <p style={sectionLead}>
              Validation timing determines whether the form feels helpful or aggressive. Show errors at the right
              moment — too early creates frustration, too late wastes the user&apos;s time.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {(
                [
                  {
                    title: 'On blur',
                    badge: 'Recommended',
                    body: 'Validate when the user leaves the field. Gives them the chance to complete their input before judging it.',
                  },
                  {
                    title: 'On submit',
                    badge: 'Also valid',
                    body: 'Validate the entire form on submit. Simpler to implement. Best for short forms (2-3 fields).',
                  },
                  {
                    title: 'On change',
                    badge: 'Use carefully',
                    body: 'Real-time validation is only appropriate when the format check is instant and non-judgmental — like username availability.',
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
                  <div style={{ height: 100, background: t.bg.surface.secondary.default, padding: 16 }} />
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>{c.title}</span>
                      <span style={chipStyleA({ fontSize: 11, padding: '2px 8px' })}>{c.badge}</span>
                    </div>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <Callout variant="info" title="Error messages must be actionable">
              &apos;Invalid input&apos; is not an error message. &apos;Enter a valid email address
              (example@domain.com)&apos; is. Every error must tell the user exactly what went wrong and how to fix it.
            </Callout>
          </section>

          <section id="icons-ti" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Icons
            </h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 16 }}>
              Use a left icon to communicate the input type at a glance — search, email, user, phone. The icon is
              decorative support for the label, never a replacement.
            </p>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 16 }}>
              Right icons — state icon (never clickable), clear (×) for search with content, eye toggle for password
              only.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <IconRowExample t={t} icon={<Search size={16} />} label="Search" />
              <IconRowExample t={t} icon={<Mail size={16} />} label="Email" />
              <PasswordIconExample t={t} />
              <IconRowExample t={t} icon={<AlertCircle size={16} color="#E8186D" />} label="Error" danger />
            </div>
            <Callout variant="warning" title="Right slot priority">
              When state icon (error/success) and another right icon conflict, the state icon always wins. The user
              needs to know if their input is invalid before anything else.
            </Callout>
          </section>

          <section id="dos-donts-ti" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <DoDontPair
                t={t}
                ok
                title="Width reflects expected content"
                caption="Input width signals expected content length. A narrow field suggests a short value."
              />
              <DoDontPair
                t={t}
                ok={false}
                title="Same width everywhere"
                caption="Full-width ZIP code fields feel wrong — the space implies more content than 5 digits."
              />
              <DoDontPair
                t={t}
                ok
                title="One error at a time"
                caption="One clear error with the exact fix. The user knows exactly what to do."
              />
              <DoDontPair
                t={t}
                ok={false}
                title="Error stacking"
                caption="Show the most critical error first, then reveal the next on resubmission."
              />
              <DoDontPair
                t={t}
                ok
                title="Explain disabled fields"
                caption="If a field is disabled, the user deserves to know why and what enables it."
              />
              <DoDontPair
                t={t}
                ok={false}
                title="Silent disabled"
                caption="Silent disabled inputs create confusion. Users think the UI is broken."
              />
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="label-writing" style={{ marginTop: 32, marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Label writing
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
                <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, fontSize: 13, lineHeight: 1.7 }}>
                  <li>Short and noun-first: &apos;Email address&apos;, not &apos;Please enter your email address&apos;</li>
                  <li>Sentence case: &apos;Phone number&apos;, not &apos;Phone Number&apos;</li>
                  <li>No punctuation at the end</li>
                  <li>Be specific: &apos;Work email&apos;, not just &apos;Email&apos; when context matters</li>
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
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 8, color: t.text.tertiary.default }}>Good</th>
                      <th style={{ textAlign: 'left', padding: 8, color: t.text.tertiary.default }}>Bad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Email address', 'Please provide your email'],
                      ['Phone number', 'Enter Phone #'],
                      ['Company name', 'Company Name:'],
                      ['Street address', 'Address line 1'],
                    ].map((row) => (
                      <tr key={row[0]}>
                        <td style={{ padding: 8, color: '#0A8853' }}>✓ {row[0]}</td>
                        <td style={{ padding: 8, color: '#E8186D' }}>✗ {row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="placeholder-writing" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Placeholder writing
            </h2>
            <p style={sectionLead}>
              Placeholder shows an example of valid input — not a prompt to enter something.
            </p>
            <div
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <th style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default }}>Field</th>
                    <th style={{ padding: 12, textAlign: 'left', color: '#0A8853' }}>✓ Good</th>
                    <th style={{ padding: 12, textAlign: 'left', color: '#E8186D' }}>✗ Bad</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Email', 'you@example.com', 'Enter your email'],
                    ['Phone', '+1 (555) 000-0000', 'Type phone number'],
                    ['Username', 'jane_smith', 'Enter username'],
                    ['Search', 'Search products...', 'Type to search'],
                  ].map((r) => (
                    <tr key={r[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>{r[0]}</td>
                      <td style={{ padding: 12 }}>{r[1]}</td>
                      <td style={{ padding: 12 }}>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Callout variant="tip" title="When in doubt, skip the placeholder">
              If the label is clear enough, an empty input is cleaner than a placeholder that disappears on focus.
              Placeholders are most useful for format examples, not redundant prompts.
            </Callout>
          </section>

          <section id="helper-writing" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Helper &amp; error text
            </h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.7, marginBottom: 16 }}>
              Helper: format guidance, helpful tone, 1 line max. Error: start with what&apos;s wrong, end with the
              fix — never blame the user.
            </p>
            <div
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <th style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default }}>Context</th>
                    <th style={{ padding: 12, textAlign: 'left', color: '#0A8853' }}>✓ Good error</th>
                    <th style={{ padding: 12, textAlign: 'left', color: '#E8186D' }}>✗ Bad error</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Required field', 'Email address is required', 'Invalid'],
                    ['Wrong format', 'Enter a valid email (you@example.com)', 'Email is wrong'],
                    ['Too short', 'Password must be at least 8 characters', 'Too short'],
                    ['Taken', 'This username is taken — try jane_smith_2', 'Username unavailable'],
                  ].map((r) => (
                    <tr key={r[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>{r[0]}</td>
                      <td style={{ padding: 12 }}>{r[1]}</td>
                      <td style={{ padding: 12 }}>{r[2]}</td>
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
          <section id="install-ti" style={{ marginTop: 32, marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-ti" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock code={`import { TextInput } from '@vds/react'`} filename="component.tsx" language="tsx" />
          </section>
          <section id="examples-ti" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock
                code={`<TextInput
  label="Email address"
  placeholder="you@example.com"
  type="email"
/>`}
                filename="Basic"
                language="tsx"
              />
              <CodeBlock
                code={`<TextInput
  label="Username"
  placeholder="jane_smith"
  helperText="Only letters, numbers, and underscores"
/>`}
                filename="With helper text"
                language="tsx"
              />
              <CodeBlock
                code={`import { Mail } from 'lucide-react'

<TextInput
  label="Email"
  placeholder="you@example.com"
  leftIcon={<Mail size={16} />}
/>`}
                filename="With left icon"
                language="tsx"
              />
              <CodeBlock
                code={`<TextInput
  label="Email address"
  value={email}
  onChange={setEmail}
  hasError={!isValidEmail}
  errorText="Enter a valid email address (you@example.com)"
/>`}
                filename="Error state"
                language="tsx"
              />
              <CodeBlock
                code={`const [value, setValue] = useState('')

<TextInput
  label="Bio"
  value={value}
  onChange={setValue}
  maxLength={150}
  showCount
  helperText="Tell us a bit about yourself"
/>`}
                filename="Controlled + count"
                language="tsx"
              />
              <CodeBlock
                code={`<TextInput label="Small" size="sm" />
<TextInput label="Medium" size="md" />  {/* default */}
<TextInput label="Large" size="lg" />`}
                filename="Sizes"
                language="tsx"
              />
            </div>
          </section>
          <section id="props-ti" style={{ marginBottom: 32 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Props
            </h3>
            <PropsTable props={propsRows} />
          </section>
          <section id="a11y-ti" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Accessibility
            </h3>
            <Callout variant="info" title="Built-in accessibility">
              TextInput automatically links label to input via htmlFor/id, sets aria-required, aria-invalid,
              aria-describedby for helper and error text, and announces state changes to screen readers.
            </Callout>
            <div
              style={{
                background: t.bg.surface.secondary.default,
                borderRadius: 12,
                border: `1px solid ${t.border.default.default}`,
                padding: 20,
                marginTop: 16,
              }}
            >
              {[
                'Label always visible and persistent — never placeholder-only',
                "Error state uses aria-invalid='true' + aria-describedby pointing to error text",
                'Focus ring: 3px, 3px offset, color --color-border-brand-focus',
                "Disabled state uses aria-disabled='true' (not just HTML disabled)",
                "Password toggle button has aria-label='Show password' / 'Hide password'",
                'Color is never the only error indicator — icon and text always accompany it',
                'Touch target minimum 44×44px on mobile',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
                  <CheckCircle2 size={16} color="#0A8853" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                  <span style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
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
                Initial release. All sizes, states, icons, prefix/suffix, character count.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}

function IconRowExample({
  t,
  icon,
  label,
  danger,
}: {
  t: VDSTheme;
  icon: ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 40,
        padding: '0 12px',
        border: `1.5px solid ${danger ? t.border.danger.default : t.border.strong.default}`,
        borderRadius: 8,
        background: t.bg.surface.primary.default,
        minWidth: 160,
      }}
    >
      {icon}
      <span style={{ fontSize: 13, color: t.text.tertiary.default }}>{label}</span>
    </div>
  );
}

function PasswordIconExample({ t }: { t: VDSTheme }) {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 40,
        padding: '0 12px',
        border: `1.5px solid ${t.border.strong.default}`,
        borderRadius: 8,
        background: t.bg.surface.primary.default,
        minWidth: 200,
      }}
    >
      <Lock size={16} color={t.icon.secondary.default} />
      <span style={{ flex: 1, fontSize: 13, color: t.text.tertiary.default }}>••••••••</span>
      <button
        type="button"
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => setShow(!show)}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          color: t.icon.secondary.default,
        }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function DoDontPair({
  t,
  ok,
  title,
  caption,
}: {
  t: VDSTheme;
  ok: boolean;
  title: string;
  caption: string;
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
      <div style={{ padding: 16, fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>{title}</div>
      <div style={{ height: 3, background: ok ? '#0A8853' : '#E8186D' }} />
      <p style={{ padding: '16px 20px', fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{caption}</p>
    </div>
  );
}
