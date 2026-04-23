'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type PaginationVariant = 'default' | 'simple' | 'compact' | 'minimal';
type PaginationSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<PaginationSize, { h: number; pageBtn: number; fontSize: number }> = {
  sm: { h: 32, pageBtn: 32, fontSize: 12 },
  md: { h: 36, pageBtn: 36, fontSize: 13 },
  lg: { h: 40, pageBtn: 40, fontSize: 14 },
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

function buildPageItems(totalPages: number, currentPage: number, siblings: number): (number | 'ellipsis')[] {
  if (totalPages < 1) return [];
  const set = new Set<number>();
  set.add(1);
  set.add(totalPages);
  const lo = Math.max(1, currentPage - siblings);
  const hi = Math.min(totalPages, currentPage + siblings);
  for (let p = lo; p <= hi; p++) set.add(p);
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | 'ellipsis')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]!;
    if (i > 0 && cur - sorted[i - 1]! > 1) {
      out.push('ellipsis');
    }
    out.push(cur);
  }
  return out;
}

function NavIconButton({
  t,
  h,
  fs,
  disabled,
  onClick,
  ariaLabel,
  children,
  square,
}: {
  t: VDSTheme;
  h: number;
  fs: number;
  disabled: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
  square?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: h,
        width: square ? h : undefined,
        minWidth: square ? h : undefined,
        padding: square ? 0 : '0 12px',
        background: hover && !disabled ? t.bg.surface.secondary.default : 'transparent',
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: t.text.secondary.default,
        fontSize: fs,
        fontWeight: 600,
        opacity: disabled ? 0.4 : 1,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </button>
  );
}

function NavTextButton({
  t,
  h,
  fs,
  disabled,
  onClick,
  ariaLabel,
  children,
}: {
  t: VDSTheme;
  h: number;
  fs: number;
  disabled: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: h,
        padding: '0 12px',
        background: hover && !disabled ? t.bg.surface.secondary.default : 'transparent',
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: t.text.secondary.default,
        fontSize: fs,
        fontWeight: 600,
        opacity: disabled ? 0.4 : 1,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </button>
  );
}

