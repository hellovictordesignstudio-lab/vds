'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertCircle,
  ChevronRight,
  FileText,
  Filter,
  FolderOpen,
  Inbox,
  Package,
  Plus,
  RefreshCw,
  Search,
  Star,
  Upload,
  Users,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type EsVariant = 'blank' | 'no-results' | 'error' | 'no-access' | 'filtered';
type EsSize = 'sm' | 'md' | 'lg';
type IconStyle = 'circle' | 'square' | 'none';
type IconColor = 'default' | 'danger' | 'warning' | 'success' | 'neutral';

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

const SIZE_TOKENS: Record<
  EsSize,
  { icon: number; container: number; title: number; desc: number; maxW: number; iconMb: number }
> = {
  sm: { icon: 32, container: 56, title: 15, desc: 13, maxW: 280, iconMb: 16 },
  md: { icon: 48, container: 80, title: 18, desc: 14, maxW: 360, iconMb: 20 },
  lg: { icon: 64, container: 104, title: 22, desc: 15, maxW: 480, iconMb: 24 },
};

function iconContainerColors(t: VDSTheme, iconColor: IconColor): { bg: string; fg: string } {
  switch (iconColor) {
    case 'danger':
      return { bg: 'rgba(210,34,50,0.10)', fg: '#D22232' };
    case 'warning':
      return { bg: 'rgba(240,115,50,0.10)', fg: '#F07332' };
    case 'success':
      return { bg: 'rgba(10,136,83,0.10)', fg: '#0A8853' };
    case 'neutral':
      return { bg: t.bg.surface.tertiary.default, fg: t.text.tertiary.default };
    default:
      return { bg: t.bg.fill.brandSubtle.default, fg: t.text.brand.default };
  }
}

