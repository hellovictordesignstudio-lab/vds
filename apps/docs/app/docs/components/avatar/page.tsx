'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  Circle,
  Crown,
  MoreHorizontal,
  Plus,
  User,
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

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

const UNSPLASH_FACE =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarType = 'image' | 'initials' | 'icon';
type AvatarShape = 'circle' | 'square';
type AvatarColor = 'brand' | 'purple' | 'teal' | 'orange' | 'pink' | 'neutral';
type Presence = 'none' | 'online' | 'offline' | 'busy';

const SIZE_MAP: Record<
  AvatarSize,
  {
    px: number;
    fontSize: number;
    iconSize: number;
  }
> = {
  xs: { px: 24, fontSize: 9, iconSize: 12 },
  sm: { px: 32, fontSize: 11, iconSize: 14 },
  md: { px: 40, fontSize: 14, iconSize: 18 },
  lg: { px: 56, fontSize: 18, iconSize: 24 },
  xl: { px: 72, fontSize: 22, iconSize: 30 },
  '2xl': { px: 96, fontSize: 28, iconSize: 38 },
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

function getColorPair(
  t: VDSTheme,
  color: AvatarColor,
): {
  bg: string;
  fg: string;
} {
  switch (color) {
    case 'brand':
      return { bg: t.bg.fill.primary.default, fg: '#FFFFFF' };
    case 'purple':
      return { bg: '#7C3AED', fg: '#FFFFFF' };
    case 'teal':
      return { bg: '#0891B2', fg: '#FFFFFF' };
    case 'orange':
      return { bg: '#F07332', fg: '#FFFFFF' };
    case 'pink':
      return { bg: '#E8186D', fg: '#FFFFFF' };
    default:
      return { bg: t.bg.surface.tertiary.default, fg: t.text.secondary.default };
  }
}

function presenceFill(t: VDSTheme, p: Exclude<Presence, 'none'>): string {
  if (p === 'online') return '#0A8853';
  if (p === 'offline') return t.border.strong.default;
  return '#D22232';
}

function DocAvatar({
  t,
  type,
  size,
  shape,
  color,
  presence,
  initials,
  src,
  ring,
  className,
}: {
  t: VDSTheme;
  type: AvatarType;
  size: AvatarSize;
  shape: AvatarShape;
  color: AvatarColor;
  presence: Presence;
  initials: string;
  src: string;
  ring?: boolean;
  className?: string;
}) {
  const s = SIZE_MAP[size];
  const br = shape === 'circle' ? '50%' : '10px';
  const pair = getColorPair(t, color);
  const badge = Math.max(6, Math.min(14, Math.round(s.px * 0.25)));

  return (
    <div className={className} style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      <div
        style={{
          width: s.px,
          height: s.px,
          borderRadius: br,
          overflow: 'hidden',
          background: type === 'image' ? t.bg.surface.tertiary.default : pair.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: ring ? `3px solid ${t.border.brand.focus}` : undefined,
          outlineOffset: ring ? 2 : undefined,
        }}
      >
        {type === 'image' ? (
          <img src={src} alt="" width={s.px} height={s.px} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : type === 'initials' ? (
          <span style={{ fontSize: s.fontSize, fontWeight: 700, color: pair.fg, fontFamily: 'Nunito Sans, var(--font-sans), sans-serif' }}>
            {initials}
          </span>
        ) : (
          <User size={s.iconSize} color={pair.fg} strokeWidth={2} aria-hidden />
        )}
      </div>
      {presence !== 'none' ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: badge,
            height: badge,
            borderRadius: '50%',
            background: presenceFill(t, presence),
            border: `2px solid ${t.bg.surface.primary.default}`,
            boxSizing: 'border-box',
          }}
        />
      ) : null}
    </div>
  );
}