function PageNumButton({
  t,
  page,
  active,
  sizePx,
  fs,
  disabled,
  onClick,
}: {
  t: VDSTheme;
  page: number;
  active: boolean;
  sizePx: number;
  fs: number;
  disabled: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Page ${page}`}
      aria-current={active ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: sizePx,
        height: sizePx,
        borderRadius: 8,
        border: active ? '1px solid transparent' : `1px solid ${hover && !disabled ? t.border.default.default : 'transparent'}`,
        background: active ? t.bg.fill.primary.default : hover && !disabled ? t.bg.surface.secondary.default : 'transparent',
        color: active ? '#FFFFFF' : t.text.secondary.default,
        fontSize: fs,
        fontWeight: active ? 700 : 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        padding: 0,
      }}
    >
      {page}
    </button>
  );
}

function Pagination({
  t,
  totalPages,
  currentPage,
  onPageChange,
  variant = 'default',
  size = 'md',
  siblings = 1,
  showFirstLast = false,
  showPageInfo = false,
  totalItems,
  pageSize,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  className,
}: {
  t: VDSTheme;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  variant?: PaginationVariant;
  size?: PaginationSize;
  siblings?: number;
  showFirstLast?: boolean;
  showPageInfo?: boolean;
  totalItems?: number;
  pageSize?: number;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
}) {
  const s = SIZE_MAP[size];
  const items = buildPageItems(totalPages, currentPage, siblings);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  const rangeStart = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
  const rangeEnd =
    totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : undefined;

  const infoLine =
    showPageInfo && totalItems && pageSize && rangeStart !== undefined && rangeEnd !== undefined
      ? `Showing ${rangeStart}–${rangeEnd} of ${totalItems} results`
      : showPageInfo
        ? `Page ${currentPage} of ${totalPages}`
        : null;

  const showFl = showFirstLast && variant === 'default';

  const navInner = (
    <>
      {variant === 'simple' || variant === 'compact' ? null : (
        <>
          {showFl ? (
            <NavIconButton
              t={t}
              h={s.h}
              fs={s.fontSize}
              square
              disabled={isFirst}
              ariaLabel="Go to first page"
              onClick={() => onPageChange(1)}
            >
              <ChevronsLeft size={16} aria-hidden />
            </NavIconButton>
          ) : null}
          {variant !== 'minimal' ? (
            <NavTextButton
              t={t}
              h={s.h}
              fs={s.fontSize}
              disabled={isFirst}
              ariaLabel="Go to previous page"
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft size={16} aria-hidden />
              {prevLabel}
            </NavTextButton>
          ) : null}
        </>
      )}

      {variant === 'simple' ? (
        <>
          <NavTextButton
            t={t}
            h={s.h}
            fs={s.fontSize}
            disabled={isFirst}
            ariaLabel="Go to previous page"
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft size={16} aria-hidden />
            {prevLabel}
          </NavTextButton>
          <NavTextButton
            t={t}
            h={s.h}
            fs={s.fontSize}
            disabled={isLast}
            ariaLabel="Go to next page"
            onClick={() => onPageChange(currentPage + 1)}
          >
            {nextLabel}
            <ChevronRight size={16} aria-hidden />
          </NavTextButton>
        </>
      ) : variant === 'compact' ? (
        <>
          <NavIconButton
            t={t}
            h={s.h}
            fs={s.fontSize}
            square
            disabled={isFirst}
            ariaLabel="Go to previous page"
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft size={16} aria-hidden />
          </NavIconButton>
          <span
            style={{
              fontSize: s.fontSize,
              fontWeight: 600,
              color: t.text.secondary.default,
              padding: '0 8px',
              userSelect: 'none',
            }}
          >
            Page {currentPage} of {totalPages}
          </span>
          <NavIconButton
            t={t}
            h={s.h}
            fs={s.fontSize}
            square
            disabled={isLast}
            ariaLabel="Go to next page"
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight size={16} aria-hidden />
          </NavIconButton>
        </>
      ) : (
        <>
          {items.map((it, idx) =>
            it === 'ellipsis' ? (
              <span
                key={`e-${idx}`}
                aria-hidden
                style={{
                  width: s.pageBtn,
                  height: s.pageBtn,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: t.text.tertiary.default,
                  cursor: 'default',
                }}
              >
                <MoreHorizontal size={16} aria-hidden />
              </span>
            ) : (
              <PageNumButton
                key={it}
                t={t}
                page={it}
                active={it === currentPage}
                sizePx={s.pageBtn}
                fs={s.fontSize}
                disabled={false}
                onClick={() => onPageChange(it)}
              />
            ),
          )}
          {variant !== 'minimal' ? (
            <NavTextButton
              t={t}
              h={s.h}
              fs={s.fontSize}
              disabled={isLast}
              ariaLabel="Go to next page"
              onClick={() => onPageChange(currentPage + 1)}
            >
              {nextLabel}
              <ChevronRight size={16} aria-hidden />
            </NavTextButton>
          ) : null}
          {showFl ? (
            <NavIconButton
              t={t}
              h={s.h}
              fs={s.fontSize}
              square
              disabled={isLast}
              ariaLabel="Go to last page"
              onClick={() => onPageChange(totalPages)}
            >
              <ChevronsRight size={16} aria-hidden />
            </NavIconButton>
          ) : null}
        </>
      )}
    </>
  );

  return (
    <nav className={className} aria-label="Pagination navigation" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>{navInner}</div>
      {infoLine && variant !== 'compact' ? (
        <span style={{ fontSize: s.fontSize, color: t.text.tertiary.default, fontWeight: 500 }}>{infoLine}</span>
      ) : null}
    </nav>
  );
}

/** Static pagination row for docs illustrations (non-interactive where noted). */
function PaginationStaticRow({
  t,
  variant,
  size = 'md',
  showFirstLast,
  page = 6,
  total = 12,
}: {
  t: VDSTheme;
  variant: PaginationVariant;
  size?: PaginationSize;
  showFirstLast?: boolean;
  page?: number;
  total?: number;
}) {
  return (
    <Pagination
      t={t}
      totalPages={total}
      currentPage={page}
      onPageChange={() => {}}
      variant={variant}
      size={size}
      showFirstLast={showFirstLast}
      showPageInfo={false}
      siblings={1}
      prevLabel={variant === 'default' ? 'Prev' : 'Previous'}
      nextLabel="Next"
    />
  );
}

export default function PaginationDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [variant, setVariant] = useState<PaginationVariant>('default');
  const [size, setSize] = useState<PaginationSize>('md');
  const [showFirstLast, setShowFirstLast] = useState<'off' | 'on'>('on');
  const [showPageInfo, setShowPageInfo] = useState<'off' | 'on'>('off');
  const [totalPages, setTotalPages] = useState<5 | 12 | 50>(12);
  const [currentPage, setCurrentPage] = useState(6);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const t = buildTheme(isDark);
  const previewDark = appearance === 'dark';
  const previewT = previewDark ? buildTheme(true) : t;

  const effectivePage = Math.min(currentPage, totalPages);
  const demoPageSize = 20;
  const demoTotalItems = totalPages * demoPageSize;

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-pg', label: 'Principles' },
        { id: 'anatomy-pg', label: 'Anatomy' },
        { id: 'variants-pg', label: 'Variants' },
        { id: 'sizes-pg', label: 'Sizes' },
        { id: 'states-pg', label: 'Page button states' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-pg', label: 'When to use' },
        { id: 'page-size', label: 'Choosing page size' },
        { id: 'dos-donts-pg', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'content-labels-pg', label: 'Button labels' },
        { id: 'content-page-info-pg', label: 'Page info text' },
        { id: 'content-aria-pg', label: 'Accessibility labels' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'props-pg', label: 'Pagination props' },
        { id: 'code-examples-pg', label: 'Examples' },
        { id: 'a11y-pg', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const paginationPropsRows = [
    { name: 'totalPages', type: 'number', default: '—', description: 'Total number of pages (required)', required: true as boolean },
    { name: 'currentPage', type: 'number', default: '—', description: 'Active page (required, 1-indexed)', required: true as boolean },
    {
      name: 'onPageChange',
      type: '(page: number) => void',
      default: '—',
      description: 'Page change handler (required)',
      required: true as boolean,
    },
    {
      name: 'variant',
      type: "'default' | 'simple' | 'compact' | 'minimal'",
      default: "'default'",
      description: 'Visual style',
    },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Button size' },
    { name: 'siblings', type: 'number', default: '1', description: 'Pages shown each side of active' },
    { name: 'showFirstLast', type: 'boolean', default: 'false', description: 'First/last jump buttons' },
    { name: 'showPageInfo', type: 'boolean', default: 'false', description: "'Page X of Y' text" },
    { name: 'totalItems', type: 'number', default: '—', description: 'Total items (for range display)' },
    { name: 'pageSize', type: 'number', default: '—', description: 'Items per page (for range display)' },
    { name: 'prevLabel', type: 'string', default: "'Previous'", description: 'Prev button label' },
    { name: 'nextLabel', type: 'string', default: "'Next'", description: 'Next button label' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const codeExamples = `// Basic controlled pagination
const [page, setPage] = useState(1)

<Pagination
  totalPages={12}
  currentPage={page}
  onPageChange={setPage}
/>

// With first/last + page info
<Pagination
  totalPages={24}
  currentPage={page}
  onPageChange={setPage}
  showFirstLast
  showPageInfo
/>

// With range info (Showing X–Y of Z)
<Pagination
  totalPages={12}
  currentPage={page}
  onPageChange={setPage}
  totalItems={240}
  pageSize={20}
  showPageInfo
/>

// Simple variant — blog navigation
<Pagination
  variant="simple"
  totalPages={8}
  currentPage={page}
  onPageChange={setPage}
  prevLabel="← Older posts"
  nextLabel="Newer posts →"
/>

// Compact variant — table footer
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <span style={{ fontSize: 13, color: t.text.tertiary.default }}>
    Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, 240)} of 240
  </span>
  <Pagination
    variant="compact"
    size="sm"
    totalPages={12}
    currentPage={page}
    onPageChange={setPage}
  />
