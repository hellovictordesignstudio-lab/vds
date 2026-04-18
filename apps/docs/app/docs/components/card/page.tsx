'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Heart,
  Image,
  MoreHorizontal,
  Share2,
  Star,
  Zap,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '../../../../components/docs/CodeBlock';
import { ComponentTabs } from '../../../../components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '../../../../components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type ShadowLevel = 'none' | 'sm' | 'md' | 'lg';
type PaddingLevel = 'sm' | 'md' | 'lg';

const paddingMap: Record<PaddingLevel, number> = { sm: 16, md: 20, lg: 24 };

function getShadow(level: ShadowLevel, t: VDSTheme): string {
  if (level === 'none') return 'none';
  if (level === 'sm') return t.shadow.card;
  if (level === 'md') return t.shadow.md;
  return t.shadow.lg;
}

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

function LiveCardPreview({
  t,
  shadow,
  padding,
  showImage,
  showFooter,
  isHoverable,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  t: VDSTheme;
  shadow: ShadowLevel;
  padding: PaddingLevel;
  showImage: boolean;
  showFooter: boolean;
  isHoverable: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const isClickable = isHoverable;
  const boxShadow = getShadow(shadow, t);
  const pad = paddingMap[padding];

  return (
    <div
      role="presentation"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        width: 320,
        background: t.bg.surface.primary.default,
        borderRadius: 14,
        border: `1px solid ${t.border.default.default}`,
        overflow: 'hidden',
        boxShadow: isHoverable && isHovered ? t.shadow.md : boxShadow,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'box-shadow 200ms, transform 200ms',
        transform: isHoverable && isHovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {showImage ? (
        <div
          style={{
            height: 160,
            width: '100%',
            background: `linear-gradient(135deg, ${t.bg.fill.brandSubtle.default}, ${t.bg.surface.tertiary.default})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image size={32} color={t.icon.tertiary.default} aria-hidden />
        </div>
      ) : null}
      <div style={{ padding: pad }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 4 }}>Card title</div>
            <div style={{ fontSize: 12, color: t.text.tertiary.default }}>Subtitle or meta info</div>
          </div>
          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.icon.secondary.default }}>
            <MoreHorizontal size={18} aria-hidden />
          </button>
        </div>
        <div style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 16 }}>
          A brief description of the card content. Cards group related information into a single scannable unit.
        </div>
        {showFooter ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 12,
              borderTop: `1px solid ${t.border.default.default}`,
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: t.icon.secondary.default,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                }}
              >
                <Heart size={15} aria-hidden /> 24
              </button>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: t.icon.secondary.default,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                }}
              >
                <Share2 size={15} aria-hidden />
              </button>
            </div>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: t.text.brand.default,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View details <ArrowRight size={13} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CardDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [shadow, setShadow] = useState<ShadowLevel>('sm');
  const [padding, setPadding] = useState<PaddingLevel>('md');
  const [image, setImage] = useState<'off' | 'on'>('on');
  const [footer, setFooter] = useState<'off' | 'on'>('on');
  const [hoverable, setHoverable] = useState<'off' | 'on'>('off');
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [isHovered, setIsHovered] = useState(false);

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
        { id: 'principles-cd', label: 'Principles' },
        { id: 'anatomy-cd', label: 'Anatomy' },
        { id: 'variants-cd', label: 'Variants' },
        { id: 'types-cd', label: 'Card types' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-cd', label: 'When to use' },
        { id: 'grid-patterns', label: 'Grid patterns' },
        { id: 'dos-donts-cd', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'content-title-cd', label: 'Title writing' },
        { id: 'content-desc-cd', label: 'Description writing' },
        { id: 'content-action-cd', label: 'Action labels' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-cd', label: 'Installation' },
        { id: 'import-cd', label: 'Import' },
        { id: 'examples-cd', label: 'Usage examples' },
        { id: 'props-cd', label: 'Props' },
        { id: 'a11y-cd', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const propsRows = [
    {
      name: 'padding',
      type: "'none' | 'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Inner padding',
    },
    {
      name: 'shadow',
      type: "'none' | 'sm' | 'md' | 'lg'",
      default: "'sm'",
      description: 'Box shadow level',
    },
    { name: 'hasBorder', type: 'boolean', default: 'true', description: '1px border' },
    { name: 'isHoverable', type: 'boolean', default: 'false', description: 'Elevation + translate on hover' },
    { name: 'isClickable', type: 'boolean', default: 'false', description: 'Makes entire card keyboard-accessible' },
    { name: 'as', type: 'ElementType', default: "'div'", description: "Render as 'a', 'article', etc." },
    { name: 'href', type: 'string', default: '—', description: "Makes card a link (sets as='a')" },
    { name: 'onClick', type: '() => void', default: '—', description: 'Click handler' },
    { name: 'className', type: 'string', default: '—', description: 'Additional CSS classes' },
  ];

  const showImage = image === 'on';
  const showFooter = footer === 'on';
  const isHoverable = hoverable === 'on';

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Card
      </p>
      <h1 className="page-title">Card</h1>
      <p className="page-lead">
        Cards are the primary container for grouped content. They create a visual boundary that says &apos;these things belong
        together.&apos; A card can be static or interactive, simple or complex — but it always contains related information as a
        single unit.
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
                  <LivePreviewSegmentRow
                    t={t}
                    label="Shadow"
                    options={['none', 'sm', 'md', 'lg']}
                    value={shadow}
                    onChange={setShadow}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Padding"
                    options={['sm', 'md', 'lg']}
                    value={padding}
                    onChange={setPadding}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Image"
                    options={['off', 'on']}
                    value={image}
                    onChange={setImage}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Footer"
                    options={['off', 'on']}
                    value={footer}
                    onChange={setFooter}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Hoverable"
                    options={['off', 'on']}
                    value={hoverable}
                    onChange={setHoverable}
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
              <LiveCardPreview
                t={previewT}
                shadow={shadow}
                padding={padding}
                showImage={showImage}
                showFooter={showFooter}
                isHoverable={isHoverable}
                isHovered={isHovered}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              />
            </LivePreviewShell>
          </section>

          <section id="principles-cd" style={{ marginBottom: 48 }}>
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 20, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: 130,
                      padding: 12,
                      borderRadius: 14,
                      border: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.primary.default,
                      boxShadow: t.shadow.card,
                      fontSize: 11,
                      color: t.text.secondary.default,
                    }}
                  >
                    Title + body grouped
                  </div>
                  <div style={{ width: 130, fontSize: 11, color: t.text.secondary.default, lineHeight: 1.5 }}>
                    Title
                    <br />
                    Body without boundary
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Image size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>One unit, one boundary</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A card groups everything that belongs together under one visual boundary. If you find yourself wondering
                    what should go inside a card, ask: &apos;would removing the boundary break the relationship between these
                    elements?&apos; If yes, they belong in a card.
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
                  <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 8 }}>Grid — equal height</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          minHeight: 72,
                          borderRadius: 10,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          padding: 8,
                          fontSize: 10,
                          color: t.text.secondary.default,
                        }}
                      >
                        Card {i}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: t.text.tertiary.default, margin: '16px 0 8px' }}>No card — ragged</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, alignItems: 'start' }}>
                    {[20, 48, 32, 40].map((h, i) => (
                      <div key={i} style={{ height: h, borderRadius: 4, background: t.bg.surface.tertiary.default, fontSize: 9, padding: 4 }}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Star size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Cards create rhythm</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Cards in a grid create visual rhythm because they align and standardize content. This makes scanning faster
                    — the eye knows where to look. A page full of cards is easier to scan than a page of free-floating content
                    blocks.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 20, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 120,
                        padding: 12,
                        borderRadius: 14,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        fontSize: 11,
                        color: t.text.secondary.default,
                      }}
                    >
                      Static info
                    </div>
                    <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 6 }}>Not clickable</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 120,
                        padding: 12,
                        borderRadius: 14,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        boxShadow: t.shadow.md,
                        fontSize: 11,
                        color: t.text.secondary.default,
                        cursor: 'pointer',
                        transform: 'translateY(-2px)',
                      }}
                    >
                      Open detail
                    </div>
                    <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 6 }}>Hover + pointer</div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <ExternalLink size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Interactive vs static</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Not all cards are clickable. A static card contains information. An interactive card is a navigation
                    element or action trigger. Make the distinction clear — interactive cards need hover states and accessible
                    focus rings.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-cd" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                minHeight: 320,
                backgroundColor: t.bg.surface.secondary.default,
                backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                backgroundSize: '12px 12px',
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                padding: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ position: 'relative', width: 280 }}>
                <div style={{ position: 'absolute', top: -22, left: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AnnotationDot letter="A" />
                  <span style={{ fontSize: 11, color: '#E8186D' }}>Image zone</span>
                </div>
                <div style={{ position: 'absolute', top: 52, right: -8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AnnotationDot letter="E" />
                </div>
                <div style={{ position: 'absolute', top: 88, left: -8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AnnotationDot letter="C" />
                </div>
                <div style={{ position: 'absolute', top: 130, left: -8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AnnotationDot letter="D" />
                </div>
                <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AnnotationDot letter="F" />
                  <span style={{ fontSize: 11, color: '#E8186D' }}>Footer</span>
                </div>
                <div style={{ position: 'absolute', bottom: -28, left: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AnnotationDot letter="G" />
                  <span style={{ fontSize: 11, color: t.text.tertiary.default }}>Container (radius + border + shadow)</span>
                </div>
                <div
                  style={{
                    borderRadius: 14,
                    border: `1px solid ${t.border.default.default}`,
                    overflow: 'hidden',
                    background: t.bg.surface.primary.default,
                    boxShadow: t.shadow.card,
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div style={{ height: 72, background: `linear-gradient(135deg, ${t.bg.fill.brandSubtle.default}, ${t.bg.surface.tertiary.default})` }} />
                    <div style={{ position: 'absolute', top: 8, left: 8 }}>
                      <AnnotationDot letter="B" />
                    </div>
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: t.icon.secondary.default,
                      }}
                    >
                      <MoreHorizontal size={16} aria-hidden />
                    </button>
                  </div>
                  <div style={{ padding: '12px 16px 0' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>Title</div>
                    <div style={{ fontSize: 11, color: t.text.tertiary.default, marginTop: 2 }}>Subtitle / meta</div>
                    <div style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5, marginTop: 8 }}>
                      Description text that spans multiple lines.
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 16px 12px',
                      borderTop: `1px solid ${t.border.default.default}`,
                      fontSize: 12,
                      color: t.icon.secondary.default,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Heart size={14} aria-hidden /> 24
                    </span>
                    <span style={{ color: t.text.brand.default, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      View →
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 36, lineHeight: 1.7 }}>
              A → Card.Image (16:9, cover) · B → Card.Header (title row) · C → Subtitle (12px, tertiary) · D → Card.Body · E →
              Header action · F → Card.Footer · G → Card container (radius 14px, border, shadow)
            </p>
          </section>

          <section id="variants-cd" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    title: 'Default',
                    token: 'color.border.default.default',
                    desc: 'Clean flat card. Use inside surfaces that already have elevation (modals, panels, existing cards).',
                    demo: (t: VDSTheme) => ({
                      border: `1px solid ${t.border.default.default}`,
                      boxShadow: 'none' as const,
                    }),
                  },
                  {
                    title: 'Elevated',
                    token: '--shadow-sm',
                    desc: 'Default card for page-level content. The subtle shadow lifts it from the background.',
                    demo: (t: VDSTheme) => ({
                      border: `1px solid ${t.border.default.default}`,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }),
                  },
                  {
                    title: 'Hoverable',
                    token: '--shadow-md',
                    desc: 'Interactive card that elevates on hover. Use for clickable cards that navigate or trigger actions.',
                    demo: (t: VDSTheme) => ({
                      border: `1px solid ${t.border.default.default}`,
                      boxShadow: t.shadow.card,
                      hover: true,
                    }),
                  },
                  {
                    title: 'Outlined',
                    token: 'color.border.strong.default',
                    desc: 'Strong border, no shadow. Use when you need the card boundary to be prominent without elevation.',
                    demo: (t: VDSTheme) => ({
                      border: `2px solid ${t.border.strong.default}`,
                      boxShadow: 'none' as const,
                    }),
                  },
                ] as const
              ).map((row) => {
                const d = row.demo(t);
                return (
                  <div
                    key={row.title}
                    style={{
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: 100,
                        background: t.bg.surface.secondary.default,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <VariantCardMini t={t} demo={d} rowTitle={row.title} />
                    </div>
                    <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>{row.title}</div>
                      <span style={chipStyleB(t, { marginBottom: 8 })}>{row.token}</span>
                      <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>{row.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="types-cd" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Card types
            </h2>
            <p style={{ fontSize: 17, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              VDS cards compose from sub-components. Mix and match Card.Header, Card.Body, Card.Footer, and Card.Image to build
              any layout.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    title: 'Simple card',
                    desc: 'Body only. For informational cards, feature descriptions, and simple content containers.',
                    node: (
                      <div style={{ width: '100%', maxWidth: 200, borderRadius: 14, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 16, boxShadow: t.shadow.card }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>Title</div>
                        <div style={{ fontSize: 11, color: t.text.secondary.default, lineHeight: 1.4, marginBottom: 10 }}>
                          Short description.
                        </div>
                        <div
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 8,
                            background: t.bg.fill.primary.default,
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          Button
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Media card',
                    desc: 'Image + content. For article previews, product cards, gallery items.',
                    node: (
                      <div style={{ width: '100%', maxWidth: 200, borderRadius: 14, border: `1px solid ${t.border.default.default}`, overflow: 'hidden', background: t.bg.surface.primary.default, boxShadow: t.shadow.card }}>
                        <div style={{ height: 56, background: `linear-gradient(135deg, ${t.bg.fill.brandSubtle.default}, ${t.bg.surface.tertiary.default})` }} />
                        <div style={{ padding: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>Title</div>
                          <div style={{ fontSize: 11, color: t.text.secondary.default, marginTop: 4 }}>Description…</div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Stat card',
                    desc: 'Metric display. Large value + label + optional trend indicator. Used in dashboards.',
                    node: (
                      <div style={{ width: '100%', maxWidth: 200, borderRadius: 14, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 16, boxShadow: t.shadow.card }}>
                        <div style={{ fontSize: 10, color: t.text.tertiary.default, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total revenue</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: t.text.primary.default, marginTop: 6 }}>$48,295</div>
                        <div style={{ fontSize: 11, color: t.text.success.default, marginTop: 4 }}>↑ +12.5%</div>
                      </div>
                    ),
                  },
                  {
                    title: 'Action card',
                    desc: 'Horizontal layout for quick-action lists, settings items, and navigation rows.',
                    node: (
                      <div
                        style={{
                          width: '100%',
                          maxWidth: 260,
                          borderRadius: 14,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          boxShadow: t.shadow.card,
                        }}
                      >
                        <Zap size={18} color={t.text.brand.default} aria-hidden />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>Title</div>
                          <div style={{ fontSize: 11, color: t.text.secondary.default }}>Description</div>
                        </div>
                        <ArrowRight size={16} color={t.text.tertiary.default} aria-hidden />
                      </div>
                    ),
                  },
                  {
                    title: 'Profile card',
                    desc: 'User or entity profile. Avatar + identifying info + optional stats row.',
                    node: (
                      <div style={{ width: '100%', maxWidth: 200, borderRadius: 14, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 16, textAlign: 'center', boxShadow: t.shadow.card }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: t.bg.surface.tertiary.default,
                            margin: '0 auto 8px',
                          }}
                        />
                        <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>Jane Smith</div>
                        <div style={{ fontSize: 11, color: t.text.tertiary.default }}>Designer</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10, fontSize: 11, fontWeight: 600, color: t.text.secondary.default }}>
                          <span>12</span>|<span>4</span>|<span>8</span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Horizontal card',
                    desc: 'Side-by-side layout. Image on left, content on right. Good for article lists and product rows.',
                    node: (
                      <div
                        style={{
                          width: '100%',
                          maxWidth: 260,
                          borderRadius: 14,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          overflow: 'hidden',
                          display: 'flex',
                          boxShadow: t.shadow.card,
                        }}
                      >
                        <div style={{ width: '40%', minHeight: 72, background: `linear-gradient(135deg, ${t.bg.fill.brandSubtle.default}, ${t.bg.surface.tertiary.default})` }} />
                        <div
                          style={{
                            flex: 1,
                            padding: 10,
                            fontSize: 11,
                            color: t.text.secondary.default,
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>Title</div>
                          <div style={{ marginTop: 4 }}>Description</div>
                          <div style={{ marginTop: 8, fontSize: 10, fontWeight: 600, color: t.text.brand.default }}>[Button]</div>
                        </div>
                      </div>
                    ),
                  },
                ] as const
              ).map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ background: t.bg.surface.secondary.default, padding: 20, minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.node}
                  </div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>{item.title}</div>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-cd" style={{ marginTop: 32, marginBottom: 40 }}>
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
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0A8853', marginBottom: 12, letterSpacing: '0.06em' }}>DO</div>
                {['Grouped related content', 'Navigation to detail views', 'Data summaries', 'Product/article listings'].map((x) => (
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
                <div style={{ fontSize: 12, fontWeight: 800, color: '#E8186D', marginBottom: 12, letterSpacing: '0.06em' }}>
                  DON&apos;T
                </div>
                {['Single isolated data points (use StatCard)', 'Sequential steps (use a stepper)', 'Simple text blocks without a clear boundary need'].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="info" title="Cards are containers, not components">
                A card is a layout primitive — it groups and contains. The actual content (buttons, badges, avatars, text) are
                separate components composed inside the card. Don&apos;t put component logic inside the card component itself.
              </Callout>
            </div>
          </section>

          <section id="grid-patterns" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Grid patterns
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: `1px solid ${t.border.default.default}`,
                  background: t.bg.surface.secondary.default,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>2 columns</div>
                <div style={{ fontSize: 11, color: t.text.secondary.default, lineHeight: 1.5 }}>
                  <code style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>repeat(2, 1fr)</code> · gap 16px —
                  feature comparisons, side-by-side content
                </div>
              </div>
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: `1px solid ${t.border.default.default}`,
                  background: t.bg.surface.secondary.default,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>3 columns</div>
                <div style={{ fontSize: 11, color: t.text.secondary.default, lineHeight: 1.5 }}>
                  <code style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>repeat(3, 1fr)</code> — listings,
                  dashboard widgets
                </div>
              </div>
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: `1px solid ${t.border.default.default}`,
                  background: t.bg.surface.secondary.default,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>Auto-fill</div>
                <div style={{ fontSize: 11, color: t.text.secondary.default, lineHeight: 1.5 }}>
                  <code style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>auto-fill, minmax(280px, 1fr)</code> —
                  responsive
                </div>
              </div>
            </div>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="tip" title="Equal height cards in a grid">
                In CSS Grid, cards in the same row automatically reach equal height. Use Card.Footer with{' '}
                <code style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>margin-top: auto</code> to push
                footers to the bottom of each card, maintaining alignment across the row.
              </Callout>
            </div>
          </section>

          <section id="dos-donts-cd" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <IllustratedDoDont
                t={t}
                ok
                title="Consistent padding within a grid"
                caption="Same padding keeps the grid visually aligned."
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  {[16, 16, 16].map((p, i) => (
                    <div
                      key={i}
                      style={{
                        width: 56,
                        height: 48,
                        borderRadius: 10,
                        border: `1px solid ${t.border.default.default}`,
                        boxShadow: t.shadow.card,
                        padding: p / 4,
                        fontSize: 8,
                        background: t.bg.surface.primary.default,
                      }}
                    />
                  ))}
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Consistent padding within a grid"
                caption="Mixing padding sizes in one grid breaks alignment."
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ width: 56, height: 40, borderRadius: 10, border: `1px solid ${t.border.default.default}`, padding: 4, background: t.bg.surface.primary.default }} />
                  <div style={{ width: 56, height: 52, borderRadius: 10, border: `1px solid ${t.border.default.default}`, padding: 16, background: t.bg.surface.primary.default }} />
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="One primary action per card"
                caption="A single clear CTA reduces decision fatigue."
              >
                <div style={{ width: 160, borderRadius: 14, border: `1px solid ${t.border.default.default}`, padding: 12, background: t.bg.surface.primary.default, fontSize: 11, color: t.text.brand.default, fontWeight: 600 }}>
                  View details →
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="One primary action per card"
                caption="Many buttons compete for attention."
              >
                <div style={{ width: 180, borderRadius: 14, border: `1px solid ${t.border.default.default}`, padding: 8, background: t.bg.surface.primary.default, display: 'flex', flexWrap: 'wrap', gap: 4, fontSize: 9 }}>
                  <span>btn</span>
                  <span>btn</span>
                  <span>btn</span>
                  <span>btn</span>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Don’t nest cards"
                caption="Use rows or dividers inside a single card instead."
              >
                <div style={{ width: 160, borderRadius: 14, border: `1px solid ${t.border.default.default}`, padding: 10, background: t.bg.surface.primary.default }} />
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Don’t nest cards"
                caption="Nested cards add confusing depth."
              >
                <div style={{ width: 160, borderRadius: 14, border: `1px solid ${t.border.default.default}`, padding: 8, background: t.bg.surface.primary.default }}>
                  <div style={{ borderRadius: 10, border: `1px solid ${t.border.default.default}`, padding: 8, background: t.bg.surface.secondary.default }}>
                    <div style={{ borderRadius: 8, border: `1px solid ${t.border.default.default}`, padding: 6, background: t.bg.surface.primary.default }} />
                  </div>
                </div>
              </IllustratedDoDont>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="content-title-cd" style={{ marginTop: 32, marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Title writing
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
                <li>Short and scannable: 2-5 words</li>
                <li>Noun phrase: &apos;Annual plan&apos;, &apos;Design review&apos;, &apos;User profile&apos;</li>
                <li>No &apos;A&apos;, &apos;The&apos;, &apos;Our&apos; — jump straight to the noun</li>
              </ul>
            </div>
          </section>

          <section id="content-desc-cd" style={{ marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Description writing
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
                <li>2-3 sentences max</li>
                <li>Lead with the most important information</li>
                <li>Don&apos;t repeat the title</li>
              </ul>
            </div>
          </section>

          <section id="content-action-cd" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Action labels
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
                <li>Verb + noun: &apos;View details&apos;, &apos;Read article&apos;, &apos;Start project&apos;</li>
                <li>Never &apos;Click here&apos; or &apos;More&apos;</li>
                <li>Match the action to what actually happens on click</li>
              </ul>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="install-cd" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-cd" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock code={`import { Card } from '@vds/react'`} filename="component.tsx" language="tsx" />
          </section>
          <section id="examples-cd" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock
                code={`<Card>
  <Card.Body>
    <h3>Annual plan</h3>
    <p>Everything in Pro, plus team management and priority support.</p>
    <Button variant="primary">Get started</Button>
  </Card.Body>
</Card>`}
                filename="Simple card"
                language="tsx"
              />
              <CodeBlock
                code={`<Card shadow="sm" isHoverable>
  <Card.Image src="/cover.jpg" alt="Article cover" aspectRatio="16/9" />
  <Card.Header
    title="Getting started with VDS"
    subtitle="5 min read · April 2026"
  />
  <Card.Body>
    <p>Learn how to set up VDS in your Next.js project.</p>
  </Card.Body>
  <Card.Footer>
    <Button variant="ghost" size="sm">Read article</Button>
  </Card.Footer>
</Card>`}
                filename="Media card"
                language="tsx"
              />
              <CodeBlock
                code={`<Card as="a" href="/plans" isHoverable isClickable>
  <Card.Body>
    <h3>View all plans</h3>
    <p>Compare features and pricing.</p>
  </Card.Body>
</Card>`}
                filename="Clickable / link card"
                language="tsx"
              />
              <CodeBlock
                code={`<Card padding="lg">
  <Card.Body>
    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary-default)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      Total revenue
    </div>
    <div style={{ fontSize: 40, fontWeight: 800, marginTop: 8 }}>$48,295</div>
    <div style={{ fontSize: 13, color: 'var(--color-text-success-default)', marginTop: 4 }}>
      ↑ +12.5% vs last month
    </div>
  </Card.Body>
</Card>`}
                filename="Stat card"
                language="tsx"
              />
              <CodeBlock
                code={`<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
  {items.map(item => (
    <Card key={item.id} isHoverable>
      <Card.Image src={item.image} alt={item.title} />
      <Card.Header title={item.title} subtitle={item.date} />
      <Card.Body>{item.description}</Card.Body>
    </Card>
  ))}
</div>`}
                filename="Card grid"
                language="tsx"
              />
            </div>
          </section>
          <section id="props-cd" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Props
            </h3>
            <PropsTable props={propsRows} />
          </section>
          <section id="a11y-cd" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Accessibility
            </h3>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="info" title="Interactive card accessibility">
                Clickable cards (isClickable) render with role=&apos;button&apos; or as an anchor tag. They have a visible focus
                ring, respond to Enter/Space for keyboard activation, and include aria-label when the card title alone
                isn&apos;t descriptive enough. Never make an entire card clickable if it contains multiple distinct actions —
                only the primary action should be clickable.
              </Callout>
            </div>
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
                Initial release. Card, Card.Header, Card.Body, Card.Footer, Card.Image, Card.Meta.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}

function VariantCardMini({
  t,
  demo,
  rowTitle,
}: {
  t: VDSTheme;
  demo: { border: string; boxShadow: string; hover?: boolean };
  rowTitle: string;
}) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 140,
        borderRadius: 14,
        border: demo.border,
        background: t.bg.surface.primary.default,
        boxShadow: demo.hover && h ? t.shadow.md : demo.boxShadow,
        transform: demo.hover && h ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow 200ms, transform 200ms',
        padding: 12,
        fontSize: 11,
        color: t.text.secondary.default,
        cursor: demo.hover ? 'pointer' : 'default',
      }}
    >
      {rowTitle === 'Hoverable' ? 'Hover me' : 'Preview'}
    </div>
  );
}
