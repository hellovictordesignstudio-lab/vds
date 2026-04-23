'use client';

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Filter, Grid, List, Search } from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Button } from '@/components/vds/Button';

function getResolvedIsDark(): boolean {
  if (typeof document === 'undefined') return false;
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(getResolvedIsDark());
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(getResolvedIsDark());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setIsDark(getResolvedIsDark());
    mq.addEventListener('change', onChange);
    return () => {
      observer.disconnect();
      mq.removeEventListener('change', onChange);
    };
  }, []);

  return isDark;
}

const mono = "'JetBrains Mono', var(--font-mono), monospace";

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

function vdsSuccessChipStyle(t: Pick<VDSTheme, 'bg' | 'text'>): CSSProperties {
  return {
    background: t.bg.fill.success.default,
    color: t.text.success.default,
    fontSize: 12,
    fontFamily: 'inherit',
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  };
}

type CategoryVisual = 'brand' | 'purple' | 'green' | 'orange' | 'red';

function categoryVisual(category: string): CategoryVisual {
  switch (category) {
    case 'Form & Input':
      return 'green';
    case 'Feedback':
      return 'orange';
    case 'Navigation':
    case 'Calendar':
      return 'brand';
    case 'Data Display':
      return 'purple';
    case 'Charts':
      return 'green';
    case 'Trading':
      return 'red';
    default:
      return 'brand';
  }
}

function categoryCountChipStyle(
  t: VDSTheme,
  color: CategoryVisual,
  xs?: boolean,
): CSSProperties {
  const map: Record<CategoryVisual, { bg: string; fg: string }> = {
    brand: { bg: t.bg.fill.brandSubtle.default, fg: t.text.brand.default },
    purple: { bg: 'rgba(124,58,237,0.12)', fg: '#7C3AED' },
    green: { bg: 'rgba(10,136,83,0.10)', fg: '#0A8853' },
    orange: { bg: 'rgba(240,115,50,0.12)', fg: '#F07332' },
    red: { bg: 'rgba(210,34,50,0.12)', fg: '#D22232' },
  };
  return {
    ...chipStyleA({
      background: map[color].bg,
      color: map[color].fg,
      fontSize: xs ? 11 : 13,
      fontWeight: 800,
      padding: xs ? '3px 8px' : '6px 14px',
    }),
  };
}

function categoryDotColor(category: string): string {
  const m: Record<CategoryVisual, string> = {
    brand: '#1565A8',
    purple: '#7C3AED',
    green: '#0A8853',
    orange: '#F07332',
    red: '#D22232',
  };
  return m[categoryVisual(category)];
}

type ComponentEntry = {
  name: string;
  href: string;
  category: string;
  description: string;
  status: 'stable';
  version: string;
};

