'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Clock,
  Command,
  CornerDownLeft,
  FileText,
  Hash,
  Keyboard,
  Search,
  Settings,
  Star,
  User,
  X,
  Zap,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type CpVariant = 'default' | 'compact' | 'wide';

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
    background: t.bg.surface.tertiary.default,
    color: t.text.primary.default,
    fontFamily: 'var(--font-mono), monospace',
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 5,
    border: `1px solid ${t.border.default.default}`,
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

type DemoItem = {
  id: string;
  label: string;
  subtitle?: string;
  groupId: 'recent' | 'commands' | 'files';
  kbd?: string;
  kind: 'icon' | 'avatar';
  Icon?: typeof FileText;
};

const DEMO_GROUPS: { id: DemoItem['groupId']; label: string; Icon: typeof Clock }[] = [
  { id: 'recent', label: 'Recent', Icon: Clock },
  { id: 'commands', label: 'Commands', Icon: Zap },
  { id: 'files', label: 'Files', Icon: FileText },
];

const DEMO_ITEMS: DemoItem[] = [
  { id: 'd1', label: 'Dashboard overview', groupId: 'recent', kind: 'icon', Icon: FileText },
  { id: 'd2', label: 'Team settings', groupId: 'recent', kind: 'icon', Icon: Settings },
  { id: 'd3', label: 'Jane Lim', groupId: 'recent', kind: 'avatar' },
  { id: 'c1', label: 'Create new project', groupId: 'commands', kbd: '⌘N', kind: 'icon', Icon: Hash },
  { id: 'c2', label: 'Invite teammate', groupId: 'commands', kbd: '⌘I', kind: 'icon', Icon: User },
  { id: 'c3', label: 'Open settings', groupId: 'commands', kbd: '⌘,', kind: 'icon', Icon: Settings },
  { id: 'f1', label: 'Q1 Report.pdf', groupId: 'files', subtitle: 'Shared / Reports', kind: 'icon', Icon: FileText },
  { id: 'f2', label: 'Design tokens.json', groupId: 'files', subtitle: 'Design system', kind: 'icon', Icon: FileText },
];

function highlightLabel(label: string, query: string, t: VDSTheme): ReactNode {
  const q = query.trim().toLowerCase();
  if (!q) return label;
  const lower = label.toLowerCase();
  const i = lower.indexOf(q);
  if (i === -1) return label;
  return (
    <>
      {label.slice(0, i)}
      <span style={{ color: t.text.brand.default, fontWeight: 700 }}>{label.slice(i, i + q.length)}</span>
      {label.slice(i + q.length)}
    </>
  );
}

