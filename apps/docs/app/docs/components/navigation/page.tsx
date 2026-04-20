'use client';

import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Circle,
  ExternalLink,
  FileText,
  FolderOpen,
  Home,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
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

type NavVariant = 'sidebar' | 'topbar' | 'tabs';
type NavSize = 'sm' | 'md' | 'lg';
type ActiveTop = 'home' | 'dashboard' | 'projects' | 'team';

const SIZE_MAP: Record<NavSize, { icon: number; font: number; py: number; logoH: number }> = {
  sm: { icon: 16, font: 12, py: 6, logoH: 32 },
  md: { icon: 18, font: 13, py: 8, logoH: 36 },
  lg: { icon: 20, font: 14, py: 10, logoH: 40 },
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

/** Maps segmented “Home” control to tabs row label order Dashboard · Projects · Team · Settings */
function tabsActiveIdFromControl(control: ActiveTop): string {
  const m: Record<ActiveTop, string> = {
    home: 'dash',
    dashboard: 'proj',
    projects: 'team',
    team: 'sett',
  };
  return m[control];
}

function TopbarNavLink({
  id,
  label,
  activeTop,
  onSelect,
  t,
}: {
  id: ActiveTop;
  label: string;
  activeTop: ActiveTop;
  onSelect: (id: ActiveTop) => void;
  t: VDSTheme;
}) {
  const [hover, setHover] = useState(false);
  const active = activeTop === id;
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect(id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '6px 12px',
        borderRadius: 8,
        border: 'none',
        background: active ? t.bg.fill.brandSubtle.default : hover ? t.bg.surface.secondary.default : 'transparent',
        color: active ? t.text.brand.default : t.text.secondary.default,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
      }}
    >
      {label}
    </button>
  );
}