const COMPONENTS: ComponentEntry[] = [
  {
    name: 'Button',
    href: '/docs/components/button',
    category: 'Form & Input',
    description:
      'Triggers actions. Supports 5 variants, 3 sizes, icons, and loading state.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Text Input',
    href: '/docs/components/text-input',
    category: 'Form & Input',
    description: 'Single-line text entry with label, helper text, icons, and validation states.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Select',
    href: '/docs/components/select',
    category: 'Form & Input',
    description: 'Dropdown selection with search, groups, icons, and clearable support.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Checkbox',
    href: '/docs/components/checkbox',
    category: 'Form & Input',
    description: 'Boolean input with indeterminate state and group support.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Radio',
    href: '/docs/components/radio',
    category: 'Form & Input',
    description: 'Single selection from a group of mutually exclusive options.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Switch',
    href: '/docs/components/switch',
    category: 'Form & Input',
    description: 'Toggle between two states. Instant feedback, no confirmation needed.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Date Picker',
    href: '/docs/components/date-picker',
    category: 'Form & Input',
    description:
      'Calendar-based date selection. Supports single, range, month, and datetime modes.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'File Upload',
    href: '/docs/components/file-upload',
    category: 'Form & Input',
    description: 'Drag-and-drop file upload with progress, validation, and error states.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Alert',
    href: '/docs/components/alert',
    category: 'Feedback',
    description: 'Inline status messages for info, success, warning, and error states.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Toast',
    href: '/docs/components/toast',
    category: 'Feedback',
    description: 'Non-blocking notifications that appear and auto-dismiss.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Modal',
    href: '/docs/components/modal',
    category: 'Feedback',
    description: 'Blocking overlay for confirmations, forms, and critical alerts.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Drawer',
    href: '/docs/components/drawer',
    category: 'Feedback',
    description: 'Slide-in panel from any edge. For settings, filters, and secondary tasks.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Popover',
    href: '/docs/components/popover',
    category: 'Feedback',
    description: 'Contextual overlay anchored to a trigger. 8 placement options.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Tooltip',
    href: '/docs/components/tooltip',
    category: 'Feedback',
    description: 'Short label that appears on hover. Read-only, non-interactive.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Spinner',
    href: '/docs/components/spinner',
    category: 'Feedback',
    description: 'Indeterminate loading indicator. 5 sizes, 5 colors, optional label.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Skeleton',
    href: '/docs/components/skeleton',
    category: 'Feedback',
    description: 'Placeholder shapes that mimic loading content structure.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Progress',
    href: '/docs/components/progress',
    category: 'Feedback',
    description: 'Determinate progress bar for measurable operations.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Empty State',
    href: '/docs/components/empty-state',
    category: 'Feedback',
    description: 'Guides users when there is no content to display.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Navigation',
    href: '/docs/components/navigation',
    category: 'Navigation',
    description: 'Sidebar, topbar, and tab navigation variants for any product.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Tabs',
    href: '/docs/components/tabs',
    category: 'Navigation',
    description: 'Switches between parallel content sections. 3 visual variants.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Breadcrumb',
    href: '/docs/components/breadcrumb',
    category: 'Navigation',
    description: 'Shows location in a hierarchy. Collapsible for deep paths.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Pagination',
    href: '/docs/components/pagination',
    category: 'Navigation',
    description: 'Breaks large datasets into pages. 4 variants, smart ellipsis.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Accordion',
    href: '/docs/components/accordion',
    category: 'Navigation',
    description: 'Collapsible sections. Single or multiple open mode.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Command Palette',
    href: '/docs/components/command-palette',
    category: 'Navigation',
    description: 'Universal search and action interface. Triggered by ⌘K.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Card',
    href: '/docs/components/card',
    category: 'Data Display',
    description: 'Primary container for grouped content. Static or interactive.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Table',
    href: '/docs/components/table',
    category: 'Data Display',
    description: 'Structured data with sorting, selection, pagination, and custom cells.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Badge',
    href: '/docs/components/badge',
    category: 'Data Display',
    description: 'Status labels and counts. 5 semantic variants.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Avatar',
    href: '/docs/components/avatar',
    category: 'Data Display',
    description: 'Represents a person or entity. Image → initials → icon fallback chain.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Stat Card',
    href: '/docs/components/stat-card',
    category: 'Data Display',
    description: 'Single KPI with trend, icon, and optional sparkline.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Divider',
    href: '/docs/components/divider',
    category: 'Data Display',
    description: 'Visual separator. Horizontal and vertical, with optional label.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Kbd',
    href: '/docs/components/kbd',
    category: 'Data Display',
    description: 'Renders keyboard shortcuts consistently. KbdCombo for combinations.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Skeleton',
    href: '/docs/components/skeleton',
    category: 'Data Display',
    description: 'Loading placeholders that mirror content structure.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Calendar',
    href: '/docs/components/calendar',
    category: 'Calendar',
    description: 'Month, Week, Day, and Mini views. Shared event model across all views.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Charts',
    href: '/docs/components/charts',
    category: 'Charts',
    description: 'Line, Bar, Area, Donut, Sparkline, and ChartTooltip. Built on Recharts.',
    status: 'stable',
    version: 'v1.0',
  },
  {
    name: 'Trading',
    href: '/docs/components/trading',
    category: 'Trading',
    description:
      'Price Ticker, Candlestick, Order Book, Portfolio, P&L, Market Overview, Trading Pair.',
    status: 'stable',
    version: 'v1.0',
  },
];

