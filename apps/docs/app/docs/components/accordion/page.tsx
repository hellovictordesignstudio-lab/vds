'use client';

import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertCircle,
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CreditCard,
  HelpCircle,
  Minus,
  Package,
  Plus,
  Settings,
  Shield,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type AccVariant = 'default' | 'card' | 'flush';
type AccMode = 'single' | 'multiple';
type AccIconType = 'chevron' | 'plus' | 'none';
type AccSize = 'sm' | 'md' | 'lg';

const DEMO_ITEMS: {
  id: string;
  title: string;
  icon: typeof CreditCard;
  content: string;
}[] = [
  {
    id: 'billing',
    title: 'Billing & payments',
    icon: CreditCard,
    content:
      'Manage your payment methods, view invoices, and update billing information. Changes take effect on your next billing cycle.',
  },
  {
    id: 'security',
    title: 'Security & privacy',
    icon: Shield,
    content: 'Update your password, enable two-factor authentication, and control your data privacy settings.',
  },
  {
    id: 'notifs',
    title: 'Notifications',
    icon: Bell,
    content: 'Choose how and when you receive notifications — email digests, push alerts, and in-app messages.',
  },
  {
    id: 'plans',
    title: 'Plan & usage',
    icon: Package,
    content: 'View your current plan, monitor usage limits, and upgrade or downgrade at any time.',
  },
];

const SIZE_MAP: Record<
  AccSize,
  { triggerH: number; triggerPad: string; fontSize: number; contentPad: string; contentBottom: number }
