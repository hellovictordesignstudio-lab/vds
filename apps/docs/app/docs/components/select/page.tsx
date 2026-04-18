'use client';

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertCircle,
  Building,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CreditCard,
  Globe,
  Palette,
  Search,
  Tag,
  Users,
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

type SelectSize = 'sm' | 'md' | 'lg';
type OptionsMode = 'basic' | 'grouped' | 'icons';
type UiState = 'default' | 'error' | 'success' | 'disabled';

const SIZE_MAP: Record<SelectSize, { height: number; fontSize: number }> = {
  sm: { height: 32, fontSize: 12 },
  md: { height: 40, fontSize: 13 },
  lg: { height: 48, fontSize: 14 },
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

type DemoOpt = { value: string; label: string; group?: string; description?: string; icon?: ReactNode };

const BASIC_OPTIONS: DemoOpt[] = [
  { value: 'figma', label: 'Figma' },
  { value: 'sketch', label: 'Sketch' },
  { value: 'xd', label: 'Adobe XD' },
  { value: 'framer', label: 'Framer' },
  { value: 'penpot', label: 'Penpot' },
];

const GROUPED_OPTIONS: DemoOpt[] = [
  { value: 'figma', label: 'Figma', group: 'Design' },
  { value: 'sketch', label: 'Sketch', group: 'Design' },
  { value: 'vscode', label: 'VS Code', group: 'Code' },
  { value: 'cursor', label: 'Cursor', group: 'Code' },
  { value: 'zed', label: 'Zed', group: 'Code' },
];

function ICON_OPTIONS(t: VDSTheme): DemoOpt[] {
  return [
    { value: 'en', label: 'English', icon: <Globe size={16} strokeWidth={2} aria-hidden /> },
    { value: 'design', label: 'Design', icon: <Palette size={16} strokeWidth={2} aria-hidden /> },
    { value: 'team', label: 'Team', icon: <Users size={16} strokeWidth={2} aria-hidden /> },
    { value: 'company', label: 'Company', icon: <Building size={16} strokeWidth={2} aria-hidden /> },
    { value: 'tags', label: 'Tags', icon: <Tag size={16} strokeWidth={2} aria-hidden /> },
  ];
}

function getOptions(mode: OptionsMode, t: VDSTheme): DemoOpt[] {
  if (mode === 'basic') return BASIC_OPTIONS;
  if (mode === 'grouped') return GROUPED_OPTIONS;
  return ICON_OPTIONS(t);
}

function groupOptions(opts: DemoOpt[]): { group: string | null; items: DemoOpt[] }[] {
  const map = new Map<string | null, DemoOpt[]>();
  for (const o of opts) {
    const g = o.group ?? null;
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(o);
  }
  const out: { group: string | null; items: DemoOpt[] }[] = [];
  for (const [g, items] of map) out.push({ group: g, items });
  return out;
}

function StateCard({
  t,
  title,
  token,
  desc,
  border,
  ring,
  icon,
  helper,
  disabled,
  focusedOpen,
}: {
  t: VDSTheme;
  title: string;
  token: string;
  desc: string;
  border?: string;
  ring?: string;
  icon?: ReactNode;
  helper?: { text: string; color: string };
  disabled?: boolean;
  focusedOpen?: boolean;
}) {
  const triggerBorder = border ?? t.border.default.default;
  return (
    <div
      style={{
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          borderBottom: `1px solid ${t.border.default.default}`,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.06em',
          color: t.text.tertiary.default,
        }}
      >
        {title}
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
        <div
          style={{
            width: '100%',
            maxWidth: 200,
            height: 40,
            borderRadius: 8,
            border: `1px solid ${triggerBorder}`,
            boxShadow: ring ?? 'none',
            background: disabled ? t.bg.surface.tertiary.default : t.bg.surface.primary.default,
            opacity: disabled ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            gap: 6,
            cursor: disabled ? 'not-allowed' : 'default',
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: 13,
              color: focusedOpen ? t.text.primary.default : t.text.tertiary.default,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {focusedOpen ? 'Figma' : 'Select…'}
          </span>
          {icon}
          {focusedOpen ? (
            <ChevronUp size={16} color={t.icon.secondary.default} aria-hidden />
          ) : (
            <ChevronDown size={16} color={t.icon.secondary.default} aria-hidden />
          )}
        </div>
        {helper ? (
          <span style={{ fontSize: 12, color: helper.color, textAlign: 'center' }}>{helper.text}</span>
        ) : (
          <span style={{ fontSize: 11, color: t.text.tertiary.default, textAlign: 'center' }}>No helper</span>
        )}
      </div>
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${t.border.default.default}` }}>
        <span style={chipStyleB(t, { display: 'inline-block', marginBottom: 8 })}>{token}</span>
        <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}

function OptionTypeCard({
  t,
  title,
  token,
  body,
  children,
}: {
  t: VDSTheme;
  title: string;
  token: string;
  body: string;
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
          height: 160,
          background: t.bg.surface.secondary.default,
          backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        {children}
      </div>
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>{title}</div>
        <span style={chipStyleB(t, { marginBottom: 8, display: 'inline-block' })}>{token}</span>
        <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>{body}</p>
      </div>
    </div>
  );
}

function DocSelectInteractive({
  t,
  size,
  optionsMode,
  isSearchable,
  isClearable,
  uiState,
}: {
  t: VDSTheme;
  size: SelectSize;
  optionsMode: OptionsMode;
  isSearchable: boolean;
  isClearable: boolean;
  uiState: UiState;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const sz = SIZE_MAP[size];
  const options = getOptions(optionsMode, t);
  const disabled = uiState === 'disabled';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const selectedLabel = selected ? options.find((o) => o.value === selected)?.label : null;

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const borderColor =
    uiState === 'error'
      ? '#D22232'
      : uiState === 'success'
        ? '#0A8853'
        : open
          ? t.border.brand.default
          : t.border.default.default;

  const focusRing = open ? `0 0 0 3px ${t.bg.fill.brandSubtle.default}` : 'none';

  const triggerBg =
    uiState === 'disabled' ? t.bg.surface.tertiary.default : t.bg.surface.primary.default;

  return (
    <div ref={rootRef} style={{ width: 280, position: 'relative', zIndex: open ? 50 : 1 }}>
      <button
        type="button"
        role="combobox"
        id={`${id}-trigger`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => !disabled && setOpen((o) => !o)}
        style={{
          width: '100%',
          height: sz.height,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingLeft: 12,
          paddingRight: 10,
          borderRadius: 8,
          border: `1px solid ${borderColor}`,
          boxShadow: focusRing,
          background: triggerBg,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: sz.fontSize,
          fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
          textAlign: 'left',
          transition: 'border-color 150ms, box-shadow 150ms',
        }}
      >
        <span
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: selectedLabel ? t.text.primary.default : t.text.tertiary.default,
            fontWeight: selectedLabel ? 500 : 400,
          }}
        >
          {selectedLabel ?? 'Select a design tool'}
        </span>
        {isClearable && selected && !disabled ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setSelected(null);
              }
            }}
            style={{ display: 'flex', color: t.icon.secondary.default, cursor: 'pointer' }}
            aria-label="Clear selection"
          >
            <X size={14} strokeWidth={2} aria-hidden />
          </span>
        ) : null}
        {uiState === 'error' && !disabled ? (
          <AlertCircle size={14} color="#D22232" aria-hidden />
        ) : null}
        {uiState === 'success' && !disabled ? (
          <CheckCircle2 size={14} color="#0A8853" aria-hidden />
        ) : null}
        <ChevronDown
          size={16}
          strokeWidth={2}
          style={{
            color: t.icon.secondary.default,
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
          aria-hidden
        />
      </button>

      {open && !disabled ? (
        <div
          id={`${id}-listbox`}
          role="listbox"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            marginTop: 4,
            background: t.bg.surface.primary.default,
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 10,
            boxShadow: t.shadow.md,
            maxHeight: 240,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            animation: 'selectDocFadeIn 150ms ease forwards',
          }}
        >
          <style>{`@keyframes selectDocFadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
          {isSearchable ? (
            <>
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  padding: 8,
                  borderBottom: `1px solid ${t.border.default.default}`,
                  background: t.bg.surface.primary.default,
                  zIndex: 1,
                }}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search
                    size={14}
                    style={{ position: 'absolute', left: 8, color: t.icon.tertiary.default }}
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search…"
                    style={{
                      width: '100%',
                      padding: '8px 28px 8px 28px',
                      borderRadius: 6,
                      border: 'none',
                      background: t.bg.surface.secondary.default,
                      fontSize: 13,
                      color: t.text.primary.default,
                      outline: 'none',
                    }}
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      style={{
                        position: 'absolute',
                        right: 6,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: t.icon.secondary.default,
                        padding: 4,
                        display: 'flex',
                      }}
                      aria-label="Clear search"
                    >
                      <X size={14} aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
          <div style={{ overflowY: 'auto', flex: 1, padding: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {optionsMode === 'grouped'
              ? (() => {
                  const blocks = groupOptions(filtered);
                  return blocks.map((block, gi) => (
                    <div key={block.group ?? `b-${gi}`}>
                      {block.group ? (
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: t.text.tertiary.default,
                            padding: '6px 8px 4px',
                          }}
                        >
                          {block.group}
                        </div>
                      ) : null}
                      {block.items.map((opt) => (
                        <OptionRow
                          key={opt.value}
                          t={t}
                          opt={opt}
                          selected={selected === opt.value}
                          onPick={() => {
                            setSelected(opt.value);
                            setOpen(false);
                            setSearch('');
                          }}
                        />
                      ))}
                      {gi < blocks.length - 1 ? (
                        <div style={{ height: 1, background: t.border.default.default, margin: '4px 0' }} />
                      ) : null}
                    </div>
                  ));
                })()
              : filtered.map((opt) => (
                  <OptionRow
                    key={opt.value}
                    t={t}
                    opt={opt}
                    selected={selected === opt.value}
                    onPick={() => {
                      setSelected(opt.value);
                      setOpen(false);
                      setSearch('');
                    }}
                  />
                ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OptionRow({
  t,
  opt,
  selected,
  onPick,
}: {
  t: VDSTheme;
  opt: DemoOpt;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onPick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        fontSize: 13,
        borderRadius: 6,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
        background: selected ? t.bg.fill.brandSubtle.default : 'transparent',
        color: selected ? t.text.brand.default : t.text.primary.default,
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = t.bg.surface.secondary.default;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = selected ? t.bg.fill.brandSubtle.default : 'transparent';
      }}
    >
      {opt.icon ? <span style={{ display: 'flex', flexShrink: 0 }}>{opt.icon}</span> : null}
      <span style={{ flex: 1 }}>{opt.label}</span>
      {selected ? <Check size={14} strokeWidth={2} aria-hidden /> : null}
    </button>
  );
}

export default function SelectDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [size, setSize] = useState<SelectSize>('md');
  const [optionsMode, setOptionsMode] = useState<OptionsMode>('basic');
  const [isSearchable, setIsSearchable] = useState(false);
  const [isClearable, setIsClearable] = useState(false);
  const [uiState, setUiState] = useState<UiState>('default');
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
        { id: 'principles-sl', label: 'Principles' },
        { id: 'anatomy-sl', label: 'Anatomy' },
        { id: 'sizes-sl', label: 'Sizes' },
        { id: 'states-sl', label: 'States' },
        { id: 'options-sl', label: 'Option types' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-sl', label: 'When to use' },
        { id: 'select-vs', label: 'Select vs. other inputs' },
        { id: 'dos-donts-sl', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'placeholder-sl', label: 'Placeholder text' },
        { id: 'option-labels-sl', label: 'Option labels' },
        { id: 'group-labels-sl', label: 'Group labels' },
        { id: 'helper-error-sl', label: 'Helper & error text' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'props-select-sl', label: 'Select props' },
        { id: 'type-option-sl', label: 'SelectOption type' },
        { id: 'examples-sl', label: 'Examples' },
        { id: 'a11y-sl', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const selectPropsRows = [
    { name: 'options', type: 'SelectOption[]', default: '—', description: 'List of options (required)', required: true as const },
    { name: 'value', type: 'string | null', default: '—', description: 'Controlled selected value' },
    { name: 'defaultValue', type: 'string', default: '—', description: 'Uncontrolled initial value' },
    { name: 'onChange', type: '(value: string | null) => void', default: '—', description: 'Called on selection change' },
    { name: 'placeholder', type: 'string', default: "'Select...'", description: 'Trigger placeholder text' },
    { name: 'label', type: 'string', default: '—', description: 'Field label above trigger' },
    { name: 'helperText', type: 'string', default: '—', description: 'Helper text below trigger' },
    { name: 'errorText', type: 'string', default: '—', description: 'Error message (activates error state)' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Trigger height' },
    { name: 'isSearchable', type: 'boolean', default: 'false', description: 'Shows search input in dropdown' },
    { name: 'isClearable', type: 'boolean', default: 'false', description: 'Shows X button to clear value' },
    { name: 'isDisabled', type: 'boolean', default: 'false', description: 'Disabled state' },
    { name: 'hasError', type: 'boolean', default: 'false', description: 'Error state (without message)' },
    { name: 'hasSuccess', type: 'boolean', default: 'false', description: 'Success state' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const codeBasic = `// Basic
<Select
  label="Framework"
  placeholder="Select a framework"
  options={[
    { value: 'react',  label: 'React' },
    { value: 'vue',    label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'solid',  label: 'Solid' },
  ]}
  onChange={(val) => console.log(val)}
/>`;

  const codeSearch = `// With search + clearable
<Select
  label="Country"
  placeholder="Select a country"
  isSearchable
  isClearable
  options={countryOptions}
  onChange={setCountry}
/>`;

  const codeControlled = `// Controlled
<Select
  label="Plan"
  value={selectedPlan}
  onChange={setSelectedPlan}
  options={planOptions}
  helperText="You can change your plan at any time"
/>`;

  const codeErr = `// With error
<Select
  label="Billing currency"
  placeholder="Select currency"
  options={currencyOptions}
  hasError
  errorText="Please select a billing currency to continue"
/>`;

  const codeGrouped = `// Grouped options
<Select
  label="Tool"
  placeholder="Select a tool"
  isSearchable
  options={[
    { value: 'figma',   label: 'Figma',   group: 'Design' },
    { value: 'sketch',  label: 'Sketch',  group: 'Design' },
    { value: 'vscode',  label: 'VS Code', group: 'Code' },
    { value: 'cursor',  label: 'Cursor',  group: 'Code' },
  ]}
  onChange={setTool}
/>`;

  const codeIcons = `// With icons
<Select
  label="Language"
  placeholder="Select language"
  options={[
    { value: 'en', label: 'English',  icon: <Globe size={15} /> },
    { value: 'es', label: 'Español',  icon: <Globe size={15} /> },
    { value: 'fr', label: 'Français', icon: <Globe size={15} /> },
  ]}
/>`;

  const selectOptionType = `interface SelectOption {
  value: string
  label: string
  description?: string
  icon?: ReactNode
  isDisabled?: boolean
  group?: string
}`;

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Select
      </p>
      <h1 className="page-title">Select</h1>
      <p className="page-lead">
        Select lets users choose one option from a list. It replaces the native &lt;select&gt; element with a fully styled, accessible
        dropdown that supports search, grouping, and custom option rendering — while preserving all keyboard and screen reader
        behavior.
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
                  <LivePreviewSegmentRow
                    t={t}
                    label="Size"
                    options={['sm', 'md', 'lg']}
                    value={size}
                    onChange={(v) => setSize(v as SelectSize)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Options"
                    options={['basic', 'grouped', 'icons']}
                    value={optionsMode}
                    onChange={(v) => setOptionsMode(v as OptionsMode)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Searchable"
                    options={['off', 'on']}
                    value={isSearchable ? 'on' : 'off'}
                    onChange={(v) => setIsSearchable(v === 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Clearable"
                    options={['off', 'on']}
                    value={isClearable ? 'on' : 'off'}
                    onChange={(v) => setIsClearable(v === 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="State"
                    options={['default', 'error', 'success', 'disabled']}
                    value={uiState}
                    onChange={(v) => setUiState(v as UiState)}
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
              <DocSelectInteractive
                t={previewT}
                size={size}
                optionsMode={optionsMode}
                isSearchable={isSearchable}
                isClearable={isClearable}
                uiState={uiState}
              />
            </LivePreviewShell>
          </section>

          <section id="principles-sl" style={{ marginBottom: 48 }}>
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 16, minHeight: 140 }}>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: 200,
                          height: 36,
                          borderRadius: 8,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 10px',
                          fontSize: 12,
                          gap: 8,
                        }}
                      >
                        <span style={{ flex: 1, textAlign: 'left', color: t.text.tertiary.default }}>Choose…</span>
                        <ChevronDown size={16} color={t.icon.secondary.default} aria-hidden />
                      </div>
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginTop: 6 }}>Closed</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: 200,
                          borderRadius: 8,
                          border: `1px solid ${t.border.brand.default}`,
                          boxShadow: `0 0 0 3px ${t.bg.fill.brandSubtle.default}`,
                          background: t.bg.surface.primary.default,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', fontSize: 12, gap: 8 }}>
                          <span style={{ flex: 1, textAlign: 'left', color: t.text.primary.default }}>Figma</span>
                          <ChevronUp size={16} color={t.icon.secondary.default} aria-hidden />
                        </div>
                        <div
                          style={{
                            borderTop: `1px solid ${t.border.default.default}`,
                            padding: 4,
                            textAlign: 'left',
                            fontSize: 11,
                            color: t.text.secondary.default,
                          }}
                        >
                          <div style={{ padding: '6px 8px', borderRadius: 6, background: t.bg.fill.brandSubtle.default, color: t.text.brand.default }}>Figma ✓</div>
                          <div style={{ padding: '6px 8px' }}>Sketch</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginTop: 6 }}>Open</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8, color: '#E8186D', fontSize: 10, fontWeight: 700 }}>
                    ⌒ 180°
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <ChevronDown size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>One choice, clearly made</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Select is for single selection from a predefined list. The trigger always shows the current value — or a placeholder when
                    nothing is selected. The dropdown appears on demand and closes after a choice is made.
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 6 }}>5 options</div>
                      <div style={{ borderRadius: 10, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 4 }}>
                        {['A', 'B', 'C', 'D', 'E'].map((x) => (
                          <div key={x} style={{ padding: '4px 8px', fontSize: 10 }}>
                            Option {x}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 6 }}>12+ options → add search</div>
                      <div style={{ borderRadius: 10, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default }}>
                        <div style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Search size={12} color={t.text.tertiary.default} aria-hidden />
                          <span style={{ fontSize: 10, color: t.text.tertiary.default }}>Search…</span>
                        </div>
                        <div style={{ padding: 4 }}>
                          <div style={{ padding: '4px 8px', fontSize: 10, background: t.bg.fill.brandSubtle.default, borderRadius: 6 }}>Match 1</div>
                          <div style={{ padding: '4px 8px', fontSize: 10 }}>Match 2</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Search size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Search above 7 options</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    When the list has more than 7 items, add search. Forcing users to scroll through long lists creates friction. Search
                    turns a guessing game into a direct action.
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
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ fontSize: 9, color: t.text.tertiary.default, width: '100%', textAlign: 'center' }}>Flat</div>
                    <div style={{ borderRadius: 8, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 4, minWidth: 120 }}>
                      {[1, 2, 3].map((i) => (
                        <div key={i} style={{ padding: '4px 6px', fontSize: 10 }}>
                          Item {i}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 9, color: t.text.tertiary.default, width: '100%', textAlign: 'center' }}>Grouped</div>
                    <div style={{ borderRadius: 8, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 4, minWidth: 120 }}>
                      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.06em', color: t.text.tertiary.default, padding: '4px 6px' }}>DESIGN</div>
                      <div style={{ padding: '4px 6px', fontSize: 10 }}>Figma</div>
                      <div style={{ padding: '4px 6px', fontSize: 10 }}>Sketch</div>
                      <div style={{ height: 1, background: t.border.default.default, margin: '4px 0' }} />
                      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.06em', color: t.text.tertiary.default, padding: '4px 6px' }}>CODE</div>
                      <div style={{ padding: '4px 6px', fontSize: 10 }}>VS Code</div>
                      <div style={{ padding: '4px 6px', fontSize: 10 }}>Cursor</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Tag size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Groups reduce cognitive load</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Option groups give context to long or heterogeneous lists. A group label is never selectable — it&apos;s a category marker.
                    Use them when options belong to distinct conceptual buckets.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-sl" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                position: 'relative',
                height: 340,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                backgroundColor: t.bg.surface.secondary.default,
                backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                overflow: 'hidden',
                padding: 16,
              }}
            >
              <div style={{ maxWidth: 400, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <AnnotationDot letter="A" />
                  <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Trigger</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 40,
                    paddingLeft: 12,
                    paddingRight: 10,
                    borderRadius: 8,
                    border: `1px solid ${t.border.brand.default}`,
                    boxShadow: `0 0 0 3px ${t.bg.fill.brandSubtle.default}`,
                    background: t.bg.surface.primary.default,
                    fontSize: 13,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                    <AnnotationDot letter="B" />
                    <span style={{ color: t.text.primary.default }}>Figma</span>
                  </span>
                  <AnnotationDot letter="C" />
                  <ChevronDown size={16} style={{ transform: 'rotate(180deg)' }} color={t.icon.secondary.default} aria-hidden />
                </div>
                <div style={{ marginTop: 10, borderRadius: 10, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, boxShadow: t.shadow.md }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 8, borderBottom: `1px solid ${t.border.default.default}` }}>
                      <AnnotationDot letter="D" />
                      <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Search</span>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, background: t.bg.surface.secondary.default, fontSize: 12 }}>
                        <Search size={14} aria-hidden />
                        Search…
                        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <X size={12} aria-hidden />
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8 }}>
                      <AnnotationDot letter="E" />
                      <div style={{ height: 1, flex: 1, background: t.border.default.default }} />
                    </div>
                  </div>
                  <div style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, background: t.bg.fill.brandSubtle.default, color: t.text.brand.default, fontSize: 13 }}>
                      <AnnotationDot letter="F" />
                      <span style={{ flex: 1 }}>Figma</span>
                      <Check size={14} aria-hidden />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, fontSize: 13 }}>
                      <AnnotationDot letter="G" />
                      <span style={{ flex: 1 }}>Sketch</span>
                    </div>
                    <div style={{ padding: '8px 12px', fontSize: 13 }}>Adobe XD</div>
                    <div style={{ padding: '8px 12px', fontSize: 13 }}>Framer</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <AnnotationDot letter="H" />
                  <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Dropdown panel</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <AnnotationDot letter="I" />
                  <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Clear (when clearable + value)</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.65, marginTop: 16, marginBottom: 0 }}>
              <strong style={{ color: t.text.primary.default }}>A</strong> → Trigger container (height per size, border, borderRadius 8px){' '}
              <strong style={{ color: t.text.primary.default }}>B</strong> → Value / placeholder (fontSize per size, primary if selected / tertiary if placeholder){' '}
              <strong style={{ color: t.text.primary.default }}>C</strong> → Chevron (16px, rotate 180° when open, transition 150ms){' '}
              <strong style={{ color: t.text.primary.default }}>D</strong> → Search input (sticky top, when isSearchable){' '}
              <strong style={{ color: t.text.primary.default }}>E</strong> → Search divider (1px border.default){' '}
              <strong style={{ color: t.text.primary.default }}>F</strong> → Selected option (bg brandSubtle, brand text, check right){' '}
              <strong style={{ color: t.text.primary.default }}>G</strong> → Default option (hover surface.secondary){' '}
              <strong style={{ color: t.text.primary.default }}>H</strong> → Dropdown panel (surface.primary, border, shadow.md, radius 10px, maxHeight 240px){' '}
              <strong style={{ color: t.text.primary.default }}>I</strong> → Clear button (X 14px on trigger when isClearable + selection).
            </p>
          </section>

          <section id="sizes-sl" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div
              style={{
                display: 'flex',
                gap: 24,
                flexWrap: 'wrap',
                justifyContent: 'center',
                padding: '24px 16px',
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                background: t.bg.surface.secondary.default,
                marginBottom: 20,
              }}
            >
              {(
                [
                  ['sm', '32px', 'Dense forms, compact toolbars'],
                  ['md', '40px', 'Default — most form contexts'],
                  ['lg', '48px', 'Prominent forms, onboarding flows'],
                ] as const
              ).map(([k, px, use]) => (
                <div key={k} style={{ textAlign: 'center', flex: '1 1 100px' }}>
                  <div
                    style={{
                      height: k === 'sm' ? 32 : k === 'md' ? 40 : 48,
                      width: 160,
                      margin: '0 auto',
                      borderRadius: 8,
                      border: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.primary.default,
                    }}
                  />
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text.primary.default, marginTop: 10 }}>
                    {k} · {px}
                  </div>
                  <div style={{ fontSize: 11, color: t.text.secondary.default, marginTop: 4, maxWidth: 160 }}>{use}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <span style={chipStyleB(t, { background: t.bg.surface.tertiary.default, color: t.text.secondary.default })}>--select-sm: 32px</span>
              <span style={chipStyleB(t, { background: t.bg.surface.tertiary.default, color: t.text.secondary.default })}>--select-md: 40px</span>
              <span style={chipStyleB(t, { background: t.bg.surface.tertiary.default, color: t.text.secondary.default })}>--select-lg: 48px</span>
            </div>
          </section>

          <section id="states-sl" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              States
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              <StateCard t={t} title="DEFAULT" token="color.border.default.default" desc="Trigger: border default." border={t.border.default.default} />
              <StateCard
                t={t}
                title="FOCUSED (open)"
                token="color.border.brand.focus"
                desc="Trigger: border brand + shadow ring."
                border={t.border.brand.default}
                ring={`0 0 0 3px ${t.bg.fill.brandSubtle.default}`}
                focusedOpen
              />
              <StateCard
                t={t}
                title="ERROR"
                token="color.border.danger.default"
                desc="AlertCircle on trigger."
                border="#D22232"
                icon={<AlertCircle size={14} color="#D22232" aria-hidden />}
                helper={{ text: 'Please select an option', color: '#D22232' }}
              />
              <StateCard
                t={t}
                title="SUCCESS"
                token="color.border.success.default"
                desc="CheckCircle2 on trigger."
                border="#0A8853"
                icon={<CheckCircle2 size={14} color="#0A8853" aria-hidden />}
                helper={{ text: 'Great choice', color: '#0A8853' }}
              />
              <StateCard t={t} title="DISABLED" token="color.interactive.disabled" desc="Tertiary bg, 50% opacity." disabled />
            </div>
          </section>

          <section id="options-sl" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Option types
            </h2>
            <p style={{ fontSize: 17, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              Options can be plain text, include a leading icon, show a description, or be grouped under a category header.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              <OptionTypeCard
                t={t}
                title="Plain"
                token="label only"
                body="Default option type. Label only. Use when options are self-explanatory and short."
              >
                <div style={{ borderRadius: 10, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 4, width: '100%', maxWidth: 220 }}>
                  {['Alpha', 'Bravo', 'Charlie', 'Delta'].map((x) => (
                    <div key={x} style={{ padding: '6px 8px', fontSize: 12, borderRadius: 6 }}>
                      {x}
                    </div>
                  ))}
                </div>
              </OptionTypeCard>
              <OptionTypeCard
                t={t}
                title="With icon"
                token="icon + label"
                body="Leading icon reinforces meaning. Use consistent icon sizing (16px) across all options in the list."
              >
                <div style={{ borderRadius: 10, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 4, width: '100%', maxWidth: 220 }}>
                  {[
                    { i: <Globe size={16} aria-hidden />, l: 'English' },
                    { i: <Palette size={16} aria-hidden />, l: 'Design' },
                    { i: <Users size={16} aria-hidden />, l: 'Team' },
                    { i: <Building size={16} aria-hidden />, l: 'Org' },
                  ].map((row) => (
                    <div key={row.l} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', fontSize: 12, borderRadius: 6 }}>
                      {row.i}
                      {row.l}
                    </div>
                  ))}
                </div>
              </OptionTypeCard>
              <OptionTypeCard
                t={t}
                title="With description"
                token="label + description"
                body="Secondary description below the label. Use when options need context to differentiate (e.g., plan names with feature counts)."
              >
                <div style={{ borderRadius: 10, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 4, width: '100%', maxWidth: 240 }}>
                  {[
                    { t: 'Starter', d: 'Up to 3 seats' },
                    { t: 'Pro', d: 'Unlimited seats' },
                    { t: 'Enterprise', d: 'SSO + audit' },
                  ].map((row) => (
                    <div key={row.t} style={{ padding: '6px 8px', borderRadius: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>{row.t}</div>
                      <div style={{ fontSize: 11, color: t.text.tertiary.default }}>{row.d}</div>
                    </div>
                  ))}
                </div>
              </OptionTypeCard>
              <OptionTypeCard
                t={t}
                title="Grouped"
                token="group + options"
                body="Group headers are non-selectable. Use when options belong to distinct categories. Keep groups to 2–5 options each."
              >
                <div style={{ borderRadius: 10, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 4, width: '100%', maxWidth: 240 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: t.text.tertiary.default, padding: '6px 8px' }}>DESIGN</div>
                  <div style={{ padding: '6px 8px', fontSize: 12 }}>Figma</div>
                  <div style={{ padding: '6px 8px', fontSize: 12 }}>Sketch</div>
                  <div style={{ height: 1, background: t.border.default.default, margin: '4px 0' }} />
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: t.text.tertiary.default, padding: '6px 8px' }}>CODE</div>
                  <div style={{ padding: '6px 8px', fontSize: 12 }}>VS Code</div>
                  <div style={{ padding: '6px 8px', fontSize: 12 }}>Cursor</div>
                </div>
              </OptionTypeCard>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-sl" style={{ marginTop: 32, marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'rgba(10,136,83,0.04)', border: '1px solid rgba(10,136,83,0.2)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0A8853', marginBottom: 12, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} aria-hidden /> DO
                </div>
                {[
                  'Choose a country, language, or category from a predefined list',
                  'Select a plan or tier',
                  'Filter data by one dimension',
                  'Assign a role or status in a form',
                ].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(232,24,109,0.04)', border: '1px solid rgba(232,24,109,0.2)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#E8186D', marginBottom: 12, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <X size={14} aria-hidden /> DON&apos;T
                </div>
                {[
                  'Fewer than 4 options (use Radio — more direct)',
                  'Multiple selection (use MultiSelect or Checkbox group)',
                  'Options the user must compare visually',
                  'User-created dynamic options (use Combobox / creatable)',
                ].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="info" title="4 or fewer options → use Radio">
                When there are 4 or fewer options and space allows, Radio buttons are faster — the user sees all choices without opening a
                dropdown. Select hides options behind an interaction; Radio exposes them immediately.
              </Callout>
            </div>
          </section>

          <section id="select-vs" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Select vs. other inputs
            </h2>
            <div style={{ background: t.bg.surface.primary.default, borderRadius: 12, border: `1px solid ${t.border.default.default}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    {['COMPONENT', 'USE WHEN'].map((h) => (
                      <th key={h} style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Select', '5+ predefined options, single choice, limited space'],
                    ['Radio group', '≤4 options, all need to be visible simultaneously'],
                    ['Combobox', 'User can type a custom value, or fuzzy search needed'],
                    ['MultiSelect', 'Multiple items can be selected from the list'],
                  ].map((r) => (
                    <tr key={r[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>{r[0]}</td>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>{r[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="dos-donts-sl" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — always show a placeholder"
                  caption="“Select a country” in tertiary — users know what to pick."
                >
                  <div
                    style={{
                      width: 220,
                      height: 36,
                      borderRadius: 8,
                      border: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.primary.default,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      fontSize: 12,
                      color: t.text.tertiary.default,
                    }}
                  >
                    Select a country
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont t={t} ok={false} title="DON&apos;T — empty trigger" caption="No label — users don’t know what the field does.">
                  <div style={{ width: 220, height: 36, borderRadius: 8, border: `1px dashed ${t.border.default.default}`, background: t.bg.surface.tertiary.default }} />
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — label every Select"
                  caption="Visible field label “Language” + optional helper — never a bare control."
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>Language</div>
                    <div
                      style={{
                        width: 220,
                        height: 36,
                        borderRadius: 8,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                      }}
                    />
                    <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 4 }}>Optional helper</div>
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont t={t} ok={false} title="DON&apos;T — unlabeled control" caption="A Select floating in the form is ambiguous at a glance.">
                  <div
                    style={{
                      width: 220,
                      height: 36,
                      borderRadius: 8,
                      border: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.primary.default,
                    }}
                  />
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — search for long lists"
                  caption="~30 countries with search — manageable."
                >
                  <div style={{ fontSize: 11, color: t.text.secondary.default, textAlign: 'center' }}>Search + 30 options</div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — 80 options, no search"
                  caption="Long unsearchable lists make scrolling nearly useless."
                >
                  <div style={{ fontSize: 11, color: t.text.secondary.default, textAlign: 'center' }}>80 options · no search</div>
                </IllustratedDoDont>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="placeholder-sl" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Placeholder text
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Describe the action: &apos;Select a country&apos;, &apos;Choose a plan&apos;</li>
              <li>Never &apos;Select...&apos; alone — add the noun</li>
              <li>Sentence case, no punctuation</li>
            </ul>
          </section>
          <section id="option-labels-sl" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Option labels
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Concise: 1–3 words when possible</li>
              <li>Consistent grammatical form across all options</li>
              <li>Alphabetical order unless there&apos;s a meaningful hierarchy (e.g., plan tiers)</li>
            </ul>
          </section>
          <section id="group-labels-sl" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Group labels
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Short noun: &apos;Design tools&apos;, &apos;Languages&apos;, &apos;Regions&apos;</li>
              <li>Never selectable — purely organizational</li>
            </ul>
          </section>
          <section id="helper-error-sl" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
              Helper &amp; error text
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Helper: proactive guidance before interaction (&apos;This sets the timezone for all reports&apos;)</li>
              <li>Error: specific and actionable (&apos;Please select a billing currency to continue&apos;)</li>
            </ul>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="props-select-sl" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Select props
            </h3>
            <PropsTable props={selectPropsRows} />
          </section>
          <section id="type-option-sl" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              SelectOption type
            </h3>
            <CodeBlock code={selectOptionType} filename="types.ts" language="tsx" />
          </section>
          <section id="examples-sl" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={codeBasic} filename="Basic" language="tsx" />
              <CodeBlock code={codeSearch} filename="Search + clearable" language="tsx" />
              <CodeBlock code={codeControlled} filename="Controlled" language="tsx" />
              <CodeBlock code={codeErr} filename="With error" language="tsx" />
              <CodeBlock code={codeGrouped} filename="Grouped options" language="tsx" />
              <CodeBlock code={codeIcons} filename="With icons" language="tsx" />
            </div>
          </section>
          <section id="a11y-sl" style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              Select is built on a custom trigger + listbox pattern (not native &lt;select&gt;). The trigger has role=&apos;combobox&apos;,
              aria-expanded, aria-haspopup=&apos;listbox&apos;, and aria-controls pointing to the listbox. Each option has role=&apos;option&apos; and
              aria-selected. Keyboard: Space/Enter opens, Arrow Up/Down navigates options, Enter selects, Escape closes, Home/End jump to
              first/last option.
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
                Initial release. Select with single selection, search, clearable, grouped options, icon options, descriptions, 3 sizes, 5
                states, full ARIA combobox/listbox pattern.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
