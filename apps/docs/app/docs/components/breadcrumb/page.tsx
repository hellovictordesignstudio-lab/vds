'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Home,
  MoreHorizontal,
  Slash,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type BreadcrumbSeparator = 'chevron' | 'slash' | 'dot' | 'arrow';
type BreadcrumbSize = 'sm' | 'md' | 'lg';
type PathDepth = 2 | 3 | 4 | 5;

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

const SIZE_MAP: Record<BreadcrumbSize, { fontSize: number; iconSize: number; padding: string }> = {
  sm: { fontSize: 12, iconSize: 12, padding: '2px 5px' },
  md: { fontSize: 13, iconSize: 14, padding: '3px 6px' },
  lg: { fontSize: 14, iconSize: 16, padding: '4px 8px' },
};

const PATH_BY_DEPTH: Record<PathDepth, BreadcrumbItem[]> = {
  2: [
    { label: 'Home', href: '#' },
    { label: 'Settings' },
  ],
  3: [
    { label: 'Home', href: '#' },
    { label: 'Projects', href: '#' },
    { label: 'Acme Redesign' },
  ],
  4: [
    { label: 'Home', href: '#' },
    { label: 'Projects', href: '#' },
    { label: 'Acme Redesign', href: '#' },
    { label: 'Typography' },
  ],
  5: [
    { label: 'Home', href: '#' },
    { label: 'Projects', href: '#' },
    { label: 'Acme Redesign', href: '#' },
    { label: 'Components', href: '#' },
    { label: 'Button' },
  ],
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

function dottedZone(t: VDSTheme, height: number): CSSProperties {
  return {
    backgroundColor: t.bg.surface.secondary.default,
    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
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

type Segment =
  | { kind: 'item'; item: BreadcrumbItem; index: number }
  | { kind: 'ellipsis'; from: number; to: number };

function buildSegments(items: BreadcrumbItem[], collapse: boolean, expanded: boolean, maxItems: number): Segment[] {
  if (!collapse || expanded || items.length <= maxItems) {
    return items.map((item, index) => ({ kind: 'item', item, index }));
  }
  const tailCount = maxItems - 2;
  const tailStart = items.length - tailCount;
  const out: Segment[] = [{ kind: 'item', item: items[0]!, index: 0 }];
  const hiddenFrom = 1;
  const hiddenTo = tailStart - 1;
  if (hiddenTo >= hiddenFrom) {
    out.push({ kind: 'ellipsis', from: hiddenFrom, to: hiddenTo });
  }
  for (let i = tailStart; i < items.length; i++) {
    out.push({ kind: 'item', item: items[i]!, index: i });
  }
  return out;
}

function SeparatorNode({
  t,
  separator,
  size,
}: {
  t: VDSTheme;
  separator: BreadcrumbSeparator;
  size: BreadcrumbSize;
}) {
  const sz = SIZE_MAP[size];
  const tertiary = t.text.tertiary.default;
  const base: CSSProperties = {
    color: tertiary,
    flexShrink: 0,
    userSelect: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (separator === 'chevron') {
    return (
      <span style={base} aria-hidden>
        <ChevronRight size={sz.iconSize} strokeWidth={2} />
      </span>
    );
  }
  if (separator === 'slash') {
    return (
      <span style={{ ...base, fontSize: 14, opacity: 0.5, fontWeight: 500 }} aria-hidden>
        /
      </span>
    );
  }
  if (separator === 'dot') {
    return (
      <span style={{ ...base, fontSize: 16, opacity: 0.5, fontWeight: 600 }} aria-hidden>
        ·
      </span>
    );
  }
  return (
    <span style={{ ...base, fontSize: 13, fontWeight: 500 }} aria-hidden>
      →
    </span>
  );
}

function Breadcrumb({
  t,
  items,
  separator = 'chevron',
  size = 'md',
  showHome = false,
  collapse = false,
  maxItems = 4,
  expanded: expandedProp,
  onExpandChange,
  className,
}: {
  t: VDSTheme;
  items: BreadcrumbItem[];
  separator?: BreadcrumbSeparator;
  size?: BreadcrumbSize;
  showHome?: boolean;
  collapse?: boolean;
  maxItems?: number;
  expanded?: boolean;
  onExpandChange?: (v: boolean) => void;
  className?: string;
}) {
  const [expandedInner, setExpandedInner] = useState(false);
  const isControlled = expandedProp !== undefined;
  const expanded = isControlled ? expandedProp : expandedInner;
  const setExpanded = (next: boolean) => {
    if (isControlled) {
      onExpandChange?.(next);
    } else {
      setExpandedInner(next);
    }
  };

  const sz = SIZE_MAP[size];
  const segments = buildSegments(items, collapse, expanded, maxItems);

  const renderCrumb = (item: BreadcrumbItem, index: number) => {
    const isLast = index === items.length - 1;
    const isLink = Boolean(item.href) && !isLast;
    const isFirstHome = showHome && index === 0 && item.label === 'Home';

    const crumbStyle: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: sz.fontSize,
      fontWeight: isLast ? 600 : 500,
      color: isLast ? t.text.primary.default : t.text.secondary.default,
      textDecoration: 'none',
      borderRadius: 6,
      padding: sz.padding,
      cursor: isLast ? 'default' : 'pointer',
      transition: 'all 100ms',
      border: 'none',
      background: 'transparent',
      fontFamily: 'inherit',
    };

    if (isFirstHome && item.href) {
      return (
        <CrumbHomeLink key={`h-${index}`} t={t} href={item.href!} iconSize={sz.iconSize} styleBase={crumbStyle} />
      );
    }

    if (isLink && item.href) {
      return (
        <CrumbLink key={`a-${index}`} t={t} href={item.href} styleBase={crumbStyle} icon={item.icon}>
          {item.label}
        </CrumbLink>
      );
    }

    return (
      <span key={`c-${index}`} style={crumbStyle} aria-current={isLast ? 'page' : undefined}>
        {item.icon ? (
          <>
            {item.icon}
            {item.label}
          </>
        ) : (
          item.label
        )}
      </span>
    );
  };

  return (
    <nav className={className} aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
      {segments.map((seg, i) => (
        <span key={seg.kind === 'item' ? `s-${seg.index}` : `e-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          {i > 0 ? <SeparatorNode t={t} separator={separator} size={size} /> : null}
          {seg.kind === 'item' ? (
            renderCrumb(seg.item, seg.index)
          ) : (
            <EllipsisCrumb t={t} ariaExpanded={expanded} onExpand={() => setExpanded(true)} />
          )}
        </span>
      ))}
    </nav>
  );
}

function CrumbHomeLink({
  t,
  href,
  iconSize,
  styleBase,
}: {
  t: VDSTheme;
  href: string;
  iconSize: number;
  styleBase: CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      onClick={(e) => e.preventDefault()}
      aria-label="Home"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styleBase,
        color: hover ? t.text.primary.default : t.text.secondary.default,
        background: hover ? t.bg.surface.secondary.default : 'transparent',
      }}
    >
      <Home size={iconSize} aria-hidden strokeWidth={2} />
    </a>
  );
}

function CrumbLink({
  t,
  href,
  styleBase,
  icon,
  children,
}: {
  t: VDSTheme;
  href: string;
  styleBase: CSSProperties;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      onClick={(e) => e.preventDefault()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styleBase,
        color: hover ? t.text.primary.default : t.text.secondary.default,
        background: hover ? t.bg.surface.secondary.default : 'transparent',
      }}
    >
      {icon ? (
        <>
          {icon}
          {children}
        </>
      ) : (
        children
      )}
    </a>
  );
}

function EllipsisCrumb({ t, ariaExpanded, onExpand }: { t: VDSTheme; ariaExpanded: boolean; onExpand: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label="Show full path"
      aria-expanded={ariaExpanded}
      onClick={onExpand}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: 'none',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: hover ? t.bg.surface.secondary.default : 'transparent',
        color: t.text.secondary.default,
        transition: 'all 100ms',
      }}
    >
      <MoreHorizontal size={16} aria-hidden strokeWidth={2} />
    </button>
  );
}

/** Static breadcrumb for illustrations (collapse non-interactive). */
function BreadcrumbStatic({
  t,
  items,
  separator = 'chevron',
  size = 'md',
  showHome = false,
  collapse = false,
  maxItems = 4,
  forceExpanded,
}: {
  t: VDSTheme;
  items: BreadcrumbItem[];
  separator?: BreadcrumbSeparator;
  size?: BreadcrumbSize;
  showHome?: boolean;
  collapse?: boolean;
  maxItems?: number;
  /** When true, trail is fully expanded and non-interactive (for static diagrams). */
  forceExpanded?: boolean;
}) {
  return (
    <Breadcrumb
      t={t}
      items={items}
      separator={separator}
      size={size}
      showHome={showHome}
      collapse={collapse}
      maxItems={maxItems}
      {...(forceExpanded === true ? { expanded: true, onExpandChange: () => {} } : {})}
    />
  );
}

export default function BreadcrumbDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [pathDepth, setPathDepth] = useState<PathDepth>(4);
  const [separator, setSeparator] = useState<BreadcrumbSeparator>('chevron');
  const [showHome, setShowHome] = useState<'off' | 'on'>('off');
  const [collapse, setCollapse] = useState<'off' | 'on'>('off');
  const [size, setSize] = useState<BreadcrumbSize>('md');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setExpanded(false);
  }, [pathDepth, collapse, showHome, separator, size]);

  const t = buildTheme(isDark);
  const previewDark = appearance === 'dark';
  const previewT = previewDark ? buildTheme(true) : t;

  const items = PATH_BY_DEPTH[pathDepth];

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-bc', label: 'Principles' },
        { id: 'anatomy-bc', label: 'Anatomy' },
        { id: 'variants-bc', label: 'Variants' },
        { id: 'separators-bc', label: 'Separators' },
        { id: 'sizes-bc', label: 'Sizes' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-bc', label: 'When to use' },
        { id: 'placement-bc', label: 'Placement' },
        { id: 'dos-donts-bc', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'props-bc', label: 'Breadcrumb props' },
        { id: 'code-examples-bc', label: 'Examples' },
        { id: 'a11y-bc', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const breadcrumbPropsRows = [
    { name: 'items', type: 'BreadcrumbItem[]', default: '—', description: 'Crumb items in order (required)', required: true as boolean },
    {
      name: 'separator',
      type: "'chevron' | 'slash' | 'dot' | 'arrow'",
      default: "'chevron'",
      description: 'Separator style',
    },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Text and icon size' },
    { name: 'showHome', type: 'boolean', default: 'false', description: 'Replace first item with Home icon' },
    { name: 'collapse', type: 'boolean', default: 'false', description: 'Collapse middle items when > maxItems' },
    { name: 'maxItems', type: 'number', default: '4', description: 'Max visible items before collapsing' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const codeExamples = `// Basic 3-level breadcrumb
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Acme Redesign' }, // no href = current page
  ]}
/>

// With home icon
<Breadcrumb
  showHome
  items={[
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Acme Redesign', href: '/projects/acme' },
    { label: 'Typography' },
  ]}
/>

// Collapsed (deep hierarchy)
<Breadcrumb
  collapse
  maxItems={4}
  items={[
    { label: 'Home', href: '/' },
    { label: 'Docs', href: '/docs' },
    { label: 'Components', href: '/docs/components' },
    { label: 'Forms', href: '/docs/components/forms' },
    { label: 'TextInput' },
  ]}
/>

// Slash separator — developer context
<Breadcrumb
  separator="slash"
  items={[
    { label: 'hellovictordesignstudio-lab', href: '/' },
    { label: 'vds', href: '/vds' },
    { label: 'apps / docs', href: '/vds/apps/docs' },
    { label: 'components' },
  ]}
/>

// With icons on items
<Breadcrumb
  items={[
    { label: 'Home', href: '/', icon: <Home size={14} /> },
    { label: 'Settings', href: '/settings', icon: <Settings size={14} /> },
    { label: 'Team' },
  ]}
/>

// Sizes
<Breadcrumb size="sm" items={items} />
<Breadcrumb size="md" items={items} />
<Breadcrumb size="lg" items={items} />

// Dynamic breadcrumb from route (Next.js)
const pathname = usePathname()
const segments = pathname.split('/').filter(Boolean)
const breadcrumbItems = [
  { label: 'Home', href: '/' },
  ...segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href: i < segments.length - 1 ? '/' + segments.slice(0, i + 1).join('/') : undefined,
  })),
]
<Breadcrumb items={breadcrumbItems} showHome />`;

  const sixLevelItems: BreadcrumbItem[] = [
    { label: 'Home', href: '#' },
    { label: 'Docs', href: '#' },
    { label: 'Components', href: '#' },
    { label: 'Forms', href: '#' },
    { label: 'Inputs', href: '#' },
    { label: 'TextInput' },
  ];

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components{' '}
        <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Breadcrumb
      </p>
      <h1 className="page-title">Breadcrumb</h1>
      <p className="page-lead">
        Breadcrumbs show the user&apos;s current location within a hierarchical structure. They answer the question &apos;where am I?&apos; and offer a fast
        path back to any parent level — without requiring a back button or a full navigation scan. They&apos;re most valuable in deep hierarchies where
        context would otherwise be lost.
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
                    label="Path depth"
                    options={['2', '3', '4', '5']}
                    value={String(pathDepth)}
                    onChange={(v) => setPathDepth(Number(v) as PathDepth)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Separator"
                    options={['chevron', 'slash', 'dot', 'arrow']}
                    value={separator}
                    onChange={(v) => setSeparator(v as BreadcrumbSeparator)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show home icon"
                    options={['off', 'on']}
                    value={showHome}
                    onChange={(v) => setShowHome(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Collapse"
                    options={['off', 'on']}
                    value={collapse}
                    onChange={(v) => setCollapse(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Size"
                    options={['sm', 'md', 'lg']}
                    value={size}
                    onChange={(v) => setSize(v as BreadcrumbSize)}
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
                  minHeight: 360,
                  padding: 40,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Breadcrumb
                  t={previewT}
                  items={items}
                  separator={separator}
                  size={size}
                  showHome={showHome === 'on'}
                  collapse={collapse === 'on'}
                  maxItems={4}
                  expanded={expanded}
                  onExpandChange={setExpanded}
                />
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-bc" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Principles
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 200), flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'stretch' }}>
                    <div
                      style={{
                        width: 200,
                        borderRadius: 10,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        padding: 12,
                      }}
                    >
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 8 }}>Product page · no trail</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>MacBook Pro 14</div>
                    </div>
                    <div
                      style={{
                        width: 200,
                        borderRadius: 10,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        padding: 12,
                      }}
                    >
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 8 }}>Same page · with trail</div>
                      <BreadcrumbStatic
                        t={t}
                        size="sm"
                        items={[
                          { label: 'Home', href: '#' },
                          { label: 'Electronics', href: '#' },
                          { label: 'Laptops', href: '#' },
                          { label: 'MacBook Pro 14' },
                        ]}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Home size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Orientation in deep hierarchies</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Breadcrumbs are most valuable when the hierarchy has 3+ levels. On a flat site with 2 levels, they add visual noise without value.
                    The deeper the structure, the more disorienting it becomes without breadcrumbs — the user loses track of where they came from and
                    how to get back.
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
                <div style={{ ...dottedZone(t, 200), flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <BreadcrumbStatic
                      t={t}
                      size="sm"
                      items={[
                        { label: 'Home', href: '#' },
                        { label: 'Projects', href: '#' },
                        { label: 'Acme' },
                      ]}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: t.text.tertiary.default }}>
                      <ChevronDown size={14} aria-hidden />
                      <span style={{ fontSize: 10, fontWeight: 600 }}>Direct access to any parent</span>
                      <ChevronDown size={14} aria-hidden style={{ transform: 'rotate(-90deg)' }} />
                    </div>
                    <div style={{ fontSize: 10, color: t.text.secondary.default, textAlign: 'center', maxWidth: 220 }}>
                      User navigated inward: Home → Projects → Acme. Click &quot;Projects&quot; jumps up one level.
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <ChevronRight size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Every crumb is a shortcut</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A breadcrumb isn&apos;t just decoration — each item is a clickable link to that level of the hierarchy. The user can jump to any
                    ancestor in one click, bypassing the back button chain. This is the core value proposition: fast navigation up the tree without
                    losing context.
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
                <div style={{ ...dottedZone(t, 200), flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                    <div style={{ width: 200, maxWidth: '100%' }}>
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 6 }}>6 levels · no collapse</div>
                      <div style={{ maxWidth: 180 }}>
                        <BreadcrumbStatic t={t} size="sm" items={sixLevelItems} forceExpanded />
                      </div>
                    </div>
                    <div style={{ width: 200 }}>
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 6 }}>6 levels → collapse middle</div>
                      <BreadcrumbStatic
                        t={t}
                        size="sm"
                        showHome
                        collapse
                        maxItems={4}
                        items={sixLevelItems}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <MoreHorizontal size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Collapse the middle, not the ends</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    When a path is too long to display, collapse the middle items behind a &apos;···&apos; trigger. Never collapse the first item (root context)
                    or the last item (current page). The user needs both anchors — where they started and where they are now. The middle is navigable
                    on demand.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-bc" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 14,
                overflow: 'hidden',
                background: t.bg.surface.primary.default,
              }}
            >
              <div style={{ ...dottedZone(t, 280), flexDirection: 'column', gap: 12, padding: 24 }}>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 520,
                    border: `1px dashed ${t.border.default.default}`,
                    borderRadius: 10,
                    padding: '20px 16px',
                    background: t.bg.surface.primary.default,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 2, marginBottom: 10 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        aria-label="Home"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 6px',
                          borderRadius: 6,
                          color: t.text.secondary.default,
                        }}
                      >
                        <Home size={14} aria-hidden />
                      </a>
                    </span>
                    <span style={{ color: t.text.tertiary.default, flexShrink: 0, userSelect: 'none' }} aria-hidden>
                      <ChevronRight size={14} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary.default, padding: '3px 6px', borderRadius: 6 }}>Projects</span>
                    <span style={{ color: t.text.tertiary.default, flexShrink: 0, userSelect: 'none' }} aria-hidden>
                      <ChevronRight size={14} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary.default, padding: '3px 6px', borderRadius: 6 }}>Acme</span>
                    <span style={{ color: t.text.tertiary.default, flexShrink: 0, userSelect: 'none' }} aria-hidden>
                      <ChevronRight size={14} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default, padding: '3px 6px', borderRadius: 6 }} aria-current="page">
                      Typography
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      flexWrap: 'wrap',
                      fontSize: 10,
                      color: t.text.tertiary.default,
                    }}
                  >
                    {['A', 'B', 'C', 'B', 'C', 'B', 'D'].map((L, idx) => (
                      <span key={idx} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 24 }}>
                        <span style={{ color: t.text.secondary.default }}>↑</span>
                        <AnnotationDot letter={L} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 20px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, fontSize: 13, lineHeight: 1.75 }}>
                  <li>
                    <strong style={{ color: t.text.primary.default }}>A</strong> → Home icon crumb (Home 14px, borderRadius 6px, hover bg surface.secondary,
                    aria-label=&quot;Home&quot;, links to root)
                  </li>
                  <li>
                    <strong style={{ color: t.text.primary.default }}>B</strong> → Separator (ChevronRight 14px, color tertiary, flexShrink 0, userSelect none)
                  </li>
                  <li>
                    <strong style={{ color: t.text.primary.default }}>C</strong> → Link crumb (fontSize 13px, fontWeight 500, color secondary, hover bg
                    surface.secondary color primary, borderRadius 6px, padding 3px 6px)
                  </li>
                  <li>
                    <strong style={{ color: t.text.primary.default }}>D</strong> → Current crumb (fontSize 13px, fontWeight 600, color primary, no hover, no
                    link, aria-current=&quot;page&quot;)
                  </li>
                  <li>
                    <strong style={{ color: t.text.primary.default }}>E</strong> → Collapsed crumb (MoreHorizontal button, 28px, replaces middle items, click to
                    expand)
                  </li>
                  <li>
                    <strong style={{ color: t.text.primary.default }}>F</strong> → Nav container (&lt;nav&gt; aria-label=&quot;Breadcrumb&quot;, display flex, alignItems
                    center)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section id="variants-bc" style={{ marginBottom: 48 }}>
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
                <div style={{ ...dottedZone(t, 140) }}>
                  <BreadcrumbStatic
                    t={t}
                    items={[
                      { label: 'Home', href: '#' },
                      { label: 'Projects', href: '#' },
                      { label: 'Acme Redesign' },
                    ]}
                  />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Default</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>variant: default</span>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Standard breadcrumb. Link items in secondary color, current page in primary. Use in page headers, above page titles.
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
                <div style={{ ...dottedZone(t, 140) }}>
                  <BreadcrumbStatic
                    t={t}
                    showHome
                    items={[
                      { label: 'Home', href: '#' },
                      { label: 'Projects', href: '#' },
                      { label: 'Acme Redesign' },
                    ]}
                  />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>With home icon</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>showHome: true</span>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Replaces the first text crumb with a Home icon. Saves horizontal space and is universally understood. Recommended when space is
                    limited.
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
                <div style={{ ...dottedZone(t, 140) }}>
                  <BreadcrumbStatic
                    t={t}
                    showHome
                    collapse
                    maxItems={4}
                    items={[
                      { label: 'Home', href: '#' },
                      { label: 'Projects', href: '#' },
                      { label: 'Acme Redesign', href: '#' },
                      { label: 'Components', href: '#' },
                      { label: 'Button' },
                    ]}
                  />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Collapsed</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>collapse: true</span>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Collapses middle items behind a ··· button when the path exceeds maxItems. Always shows root and current. Click ··· to expand.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="separators-bc" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Separators
            </h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20, maxWidth: 720 }}>
              The separator visually divides breadcrumb items. Choose one consistently across the product.
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
                <div style={{ ...dottedZone(t, 100) }}>
                  <BreadcrumbStatic
                    t={t}
                    separator="chevron"
                    items={[
                      { label: 'Home', href: '#' },
                      { label: 'Projects', href: '#' },
                      { label: 'Acme' },
                    ]}
                  />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Chevron (default)</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>separator: &quot;chevron&quot;</span>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Default. Directional arrow implies hierarchy and forward movement. The most common choice.
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
                <div style={{ ...dottedZone(t, 100) }}>
                  <BreadcrumbStatic
                    t={t}
                    separator="slash"
                    items={[
                      { label: 'Home', href: '#' },
                      { label: 'Projects', href: '#' },
                      { label: 'Acme' },
                    ]}
                  />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Slash size={16} strokeWidth={2} style={{ color: t.text.tertiary.default }} aria-hidden />
                    Slash
                  </div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>separator: &quot;slash&quot;</span>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Path-style separator. Familiar from file system paths and URLs. Use in technical or developer-facing products.
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
                <div style={{ ...dottedZone(t, 100) }}>
                  <BreadcrumbStatic
                    t={t}
                    separator="dot"
                    items={[
                      { label: 'Home', href: '#' },
                      { label: 'Projects', href: '#' },
                      { label: 'Acme' },
                    ]}
                  />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Dot</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>separator: &quot;dot&quot;</span>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Subtle separator. Lower visual weight than chevron. Use when the breadcrumb should be unobtrusive.
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
                <div style={{ ...dottedZone(t, 100) }}>
                  <BreadcrumbStatic
                    t={t}
                    separator="arrow"
                    items={[
                      { label: 'Home', href: '#' },
                      { label: 'Projects', href: '#' },
                      { label: 'Acme' },
                    ]}
                  />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Arrow</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>separator: &quot;arrow&quot;</span>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Explicit directional arrow. More emphatic than chevron. Use in marketing or editorial contexts.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="sizes-bc" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(
                [
                  ['sm', 12, 'Secondary nav, table captions, dense layouts'],
                  ['md', 13, 'Default — page headers, content areas'],
                  ['lg', 14, 'Prominent placement, mobile, touch-friendly'],
                ] as const
              ).map(([szKey, fs, desc]) => (
                <div
                  key={szKey}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 16,
                    padding: 16,
                    borderRadius: 14,
                    border: `1px solid ${t.border.default.default}`,
                    background: t.bg.surface.primary.default,
                  }}
                >
                  <div style={{ width: 36, fontSize: 12, fontWeight: 800, color: t.text.tertiary.default }}>{szKey}</div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <BreadcrumbStatic
                      t={t}
                      size={szKey}
                      items={[
                        { label: 'Home', href: '#' },
                        { label: 'Projects', href: '#' },
                        { label: 'Acme' },
                      ]}
                    />
                  </div>
                  <div style={{ fontSize: 13, color: t.text.secondary.default, minWidth: 220, maxWidth: 400 }}>
                    fontSize {fs}px — {desc}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-bc" style={{ marginTop: 32, marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: t.text.tertiary.default, marginBottom: 12 }}>DO</h3>
                <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75, margin: 0 }}>
                  <li>Sitios con jerarquía de 3+ niveles (e-commerce categories, docs, admin panels)</li>
                  <li>Páginas de detalle dentro de una sección (project → task → detail)</li>
                  <li>Después de navegación desde búsqueda o lista (el usuario puede necesitar volver al contexto)</li>
                  <li>Aplicaciones con múltiples niveles de configuración</li>
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: t.text.tertiary.default, marginBottom: 12 }}>DON&apos;T</h3>
                <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75, margin: 0 }}>
                  <li>Sitios planos con 1-2 niveles de profundidad (la nav principal es suficiente)</li>
                  <li>Modales y drawers (no tienen URL propia)</li>
                  <li>Wizard steps (usar un Step Indicator en su lugar)</li>
                  <li>En la página de inicio o root level (no hay padre al que navegar)</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="tip" title="Breadcrumb vs. back button">
                A breadcrumb is not a replacement for the browser back button — it&apos;s a complement. Back goes to the previous page in history (which may
                not be the parent). Breadcrumbs go to a specific level in the hierarchy. Both are useful; neither replaces the other.
              </Callout>
            </div>
          </section>

          <section id="placement-bc" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Placement
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  borderRadius: 14,
                  border: `1px solid ${t.border.default.default}`,
                  overflow: 'hidden',
                  background: t.bg.surface.primary.default,
                }}
              >
                <div style={{ ...dottedZone(t, 120), alignItems: 'stretch', justifyContent: 'center', padding: 16 }}>
                  <div style={{ width: '100%', maxWidth: 320 }}>
                    <BreadcrumbStatic
                      t={t}
                      size="sm"
                      items={[
                        { label: 'Docs', href: '#' },
                        { label: 'Components', href: '#' },
                        { label: 'Breadcrumb' },
                      ]}
                    />
                    <div style={{ fontSize: 18, fontWeight: 700, color: t.text.primary.default, marginTop: 10 }}>Page title</div>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>Above the page title</div>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>
                    Breadcrumb en la parte superior del contenido, encima del h1 de la página. Most common placement. The breadcrumb provides context
                    before the user reads the title. Standard for docs, e-commerce, and admin pages.
                  </p>
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  border: `1px solid ${t.border.default.default}`,
                  overflow: 'hidden',
                  background: t.bg.surface.primary.default,
                }}
              >
                <div
                  style={{
                    ...dottedZone(t, 120),
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    padding: 0,
                    background: t.bg.surface.secondary.default,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 360,
                      borderBottom: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.primary.default,
                      padding: '12px 16px',
                    }}
                  >
                    <BreadcrumbStatic
                      t={t}
                      size="sm"
                      items={[
                        { label: 'App', href: '#' },
                        { label: 'Settings', href: '#' },
                        { label: 'Team' },
                      ]}
                    />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginTop: 8 }}>Team</div>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>Inside the page header</div>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>
                    Breadcrumb integrado en un page header component con bg, padding, y border-bottom. Contained in a structured header. Use when the
                    page has a persistent header with title, actions, and navigation context.
                  </p>
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  border: `1px solid ${t.border.default.default}`,
                  overflow: 'hidden',
                  background: t.bg.surface.primary.default,
                }}
              >
                <div style={{ ...dottedZone(t, 120), alignItems: 'flex-start', justifyContent: 'center', padding: 16 }}>
                  <div style={{ width: '100%', maxWidth: 320 }}>
                    <div style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, marginBottom: 8 }}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                    </div>
                    <BreadcrumbStatic
                      t={t}
                      size="sm"
                      items={[
                        { label: 'Section', href: '#' },
                        { label: 'Subsection', href: '#' },
                        { label: 'Article' },
                      ]}
                    />
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>Inline in content</div>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>
                    Breadcrumb pequeño (sm) dentro del body del contenido, antes de una sección específica. Rare — use only for nested content within a
                    page where sub-sections have their own hierarchy.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="dos-donts-bc" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 16,
                  padding: 20,
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0A8853', marginBottom: 8 }}>DO</div>
                  <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, margin: 0, marginBottom: 10 }}>
                    Último crumb &quot;Button&quot; como texto no-clickeable (color primary, no hover)
                  </p>
                  <BreadcrumbStatic
                    t={t}
                    size="sm"
                    showHome
                    items={[
                      { label: 'Home', href: '#' },
                      { label: 'Components', href: '#' },
                      { label: 'Button' },
                    ]}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#E8186D', marginBottom: 8 }}>DON&apos;T</div>
                  <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, margin: 0, marginBottom: 10 }}>
                    Último crumb &quot;Button&quot; como link que navega a la misma página — link circular sin propósito
                  </p>
                  <nav style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }} aria-label="Bad example: current page as link">
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 5px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        color: t.text.secondary.default,
                        textDecoration: 'none',
                      }}
                      aria-label="Home"
                    >
                      <Home size={12} aria-hidden />
                    </a>
                    <span style={{ color: t.text.tertiary.default, flexShrink: 0, userSelect: 'none' }} aria-hidden>
                      <ChevronRight size={12} />
                    </span>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 5px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        color: t.text.secondary.default,
                        textDecoration: 'none',
                      }}
                    >
                      Components
                    </a>
                    <span style={{ color: t.text.tertiary.default, flexShrink: 0, userSelect: 'none' }} aria-hidden>
                      <ChevronRight size={12} />
                    </span>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 5px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: t.text.primary.default,
                        textDecoration: 'none',
                      }}
                    >
                      Button
                    </a>
                  </nav>
                  <span style={{ fontSize: 10, color: t.text.tertiary.default }}>Anti-pattern: current page as &lt;a&gt;</span>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 16,
                  padding: 20,
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0A8853', marginBottom: 8 }}>DO</div>
                  <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, margin: 0, marginBottom: 10 }}>
                    Breadcrumb &quot;Projects → Acme Redesign&quot;, página con h1 &quot;Acme Redesign&quot; — consistentes
                  </p>
                  <BreadcrumbStatic
                    t={t}
                    size="sm"
                    items={[
                      { label: 'Projects', href: '#' },
                      { label: 'Acme Redesign' },
                    ]}
                  />
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text.primary.default, marginTop: 8 }}>Acme Redesign</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#E8186D', marginBottom: 8 }}>DON&apos;T</div>
                  <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, margin: 0, marginBottom: 10 }}>
                    Breadcrumb &quot;Projects → Project #4821&quot;, página con h1 &quot;Acme Redesign&quot; — inconsistentes, confuso
                  </p>
                  <BreadcrumbStatic
                    t={t}
                    size="sm"
                    items={[
                      { label: 'Projects', href: '#' },
                      { label: 'Project #4821' },
                    ]}
                  />
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text.primary.default, marginTop: 8 }}>Acme Redesign</div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 16,
                  padding: 20,
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0A8853', marginBottom: 8 }}>DO</div>
                  <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, margin: 0, marginBottom: 10 }}>
                    collapse prop para colapsar items del medio cuando hay demasiados
                  </p>
                  <BreadcrumbStatic
                    t={t}
                    size="sm"
                    showHome
                    collapse
                    maxItems={4}
                    items={[
                      { label: 'Home', href: '#' },
                      { label: 'Projects', href: '#' },
                      { label: 'Acme Brand Redesign 2026', href: '#' },
                      { label: 'Components', href: '#' },
                      { label: 'Button' },
                    ]}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#E8186D', marginBottom: 8 }}>DON&apos;T</div>
                  <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, margin: 0, marginBottom: 10 }}>
                    Truncar el texto de los crumbs con CSS ellipsis — &quot;Acme Re...&quot; sin Tooltip es peor que colapsar
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: 12,
                      fontWeight: 500,
                      color: t.text.secondary.default,
                      maxWidth: 140,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      border: `1px dashed ${t.border.brand.default}`,
                      padding: '4px 6px',
                      borderRadius: 6,
                    }}
                  >
                    Home › Projects › Acme Re…
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            Crumb label writing
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>Match exactly the page title it links to — no abbreviation, no paraphrase</li>
            <li>
              If the title is very long (5+ words), truncate with Tooltip: &apos;Acme Brand Redesign 2026&apos; → &apos;Acme Brand...&apos; + Tooltip
            </li>
            <li>Home: icon only (Home icon) or &apos;Home&apos; text — not the site name</li>
            <li>Sentence case: &apos;Project settings&apos; not &apos;PROJECT SETTINGS&apos;</li>
          </ul>
          <h2 className="section-title" style={{ marginTop: 32, marginBottom: 16 }}>
            Hierarchy accuracy
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>Breadcrumb must reflect the actual URL hierarchy — not the navigation history</li>
            <li>If the user arrived via search, the breadcrumb shows the canonical hierarchy, not the search path</li>
            <li>Dynamic items (product names, project names) use the actual name, not a placeholder</li>
          </ul>
          <h2 className="section-title" style={{ marginTop: 32, marginBottom: 16 }}>
            Separator choice
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>Pick one separator and use it everywhere — never mix chevron and slash</li>
            <li>Separator must not be interactive or focusable</li>
          </ul>
        </section>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="props-bc" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Breadcrumb props
            </h2>
            <PropsTable props={breadcrumbPropsRows} />
            <h2 className="section-title" style={{ marginTop: 28, marginBottom: 12 }}>
              BreadcrumbItem type
            </h2>
            <CodeBlock
              language="tsx"
              code={`interface BreadcrumbItem {
  label: string
  href?: string       // omit for current page (last item)
  icon?: ReactNode    // optional leading icon
}`}
            />
          </section>
          <section id="code-examples-bc" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Examples
            </h2>
            <CodeBlock code={codeExamples} language="tsx" />
          </section>
          <section id="a11y-bc" style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              Breadcrumb is wrapped in a &lt;nav&gt; element with aria-label=&apos;Breadcrumb&apos;. Each link is a standard &lt;a&gt; element. The current page item has
              aria-current=&apos;page&apos; and is rendered as a &lt;span&gt; (not a link). The collapsed ··· button has aria-label=&apos;Show full path&apos; and
              aria-expanded. Separators have aria-hidden=&apos;true&apos;. The entire breadcrumb trail is announced by screen readers as a navigation landmark.
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
                Initial release. Breadcrumb with chevron/slash/dot/arrow separators, 3 sizes, home icon option, collapse with configurable maxItems,
                dynamic route generation pattern, full ARIA nav + aria-current pattern.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
