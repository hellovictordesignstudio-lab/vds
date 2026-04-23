'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  BarChart2,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  LayoutList,
  Loader2,
  Table2,
  User,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type SkAnim = 'shimmer' | 'pulse' | 'none';
type SkTemplate = 'card' | 'profile' | 'list' | 'table' | 'article' | 'stat';

const AVATAR_PX = { xs: 20, sm: 24, md: 32, lg: 40, xl: 48, '2xl': 56 } as const;

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

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

function SkEl({
  isDark,
  animation,
  reducedMotion,
  width = '100%',
  height,
  borderRadius = 4,
  style,
}: {
  isDark: boolean;
  animation: SkAnim;
  reducedMotion: boolean;
  width?: string | number;
  height: string | number;
  borderRadius?: string | number;
  style?: CSSProperties;
}) {
  const eff: SkAnim = reducedMotion ? 'none' : animation;
  const baseBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const shimmerHi = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)';
  const br = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
  const w = typeof width === 'number' ? `${width}px` : width;
  const h = typeof height === 'number' ? `${height}px` : height;
  const pulse = eff === 'pulse';
  const shimmer = eff === 'shimmer';

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: br,
        backgroundColor: baseBg,
        position: 'relative',
        overflow: shimmer ? 'hidden' : 'visible',
        animation: pulse ? 'docsSkPulse 1.5s ease-in-out infinite' : undefined,
        flexShrink: 0,
        ...style,
      }}
    >
      {shimmer ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(90deg, transparent 0%, ${shimmerHi} 50%, transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: 'docsSkShimmer 1.5s ease-in-out infinite',
          }}
        />
      ) : null}
    </div>
  );
}

function SkText({
  isDark,
  animation,
  reducedMotion,
  lines,
  gap = 8,
  widths,
}: {
  isDark: boolean;
  animation: SkAnim;
  reducedMotion: boolean;
  lines: number;
  gap?: number;
  widths: string[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }, (_, i) => (
        <SkEl
          key={i}
          isDark={isDark}
          animation={animation}
          reducedMotion={reducedMotion}
          height={i === lines - 1 ? 14 : 14}
          width={widths[i] ?? '80%'}
          borderRadius={4}
        />
      ))}
    </div>
  );
}