function PrimaryBtn({
  t,
  children,
  icon,
  compact,
}: {
  t: VDSTheme;
  children: ReactNode;
  icon?: ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: t.bg.fill.primary.default,
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'default',
        padding: compact ? '8px 14px' : '10px 16px',
        fontSize: compact ? 13 : 14,
        fontFamily: 'inherit',
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function GhostBtn({ t, children, icon, compact }: { t: VDSTheme; children: ReactNode; icon?: ReactNode; compact?: boolean }) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'transparent',
        color: t.text.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'default',
        padding: compact ? '8px 14px' : '10px 16px',
        fontSize: compact ? 13 : 14,
        fontFamily: 'inherit',
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function EmptyStateDemo({
  t,
  variant,
  size,
  iconStyle,
  showActions,
  showSecondaryLink,
  demoCopy,
  showContactOnError = true,
  showFilteredSecondary = true,
}: {
  t: VDSTheme;
  variant: EsVariant;
  size: EsSize;
  iconStyle: IconStyle;
  showActions: boolean;
  /** Blank variant: optional tertiary link below actions */
  showSecondaryLink?: boolean;
  /** Override default copy for documentation illustrations */
  demoCopy?: Partial<{ title: string; description: string; primary: string }>;
  /** Error variant: show Contact support link next to Refresh */
  showContactOnError?: boolean;
  /** Filtered variant: show Save this view (secondary ghost) */
  showFilteredSecondary?: boolean;
}) {
  const sz = SIZE_TOKENS[size];
  let iconColor: IconColor = 'default';
  let Icon = Inbox;
  let title = '';
  let desc = '';
  let primaryLabel = '';

  switch (variant) {
    case 'blank':
      Icon = Inbox;
      title = 'Nothing here yet';
      desc = 'This space is empty. Start by creating your first item.';
      primaryLabel = 'Create item';
      iconColor = 'default';
      break;
    case 'no-results':
      Icon = Search;
      title = 'No results found';
      desc = "We couldn't find anything matching your search. Try different keywords or clear your filters.";
      iconColor = 'default';
      break;
    case 'error':
      Icon = AlertCircle;
      title = 'Something went wrong';
      desc = 'We ran into an error loading this content. This is on us — try refreshing the page.';
      iconColor = 'danger';
      break;
    case 'no-access':
      Icon = AlertCircle;
      title = "You don't have access";
      desc = 'You need additional permissions to view this content. Contact your admin to request access.';
      iconColor = 'warning';
      break;
    case 'filtered':
      Icon = Filter;
      title = 'No matching results';
      desc = 'No items match your current filters. Try adjusting or clearing them to see more results.';
      iconColor = 'default';
      break;
    default:
      break;
  }

  if (demoCopy?.title) title = demoCopy.title;
  if (demoCopy?.description) desc = demoCopy.description;
  if (demoCopy?.primary) primaryLabel = demoCopy.primary;

  const { bg, fg } = iconContainerColors(t, iconColor);
  const radius = iconStyle === 'square' ? 12 : '50%';
  const iconEl = <Icon size={sz.icon} color={fg} aria-hidden />;

  const actionsRow = (() => {
    if (!showActions) return null;
    if (variant === 'blank') {
      const pl = primaryLabel || 'Create item';
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <PrimaryBtn t={t} icon={<Plus size={size === 'sm' ? 14 : 16} aria-hidden />} compact={size === 'sm'}>
            {pl}
          </PrimaryBtn>
        </div>
      );
    }
    if (variant === 'no-results') {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <GhostBtn t={t} compact={size === 'sm'}>
            Clear search
          </GhostBtn>
          <PrimaryBtn t={t} compact={size === 'sm'}>
            Browse all
          </PrimaryBtn>
        </div>
      );
    }
    if (variant === 'error') {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          <GhostBtn t={t} icon={<RefreshCw size={size === 'sm' ? 14 : 16} aria-hidden />} compact={size === 'sm'}>
            Refresh
          </GhostBtn>
          {showContactOnError ? (
            <button
              type="button"
              style={{
                fontSize: 13,
                color: t.text.brand.default,
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 500,
              }}
            >
              Contact support
            </button>
          ) : null}
        </div>
      );
    }
    if (variant === 'no-access') {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <PrimaryBtn t={t} compact={size === 'sm'}>
            Request access
          </PrimaryBtn>
        </div>
      );
    }
    if (variant === 'filtered') {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <PrimaryBtn t={t} compact={size === 'sm'}>
            Clear filters
          </PrimaryBtn>
          {showFilteredSecondary ? (
            <GhostBtn t={t} compact={size === 'sm'}>
              Save this view
            </GhostBtn>
          ) : null}
        </div>
      );
    }
    return null;
  })();

  return (
    <section
      role="status"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '40px 24px',
        width: '100%',
        maxWidth: sz.maxW + 80,
        boxSizing: 'border-box',
      }}
    >
      {iconStyle !== 'none' ? (
        <div
          style={{
            width: sz.container,
            height: sz.container,
            borderRadius: radius,
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: sz.iconMb,
            flexShrink: 0,
          }}
        >
          {iconEl}
        </div>
      ) : (
        <div style={{ marginBottom: sz.iconMb, color: fg, display: 'flex' }}>{iconEl}</div>
      )}
      <h2 style={{ fontSize: sz.title, fontWeight: 700, color: t.text.primary.default, margin: '0 0 8px', lineHeight: 1.25 }}>
        {title}
      </h2>
      <p
        style={{
          fontSize: sz.desc,
          color: t.text.secondary.default,
          lineHeight: 1.65,
          margin: '0 0 24px',
          maxWidth: sz.maxW,
          textAlign: 'center',
        }}
      >
        {desc}
      </p>
      {actionsRow}
      {variant === 'blank' && showActions && showSecondaryLink ? (
        <button
          type="button"
          style={{
            marginTop: 12,
            fontSize: 13,
            color: t.text.brand.default,
            textDecoration: 'underline',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            fontFamily: 'inherit',
          }}
        >
          Learn more
        </button>
      ) : null}
    </section>
  );
}

