'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Filter,
  Minus,
  MoreHorizontal,
  Search,
  Trash2,
  Users,
  ChevronRight as BreadcrumbChevron,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type DemoVariant = 'default' | 'striped' | 'bordered';
type DemoDensity = 'compact' | 'default' | 'relaxed';

type DemoRow = {
  id: number;
  name: string;
  role: string;
  status: 'Active' | 'Invited' | 'Inactive';
  joined: string;
  joinedIso: string;
  projects: number;
};

const DEMO_ROWS: DemoRow[] = [
  { id: 1, name: 'Jane Lim', role: 'Designer', status: 'Active', joined: 'Jan 12, 2024', joinedIso: '2024-01-12', projects: 8 },
  { id: 2, name: 'Marcus Chen', role: 'Engineer', status: 'Active', joined: 'Mar 3, 2024', joinedIso: '2024-03-03', projects: 12 },
  { id: 3, name: 'Sophie R.', role: 'PM', status: 'Invited', joined: 'Apr 1, 2024', joinedIso: '2024-04-01', projects: 3 },
  { id: 4, name: 'Tom K.', role: 'Designer', status: 'Inactive', joined: 'Feb 20, 2024', joinedIso: '2024-02-20', projects: 5 },
  { id: 5, name: 'Priya N.', role: 'Engineer', status: 'Active', joined: 'May 7, 2024', joinedIso: '2024-05-07', projects: 9 },
];

const DENSITY_PAD: Record<DemoDensity, string> = {
  compact: '6px 12px',
  default: '10px 16px',
  relaxed: '14px 20px',
};

const DENSITY_ROW_MIN: Record<DemoDensity, number> = {
  compact: 36,
  default: 48,
  relaxed: 60,
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

function initialsFromName(name: string): string {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function StatusBadge({ status, t }: { status: DemoRow['status']; t: VDSTheme }) {
  const base: CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 6,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap',
  };
  if (status === 'Active') {
    return (
      <span style={{ ...base, background: 'rgba(10,136,83,0.12)', color: '#0A8853' }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: '#0A8853' }} aria-hidden />
        Active
      </span>
    );
  }
  if (status === 'Invited') {
    return (
      <span style={{ ...base, background: t.bg.fill.brandSubtle.default, color: t.text.brand.default }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: t.bg.fill.primary.default }} aria-hidden />
        Invited
      </span>
    );
  }
  return (
    <span style={{ ...base, background: t.bg.surface.tertiary.default, color: t.text.secondary.default }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: t.text.tertiary.default }} aria-hidden />
      Inactive
    </span>
  );
}

type SortKey = 'name' | 'role' | 'joined' | 'projects' | null;
type SortDir = 'asc' | 'desc' | null;