function DocCounterChip({
  t,
  label,
  variant,
  sizePx,
}: {
  t: VDSTheme;
  label: string;
  variant: 'default' | 'brand';
  sizePx: number;
}) {
  const isBrand = variant === 'brand';
  return (
    <div
      style={{
        minWidth: sizePx,
        height: sizePx,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        fontSize: Math.max(10, Math.round(sizePx * 0.38)),
        fontWeight: 700,
        background: isBrand ? t.bg.fill.brandSubtle.default : t.bg.surface.secondary.default,
        border: isBrand ? `1px solid ${t.border.brand.default}` : `1px solid ${t.border.default.default}`,
        color: isBrand ? t.text.brand.default : t.text.secondary.default,
        marginLeft: -8,
        zIndex: 2,
      }}
    >
      <Plus size={Math.max(10, Math.round(sizePx * 0.28))} strokeWidth={2.5} aria-hidden />
      <span>{label.replace(/^\++\s*/, '')}</span>
    </div>
  );
}

function DocAvatarGroupRow({
  t,
  totalExtra,
  counterVariant = 'default',
}: {
  t: VDSTheme;
  totalExtra: number;
  counterVariant?: 'default' | 'brand';
}) {
  const size: AvatarSize = 'md';
  const s = SIZE_MAP[size];
  const faces = [
    UNSPLASH_FACE,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
      {faces.map((src, i) => (
        <div key={src} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: i }}>
          <DocAvatar
            t={t}
            type="image"
            size={size}
            shape="circle"
            color="brand"
            presence="none"
            initials="JL"
            src={src}
          />
        </div>
      ))}
      <DocCounterChip t={t} label={`+${totalExtra}`} variant={counterVariant} sizePx={s.px} />
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

const SIZE_ORDER: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

const SIZE_LABELS: Record<AvatarSize, { px: string; use: string }> = {
  xs: { px: '24px', use: 'Dense tables, tags' },
  sm: { px: '32px', use: 'Comments, chips' },
  md: { px: '40px', use: 'Default — list rows, nav' },
  lg: { px: '56px', use: 'Cards, profile rows' },
  xl: { px: '72px', use: 'Page headers' },
  '2xl': { px: '96px', use: 'Profile pages, full context' },
};