const CATEGORY_FILTERS = [
  'All',
  'Form & Input',
  'Feedback',
  'Navigation',
  'Data Display',
  'Calendar',
  'Charts',
  'Trading',
] as const;

type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

const SECTION_ORDER = [
  'Form & Input',
  'Feedback',
  'Navigation',
  'Data Display',
  'Calendar',
  'Charts',
  'Trading',
] as const;

function MiniPreview({ category, t }: { category: string; t: VDSTheme }) {
  const brand = t.text.brand.default;
  const border = t.border.default.default;
  const surface = t.bg.surface.primary.default;

  if (category === 'Form & Input') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 6,
            background: t.bg.fill.primary.default,
            color: '#FFFFFF',
          }}
        >
          Save
        </div>
        <div
          style={{
            height: 26,
            width: 88,
            borderRadius: 6,
            border: `1px solid ${border}`,
            background: surface,
          }}
        />
      </div>
    );
  }

  if (category === 'Feedback') {
    return (
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          padding: '5px 10px',
          borderRadius: 6,
          background: t.bg.fill.brandSubtle.default,
          color: t.text.brand.default,
          border: `1px solid ${t.border.brand.default}`,
        }}
      >
        Heads up
      </div>
    );
  }

  if (category === 'Navigation') {
    return (
      <div
        style={{
          display: 'flex',
          borderRadius: 8,
          border: `1px solid ${border}`,
          overflow: 'hidden',
          fontSize: 9,
          fontWeight: 700,
        }}
      >
        {['One', 'Two', 'Three'].map((label, i) => (
          <div
            key={label}
            style={{
              padding: '5px 10px',
              background: i === 0 ? t.bg.fill.brandSubtle.default : surface,
              color: i === 0 ? brand : t.text.secondary.default,
              borderRight: i < 2 ? `1px solid ${border}` : undefined,
            }}
          >
            {label}
          </div>
        ))}
      </div>
    );
  }

  if (category === 'Data Display') {
    return (
      <div
        style={{
          width: 120,
          height: 72,
          borderRadius: 10,
          border: `1px solid ${border}`,
          background: surface,
          padding: 10,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ height: 8, width: '55%', borderRadius: 4, background: t.bg.surface.tertiary.default }} />
        <div
          style={{
            marginTop: 8,
            height: 6,
            width: '80%',
            borderRadius: 3,
            background: t.bg.surface.secondary.default,
          }}
        />
        <div
          style={{
            marginTop: 6,
            height: 6,
            width: '65%',
            borderRadius: 3,
            background: t.bg.surface.secondary.default,
          }}
        />
      </div>
    );
  }

  if (category === 'Calendar') {
    const today = 4;
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 16px)',
          gap: 4,
        }}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={String(i)}
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              border: `1px solid ${border}`,
              background: i + 1 === today ? t.bg.fill.brandSubtle.default : surface,
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>
    );
  }

  if (category === 'Charts') {
    return (
      <svg width={72} height={28} viewBox="0 0 72 28" aria-hidden style={{ overflow: 'visible' }}>
        <polyline
          fill="none"
          stroke={brand}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          points="6,20 36,8 66,16"
        />
      </svg>
    );
  }

  if (category === 'Trading') {
    return (
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          fontFamily: mono,
          color: t.text.primary.default,
          whiteSpace: 'nowrap',
        }}
      >
        $67,432 <span style={{ color: t.text.success.default }}>↑2.34%</span>
      </div>
    );
  }

  return null;
}