/** Static mini empty state for principle illustrations */
function MiniES({
  t,
  icon: Icon,
  title,
  desc,
  action,
  compact,
  iconColor = 'default',
}: {
  t: VDSTheme;
  icon: typeof Inbox;
  title: string;
  desc?: string;
  action?: string;
  compact?: boolean;
  iconColor?: IconColor;
}) {
  const { bg, fg } = iconContainerColors(t, iconColor);
  const ic = compact ? 20 : 24;
  const box = compact ? 40 : 48;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4, maxWidth: 120 }}>
      <div
        style={{
          width: box,
          height: box,
          borderRadius: '50%',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={ic} color={fg} aria-hidden />
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: t.text.primary.default, lineHeight: 1.3 }}>{title}</div>
      {desc ? <div style={{ fontSize: 8, color: t.text.secondary.default, lineHeight: 1.35 }}>{desc}</div> : null}
      {action ? (
        <div
          style={{
            fontSize: 8,
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 6,
            background: t.bg.fill.primary.default,
            color: '#FFF',
            marginTop: 2,
          }}
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}

export default function EmptyStateDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [variant, setVariant] = useState<EsVariant>('blank');
  const [size, setSize] = useState<EsSize>('md');
  const [iconStyle, setIconStyle] = useState<IconStyle>('circle');
  const [showActions, setShowActions] = useState<'off' | 'on'>('on');

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
        { id: 'principles-es', label: 'Principles' },
        { id: 'anatomy-es', label: 'Anatomy' },
        { id: 'variants-es', label: 'Variants' },
        { id: 'sizes-es', label: 'Sizes' },
        { id: 'contexts-es', label: 'In context' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-es', label: 'When to use' },
        { id: 'message-guide', label: 'Message framework' },
        { id: 'dos-donts-es', label: "Do & Don't" },
      ];
    }
    return [];
  }, [activeTab]);

  const emptyStatePropsRows = [
    { name: 'icon', type: 'ReactNode', default: '—', description: 'Icon element (recommended)' },
    { name: 'iconStyle', type: "'circle' | 'square' | 'none'", default: "'circle'", description: 'Icon container shape' },
    { name: 'iconColor', type: "'default' | 'danger' | 'warning' | 'success' | 'neutral'", default: "'default'", description: 'Icon container color' },
    { name: 'title', type: 'string', default: '—', description: 'Main heading (required)', required: true as boolean },
    { name: 'description', type: 'string', default: '—', description: 'Supporting text' },
    {
      name: 'primaryAction',
      type: '{ label: string; onClick: () => void; icon?: ReactNode }',
      default: '—',
      description: 'Primary CTA button',
    },
    {
      name: 'secondaryAction',
      type: '{ label: string; onClick: () => void }',
      default: '—',
      description: 'Secondary ghost button',
    },
    { name: 'link', type: '{ label: string; href: string }', default: '—', description: 'Tertiary text link' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Overall size' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
    { name: 'headingLevel', type: '2 | 3 | 4 | 5 | 6', default: '2', description: 'Heading level for the title (document hierarchy)' },
  ];

  const codeFirstRun = `// First-run empty state
<EmptyState
  icon={<Inbox size={48} />}
  title="Nothing here yet"
  description="This space is empty. Start by creating your first item to get going."
  primaryAction={{
    label: 'Create item',
    icon: <Plus size={16} />,
    onClick: () => openCreateDialog(),
  }}
/>`;

  const codeSearch = `// Search empty state
<EmptyState
  icon={<Search size={48} />}
  title={\`No results for "\${searchQuery}"\`}
  description="We couldn't find anything matching your search. Try different keywords or clear your filters."
  primaryAction={{ label: 'Browse all', onClick: clearSearch }}
  secondaryAction={{ label: 'Clear search', onClick: resetSearch }}
  size="sm"
/>`;

  const codeError = `// Error state
<EmptyState
  icon={<AlertCircle size={48} />}
  iconColor="danger"
  title="Something went wrong"
  description="We ran into an error loading this content. This is on us — try refreshing the page."
  primaryAction={{ label: 'Refresh', icon: <RefreshCw size={16} />, onClick: retry }}
  link={{ label: 'Contact support', href: '/support' }}
/>`;

  const codeNoAccess = `// No access
<EmptyState
  icon={<AlertCircle size={48} />}
  iconColor="warning"
  title="You don't have access"
  description="You need additional permissions to view this content. Contact your admin to request access."
  primaryAction={{ label: 'Request access', onClick: requestAccess }}
/>`;

  const codeTable = `// Inside a table (sm size)
<table>
  <thead>...</thead>
  <tbody>
    {rows.length === 0 ? (
      <tr>
        <td colSpan={columns.length}>
          <EmptyState
            icon={<FolderOpen size={32} />}
            title="No projects yet"
            description="Create your first project to get started."
            primaryAction={{ label: 'Create project', onClick: createProject }}
            size="sm"
          />
        </td>
      </tr>
    ) : (
      rows.map(row => <TableRow key={row.id} row={row} />)
    )}
  </tbody>
</table>`;

  const codeFiltered = `// Filtered empty state
<EmptyState
  icon={<Filter size={48} />}
  title="No matching results"
  description="No items match your current filters. Try adjusting or clearing them."
  primaryAction={{ label: 'Clear filters', onClick: clearFilters }}
  secondaryAction={{ label: 'Save this view', onClick: saveView }}
/>`;

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components{' '}
        <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Empty State
      </p>
      <h1 className="page-title">Empty State</h1>
      <p className="page-lead">
        Empty states appear when there&apos;s no content to display. They&apos;re one of the most overlooked moments in product design — and one
        of the most important. A good empty state explains why something is empty, reassures the user that nothing is broken, and guides them
        toward the next meaningful action.
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
                    options={['blank', 'no-results', 'error', 'no-access', 'filtered']}
                    value={variant}
                    onChange={(v) => setVariant(v as EsVariant)}
                  />
                  <LivePreviewSegmentRow t={t} label="Size" options={['sm', 'md', 'lg']} value={size} onChange={(v) => setSize(v as EsSize)} />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Icon style"
                    options={['circle', 'square', 'none']}
                    value={iconStyle}
                    onChange={(v) => setIconStyle(v as IconStyle)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show actions"
                    options={['off', 'on']}
                    value={showActions}
                    onChange={(v) => setShowActions(v as 'off' | 'on')}
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
              <div
                style={{
                  width: '100%',
                  minHeight: 400,
                  padding: 40,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EmptyStateDemo
                  t={previewT}
                  variant={variant}
                  size={size}
                  iconStyle={iconStyle}
                  showActions={showActions === 'on'}
                  showSecondaryLink={variant === 'blank' && showActions === 'on'}
                />
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-es" style={{ marginBottom: 48 }}>
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
                <div style={{ ...dottedZone(t, 200), flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Minimal</div>
                      <MiniES t={t} icon={Inbox} title="No data" compact />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Meaningful</div>
                      <MiniES
                        t={t}
                        icon={Inbox}
                        title="Nothing here yet"
                        desc="Create your first item to get started."
                        action="Create item"
                        compact
                      />
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Inbox size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Every empty state needs a next step</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    An empty state without an action is a dead end. The user arrived somewhere, found nothing, and has no idea what to do.
                    Always pair the empty state with at least one action — create, search, reset, or contact. The action transforms a
                    frustrating moment into an onboarding opportunity.
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
                <div style={{ ...dottedZone(t, 200), flexDirection: 'column', gap: 8, paddingTop: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default }}>Projects list</div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <MiniES t={t} icon={FolderOpen} title="Create your first project" action="Create" compact />
                    <MiniES
                      t={t}
                      icon={Search}
                      title="No results for 'acme'"
                      action="Clear search"
                      compact
                    />
                    <MiniES t={t} icon={AlertCircle} title="Could not load projects" action="Retry" compact iconColor="danger" />
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Search size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Context changes the message</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    The same empty list needs different messages depending on why it&apos;s empty. A first-time user needs encouragement. A
                    failed search needs guidance. A network error needs reassurance. Match the empty state to the cause — not just the
                    component.
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
                <div style={{ ...dottedZone(t, 200), gap: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>Branded</div>
                    <svg width={72} height={56} viewBox="0 0 72 56" aria-hidden style={{ marginBottom: 6 }}>
                      <ellipse cx={36} cy={40} rx={28} ry={8} fill={t.bg.fill.brandSubtle.default} />
                      <circle cx={36} cy={22} r={14} fill={t.text.brand.default} opacity={0.35} />
                      <path d="M28 30 L44 30 L40 38 L32 38 Z" fill={t.text.brand.default} />
                    </svg>
                    <div style={{ fontSize: 9, fontWeight: 700, color: t.text.primary.default }}>You&apos;re all caught up</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>Generic</div>
                    <MiniES t={t} icon={Package} title="No items" compact />
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Star size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Personality makes it memorable</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Empty states are a rare opportunity to show brand voice and personality. A clever illustration or a human tone in the copy
                    turns a blank screen into a moment the user remembers positively. This is one of the few UI moments where delight is always
                    appropriate.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-es" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                position: 'relative',
                height: 320,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                ...dottedZone(t, 320),
                padding: 16,
              }}
            >
              <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AnnotationDot letter="F" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>Wrapper · flex column · center · padding</span>
              </div>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 24 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div style={{ position: 'absolute', left: '50%', top: -6, transform: 'translate(-50%, -100%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', whiteSpace: 'nowrap' }}>A · icon container</span>
                    <AnnotationDot letter="A" />
                  </div>
                  <div style={{ position: 'absolute', right: -8, top: 72, transform: 'translateX(100%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', whiteSpace: 'nowrap' }}>B · title</span>
                    <AnnotationDot letter="B" />
                  </div>
                  <div style={{ position: 'absolute', left: -8, top: 120, transform: 'translateX(-100%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="C" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', whiteSpace: 'nowrap' }}>C · description</span>
                  </div>
                  <div style={{ position: 'absolute', left: '50%', bottom: 44, transform: 'translate(-50%, 100%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="D" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', whiteSpace: 'nowrap' }}>D · primary action</span>
                  </div>
                  <div style={{ position: 'absolute', left: '50%', bottom: -4, transform: 'translate(-50%, 100%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="E" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', whiteSpace: 'nowrap' }}>E · secondary link (optional)</span>
                  </div>
                  <EmptyStateDemo
                    t={t}
                    variant="blank"
                    size="md"
                    iconStyle="circle"
                    showActions
                    showSecondaryLink
                  />
                </div>
              </div>
            </div>
          </section>

          <section id="variants-es" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {[
                {
                  title: 'Blank (first use)',
                  chip: 'variant: blank',
                  desc: 'First-time empty state. The user has never created anything. Frame it as an invitation, not a void. Lead with the benefit of creating.',
                  v: 'blank' as const,
                },
                {
                  title: 'No results',
                  chip: 'variant: no-results',
                  desc: "Search or filter returned nothing. Always offer a way to reset — 'Clear search', 'Remove filters'. Never leave users without an escape.",
                  v: 'no-results' as const,
                },
                {
                  title: 'Error',
                  chip: 'variant: error',
                  desc: "Content failed to load. Take responsibility ('This is on us'), reassure the user their data is safe, and offer a retry action.",
                  v: 'error' as const,
                },
                {
                  title: 'No access',
                  chip: 'variant: no-access',
                  desc: "User lacks permission. Explain what they're missing access to and how to get it. Never leave them wondering if something is broken.",
                  v: 'no-access' as const,
                },
                {
                  title: 'Filtered',
                  chip: 'variant: filtered',
                  desc: 'Active filters produced no results. Different from a search empty state — the user set up a view deliberately. Offer to clear filters or save the (empty) view.',
                  v: 'filtered' as const,
                },
              ].map((item) => (
                <div
                  key={item.v}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 200), padding: 12 }}>
                    <EmptyStateDemo
                      t={t}
                      variant={item.v}
                      size="sm"
                      iconStyle="circle"
                      showActions
                      showContactOnError={item.v !== 'error'}
                      showFilteredSecondary={item.v !== 'filtered'}
                    />
                  </div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{item.title}</div>
                    <span style={chipStyleB(t, { marginBottom: 10 })}>{item.chip}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="sizes-es" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {(
                [
                  { k: 'sm' as const, line: 'Inside cards, table empty rows, compact panels' },
                  { k: 'md' as const, line: 'Default — page sections, list views, dashboards' },
                  { k: 'lg' as const, line: 'Full page empty states, first-run experiences' },
                ] as const
              ).map((row) => (
                <div
                  key={row.k}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 220), padding: 8 }}>
                    <EmptyStateDemo t={t} variant="blank" size={row.k} iconStyle="circle" showActions />
                  </div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: t.text.primary.default, marginBottom: 6, fontFamily: 'var(--font-mono), monospace' }}>
                      {row.k}{' '}
                      <span style={{ fontWeight: 500, color: t.text.secondary.default, fontFamily: 'inherit' }}>
                        icon {SIZE_TOKENS[row.k].icon}px · title {SIZE_TOKENS[row.k].title}px
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{row.line}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="contexts-es" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              In context
            </h2>
            <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.65, marginBottom: 20, maxWidth: 720 }}>
              Empty states adapt to their container. Here are the most common placement patterns.
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
                <div style={{ ...dottedZone(t, 160), padding: 8, alignItems: 'stretch' }}>
                  <div style={{ width: '100%', maxWidth: 240, border: `1px solid ${t.border.default.default}`, borderRadius: 8, overflow: 'hidden', background: t.bg.surface.primary.default }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ background: t.bg.surface.secondary.default }}>
                          <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.secondary.default }}>Project</th>
                          <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.secondary.default }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={2} style={{ padding: 0, verticalAlign: 'middle' }}>
                            <div style={{ transform: 'scale(0.92)', transformOrigin: 'top center' }}>
                              <EmptyStateDemo
                                t={t}
                                variant="blank"
                                size="sm"
                                iconStyle="circle"
                                showActions
                                demoCopy={{
                                  title: 'No projects yet',
                                  description: 'Create your first project to get started.',
                                  primary: 'Create project',
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Inside a Table</div>
                  <span style={chipStyleB(t, { marginBottom: 10 })}>size: sm</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>
                    Replace the empty tbody with an EmptyState. Keep the thead visible so the user understands what columns would appear.
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
                <div style={{ ...dottedZone(t, 160), padding: 12 }}>
                  <div style={{ width: '100%', maxWidth: 220, border: `1px solid ${t.border.default.default}`, borderRadius: 10, overflow: 'hidden', background: t.bg.surface.primary.default }}>
                    <div style={{ padding: '10px 12px', borderBottom: `1px solid ${t.border.default.default}`, fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>Recent activity</div>
                    <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}>
                      <EmptyStateDemo
                        t={t}
                        variant="blank"
                        size="sm"
                        iconStyle="circle"
                        showActions={false}
                        demoCopy={{
                          title: 'No activity yet',
                          description: 'When something happens, you will see it here.',
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Inside a Card</div>
                  <span style={chipStyleB(t, { marginBottom: 10 })}>size: sm · no action</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>
                    Small empty state inside a card or widget. May not need an action if the card is informational.
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
                <div style={{ ...dottedZone(t, 160), flexDirection: 'column', gap: 8, padding: 12 }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: t.bg.surface.tertiary.default,
                          border: `1px dashed ${t.border.default.default}`,
                        }}
                      />
                    ))}
                  </div>
                  <EmptyStateDemo
                    t={t}
                    variant="blank"
                    size="md"
                    iconStyle="circle"
                    showActions
                    demoCopy={{
                      title: 'No teammates yet',
                      description: 'Invite teammates to collaborate in this workspace.',
                      primary: 'Invite your first teammate',
                    }}
                  />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Full page section</div>
                  <span style={chipStyleB(t, { marginBottom: 10 })}>size: md</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>
                    Section-level empty state. Use md size. Center vertically and horizontally within the available space.
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
                <div style={{ ...dottedZone(t, 160), flexDirection: 'column', padding: 8 }}>
                  <svg width={100} height={48} viewBox="0 0 100 48" aria-hidden style={{ flexShrink: 0 }}>
                    <defs>
                      <linearGradient id="esHero" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={t.text.brand.default} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={t.bg.fill.brandSubtle.default} stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <rect x={10} y={8} width={80} height={32} rx={8} fill="url(#esHero)" />
                    <circle cx={50} cy={24} r={8} fill={t.text.brand.default} opacity={0.5} />
                  </svg>
                  <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                    <EmptyStateDemo
                      t={t}
                      variant="blank"
                      size="lg"
                      iconStyle="circle"
                      showActions
                      demoCopy={{
                        title: 'Welcome to your workspace',
                        description: 'Create your first project to start organizing work.',
                        primary: 'Create your first project',
                      }}
                    />
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Full page (first run)</div>
                  <span style={chipStyleB(t, { marginBottom: 10 })}>size: lg</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>
                    App-level first run. Use lg size. This is a high-value moment — invest in custom illustration and warm, welcoming copy.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-es" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: t.text.tertiary.default, marginBottom: 12 }}>DO</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                  <li>Lists and tables with no items</li>
                  <li>Empty search results</li>
                  <li>Sections that require prior setup</li>
                  <li>Error states when content fails to load</li>
                  <li>Filtered views with no matches</li>
                  <li>First visits to new features</li>
                </ul>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: t.text.tertiary.default, marginBottom: 12 }}>DON&apos;T</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                  <li>As a placeholder while content loads (use Skeleton)</li>
                  <li>When some content exists (show what you can + inline message)</li>
                  <li>Inside popovers or tooltips (too small for a full empty state)</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="tip" title="Empty state vs. zero state">
                A &apos;zero state&apos; is a first-time experience — the user has never created anything. An &apos;empty state&apos; is when content
                existed but is now gone or filtered out. Both use the EmptyState component, but the copy and actions differ significantly. Zero
                states should feel like invitations; empty states should feel like helpful redirects.
              </Callout>
            </div>
          </section>

          <section id="message-guide" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Message framework
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 800, color: t.text.primary.default, margin: '0 0 12px' }}>Title: What happened (not what&apos;s missing)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                  <div>
                    <div style={{ color: t.text.tertiary.default, fontWeight: 700, marginBottom: 8 }}>DO</div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, lineHeight: 1.65 }}>
                      <li>&apos;No projects yet&apos;</li>
                      <li>&apos;No results for &apos;acme&apos;&apos;</li>
                      <li>&apos;Couldn&apos;t load your files&apos;</li>
                    </ul>
                  </div>
                  <div>
                    <div style={{ color: t.text.tertiary.default, fontWeight: 700, marginBottom: 8 }}>DON&apos;T</div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, lineHeight: 1.65 }}>
                      <li>&apos;Empty&apos;</li>
                      <li>&apos;No data&apos;</li>
                      <li>&apos;404&apos; / &apos;N/A&apos;</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 800, color: t.text.primary.default, margin: '0 0 12px' }}>Description: Why + what to do</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                  <div>
                    <div style={{ color: t.text.tertiary.default, fontWeight: 700, marginBottom: 8 }}>DO</div>
                    <p style={{ margin: 0, color: t.text.secondary.default, lineHeight: 1.65 }}>
                      &apos;You haven&apos;t created any projects. Projects help you organize work by client or campaign.&apos;
                    </p>
                  </div>
                  <div>
                    <div style={{ color: t.text.tertiary.default, fontWeight: 700, marginBottom: 8 }}>DON&apos;T</div>
                    <p style={{ margin: 0, color: t.text.secondary.default, lineHeight: 1.65 }}>
                      &apos;There are no projects in this view.&apos;
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 800, color: t.text.primary.default, margin: '0 0 12px' }}>Action: Specific verb</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                  <div>
                    <div style={{ color: t.text.tertiary.default, fontWeight: 700, marginBottom: 8 }}>DO</div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, lineHeight: 1.65 }}>
                      <li>&apos;Create your first project&apos;</li>
                      <li>&apos;Clear search&apos; / &apos;Retry&apos; / &apos;Request access&apos;</li>
                    </ul>
                  </div>
                  <div>
                    <div style={{ color: t.text.tertiary.default, fontWeight: 700, marginBottom: 8 }}>DON&apos;T</div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, lineHeight: 1.65 }}>
                      <li>&apos;Click here&apos;</li>
                      <li>&apos;Go back&apos; / &apos;OK&apos;</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="dos-donts-es" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — always provide an action"
                  caption='EmptyState “No teammates yet” with an “Invite teammate” button gives a clear next step.'
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <MiniES t={t} icon={Users} title="No teammates yet" action="Invite teammate" compact />
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — dead end"
                  caption='“No teammates yet” with no action leaves the user stuck with nowhere to go.'
                >
                  <MiniES t={t} icon={Users} title="No teammates yet" compact />
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — match copy to cause"
                  caption="For an empty search, mention the query: “No results for 'acme design'.”"
                >
                  <MiniES t={t} icon={Search} title="No results for 'acme design'" action="Clear search" compact />
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — wrong template"
                  caption="First-run copy (“Nothing here yet”) is misleading when the list is empty because search returned nothing."
                >
                  <MiniES t={t} icon={Search} title="Nothing here yet" compact />
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — size to container"
                  caption="Use sm inside tight cards; reserve lg for full-page first-run moments."
                >
                  <div style={{ border: `1px dashed ${t.border.default.default}`, borderRadius: 8, padding: 8, width: 140 }}>
                    <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                      <EmptyStateDemo t={t} variant="blank" size="sm" iconStyle="circle" showActions />
                    </div>
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — overflow the frame"
                  caption="A lg empty state inside a 200px-tall card crowds the layout — scale down to sm."
                >
                  <div style={{ border: `1px dashed ${t.border.default.default}`, borderRadius: 8, padding: 4, width: 140, height: 90, overflow: 'hidden' }}>
                    <div style={{ transform: 'scale(0.45)', transformOrigin: 'top center' }}>
                      <EmptyStateDemo t={t} variant="blank" size="lg" iconStyle="circle" showActions />
                    </div>
                  </div>
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
                Title writing
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>2–5 words. Noun phrase or short sentence.</li>
                <li>First-run: &apos;Nothing here yet&apos;, &apos;Your inbox is empty&apos;, &apos;No projects yet&apos;</li>
                <li>No results: &apos;No results found&apos;, &apos;No matches for [term]&apos;</li>
                <li>Error: &apos;Something went wrong&apos;, &apos;Couldn&apos;t load [content]&apos;</li>
                <li>No access: &apos;You don&apos;t have access&apos;, &apos;Permission required&apos;</li>
              </ul>
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Description writing
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>2–3 sentences max</li>
                <li>Sentence 1: Why it&apos;s empty (cause)</li>
                <li>Sentence 2: What the user can do (path forward)</li>
                <li>Never say &apos;Please&apos; — it sounds like the interface is begging</li>
                <li>Use &apos;you&apos; — speak directly to the user</li>
              </ul>
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Action label writing
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <FileText size={18} color={t.icon.secondary.default} style={{ marginTop: 3, flexShrink: 0 }} aria-hidden />
                  <span>
                    First-run: &apos;Create your first [item]&apos;, &apos;Get started&apos;, &apos;Invite your team&apos;
                  </span>
                </li>
                <li>No results: &apos;Clear search&apos;, &apos;Clear filters&apos;, &apos;Browse all [items]&apos;</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Upload size={18} color={t.icon.secondary.default} style={{ marginTop: 3, flexShrink: 0 }} aria-hidden />
                  <span>Error: &apos;Try again&apos;, &apos;Refresh the page&apos;, &apos;Contact support&apos;</span>
                </li>
                <li>No access: &apos;Request access&apos;, &apos;Contact your admin&apos;</li>
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              EmptyState props
            </h3>
            <PropsTable props={emptyStatePropsRows} />
          </section>
          <section style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={codeFirstRun} filename="First-run empty state" language="tsx" />
              <CodeBlock code={codeSearch} filename="Search empty state" language="tsx" />
              <CodeBlock code={codeError} filename="Error state" language="tsx" />
              <CodeBlock code={codeNoAccess} filename="No access" language="tsx" />
              <CodeBlock code={codeTable} filename="Inside a table" language="tsx" />
              <CodeBlock code={codeFiltered} filename="Filtered empty state" language="tsx" />
            </div>
          </section>
          <section style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              EmptyState renders as a &lt;section&gt; with role=&apos;status&apos; when it replaces dynamic content (search results, filtered lists).
              This announces the empty state to screen readers when it appears. The title is rendered as an &lt;h2&gt; by default — override with
              the headingLevel prop if needed for correct document hierarchy.
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
                Initial release. EmptyState with 5 semantic variants (blank, no-results, error, no-access, filtered), 3 sizes, 4 icon color
                styles, primary + secondary actions + link, circle/square/none icon container.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