> = {
  sm: { triggerH: 40, triggerPad: '0 14px', fontSize: 13, contentPad: '0 14px 14px', contentBottom: 14 },
  md: { triggerH: 48, triggerPad: '0 16px', fontSize: 14, contentPad: '0 16px 16px', contentBottom: 16 },
  lg: { triggerH: 56, triggerPad: '0 20px', fontSize: 15, contentPad: '0 20px 20px', contentBottom: 20 },
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

function useReducedMotion(): boolean {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setRm(mq.matches);
    const fn = () => setRm(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return rm;
}

function AccordionInteractiveDemo({
  t,
  variant,
  mode,
  iconType,
  showItemIcons,
  size,
  reducedMotion,
}: {
  t: VDSTheme;
  variant: AccVariant;
  mode: AccMode;
  iconType: AccIconType;
  showItemIcons: boolean;
  size: AccSize;
  reducedMotion: boolean;
}) {
  const uid = useId();
  const sz = SIZE_MAP[size];
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (mode === 'single') {
      setOpenIds((prev) => {
        if (prev.size <= 1) return prev;
        const first = [...prev][0];
        return new Set(first !== undefined ? [first] : []);
      });
    }
  }, [mode]);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (mode === 'single') {
        if (next.has(id)) {
          next.delete(id);
        } else {
          return new Set([id]);
        }
        return next;
      }
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const containerStyle: CSSProperties =
    variant === 'card'
      ? { display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }
      : {
          width: '100%',
          borderTop: `1px solid ${t.border.default.default}`,
        };

  return (
    <div style={containerStyle}>
      {DEMO_ITEMS.map((item) => {
        const isOpen = openIds.has(item.id);
        const panelId = `${uid}-panel-${item.id}`;
        const triggerId = `${uid}-trigger-${item.id}`;
        const Icon = item.icon;

        const triggerPad =
          variant === 'flush' ? { padding: sz.triggerPad, paddingLeft: 0, paddingRight: 0 } : { padding: sz.triggerPad };

        const itemWrap: CSSProperties =
          variant === 'card'
            ? {
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 10,
                background: t.bg.surface.primary.default,
                overflow: 'hidden',
              }
            : variant === 'default'
              ? { borderBottom: `1px solid ${t.border.default.default}` }
              : { borderBottom: `1px solid ${t.border.default.default}` };

        const gridTransition = reducedMotion
          ? 'none'
          : isOpen
            ? 'grid-template-rows 200ms ease-out'
            : 'grid-template-rows 180ms ease-in';

        const expandIcon =
          iconType === 'none' ? null : iconType === 'plus' ? (
            isOpen ? (
              <Minus size={18} color={t.text.tertiary.default} aria-hidden />
            ) : (
              <Plus size={18} color={t.text.tertiary.default} aria-hidden />
            )
          ) : (
            <ChevronDown
              size={18}
              color={t.text.tertiary.default}
              aria-hidden
              style={{
                flexShrink: 0,
                transform: isOpen ? 'rotate(180deg)' : 'none',
                transition: reducedMotion ? 'none' : 'transform 200ms ease-out',
              }}
            />
          );

        return (
          <div key={item.id} style={itemWrap}>
            <button
              type="button"
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
              style={{
                width: '100%',
                minHeight: sz.triggerH,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                ...triggerPad,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.bg.surface.secondary.default;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {showItemIcons ? (
                <span style={{ display: 'flex', color: t.icon.secondary.default }}>
                  <Icon size={18} aria-hidden />
                </span>
              ) : null}
              <span
                style={{
                  flex: 1,
                  fontSize: sz.fontSize,
                  fontWeight: 600,
                  color: t.text.primary.default,
                }}
              >
                {item.title}
              </span>
              {expandIcon}
            </button>
            <div
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: gridTransition,
              }}
            >
              <div style={{ minHeight: 0, overflow: 'hidden' }}>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  style={{
                    padding:
                      variant === 'flush' ? `0 0 ${sz.contentBottom}px` : sz.contentPad,
                    paddingTop: 0,
                    fontSize: 14,
                    color: t.text.secondary.default,
                    lineHeight: 1.7,
                  }}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Static accordion row for illustrations — not interactive beyond display */
function StaticAccordionRow({
  t,
  variant,
  size,
  open,
  title,
  content,
  leftIcon,
  iconType,
}: {
  t: VDSTheme;
  variant: AccVariant;
  size: AccSize;
  open: boolean;
  title: string;
  content?: string;
  leftIcon?: ReactNode;
  iconType: AccIconType;
}) {
  const sz = SIZE_MAP[size];
  const triggerPad =
    variant === 'flush' ? { padding: sz.triggerPad, paddingLeft: 0, paddingRight: 0 } : { padding: sz.triggerPad };

  const itemWrap: CSSProperties =
    variant === 'card'
      ? {
          border: `1px solid ${t.border.default.default}`,
          borderRadius: 10,
          background: t.bg.surface.primary.default,
          overflow: 'hidden',
        }
      : { borderBottom: `1px solid ${t.border.default.default}` };

  const expandIcon =
    iconType === 'none' ? null : iconType === 'plus' ? (
      open ? (
        <Minus size={18} color={t.text.tertiary.default} aria-hidden />
      ) : (
        <Plus size={18} color={t.text.tertiary.default} aria-hidden />
      )
    ) : (
      <ChevronDown
        size={18}
        color={t.text.tertiary.default}
        aria-hidden
        style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease-out' }}
      />
    );

  return (
    <div style={itemWrap}>
      <div
        style={{
          minHeight: sz.triggerH,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          ...triggerPad,
          cursor: 'default',
        }}
      >
        {leftIcon ? <span style={{ display: 'flex', color: t.icon.secondary.default }}>{leftIcon}</span> : null}
        <span style={{ flex: 1, fontSize: sz.fontSize, fontWeight: 600, color: t.text.primary.default }}>{title}</span>
        {expandIcon}
      </div>
      {open && content ? (
        <div
          style={{
            padding: variant === 'flush' ? `0 0 ${sz.contentBottom}px` : sz.contentPad,
            paddingTop: 0,
            fontSize: 14,
            color: t.text.secondary.default,
            lineHeight: 1.7,
          }}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
}

function MiniTabsRow(t: VDSTheme, labels: string[], active: number) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${t.border.default.default}` }}>
      {labels.map((lab, i) => {
        const activeTab = i === active;
        return (
          <div
            key={lab}
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: activeTab ? 600 : 500,
              padding: '6px 8px',
              textAlign: 'center',
              color: activeTab ? t.text.brand.default : t.text.secondary.default,
              boxShadow: activeTab ? `inset 0 -2px 0 0 ${t.border.brand.default}` : 'none',
            }}
          >
            {lab}
          </div>
        );
      })}
    </div>
  );
}

export default function AccordionDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [variant, setVariant] = useState<AccVariant>('default');
  const [mode, setMode] = useState<AccMode>('single');
  const [iconType, setIconType] = useState<AccIconType>('chevron');
  const [showIcons, setShowIcons] = useState<'off' | 'on'>('on');
  const [size, setSize] = useState<AccSize>('md');

  const reducedMotion = useReducedMotion();

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
        { id: 'principles-ac', label: 'Principles' },
        { id: 'anatomy-ac', label: 'Anatomy' },
        { id: 'variants-ac', label: 'Variants' },
        { id: 'icon-types', label: 'Icon types' },
        { id: 'sizes-ac', label: 'Sizes' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-ac', label: 'When to use' },
        { id: 'accordion-vs', label: 'Accordion vs. Tabs' },
        { id: 'dos-donts-ac', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'trigger-writing-ac', label: 'Trigger (title) writing' },
        { id: 'panel-writing-ac', label: 'Panel content' },
        { id: 'faq-writing-ac', label: 'FAQ writing' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'props-ac', label: 'Accordion props' },
        { id: 'props-item-ac', label: 'AccordionItem' },
        { id: 'examples-ac', label: 'Examples' },
        { id: 'a11y-ac', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const accordionPropsRows = [
    { name: 'items', type: 'AccordionItem[]', default: '—', description: 'Accordion items (required)', required: true as boolean },
    { name: 'variant', type: "'default' | 'card' | 'flush'", default: "'default'", description: 'Visual style' },
    { name: 'mode', type: "'single' | 'multiple'", default: "'single'", description: 'Expand behavior' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Trigger height' },
    { name: 'iconType', type: "'chevron' | 'plus' | 'none'", default: "'chevron'", description: 'Expand icon style' },
    { name: 'defaultOpen', type: 'string[]', default: '[]', description: 'Item ids open by default' },
    { name: 'value', type: 'string[]', default: '—', description: 'Controlled open items' },
    { name: 'onValueChange', type: '(value: string[]) => void', default: '—', description: 'Controlled handler' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const accordionItemPropsRows = [
    { name: 'id', type: 'string', default: '—', description: 'Unique id (required)', required: true as boolean },
    { name: 'title', type: 'string', default: '—', description: 'Trigger label' },
    { name: 'content', type: 'ReactNode', default: '—', description: 'Panel body' },
    { name: 'icon', type: 'ReactNode', default: '—', description: 'Optional leading icon' },
    { name: 'isDisabled', type: 'boolean', default: 'false', description: 'Disable item' },
    { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initially expanded (uncontrolled)' },
  ];

  const codeBasic = `// Basic FAQ accordion
<Accordion
  items={[
    {
      id: 'cancel',
      title: 'How do I cancel my subscription?',
      content: 'You can cancel anytime from your billing settings. Your access continues until the end of the billing period.',
    },
    {
      id: 'refund',
      title: 'Can I get a refund?',
      content: 'We offer full refunds within 14 days of purchase. Contact support to request one.',
    },
    {
      id: 'change',
      title: 'Can I change my plan?',
      content: 'Yes — upgrade or downgrade at any time. Changes take effect on your next billing cycle.',
    },
  ]}
/>`;

  const codeSettings = `// Settings accordion — multiple mode, with icons
<Accordion
  variant="card"
  mode="multiple"
  size="md"
  defaultOpen={['billing']}
  items={[
    {
      id: 'billing',
      title: 'Billing & payments',
      icon: <CreditCard size={18} />,
      content: <BillingSettings />,
    },
    {
      id: 'security',
      title: 'Security & privacy',
      icon: <Shield size={18} />,
      content: <SecuritySettings />,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell size={18} />,
      content: <NotificationSettings />,
    },
  ]}
/>`;

  const codePlus = `// Plus/minus icon type
<Accordion
  iconType="plus"
  items={faqItems}
/>`;

  const codeFlush = `// Flush variant — inside a card
<Card>
  <Card.Body>
    <h3>Advanced options</h3>
    <Accordion
      variant="flush"
      mode="multiple"
      size="sm"
      items={advancedItems}
    />
  </Card.Body>
</Card>`;

  const codeControlled = `// Controlled
const [open, setOpen] = useState(['billing'])
<Accordion
  value={open}
  onValueChange={setOpen}
  mode="multiple"
  items={items}
/>`;

  const interfaceItem = `interface AccordionItem {
  id: string
  title: string
  content: ReactNode
  icon?: ReactNode
  isDisabled?: boolean
  defaultOpen?: boolean
}`;

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components{' '}
        <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Accordion
      </p>
      <h1 className="page-title">Accordion</h1>
      <p className="page-lead">
        Accordions let users show and hide sections of related content. They reduce visual complexity by collapsing secondary
        information until it&apos;s needed — keeping the page scannable while making everything accessible on demand. Use them when
        content is long, sectioned, and not all equally relevant to every user.
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
                    options={['default', 'card', 'flush']}
                    value={variant}
                    onChange={(v) => setVariant(v as AccVariant)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Mode"
                    options={['single', 'multiple']}
                    value={mode}
                    onChange={(v) => setMode(v as AccMode)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Icon type"
                    options={['chevron', 'plus', 'none']}
                    value={iconType}
                    onChange={(v) => setIconType(v as AccIconType)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show item icons"
                    options={['off', 'on']}
                    value={showIcons}
                    onChange={(v) => setShowIcons(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow t={t} label="Size" options={['sm', 'md', 'lg']} value={size} onChange={(v) => setSize(v as AccSize)} />
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
                  padding: 32,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: '100%', maxWidth: 560 }}>
                  <AccordionInteractiveDemo
                    t={previewT}
                    variant={variant}
                    mode={mode}
                    iconType={iconType}
                    showItemIcons={showIcons === 'on'}
                    size={size}
                    reducedMotion={reducedMotion}
                  />
                </div>
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-ac" style={{ marginBottom: 48 }}>
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
                <div style={{ ...dottedZone(t, 160), flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 280 }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Collapsed — scannable</div>
                      <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 8, overflow: 'hidden', background: t.bg.surface.primary.default }}>
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '6px 8px',
                              fontSize: 9,
                              borderBottom: i < 7 ? `1px solid ${t.border.default.default}` : 'none',
                              color: t.text.secondary.default,
                            }}
                          >
                            Q{i + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Expanded — overwhelming</div>
                      <div
                        style={{
                          border: `1px solid ${t.border.default.default}`,
                          borderRadius: 8,
                          padding: 6,
                          fontSize: 8,
                          lineHeight: 1.35,
                          color: t.text.secondary.default,
                          background: t.bg.surface.primary.default,
                          maxHeight: 120,
                          overflow: 'hidden',
                        }}
                      >
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} style={{ marginBottom: 6 }}>
                            <strong>Q{i + 1}</strong>
                            <br />
                            Long answer text repeated…
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <HelpCircle size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Collapse to let users choose</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    An accordion hides detail behind a scannable summary. The user reads the titles, identifies what&apos;s relevant, and
                    expands only what they need. This is fundamentally different from tabs — tabs switch views, accordions progressively
                    disclose depth within a single view.
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
                <div style={dottedZone(t, 160)}>
                  <div style={{ width: '100%', maxWidth: 260, borderTop: `1px solid ${t.border.default.default}` }}>
                    <StaticAccordionRow
                      t={t}
                      variant="default"
                      size="sm"
                      open={false}
                      title="Billing & payments"
                      leftIcon={<CreditCard size={18} />}
                      iconType="chevron"
                    />
                    <StaticAccordionRow
                      t={t}
                      variant="default"
                      size="sm"
                      open
                      title="Payment failed"
                      content="Your card was declined. Update your payment method or try again."
                      leftIcon={<CreditCard size={18} />}
                      iconType="chevron"
                    />
                    <StaticAccordionRow
                      t={t}
                      variant="default"
                      size="sm"
                      open={false}
                      title="Notifications"
                      leftIcon={<Bell size={18} />}
                      iconType="chevron"
                    />
                    <StaticAccordionRow
                      t={t}
                      variant="default"
                      size="sm"
                      open={false}
                      title="Plan & usage"
                      leftIcon={<Package size={18} />}
                      iconType="chevron"
                    />
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <AlertCircle size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Default open what matters</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Not all accordion items should start collapsed. If a section contains critical information — an error, a required step,
                    the most common question — open it by default. The user should never have to hunt for important content inside an
                    accordion.
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
                <div style={{ ...dottedZone(t, 160), alignItems: 'flex-start', paddingTop: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 300 }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Accordion — sequential reading</div>
                      <div style={{ borderTop: `1px solid ${t.border.default.default}` }}>
                        <StaticAccordionRow t={t} variant="default" size="sm" open={false} title="Profile" iconType="chevron" />
                        <StaticAccordionRow t={t} variant="default" size="sm" open={false} title="Security" iconType="chevron" />
                        <StaticAccordionRow t={t} variant="default" size="sm" open={false} title="Billing" iconType="chevron" />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Tabs — parallel switching</div>
                      <div style={{ border: `1px solid ${t.border.default.default}`, borderRadius: 8, overflow: 'hidden', background: t.bg.surface.primary.default }}>
                        {MiniTabsRow(t, ['A', 'B', 'C'], 1)}
                        <div style={{ padding: 8, fontSize: 9, color: t.text.secondary.default }}>Panel B</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Settings size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Sequential, not parallel</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Use an accordion when sections are meant to be read in order or when the user reads one section, acts on it, and moves
                    to the next. Tabs are better when the user needs to switch back and forth between sections frequently.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-ac" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                position: 'relative',
                height: 340,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                ...dottedZone(t, 340),
                padding: 24,
              }}
            >
              <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AnnotationDot letter="A" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>Accordion container</span>
              </div>
              <div style={{ width: '100%', maxWidth: 420, marginTop: 28 }}>
                <div style={{ borderTop: `1px solid ${t.border.default.default}`, position: 'relative' }}>
                  <div style={{ position: 'absolute', right: -8, top: 8, transform: 'translateX(100%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', whiteSpace: 'nowrap' }}>B · trigger</span>
                    <AnnotationDot letter="B" />
                  </div>
                  <StaticAccordionRow
                    t={t}
                    variant="default"
                    size="md"
                    open={false}
                    title="Billing & payments"
                    leftIcon={<Settings size={18} />}
                    iconType="chevron"
                  />
                  <div style={{ position: 'absolute', left: '50%', bottom: 2, transform: 'translate(-50%, 100%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="C" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>Divider</span>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', right: -8, top: 10, transform: 'translateX(100%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', whiteSpace: 'nowrap' }}>D · open trigger</span>
                    <AnnotationDot letter="D" />
                  </div>
                  <StaticAccordionRow
                    t={t}
                    variant="default"
                    size="md"
                    open
                    title="Security & privacy"
                    content="Update your password, enable 2FA, and control your privacy settings."
                    leftIcon={<Shield size={18} />}
                    iconType="chevron"
                  />
                  <div style={{ position: 'absolute', left: 12, top: 44, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <AnnotationDot letter="E" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', maxWidth: 100 }}>Panel content</span>
                  </div>
                  <div style={{ position: 'absolute', left: -8, top: 10, transform: 'translateX(-100%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="F" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', whiteSpace: 'nowrap' }}>Left icon</span>
                  </div>
                  <div style={{ position: 'absolute', right: -8, top: 44, transform: 'translateX(100%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D', whiteSpace: 'nowrap' }}>G · expand</span>
                    <AnnotationDot letter="G" />
                  </div>
                </div>
                <StaticAccordionRow t={t} variant="default" size="md" open={false} title="Notifications" leftIcon={<Bell size={18} />} iconType="chevron" />
                <div style={{ position: 'relative' }}>
                  <StaticAccordionRow t={t} variant="default" size="md" open={false} title="Plan & usage" leftIcon={<Package size={18} />} iconType="chevron" />
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AnnotationDot letter="H" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>Card item (variant card)</span>
              </div>
            </div>
            <ul style={{ marginTop: 16, marginBottom: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.7 }}>
              <li>
                <strong style={{ color: t.text.primary.default }}>A</strong> — Accordion container (width 100%, borderTop 1px border.default — variant default)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>B</strong> — Trigger (height per size, flex row, gap 12px, hover bg surface.secondary, cursor pointer)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>C</strong> — Item divider (1px solid border.default, full width)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>D</strong> — Open trigger (chevron rotated 180deg, title color text.primary)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>E</strong> — Panel content (overflow hidden, animación height, padding per size)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>F</strong> — Left icon (optional, 18px, color icon.secondary)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>G</strong> — Expand icon (ChevronDown/Plus, 18px, right side, color text.tertiary)
              </li>
              <li>
                <strong style={{ color: t.text.primary.default }}>H</strong> — Item container (en variant card: border 1px borderRadius 10px bg surface.primary)
              </li>
            </ul>
          </section>

          <section id="variants-ac" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {(
                [
                  {
                    title: 'Default',
                    variant: 'default' as const,
                    chip: 'variant: default',
                    desc: 'Dividers between items, no outer border. The standard for FAQs, settings sections, and content pages.',
                  },
                  {
                    title: 'Card',
                    variant: 'card' as const,
                    chip: 'variant: card',
                    desc: 'Each item is a distinct card. Use when accordion items are visually independent — feature lists, service options, product details.',
                  },
                  {
                    title: 'Flush',
                    variant: 'flush' as const,
                    chip: 'variant: flush',
                    desc: 'No lateral borders. Blends into the parent container. Use inside cards, panels, or sidebars where the accordion is a sub-section.',
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
                  <div style={{ ...dottedZone(t, 200), flexDirection: 'column' }}>
                    <div style={{ width: '100%', maxWidth: 240 }}>
                      {v.variant === 'card' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <StaticAccordionRow t={t} variant="card" size="sm" open={false} title="One" iconType="chevron" />
                          <StaticAccordionRow
                            t={t}
                            variant="card"
                            size="sm"
                            open
                            title="Two"
                            content="Expanded body copy for this item."
                            iconType="chevron"
                          />
                          <StaticAccordionRow t={t} variant="card" size="sm" open={false} title="Three" iconType="chevron" />
                        </div>
                      ) : (
                        <div
                          style={
                            v.variant === 'default'
                              ? { borderTop: `1px solid ${t.border.default.default}` }
                              : { borderTop: `1px solid ${t.border.default.default}` }
                          }
                        >
                          <StaticAccordionRow t={t} variant={v.variant} size="sm" open={false} title="One" iconType="chevron" />
                          <StaticAccordionRow
                            t={t}
                            variant={v.variant}
                            size="sm"
                            open
                            title="Two"
                            content="Expanded body copy for this item."
                            iconType="chevron"
                          />
                          <StaticAccordionRow t={t} variant={v.variant} size="sm" open={false} title="Three" iconType="chevron" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px 20px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{v.title}</div>
                    <span style={chipStyleB(t, { marginBottom: 12 })}>{v.chip}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '12px 0 0' }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="icon-types" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Icon types
            </h2>
            <p style={{ fontSize: 16, color: t.text.secondary.default, lineHeight: 1.65, marginBottom: 20, maxWidth: 720 }}>
              The expand/collapse icon communicates interactivity. Choose based on the visual language of the surrounding UI.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 140), gap: 12, flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      maxWidth: 220,
                      padding: '0 12px',
                      minHeight: 36,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 8,
                      background: t.bg.surface.primary.default,
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: t.text.primary.default }}>Closed</span>
                    <ChevronDown size={18} color={t.text.tertiary.default} aria-hidden />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      maxWidth: 220,
                      padding: '0 12px',
                      minHeight: 36,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 8,
                      background: t.bg.surface.primary.default,
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: t.text.primary.default }}>Open</span>
                    <ChevronUp size={18} color={t.text.tertiary.default} aria-hidden />
                  </div>
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Chevron (default)</div>
                  <span style={chipStyleB(t, { marginBottom: 12 })}>iconType: chevron</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '12px 0 0' }}>
                    Default. Rotates 180° on expand. Universal pattern — users immediately recognize it as expandable.
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
                <div style={{ ...dottedZone(t, 140), gap: 12, flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      maxWidth: 220,
                      padding: '0 12px',
                      minHeight: 36,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 8,
                      background: t.bg.surface.primary.default,
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: t.text.primary.default }}>Closed</span>
                    <Plus size={18} color={t.text.tertiary.default} aria-hidden />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      maxWidth: 220,
                      padding: '0 12px',
                      minHeight: 36,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 8,
                      background: t.bg.surface.primary.default,
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: t.text.primary.default }}>Open</span>
                    <Minus size={18} color={t.text.tertiary.default} aria-hidden />
                  </div>
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Plus / Minus</div>
                  <span style={chipStyleB(t, { marginBottom: 12 })}>iconType: plus</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '12px 0 0' }}>
                    Plus becomes Minus on expand. Common in FAQs and marketing pages. More explicit than a chevron.
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
                <div style={{ ...dottedZone(t, 140), gap: 12, flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      maxWidth: 220,
                      padding: '0 12px',
                      minHeight: 36,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 8,
                      background: t.bg.surface.primary.default,
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: t.text.primary.default }}>Closed</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      maxWidth: 220,
                      padding: '0 12px',
                      minHeight: 36,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 8,
                      background: t.bg.surface.primary.default,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: t.text.primary.default }}>Open</span>
                  </div>
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>None</div>
                  <span style={chipStyleB(t, { marginBottom: 12 })}>iconType: none</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '12px 0 0' }}>
                    No expand icon. Use only when the trigger clearly communicates interactivity through context or styling.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="sizes-ac" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div
              style={{
                background: t.bg.surface.primary.default,
                borderRadius: 12,
                border: `1px solid ${t.border.default.default}`,
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <tbody>
                  {(
                    [
                      { k: 'sm' as const, h: 40, fs: 13, note: 'Dense sidebars, compact panels' },
                      { k: 'md' as const, h: 48, fs: 14, note: 'Default — settings, FAQs, content pages' },
                      { k: 'lg' as const, h: 56, fs: 15, note: 'Marketing pages, feature lists, prominent placement' },
                    ] as const
                  ).map((row) => (
                    <tr key={row.k} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 16, verticalAlign: 'middle', width: 56, fontWeight: 700, color: t.text.primary.default }}>{row.k}</td>
                      <td style={{ padding: 16, verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              height: row.h,
                              padding: SIZE_MAP[row.k].triggerPad,
                              boxSizing: 'border-box',
                              border: `1px dashed ${t.border.brand.default}`,
                              borderRadius: 8,
                              fontSize: row.fs,
                              fontWeight: 600,
                              color: t.text.primary.default,
                            }}
                          >
                            Trigger
                          </div>
                          <span style={{ color: t.text.tertiary.default, fontSize: 12 }}>
                            {row.h}px trigger · fontSize {row.fs}px
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: 16, color: t.text.secondary.default, verticalAlign: 'middle', maxWidth: 280 }}>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-ac" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: t.text.tertiary.default, marginBottom: 12 }}>DO</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                  <li>FAQ sections</li>
                  <li>Grouped configuration and preferences</li>
                  <li>Feature or service lists</li>
                  <li>Terms and conditions with sections</li>
                  <li>Secondary navigation in sidebars</li>
                  <li>Progressive content where the user advances step by step</li>
                </ul>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: t.text.tertiary.default, marginBottom: 12 }}>DON&apos;T</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                  <li>Content the user must compare across sections (use Tabs)</li>
                  <li>Multi-step form flows (use Stepper)</li>
                  <li>A single collapsible item (use Disclosure / native Details)</li>
                  <li>Critical content everyone must see (do not hide it)</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="warning" title="Don't hide critical content">
                If a section contains information that every user needs — pricing, requirements, warnings — don&apos;t collapse it by default.
                Accordions work by assuming most users don&apos;t need most sections. If everyone needs it, show it.
              </Callout>
            </div>
          </section>

          <section id="accordion-vs" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Accordion vs. Tabs
            </h2>
            <div
              style={{
                background: t.bg.surface.primary.default,
                borderRadius: 12,
                border: `1px solid ${t.border.default.default}`,
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                    {['CRITERION', 'ACCORDION', 'TABS'].map((h) => (
                      <th key={h} style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Layout', 'Vertical stack', 'Horizontal row of triggers'],
                    ['Navigation', 'Sequential, top-to-bottom', 'Parallel, switch freely'],
                    ['Multiple open', 'Yes (in multiple mode)', 'No — one at a time'],
                    ['Best for', 'FAQs, settings, long content', 'Switching between views'],
                  ].map((r) => (
                    <tr key={r[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>{r[0]}</td>
                      <td style={{ padding: 12 }}>{r[1]}</td>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="dos-donts-ac" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — default open when relevant"
                  caption='“Getting started” with “Install the SDK” open first helps new users begin immediately.'
                >
                  <div style={{ fontSize: 11, color: t.text.secondary.default, textAlign: 'center' }}>First step expanded by default</div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — hide the required step"
                  caption="If every user must complete a step, don’t keep it collapsed with everything else."
                >
                  <div style={{ fontSize: 11, color: t.text.secondary.default, textAlign: 'center' }}>All collapsed · required step hidden</div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — FAQ in single mode"
                  caption="One answer at a time keeps the page from growing uncontrollably."
                >
                  <div style={{ fontSize: 11, color: t.text.secondary.default, textAlign: 'center' }}>Single open · focused reading</div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — settings in single mode"
                  caption='Closing “Security” to open “Billing” makes users lose context of what they were configuring.'
                >
                  <div style={{ fontSize: 11, color: t.text.secondary.default, textAlign: 'center' }}>Settings · multiple sections needed</div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — consistent content weight"
                  caption="Four items with similar length (2–4 lines each) feel predictable when expanding."
                >
                  <div style={{ fontSize: 11, color: t.text.secondary.default, textAlign: 'center' }}>Balanced panels</div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — wildly uneven panels"
                  caption="One short item and one very long item makes the layout jump in a surprising way."
                >
                  <div style={{ fontSize: 11, color: t.text.secondary.default, textAlign: 'center' }}>2 lines vs. 8 paragraphs</div>
                </IllustratedDoDont>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="trigger-writing-ac" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Trigger (title) writing
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Question format for FAQs: &apos;How do I cancel my subscription?&apos;</li>
              <li>Noun phrase for settings: &apos;Billing & payments&apos;, &apos;Notification preferences&apos;</li>
              <li>Sentence case, no punctuation at the end</li>
              <li>Max 8 words — if the title is longer, the section is probably too broad</li>
            </ul>
          </section>
          <section id="panel-writing-ac" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Panel content
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Answer the trigger directly in the first sentence</li>
              <li>2–6 lines for most panels — more than that suggests the section needs its own page</li>
              <li>Use bullet lists for steps or multiple items — not dense paragraphs</li>
              <li>Links and CTAs in the panel are fine — they don&apos;t need to open a modal</li>
            </ul>
          </section>
          <section id="faq-writing-ac" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              FAQ writing
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Write the question as the user would ask it: &apos;Can I change my plan later?&apos;</li>
              <li>Not &apos;Information about plan changes&apos; — that&apos;s a label, not a question</li>
              <li>Keep answers direct: lead with &apos;Yes&apos;, &apos;No&apos;, or the key fact</li>
            </ul>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="props-ac" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Accordion props
            </h3>
            <PropsTable props={accordionPropsRows} />
          </section>
          <section id="props-item-ac" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              AccordionItem type
            </h3>
            <CodeBlock code={interfaceItem} filename="AccordionItem" language="tsx" />
          </section>
          <section id="examples-ac" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={codeBasic} filename="Basic FAQ accordion" language="tsx" />
              <CodeBlock code={codeSettings} filename="Settings — multiple mode, icons" language="tsx" />
              <CodeBlock code={codePlus} filename="Plus / minus icon type" language="tsx" />
              <CodeBlock code={codeFlush} filename="Flush inside a card" language="tsx" />
              <CodeBlock code={codeControlled} filename="Controlled" language="tsx" />
            </div>
          </section>
          <section id="a11y-ac" style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              Each trigger renders as a &lt;button&gt; with aria-expanded=&apos;true|false&apos; and aria-controls pointing to the panel. The
              panel has role=&apos;region&apos; and aria-labelledby pointing to its trigger. Keyboard: Enter/Space toggles the focused item. Tab
              moves between triggers. The animation respects prefers-reduced-motion — panels appear instantly when reduced motion is preferred.
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
                Initial release. Accordion with default/card/flush variants, single/multiple mode, chevron/plus/none icon types, 3 sizes,
                animated expand/collapse, controlled + uncontrolled, full ARIA disclosure pattern.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