</div>

// With URL sync (Next.js)
const router = useRouter()
const searchParams = useSearchParams()
const page = Number(searchParams.get('page') ?? 1)

<Pagination
  totalPages={totalPages}
  currentPage={page}
  onPageChange={(p) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    router.push(\`?\${params.toString()}\`)
  }}
  showFirstLast
  showPageInfo
/>

// More siblings — wider window
<Pagination
  totalPages={50}
  currentPage={page}
  onPageChange={setPage}
  siblings={2}
/>`;

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components{' '}
        <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Pagination
      </p>
      <h1 className="page-title">Pagination</h1>
      <p className="page-lead">
        Pagination breaks large datasets into discrete pages. It gives users a sense of position within a collection — they know how much there
        is, where they are, and how to get to any point. A well-designed pagination is invisible when everything is going well, and
        informative when the user needs to navigate.
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
                    options={['default', 'simple', 'compact', 'minimal']}
                    value={variant}
                    onChange={(v) => setVariant(v as PaginationVariant)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Size"
                    options={['sm', 'md', 'lg']}
                    value={size}
                    onChange={(v) => setSize(v as PaginationSize)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show first/last"
                    options={['off', 'on']}
                    value={showFirstLast}
                    onChange={(v) => setShowFirstLast(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show page info"
                    options={['off', 'on']}
                    value={showPageInfo}
                    onChange={(v) => setShowPageInfo(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Total pages"
                    options={['5', '12', '50']}
                    value={String(totalPages)}
                    onChange={(v) => setTotalPages(Number(v) as 5 | 12 | 50)}
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
                <Pagination
                  t={previewT}
                  totalPages={totalPages}
                  currentPage={effectivePage}
                  onPageChange={setCurrentPage}
                  variant={variant}
                  size={size}
                  siblings={1}
                  showFirstLast={showFirstLast === 'on'}
                  showPageInfo={showPageInfo === 'on'}
                  totalItems={showPageInfo === 'on' ? demoTotalItems : undefined}
                  pageSize={showPageInfo === 'on' ? demoPageSize : undefined}
                />
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-pg" style={{ marginBottom: 48 }}>
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
                <div style={{ ...dottedZone(t, 200), flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 160,
                        maxHeight: 72,
                        overflow: 'hidden',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        justifyContent: 'center',
                      }}
                    >
                      {Array.from({ length: 50 }, (_, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 8,
                            width: 14,
                            height: 14,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            border: `1px solid ${t.border.default.default}`,
                            color: t.text.tertiary.default,
                          }}
                        >
                          {i + 1}
                        </span>
                      ))}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Pagination
                        t={t}
                        totalPages={50}
                        currentPage={6}
                        onPageChange={() => {}}
                        variant="minimal"
                        size="sm"
                        siblings={1}
                      />
                      <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 8 }}>Smart truncation</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 10, color: t.text.tertiary.default }}>
                    <span>50 buttons</span>
                    <span style={{ color: t.text.secondary.default, fontWeight: 600 }}>vs</span>
                    <span>ellipsis + anchors</span>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <MoreHorizontal size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Show position, not every page</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A pagination with 50 visible page numbers is worse than useless — it&apos;s overwhelming. Show the current page, the pages
                    immediately adjacent, and anchors at the beginning and end. Ellipsis communicates that there are pages in between without
                    showing all of them.
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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Pagination
                        t={t}
                        totalPages={12}
                        currentPage={6}
                        onPageChange={() => {}}
                        variant="default"
                        size="sm"
                        showFirstLast={false}
                      />
                    </div>
                    <div style={{ fontSize: 9, color: t.text.brand.default, fontWeight: 700 }}>~80% of clicks → Prev / Next</div>
                    <ChevronRight size={14} style={{ color: t.text.tertiary.default }} aria-hidden />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.65 }}>
                      <Pagination
                        t={t}
                        totalPages={12}
                        currentPage={6}
                        onPageChange={() => {}}
                        variant="minimal"
                        size="sm"
                      />
                    </div>
                    <div style={{ fontSize: 9, color: t.text.tertiary.default }}>Numbers only — secondary</div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <ChevronRight size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Previous and Next are the primary actions</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Most pagination interactions are sequential — the user reads page 1, then goes to page 2. Previous and Next buttons handle
                    80%+ of navigation. Page number buttons exist for direct access. Design accordingly: Prev/Next should be visually prominent,
                    page numbers secondary.
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
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 140,
                        height: 100,
                        borderRadius: 8,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        padding: 6,
                        fontSize: 8,
                        color: t.text.tertiary.default,
                        overflow: 'hidden',
                        lineHeight: 1.35,
                      }}
                    >
                      {Array.from({ length: 200 }, (_, i) => (
                        <span key={i}>Row {i + 1} · </span>
                      ))}
                    </div>
                    <div style={{ width: 160 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Table</div>
                      <div style={{ height: 72, overflow: 'hidden', border: `1px solid ${t.border.default.default}`, borderRadius: 6, marginBottom: 8 }}>
                        {Array.from({ length: 20 }, (_, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '3px 6px',
                              borderBottom: `1px solid ${t.border.default.default}`,
                              fontSize: 8,
                              color: t.text.secondary.default,
                            }}
                          >
                            Row {i + 1}
                          </div>
                        ))}
                      </div>
                      <Pagination
                        t={t}
                        totalPages={10}
                        currentPage={1}
                        onPageChange={() => {}}
                        variant="compact"
                        size="sm"
                      />
                      <div style={{ fontSize: 8, color: t.text.tertiary.default, marginTop: 6, textAlign: 'center' }}>Showing 1–20 of 200 results</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 10, color: t.text.tertiary.default, flexWrap: 'wrap' }}>
                    <span>No pagination → performance + UX problems</span>
                    <span style={{ color: t.text.secondary.default, fontWeight: 600 }}>vs</span>
                    <span>Paginated → fast + scannable</span>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <ChevronsRight size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Pagination is a performance contract</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Pagination isn&apos;t just a UX pattern — it&apos;s a performance boundary. Loading 200 rows at once is expensive. Pagination tells
                    the server &apos;give me 20 at a time,&apos; which makes the interface faster, more responsive, and easier to scan. Page size is part
                    of the design, not an afterthought.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-pg" style={{ marginBottom: 48 }}>
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
              <div
                style={{
                  ...dottedZone(t, 280),
                  flexDirection: 'column',
                  gap: 20,
                  padding: '24px 20px',
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: 11,
                    lineHeight: 1.5,
                    color: t.text.primary.default,
                    textAlign: 'center',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {`┌────────────────────────────────────────────────────────────┐
│  [«] [‹ Prev]  [1] [···] [5] [6] [7] [···] [12]  [Next ›] [»]  │
└────────────────────────────────────────────────────────────┘`}
                </pre>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '8px 12px',
                    maxWidth: 720,
                    margin: '0 auto',
                  }}
                >
                  {(
                    [
                      ['A', 'First/Last button (ChevronsLeft/Right, no label, square, borderRadius 8px)'],
                      ['B', 'Prev/Next button (ChevronLeft/Right + label text, padding 0 12px, border 1px)'],
                      ['C', 'First/Last page number (always visible — page 1 and page 12)'],
                      ['D', 'Ellipsis (MoreHorizontal 16px, color tertiary, no interaction)'],
                      ['E', 'Sibling page numbers (1 each side of active by default)'],
                      ['F', 'Active page (bg fill.primary, color white, fontWeight 700, no border)'],
                    ] as const
                  ).map(([letter, txt]) => (
                    <div key={letter} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, maxWidth: 320 }}>
                      <AnnotationDot letter={letter} />
                      <span style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.45 }}>{txt}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, maxWidth: 720, margin: '0 auto' }}>
                  <AnnotationDot letter="G" />
                  <span style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.45 }}>
                    Page info text (optional — &quot;Page 6 of 12&quot; or &quot;Showing 101–120 of 240&quot;)
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section id="variants-pg" style={{ marginBottom: 48 }}>
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
                <div style={{ ...dottedZone(t, 140), padding: 12 }}>
                  <PaginationStaticRow t={t} variant="default" showFirstLast page={6} total={12} />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Default</div>
                  <span style={chipStyleB(t, { marginBottom: 10 })}>variant: default</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>
                    Full pagination with page numbers, prev/next, and optional first/last. Use for tables, search results, and any collection
                    with 5+ pages.
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
                <div style={{ ...dottedZone(t, 140), padding: 12 }}>
                  <PaginationStaticRow t={t} variant="simple" page={4} total={12} />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Simple</div>
                  <span style={chipStyleB(t, { marginBottom: 10 })}>variant: simple</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>
                    Previous and Next buttons only. Use when page numbers add no value — blog posts, wizard steps, onboarding flows where
                    sequential navigation is the only meaningful action.
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
                <div style={{ ...dottedZone(t, 140), padding: 12 }}>
                  <PaginationStaticRow t={t} variant="compact" page={6} total={12} />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Compact</div>
                  <span style={chipStyleB(t, { marginBottom: 10 })}>variant: compact</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>
                    Arrow buttons + &apos;Page X of Y&apos; text. Use in tight spaces — table footers, mobile, sidebars — where full pagination would
                    overflow.
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
                <div style={{ ...dottedZone(t, 140), padding: 12 }}>
                  <PaginationStaticRow t={t} variant="minimal" page={6} total={12} />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Minimal</div>
                  <span style={chipStyleB(t, { marginBottom: 10 })}>variant: minimal</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>
                    Page numbers only, no prev/next buttons. Use inside components that already have directional navigation — carousels, image
                    galleries, step indicators.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="sizes-pg" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {(
                [
                  { k: 'sm' as const, line: 'Dense tables, compact toolbars, mobile' },
                  { k: 'md' as const, line: 'Default — most list and table contexts' },
                  { k: 'lg' as const, line: 'Prominent pagination, touch-friendly, page-level nav' },
                ] as const
              ).map((row) => (
                <div
                  key={row.k}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                  }}
                >
                  <div style={{ width: 160, flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 13, fontWeight: 800, color: t.text.primary.default }}>
                      {row.k}
                    </div>
                    <div style={{ fontSize: 12, color: t.text.tertiary.default, marginTop: 4 }}>
                      {SIZE_MAP[row.k].h}px buttons · fontSize {SIZE_MAP[row.k].fontSize}px
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 200, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      t={t}
                      totalPages={12}
                      currentPage={6}
                      onPageChange={() => {}}
                      variant="compact"
                      size={row.k}
                    />
                  </div>
                  <div style={{ fontSize: 13, color: t.text.secondary.default, maxWidth: 320, lineHeight: 1.5 }}>{row.line}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="states-pg" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Page button states
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 120), padding: 12 }}>
                  <PageNumButton t={t} page={7} active={false} sizePx={36} fs={13} disabled={false} onClick={() => {}} />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Default</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>color.text.secondary.default</span>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>Inactive page. Transparent background and border.</p>
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
                <div style={{ ...dottedZone(t, 120), padding: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.secondary.default,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      color: t.text.secondary.default,
                    }}
                  >
                    7
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Hover</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>color.bg.surface.secondary.default</span>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Mouse over or keyboard focus. Border appears, subtle background.
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
                <div style={{ ...dottedZone(t, 120), padding: 12 }}>
                  <PageNumButton t={t} page={6} active sizePx={36} fs={13} disabled={false} onClick={() => {}} />
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Active / Selected</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>color.bg.fill.primary.default</span>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Current page. Brand background, white text. Always visible — never hidden by ellipsis.
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
                <div style={{ ...dottedZone(t, 120), padding: 12 }}>
                  <NavTextButton t={t} h={36} fs={13} disabled ariaLabel="Go to previous page" onClick={() => {}}>
                    <ChevronLeft size={16} aria-hidden />
                    Previous
                  </NavTextButton>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Disabled</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>opacity: 0.4</span>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Prev disabled on page 1, Next disabled on last page. Opacity reduction only — keep the button visible.
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
                <div style={{ ...dottedZone(t, 120), padding: 12 }}>
                  <button
                    type="button"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.secondary.default,
                      fontSize: 13,
                      fontWeight: 600,
                      color: t.text.secondary.default,
                      outline: `2px solid ${t.border.brand.focus}`,
                      outlineOffset: 2,
                      cursor: 'default',
                    }}
                  >
                    7
                  </button>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Focus (keyboard)</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>color.border.brand.focus</span>
                  <p style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    Keyboard focus ring. Required for accessibility — never remove the focus outline.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-pg" style={{ marginTop: 32, marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: t.text.tertiary.default, marginBottom: 12 }}>
                  DO
                </h3>
                <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75, margin: 0 }}>
                  <li>Tablas con más de 20 filas</li>
                  <li>Resultados de búsqueda</li>
                  <li>Listas de productos o artículos</li>
                  <li>Feeds de actividad y notificaciones</li>
                  <li>Cualquier colección donde cargar todos los items impacta el rendimiento</li>
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: t.text.tertiary.default, marginBottom: 12 }}>
                  DON&apos;T
                </h3>
                <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75, margin: 0 }}>
                  <li>Listas de menos de 20 items (mostrar todo)</li>
                  <li>Cuando infinite scroll es más natural para el caso de uso (social feeds, image galleries)</li>
                  <li>Cuando el usuario necesita comparar items entre páginas (cargar todo o usar filtros en lugar de paginar)</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="info" title="Pagination vs. infinite scroll">
                Pagination gives users control and position — they know they&apos;re on page 3 of 12. Infinite scroll gives users flow — they scroll
                without interruption. Use pagination for task-oriented contexts (finding a specific order, reviewing a report). Use infinite scroll
                for exploratory contexts (browsing a feed, discovering content).
              </Callout>
            </div>
          </section>

          <section id="page-size" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Choosing page size
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: t.text.tertiary.default, fontWeight: 700 }}>CONTEXT</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: t.text.tertiary.default, fontWeight: 700 }}>RECOMMENDED PAGE SIZE</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: t.text.tertiary.default, fontWeight: 700 }}>REASON</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ['Data tables', '20–50 rows', 'Dense data, users scan vertically'],
                      ['Search results', '10–20 items', 'User evaluates each result'],
                      ['Product listings', '24–48 items', 'Grid layout, visual scanning'],
                      ['Blog / articles', '10–15 items', 'Reading-focused, preview cards'],
                      ['Admin logs', '50–100 rows', 'Power users, dense review'],
                    ] as const
                  ).map((row) => (
                    <tr key={row[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: '12px 16px', color: t.text.primary.default, fontWeight: 600 }}>{row[0]}</td>
                      <td style={{ padding: '12px 16px', color: t.text.secondary.default }}>{row[1]}</td>
                      <td style={{ padding: '12px 16px', color: t.text.secondary.default }}>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="tip" title="Let users choose page size">
                For data tables and admin interfaces, add a page size selector (&apos;Show: 10 / 25 / 50 / 100&apos;). Power users prefer dense views;
                casual users prefer smaller pages. Default to 20–25 for most contexts.
              </Callout>
            </div>
          </section>

          <section id="dos-donts-pg" style={{ marginBottom: 48 }}>
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
                  <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    &quot;Showing 41–60 of 240 results&quot; — el usuario sabe exactamente dónde está
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#E8186D', marginBottom: 8 }}>DON&apos;T</div>
                  <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Pagination sin ningún indicador de cuántos items hay en total
                  </p>
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
                  <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Active page siempre visible — nunca dentro del ellipsis
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#E8186D', marginBottom: 8 }}>DON&apos;T</div>
                  <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Active page colapsada en el ellipsis — el usuario pierde su posición
                  </p>
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
                  <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Cambiar de página actualiza la URL (?page=3) — permite compartir, volver atrás y hacer bookmark
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#E8186D', marginBottom: 8 }}>DON&apos;T</div>
                  <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Pagination solo en estado local sin actualizar la URL — el botón back no funciona, los links no se pueden compartir
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title" id="content-labels-pg" style={{ marginBottom: 16 }}>
            Button labels
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>
              <strong style={{ color: t.text.primary.default }}>Previous:</strong> &apos;Previous&apos; or &apos;← Previous&apos; — never &apos;Back&apos; or &apos;&lt;&lt;&apos;
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>Next:</strong> &apos;Next&apos; or &apos;Next →&apos; — never &apos;Forward&apos; or &apos;&gt;&gt;&apos;
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>First/Last:</strong> icon only (ChevronsLeft/Right) — no text label needed
            </li>
          </ul>
          <h2 className="section-title" id="content-page-info-pg" style={{ marginTop: 32, marginBottom: 16 }}>
            Page info text
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>
              <strong style={{ color: t.text.primary.default }}>Position:</strong> &apos;Page 6 of 12&apos; — simple, unambiguous
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>Range:</strong> &apos;Showing 101–120 of 240 results&apos; — most informative for tables
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>Short:</strong> &apos;6 / 12&apos; — for very compact spaces only
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>Never:</strong> &apos;You are currently viewing page 6&apos; — too verbose
            </li>
          </ul>
          <h2 className="section-title" id="content-aria-pg" style={{ marginTop: 32, marginBottom: 16 }}>
            Accessibility labels (aria)
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>Prev button: aria-label=&apos;Go to previous page&apos;</li>
            <li>Next button: aria-label=&apos;Go to next page&apos;</li>
            <li>Page button: aria-label=&apos;Page 7&apos; + aria-current=&apos;page&apos; for active</li>
            <li>Ellipsis: aria-hidden=&apos;true&apos; — it&apos;s decorative</li>
            <li>Nav container: aria-label=&apos;Pagination navigation&apos;</li>
          </ul>
        </section>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="props-pg" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Pagination props
            </h2>
            <PropsTable props={paginationPropsRows} />
          </section>
          <section id="code-examples-pg" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Examples
            </h2>
            <CodeBlock code={codeExamples} language="tsx" />
          </section>
          <section id="a11y-pg" style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              Pagination is wrapped in a &lt;nav&gt; element with aria-label=&apos;Pagination navigation&apos;. Each page button has aria-label=&apos;Page
              N&apos; and aria-current=&apos;page&apos; for the active page. Prev/Next buttons have descriptive aria-labels. The ellipsis has
              aria-hidden=&apos;true&apos;. Keyboard: Tab moves between buttons, Enter/Space activates. The active page button receives focus after page
              change.
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
                Initial release. Pagination with default/simple/compact/minimal variants, 3 sizes, smart ellipsis with configurable siblings,
                first/last buttons, page info + range display, URL sync pattern, full ARIA nav pattern.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