export default function AvatarDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [type, setType] = useState<AvatarType>('image');
  const [size, setSize] = useState<AvatarSize>('md');
  const [shape, setShape] = useState<AvatarShape>('circle');
  const [color, setColor] = useState<AvatarColor>('brand');
  const [presence, setPresence] = useState<Presence>('online');
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
        { id: 'principles-av', label: 'Principles' },
        { id: 'anatomy-av', label: 'Anatomy' },
        { id: 'sizes-av', label: 'Sizes' },
        { id: 'variants-av', label: 'Variants' },
        { id: 'group-av', label: 'Avatar group' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-av', label: 'When to use' },
        { id: 'context-av', label: 'Context patterns' },
        { id: 'dos-donts-av', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'name-format-av', label: 'Name formatting' },
        { id: 'alt-text-av', label: 'Alt text' },
        { id: 'presence-sr-av', label: 'Presence labels' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-av', label: 'Installation' },
        { id: 'import-av', label: 'Import' },
        { id: 'examples-av', label: 'Usage examples' },
        { id: 'props-av', label: 'Props' },
      ];
    }
    return [];
  }, [activeTab]);

  const avatarPropsRows = [
    { name: 'src', type: 'string', default: '—', description: 'Image URL' },
    { name: 'name', type: 'string', default: '—', description: 'Full name — used for initials + alt text' },
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'",
      default: "'md'",
      description: 'Avatar size',
    },
    {
      name: 'shape',
      type: "'circle' | 'square'",
      default: "'circle'",
      description: 'Border shape',
    },
    {
      name: 'color',
      type: "'brand' | 'purple' | 'teal' | 'orange' | 'pink' | 'neutral'",
      default: "'brand'",
      description: 'Initials/icon bg color',
    },
    {
      name: 'presence',
      type: "'online' | 'offline' | 'busy' | 'none'",
      default: "'none'",
      description: 'Presence badge',
    },
    { name: 'isClickable', type: 'boolean', default: 'false', description: 'Focus ring + button semantics' },
    { name: 'onClick', type: '() => void', default: '—', description: 'Click handler' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const groupPropsRows = [
    { name: 'max', type: 'number', default: '4', description: 'Max avatars before collapsing' },
    {
      name: 'size',
      type: '(same as Avatar size)',
      default: "'md'",
      description: 'Applied to all avatars',
    },
    { name: 'overlap', type: 'number', default: '8', description: 'Negative margin overlap in px' },
    { name: 'children', type: 'ReactNode', default: '—', description: 'Avatar elements' },
  ];

  const codeBasic = `// Basic — image with fallback
<Avatar
  src="https://example.com/photo.jpg"
  name="Jane Lim"
  size="md"
/>`;

  const codeInitials = `// Initials only
<Avatar name="Jane Lim" size="lg" color="brand" />`;

  const codePresence = `// With presence
<Avatar
  src="https://example.com/photo.jpg"
  name="Marcus Chen"
  size="md"
  presence="online"
/>`;

  const codeClickable = `// Clickable (profile trigger)
<Avatar
  src="https://example.com/photo.jpg"
  name="Jane Lim"
  size="md"
  isClickable
  onClick={() => openProfilePanel()}
/>`;

  const codeSquare = `// Square (for bots, teams, organizations)
<Avatar name="Design Team" size="md" shape="square" color="purple" />`;

  const codeGroup = `// AvatarGroup
<AvatarGroup max={4} size="sm">
  <Avatar src="/jane.jpg"   name="Jane Lim" />
  <Avatar src="/marcus.jpg" name="Marcus Chen" />
  <Avatar name="Sophie R."  color="teal" />
  <Avatar name="Tom K."     color="orange" />
  <Avatar name="Priya N."   color="pink" />
  <Avatar name="Alex W."    color="purple" />
</AvatarGroup>`;

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Avatar
      </p>
      <h1 className="page-title">Avatar</h1>
      <p className="page-lead">
        Avatars represent a person, team, or entity. They create a human connection in interfaces — users scan for faces before
        reading names. The Avatar component handles images gracefully, falls back to initials, and falls back further to an icon
        when neither is available.
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
              canvasIsDark={appearance === 'dark'}
              controls={
                <>
                  <LivePreviewSegmentRow t={t} label="Type" options={['image', 'initials', 'icon']} value={type} onChange={setType} />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Size"
                    options={['xs', 'sm', 'md', 'lg', 'xl', '2xl']}
                    value={size}
                    onChange={setSize}
                  />
                  <LivePreviewSegmentRow t={t} label="Shape" options={['circle', 'square']} value={shape} onChange={setShape} />
                  {type !== 'image' ? (
                    <LivePreviewSegmentRow
                      t={t}
                      label="Color"
                      options={['brand', 'purple', 'teal', 'orange', 'pink', 'neutral']}
                      value={color}
                      onChange={setColor}
                    />
                  ) : null}
                  <LivePreviewSegmentRow
                    t={t}
                    label="Presence"
                    options={['none', 'online', 'offline', 'busy']}
                    value={presence}
                    onChange={setPresence}
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
              <DocAvatar
                t={previewT}
                type={type}
                size={size}
                shape={shape}
                color={color}
                presence={presence}
                initials="JL"
                src={UNSPLASH_FACE}
              />
            </LivePreviewShell>
          </section>

          <section id="principles-av" style={{ marginBottom: 48 }}>
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
                <div
                  style={{
                    background: t.bg.surface.secondary.default,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <DocAvatar
                      t={t}
                      type="image"
                      size="sm"
                      shape="circle"
                      color="brand"
                      presence="none"
                      initials="JL"
                      src={UNSPLASH_FACE}
                    />
                    <ArrowRight size={16} color={t.text.tertiary.default} aria-hidden />
                    <DocAvatar
                      t={t}
                      type="initials"
                      size="sm"
                      shape="circle"
                      color="brand"
                      presence="none"
                      initials="JL"
                      src={UNSPLASH_FACE}
                    />
                    <ArrowRight size={16} color={t.text.tertiary.default} aria-hidden />
                    <DocAvatar
                      t={t}
                      type="icon"
                      size="sm"
                      shape="circle"
                      color="neutral"
                      presence="none"
                      initials="JL"
                      src={UNSPLASH_FACE}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 10, color: t.text.tertiary.default, textAlign: 'center' }}>
                    <span style={{ width: 72 }}>image</span>
                    <span style={{ width: 72 }}>initials</span>
                    <span style={{ width: 72 }}>icon</span>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <User size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Graceful fallback chain</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Always show something meaningful. If the photo fails to load, show initials. If there are no initials, show a
                    generic icon. The fallback chain ensures the interface never shows a broken state.
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
                <div
                  style={{
                    background: t.bg.surface.secondary.default,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                    minHeight: 120,
                  }}
                >
                  {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                    <DocAvatar
                      key={sz}
                      t={t}
                      type="initials"
                      size={sz}
                      shape="circle"
                      color="brand"
                      presence="none"
                      initials="JL"
                      src={UNSPLASH_FACE}
                    />
                  ))}
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Circle size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Size communicates hierarchy</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Larger avatars signal more importance or context. Use xl in profile headers, lg in cards, md in list rows, sm
                    in chips and comments, xs in dense data tables.
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
                <div
                  style={{
                    background: t.bg.surface.secondary.default,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 120,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <DocAvatarGroupRow t={t} totalExtra={3} />
                    <div style={{ fontSize: 10, color: t.text.tertiary.default }}>Up to 4 shown · +N counter</div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Users size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Groups create social context</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    AvatarGroup communicates that multiple people are involved — in a project, a document, a task. Show up to
                    4, then collapse the rest into a +N counter.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-av" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                position: 'relative',
                height: 280,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                backgroundColor: t.bg.surface.secondary.default,
                backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', left: '50%', top: 36, transform: 'translateX(-50%)', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <AnnotationDot letter="A" />
                  <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Avatar image / initials / icon</span>
                </div>
                <div
                  style={{
                    borderRadius: SIZE_MAP.md.px / 2 + 6,
                    padding: 3,
                    outline: `3px solid ${t.border.brand.focus}`,
                    outlineOffset: 0,
                    display: 'inline-flex',
                  }}
                >
                  <DocAvatar
                    t={t}
                    type="initials"
                    size="md"
                    shape="circle"
                    color="brand"
                    presence="online"
                    initials="JL"
                    src={UNSPLASH_FACE}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, marginLeft: 52 }}>
                  <AnnotationDot letter="B" />
                  <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Presence (10px · bottom-right · 2px border)</span>
                </div>
              </div>
              <div style={{ position: 'absolute', left: 36, top: 120, display: 'flex', alignItems: 'center', gap: 8, maxWidth: 300 }}>
                <AnnotationDot letter="C" />
                <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Ring / focus border (isClickable)</span>
              </div>
              <div style={{ position: 'absolute', left: 36, bottom: 28, display: 'flex', alignItems: 'flex-start', gap: 8, maxWidth: 440 }}>
                <AnnotationDot letter="D" />
                <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700, lineHeight: 1.4, textAlign: 'left' }}>
                  Container — width/height per size, borderRadius 50% or 10px, overflow hidden
                </span>
              </div>
            </div>
          </section>

          <section id="sizes-av" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Sizes
            </h2>
            <p style={{ fontSize: 17, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              Six sizes cover every density level. Choose based on context, not preference.
            </p>
            <div
              style={{
                padding: '24px 16px',
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                background: t.bg.surface.secondary.default,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                {SIZE_ORDER.map((sz) => (
                  <div key={sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: '1 1 72px' }}>
                    <DocAvatar
                      t={t}
                      type="initials"
                      size={sz}
                      shape="circle"
                      color="brand"
                      presence="none"
                      initials="JL"
                      src={UNSPLASH_FACE}
                    />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.text.primary.default }}>{sz}</div>
                      <div style={{ fontSize: 10, color: t.text.tertiary.default }}>{SIZE_LABELS[sz].px}</div>
                      <div style={{ fontSize: 10, color: t.text.secondary.default, maxWidth: 100, lineHeight: 1.35 }}>{SIZE_LABELS[sz].use}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {SIZE_ORDER.map((sz) => (
                <span key={sz} style={chipStyleB(t, { background: t.bg.surface.tertiary.default, color: t.text.secondary.default })}>
                  --avatar-{sz}: {SIZE_MAP[sz].px}px
                </span>
              ))}
            </div>
          </section>

          <section id="variants-av" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Camera
                    size={16}
                    color={t.text.tertiary.default}
                    style={{ position: 'absolute', top: 12, right: 12, opacity: 0.5 }}
                    aria-hidden
                  />
                  <DocAvatar
                    t={t}
                    type="image"
                    size="md"
                    shape="circle"
                    color="brand"
                    presence="none"
                    initials="JL"
                    src={UNSPLASH_FACE}
                  />
                </div>
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Image</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>type: image</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>
                    Photo avatar. Renders an img element with objectFit cover. Always provide alt text.
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
                <div style={{ height: 160, background: t.bg.surface.secondary.default, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DocAvatar
                    t={t}
                    type="initials"
                    size="md"
                    shape="circle"
                    color="brand"
                    presence="none"
                    initials="JL"
                    src={UNSPLASH_FACE}
                  />
                </div>
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Initials</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>type: initials</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>
                    Shown when no image is available. Derived from the name prop — first letter of each word, max 2 characters.
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
                <div style={{ height: 160, background: t.bg.surface.secondary.default, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DocAvatar
                    t={t}
                    type="icon"
                    size="md"
                    shape="circle"
                    color="neutral"
                    presence="none"
                    initials="JL"
                    src={UNSPLASH_FACE}
                  />
                </div>
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Icon</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>type: icon</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>
                    Fallback when neither image nor name is available. A generic icon communicates &apos;person&apos; without personal
                    data.
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
                <div style={{ height: 160, background: t.bg.surface.secondary.default, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DocAvatar
                    t={t}
                    type="image"
                    size="md"
                    shape="circle"
                    color="brand"
                    presence="online"
                    initials="JL"
                    src={UNSPLASH_FACE}
                  />
                </div>
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>With presence</div>
                  <span style={chipStyleB(t, { marginBottom: 8 })}>presence: online</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>
                    Presence badge overlays the bottom-right corner. Use online, offline, busy to reflect real-time status.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="group-av" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Avatar group
            </h2>
            <p style={{ fontSize: 17, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              AvatarGroup stacks avatars with a negative margin overlap. When the list is long, it collapses into a +N counter
              chip that matches the avatar style.
            </p>
            <div
              style={{
                minHeight: 160,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                backgroundColor: t.bg.surface.secondary.default,
                backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                padding: 24,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 24,
                marginBottom: 20,
              }}
            >
              <div style={{ position: 'relative' }}>
                <DocAvatarGroupRow t={t} totalExtra={5} />
                <div style={{ position: 'absolute', right: -56, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#E8186D', fontWeight: 700 }}>
                  +5 more
                </div>
                <div style={{ position: 'absolute', left: '40%', bottom: -28, fontSize: 11, color: '#E8186D', fontWeight: 700 }}>
                  overlap: -8px
                </div>
                <div style={{ position: 'absolute', right: 8, bottom: -28, fontSize: 11, color: '#E8186D', fontWeight: 700 }}>max: 4</div>
              </div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 12 }}>Counter chip variants</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <DocCounterChip t={t} label="+5" variant="default" sizePx={40} />
              <span style={{ fontSize: 12, color: t.text.secondary.default }}>default — surface + border.default + text.secondary</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 12 }}>
              <DocCounterChip t={t} label="+5" variant="brand" sizePx={40} />
              <span style={{ fontSize: 12, color: t.text.secondary.default }}>brand — fill.brandSubtle + text.brand</span>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-av" style={{ marginTop: 32, marginBottom: 40 }}>
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
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0A8853', marginBottom: 12, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} aria-hidden /> DO
                </div>
                {[
                  'Represent users and people',
                  'Show who created or edited something',
                  'Indicate participants in a task or project',
                  'Navigation items with the current user’s profile photo',
                ].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: 'rgba(232,24,109,0.04)',
                  border: '1px solid rgba(232,24,109,0.2)',
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: '#E8186D', marginBottom: 12, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <X size={14} aria-hidden /> DON&apos;T
                </div>
                {[
                  'Represent non-human entities (use an icon or logo instead)',
                  'Use xl in dense lists',
                  'Show avatars without context for why that person matters',
                ].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="tip" title="Always provide a name prop">
                Even when displaying a photo, pass the name prop. It generates the alt text for the image and the initials
                fallback. Without it, the component renders a generic icon and screen readers have no context.
              </Callout>
            </div>
          </section>

          <section id="context-av" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Context patterns
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
                <div
                  style={{
                    height: 140,
                    background: t.bg.surface.secondary.default,
                    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <DocAvatar
                    t={t}
                    type="image"
                    size="sm"
                    shape="circle"
                    color="brand"
                    presence="none"
                    initials="JL"
                    src={UNSPLASH_FACE}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>Jane Lim</div>
                    <div style={{ fontSize: 11, color: t.text.tertiary.default }}>2 min ago</div>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Comment / list row</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    sm (32px) in dense lists. Pair with the author&apos;s name and a timestamp.
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
                <div
                  style={{
                    height: 140,
                    background: t.bg.surface.secondary.default,
                    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    padding: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>Ship analytics export</span>
                    <button type="button" aria-label="More" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: t.icon.secondary.default }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: t.bg.fill.brandSubtle.default,
                      color: t.text.brand.default,
                      marginBottom: 16,
                    }}
                  >
                    In progress
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DocAvatar
                      t={t}
                      type="image"
                      size="xs"
                      shape="circle"
                      color="brand"
                      presence="none"
                      initials="JL"
                      src={UNSPLASH_FACE}
                    />
                    <span style={{ fontSize: 12, color: t.text.secondary.default }}>Jane L.</span>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Assignee in a task card</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    xs (24px) for task assignments. Combine with a name label to ensure clarity at small sizes.
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
                <div
                  style={{
                    height: 140,
                    background: t.bg.surface.secondary.default,
                    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    padding: 12,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                    <DocAvatar
                      t={t}
                      type="image"
                      size="xl"
                      shape="circle"
                      color="brand"
                      presence="online"
                      initials="JL"
                      src={UNSPLASH_FACE}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>Jane Lim</span>
                    <Crown size={12} color={t.text.warning.default} aria-hidden />
                  </div>
                  <div style={{ fontSize: 10, color: t.text.tertiary.default, marginBottom: 8 }}>Product design · SF</div>
                  <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 4 }}>Followed by</div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <DocAvatarGroupRow t={t} totalExtra={2} counterVariant="brand" />
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Profile section</div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    xl (72px) in profile headers and user settings. Only one per view.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="dos-donts-av" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — consistent size in a group"
                  caption="AvatarGroup with every avatar using the same size (md) keeps the stack visually balanced."
                >
                  <DocAvatarGroupRow t={t} totalExtra={3} />
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — mixed sizes in one group"
                  caption="Do not mix sm and lg inside the same AvatarGroup — the overlap looks accidental and hierarchy breaks."
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ marginLeft: 0 }}>
                      <DocAvatar t={t} type="image" size="sm" shape="circle" color="brand" presence="none" initials="A" src={UNSPLASH_FACE} />
                    </div>
                    <div style={{ marginLeft: -8 }}>
                      <DocAvatar t={t} type="initials" size="lg" shape="circle" color="teal" presence="none" initials="JK" src={UNSPLASH_FACE} />
                    </div>
                  </div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — fallback always meaningful"
                  caption="Initials with strong contrast on a brand background remain readable and identifiable."
                >
                  <DocAvatar t={t} type="initials" size="md" shape="circle" color="brand" presence="none" initials="JL" src={UNSPLASH_FACE} />
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — broken or empty avatar"
                  caption="Never leave the avatar empty or show a broken image — use img onError to activate initials or icon fallback."
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: `2px dashed ${t.border.danger.default}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: t.bg.surface.tertiary.default,
                    }}
                  >
                    <X size={18} color={t.text.danger.default} aria-hidden />
                  </div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — presence on medium+ avatars"
                  caption="On md or larger, the presence badge stays visible and proportioned."
                >
                  <DocAvatar
                    t={t}
                    type="image"
                    size="md"
                    shape="circle"
                    color="brand"
                    presence="online"
                    initials="JL"
                    src={UNSPLASH_FACE}
                  />
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — presence on xs"
                  caption="Avoid presence on xs avatars — the badge is too small to read clearly."
                >
                  <DocAvatar
                    t={t}
                    type="image"
                    size="xs"
                    shape="circle"
                    color="brand"
                    presence="online"
                    initials="JL"
                    src={UNSPLASH_FACE}
                  />
                </IllustratedDoDont>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="name-format-av" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Name formatting
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Pass full name: &apos;Jane Lim&apos; → initials &apos;JL&apos;</li>
              <li>Single name: &apos;Jane&apos; → initial &apos;J&apos;</li>
              <li>All caps names: normalize to Title Case before deriving initials</li>
            </ul>
          </section>
          <section id="alt-text-av" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Alt text
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Image avatars: alt should be the person&apos;s name (&apos;Jane Lim&apos;) — never empty or &apos;avatar&apos;</li>
              <li>Decorative context (user already named nearby): alt=&apos;&apos; is acceptable but name prop still required</li>
            </ul>
          </section>
          <section id="presence-sr-av" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Presence labels (for screen readers)
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>online → &apos;Online&apos;</li>
              <li>offline → &apos;Offline&apos;</li>
              <li>busy → &apos;Do not disturb&apos;</li>
            </ul>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="install-av" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-av" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock code={`import { Avatar, AvatarGroup } from '@vds/react'`} filename="component.tsx" language="tsx" />
          </section>
          <section id="examples-av" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={codeBasic} filename="Basic — image with fallback" language="tsx" />
              <CodeBlock code={codeInitials} filename="Initials only" language="tsx" />
              <CodeBlock code={codePresence} filename="With presence" language="tsx" />
              <CodeBlock code={codeClickable} filename="Clickable" language="tsx" />
              <CodeBlock code={codeSquare} filename="Square" language="tsx" />
              <CodeBlock code={codeGroup} filename="AvatarGroup" language="tsx" />
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="info" title="Image loading and fallback">
                The Avatar component listens to the img onError event. If the image fails to load, it automatically shows initials
                (if name is provided) or the User icon. Never show a broken image state.
              </Callout>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="info" title="Accessibility">
                Clickable avatars render as button elements with aria-label derived from the name prop. Non-clickable avatars with
                images use role=&apos;img&apos; + alt. Presence badges include a visually hidden span with the status text for screen
                readers.
              </Callout>
            </div>
          </section>
          <section id="props-av" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Props — Avatar
            </h3>
            <PropsTable props={avatarPropsRows} />
            <h3 className="section-title" style={{ fontSize: 18, marginTop: 28, marginBottom: 12 }}>
              Props — AvatarGroup
            </h3>
            <PropsTable props={groupPropsRows} />
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
                Initial release. Avatar with image/initials/icon fallback chain, 6 sizes, presence badge, AvatarGroup with +N
                counter.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