function AvatarXs({ t, label }: { t: VDSTheme; label: string }) {
  const initials = label
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: t.bg.fill.brandSubtle.default,
        color: t.text.brand.default,
        fontSize: 9,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function MiniSpinner({ t }: { t: VDSTheme }) {
  return (
    <svg width={20} height={20} viewBox="0 0 100 100" aria-hidden style={{ display: 'block' }}>
      <circle cx={50} cy={50} r={46} fill="none" stroke={t.border.default.default} strokeWidth={2.5} />
      <g
        style={{
          transformBox: 'fill-box',
          transformOrigin: '50px 50px',
          animation: 'docsSpinnerRotate 800ms linear infinite',
        }}
      >
        <circle
          cx={50}
          cy={50}
          r={46}
          fill="none"
          stroke={t.bg.fill.primary.default}
          strokeWidth={2.5}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="75 25"
        />
      </g>
    </svg>
  );
}

function buildFlatList(items: DemoItem[], query: string, groupsOn: boolean): DemoItem[] {
  const q = query.trim().toLowerCase();
  const filtered = items.filter((it) => it.label.toLowerCase().includes(q));
  if (!groupsOn) return filtered;
  const out: DemoItem[] = [];
  for (const g of DEMO_GROUPS) {
    const sub = filtered.filter((it) => it.groupId === g.id);
    out.push(...sub);
  }
  return out;
}

function CommandPaletteLive({
  t,
  variant,
  groupsOn,
  showFooter,
}: {
  t: VDSTheme;
  variant: CpVariant;
  groupsOn: boolean;
  showFooter: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hi, setHi] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredByGroup = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_ITEMS.filter((it) => it.label.toLowerCase().includes(q));
  }, [query]);

  const flat = useMemo(() => buildFlatList(DEMO_ITEMS, query, groupsOn), [query, groupsOn]);

  useEffect(() => {
    setHi(0);
  }, [query, groupsOn, open]);

  useEffect(() => {
    if (flat.length === 0) setHi(0);
    else if (hi >= flat.length) setHi(flat.length - 1);
  }, [flat.length, hi]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onPaletteKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        setQuery('');
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (flat.length === 0) return;
        setHi((i) => (i + 1) % flat.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (flat.length === 0) return;
        setHi((i) => (i - 1 + flat.length) % flat.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = flat[hi];
        if (item) {
          setOpen(false);
          setQuery('');
        }
      }
    },
    [open, flat, hi],
  );

  const panelW =
    variant === 'compact' ? 'min(480px, 90%)' : variant === 'wide' ? 'min(680px, 94%)' : 'min(560px, 90%)';
  const itemPad = variant === 'compact' ? '6px 8px' : '8px 10px';
  const labelSize = variant === 'compact' ? 12 : 13;
  const showSub = variant !== 'compact';

  const renderItem = (it: DemoItem, index: number, globalIndex: number) => {
    const highlighted = globalIndex === hi && open;
    const left =
      it.kind === 'avatar' ? (
        <AvatarXs t={t} label={it.label} />
      ) : it.Icon ? (
        <it.Icon size={16} color={t.icon.secondary.default} aria-hidden />
      ) : null;
    return (
      <button
        key={it.id + String(index)}
        type="button"
        onMouseEnter={() => setHi(globalIndex)}
        onClick={() => {
          setOpen(false);
          setQuery('');
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: itemPad,
          borderRadius: 8,
          border: 'none',
          background: highlighted ? t.bg.surface.secondary.default : 'transparent',
          cursor: 'pointer',
          transition: 'background 100ms',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        {variant === 'wide' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 0', minWidth: 0 }}>
              {left}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: labelSize, fontWeight: 600, color: t.text.primary.default }}>{it.label}</div>
                {showSub && it.subtitle ? (
                  <div style={{ fontSize: 11, color: t.text.tertiary.default, marginTop: 2 }}>{it.subtitle}</div>
                ) : null}
              </div>
            </div>
            <div
              style={{
                flex: '1 1 0',
                borderLeft: `1px solid ${t.border.default.default}`,
                paddingLeft: 12,
                minHeight: 36,
                display: 'flex',
                alignItems: 'center',
                fontSize: 11,
                color: t.text.tertiary.default,
              }}
            >
              Preview
            </div>
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {it.kbd ? (
                <kbd style={chipStyleB(t)}>{it.kbd}</kbd>
              ) : (
                <ChevronRight size={14} color={t.text.tertiary.default} aria-hidden />
              )}
            </div>
          </>
        ) : (
          <>
            {left}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: labelSize, fontWeight: 600, color: t.text.primary.default }}>{it.label}</div>
              {showSub && it.subtitle ? (
                <div style={{ fontSize: 11, color: t.text.tertiary.default, marginTop: 2 }}>{it.subtitle}</div>
              ) : null}
            </div>
            {it.kbd ? (
              <kbd style={chipStyleB(t)}>{it.kbd}</kbd>
            ) : (
              <ChevronRight size={14} color={t.text.tertiary.default} aria-hidden />
            )}
          </>
        )}
      </button>
    );
  };

  let gi = 0;

  return (
    <div
      style={{ position: 'relative', width: '100%', minHeight: 440, boxSizing: 'border-box' }}
      onKeyDown={onPaletteKeyDown}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 440, padding: 24 }}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: t.bg.surface.primary.default,
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 13,
            color: t.text.tertiary.default,
            boxShadow: t.shadow.card,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <Search size={15} color={t.text.tertiary.default} aria-hidden />
          <span>Search or jump to...</span>
          <kbd
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 5,
              background: t.bg.surface.tertiary.default,
              border: `1px solid ${t.border.default.default}`,
              fontFamily: 'inherit',
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close command palette"
            onClick={() => {
              setOpen(false);
              setQuery('');
            }}
            style={{
              position: 'absolute',
              inset: 0,
              border: 'none',
              padding: 0,
              margin: 0,
              background: 'rgba(12,13,16,0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              cursor: 'default',
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            style={{
              position: 'absolute',
              left: '50%',
              top: '10%',
              transform: 'translateX(-50%)',
              width: panelW,
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              boxShadow: t.shadow.lg,
              overflow: 'hidden',
              zIndex: 2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderBottom: `1px solid ${t.border.default.default}`,
              }}
            >
              <Search size={18} color={t.text.tertiary.default} aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onPaletteKeyDown}
                placeholder="Search commands, files, people..."
                style={{
                  flex: 1,
                  fontSize: 15,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: t.text.primary.default,
                  fontFamily: 'inherit',
                }}
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <X size={20} color={t.text.tertiary.default} />
                </button>
              ) : null}
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto', padding: 6 }}>
              {groupsOn
                ? DEMO_GROUPS.map((g) => {
                    const sub = filteredByGroup.filter((it) => it.groupId === g.id);
                    if (sub.length === 0) return null;
                    const GIcon = g.Icon;
                    return (
                      <div key={g.id}>
                        <div
                          style={{
                            padding: '8px 10px 4px',
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: t.text.tertiary.default,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <GIcon size={12} aria-hidden />
                          {g.label}
                        </div>
                        {sub.map((it) => {
                          const idx = gi;
                          gi += 1;
                          return renderItem(it, idx, idx);
                        })}
                      </div>
                    );
                  })
                : flat.map((it, idx) => renderItem(it, idx, idx))}
              {!groupsOn && flat.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: t.text.tertiary.default }}>No matches</div>
              ) : null}
            </div>
            {showFooter ? (
              <div
                style={{
                  padding: '10px 16px',
                  borderTop: `1px solid ${t.border.default.default}`,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  fontSize: 11,
                  color: t.text.tertiary.default,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ArrowUp size={12} aria-hidden />
                  <ArrowDown size={12} aria-hidden /> Navigate
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CornerDownLeft size={12} aria-hidden /> Open
                </span>
                <span>Esc Close</span>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CpStaticRow({
  t,
  highlighted,
  icon,
  label,
  subtitle,
  right,
  compact,
}: {
  t: VDSTheme;
  highlighted?: boolean;
  icon: ReactNode;
  label: ReactNode;
  subtitle?: string;
  right?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: compact ? '6px 8px' : '8px 10px',
        borderRadius: 8,
        background: highlighted ? t.bg.surface.secondary.default : 'transparent',
      }}
    >
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: t.text.primary.default }}>{label}</div>
        {subtitle && !compact ? <div style={{ fontSize: 11, color: t.text.tertiary.default }}>{subtitle}</div> : null}
      </div>
      {right}
    </div>
  );
}