function ComponentCard({
  c,
  t,
  onNavigate,
}: {
  c: ComponentEntry;
  t: VDSTheme;
  onNavigate: (href: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const catVis = categoryVisual(c.category);

  const go = () => onNavigate(c.href);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go();
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`${c.name} — ${c.description}`}
      onClick={go}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: t.bg.surface.primary.default,
        border: `1px solid ${hover ? t.border.brand.default : t.border.default.default}`,
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        boxShadow: hover ? t.shadow.card : 'none',
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
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span
            style={{
              ...vdsSuccessChipStyle(t),
              fontSize: 10,
              padding: '2px 8px',
              fontWeight: 700,
            }}
          >
            Stable
          </span>
        </div>
        <div style={{ maxWidth: '90%', display: 'flex', justifyContent: 'center' }}>
          <MiniPreview category={c.category} t={t} />
        </div>
      </div>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: t.text.primary.default, marginBottom: 4 }}>
          {c.name}
        </div>
        <div
          style={{
            fontSize: 13,
            color: t.text.secondary.default,
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {c.description}
        </div>
      </div>
      <div
        style={{
          padding: '10px 18px',
          borderTop: `1px solid ${t.border.default.default}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={categoryCountChipStyle(t, catVis)}>{c.category}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              fontFamily: mono,
              color: t.text.tertiary.default,
            }}
          >
            {c.version}
          </span>
          <ArrowRight size={14} color={t.icon.tertiary.default} aria-hidden />
        </div>
      </div>
    </div>
  );
}

function ComponentRow({
  c,
  t,
  onNavigate,
}: {
  c: ComponentEntry;
  t: VDSTheme;
  onNavigate: (href: string) => void;
}) {
  const catVis = categoryVisual(c.category);
  const go = () => onNavigate(c.href);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go();
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`${c.name}`}
      onClick={go}
      onKeyDown={onKeyDown}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 16px',
        borderRadius: 10,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = t.bg.surface.secondary.default;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: categoryDotColor(c.category),
          flexShrink: 0,
        }}
        aria-hidden
      />
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: t.text.primary.default,
          width: 160,
          flexShrink: 0,
        }}
      >
        {c.name}
      </div>
      <div
        style={{
          fontSize: 13,
          color: t.text.secondary.default,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {c.description}
      </div>
      <span style={categoryCountChipStyle(t, catVis, true)}>{c.category}</span>
      <div
        style={{
          fontSize: 11,
          color: t.text.tertiary.default,
          fontFamily: mono,
          width: 36,
          flexShrink: 0,
          textAlign: 'right' as const,
        }}
      >
        {c.version}
      </div>
      <ArrowRight size={14} color={t.icon.tertiary.default} aria-hidden />
    </div>
  );
}

export default function ComponentsIndexPage() {
  const router = useRouter();
  const isDark = useIsDark();
  const t = buildTheme(isDark);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let list = COMPONENTS;
    if (categoryFilter !== 'All') {
      list = list.filter((c) => c.category === categoryFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, categoryFilter]);

  const sectionCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of COMPONENTS) {
      m[c.category] = (m[c.category] ?? 0) + 1;
    }
    return m;
  }, []);

  const groupedForGrid = useMemo(() => {
    if (categoryFilter !== 'All') {
      return null;
    }
    const map = new Map<string, ComponentEntry[]>();
    for (const s of SECTION_ORDER) {
      map.set(s, []);
    }
    for (const c of filtered) {
      const arr = map.get(c.category);
      if (arr) arr.push(c);
    }
    return map;
  }, [filtered, categoryFilter]);

  const resetSearch = () => setSearch('');

  const push = (href: string) => {
    router.push(href);
  };

  return (
    <>
      <p className="breadcrumb">Components</p>
      <h1 className="page-title">Components</h1>
      <p className="page-lead">
        47 production-ready components. Click any component to view its documentation, live preview, code examples, and
        usage guidelines.
      </p>

      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: t.bg.surface.primary.default,
            borderBottom: `1px solid ${t.border.default.default}`,
            padding: '14px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 260 }}>
              <Search
                size={15}
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: t.icon.tertiary.default,
                  pointerEvents: 'none',
                }}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search components..."
                aria-label="Search components"
                style={{
                  width: '100%',
                  height: 36,
                  paddingLeft: 34,
                  paddingRight: 12,
                  boxSizing: 'border-box',
                  background: t.bg.surface.secondary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 8,
                  fontSize: 13,
                  color: t.text.primary.default,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: '1 1 200px' }}>
              <Filter size={15} color={t.icon.tertiary.default} aria-hidden style={{ flexShrink: 0 }} />
              {CATEGORY_FILTERS.map((cat) => {
                const active = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      borderRadius: 6,
                      padding: '5px 12px',
                      cursor: 'pointer',
                      border: active ? 'none' : `1px solid ${t.border.default.default}`,
                      background: active ? t.bg.fill.primary.default : t.bg.surface.secondary.default,
                      color: active ? t.text.inverse.default : t.text.secondary.default,
                      transition: 'border-color 120ms ease, color 120ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = t.border.brand.default;
                        e.currentTarget.style.color = t.text.brand.default;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = t.border.default.default;
                        e.currentTarget.style.color = t.text.secondary.default;
                      }
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                type="button"
                aria-pressed={viewMode === 'grid'}
                aria-label="Grid view"
                onClick={() => setViewMode('grid')}
                style={{
                  padding: 8,
                  border: 'none',
                  borderRadius: 8,
                  background: 'transparent',
                  cursor: 'pointer',
                  color: viewMode === 'grid' ? t.icon.brand.default : t.icon.tertiary.default,
                }}
              >
                <Grid size={18} aria-hidden />
              </button>
              <button
                type="button"
                aria-pressed={viewMode === 'list'}
                aria-label="List view"
                onClick={() => setViewMode('list')}
                style={{
                  padding: 8,
                  border: 'none',
                  borderRadius: 8,
                  background: 'transparent',
                  cursor: 'pointer',
                  color: viewMode === 'list' ? t.icon.brand.default : t.icon.tertiary.default,
                }}
              >
                <List size={18} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto',
              borderRadius: '50%',
              background: t.bg.surface.secondary.default,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={40} color={t.icon.tertiary.default} aria-hidden />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 16, color: t.text.primary.default }}>
            No components found
          </div>
          <div style={{ fontSize: 14, color: t.text.secondary.default, marginTop: 8 }}>
            No components match &apos;{search}&apos;. Try a different search term.
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            <Button variant="tertiary" size="sm" onClick={resetSearch}>
              Clear search
            </Button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {groupedForGrid
            ? SECTION_ORDER.flatMap((section) => {
                const items = groupedForGrid.get(section);
                if (!items?.length) return [];
                const count = search.trim() ? items.length : (sectionCounts[section] ?? items.length);
                return [
                  <div
                    key={`h-${section}`}
                    style={{
                      gridColumn: '1 / -1',
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: t.text.tertiary.default,
                      padding: '24px 0 8px',
                      borderBottom: `1px solid ${t.border.default.default}`,
                      marginBottom: 4,
                    }}
                  >
                    {section} ({count})
                  </div>,
                  ...items.map((c) => <ComponentCard key={`${c.href}-${c.category}-${c.name}`} c={c} t={t} onNavigate={push} />),
                ];
              })
            : filtered.map((c) => (
                <ComponentCard key={`${c.href}-${c.category}-${c.name}`} c={c} t={t} onNavigate={push} />
              ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((c) => (
            <ComponentRow key={`${c.href}-${c.category}-${c.name}`} c={c} t={t} onNavigate={push} />
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 48,
          padding: '16px 0',
          borderTop: `1px solid ${t.border.default.default}`,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 12, color: t.text.tertiary.default }}>
          Showing {filtered.length} of {COMPONENTS.length} components
        </span>
        {categoryFilter === 'All' ? (
          <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {SECTION_ORDER.map((cat) => {
              const n = sectionCounts[cat] ?? 0;
              if (!n) return null;
              return (
                <span
                  key={cat}
                  style={{
                    fontSize: 11,
                    background: t.bg.surface.secondary.default,
                    color: t.text.tertiary.default,
                    borderRadius: 5,
                    padding: '3px 8px',
                  }}
                >
                  {n} {cat}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