function SidebarNavLink({
  t,
  s,
  id,
  icon,
  label,
  badge,
  activeTop,
  collapsed,
  showBadges,
  onSelect,
  railTip,
  onRailTip,
}: {
  t: VDSTheme;
  s: (typeof SIZE_MAP)[NavSize];
  id: ActiveTop;
  icon: ReactNode;
  label: string;
  badge?: string;
  activeTop: ActiveTop;
  collapsed: boolean;
  showBadges: boolean;
  onSelect: (id: ActiveTop) => void;
  railTip: string | null;
  onRailTip: (id: string | null) => void;
}) {
  const [hover, setHover] = useState(false);
  const active = activeTop === id;
  const showLabel = !collapsed;
  const py = s.py;
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label={collapsed ? label : undefined}
        aria-current={active ? 'page' : undefined}
        onClick={() => onSelect(id)}
        onMouseEnter={() => {
          setHover(true);
          if (collapsed) onRailTip(id);
        }}
        onMouseLeave={() => {
          setHover(false);
          if (collapsed) onRailTip(null);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: `${py}px 12px`,
          margin: '0 4px',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: s.font,
          fontWeight: active ? 700 : 600,
          color: active ? t.text.brand.default : hover ? t.text.primary.default : t.text.secondary.default,
          transition: 'background 100ms, color 100ms',
          border: 'none',
          background: active ? t.bg.fill.brandSubtle.default : hover ? t.bg.surface.secondary.default : 'transparent',
          width: collapsed ? '100%' : 'auto',
          justifyContent: collapsed ? 'center' : 'flex-start',
          boxSizing: 'border-box',
          position: 'relative',
          fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
          borderLeft: active && !collapsed ? `2px solid ${t.text.brand.default}` : '2px solid transparent',
        }}
      >
        <span style={{ display: 'flex', color: 'inherit' }}>{icon}</span>
        {showLabel ? <span style={{ flex: 1, textAlign: 'left' }}>{label}</span> : null}
        {showLabel && showBadges && badge ? (
          <span
            style={{
              marginLeft: 'auto',
              background: t.bg.fill.danger.default,
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 6,
              minWidth: 18,
              textAlign: 'center',
            }}
          >
            {badge}
          </span>
        ) : null}
      </button>
      {collapsed && railTip === id ? (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            left: '100%',
            top: '50%',
            transform: 'translate(8px, -50%)',
            background: t.bg.surface.primary.default,
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 12,
            fontWeight: 600,
            color: t.text.primary.default,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 5,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}

function DocNavigationLive({
  t,
  variant,
  size,
  collapsed,
  showBadges,
  activeTop,
  onActiveTop,
}: {
  t: VDSTheme;
  variant: NavVariant;
  size: NavSize;
  collapsed: boolean;
  showBadges: boolean;
  activeTop: ActiveTop;
  onActiveTop: (id: ActiveTop) => void;
}) {
  const uid = useId();
  const s = SIZE_MAP[size];
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [railTip, setRailTip] = useState<string | null>(null);
  const rail = variant === 'sidebar' && collapsed;

  const sidebarW = variant === 'sidebar' ? (collapsed ? 56 : 240) : 240;

  const tabIds = [
    { id: 'dash', label: 'Dashboard' },
    { id: 'proj', label: 'Projects' },
    { id: 'team', label: 'Team' },
    { id: 'sett', label: 'Settings' },
  ];
  const tabActive = tabsActiveIdFromControl(activeTop);

  if (variant === 'tabs') {
    return (
      <div style={{ width: '100%', maxWidth: 520, minHeight: 480, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 4px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 4 }}>PAGE</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: t.text.primary.default }}>Workspace</div>
        </div>
        <nav aria-label="Page navigation" style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${t.border.default.default}` }}>
          {tabIds.map((tab) => {
            const active = tabActive === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`${uid}-tab-${tab.id}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  const rev: Record<string, ActiveTop> = {
                    dash: 'home',
                    proj: 'dashboard',
                    team: 'projects',
                    sett: 'team',
                  };
                  onActiveTop(rev[tab.id]!);
                }}
                style={{
                  flex: 1,
                  fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
                  fontSize: s.font,
                  fontWeight: active ? 600 : 500,
                  padding: `${s.py}px 12px`,
                  border: 'none',
                  background: 'transparent',
                  color: active ? t.text.brand.default : t.text.secondary.default,
                  cursor: 'pointer',
                  boxShadow: active ? `inset 0 -2px 0 0 ${t.border.brand.default}` : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div style={{ flex: 1, padding: 20, color: t.text.secondary.default, fontSize: 13 }}>
          Content for <strong style={{ color: t.text.primary.default }}>{tabIds.find((x) => x.id === tabActive)?.label}</strong>
        </div>
      </div>
    );
  }

  if (variant === 'topbar') {
    return (
      <nav
        aria-label="Main navigation"
        style={{
          width: '100%',
          maxWidth: 720,
          minHeight: 56,
          height: 56,
          background: t.bg.surface.primary.default,
          borderBottom: `1px solid ${t.border.default.default}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 4,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 24 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.bg.fill.primary.default }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: t.text.primary.default }}>VDS</span>
        </div>
        {(['home', 'dashboard', 'projects', 'team'] as const).map((id) => {
          const labels: Record<ActiveTop, string> = {
            home: 'Home',
            dashboard: 'Dashboard',
            projects: 'Projects',
            team: 'Team',
          };
          return <TopbarNavLink key={id} id={id} label={labels[id]} activeTop={activeTop} onSelect={onActiveTop} t={t} />;
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Search size={18} color={t.icon.secondary.default} aria-hidden />
          <Bell size={18} color={t.icon.secondary.default} aria-hidden />
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.bg.fill.primary.default }} aria-hidden />
        </div>
      </nav>
    );
  }

  /* sidebar */
  return (
    <nav
      aria-label="Main navigation"
      style={{
        width: sidebarW,
        alignSelf: 'stretch',
        minHeight: 480,
        background: t.bg.surface.primary.default,
        borderRight: `1px solid ${t.border.default.default}`,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          height: 56,
          padding: '0 16px',
          borderBottom: `1px solid ${t.border.default.default}`,
          display: rail ? 'none' : 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.bg.fill.primary.default }} />
        <span style={{ fontSize: 14, fontWeight: 800, color: t.text.primary.default }}>VDS</span>
      </div>
      {rail ? (
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${t.border.default.default}` }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.bg.fill.primary.default }} />
        </div>
      ) : null}
      <div style={{ padding: '8px 0', flex: 1, overflowY: 'auto' }}>
        <SidebarNavLink
          t={t}
          s={s}
          id="home"
          icon={<Home size={s.icon} strokeWidth={2} aria-hidden />}
          label="Home"
          activeTop={activeTop}
          collapsed={rail}
          showBadges={showBadges}
          onSelect={onActiveTop}
          railTip={railTip}
          onRailTip={setRailTip}
        />
        <SidebarNavLink
          t={t}
          s={s}
          id="dashboard"
          icon={<LayoutDashboard size={s.icon} strokeWidth={2} aria-hidden />}
          label="Dashboard"
          activeTop={activeTop}
          collapsed={rail}
          showBadges={showBadges}
          onSelect={onActiveTop}
          railTip={railTip}
          onRailTip={setRailTip}
        />
        <SidebarNavLink
          t={t}
          s={s}
          id="projects"
          icon={<FolderOpen size={s.icon} strokeWidth={2} aria-hidden />}
          label="Projects"
          badge="3"
          activeTop={activeTop}
          collapsed={rail}
          showBadges={showBadges}
          onSelect={onActiveTop}
          railTip={railTip}
          onRailTip={setRailTip}
        />
        {!rail ? (
          <div
            role="presentation"
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: t.text.tertiary.default,
              padding: '12px 16px 4px',
            }}
          >
            MANAGE
          </div>
        ) : null}
        <SidebarNavLink
          t={t}
          s={s}
          id="team"
          icon={<Users size={s.icon} strokeWidth={2} aria-hidden />}
          label="Team"
          activeTop={activeTop}
          collapsed={rail}
          showBadges={showBadges}
          onSelect={onActiveTop}
          railTip={railTip}
          onRailTip={setRailTip}
        />
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label={rail ? 'Settings' : undefined}
            aria-expanded={settingsOpen}
            aria-controls={settingsOpen ? `${uid}-settings-sub` : undefined}
            onClick={() => setSettingsOpen((o) => !o)}
            onMouseEnter={() => {
              if (rail) setRailTip('settings');
            }}
            onMouseLeave={() => {
              if (rail) setRailTip(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: `${s.py}px 12px`,
              margin: '0 4px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: s.font,
              fontWeight: 600,
              color: t.text.secondary.default,
              transition: 'background 100ms, color 100ms',
              border: 'none',
              background: 'transparent',
              width: rail ? '100%' : 'auto',
              justifyContent: rail ? 'center' : 'flex-start',
              boxSizing: 'border-box',
              fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
            }}
          >
            <span style={{ display: 'flex', color: t.text.secondary.default }}>
              <Settings size={s.icon} strokeWidth={2} aria-hidden />
            </span>
            {!rail ? (
              <>
                <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, color: t.text.secondary.default }}>Settings</span>
                <span style={{ marginLeft: 'auto', display: 'flex', color: t.text.tertiary.default }}>
                  {settingsOpen ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
                </span>
              </>
            ) : null}
          </button>
          {rail && railTip === 'settings' ? (
            <div
              role="tooltip"
              style={{
                position: 'absolute',
                left: '100%',
                top: '50%',
                transform: 'translate(8px, -50%)',
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 600,
                color: t.text.primary.default,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                zIndex: 5,
              }}
            >
              Settings
            </div>
          ) : null}
        </div>
        {settingsOpen && !rail ? (
          <div id={`${uid}-settings-sub`} role="group" aria-label="Settings">
            {['General', 'Security', 'Billing'].map((lbl) => (
              <button
                key={lbl}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: `6px 12px 6px 40px`,
                  margin: '0 4px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: s.font,
                  fontWeight: 500,
                  color: t.text.secondary.default,
                  fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
                  textAlign: 'left',
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div
        style={{
          marginTop: 'auto',
          borderTop: `1px solid ${t.border.default.default}`,
          padding: 8,
          display: rail ? 'flex' : 'block',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: rail ? 0 : 10,
            padding: rail ? 0 : '8px 12px',
            borderRadius: 8,
            cursor: 'pointer',
            justifyContent: rail ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: t.bg.fill.brandSubtle.default,
              color: t.text.brand.default,
              fontSize: 10,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            VM
          </div>
          {!rail ? (
            <>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default, flex: 1 }}>Victor M.</span>
              <Settings size={16} color={t.icon.secondary.default} aria-hidden />
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

export default function NavigationDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [variant, setVariant] = useState<NavVariant>('sidebar');
  const [size, setSize] = useState<NavSize>('md');
  const [collapsed, setCollapsed] = useState<'off' | 'on'>('off');
  const [showBadges, setShowBadges] = useState<'off' | 'on'>('on');
  const [activeTop, setActiveTop] = useState<ActiveTop>('home');

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (variant !== 'sidebar' && collapsed === 'on') setCollapsed('off');
  }, [variant, collapsed]);

  const t = buildTheme(isDark);
  const previewDark = appearance === 'dark';
  const previewT = previewDark ? buildTheme(true) : t;

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-nv', label: 'Principles' },
        { id: 'anatomy-nv', label: 'Anatomy' },
        { id: 'variants-nv', label: 'Variants' },
        { id: 'nav-items', label: 'Nav item types' },
        { id: 'sizes-nv', label: 'Sizes' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-nv', label: 'When to use' },
        { id: 'structure-nv', label: 'Structuring nav items' },
        { id: 'dos-donts-nv', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'props-nv', label: 'Navigation props' },
        { id: 'code-examples-nv', label: 'Examples' },
        { id: 'a11y-nv', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const navPropsRows = [
    { name: 'items', type: 'NavItem[]', default: '—', description: 'Navigation structure (required)', required: true as boolean },
    {
      name: 'variant',
      type: "'sidebar' | 'topbar' | 'tabs'",
      default: "'sidebar'",
      description: 'Navigation style',
    },
    { name: 'activeItem', type: 'string', default: '—', description: 'Active item id' },
    { name: 'onItemClick', type: '(item: NavItem) => void', default: '—', description: 'Item click handler' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Item size' },
    { name: 'collapsed', type: 'boolean', default: 'false', description: 'Sidebar icon-only mode' },
    { name: 'logo', type: 'ReactNode', default: '—', description: 'Logo zone content' },
    { name: 'userZone', type: 'ReactNode', default: '—', description: 'Bottom user zone content' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const codeExamples = `// Basic sidebar navigation
const navItems: NavItem[] = [
  { id: 'home',      label: 'Home',      icon: <Home size={18} />,          href: '/' },
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/dashboard' },
  { id: 'projects',  label: 'Projects',  icon: <FolderOpen size={18} />,    href: '/projects', badge: 3 },
  { id: 'team',      label: 'Team',      icon: <Users size={18} />,         href: '/team', section: 'MANAGE' },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings size={18} />,
    href: '/settings',
    children: [
      { id: 'general',  label: 'General',  href: '/settings/general' },
      { id: 'security', label: 'Security', href: '/settings/security' },
      { id: 'billing',  label: 'Billing',  href: '/settings/billing' },
    ]
  },
]

<Navigation
  items={navItems}
  activeItem="home"
  onItemClick={(item) => router.push(item.href!)}
  logo={
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8,
        background: t.bg.fill.primary.default }} />
      <span style={{ fontSize: 14, fontWeight: 800 }}>VDS</span>
    </div>
  }
  userZone={
    <div style={{ display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>
      <Avatar name="Victor M." size="xs" />
      <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Victor M.</span>
      <Settings size={16} color={t.icon.secondary.default} />
    </div>
  }
/>

// Collapsed (icon rail)
<Navigation
  items={navItems}
  activeItem={activeItem}
  collapsed
  onItemClick={handleNav}
/>

// Topbar variant
<Navigation
  variant="topbar"
  items={[
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'projects',  label: 'Projects',  href: '/projects' },
    { id: 'team',      label: 'Team',      href: '/team' },
    { id: 'settings',  label: 'Settings',  href: '/settings' },
  ]}
  activeItem="dashboard"
  logo={<span style={{ fontWeight: 800, fontSize: 14 }}>VDS</span>}
/>

// Tabs variant — page-level
<Navigation
  variant="tabs"
  items={[
    { id: 'overview',  label: 'Overview',  href: '/project/overview' },
    { id: 'tasks',     label: 'Tasks',     href: '/project/tasks', badge: 12 },
    { id: 'members',   label: 'Members',   href: '/project/members' },
    { id: 'settings',  label: 'Settings',  href: '/project/settings' },
  ]}
  activeItem="tasks"
  onItemClick={handleNav}
/>

// Responsive sidebar (desktop + mobile)
const [isOpen, setIsOpen] = useState(false)
const [collapsed, setCollapsed] = useState(false)

// Desktop: persistent sidebar
// Mobile: drawer triggered by hamburger
<>
  {/* Mobile hamburger */}
  <button onClick={() => setIsOpen(true)} style={{ display: 'block' }}>
    <Menu size={20} />
  </button>

  {/* Navigation — drawer on mobile, sidebar on desktop */}
  <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} placement="left" size="sm">
    <Navigation items={navItems} activeItem={activeItem} onItemClick={handleNav} />
  </Drawer>

  {/* Desktop sidebar */}
  <Navigation
    items={navItems}
    activeItem={activeItem}
    collapsed={collapsed}
    onItemClick={handleNav}
  />
</>`;

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components{' '}
        <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Navigation
      </p>
      <h1 className="page-title">Navigation</h1>
      <p className="page-lead">
        Navigation is the skeleton of a product. It tells users where they are, where they can go, and how everything is organized. A
        well-designed navigation is invisible — users flow through the product without thinking about it. A poorly designed one creates
        confusion, dead ends, and abandonment. Get navigation right, and everything else becomes easier.
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
                    options={['sidebar', 'topbar', 'tabs']}
                    value={variant}
                    onChange={(v) => setVariant(v as NavVariant)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Active item"
                    options={['home', 'dashboard', 'projects', 'team']}
                    value={activeTop}
                    onChange={(v) => setActiveTop(v as ActiveTop)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show badges"
                    options={['off', 'on']}
                    value={showBadges}
                    onChange={(v) => setShowBadges(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Collapsed (sidebar)"
                    options={['off', 'on']}
                    value={collapsed}
                    onChange={(v) => setCollapsed(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Size"
                    options={['sm', 'md', 'lg']}
                    value={size}
                    onChange={(v) => setSize(v as NavSize)}
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
                  minHeight: 480,
                  padding: variant === 'sidebar' ? 24 : 32,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: variant === 'sidebar' ? 'stretch' : 'center',
                  justifyContent: variant === 'sidebar' ? 'flex-start' : 'center',
                  flexDirection: variant === 'topbar' ? 'column' : 'row',
                }}
              >
                <div style={{ display: 'flex', flex: variant === 'tabs' ? undefined : 1, maxWidth: variant === 'topbar' ? 800 : undefined }}>
                  <DocNavigationLive
                    t={previewT}
                    variant={variant}
                    size={size}
                    collapsed={collapsed === 'on'}
                    showBadges={showBadges === 'on'}
                    activeTop={activeTop}
                    onActiveTop={setActiveTop}
                  />
                  {variant === 'sidebar' ? (
                    <div
                      style={{
                        flex: 1,
                        minHeight: 400,
                        background: previewT.bg.surface.secondary.default,
                        borderRadius: 12,
                        marginLeft: 16,
                        border: `1px dashed ${previewT.border.default.default}`,
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-nv" style={{ marginBottom: 48 }}>
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
                <div style={{ ...dottedZone(t, 200), flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 800, color: t.text.tertiary.default, marginBottom: 4 }}>Flat dump</div>
                      <div
                        style={{
                          width: 72,
                          background: t.bg.surface.primary.default,
                          border: `1px solid ${t.border.default.default}`,
                          borderRadius: 6,
                          padding: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        {Array.from({ length: 15 }, (_, i) => (
                          <div key={i} style={{ height: 3, background: t.border.default.default, borderRadius: 2, opacity: 0.5 }} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 800, color: t.text.tertiary.default, marginBottom: 4 }}>Organized hierarchy</div>
                      <div
                        style={{
                          width: 72,
                          background: t.bg.surface.primary.default,
                          border: `1px solid ${t.border.default.default}`,
                          borderRadius: 6,
                          padding: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        {Array.from({ length: 5 }, (_, i) => (
                          <div key={i} style={{ height: 4, background: t.border.brand.default, borderRadius: 2, opacity: 0.35 }} />
                        ))}
                        <div style={{ height: 16, borderLeft: `2px solid ${t.border.default.default}`, marginLeft: 4, marginTop: 2 }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <LayoutDashboard size={18} color={t.text.brand.default} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Hierarchy reduces cognitive load</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Navigation should reflect the mental model of the product, not the database schema. Group related items. Use sections with
                    labels. Collapse secondary navigation under its parent. A user scanning a sidebar with 15 flat items reads every item; one
                    with 5 grouped items finds their target instantly.
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <div style={{ width: 120, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ padding: '6px 8px', borderRadius: 6, color: t.text.secondary.default, fontSize: 10, fontWeight: 600 }}>Default</div>
                      <div style={{ padding: '6px 8px', borderRadius: 6, background: t.bg.surface.secondary.default, color: t.text.primary.default, fontSize: 10, fontWeight: 600 }}>Hover</div>
                      <div
                        style={{
                          padding: '6px 8px',
                          borderRadius: 6,
                          background: t.bg.fill.brandSubtle.default,
                          color: t.text.brand.default,
                          fontSize: 10,
                          fontWeight: 700,
                          borderLeft: `2px solid ${t.text.brand.default}`,
                        }}
                      >
                        Active
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: t.text.tertiary.default }}>
                      <ChevronRight size={14} aria-hidden />
                      <ChevronRight size={14} aria-hidden />
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: t.text.tertiary.default, textAlign: 'center' }}>default → hover → active</div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Circle size={18} color={t.text.brand.default} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Active state is a spatial anchor</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    The active nav item tells users where they are in the product. It&apos;s the single most important visual signal in the
                    navigation. Make it unambiguous — use background color, left border, and text color together. A subtle underline is not enough.
                    The user must be able to glance at the nav and immediately identify their location.
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
                <div style={{ ...dottedZone(t, 200), flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 72, height: 100, background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 6 }} />
                    <div style={{ fontSize: 9, fontWeight: 800, color: t.text.tertiary.default, marginTop: 6 }}>Desktop · 240px</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 28, height: 100, background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 6 }} />
                    <div style={{ fontSize: 9, fontWeight: 800, color: t.text.tertiary.default, marginTop: 6 }}>Tablet · 56px rail</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 8, border: `1px dashed ${t.border.default.default}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Menu size={18} color={t.text.secondary.default} aria-hidden />
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: t.text.tertiary.default, marginTop: 6 }}>Mobile · drawer</div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Menu size={18} color={t.text.brand.default} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Navigation adapts to screen size</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Desktop navigation is a persistent sidebar. Tablet navigation collapses to an icon-only rail. Mobile navigation becomes a drawer
                    behind a hamburger button. These are not three different components — they&apos;re three states of the same navigation, responsive to
                    the available space.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-nv" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                position: 'relative',
                minHeight: 420,
                backgroundColor: t.bg.surface.secondary.default,
                backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                padding: 24,
                display: 'flex',
                gap: 24,
                flexWrap: 'wrap',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: 240,
                  minHeight: 360,
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', height: 40, borderBottom: `1px solid ${t.border.default.default}` }}>
                  <AnnotationDot letter="A" />
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default }}>container</span>
                </div>
                <div style={{ height: 48, padding: '0 12px', borderBottom: `1px solid ${t.border.default.default}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AnnotationDot letter="B" />
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: t.bg.fill.primary.default }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: t.text.primary.default }}>VDS</span>
                </div>
                <div style={{ borderBottom: `1px solid ${t.border.default.default}`, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AnnotationDot letter="C" />
                  <span style={{ fontSize: 9, color: t.text.tertiary.default }}>divider</span>
                </div>
                <div style={{ flex: 1, padding: '6px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px' }}>
                    <AnnotationDot letter="D" />
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: t.bg.fill.brandSubtle.default,
                        color: t.text.brand.default,
                        fontWeight: 700,
                        fontSize: 11,
                        borderLeft: `2px solid ${t.text.brand.default}`,
                      }}
                    >
                      <Home size={14} aria-hidden /> Home
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px' }}>
                    <AnnotationDot letter="E" />
                    <div style={{ flex: 1, padding: '4px 8px', borderRadius: 6, color: t.text.secondary.default, fontSize: 11, fontWeight: 600 }}>
                      <LayoutDashboard size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} aria-hidden /> Dashboard
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px' }}>
                    <AnnotationDot letter="F" />
                    <div style={{ flex: 1, padding: '4px 8px', borderRadius: 6, color: t.text.secondary.default, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FolderOpen size={14} aria-hidden /> Projects <span style={{ marginLeft: 'auto', background: t.bg.fill.danger.default, color: '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 4 }}>3</span>
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px 2px', fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', color: t.text.tertiary.default }}>
                    <AnnotationDot letter="G" /> MANAGE
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px' }}>
                    <div style={{ flex: 1, padding: '4px 8px', borderRadius: 6, color: t.text.secondary.default, fontSize: 11, fontWeight: 600 }}>
                      <Users size={14} style={{ marginRight: 4 }} aria-hidden /> Team
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px' }}>
                    <AnnotationDot letter="H" />
                    <div style={{ flex: 1, padding: '4px 8px', borderRadius: 6, color: t.text.secondary.default, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <Settings size={14} style={{ marginRight: 4 }} aria-hidden /> Settings <ChevronRight size={12} style={{ marginLeft: 'auto' }} aria-hidden />
                    </div>
                  </div>
                  <div style={{ paddingLeft: 28 }}>
                    <AnnotationDot letter="I" />
                    <div style={{ fontSize: 10, color: t.text.secondary.default, marginTop: 4 }}>General · Security · Billing</div>
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${t.border.default.default}`, padding: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AnnotationDot letter="J" />
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: t.bg.fill.brandSubtle.default }} />
                  <span style={{ fontSize: 11, fontWeight: 600, flex: 1, color: t.text.primary.default }}>Victor M.</span>
                  <Settings size={14} color={t.icon.secondary.default} aria-hidden />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 220, fontSize: 12, color: t.text.secondary.default, lineHeight: 1.7 }}>
                <p style={{ margin: '0 0 8px', color: t.text.primary.default, fontWeight: 700 }}>Parts</p>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>
                    <strong>A</strong> — Sidebar container (width 240px, height 100%, bg surface.primary, borderRight 1px)
                  </li>
                  <li>
                    <strong>B</strong> — Logo zone (height 56px, padding 0 16px, flex row, gap 10px, borderBottom 1px)
                  </li>
                  <li>
                    <strong>C</strong> — Divider (1px solid border.default, full width)
                  </li>
                  <li>
                    <strong>D</strong> — Active nav item (bg brandSubtle, color brand, fontWeight 700, borderLeft 2px brand, borderRadius 8px)
                  </li>
                  <li>
                    <strong>E</strong> — Default nav item (padding 8px 12px, margin 0 4px, borderRadius 8px, gap 10px, hover bg surface.secondary)
                  </li>
                  <li>
                    <strong>F</strong> — Badge (xs chip, bg danger, color white, fontSize 10px, marginLeft auto)
                  </li>
                  <li>
                    <strong>G</strong> — Section label (fontSize 10px, uppercase, letterSpacing 0.08em, color tertiary, padding 12px 16px 4px)
                  </li>
                  <li>
                    <strong>H</strong> — Expand chevron (ChevronRight→Down, 14px, color tertiary, marginLeft auto)
                  </li>
                  <li>
                    <strong>I</strong> — Sub-nav item (padding 6px 12px 6px 40px, fontSize 13px, indented)
                  </li>
                  <li>
                    <strong>J</strong> — User zone (marginTop auto, borderTop 1px, padding 8px, flex row, gap 8px)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section id="variants-nv" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {[
                {
                  title: 'Sidebar',
                  chip: 'variant: sidebar',
                  desc: 'Persistent vertical navigation. The standard for dashboards, admin panels, and complex SaaS products. Supports sections, sub-nav, badges, and a user zone.',
                  node: (
                    <div style={{ display: 'flex', height: 140, width: 120, background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ width: 48, borderRight: `1px solid ${t.border.default.default}`, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: 28, borderBottom: `1px solid ${t.border.default.default}` }} />
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} style={{ flex: 1, margin: 2, borderRadius: 4, background: i === 0 ? t.bg.fill.brandSubtle.default : 'transparent', borderLeft: i === 0 ? `2px solid ${t.text.brand.default}` : '2px solid transparent' }} />
                        ))}
                        <div style={{ height: 24, marginTop: 'auto', borderTop: `1px solid ${t.border.default.default}` }} />
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Sidebar collapsed (rail)',
                  chip: 'collapsed: true',
                  desc: 'Icon-only rail mode. Same navigation structure with labels hidden. Tooltips reveal the label on hover. Saves horizontal space on smaller screens.',
                  node: (
                    <div style={{ display: 'flex', height: 140, width: 40, background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 8, flexDirection: 'column', alignItems: 'center', padding: 4, gap: 4 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} style={{ width: 22, height: 22, borderRadius: 6, background: i === 0 ? t.bg.fill.brandSubtle.default : t.bg.surface.secondary.default }} />
                      ))}
                    </div>
                  ),
                },
                {
                  title: 'Topbar',
                  chip: 'variant: topbar',
                  desc: 'Horizontal top navigation. Use for products with fewer top-level sections (4–6 items). Leaves more vertical space for content.',
                  node: (
                    <div style={{ width: '100%', maxWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', height: 36, background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 8, padding: '0 8px', gap: 4 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.bg.fill.primary.default }} />
                        <div style={{ flex: 1, height: 18, borderRadius: 4, background: t.bg.fill.brandSubtle.default, maxWidth: 48 }} />
                        <div style={{ width: 10, height: 10, borderRadius: 4, background: t.bg.surface.secondary.default }} />
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.bg.fill.primary.default }} />
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Tabs (page-level)',
                  chip: 'variant: tabs',
                  desc: 'Tab-style navigation for page sections. Use for secondary navigation within a page — not for primary app navigation. Built on the Tabs component.',
                  node: (
                    <div style={{ width: '100%', maxWidth: 220 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: t.text.tertiary.default, marginBottom: 4 }}>PAGE HEADER</div>
                      <div style={{ display: 'flex', borderBottom: `1px solid ${t.border.default.default}` }}>
                        {['Dashboard', 'Projects', 'Team', 'Settings'].map((lab, i) => (
                          <div
                            key={lab}
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              fontSize: 9,
                              fontWeight: i === 1 ? 700 : 500,
                              padding: '6px 2px',
                              color: i === 1 ? t.text.brand.default : t.text.secondary.default,
                              boxShadow: i === 1 ? `inset 0 -2px 0 0 ${t.border.brand.default}` : 'none',
                            }}
                          >
                            {lab}
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                },
              ].map((card) => (
                <div
                  key={card.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 200), minHeight: 200 }}>{card.node}</div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{card.title}</div>
                    <span style={chipStyleB(t, { marginBottom: 12 })}>{card.chip}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '12px 0 0' }}>{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="nav-items" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Nav item types
            </h2>
            <p className="page-lead" style={{ fontSize: 15, marginBottom: 20 }}>
              Navigation items compose from the same building block. These are the available types.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {[
                {
                  title: 'Link',
                  chip: 'type: link',
                  desc: 'Standard navigation link. Icon + label. Click navigates to href.',
                  node: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, color: t.text.secondary.default, fontWeight: 600, fontSize: 13 }}>
                      <Home size={18} aria-hidden /> Home
                    </div>
                  ),
                },
                {
                  title: 'Link with badge',
                  chip: 'badge: 3',
                  desc: 'Badge communicates unread or pending count. Use for notifications, messages, tasks. Cap display at 99+.',
                  node: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, color: t.text.secondary.default, fontWeight: 600, fontSize: 13, width: '100%' }}>
                      <Bell size={18} aria-hidden /> Notifications <span style={{ marginLeft: 'auto', background: t.bg.fill.danger.default, color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 6 }}>3</span>
                    </div>
                  ),
                },
                {
                  title: 'Link with sub-nav',
                  chip: 'children: [...]',
                  desc: 'Parent item with collapsible sub-navigation. ChevronRight rotates to ChevronDown when expanded.',
                  node: (
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: 8, color: t.text.secondary.default, fontWeight: 600, fontSize: 13 }}>
                        <Settings size={18} aria-hidden /> <span style={{ flex: 1, marginLeft: 8 }}>Settings</span>
                        <ChevronRight size={14} color={t.text.tertiary.default} aria-hidden />
                      </div>
                      <div style={{ paddingLeft: 32, fontSize: 12, color: t.text.secondary.default, lineHeight: 1.8 }}>
                        General
                        <br />
                        Security
                        <br />
                        Billing
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Section label',
                  chip: 'type: section',
                  desc: 'Non-interactive section header. Groups related nav items. All caps, color tertiary.',
                  node: (
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: t.text.tertiary.default, padding: '12px 8px 4px' }}>MANAGE</div>
                  ),
                },
                {
                  title: 'External link',
                  chip: 'external: true',
                  desc: "Opens in a new tab. Shows ExternalLink icon to signal the behavior. Always include target='_blank' + rel='noopener'.",
                  node: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, color: t.text.secondary.default, fontWeight: 600, fontSize: 13 }}>
                      <FileText size={18} aria-hidden /> Docs <ExternalLink size={12} aria-hidden style={{ marginLeft: 4 }} />
                    </div>
                  ),
                },
              ].map((c) => (
                <div
                  key={c.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 120), minHeight: 120 }}>{c.node}</div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{c.title}</div>
                    <span style={chipStyleB(t, { marginBottom: 8 })}>{c.chip}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '8px 0 0' }}>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="sizes-nv" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {(
                [
                  { k: 'sm' as const, icon: 16, font: 12, h: 32, cap: 'Dense sidebars, secondary nav' },
                  { k: 'md' as const, icon: 18, font: 13, h: 36, cap: 'Default — most products' },
                  { k: 'lg' as const, icon: 20, font: 14, h: 40, cap: 'Touch-friendly, prominent nav' },
                ] as const
              ).map((row) => (
                <div key={row.k} style={{ flex: '1 1 200px', minWidth: 180 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: t.text.tertiary.default, marginBottom: 8, textTransform: 'uppercase' }}>{row.k}</div>
                  <div
                    style={{
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 10,
                      width: 160,
                      minHeight: 200,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ height: 36, borderBottom: `1px solid ${t.border.default.default}` }} />
                    <div style={{ padding: 6, flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          minHeight: row.h,
                          padding: `0 8px`,
                          borderRadius: 6,
                          background: t.bg.fill.brandSubtle.default,
                          color: t.text.brand.default,
                          fontWeight: 700,
                          fontSize: row.font,
                          borderLeft: `2px solid ${t.text.brand.default}`,
                        }}
                      >
                        <Home size={row.icon} aria-hidden /> Home
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: row.h, padding: '0 8px', color: t.text.secondary.default, fontSize: row.font, fontWeight: 600 }}>
                        <LayoutDashboard size={row.icon} aria-hidden /> Dash
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: t.text.tertiary.default, marginTop: 8, lineHeight: 1.4 }}>
                    icon {row.icon}px · font {row.font}px · item {row.h}px
                    <br />
                    {row.cap}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-nv" style={{ marginTop: 32, marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0A8853', marginBottom: 8 }}>SIDEBAR — DO</div>
                <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.65, margin: 0 }}>
                  Dashboards y SaaS con 5–12 secciones, productos donde el usuario necesita cambiar de sección frecuentemente, apps con jerarquía de
                  navegación compleja.
                </p>
              </div>
              <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0A8853', marginBottom: 8 }}>TOPBAR — DO</div>
                <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.65, margin: 0 }}>
                  Sitios de marketing y productos, apps con 4–6 secciones top-level, cuando el contenido vertical es más importante que el horizontal.
                </p>
              </div>
              <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0A8853', marginBottom: 8 }}>TABS — DO</div>
                <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.65, margin: 0 }}>
                  Navegación secundaria dentro de una página o sección ya establecida.
                </p>
              </div>
              <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#E8186D', marginBottom: 8 }}>DON&apos;T</div>
                <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.65, margin: 0 }}>
                  Más de 12 items en el primer nivel sin agrupar, anidar sub-nav más de 2 niveles, mezclar sidebar y topbar como navegación primaria en
                  la misma vista, usar tabs como sustituto de una sidebar compleja.
                </p>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <Callout variant="warning" title="Navigation depth limit">
                Never nest sub-navigation more than 2 levels deep (parent → children). Deeper nesting creates confusion — users lose track of where they
                are in the structure. If you need 3+ levels, reconsider the information architecture.
              </Callout>
            </div>
          </section>

          <section id="structure-nv" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Structuring nav items
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {[
                {
                  title: 'Most used items first',
                  cap: 'Frequency of use determines position.',
                  ill: (
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, textAlign: 'center' }}>
                        <div style={{ width: 80, background: t.bg.surface.primary.default, borderRadius: 6, border: `1px solid ${t.border.default.default}`, padding: 4 }}>
                          {[...Array(8)].map((_, i) => (
                            <div key={i} style={{ height: 3, margin: 2, background: t.border.default.default, opacity: 0.4 }} />
                          ))}
                          <div style={{ height: 4, margin: 2, background: t.border.brand.default }} />
                        </div>
                        weak
                      </div>
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, textAlign: 'center' }}>
                        <div style={{ width: 80, background: t.bg.surface.primary.default, borderRadius: 6, border: `1px solid ${t.border.default.default}`, padding: 4 }}>
                          <div style={{ height: 4, margin: 2, background: t.border.brand.default }} />
                          {[...Array(7)].map((_, i) => (
                            <div key={i} style={{ height: 3, margin: 2, background: t.border.default.default, opacity: 0.4 }} />
                          ))}
                        </div>
                        strong
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Group by relationship',
                  cap: 'Section labels make groups scannable.',
                  ill: (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', fontSize: 8, color: t.text.secondary.default }}>
                      <div style={{ padding: 6, borderRadius: 6, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default }}>
                        <div style={{ fontWeight: 800, color: t.text.tertiary.default, marginBottom: 4 }}>CONTENT</div>
                        <div>Posts · Media</div>
                        <div style={{ fontWeight: 800, color: t.text.tertiary.default, margin: '6px 0 4px' }}>SETTINGS</div>
                        <div>Users · Billing</div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Limit to 7±2 top-level items',
                  cap: 'More than 9 items overwhelms working memory.',
                  ill: (
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <div style={{ width: 56, textAlign: 'center', fontSize: 8, color: t.text.tertiary.default }}>
                        <div style={{ height: 72, borderRadius: 6, border: `1px solid ${t.border.default.default}`, padding: 3, background: t.bg.surface.primary.default }}>
                          {[...Array(5)].map((_, i) => (
                            <div key={i} style={{ height: 8, marginBottom: 2, background: t.bg.surface.secondary.default, borderRadius: 2 }} />
                          ))}
                        </div>
                        OK
                      </div>
                      <div style={{ width: 56, textAlign: 'center', fontSize: 8, color: t.text.tertiary.default }}>
                        <div style={{ height: 72, borderRadius: 6, border: `1px solid ${t.border.default.default}`, padding: 3, background: t.bg.surface.primary.default, overflow: 'hidden' }}>
                          {[...Array(14)].map((_, i) => (
                            <div key={i} style={{ height: 4, marginBottom: 1, background: t.bg.surface.secondary.default, borderRadius: 2 }} />
                          ))}
                        </div>
                        crowded
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Separate utility nav',
                  cap: 'Destructive or infrequent actions belong at the bottom.',
                  ill: (
                    <div style={{ width: 100, margin: '0 auto', background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 6, padding: 4, display: 'flex', flexDirection: 'column', gap: 2, minHeight: 80 }}>
                      {[...Array(4)].map((_, i) => (
                        <div key={i} style={{ height: 6, background: t.bg.surface.secondary.default, borderRadius: 2 }} />
                      ))}
                      <div style={{ flex: 1 }} />
                      <div style={{ height: 6, background: t.bg.fill.danger.default, opacity: 0.35, borderRadius: 2 }} />
                    </div>
                  ),
                },
              ].map((r) => (
                <div key={r.title} style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ ...dottedZone(t, 120), minHeight: 120 }}>{r.ill}</div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>{r.title}</div>
                    <p style={{ margin: 0, fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55 }}>{r.cap}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="dos-donts-nv" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <IllustratedDoDont
                t={t}
                ok
                title="Only one active item"
                caption="Solo &quot;Projects&quot; activo con bg brandSubtle y left border — el usuario sabe dónde está."
              >
                <div style={{ width: 140, background: t.bg.surface.primary.default, borderRadius: 8, border: `1px solid ${t.border.default.default}`, padding: 6 }}>
                  {['Home', 'Projects', 'Team'].map((lab, i) => (
                    <div
                      key={lab}
                      style={{
                        padding: '4px 6px',
                        borderRadius: 4,
                        marginBottom: 4,
                        fontSize: 10,
                        fontWeight: i === 1 ? 700 : 500,
                        background: i === 1 ? t.bg.fill.brandSubtle.default : 'transparent',
                        color: i === 1 ? t.text.brand.default : t.text.secondary.default,
                        borderLeft: i === 1 ? `2px solid ${t.text.brand.default}` : '2px solid transparent',
                      }}
                    >
                      {lab}
                    </div>
                  ))}
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Don&apos;t: two active items"
                caption="&quot;Projects&quot; y &quot;Team&quot; ambos con bg activo — el usuario no sabe dónde está."
              >
                <div style={{ width: 140, background: t.bg.surface.primary.default, borderRadius: 8, border: `1px solid ${t.border.default.default}`, padding: 6 }}>
                  {['Home', 'Projects', 'Team'].map((lab, i) => (
                    <div
                      key={lab}
                      style={{
                        padding: '4px 6px',
                        borderRadius: 4,
                        marginBottom: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        background: i >= 1 ? t.bg.fill.brandSubtle.default : 'transparent',
                        color: i >= 1 ? t.text.brand.default : t.text.secondary.default,
                      }}
                    >
                      {lab}
                    </div>
                  ))}
                </div>
              </IllustratedDoDont>

              <IllustratedDoDont
                t={t}
                ok
                title="Collapsed sidebar shows tooltips"
                caption="Sidebar colapsada (solo iconos) + tooltip con el label al hover."
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 36, background: t.bg.surface.primary.default, borderRadius: 8, border: `1px solid ${t.border.default.default}`, padding: 6, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                    <Home size={14} aria-hidden />
                    <FolderOpen size={14} aria-hidden />
                  </div>
                  <div style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${t.border.default.default}`, fontSize: 10, fontWeight: 600, background: t.bg.surface.primary.default }}>Projects</div>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Don&apos;t: rail without tooltips"
                caption="Sidebar colapsada sin tooltips — iconos sin label son ambiguos para la mayoría de usuarios."
              >
                <div style={{ width: 36, background: t.bg.surface.primary.default, borderRadius: 8, border: `1px solid ${t.border.default.default}`, padding: 6, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <Home size={14} aria-hidden />
                  <FolderOpen size={14} aria-hidden />
                </div>
              </IllustratedDoDont>

              <IllustratedDoDont
                t={t}
                ok
                title="Badge count is always current"
                caption="El badge se actualiza cuando llegan nuevas notificaciones o el usuario visita la sección."
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600, color: t.text.secondary.default }}>
                  <Bell size={16} aria-hidden /> Notifications <span style={{ background: t.bg.fill.danger.default, color: '#fff', fontSize: 9, padding: '2px 5px', borderRadius: 4 }}>3</span>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Don&apos;t: stale badge"
                caption="Badge estático que no se limpia cuando el usuario ya visitó Notifications."
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600, color: t.text.secondary.default, opacity: 0.45 }}>
                  <Bell size={16} aria-hidden /> Notifications <span style={{ background: t.bg.fill.danger.default, color: '#fff', fontSize: 9, padding: '2px 5px', borderRadius: 4 }}>3</span>
                </div>
              </IllustratedDoDont>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title" style={{ marginBottom: 12 }}>
            Nav item labels
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>
              <strong style={{ color: t.text.primary.default }}>Length:</strong> 1–2 words: &apos;Dashboard&apos;, &apos;Projects&apos;, &apos;Team settings&apos;
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>Nouns, not verbs:</strong> &apos;Settings&apos; not &apos;Configure&apos;, &apos;Team&apos; not &apos;Manage team&apos;
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>Sentence case:</strong> &apos;All projects&apos; not &apos;ALL PROJECTS&apos;
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>Consistency:</strong> Same grammatical form across all items at the same level
            </li>
          </ul>
          <h2 className="section-title" style={{ marginTop: 28, marginBottom: 12 }}>
            Section labels
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>
              <strong style={{ color: t.text.primary.default }}>Short noun:</strong> &apos;Manage&apos;, &apos;Content&apos;, &apos;Analytics&apos;, &apos;Settings&apos;
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>All caps:</strong> Organizational markers, not navigation items
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>Length:</strong> 1 word preferred, 2 words max
            </li>
          </ul>
          <h2 className="section-title" style={{ marginTop: 28, marginBottom: 12 }}>
            Badge labels
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>
              <strong style={{ color: t.text.primary.default }}>Numeric:</strong> &apos;3&apos;, &apos;12&apos;, &apos;99+&apos;
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>No prose in badges:</strong> Use a dot indicator for non-numeric status
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>Clear on visit:</strong> Remove or decrement when the user visits the section
            </li>
          </ul>
          <h2 className="section-title" style={{ marginTop: 28, marginBottom: 12 }}>
            Tooltip (collapsed sidebar)
          </h2>
          <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
            <li>
              <strong style={{ color: t.text.primary.default }}>Text:</strong> Exact same text as the nav item label — no extra description
            </li>
            <li>
              <strong style={{ color: t.text.primary.default }}>Interaction:</strong> Appears on hover, placement: right
            </li>
          </ul>
        </section>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="props-nv" style={{ marginTop: 32, marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Navigation props
            </h2>
            <PropsTable props={navPropsRows} />
          </section>
          <section style={{ marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              NavItem type
            </h2>
            <CodeBlock
              language="tsx"
              filename="types.ts"
              code={`interface NavItem {
  id: string
  label: string
  icon?: ReactNode
  href?: string
  badge?: number | string
  external?: boolean
  children?: NavItem[]     // sub-nav items
  section?: string         // section label above this item
  type?: 'link' | 'section' | 'divider'
  isDisabled?: boolean
}`}
            />
          </section>
          <section id="code-examples-nv" style={{ marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Examples
            </h2>
            <CodeBlock code={codeExamples} language="tsx" filename="Navigation.tsx" />
          </section>
          <section id="a11y-nv" style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              Navigation renders as a &lt;nav&gt; element with aria-label=&apos;Main navigation&apos;. Each nav item is an &lt;a&gt; or &lt;button&gt; element. The active
              item has aria-current=&apos;page&apos;. Items with sub-navigation have aria-expanded and aria-controls. Section labels use role=&apos;presentation&apos;.
              Keyboard: Tab moves between items, Enter/Space activates, Arrow keys navigate within the nav, Escape collapses open sub-nav. In collapsed
              (rail) mode, each icon button has aria-label with the item label.
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
                Initial release. Navigation with sidebar/topbar/tabs variants, 3 sizes, collapsible sidebar rail mode, sub-navigation, section labels,
                badges, external links, user zone, logo zone, responsive drawer pattern, full ARIA nav pattern.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