function GroupHeader({ t, label, icon }: { t: VDSTheme; label: string; icon: ReactNode }) {
  return (
    <div
      style={{
        padding: '8px 10px 4px',
        fontSize: 10,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: t.text.tertiary.default,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {icon}
      {label}
    </div>
  );
}

export default function CommandPaletteDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [variant, setVariant] = useState<CpVariant>('default');
  const [groupsCtl, setGroupsCtl] = useState<'off' | 'on'>('on');
  const [footerCtl, setFooterCtl] = useState<'off' | 'on'>('on');

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
        { id: 'principles-cp', label: 'Principles' },
        { id: 'anatomy-cp', label: 'Anatomy' },
        { id: 'variants-cp', label: 'Variants' },
        { id: 'groups-cp', label: 'Result groups' },
        { id: 'states-cp', label: 'States' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-cp', label: 'When to use' },
        { id: 'trigger-cp', label: 'Trigger patterns' },
        { id: 'dos-donts-cp', label: "Do & Don't" },
      ];
    }
    return [];
  }, [activeTab]);

  const commandPalettePropsRows = [
    { name: 'isOpen', type: 'boolean', default: '—', description: 'Controls visibility (required)', required: true as boolean },
    { name: 'onClose', type: '() => void', default: '—', description: 'Called on close (required)', required: true as boolean },
    { name: 'items', type: 'CommandItem[]', default: '—', description: 'All searchable items (required)', required: true as boolean },
    { name: 'groups', type: 'CommandGroup[]', default: '—', description: 'Group definitions' },
    {
      name: 'placeholder',
      type: 'string',
      default: "'Search commands, files, people...'",
      description: 'Input placeholder',
    },
    { name: 'variant', type: "'default' | 'compact' | 'wide'", default: "'default'", description: 'Panel width' },
    { name: 'onSelect', type: '(item: CommandItem) => void', default: '—', description: 'Item selection handler' },
    { name: 'isAsync', type: 'boolean', default: 'false', description: 'Shows loading while searching' },
    {
      name: 'onSearch',
      type: '(query: string) => Promise<CommandItem[]>',
      default: '—',
      description: 'Async search handler',
    },
    { name: 'recentItems', type: 'CommandItem[]', default: '[]', description: 'Pre-loaded recent items' },
    { name: 'showFooter', type: 'boolean', default: 'true', description: 'Keyboard hints footer' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const codeBasic = `// Basic setup with keyboard shortcut
const [isOpen, setIsOpen] = useState(false)

// Register ⌘K / Ctrl+K
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setIsOpen(prev => !prev)
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])

// Trigger button
<button onClick={() => setIsOpen(true)}
  style={{ display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 14px', borderRadius: 8, border: \`1px solid \${t.border.default.default}\`,
    background: t.bg.surface.primary.default, cursor: 'pointer' }}>
  <Search size={15} color={t.text.tertiary.default} />
  <span style={{ fontSize: 13, color: t.text.tertiary.default }}>Search or jump to...</span>
  <kbd style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 5,
    background: t.bg.surface.tertiary.default, border: \`1px solid \${t.border.default.default}\` }}>
    ⌘K
  </kbd>
</button>`;

  const codePalette = `// Command palette
<CommandPalette
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  groups={[
    { id: 'recent',   label: 'Recent',   icon: <Clock size={12} />,    priority: 0 },
    { id: 'commands', label: 'Commands', icon: <Zap size={12} />,      priority: 1 },
    { id: 'pages',    label: 'Pages',    icon: <Hash size={12} />,     priority: 2 },
    { id: 'files',    label: 'Files',    icon: <FileText size={12} />, priority: 3 },
  ]}
  recentItems={recentItems}
  items={[
    { id: 'create-project', label: 'Create new project', group: 'commands',
      icon: <Hash size={16} />, kbd: '⌘N', onSelect: openCreateDialog },
    { id: 'invite',         label: 'Invite teammate',    group: 'commands',
      icon: <User size={16} />, kbd: '⌘I', onSelect: openInviteDialog },
    { id: 'settings',       label: 'Open settings',      group: 'commands',
      icon: <Settings size={16} />, kbd: '⌘,', href: '/settings' },
    { id: 'dashboard',      label: 'Dashboard',          group: 'pages',
      icon: <Hash size={16} />, href: '/dashboard' },
    { id: 'team',           label: 'Team',               group: 'pages',
      icon: <Hash size={16} />, href: '/team' },
  ]}
  onSelect={(item) => {
    if (item.href) router.push(item.href)
    else item.onSelect?.()
    setIsOpen(false)
  }}
/>`;

  const codeAsync = `// Async search (server-side)
<CommandPalette
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  items={[]} // base items empty
  isAsync
  onSearch={async (query) => {
    const results = await searchAPI(query)
    return results.map(r => ({ id: r.id, label: r.title, group: r.type }))
  }}
  onSelect={handleSelect}
/>`;

  const codeTypes = `interface CommandItem {
  id: string
  label: string
  subtitle?: string
  group?: string
  icon?: ReactNode
  kbd?: string         // e.g. '⌘N', '⌘,'
  onSelect?: () => void
  href?: string        // navigates on select
}

interface CommandGroup {
  id: string
  label: string        // displayed as group header
  icon?: ReactNode     // optional icon in header
  priority?: number    // lower = shown first
}`;

  return (
    <div className="docs-page-with-toc">
      <style>{`
        @keyframes docsSpinnerRotate {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p className="breadcrumb">
        Components{' '}
        <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Command Palette
      </p>
      <h1 className="page-title">Command Palette</h1>
      <p className="page-lead">
        The command palette is a universal search and action interface. Triggered by a keyboard shortcut, it lets users navigate, search, and
        execute actions without reaching for the mouse. It&apos;s the power-user feature that makes complex products feel fast — and one of the
        clearest signals that a product is built for serious work.
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
                    options={['default', 'compact', 'wide']}
                    value={variant}
                    onChange={(v) => setVariant(v as CpVariant)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Groups"
                    options={['off', 'on']}
                    value={groupsCtl}
                    onChange={(v) => setGroupsCtl(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show footer"
                    options={['off', 'on']}
                    value={footerCtl}
                    onChange={(v) => setFooterCtl(v as 'off' | 'on')}
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
              <CommandPaletteLive
                t={previewT}
                variant={variant}
                groupsOn={groupsCtl === 'on'}
                showFooter={footerCtl === 'on'}
              />
            </LivePreviewShell>
          </section>

          <section id="principles-cp" style={{ marginBottom: 48 }}>
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
                <div style={{ ...dottedZone(t, 200), flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Keyboard size={28} color={t.text.tertiary.default} aria-hidden />
                    <span style={{ fontSize: 18, color: t.text.primary.default }}>⌘</span>
                    <span style={{ fontSize: 18, color: t.text.primary.default }}>K</span>
                    <ChevronRight size={16} color={t.text.tertiary.default} aria-hidden />
                    <div
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      Palette
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ height: 6, width: 48, background: t.bg.fill.primary.default, borderRadius: 3 }} />
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginTop: 4 }}>0ms</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ height: 6, width: 48, background: t.bg.fill.brandSubtle.default, borderRadius: 3 }} />
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginTop: 4 }}>80ms</div>
                    </div>
                    <span style={{ ...chipStyleB(t), fontSize: 10 }}>&lt; 100ms</span>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Command size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Speed is the feature</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    The command palette must open instantly — under 100ms. Any perceptible delay defeats its purpose. Users invoke it
                    mid-thought, expecting immediate response. A slow command palette trains users to stop using it.
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
                <div style={{ ...dottedZone(t, 200), gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 8, color: t.text.tertiary.default }}>
                    <span>App › Settings › Team › Permissions</span>
                    <span style={{ color: t.text.brand.default, fontWeight: 700 }}>5 clicks</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        fontSize: 9,
                        fontWeight: 600,
                      }}
                    >
                      permissions
                    </div>
                    <span style={{ fontSize: 9, color: t.text.brand.default, fontWeight: 700 }}>1 action</span>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Search size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Flattens navigation depth</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    The command palette is a shortcut to any depth. A user who knows the name of what they want should never need to navigate a
                    tree to find it. Every action, page, and setting should be discoverable through search — regardless of where it lives in the
                    hierarchy.
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
                <div style={{ ...dottedZone(t, 200), flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default }}>Recent</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['A', 'B', 'C'].map((x) => (
                      <span key={x} style={{ padding: '4px 8px', borderRadius: 6, background: t.bg.surface.tertiary.default, fontSize: 9 }}>
                        {x}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default }}>Favorites</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['★1', '★2'].map((x) => (
                      <span key={x} style={{ padding: '4px 8px', borderRadius: 6, background: t.bg.fill.brandSubtle.default, fontSize: 9 }}>
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Star size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Learns from the user</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A great command palette adapts to each user. Surface recently used commands at the top. Promote frequently used items.
                    Learn from selection patterns. The palette should feel like it knows the user — not like a static directory.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-cp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                position: 'relative',
                height: 380,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                ...dottedZone(t, 380),
                padding: 16,
              }}
            >
              <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, zIndex: 1 }}>
                <AnnotationDot letter="A" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>Panel</span>
              </div>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 28 }}>
                <div style={{ width: 'min(420px, 100%)', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '50%', top: -8, transform: 'translate(-50%, -100%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>B · input</span>
                    <AnnotationDot letter="B" />
                  </div>
                  <div
                    style={{
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 14,
                      boxShadow: t.shadow.lg,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        borderBottom: `1px solid ${t.border.default.default}`,
                        position: 'relative',
                      }}
                    >
                      <Search size={18} color={t.text.tertiary.default} aria-hidden />
                      <span style={{ flex: 1, fontSize: 15, color: t.text.tertiary.default }}>Search commands, files, people...</span>
                      <div style={{ position: 'absolute', right: 44, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AnnotationDot letter="C" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#E8186D' }}>clear</span>
                      </div>
                      <X size={20} color={t.text.tertiary.default} aria-hidden />
                    </div>
                    <div style={{ padding: 6 }}>
                      <GroupHeader t={t} label="Recent" icon={<Clock size={12} aria-hidden />} />
                      <CpStaticRow
                        t={t}
                        icon={<FileText size={16} color={t.icon.secondary.default} aria-hidden />}
                        label="Dashboard overview"
                        right={<ChevronRight size={14} color={t.text.tertiary.default} aria-hidden />}
                      />
                      <CpStaticRow
                        t={t}
                        highlighted
                        icon={<Settings size={16} color={t.icon.secondary.default} aria-hidden />}
                        label="Team settings"
                        right={<div style={{ width: 48, height: 12, background: t.bg.surface.tertiary.default, borderRadius: 4 }} aria-hidden />}
                      />
                      <CpStaticRow
                        t={t}
                        icon={<AvatarXs t={t} label="Jane Lim" />}
                        label="Jane Lim"
                        right={<ChevronRight size={14} color={t.text.tertiary.default} aria-hidden />}
                      />
                      <GroupHeader t={t} label="Commands" icon={<Zap size={12} aria-hidden />} />
                      <CpStaticRow
                        t={t}
                        icon={<Hash size={16} color={t.icon.secondary.default} aria-hidden />}
                        label="Create new project"
                        right={<kbd style={chipStyleB(t)}>⌘N</kbd>}
                      />
                      <CpStaticRow
                        t={t}
                        icon={<User size={16} color={t.icon.secondary.default} aria-hidden />}
                        label="Invite teammate"
                        right={<kbd style={chipStyleB(t)}>⌘I</kbd>}
                      />
                    </div>
                    <div
                      style={{
                        padding: '10px 16px',
                        borderTop: `1px solid ${t.border.default.default}`,
                        fontSize: 11,
                        color: t.text.tertiary.default,
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap',
                        position: 'relative',
                      }}
                    >
                      <span style={{ position: 'absolute', left: -6, bottom: -22, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AnnotationDot letter="I" />
                      </span>
                      [↑↓] Navigate · [↵] Open · [Esc] Close
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="variants-cp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                {
                  title: 'Default',
                  chip: 'variant: default',
                  desc: 'Standard width (560px). The go-to for most apps. Comfortable reading width for labels and subtitles.',
                  w: 560,
                  compact: false,
                  wide: false,
                },
                {
                  title: 'Compact',
                  chip: 'variant: compact',
                  desc: 'Narrower (480px), denser items. Use in apps with simpler command sets where labels are short and self-explanatory.',
                  w: 480,
                  compact: true,
                  wide: false,
                },
                {
                  title: 'Wide',
                  chip: 'variant: wide',
                  desc: 'Wider (680px) with a preview panel on the right. Use when results benefit from a preview — files, users, pages.',
                  w: 680,
                  compact: false,
                  wide: true,
                },
              ].map((v) => (
                <div
                  key={v.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 200), padding: 12 }}>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: v.w,
                        background: t.bg.surface.primary.default,
                        border: `1px solid ${t.border.default.default}`,
                        borderRadius: 14,
                        boxShadow: t.shadow.lg,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          padding: '12px 16px',
                          borderBottom: `1px solid ${t.border.default.default}`,
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                        }}
                      >
                        <Search size={16} color={t.text.tertiary.default} aria-hidden />
                        <span style={{ fontSize: 13, color: t.text.tertiary.default }}>Search…</span>
                      </div>
                      <div style={{ padding: 6 }}>
                        <GroupHeader t={t} label="Recent" icon={<Clock size={12} aria-hidden />} />
                        {v.wide ? (
                          <>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'stretch',
                                padding: '8px 10px',
                                borderRadius: 8,
                                gap: 0,
                              }}
                            >
                              <div style={{ flex: '0 0 60%', display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                <FileText size={16} color={t.icon.secondary.default} aria-hidden />
                                <span style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default }}>Q1 Report.pdf</span>
                              </div>
                              <div
                                style={{
                                  flex: '0 0 40%',
                                  borderLeft: `1px solid ${t.border.default.default}`,
                                  paddingLeft: 10,
                                  fontSize: 10,
                                  color: t.text.tertiary.default,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                Preview
                              </div>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'stretch',
                                padding: '8px 10px',
                                borderRadius: 8,
                                gap: 0,
                              }}
                            >
                              <div style={{ flex: '0 0 60%', display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                <User size={16} color={t.icon.secondary.default} aria-hidden />
                                <span style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default }}>Jane Lim</span>
                              </div>
                              <div
                                style={{
                                  flex: '0 0 40%',
                                  borderLeft: `1px solid ${t.border.default.default}`,
                                  paddingLeft: 10,
                                  fontSize: 10,
                                  color: t.text.tertiary.default,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                Preview
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <CpStaticRow
                              compact={v.compact}
                              t={t}
                              icon={<FileText size={16} color={t.icon.secondary.default} aria-hidden />}
                              label="Item one"
                              right={<ChevronRight size={14} color={t.text.tertiary.default} aria-hidden />}
                            />
                            <CpStaticRow
                              compact={v.compact}
                              t={t}
                              icon={<Settings size={16} color={t.icon.secondary.default} aria-hidden />}
                              label="Item two"
                              subtitle={v.compact ? undefined : 'Subtitle'}
                              right={<kbd style={chipStyleB(t)}>⌘K</kbd>}
                            />
                          </>
                        )}
                      </div>
                      <div style={{ padding: '8px 12px', borderTop: `1px solid ${t.border.default.default}`, fontSize: 10, color: t.text.tertiary.default }}>
                        ↑↓ · ↵ · Esc
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>{v.title}</div>
                    <span style={chipStyleB(t, { marginBottom: 8, display: 'inline-block' })}>{v.chip}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '8px 0 0' }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="groups-cp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Result groups
            </h2>
            <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.65, marginBottom: 16, maxWidth: 720 }}>
              Grouping results reduces the cognitive load of scanning a long list. Groups give context — the user knows why an item appears.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {[
                {
                  title: 'Recent',
                  chip: 'group: recent',
                  desc: 'Last 3–5 accessed items. Always first. Reduces keystrokes for repetitive workflows.',
                  head: <Clock size={12} aria-hidden />,
                  rows: (
                    <>
                      <CpStaticRow t={t} icon={<Clock size={14} color={t.icon.secondary.default} aria-hidden />} label="Open dashboard" />
                      <CpStaticRow t={t} icon={<Clock size={14} color={t.icon.secondary.default} aria-hidden />} label="Team settings" />
                      <CpStaticRow t={t} icon={<Clock size={14} color={t.icon.secondary.default} aria-hidden />} label="Billing" />
                    </>
                  ),
                },
                {
                  title: 'Commands',
                  chip: 'group: commands',
                  desc: 'App actions with keyboard shortcuts. Shows the shortcut as a kbd hint. Teaches users the shortcuts over time.',
                  head: <Zap size={12} aria-hidden />,
                  rows: (
                    <>
                      <CpStaticRow t={t} icon={<Zap size={16} color={t.icon.secondary.default} aria-hidden />} label="New doc" right={<kbd style={chipStyleB(t)}>⌘N</kbd>} />
                      <CpStaticRow t={t} icon={<Zap size={16} color={t.icon.secondary.default} aria-hidden />} label="Share" right={<kbd style={chipStyleB(t)}>⌘S</kbd>} />
                      <CpStaticRow t={t} icon={<Zap size={16} color={t.icon.secondary.default} aria-hidden />} label="Find" right={<kbd style={chipStyleB(t)}>⌘F</kbd>} />
                    </>
                  ),
                },
                {
                  title: 'Navigation',
                  headerLabel: 'Pages',
                  chip: 'group: navigation',
                  desc: 'App pages and sections. Use ChevronRight to signal navigation (vs. actions that execute in place).',
                  head: <Hash size={12} aria-hidden />,
                  rows: (
                    <>
                      <CpStaticRow t={t} icon={<Hash size={16} color={t.icon.secondary.default} aria-hidden />} label="Overview" right={<ChevronRight size={14} color={t.text.tertiary.default} aria-hidden />} />
                      <CpStaticRow t={t} icon={<Hash size={16} color={t.icon.secondary.default} aria-hidden />} label="Settings" right={<ChevronRight size={14} color={t.text.tertiary.default} aria-hidden />} />
                      <CpStaticRow t={t} icon={<Hash size={16} color={t.icon.secondary.default} aria-hidden />} label="Billing" right={<ChevronRight size={14} color={t.text.tertiary.default} aria-hidden />} />
                    </>
                  ),
                },
                {
                  title: 'Files & docs',
                  headerLabel: 'Files',
                  chip: 'group: files',
                  desc: "Documents, files, or records from the user's data. Subtitle shows path or last modified date.",
                  head: <FileText size={12} aria-hidden />,
                  rows: (
                    <>
                      <CpStaticRow t={t} icon={<FileText size={16} color={t.icon.secondary.default} aria-hidden />} label="Report.pdf" subtitle="/Finance" />
                      <CpStaticRow t={t} icon={<FileText size={16} color={t.icon.secondary.default} aria-hidden />} label="Notes.md" subtitle="Yesterday" />
                      <CpStaticRow t={t} icon={<FileText size={16} color={t.icon.secondary.default} aria-hidden />} label="Spec.docx" subtitle="/Product" />
                    </>
                  ),
                },
                {
                  title: 'People',
                  chip: 'group: people',
                  desc: 'Users, teammates, or contacts. Avatar instead of icon. Subtitle shows role or email.',
                  head: <User size={12} aria-hidden />,
                  rows: (
                    <>
                      <CpStaticRow t={t} icon={<AvatarXs t={t} label="Alex Kim" />} label="Alex Kim" subtitle="Admin" />
                      <CpStaticRow t={t} icon={<AvatarXs t={t} label="Sam Lee" />} label="Sam Lee" subtitle="Member" />
                      <CpStaticRow t={t} icon={<AvatarXs t={t} label="Pat Wu" />} label="Pat Wu" subtitle="Guest" />
                    </>
                  ),
                },
              ].map((g) => (
                <div
                  key={g.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 140), padding: 10, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                    <div style={{ width: '100%' }}>
                      <GroupHeader t={t} label={g.headerLabel ?? g.title} icon={g.head} />
                      {g.rows}
                    </div>
                  </div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <span style={chipStyleB(t, { marginBottom: 8, display: 'inline-block' })}>{g.chip}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '8px 0 0' }}>{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="states-cp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              States
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 160), padding: 10 }}>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 320,
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '10px 12px', borderBottom: `1px solid ${t.border.default.default}`, fontSize: 12, color: t.text.tertiary.default }}>
                      Search…
                    </div>
                    <div style={{ padding: 6 }}>
                      <GroupHeader t={t} label="Recent" icon={<Clock size={12} aria-hidden />} />
                      <CpStaticRow t={t} icon={<FileText size={16} color={t.icon.secondary.default} aria-hidden />} label="Dashboard" />
                      <CpStaticRow t={t} icon={<Settings size={16} color={t.icon.secondary.default} aria-hidden />} label="Team" />
                      <CpStaticRow t={t} icon={<User size={16} color={t.icon.secondary.default} aria-hidden />} label="Invite" />
                    </div>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <span style={chipStyleB(t, { marginBottom: 8, display: 'inline-block' })}>query: &apos;&apos;</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '8px 0 0' }}>
                    Default state before the user types. Show recent items and top commands. Never show a blank panel.
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
                <div style={{ ...dottedZone(t, 160), padding: 10 }}>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 320,
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '10px 12px', borderBottom: `1px solid ${t.border.default.default}`, fontSize: 13, color: t.text.primary.default }}>
                      set
                    </div>
                    <div style={{ padding: 6 }}>
                      <CpStaticRow
                        t={t}
                        icon={<Settings size={16} color={t.icon.secondary.default} aria-hidden />}
                        label={highlightLabel('Team settings', 'set', t)}
                      />
                      <CpStaticRow
                        t={t}
                        icon={<Hash size={16} color={t.icon.secondary.default} aria-hidden />}
                        label={highlightLabel('Asset settings', 'set', t)}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <span style={chipStyleB(t, { marginBottom: 8, display: 'inline-block' })}>query: &apos;set...&apos;</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '8px 0 0' }}>
                    Active search. Filter all groups in real time. Highlight the matching substring in each result label.
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
                <div style={{ ...dottedZone(t, 160), padding: 10 }}>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 320,
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '10px 12px', borderBottom: `1px solid ${t.border.default.default}`, fontSize: 13, color: t.text.primary.default }}>
                      xzqw
                    </div>
                    <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                      <Search size={28} color={t.text.tertiary.default} style={{ marginBottom: 8 }} aria-hidden />
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 4 }}>No results for &apos;xzqw&apos;</div>
                      <div style={{ fontSize: 12, color: t.text.secondary.default }}>Try a different search</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <span style={chipStyleB(t, { marginBottom: 8, display: 'inline-block' })}>query: no match</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '8px 0 0' }}>
                    Query returned nothing. Use the EmptyState sm component. Suggest broadening the search.
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
                <div style={{ ...dottedZone(t, 160), padding: 10 }}>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 320,
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '10px 12px', borderBottom: `1px solid ${t.border.default.default}`, fontSize: 12, color: t.text.tertiary.default }}>
                      Searching…
                    </div>
                    <div style={{ minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MiniSpinner t={t} />
                    </div>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <span style={chipStyleB(t, { marginBottom: 8, display: 'inline-block' })}>async: true</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '8px 0 0' }}>
                    For async search (server-side). Show a Spinner in the results area. Debounce the search request by 200ms.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-cp" style={{ marginTop: 32, marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                  DO
                </h3>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                  <li>Apps with many pages or actions (dashboards, admin panels, SaaS)</li>
                  <li>Power users who value speed over discoverability</li>
                  <li>Products with established keyboard shortcuts</li>
                  <li>When the navigation tree has more than three levels of depth</li>
                </ul>
              </div>
              <div>
                <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                  DON&apos;T
                </h3>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                  <li>Simple apps with only 5–8 pages (standard navigation is enough)</li>
                  <li>Mobile-first products where a physical keyboard is rarely available</li>
                  <li>As a substitute for global content search — use a dedicated Search experience</li>
                </ul>
              </div>
            </div>
            <Callout variant="tip" title="Teach the shortcut">
              The command palette only works if users know it exists. Show the trigger shortcut (⌘K) in the top nav search button, in onboarding,
              and in tooltips. Users who discover the shortcut become power users instantly.
            </Callout>
          </section>

          <section id="trigger-cp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Trigger patterns
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  title: 'Nav search button',
                  desc: 'Most common pattern. Always visible. Clicking it OR pressing ⌘K opens the palette.',
                  node: (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        fontSize: 13,
                        color: t.text.tertiary.default,
                      }}
                    >
                      <Search size={15} aria-hidden />
                      Search or jump to…
                      <kbd style={chipStyleB(t)}>⌘K</kbd>
                    </div>
                  ),
                },
                {
                  title: 'Floating trigger',
                  desc: 'For apps without a persistent nav bar. Floating button is always accessible but less discoverable.',
                  node: (
                    <button
                      type="button"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.fill.primary.default,
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'default',
                      }}
                      aria-label="Command palette"
                    >
                      <Command size={20} aria-hidden />
                    </button>
                  ),
                },
                {
                  title: 'Shortcut only',
                  desc: 'For power-user tools where the shortcut is the primary interface. Requires strong onboarding.',
                  node: (
                    <div style={{ fontSize: 12, color: t.text.secondary.default, padding: '8px 12px', borderRadius: 8, border: `1px dashed ${t.border.default.default}` }}>
                      Press <kbd style={chipStyleB(t)}>⌘K</kbd> anywhere
                    </div>
                  ),
                },
              ].map((p) => (
                <div
                  key={p.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 120), padding: 16 }}>{p.node}</div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>{p.title}</div>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="dos-donts-cp" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — always show something"
                  caption="Command palette without a query showing Recent plus top commands."
                >
                  <div style={{ width: 220, borderRadius: 10, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 8, fontSize: 10 }}>
                    <div style={{ color: t.text.tertiary.default, marginBottom: 6 }}>RECENT</div>
                    <div style={{ padding: 4 }}>Dashboard</div>
                    <div style={{ padding: 4 }}>Settings</div>
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — empty panel"
                  caption="Command palette without a query showing a completely empty panel — confusing; looks broken."
                >
                  <div style={{ width: 220, height: 72, borderRadius: 10, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default }} />
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — full keyboard control"
                  caption="ArrowUp/Down navigates items, Enter runs, Escape closes — everything works without the mouse."
                >
                  <div style={{ fontSize: 11, color: t.text.secondary.default }}>↑↓ Enter Esc</div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — mouse only"
                  caption="A palette that only works with the mouse removes the main benefit of the component."
                >
                  <div style={{ fontSize: 11, color: t.text.tertiary.default }}>Click only</div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — limit groups"
                  caption="Three well-defined groups (Recent · Commands · Files) with 3–5 items each."
                >
                  <div style={{ fontSize: 10, color: t.text.secondary.default }}>Recent · Commands · Files</div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — fragmented groups"
                  caption="Eight groups with one or two items each — fragmentation makes scanning harder."
                >
                  <div style={{ fontSize: 10, color: t.text.tertiary.default }}>8 × sparse groups</div>
                </IllustratedDoDont>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            Content
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Command labels
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>Verb + noun: &apos;Create project&apos;, &apos;Invite teammate&apos;, &apos;Open settings&apos;</li>
                <li>Navigation items: noun only — &apos;Dashboard&apos;, &apos;Team&apos;, &apos;Billing&apos;</li>
                <li>Consistent verb tense across all commands</li>
                <li>Max four words — if longer, the command is too specific</li>
              </ul>
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Group labels
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>Short noun, all caps: &apos;RECENT&apos;, &apos;COMMANDS&apos;, &apos;FILES&apos;, &apos;PEOPLE&apos;</li>
                <li>Max one word — groups are organizational, not descriptive</li>
                <li>Order: Recent → Commands → Navigation → Files → People</li>
              </ul>
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Placeholder text
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>&apos;Search commands, files, people...&apos; — list what&apos;s searchable</li>
                <li>Never just &apos;Search...&apos; — be specific about what the user will find</li>
              </ul>
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Empty state copy
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>Title: &apos;No results for [query]&apos; — include the query</li>
                <li>Description: &apos;Try a different search or browse all commands&apos;</li>
                <li>Never: &apos;No items found&apos; — too generic</li>
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              CommandPalette props
            </h3>
            <PropsTable props={commandPalettePropsRows} />
          </section>
          <section style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Types
            </h3>
            <CodeBlock code={codeTypes} filename="CommandItem & CommandGroup" language="tsx" />
          </section>
          <section style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={codeBasic} filename="Keyboard shortcut + trigger" language="tsx" />
              <CodeBlock code={codePalette} filename="CommandPalette" language="tsx" />
              <CodeBlock code={codeAsync} filename="Async search" language="tsx" />
            </div>
          </section>
          <section style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Keyboard navigation">
              CommandPalette implements full keyboard control: ArrowUp/Down moves highlight (wraps from last to first), Enter executes the
              highlighted item, Escape closes and returns focus to the trigger. Tab is trapped inside while open. The component registers a global
              keydown listener for ⌘K/Ctrl+K when isOpen is false.
            </Callout>
            <Callout variant="tip" title="Performance">
              For large item sets (500+), implement virtual scrolling in the results list. Filter items with a debounced search to avoid blocking
              the main thread. For async search, debounce the onSearch call by 200ms to reduce API requests.
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
                Initial release. CommandPalette with real-time filtering, grouped results, keyboard navigation (↑↓ Enter Esc), ⌘K trigger, async
                search support, recent items, 3 variants (default/compact/wide), substring match highlighting, empty state, loading state.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