function TableInteractiveDemo({
  t,
  variant,
  density,
  selectable,
  sortable,
  hoverable,
  showFooter,
}: {
  t: VDSTheme;
  variant: DemoVariant;
  density: DemoDensity;
  selectable: boolean;
  sortable: boolean;
  hoverable: boolean;
  showFooter: boolean;
}) {
  const pad = DENSITY_PAD[density];
  const rowMin = DENSITY_ROW_MIN[density];
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpenId(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const sortedRows = useMemo(() => {
    const rows = [...DEMO_ROWS];
    if (!sortable || !sortKey || !sortDir) return rows;
    const mult = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      if (sortKey === 'projects') return (a.projects - b.projects) * mult;
      if (sortKey === 'joined') return a.joinedIso.localeCompare(b.joinedIso) * mult;
      const av = a[sortKey];
      const bv = b[sortKey];
      return String(av).localeCompare(String(bv)) * mult;
    });
    return rows;
  }, [sortKey, sortDir, sortable]);

  const toggleSort = (key: SortKey) => {
    if (!sortable || !key) return;
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }
    if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null);
    } else {
      setSortDir('asc');
    }
  };

  const allIds = DEMO_ROWS.map((r) => r.id);
  const allSelected = selectable && selected.size === allIds.length;
  const someSelected = selectable && selected.size > 0 && selected.size < allIds.length;

  const toggleRow = (id: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  };

  const clearSelection = () => setSelected(new Set());

  const totalProjects = DEMO_ROWS.reduce((s, r) => s + r.projects, 0);
  const thBase: CSSProperties = {
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: t.text.tertiary.default,
    padding: pad,
    textAlign: 'left',
    borderBottom: `2px solid ${t.border.strong.default}`,
    borderRight: variant === 'bordered' ? `1px solid ${t.border.default.default}` : undefined,
  };

  const tdBase: CSSProperties = {
    fontSize: 13,
    color: t.text.secondary.default,
    padding: pad,
    verticalAlign: 'middle',
    borderBottom: variant === 'bordered' ? `1px solid ${t.border.default.default}` : `1px solid ${t.border.default.default}`,
    borderRight: variant === 'bordered' ? `1px solid ${t.border.default.default}` : undefined,
    minHeight: rowMin,
    boxSizing: 'border-box',
  };

  const sortIcon = (key: SortKey) => {
    if (!sortable || !key) return null;
    const active = sortKey === key && sortDir;
    const Icon = !active ? ArrowUpDown : sortDir === 'asc' ? ArrowUp : ArrowDown;
    return (
      <Icon
        size={14}
        aria-hidden
        style={{
          flexShrink: 0,
          color: active ? t.text.brand.default : t.text.tertiary.default,
        }}
      />
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: 920, position: 'relative' }}>
      {selectable && selected.size > 0 ? (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 4,
            background: t.bg.fill.primary.default,
            color: '#FFFFFF',
            borderRadius: 8,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700 }}>{selected.size} selected</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: 6,
                padding: '6px 10px',
                color: '#FFF',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={14} aria-hidden />
              Download
            </button>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: 6,
                padding: '6px 10px',
                color: '#FFF',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={14} aria-hidden />
              Delete
            </button>
            <button
              type="button"
              onClick={clearSelection}
              aria-label="Clear selection"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFF',
                cursor: 'pointer',
                padding: 4,
                display: 'inline-flex',
              }}
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      <div
        style={{
          width: '100%',
          border: `1px solid ${t.border.default.default}`,
          borderRadius: 12,
          overflow: 'hidden',
          background: t.bg.surface.primary.default,
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            role={selectable || sortable ? 'grid' : undefined}
            aria-label="Team members"
            style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}
          >
            <thead>
              <tr style={{ background: t.bg.surface.secondary.default }}>
                {selectable ? (
                  <th style={{ ...thBase, width: 30, padding: pad }}>
                    <button
                      type="button"
                      onClick={toggleAll}
                      aria-label="Select all rows"
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 3,
                        border: `1px solid ${t.border.strong.default}`,
                        background:
                          allSelected || someSelected ? t.bg.fill.primary.default : t.bg.surface.primary.default,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {allSelected ? <Check size={10} color="#FFFFFF" strokeWidth={3} aria-hidden /> : null}
                      {someSelected ? <Minus size={10} color="#FFFFFF" strokeWidth={3} aria-hidden /> : null}
                    </button>
                  </th>
                ) : null}
                <th style={{ ...thBase, width: '22%' }}>
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort('name')}
                      aria-sort={
                        sortKey === 'name' ? (sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none') : 'none'
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: t.text.tertiary.default,
                        font: 'inherit',
                        textTransform: 'inherit',
                        letterSpacing: 'inherit',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = t.text.primary.default;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = t.text.tertiary.default;
                      }}
                    >
                      Name
                      {sortIcon('name')}
                    </button>
                  ) : (
                    'Name'
                  )}
                </th>
                <th style={{ ...thBase, width: '14%' }}>
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort('role')}
                      aria-sort={
                        sortKey === 'role' ? (sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none') : 'none'
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: t.text.tertiary.default,
                        font: 'inherit',
                        textTransform: 'inherit',
                        letterSpacing: 'inherit',
                      }}
                    >
                      Role
                      {sortIcon('role')}
                    </button>
                  ) : (
                    'Role'
                  )}
                </th>
                <th style={{ ...thBase, width: '14%' }}>Status</th>
                <th style={{ ...thBase, width: '16%' }}>
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort('joined')}
                      aria-sort={
                        sortKey === 'joined' ? (sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none') : 'none'
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: t.text.tertiary.default,
                        font: 'inherit',
                      }}
                    >
                      Joined
                      {sortIcon('joined')}
                    </button>
                  ) : (
                    'Joined'
                  )}
                </th>
                <th style={{ ...thBase, width: '12%', textAlign: 'right' }}>
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort('projects')}
                      aria-sort={
                        sortKey === 'projects' ? (sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none') : 'none'
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: t.text.tertiary.default,
                        font: 'inherit',
                        width: '100%',
                        justifyContent: 'flex-end',
                      }}
                    >
                      Projects
                      {sortIcon('projects')}
                    </button>
                  ) : (
                    'Projects'
                  )}
                </th>
                <th style={{ ...thBase, width: 48, textAlign: 'right' }} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, idx) => {
                const striped = variant === 'striped' && idx % 2 === 1;
                const rowBg = striped ? t.bg.surface.secondary.default : t.bg.surface.primary.default;
                const isSel = selected.has(row.id);
                return (
                  <tr
                    key={row.id}
                    style={{
                      background: isSel ? t.bg.fill.brandSubtle.default : rowBg,
                      borderBottom: variant !== 'bordered' ? `1px solid ${t.border.default.default}` : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!hoverable || isSel) return;
                      e.currentTarget.style.background = t.bg.surface.secondary.default;
                    }}
                    onMouseLeave={(e) => {
                      if (!hoverable) return;
                      e.currentTarget.style.background = isSel ? t.bg.fill.brandSubtle.default : rowBg;
                    }}
                  >
                    {selectable ? (
                      <td style={{ ...tdBase, width: 30 }}>
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => toggleRow(row.id)}
                          aria-label={`Select ${row.name}`}
                          style={{ width: 14, height: 14, accentColor: t.bg.fill.primary.default }}
                        />
                      </td>
                    ) : null}
                    <td
                      style={{
                        ...tdBase,
                        color: t.text.primary.default,
                        fontWeight: 600,
                        borderBottom: variant !== 'bordered' ? `1px solid ${t.border.default.default}` : tdBase.borderBottom,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            background: t.bg.fill.brandSubtle.default,
                            color: t.text.brand.default,
                            fontSize: 9,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                          aria-hidden
                        >
                          {initialsFromName(row.name)}
                        </div>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
                      </div>
                    </td>
                    <td style={tdBase}>{row.role}</td>
                    <td style={tdBase}>
                      <StatusBadge status={row.status} t={t} />
                    </td>
                    <td style={tdBase}>{row.joined}</td>
                    <td style={{ ...tdBase, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.projects}</td>
                    <td style={{ ...tdBase, textAlign: 'right', position: 'relative' }}>
                      <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={menuOpenId === row.id}
                        onClick={() => setMenuOpenId((id) => (id === row.id ? null : row.id))}
                        style={{
                          background: t.bg.surface.secondary.default,
                          border: `1px solid ${t.border.default.default}`,
                          borderRadius: 8,
                          padding: 6,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          color: t.text.secondary.default,
                        }}
                      >
                        <MoreHorizontal size={16} aria-hidden />
                      </button>
                      {menuOpenId === row.id ? (
                        <div
                          ref={menuRef}
                          role="menu"
                          style={{
                            position: 'absolute',
                            right: 8,
                            top: '100%',
                            marginTop: 4,
                            background: t.bg.surface.primary.default,
                            border: `1px solid ${t.border.default.default}`,
                            borderRadius: 8,
                            boxShadow: t.shadow.md,
                            zIndex: 10,
                            minWidth: 120,
                            padding: 4,
                          }}
                        >
                          <button
                            type="button"
                            role="menuitem"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              width: '100%',
                              padding: '8px 10px',
                              border: 'none',
                              background: 'transparent',
                              fontSize: 13,
                              cursor: 'pointer',
                              color: t.text.primary.default,
                              textAlign: 'left',
                            }}
                            onClick={() => setMenuOpenId(null)}
                          >
                            <Edit size={14} aria-hidden />
                            Edit
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              width: '100%',
                              padding: '8px 10px',
                              border: 'none',
                              background: 'transparent',
                              fontSize: 13,
                              cursor: 'pointer',
                              color: t.text.danger.default,
                              textAlign: 'left',
                            }}
                            onClick={() => setMenuOpenId(null)}
                          >
                            <Trash2 size={14} aria-hidden />
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {showFooter ? (
              <tfoot>
                <tr style={{ background: t.bg.surface.secondary.default }}>
                  <td
                    colSpan={selectable ? 4 : 3}
                    style={{
                      ...tdBase,
                      fontWeight: 600,
                      color: t.text.primary.default,
                      borderTop: `2px solid ${t.border.strong.default}`,
                      borderBottom: 'none',
                    }}
                  >
                    5 members
                  </td>
                  <td
                    colSpan={selectable ? 3 : 3}
                    style={{
                      ...tdBase,
                      textAlign: 'right',
                      fontWeight: 600,
                      color: t.text.primary.default,
                      borderTop: `2px solid ${t.border.strong.default}`,
                      borderBottom: 'none',
                    }}
                  >
                    Total: {totalProjects}
                  </td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </div>
    </div>
  );
}

export default function TableDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [variant, setVariant] = useState<DemoVariant>('default');
  const [density, setDensity] = useState<DemoDensity>('default');
  const [selectable, setSelectable] = useState<'off' | 'on'>('on');
  const [sortable, setSortable] = useState<'off' | 'on'>('on');
  const [hoverable, setHoverable] = useState<'off' | 'on'>('on');
  const [footer, setFooter] = useState<'off' | 'on'>('on');

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
        { id: 'principles-ta', label: 'Principles' },
        { id: 'anatomy-ta', label: 'Anatomy' },
        { id: 'variants-ta', label: 'Variants' },
        { id: 'features-ta', label: 'Features' },
        { id: 'density-ta', label: 'Density' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-ta', label: 'When to use' },
        { id: 'column-design', label: 'Designing columns' },
        { id: 'dos-donts-ta', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'content-headers-ta', label: 'Column headers' },
        { id: 'content-cells-ta', label: 'Cell content' },
        { id: 'content-status-ta', label: 'Status values' },
        { id: 'content-actions-ta', label: 'Actions column' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'props-ta', label: 'Props' },
        { id: 'column-def-ta', label: 'ColumnDef' },
        { id: 'examples-ta', label: 'Examples' },
        { id: 'a11y-ta', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const tablePropsRows = [
    { name: 'columns', type: 'ColumnDef[]', default: '—', description: 'Column definitions (required)', required: true as boolean },
    { name: 'rows', type: 'Record<string, any>[]', default: '—', description: 'Data rows (required)', required: true as boolean },
    { name: 'variant', type: "'default' | 'striped' | 'bordered'", default: "'default'", description: 'Visual style' },
    { name: 'density', type: "'compact' | 'default' | 'relaxed'", default: "'default'", description: 'Row height / padding' },
    { name: 'selectable', type: 'boolean', default: 'false', description: 'Checkbox selection column' },
    { name: 'sortable', type: 'boolean', default: 'false', description: 'Enables column sorting' },
    { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Sticky thead on scroll' },
    { name: 'pagination', type: 'boolean', default: 'false', description: 'Pagination footer' },
    { name: 'pageSize', type: 'number', default: '10', description: 'Rows per page' },
    { name: 'emptyState', type: 'ReactNode', default: '—', description: 'Empty state content' },
    { name: 'onRowClick', type: '(row) => void', default: '—', description: 'Row click handler' },
    { name: 'onSelectionChange', type: '(selectedIds) => void', default: '—', description: 'Selection change handler' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components{' '}
        <BreadcrumbChevron size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Table
      </p>
      <h1 className="page-title">Table</h1>
      <p className="page-lead">
        Tables display structured data in rows and columns. They&apos;re the primary pattern for comparing multiple items across shared attributes. A
        well-designed table makes dense data scannable — the user can find, sort, filter, and act on information without losing their place.
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
                    options={['default', 'striped', 'bordered']}
                    value={variant}
                    onChange={setVariant}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Density"
                    options={['compact', 'default', 'relaxed']}
                    value={density}
                    onChange={setDensity}
                  />
                  <LivePreviewSegmentRow t={t} label="Selectable" options={['off', 'on']} value={selectable} onChange={setSelectable} />
                  <LivePreviewSegmentRow t={t} label="Sortable" options={['off', 'on']} value={sortable} onChange={setSortable} />
                  <LivePreviewSegmentRow t={t} label="Hoverable" options={['off', 'on']} value={hoverable} onChange={setHoverable} />
                  <LivePreviewSegmentRow t={t} label="Footer" options={['off', 'on']} value={footer} onChange={setFooter} />
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
                  minHeight: 420,
                  padding: 24,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TableInteractiveDemo
                  t={previewT}
                  variant={variant}
                  density={density}
                  selectable={selectable === 'on'}
                  sortable={sortable === 'on'}
                  hoverable={hoverable === 'on'}
                  showFooter={footer === 'on'}
                />
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-ta" style={{ marginBottom: 48 }}>
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 20 }}>
                  <ArrowUpDown size={18} color={t.text.brand.default} style={{ opacity: 0.55, marginBottom: 12 }} aria-hidden />
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: t.text.tertiary.default, textAlign: 'center' }}>
                      <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 8, padding: 8, background: t.bg.surface.primary.default }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontWeight: 800 }}>REVENUE</span>
                          <ArrowUpDown size={12} color={t.text.tertiary.default} />
                        </div>
                        <div style={{ fontSize: 10, color: t.text.secondary.default }}>120</div>
                        <div style={{ fontSize: 10, color: t.text.secondary.default }}>95</div>
                        <div style={{ fontSize: 10, color: t.text.secondary.default }}>210</div>
                      </div>
                      Unsorted
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: t.text.brand.default, marginTop: 24 }}>→</span>
                    <div style={{ fontSize: 9, fontWeight: 800, color: t.text.tertiary.default, textAlign: 'center' }}>
                      <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 8, padding: 8, background: t.bg.surface.primary.default }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, color: t.text.brand.default }}>
                          <span style={{ fontWeight: 800 }}>REVENUE</span>
                          <ArrowDown size={12} color={t.text.brand.default} />
                        </div>
                        <div style={{ fontSize: 10, color: t.text.secondary.default }}>210</div>
                        <div style={{ fontSize: 10, color: t.text.secondary.default }}>120</div>
                        <div style={{ fontSize: 10, color: t.text.secondary.default }}>95</div>
                      </div>
                      Sorted desc
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Sort reveals patterns</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Sorting is the most powerful action in a table. When users sort by a column, they&apos;re forming a hypothesis — &apos;who has the most
                    projects?&apos; A sortable table turns passive data into an active exploration tool. Make the sort state visible and reversible.
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
                  <Check size={18} color={t.text.brand.default} style={{ opacity: 0.55, marginBottom: 12 }} aria-hidden />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 260,
                        background: t.bg.fill.primary.default,
                        color: '#FFF',
                        borderRadius: 8,
                        padding: '8px 12px',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>2 selected</span>
                      <span style={{ display: 'flex', gap: 8, fontSize: 10, fontWeight: 600 }}>
                        <span>Delete</span>
                        <span>Export</span>
                      </span>
                    </div>
                    <div style={{ width: '100%', maxWidth: 260, border: `1px solid ${t.border.default.default}`, borderRadius: 8, overflow: 'hidden' }}>
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 8px',
                            background: t.bg.fill.brandSubtle.default,
                            borderBottom: `1px solid ${t.border.default.default}`,
                            fontSize: 10,
                          }}
                        >
                          <Check size={12} color={t.bg.fill.primary.default} />
                          Row {i}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Selection enables bulk actions</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Row selection shifts the table from read-only to actionable. When rows are selected, surface bulk actions — delete, export, assign,
                    tag. The bulk action bar appears only when there&apos;s a selection, keeping the UI clean the rest of the time.
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
                  <Eye size={18} color={t.text.brand.default} style={{ opacity: 0.55, marginBottom: 12 }} aria-hidden />
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, fontSize: 7, marginBottom: 6 }}>
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} style={{ padding: 4, border: `1px solid ${t.border.default.default}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Col{i + 1}
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 800, color: '#E8186D', textAlign: 'center' }}>Too many cols</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 2, fontSize: 8 }}>
                        {['Name', 'Role', 'Status'].map((h) => (
                          <div key={h} style={{ padding: 4, border: `1px solid ${t.border.default.default}`, fontWeight: 800 }}>
                            {h}
                          </div>
                        ))}
                        {['Jane Lim', 'Design', '●'].map((c, i) => (
                          <div key={i} style={{ padding: 4, border: `1px solid ${t.border.default.default}` }}>
                            {c}
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 800, color: '#0A8853', textAlign: 'center', marginTop: 6 }}>Right columns</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Show only what matters</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A table with 12 columns is rarely useful — it forces horizontal scrolling and dilutes focus. Choose 4–7 columns that answer the
                    user&apos;s primary question. Let them access secondary data through a detail view, not a wider table.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-ta" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                minHeight: 360,
                ...dottedZone(t, 360),
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                position: 'relative',
                padding: 20,
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: 520,
                  margin: '0 auto',
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: t.bg.surface.primary.default,
                  fontSize: 10,
                  position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', left: -8, top: -8 }}>
                  <AnnotationDot letter="A" />
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: t.bg.surface.secondary.default }}>
                      <th style={{ padding: 6, borderBottom: `2px solid ${t.border.strong.default}`, width: 24 }}>
                        <span style={{ color: '#E8186D', fontWeight: 800 }}>D</span>
                      </th>
                      <th style={{ padding: 6, borderBottom: `2px solid ${t.border.strong.default}`, color: t.text.tertiary.default }}>
                        <span style={{ color: '#E8186D' }}>C</span> NAME <ArrowUpDown size={10} style={{ display: 'inline' }} />
                      </th>
                      <th style={{ padding: 6, borderBottom: `2px solid ${t.border.strong.default}` }}>ROLE</th>
                      <th style={{ padding: 6, borderBottom: `2px solid ${t.border.strong.default}` }}>STATUS</th>
                      <th style={{ padding: 6, borderBottom: `2px solid ${t.border.strong.default}` }}>JOINED</th>
                      <th style={{ padding: 6, borderBottom: `2px solid ${t.border.strong.default}`, textAlign: 'right' }}>···</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: t.bg.fill.brandSubtle.default }}>
                      <td style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}` }}>☑</td>
                      <td style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}`, fontWeight: 700 }}>
                        <span style={{ color: '#E8186D', fontWeight: 800 }}>F</span> Jane Lim
                      </td>
                      <td style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}` }}>Designer</td>
                      <td style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}` }}>●Active</td>
                      <td style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}` }}>Jan 12</td>
                      <td style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}`, textAlign: 'right' }}>···</td>
                    </tr>
                    <tr>
                      <td style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}` }}>
                        <span style={{ color: '#E8186D', fontWeight: 800 }}>G</span> ☐
                      </td>
                      <td style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}` }}>Marcus C</td>
                      <td style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}` }}>Engineer</td>
                      <td style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}` }}>●Active</td>
                      <td style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}` }}>Mar 3</td>
                      <td style={{ padding: 6, borderBottom: `1px solid ${t.border.default.default}`, textAlign: 'right' }}>···</td>
                    </tr>
                    <tr>
                      <td style={{ padding: 6 }}>☐</td>
                      <td style={{ padding: 6 }}>Sophie R</td>
                      <td style={{ padding: 6 }}>PM</td>
                      <td style={{ padding: 6 }}>●Invited</td>
                      <td style={{ padding: 6 }}>Apr 1</td>
                      <td style={{ padding: 6, textAlign: 'right' }}>···</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: 0,
                          height: 0,
                          borderTop: `2px solid ${t.border.strong.default}`,
                          lineHeight: 0,
                        }}
                      />
                    </tr>
                    <tr style={{ background: t.bg.surface.secondary.default }}>
                      <td colSpan={3} style={{ padding: 8 }}>
                        <span style={{ color: '#E8186D', fontWeight: 800 }}>I</span> 5 members
                      </td>
                      <td colSpan={3} style={{ padding: 8, textAlign: 'right' }}>
                        Total: 37
                      </td>
                    </tr>
                  </tfoot>
                </table>
                <div style={{ position: 'absolute', right: 32, top: 48, fontSize: 10, fontWeight: 700, color: '#E8186D' }}>B thead</div>
                <div style={{ position: 'absolute', left: '50%', top: 112, transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: '#E8186D' }}>
                  E divider
                </div>
                <div style={{ position: 'absolute', left: '50%', bottom: 56, transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: '#E8186D' }}>
                  H footer top
                </div>
                <div style={{ position: 'absolute', right: 24, bottom: 16, fontSize: 10, fontWeight: 700, color: '#E8186D' }}>J container</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 12, lineHeight: 1.65 }}>
              A → Table container (width 100%, border 1px border.default, borderRadius 12px, overflow hidden) · B → thead (bg surface.secondary, sticky top
              when stickyHeader) · C → Sortable th (cursor pointer, ArrowUpDown icon, hover color primary) · D → Checkbox th (width 30px, indeterminate
              state with Minus icon) · E → Header bottom border (2px solid border.strong) · F → Selected tr (bg fill.brandSubtle, checkbox checked) · G →
              Default tr (borderBottom 1px border.default, hover bg surface.secondary) · H → Footer top border (2px solid border.strong) · I → tfoot (bg
              surface.secondary, summary data) · J → Outer container (borderRadius 12px, border 1px, overflow hidden)
            </p>
          </section>

          <section id="variants-ta" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {(
                [
                  {
                    title: 'Default',
                    chip: 'variant: default',
                    desc: 'Clean rows separated by 1px borders. The go-to for most data tables. Maximum readability, minimum noise.',
                    node: (
                      <div style={{ width: '100%', maxWidth: 220 }}>
                        {[0, 1, 2].map((r) => (
                          <div
                            key={r}
                            style={{
                              padding: '6px 8px',
                              borderBottom: r < 2 ? `1px solid ${t.border.default.default}` : 'none',
                              fontSize: 10,
                              color: t.text.secondary.default,
                            }}
                          >
                            Row {r + 1}
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    title: 'Striped',
                    chip: 'variant: striped',
                    desc: 'Alternating row backgrounds improve scannability in wide tables with many columns. Use when users need to track data horizontally across a row.',
                    node: (
                      <div style={{ width: '100%', maxWidth: 220, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border.default.default}` }}>
                        {[0, 1, 2].map((r) => (
                          <div
                            key={r}
                            style={{
                              padding: '6px 8px',
                              background: r % 2 === 0 ? t.bg.surface.primary.default : t.bg.surface.secondary.default,
                              fontSize: 10,
                              color: t.text.secondary.default,
                            }}
                          >
                            Row {r + 1}
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    title: 'Bordered',
                    chip: 'variant: bordered',
                    desc: 'Full cell borders — both horizontal and vertical. Use for dense data grids where column separation is critical, such as financial or spreadsheet-style tables.',
                    node: (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, width: '100%', maxWidth: 220 }}>
                        {['A', 'B', 'C'].map((c) => (
                          <div key={c} style={{ border: `1px solid ${t.border.default.default}`, padding: 6, fontSize: 9, textAlign: 'center' }}>
                            {c}
                          </div>
                        ))}
                        {[1, 2, 3].map((c) => (
                          <div key={c} style={{ border: `1px solid ${t.border.default.default}`, padding: 6, fontSize: 9, textAlign: 'center' }}>
                            {c}
                          </div>
                        ))}
                        {[4, 5, 6].map((c) => (
                          <div key={c} style={{ border: `1px solid ${t.border.default.default}`, padding: 6, fontSize: 9, textAlign: 'center' }}>
                            {c}
                          </div>
                        ))}
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
                  <div style={{ ...dottedZone(t, 180), borderRadius: 0 }}>{v.node}</div>
                  <div style={{ padding: '12px 16px' }}>
                    <span style={chipStyleB(t)}>{v.chip}</span>
                  </div>
                  <div style={{ padding: '0 16px 16px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>{v.title}</div>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="features-ta" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Features
            </h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.65, marginBottom: 20, maxWidth: 720 }}>
              Table features can be combined. Each is opt-in and controlled by a prop.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    title: 'Sorting',
                    chip: 'sortable: true',
                    desc: 'Click a column header to sort. Click again to reverse. Third click clears the sort. Only one column sorted at a time.',
                    node: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, color: t.text.tertiary.default }}>
                          COL <ArrowUpDown size={12} />
                        </div>
                        <span style={{ color: t.text.brand.default, fontWeight: 800 }}>→</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, color: t.text.brand.default }}>
                          COL <ArrowUp size={12} />
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Selection',
                    chip: 'selectable: true',
                    desc: 'Checkbox column enables row selection. Header checkbox selects/deselects all. Bulk actions appear when selection is active.',
                    node: (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', width: '100%' }}>
                        <div
                          style={{
                            width: '90%',
                            background: t.bg.fill.primary.default,
                            color: '#FFF',
                            borderRadius: 6,
                            padding: '6px 8px',
                            fontSize: 9,
                            fontWeight: 700,
                            textAlign: 'center',
                          }}
                        >
                          2 selected
                        </div>
                        <div style={{ width: '90%', border: `1px solid ${t.border.default.default}`, borderRadius: 6, fontSize: 9, padding: 4 }}>☑ ☑</div>
                      </div>
                    ),
                  },
                  {
                    title: 'Sticky header',
                    chip: 'stickyHeader: true',
                    desc: 'Column headers stay visible while scrolling. Essential for tables taller than the viewport.',
                    node: (
                      <div style={{ position: 'relative', height: 100, width: '100%', maxWidth: 200, border: `1px solid ${t.border.default.default}`, borderRadius: 8, overflow: 'hidden' }}>
                        <div
                          style={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            background: t.bg.surface.secondary.default,
                            padding: 6,
                            fontSize: 9,
                            fontWeight: 800,
                            borderBottom: `1px solid ${t.border.default.default}`,
                          }}
                        >
                          HEADER
                        </div>
                        <div style={{ fontSize: 8, padding: 4, lineHeight: 1.8 }}>
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i}>Row {i + 1}</div>
                          ))}
                        </div>
                        <div style={{ position: 'absolute', bottom: 4, right: 4, fontSize: 16, color: t.text.brand.default }}>↓</div>
                      </div>
                    ),
                  },
                  {
                    title: 'Pagination',
                    chip: 'pagination: true',
                    desc: 'Breaks data into pages. Shows current range, total count, and navigation controls. PageSize selector optional.',
                    node: (
                      <div style={{ fontSize: 9, color: t.text.secondary.default, textAlign: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 6, color: t.text.tertiary.default }}>
                          <Search size={14} aria-hidden />
                          <Filter size={14} aria-hidden />
                        </div>
                        <div style={{ marginBottom: 6 }}>Showing 1–10 of 48 results</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <ChevronLeft size={14} />
                          <span style={{ fontWeight: 700 }}>1</span>
                          <span>2</span>
                          <span>3</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Empty state',
                    chip: 'emptyState prop',
                    desc: 'Custom empty state when there are no rows. Always explain why the table is empty and offer a next action.',
                    node: (
                      <div style={{ textAlign: 'center', padding: '8px 4px' }}>
                        <Search size={24} color={t.text.tertiary.default} style={{ marginBottom: 4 }} aria-hidden />
                        <div style={{ fontSize: 10, fontWeight: 700, color: t.text.primary.default }}>No members yet</div>
                        <div style={{ fontSize: 8, color: t.text.secondary.default, marginBottom: 6 }}>Invite your first team member</div>
                        <div style={{ fontSize: 8, padding: '4px 8px', borderRadius: 6, background: t.bg.fill.primary.default, color: '#FFF', display: 'inline-block' }}>Invite</div>
                      </div>
                    ),
                  },
                ] as const
              ).map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 140), borderRadius: 0 }}>{f.node}</div>
                  <div style={{ padding: '12px 16px' }}>
                    <span style={chipStyleB(t)}>{f.chip}</span>
                  </div>
                  <div style={{ padding: '0 16px 16px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>{f.title}</div>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="density-ta" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Density
            </h2>
            <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.65, marginBottom: 16, maxWidth: 720 }}>
              Three density levels adapt the table to different contexts — from compact dashboards to relaxed admin panels.
            </p>
            <div
              style={{
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 14,
                overflow: 'hidden',
                background: t.bg.surface.primary.default,
              }}
            >
              {(
                [
                  { k: 'compact' as const, rh: 36, pad: '6px / 12px', note: 'Dashboards, data grids, max information density' },
                  { k: 'default' as const, rh: 48, pad: '10px / 16px', note: 'Default — most admin and data contexts' },
                  { k: 'relaxed' as const, rh: 60, pad: '14px / 20px', note: 'Settings pages, user-facing tables, touch-friendly' },
                ] as const
              ).map((row, i) => (
                <div
                  key={row.k}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 1fr 2fr',
                    gap: 12,
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: i < 2 ? `1px solid ${t.border.default.default}` : 'none',
                    minHeight: row.rh,
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 12, color: t.text.primary.default }}>{row.k}</span>
                  <span style={{ fontSize: 12, color: t.text.secondary.default }}>{row.rh}px row</span>
                  <span style={{ fontSize: 12, color: t.text.secondary.default }}>padding {row.pad}</span>
                  <span style={{ fontSize: 12, color: t.text.tertiary.default }}>{row.note}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-ta" style={{ marginTop: 32, marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: t.text.primary.default, marginBottom: 10 }}>Do</h3>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.text.secondary.default, lineHeight: 1.65 }}>
                  <li>Compare multiple entities across the same attributes (users, orders, products).</li>
                  <li>Manage collections of data (CRUD — create, edit, delete from the table).</li>
                  <li>Export or process data in bulk.</li>
                  <li>Show structured data with clear relationships between columns.</li>
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: t.text.primary.default, marginBottom: 10 }}>Don&apos;t</h3>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: t.text.secondary.default, lineHeight: 1.65 }}>
                  <li>Show a single item with many attributes (use a detail page with sections).</li>
                  <li>Force non-tabular data into a grid (use cards or lists).</li>
                  <li>Use a table for fewer than three items that do not need comparison (use a simple list).</li>
                  <li>Prefer a card grid when content is mostly visual.</li>
                </ul>
              </div>
            </div>
            <Callout variant="warning" title="Mobile tables">
              Tables wider than the mobile viewport need special treatment. Options: horizontal scroll wrapper, column hiding (show only the two most
              important on mobile), or switching to a card list on small screens. Never let a table overflow its container silently.
            </Callout>
          </section>

          <section id="column-design" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Designing columns
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 12, padding: 16, background: t.bg.surface.primary.default }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: t.text.primary.default }}>RULE 1 — Limit to 4–7 columns</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, fontSize: 8, border: `1px solid ${t.border.default.default}`, borderRadius: 6, padding: 4 }}>
                    {[1, 2, 3, 4].map((c) => (
                      <div key={c} style={{ padding: 2 }}>
                        Col {c}
                      </div>
                    ))}
                    <div style={{ color: '#0A8853', fontSize: 7, fontWeight: 800, marginTop: 4 }}>Legible</div>
                  </div>
                  <div style={{ flex: 1, fontSize: 7, border: `1px solid ${t.border.default.default}`, borderRadius: 6, padding: 4, overflow: 'hidden' }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i} style={{ display: 'inline-block', width: '8%', padding: 1 }}>
                        c
                      </span>
                    ))}
                    <div style={{ color: '#E8186D', fontSize: 7, fontWeight: 800, marginTop: 4 }}>Illegible</div>
                  </div>
                </div>
              </div>
              <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 12, padding: 16, background: t.bg.surface.primary.default }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: t.text.primary.default }}>RULE 2 — Put the primary identifier first</div>
                <div style={{ fontSize: 10, border: `1px solid ${t.border.default.default}`, borderRadius: 6, padding: 8 }}>
                  <span style={{ fontWeight: 800, color: t.text.primary.default }}>Name</span>
                  <span style={{ color: t.text.secondary.default, marginLeft: 8 }}>Role · Status</span>
                </div>
              </div>
              <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 12, padding: 16, background: t.bg.surface.primary.default }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: t.text.primary.default }}>RULE 3 — Right-align numbers</div>
                <div style={{ fontSize: 10, textAlign: 'right', fontVariantNumeric: 'tabular-nums', border: `1px solid ${t.border.default.default}`, borderRadius: 6, padding: 8 }}>
                  <div>12,450.00</div>
                  <div>3,200.50</div>
                  <div>980.10</div>
                </div>
              </div>
              <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 12, padding: 16, background: t.bg.surface.primary.default }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: t.text.primary.default }}>RULE 4 — Use badges for status</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(10,136,83,0.12)', color: '#0A8853' }}>Active</span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: t.bg.surface.tertiary.default, color: t.text.secondary.default }}>Inactive</span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(240,115,50,0.12)', color: '#F07332' }}>Pending</span>
                </div>
              </div>
            </div>
          </section>

          <section id="dos-donts-ta" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <IllustratedDoDont
                t={t}
                ok
                title="Empty state with action"
                caption="Do: empty table with “No projects yet” and a button to create the first project. Don’t: thead only and a completely blank body — the user won’t know what to do next."
              >
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 8, padding: 12, minWidth: 140, textAlign: 'center', fontSize: 10 }}>
                    <div style={{ fontWeight: 800, marginBottom: 4 }}>No projects yet</div>
                    <div style={{ padding: '4px 8px', borderRadius: 6, background: t.bg.fill.primary.default, color: '#FFF', display: 'inline-block' }}>Create project</div>
                  </div>
                  <div style={{ border: `1px dashed ${t.border.default.default}`, borderRadius: 8, padding: 12, minWidth: 140, minHeight: 60, fontSize: 10, color: t.text.tertiary.default }}>
                    (blank)
                  </div>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Truncate, don’t wrap"
                caption="Do: long text truncated with ellipsis and a Tooltip on hover for the full value. Don’t: wrapping text across many lines that breaks the vertical rhythm of the table."
              >
                <div style={{ display: 'flex', gap: 12, flexDirection: 'column', fontSize: 10, width: '100%', maxWidth: 280 }}>
                  <div style={{ border: `1px solid ${t.border.default.default}`, padding: 6, borderRadius: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Very long product name that…
                  </div>
                  <div style={{ border: `1px solid ${t.border.default.default}`, padding: 6, borderRadius: 6, lineHeight: 1.4 }}>
                    Very long product name that breaks across multiple lines and pushes row height
                  </div>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Bulk actions only when selected"
                caption="Do: show the bulk action bar only when at least one row is selected. Don’t: keep bulk delete or export visible when nothing is selected."
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', width: '100%' }}>
                  <div style={{ width: '100%', maxWidth: 200, background: t.bg.fill.primary.default, color: '#FFF', borderRadius: 6, padding: 6, fontSize: 9, textAlign: 'center' }}>1 selected · Actions</div>
                  <div style={{ width: '100%', maxWidth: 200, opacity: 0.35, background: t.bg.surface.tertiary.default, borderRadius: 6, padding: 6, fontSize: 9, textAlign: 'center' }}>Actions (always on)</div>
                </div>
              </IllustratedDoDont>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="content-headers-ta" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Column headers
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.75 }}>
              <li>Short noun or noun phrase: &apos;Name&apos;, &apos;Status&apos;, &apos;Joined&apos;, &apos;Revenue&apos;.</li>
              <li>No verbs — headers describe the data, not the action.</li>
              <li>Sentence case, no punctuation.</li>
              <li>Include the unit in the header when relevant: &apos;Revenue (USD)&apos;, &apos;Weight (kg)&apos;.</li>
            </ul>
          </section>
          <section id="content-cells-ta" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Cell content
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.75 }}>
              <li>Truncate long text to one line with ellipsis — use Tooltip for the full value.</li>
              <li>Dates: use one consistent format across all rows — &apos;Jan 12, 2024&apos; or &apos;2024-01-12&apos;, not both.</li>
              <li>Numbers: right-align and use consistent decimal places.</li>
              <li>Empty cell: show an em dash (—), not blank space.</li>
            </ul>
          </section>
          <section id="content-status-ta" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Status values
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.75 }}>
              <li>Use consistent Badge variants across the table — add a legend if needed.</li>
              <li>Limit to three or four status values — more creates cognitive overload.</li>
            </ul>
          </section>
          <section id="content-actions-ta" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Actions column
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.75 }}>
              <li>Label the column &apos;Actions&apos; or leave the header empty.</li>
              <li>Use an icon button with MoreHorizontal — opens a Popover or Dropdown in context.</li>
              <li>The most critical action can be a direct control (for example &apos;Edit&apos;) when space allows.</li>
            </ul>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="props-ta" style={{ marginTop: 32, marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Table props
            </h2>
            <PropsTable props={tablePropsRows} />
          </section>
          <section id="column-def-ta" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              ColumnDef type
            </h3>
            <CodeBlock
              code={`interface ColumnDef {
  key: string
  header: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, row: any) => ReactNode
}`}
              filename="ColumnDef"
              language="tsx"
            />
          </section>
          <section id="examples-ta" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Code examples
            </h3>
            <CodeBlock
              code={`// Basic table
const columns: ColumnDef[] = [
  { key: 'name',   header: 'Name',   sortable: true },
  { key: 'role',   header: 'Role',   sortable: true },
  { key: 'status', header: 'Status',
    render: (val) => <Badge variant={val === 'Active' ? 'success' : 'neutral'}>{val}</Badge>
  },
  { key: 'joined', header: 'Joined', sortable: true },
]

<Table columns={columns} rows={members} />`}
              filename="Basic"
              language="tsx"
            />
            <CodeBlock
              code={`// With selection + bulk actions
<Table
  columns={columns}
  rows={members}
  selectable
  onSelectionChange={(ids) => setSelected(ids)}
/>
{selected.length > 0 && (
  <BulkActionBar count={selected.length} onDelete={handleDelete} onExport={handleExport} />
)}`}
              filename="Selection"
              language="tsx"
            />
            <CodeBlock
              code={`// Full-featured table
<Table
  columns={columns}
  rows={members}
  variant="striped"
  density="compact"
  selectable
  sortable
  stickyHeader
  pagination
  pageSize={20}
  emptyState={
    <div style={{ textAlign: 'center', padding: 48 }}>
      <Users size={32} />
      <p>No members yet</p>
      <Button variant="primary" size="sm">Invite member</Button>
    </div>
  }
  onRowClick={(row) => router.push(\`/members/\${row.id}\`)}
/>`}
              filename="Full"
              language="tsx"
            />
            <CodeBlock
              code={`// Custom cell rendering
const columns: ColumnDef[] = [
  {
    key: 'name',
    header: 'Name',
    render: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={val} size="xs" />
        <span style={{ fontWeight: 600 }}>{val}</span>
      </div>
    )
  },
  {
    key: 'projects',
    header: 'Projects',
    align: 'right',
    sortable: true,
  },
  {
    key: 'actions',
    header: '',
    width: 48,
    render: (_, row) => (
      <Popover
        trigger={<Button variant="ghost" size="sm"><MoreHorizontal size={16} /></Button>}
        placement="bottom-end"
        size="sm"
      >
        <button onClick={() => handleEdit(row)}>Edit</button>
        <button onClick={() => handleDelete(row)}>Delete</button>
      </Popover>
    )
  },
]`}
              filename="Custom cells"
              language="tsx"
            />
          </section>
          <section id="a11y-ta" style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              Table renders a semantic table element with thead, tbody, and tfoot. Sortable column headers use a button inside th with
              aria-sort=&apos;ascending&apos;, &apos;descending&apos;, or &apos;none&apos;. Selectable rows use input type=&apos;checkbox&apos; with an accessible name. The table
              may use role=&apos;grid&apos; when interactive (selectable or sortable). Provide a caption or aria-label on the table element.
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
                Initial release. Table with default, striped, and bordered variants, three density levels, sorting, row selection with bulk actions,
                sticky header, pagination, custom cell rendering, empty state, and full ARIA grid pattern.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