function SkAvatar({
  isDark,
  animation,
  reducedMotion,
  size,
}: {
  isDark: boolean;
  animation: SkAnim;
  reducedMotion: boolean;
  size: keyof typeof AVATAR_PX;
}) {
  const px = AVATAR_PX[size];
  return (
    <SkEl
      isDark={isDark}
      animation={animation}
      reducedMotion={reducedMotion}
      width={px}
      height={px}
      borderRadius={999}
    />
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

function SkeletonPreview({
  template,
  animation,
  isDark,
  reducedMotion,
}: {
  template: SkTemplate;
  animation: SkAnim;
  isDark: boolean;
  reducedMotion: boolean;
}) {
  const a = animation;
  const r = reducedMotion;

  if (template === 'card') {
    return (
      <div style={{ width: 320, borderRadius: 12, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, overflow: 'hidden', background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF' }}>
        <SkEl isDark={isDark} animation={a} reducedMotion={r} width="100%" height={160} borderRadius={0} />
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SkEl isDark={isDark} animation={a} reducedMotion={r} height={20} width="72%" borderRadius={4} />
          <SkText isDark={isDark} animation={a} reducedMotion={r} lines={2} widths={['100%', '55%']} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <SkAvatar isDark={isDark} animation={a} reducedMotion={r} size="sm" />
            <SkEl isDark={isDark} animation={a} reducedMotion={r} height={12} width="38%" borderRadius={4} />
          </div>
        </div>
      </div>
    );
  }

  if (template === 'profile') {
    return (
      <div style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 8 }}>
        <SkAvatar isDark={isDark} animation={a} reducedMotion={r} size="xl" />
        <SkEl isDark={isDark} animation={a} reducedMotion={r} height={22} width="55%" borderRadius={6} />
        <SkText isDark={isDark} animation={a} reducedMotion={r} lines={2} gap={8} widths={['92%', '68%']} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <SkEl isDark={isDark} animation={a} reducedMotion={r} height={28} width={72} borderRadius={8} />
          <SkEl isDark={isDark} animation={a} reducedMotion={r} height={28} width={72} borderRadius={8} />
          <SkEl isDark={isDark} animation={a} reducedMotion={r} height={28} width={72} borderRadius={8} />
        </div>
      </div>
    );
  }

  if (template === 'list') {
    return (
      <div style={{ width: 340 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
              <SkAvatar isDark={isDark} animation={a} reducedMotion={r} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <SkText isDark={isDark} animation={a} reducedMotion={r} lines={2} gap={6} widths={['85%', '60%']} />
              </div>
              <SkEl isDark={isDark} animation={a} reducedMotion={r} height={22} width={52} borderRadius={6} />
            </div>
            {i < 3 ? <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} /> : null}
          </div>
        ))}
      </div>
    );
  }

  if (template === 'table') {
    return (
      <div style={{ width: 360 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
          {[0, 1, 2, 3].map((c) => (
            <SkEl key={c} isDark={isDark} animation={a} reducedMotion={r} height={14} width="70%" borderRadius={4} />
          ))}
        </div>
        {[0, 1, 2, 3].map((row) => (
          <div key={row} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
            {[0, 1, 2, 3].map((c) => (
              <SkEl key={c} isDark={isDark} animation={a} reducedMotion={r} height={32} width="100%" borderRadius={6} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (template === 'article') {
    return (
      <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SkEl isDark={isDark} animation={a} reducedMotion={r} height={28} width="88%" borderRadius={6} />
        <SkEl isDark={isDark} animation={a} reducedMotion={r} height={12} width="42%" borderRadius={4} />
        <SkText isDark={isDark} animation={a} reducedMotion={r} lines={4} gap={8} widths={['100%', '98%', '96%', '55%']} />
        <SkEl isDark={isDark} animation={a} reducedMotion={r} width="100%" height={140} borderRadius={8} />
        <SkText isDark={isDark} animation={a} reducedMotion={r} lines={3} gap={8} widths={['100%', '94%', '48%']} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12, width: 360 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderRadius: 12,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
          }}
        >
          <SkEl isDark={isDark} animation={a} reducedMotion={r} height={32} width="70%" borderRadius={6} />
          <SkEl isDark={isDark} animation={a} reducedMotion={r} height={12} width="50%" borderRadius={4} />
          <SkEl isDark={isDark} animation={a} reducedMotion={r} height={24} width={88} borderRadius={8} />
        </div>
      ))}
    </div>
  );
}

function RealContentPreview({ template, t, isDark }: { template: SkTemplate; t: VDSTheme; isDark: boolean }) {
  const cardBorder = isDark ? 'rgba(255,255,255,0.10)' : t.border.default.default;
  const subtle = t.text.secondary.default;

  if (template === 'card') {
    return (
      <div style={{ width: 320, borderRadius: 12, border: `1px solid ${cardBorder}`, overflow: 'hidden', background: t.bg.surface.primary.default }}>
        <div style={{ height: 160, background: t.bg.surface.secondary.default }} />
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Project overview</div>
          <p style={{ fontSize: 13, color: subtle, lineHeight: 1.5, margin: '0 0 12px' }}>Track milestones, owners, and delivery dates in one place.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: t.bg.fill.brandSubtle.default }} />
            <span style={{ fontSize: 12, color: subtle }}>Updated Apr 12</span>
          </div>
        </div>
      </div>
    );
  }

  if (template === 'profile') {
    return (
      <div style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 8 }}>
        <div style={{ width: 48, height: 48, borderRadius: 999, background: t.bg.fill.primary.default, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={24} color="#FFFFFF" aria-hidden />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text.primary.default }}>Alex Morgan</div>
        <p style={{ fontSize: 13, color: subtle, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>Design systems lead. Building accessible UI foundations.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Posts', 'Teams', 'Activity'].map((x) => (
            <span key={x} style={{ fontSize: 11, fontWeight: 600, padding: '6px 10px', borderRadius: 8, background: t.bg.surface.secondary.default, color: t.text.primary.default }}>
              {x}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (template === 'list') {
    return (
      <div style={{ width: 340 }}>
        {['Design review', 'API sync', 'Q2 roadmap', 'On-call'].map((label, i) => (
          <div key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
              <div style={{ width: 24, height: 24, borderRadius: 999, background: t.bg.fill.brandSubtle.default }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text.primary.default }}>{label}</div>
                <div style={{ fontSize: 12, color: subtle }}>Team · Due soon</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: t.bg.surface.secondary.default }}>Open</span>
            </div>
            {i < 3 ? <div style={{ height: 1, background: t.border.default.default }} /> : null}
          </div>
        ))}
      </div>
    );
  }

  if (template === 'table') {
    return (
      <div style={{ width: 360, fontSize: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10, fontWeight: 700, color: t.text.tertiary.default }}>
          <span>Name</span>
          <span>Role</span>
          <span>Status</span>
          <span>Owner</span>
        </div>
        {[0, 1, 2, 3].map((row) => (
          <div key={row} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8, color: t.text.secondary.default }}>
            <span>Item {row + 1}</span>
            <span>Editor</span>
            <span>Active</span>
            <span>A.M.</span>
          </div>
        ))}
      </div>
    );
  }

  if (template === 'article') {
    return (
      <div style={{ width: 340 }}>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: t.text.primary.default, margin: '0 0 8px' }}>Skeleton states</h3>
        <div style={{ fontSize: 12, color: t.text.tertiary.default, marginBottom: 12 }}>6 min read · Product</div>
        <p style={{ fontSize: 13, color: subtle, lineHeight: 1.65, margin: '0 0 12px' }}>
          Placeholders preserve layout while data streams in. Pair shimmer with predictable structure so the transition feels calm instead of jumpy.
        </p>
        <div style={{ height: 140, borderRadius: 8, background: t.bg.surface.secondary.default, marginBottom: 12 }} />
        <p style={{ fontSize: 13, color: subtle, lineHeight: 1.65, margin: 0 }}>
          When content arrives, fade it in and keep dimensions stable to avoid cumulative layout shift.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12, width: 360 }}>
      {[
        { n: '24.5k', l: 'Visitors', tr: '+4%' },
        { n: '1.2s', l: 'P95 load', tr: '-8%' },
        { n: '99.2%', l: 'Uptime', tr: 'OK' },
      ].map((s) => (
        <div key={s.l} style={{ flex: 1, borderRadius: 12, border: `1px solid ${cardBorder}`, padding: 14, background: t.bg.surface.primary.default }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: t.text.primary.default }}>{s.n}</div>
          <div style={{ fontSize: 12, color: subtle, marginTop: 4 }}>{s.l}</div>
          <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#0A8853' }}>
            <BarChart2 size={12} aria-hidden />
            {s.tr}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SkeletonDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [template, setTemplate] = useState<SkTemplate>('card');
  const [animation, setAnimation] = useState<SkAnim>('shimmer');
  const [loadedMode, setLoadedMode] = useState<'off' | 'on'>('off');
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const reducedMotion = usePrefersReducedMotion();

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
  const isLoaded = loadedMode === 'on';

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-sk', label: 'Principles' },
        { id: 'anatomy-sk', label: 'Anatomy' },
        { id: 'variants-sk', label: 'Variants' },
        { id: 'animation-sk', label: 'Animation' },
        { id: 'templates-sk', label: 'Skeleton templates' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-sk', label: 'When to use' },
        { id: 'skeleton-vs', label: 'Skeleton vs. Spinner' },
        { id: 'dos-donts-sk', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'structure-guidelines-sk', label: 'Structure guidelines' },
        { id: 'animation-guidelines-sk', label: 'Animation guidelines' },
        { id: 'transition-guidelines-sk', label: 'Transition to real content' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-sk', label: 'Installation' },
        { id: 'import-sk', label: 'Import' },
        { id: 'examples-sk', label: 'Usage examples' },
        { id: 'props-sk', label: 'Props' },
        { id: 'a11y-sk', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const basePropsRows = [
    { name: 'width', type: 'string | number', default: "'100%'", description: 'Width of the skeleton shape' },
    { name: 'height', type: 'string | number', default: '—', description: 'Height (required for base Skeleton)' },
    { name: 'borderRadius', type: 'string | number', default: '4', description: 'Border radius' },
    { name: 'animation', type: "'shimmer' | 'pulse' | 'none'", default: "'shimmer'", description: 'Animation type' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const textPropsRows = [
    { name: 'lines', type: 'number', default: '1', description: 'Number of text lines' },
    { name: 'gap', type: 'number', default: '8', description: 'Vertical gap between lines' },
    { name: 'lastLineWidth', type: 'string', default: "'60%'", description: 'Width of the last line' },
  ];

  const titlePropsRows = [{ name: 'width', type: 'string', default: "'55%'", description: 'Title bar width' }];

  const avatarPropsRows = [
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'",
      default: "'md'",
      description: 'Avatar diameter token',
    },
  ];

  const imagePropsRows = [
    { name: 'aspectRatio', type: 'string', default: "'16/9'", description: 'Aspect box for media placeholder' },
    { name: 'borderRadius', type: 'number', default: '8', description: 'Corner radius' },
  ];

  const buttonPropsRows = [
    { name: 'width', type: 'number', default: '120', description: 'Button width' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Button height token' },
  ];

  const templatePropsRows = [
    { name: 'CardSkeleton', type: '—', default: '—', description: 'No props (matches Card structure)' },
    { name: 'ProfileSkeleton', type: '—', default: '—', description: 'No props' },
    { name: 'ListSkeleton', type: 'rows: number', default: '4', description: 'Row count' },
    { name: 'TableSkeleton', type: 'rows, columns: number', default: '4 / 4', description: 'Table dimensions' },
    { name: 'ArticleSkeleton', type: '—', default: '—', description: 'No props' },
    { name: 'StatSkeleton', type: 'count: number', default: '3', description: 'Number of stat cards' },
  ];

  return (
    <div className="docs-page-with-toc">
      <style>{`
        @keyframes docsSkShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes docsSkPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes docsSkFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes docsSkSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Skeleton
      </p>
      <h1 className="page-title">Skeleton</h1>
      <p className="page-lead">
        Skeletons are placeholder shapes that mimic the structure of loading content. They reduce perceived wait time by showing the layout before the
        data arrives — the user understands what is coming and where to look. A good skeleton is invisible when done right: it transitions into real
        content so naturally that the user barely notices the load.
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
                    label="Template"
                    options={['card', 'profile', 'list', 'table', 'article', 'stat']}
                    value={template}
                    onChange={setTemplate}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Animation"
                    options={['shimmer', 'pulse', 'none']}
                    value={animation}
                    onChange={setAnimation}
                  />
                  <LivePreviewSegmentRow t={t} label="isLoaded" options={['off', 'on']} value={loadedMode} onChange={setLoadedMode} />
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
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', minHeight: 200 }}>
                  {!isLoaded ? (
                    <div role="status" aria-label="Loading">
                      <SkeletonPreview template={template} animation={animation} isDark={previewDark} reducedMotion={reducedMotion} />
                    </div>
                  ) : (
                    <div style={{ animation: 'docsSkFadeIn 300ms ease-out forwards' }}>
                      <RealContentPreview template={template} t={previewT} isDark={previewDark} />
                    </div>
                  )}
                </div>
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-sk" style={{ marginBottom: 48 }}>
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
                  <LayoutList size={18} color={t.text.brand.default} style={{ opacity: 0.45, marginBottom: 12 }} aria-hidden />
                  <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                    <div
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        border: `1px dashed ${t.border.default.default}`,
                        minHeight: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: t.bg.surface.primary.default,
                        position: 'relative',
                        paddingBottom: 22,
                      }}
                    >
                      <Loader2 size={28} color={t.bg.fill.primary.default} style={{ animation: 'docsSkSpin 900ms linear infinite' }} aria-hidden />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 8,
                          left: 0,
                          right: 0,
                          textAlign: 'center',
                          fontSize: 10,
                          fontWeight: 800,
                          color: t.text.tertiary.default,
                        }}
                      >
                        Spinner
                      </span>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        border: `1px dashed ${t.border.default.default}`,
                        padding: 10,
                        background: t.bg.surface.primary.default,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={48} width="100%" borderRadius={6} />
                      <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={10} width="70%" borderRadius={4} />
                      <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={8} width="100%" borderRadius={4} />
                      <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={8} width="55%" borderRadius={4} />
                      <span style={{ fontSize: 10, fontWeight: 800, color: t.text.tertiary.default, textAlign: 'center', marginTop: 4 }}>Skeleton</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Structure before content</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A spinner tells the user &apos;something is loading.&apos; A skeleton tells them &apos;this card will have an image, a title, and two lines of
                    text.&apos; The skeleton preserves spatial context — the user knows where to look when the content arrives.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 16 }}>
                  <ImageIcon size={18} color={t.text.brand.default} style={{ opacity: 0.45, marginBottom: 10 }} aria-hidden />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 120 }}>
                      <SkEl isDark={isDark} animation="none" reducedMotion height={40} width="100%" borderRadius={6} />
                      <SkEl isDark={isDark} animation="none" reducedMotion height={8} width="75%" borderRadius={4} />
                      <SkEl isDark={isDark} animation="none" reducedMotion height={8} width="100%" borderRadius={4} />
                      <SkEl isDark={isDark} animation="none" reducedMotion height={8} width="60%" borderRadius={4} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: t.text.brand.default }}>→</div>
                    <div style={{ width: 120, borderRadius: 8, border: `1px solid ${t.border.default.default}`, overflow: 'hidden', opacity: 0.95 }}>
                      <div style={{ height: 40, background: t.bg.surface.tertiary.default }} />
                      <div style={{ padding: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: t.text.primary.default }}>Title</div>
                        <div style={{ fontSize: 9, color: t.text.secondary.default, lineHeight: 1.4 }}>Body line one</div>
                        <div style={{ fontSize: 9, color: t.text.secondary.default }}>Body line two</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10, fontSize: 9, fontWeight: 700, color: t.text.tertiary.default }}>
                    <span>1:1 map</span>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Mirror the real layout</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Every skeleton shape should correspond to a real element in the loaded state. A circle maps to an avatar. A wide rectangle maps to
                    a title. Three narrow rectangles map to body text. If the skeleton doesn&apos;t match the real content structure, the transition will
                    feel jarring.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 16 }}>
                  <FileText size={18} color={t.text.brand.default} style={{ opacity: 0.45, marginBottom: 10 }} aria-hidden />
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <SkEl key={i} isDark={isDark} animation="none" reducedMotion height={10} width={i % 3 === 0 ? 40 : 28} borderRadius={3} />
                      ))}
                      <div style={{ width: '100%', textAlign: 'center', fontSize: 9, fontWeight: 800, color: '#E8186D', marginTop: 6 }}>Too detailed</div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <SkEl isDark={isDark} animation="none" reducedMotion height={36} width="100%" borderRadius={6} />
                      <SkEl isDark={isDark} animation="none" reducedMotion height={10} width="55%" borderRadius={4} />
                      <SkEl isDark={isDark} animation="none" reducedMotion height={8} width="100%" borderRadius={4} />
                      <SkEl isDark={isDark} animation="none" reducedMotion height={8} width="70%" borderRadius={4} />
                      <div style={{ fontSize: 9, fontWeight: 800, color: '#0A8853', textAlign: 'center', marginTop: 4 }}>Right level of fidelity</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Approximate, don&apos;t replicate</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Skeletons should approximate structure, not replicate exact dimensions. Three lines of similar width convey &apos;paragraph text&apos; — they
                    don&apos;t need to match the exact character count. Too much fidelity makes skeletons brittle and expensive to maintain.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-sk" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                minHeight: 300,
                ...dottedZone(t, 300),
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
              }}
            >
              <div style={{ position: 'relative', width: 280, padding: 14, borderRadius: 12, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default }}>
                <div style={{ position: 'absolute', left: -36, top: 36 }}>
                  <AnnotationDot letter="A" />
                </div>
                <div style={{ position: 'absolute', right: -140, top: 52, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#E8186D' }}>A</span>
                </div>
                <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} width="100%" height={90} borderRadius={8} />
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={20} width="78%" borderRadius={4} />
                    <div style={{ position: 'absolute', right: -32, top: 0 }}>
                      <AnnotationDot letter="B" />
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={14} width="92%" borderRadius={4} />
                    <div style={{ position: 'absolute', right: -32, top: -2 }}>
                      <AnnotationDot letter="C" />
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={14} width="58%" borderRadius={4} />
                    <div style={{ position: 'absolute', right: -32, top: -2 }}>
                      <AnnotationDot letter="C" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                      <SkAvatar isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} size="sm" />
                      <div style={{ position: 'absolute', left: -30, bottom: -28 }}>
                        <AnnotationDot letter="D" />
                      </div>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={12} width="36%" borderRadius={4} />
                      <div style={{ position: 'absolute', right: -34, top: -4 }}>
                        <AnnotationDot letter="E" />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ position: 'absolute', left: '50%', bottom: -36, transform: 'translateX(-50%)' }}>
                  <AnnotationDot letter="F" />
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 12, lineHeight: 1.65 }}>
              A → Skeleton.Image (aspect ratio 16/9 or fixed height, borderRadius 8px, shimmer) · B → Skeleton.Title (height 20px, width 60–80%,
              borderRadius 4px, shimmer) · C → Skeleton.Text (height 14px, variable width, borderRadius 4px, shimmer) — last line shorter (40–60%) to
              mimic wrapping · D → Skeleton.Avatar (circle, size matches Avatar size prop) · E → Skeleton.Text narrow (height 12px, width 30–40%) · F →
              Container (transparent, layout matches real component) · G → Shimmer overlay (linear-gradient animation, sweeps left→right every 1.5s
              infinite)
            </p>
          </section>

          <section id="variants-sk" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    title: 'Text',
                    chip: 'Skeleton.Text',
                    desc: 'Paragraph text placeholder. Vary widths between lines — uniform widths look unnatural. Last line always shorter.',
                    node: (
                      <div style={{ ...dottedZone(t, 140), flexDirection: 'column', gap: 8, alignItems: 'stretch', width: '100%' }}>
                        <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={16} width="80%" borderRadius={4} />
                        <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={14} width="95%" borderRadius={4} />
                        <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={14} width="60%" borderRadius={4} />
                      </div>
                    ),
                  },
                  {
                    title: 'Title',
                    chip: 'Skeleton.Title',
                    desc: 'Heading placeholder. Taller and shorter than body text to reflect the visual weight of a heading.',
                    node: (
                      <div style={{ ...dottedZone(t, 140), width: '100%' }}>
                        <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={24} width="55%" borderRadius={6} />
                      </div>
                    ),
                  },
                  {
                    title: 'Avatar',
                    chip: 'Skeleton.Avatar',
                    desc: 'Circle placeholder for avatars. Pass the same size prop as the real Avatar component.',
                    node: (
                      <div style={{ ...dottedZone(t, 140), gap: 14 }}>
                        <SkAvatar isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} size="sm" />
                        <SkAvatar isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} size="md" />
                        <SkAvatar isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} size="lg" />
                      </div>
                    ),
                  },
                  {
                    title: 'Image',
                    chip: 'Skeleton.Image',
                    desc: 'Image or media placeholder. Supports aspectRatio prop to match the real image dimensions.',
                    node: (
                      <div style={{ ...dottedZone(t, 140), width: '100%', padding: '16px 24px' }}>
                        <div style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                          <SkEl
                            isDark={isDark}
                            animation="shimmer"
                            reducedMotion={reducedMotion}
                            width="100%"
                            height="100%"
                            borderRadius={8}
                            style={{ position: 'absolute', inset: 0 }}
                          />
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Button',
                    chip: 'Skeleton.Button',
                    desc: 'Button placeholder. Use when the action buttons themselves are loading (e.g., permission-based UI).',
                    node: (
                      <div style={{ ...dottedZone(t, 140), gap: 12 }}>
                        <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={40} width={120} borderRadius={8} />
                        <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={40} width={80} borderRadius={8} />
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
                  <div style={{ overflow: 'hidden' }}>{v.node}</div>
                  <div style={{ padding: '16px 18px 12px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{v.title}</div>
                    <span style={chipStyleB(t)}>{v.chip}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '12px 0 0' }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="animation-sk" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Animation
            </h2>
            <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              Skeletons support three animation modes. Choose based on the emotional tone of the interface.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {(
                [
                  {
                    title: 'Shimmer (default)',
                    chip: 'animation: shimmer',
                    desc: 'A light sweep moves across the skeleton. The most common pattern — feels active and progressive. 1.5s loop.',
                    node: (
                      <div style={{ ...dottedZone(t, 140), flexDirection: 'column', gap: 8, width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                          <span style={{ fontSize: 18, color: t.text.brand.default }}>→</span>
                          <div style={{ flex: 1, height: 48, borderRadius: 8, position: 'relative', overflow: 'hidden', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                            <div
                              aria-hidden
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: `linear-gradient(90deg, transparent 0%, ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.75)'} 45%, transparent 90%)`,
                                opacity: 0.9,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Pulse',
                    chip: 'animation: pulse',
                    desc: 'Opacity pulses between 40% and 100%. Subtler than shimmer. Use in dense UIs where shimmer would be visually noisy.',
                    node: (
                      <div style={{ ...dottedZone(t, 140), position: 'relative', width: '100%' }}>
                        <SkEl isDark={isDark} animation="none" reducedMotion height={48} width="70%" borderRadius={8} style={{ opacity: 1, position: 'absolute' }} />
                        <SkEl isDark={isDark} animation="none" reducedMotion height={48} width="70%" borderRadius={8} style={{ opacity: 0.4, position: 'absolute' }} />
                      </div>
                    ),
                  },
                  {
                    title: 'None',
                    chip: 'animation: none',
                    desc: 'No animation. Use when respecting prefers-reduced-motion, or in UIs where animation would be distracting.',
                    node: (
                      <div style={{ ...dottedZone(t, 140), width: '100%' }}>
                        <SkEl isDark={isDark} animation="none" reducedMotion height={48} width="72%" borderRadius={8} />
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
                  <div style={{ overflow: 'hidden' }}>{v.node}</div>
                  <div style={{ padding: '16px 18px 12px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{v.title}</div>
                    <span style={chipStyleB(t)}>{v.chip}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '12px 0 0' }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <Callout variant="tip" title="Respect reduced motion">
                The Skeleton component automatically disables shimmer and pulse animations when the user has prefers-reduced-motion: reduce set in
                their OS. The skeleton still renders as a static placeholder.
              </Callout>
            </div>
          </section>

          <section id="templates-sk" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Skeleton templates
            </h2>
            <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              Pre-built skeleton compositions for the most common loading patterns. Import and use directly — no assembly required.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    label: 'CardSkeleton',
                    desc: 'Full card loading state. Matches the Card component structure.',
                    icon: <ImageIcon size={14} aria-hidden />,
                    node: <SkeletonPreview template="card" animation="shimmer" isDark={isDark} reducedMotion={reducedMotion} />,
                  },
                  {
                    label: 'ProfileSkeleton',
                    desc: 'User profile or entity detail loading state.',
                    icon: <User size={14} aria-hidden />,
                    node: <SkeletonPreview template="profile" animation="shimmer" isDark={isDark} reducedMotion={reducedMotion} />,
                  },
                  {
                    label: 'ListSkeleton',
                    desc: 'List or feed loading state. Count prop controls number of rows (default 4).',
                    icon: <LayoutList size={14} aria-hidden />,
                    node: <SkeletonPreview template="list" animation="shimmer" isDark={isDark} reducedMotion={reducedMotion} />,
                  },
                  {
                    label: 'TableSkeleton',
                    desc: 'Table loading state. Rows and columns props control dimensions.',
                    icon: <Table2 size={14} aria-hidden />,
                    node: <SkeletonPreview template="table" animation="shimmer" isDark={isDark} reducedMotion={reducedMotion} />,
                  },
                  {
                    label: 'ArticleSkeleton',
                    desc: 'Long-form content loading state. For articles, docs, and detail pages.',
                    icon: <FileText size={14} aria-hidden />,
                    node: <SkeletonPreview template="article" animation="shimmer" isDark={isDark} reducedMotion={reducedMotion} />,
                  },
                  {
                    label: 'StatSkeleton',
                    desc: 'Dashboard stats loading state. Count prop controls number of stat cards.',
                    icon: <BarChart2 size={14} aria-hidden />,
                    node: <SkeletonPreview template="stat" animation="shimmer" isDark={isDark} reducedMotion={reducedMotion} />,
                  },
                ] as const
              ).map((row) => (
                <div
                  key={row.label}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 180), overflow: 'auto' }}>{row.node}</div>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ color: t.text.brand.default }}>{row.icon}</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>{row.label}</div>
                    </div>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{row.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-sk" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
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
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: '#0A8853', marginBottom: 12 }}>DO</div>
                <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, fontSize: 13, lineHeight: 1.75 }}>
                  <li>Cargas de contenido con estructura conocida (cards, listas, tablas, artículos)</li>
                  <li>Navegación entre páginas donde la estructura del destino es predecible</li>
                  <li>Fetch inicial de datos en el primer render</li>
                  <li>Listas paginadas donde se sabe cuántos items cargarán</li>
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
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: '#E8186D', marginBottom: 12 }}>DON&apos;T</div>
                <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, fontSize: 13, lineHeight: 1.75 }}>
                  <li>Operaciones cortas menores a 300ms (no mostrar nada)</li>
                  <li>Operaciones con progreso medible (usar Progress)</li>
                  <li>Cuando la estructura es completamente desconocida (usar Spinner)</li>
                  <li>Acciones de usuario como click en botón (usar Spinner en el botón)</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <Callout variant="info" title="The 300ms rule">
                Don&apos;t show a skeleton for operations that take less than 300ms. A skeleton that flashes briefly before content arrives is more
                disruptive than just loading silently. Add a 300ms delay before showing the skeleton.
              </Callout>
            </div>
          </section>

          <section id="skeleton-vs" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Skeleton vs. Spinner
            </h2>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderBottom: `1px solid ${t.border.default.default}`,
                      color: t.text.tertiary.default,
                      fontWeight: 700,
                      width: 140,
                    }}
                  >
                    PATTERN
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.tertiary.default, fontWeight: 700 }}>
                    USE WHEN
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Skeleton', 'Structure is known, content takes 1–3+ seconds, layout should be preserved'],
                  ['Spinner', 'Structure unknown, operation triggered by user action, short wait'],
                  ['Progress', 'Operation has measurable progress'],
                  ['None', 'Operation < 300ms — no loading indicator needed'],
                ].map(([a, b]) => (
                  <tr key={String(a)}>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.primary.default, fontWeight: 600 }}>{a}</td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.secondary.default }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="dos-donts-sk" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do & Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.text.primary.default, marginBottom: 12 }}>Match the real structure</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <IllustratedDoDont
                    t={t}
                    ok
                    title="Do"
                    caption="Skeleton con imagen 16/9 + título + 2 líneas → transiciona a card real con misma estructura."
                  >
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <SkeletonPreview template="card" animation="none" isDark={isDark} reducedMotion />
                      <span style={{ color: t.text.brand.default, fontWeight: 800 }}>→</span>
                      <RealContentPreview template="card" t={t} isDark={isDark} />
                    </div>
                  </IllustratedDoDont>
                  <IllustratedDoDont
                    t={t}
                    ok={false}
                    title="Don&apos;t"
                    caption="Skeleton con 5 líneas de texto → transiciona a card con imagen + título (estructura no coincide, el layout salta)."
                  >
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <SkEl key={i} isDark={isDark} animation="none" reducedMotion height={10} width={i === 4 ? '50%' : '100%'} borderRadius={4} />
                        ))}
                      </div>
                      <span style={{ color: '#E8186D', fontWeight: 800 }}>→</span>
                      <RealContentPreview template="card" t={t} isDark={isDark} />
                    </div>
                  </IllustratedDoDont>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.text.primary.default, marginBottom: 12 }}>Vary line widths</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <IllustratedDoDont
                    t={t}
                    ok
                    title="Do"
                    caption="3 líneas de texto skeleton con widths 85%, 95%, 55% — natural."
                  >
                    <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={14} width="85%" borderRadius={4} />
                      <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={14} width="95%" borderRadius={4} />
                      <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={14} width="55%" borderRadius={4} />
                    </div>
                  </IllustratedDoDont>
                  <IllustratedDoDont t={t} ok={false} title="Don&apos;t" caption="3 líneas todas con width 100% — robótico e irreal.">
                    <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={14} width="100%" borderRadius={4} />
                      <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={14} width="100%" borderRadius={4} />
                      <SkEl isDark={isDark} animation="shimmer" reducedMotion={reducedMotion} height={14} width="100%" borderRadius={4} />
                    </div>
                  </IllustratedDoDont>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.text.primary.default, marginBottom: 12 }}>Limit skeleton count</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <IllustratedDoDont
                    t={t}
                    ok
                    title="Do"
                    caption="Lista de 4 skeleton rows mientras carga (número fijo razonable)."
                  >
                    <SkeletonPreview template="list" animation="pulse" isDark={isDark} reducedMotion={reducedMotion} />
                  </IllustratedDoDont>
                  <IllustratedDoDont
                    t={t}
                    ok={false}
                    title="Don&apos;t"
                    caption="20 skeleton rows llenando toda la pantalla — más disruptivo que un spinner."
                  >
                    <div style={{ width: 280, maxHeight: 120, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0', alignItems: 'center' }}>
                          <SkEl isDark={isDark} animation="none" reducedMotion height={16} width={16} borderRadius={999} />
                          <SkEl isDark={isDark} animation="none" reducedMotion height={8} width="70%" borderRadius={4} />
                        </div>
                      ))}
                    </div>
                  </IllustratedDoDont>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="structure-guidelines-sk" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Structure guidelines
            </h2>
            <div
              style={{
                background: t.bg.surface.secondary.default,
                borderRadius: 12,
                border: `1px solid ${t.border.default.default}`,
                padding: 20,
              }}
            >
              <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, fontSize: 13, lineHeight: 1.7 }}>
                <li>Mirror the real component layout exactly — same spacing, same proportions</li>
                <li>Use randomized-but-constrained widths for text lines (55–95%)</li>
                <li>Always make the last text line shorter than the others</li>
                <li>Match borderRadius to the real element: circle for avatars, 4–8px for text/images</li>
              </ul>
            </div>
          </section>

          <section id="animation-guidelines-sk" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Animation guidelines
            </h2>
            <div
              style={{
                background: t.bg.surface.secondary.default,
                borderRadius: 12,
                border: `1px solid ${t.border.default.default}`,
                padding: 20,
              }}
            >
              <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, fontSize: 13, lineHeight: 1.7 }}>
                <li>Default to shimmer — it&apos;s the most universally understood loading pattern</li>
                <li>Switch to pulse in data-dense UIs (tables, dashboards) where shimmer is distracting</li>
                <li>Always disable animation for prefers-reduced-motion</li>
              </ul>
            </div>
          </section>

          <section id="transition-guidelines-sk" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Transition to real content
            </h2>
            <div
              style={{
                background: t.bg.surface.secondary.default,
                borderRadius: 12,
                border: `1px solid ${t.border.default.default}`,
                padding: 20,
              }}
            >
              <ul style={{ margin: 0, paddingLeft: 18, color: t.text.secondary.default, fontSize: 13, lineHeight: 1.7 }}>
                <li>Fade in real content over 200–300ms when data arrives</li>
                <li>Never abruptly replace skeleton with content — the jump is jarring</li>
                <li>Maintain the same dimensions during transition to avoid layout shift</li>
              </ul>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="install-sk" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-sk" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock
              code={`import {
  Skeleton,
  CardSkeleton,
  ProfileSkeleton,
  ListSkeleton,
  TableSkeleton,
  ArticleSkeleton,
  StatSkeleton,
} from '@vds/react'`}
              filename="component.tsx"
              language="tsx"
            />
          </section>
          <section id="examples-sk" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={`// Base skeleton shape
<Skeleton width={200} height={20} borderRadius={4} />`} filename="Base" language="tsx" />
              <CodeBlock code={`// Text lines
<Skeleton.Text lines={3} />`} filename="Text" language="tsx" />
              <CodeBlock code={`// Avatar placeholder
<Skeleton.Avatar size="md" />`} filename="Avatar" language="tsx" />
              <CodeBlock code={`// Image placeholder
<Skeleton.Image aspectRatio="16/9" />`} filename="Image" language="tsx" />
              <CodeBlock
                code={`// Manual card skeleton composition
<div style={{ width: 320 }}>
  <Skeleton.Image aspectRatio="16/9" />
  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Skeleton.Title />
    <Skeleton.Text lines={2} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <Skeleton.Avatar size="sm" />
      <Skeleton.Text lines={1} lastLineWidth="40%" />
    </div>
  </div>
</div>`}
                filename="Card composition"
                language="tsx"
              />
              <CodeBlock
                code={`// Pre-built template
<CardSkeleton />
<ListSkeleton rows={5} />
<TableSkeleton rows={6} columns={5} />`}
                filename="Templates"
                language="tsx"
              />
              <CodeBlock
                code={`// Conditional rendering with fade transition
{isLoading ? (
  <CardSkeleton />
) : (
  <Card style={{ animation: 'fadeIn 300ms ease-out' }}>
    {/* real content */}
  </Card>
)}`}
                filename="Conditional"
                language="tsx"
              />
              <CodeBlock
                code={`// With 300ms delay to avoid flicker
const [showSkeleton, setShowSkeleton] = useState(false)
useEffect(() => {
  if (!isLoading) { setShowSkeleton(false); return }
  const timer = setTimeout(() => setShowSkeleton(true), 300)
  return () => clearTimeout(timer)
}, [isLoading])
{showSkeleton ? <CardSkeleton /> : <Card>{/* content */}</Card>}`}
                filename="Delay"
                language="tsx"
              />
              <CodeBlock code={`// Pulse animation for dense UIs
<TableSkeleton animation="pulse" rows={8} columns={6} />`} filename="Pulse" language="tsx" />
            </div>
          </section>
          <section id="props-sk" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Props
            </h3>
            <p style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 10 }}>Skeleton base props</p>
            <PropsTable props={basePropsRows} />
            <p style={{ fontSize: 13, color: t.text.secondary.default, margin: '24px 0 10px' }}>Skeleton.Text</p>
            <PropsTable props={textPropsRows} />
            <p style={{ fontSize: 13, color: t.text.secondary.default, margin: '24px 0 10px' }}>Skeleton.Title</p>
            <PropsTable props={titlePropsRows} />
            <p style={{ fontSize: 13, color: t.text.secondary.default, margin: '24px 0 10px' }}>Skeleton.Avatar</p>
            <PropsTable props={avatarPropsRows} />
            <p style={{ fontSize: 13, color: t.text.secondary.default, margin: '24px 0 10px' }}>Skeleton.Image</p>
            <PropsTable props={imagePropsRows} />
            <p style={{ fontSize: 13, color: t.text.secondary.default, margin: '24px 0 10px' }}>Skeleton.Button</p>
            <PropsTable props={buttonPropsRows} />
            <p style={{ fontSize: 13, color: t.text.secondary.default, margin: '24px 0 10px' }}>Template components</p>
            <PropsTable props={templatePropsRows} />
          </section>
          <section id="a11y-sk" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Accessibility
            </h3>
            <Callout variant="info" title="Accessibility">
              The Skeleton container has role=&apos;status&apos; and aria-label=&apos;Loading&apos; by default. This announces to screen readers that content is
              loading. When content replaces the skeleton, the live region is cleared. Animation is automatically disabled when prefers-reduced-motion:
              reduce is active.
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
                Initial release. Skeleton with shimmer/pulse/none animations, base component + 5 sub-components (Text, Title, Avatar, Image, Button),
                6 pre-built templates, automatic prefers-reduced-motion support.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
