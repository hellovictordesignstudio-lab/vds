'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
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

type AlertVariant = 'info' | 'success' | 'danger' | 'warning';

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

function buildVariantStyles(t: VDSTheme) {
  return {
    info: {
      bg: t.bg.fill.brandSubtle.default,
      accent: t.text.brand.default,
      borderColor: t.border.brand.default,
      icon: <Info size={18} aria-hidden />,
    },
    success: {
      bg: t.bg.fill.success.default,
      accent: t.text.success.default,
      borderColor: t.border.success.default,
      icon: <CheckCircle2 size={18} aria-hidden />,
    },
    danger: {
      bg: t.bg.fill.danger.default,
      accent: t.text.danger.default,
      borderColor: t.border.danger.default,
      icon: <AlertCircle size={18} aria-hidden />,
    },
    warning: {
      bg: t.bg.fill.warning.default,
      accent: t.text.warning.default,
      borderColor: t.border.warning.default,
      icon: <AlertTriangle size={18} aria-hidden />,
    },
  } as const;
}

const VARIANT_TITLES: Record<AlertVariant, string> = {
  info: 'New features available',
  success: 'Changes saved',
  danger: 'Payment failed',
  warning: 'Storage almost full',
};

const VARIANT_DESCS: Record<AlertVariant, string> = {
  info: 'Review the latest updates in your workspace settings.',
  success: 'Your preferences were updated successfully.',
  danger: "We couldn't process your payment. Check your card details.",
  warning: "You've used 12.4 GB of your 15 GB limit. Free up space or upgrade.",
};

function LiveAlertPreview({
  t,
  variant,
  showDesc,
  showAction,
  isDismissible,
  dismissed,
  onDismiss,
}: {
  t: VDSTheme;
  variant: AlertVariant;
  showDesc: boolean;
  showAction: boolean;
  isDismissible: boolean;
  dismissed: boolean;
  onDismiss: () => void;
}) {
  const variantStyles = buildVariantStyles(t);
  const vs = variantStyles[variant];

  if (dismissed && isDismissible) {
    return (
      <div style={{ fontSize: 13, color: t.text.tertiary.default, textAlign: 'center', maxWidth: 400 }}>
        Alert dismissed — change variant or toggle dismissible to preview again.
      </div>
    );
  }

  return (
    <div
      style={{
        width: 480,
        display: 'flex',
        gap: 12,
        padding: '14px 16px',
        borderRadius: 10,
        background: vs.bg,
        border: `1px solid ${vs.borderColor}`,
        borderLeft: `4px solid ${vs.accent}`,
        position: 'relative',
      }}
    >
      <div style={{ color: vs.accent, flexShrink: 0, marginTop: 1 }}>{vs.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: t.text.primary.default,
            marginBottom: showDesc ? 4 : 0,
          }}
        >
          {VARIANT_TITLES[variant]}
        </div>
        {showDesc ? (
          <div style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5 }}>{VARIANT_DESCS[variant]}</div>
        ) : null}
        {showAction ? (
          <button
            type="button"
            style={{
              marginTop: 10,
              fontSize: 13,
              fontWeight: 600,
              color: vs.accent,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Learn more <ChevronRight size={13} aria-hidden />
          </button>
        ) : null}
      </div>
      {isDismissible ? (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: t.icon.tertiary.default,
            padding: 2,
            flexShrink: 0,
          }}
          aria-label="Dismiss alert"
        >
          <X size={16} aria-hidden />
        </button>
      ) : null}
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

export default function AlertDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [variant, setVariant] = useState<AlertVariant>('info');
  const [dismissible, setDismissible] = useState<'off' | 'on'>('off');
  const [description, setDescription] = useState<'off' | 'on'>('on');
  const [action, setAction] = useState<'off' | 'on'>('off');
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setDismissed(false);
  }, [variant, dismissible]);

  const t = buildTheme(isDark);
  const previewT = appearance === 'dark' ? buildTheme(true) : t;

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-al', label: 'Principles' },
        { id: 'anatomy-al', label: 'Anatomy' },
        { id: 'variants-al', label: 'Variants' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-al', label: 'When to use' },
        { id: 'placement-al', label: 'Placement' },
        { id: 'dos-donts-al', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'content-title-al', label: 'Title writing' },
        { id: 'content-desc-al', label: 'Description writing' },
        { id: 'content-action-al', label: 'Action text' },
        { id: 'content-examples-al', label: 'Examples' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-al', label: 'Installation' },
        { id: 'import-al', label: 'Import' },
        { id: 'examples-al', label: 'Usage examples' },
        { id: 'props-al', label: 'Props' },
        { id: 'a11y-al', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const propsRows = [
    {
      name: 'variant',
      type: "'info' | 'success' | 'danger' | 'warning'",
      default: "'info'",
      description: 'Visual style and semantic meaning',
    },
    { name: 'title', type: 'string', default: '—', description: 'Required. Alert heading.' },
    {
      name: 'description',
      type: 'string | ReactNode',
      default: '—',
      description: 'Optional supporting text',
    },
    { name: 'isDismissible', type: 'boolean', default: 'false', description: 'Show X button to dismiss' },
    { name: 'onDismiss', type: '() => void', default: '—', description: 'Called when X is clicked' },
    { name: 'actions', type: 'ReactNode', default: '—', description: 'Optional action button(s)' },
    { name: 'icon', type: 'ReactNode', default: '—', description: 'Override default variant icon' },
    { name: 'className', type: 'string', default: '—', description: 'Additional CSS classes' },
    {
      name: 'roleStatus',
      type: 'boolean',
      default: 'false',
      description: 'Use role="status" instead of role="alert" for non-urgent content',
    },
  ];

  const isDismissible = dismissible === 'on';
  const showDesc = description === 'on';
  const showAction = action === 'on';

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Alert
      </p>
      <h1 className="page-title">Alert</h1>
      <p className="page-lead">
        Alerts communicate system-level messages within the page. They are persistent, contextual, and directly related to
        the content around them. When the message is transient or triggered by a user action, use Toast instead.
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
                    label="Variant"
                    options={['info', 'success', 'danger', 'warning']}
                    value={variant}
                    onChange={setVariant}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Dismissible"
                    options={['off', 'on']}
                    value={dismissible}
                    onChange={setDismissible}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Description"
                    options={['off', 'on']}
                    value={description}
                    onChange={setDescription}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Action"
                    options={['off', 'on']}
                    value={action}
                    onChange={setAction}
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
              <LiveAlertPreview
                t={previewT}
                variant={variant}
                showDesc={showDesc}
                showAction={showAction}
                isDismissible={isDismissible}
                dismissed={dismissed}
                onDismiss={() => setDismissed(true)}
              />
            </LivePreviewShell>
          </section>

          <section id="principles-al" style={{ marginBottom: 48 }}>
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 20, minHeight: 160 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 8 }}>FORM</div>
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.primary.default,
                    }}
                  >
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: t.bg.fill.brandSubtle.default,
                        border: `1px solid ${t.border.brand.default}`,
                        borderLeft: `3px solid ${t.text.brand.default}`,
                        fontSize: 10,
                        color: t.text.secondary.default,
                        marginBottom: 8,
                        display: 'flex',
                        gap: 6,
                        alignItems: 'flex-start',
                      }}
                    >
                      <Info size={14} color={t.text.brand.default} aria-hidden />
                      <span>Email must match your account.</span>
                    </div>
                    <div style={{ fontSize: 10, marginBottom: 4, color: t.text.secondary.default }}>Email</div>
                    <div style={{ height: 28, borderRadius: 6, border: `1px solid ${t.border.strong.default}` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8, gap: 4, color: '#E8186D', fontSize: 9 }}>
                    ↑ context
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Info size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Contextual placement</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Place alerts where they are most relevant — above a form, inside a card, or at the top of a section.
                    Never float alerts over content like toasts. They belong in the flow.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 20, display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 6 }}>Visible</div>
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: t.bg.fill.warning.default,
                        border: `1px solid ${t.border.warning.default}`,
                        fontSize: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>Review required</span>
                      <X size={12} aria-hidden />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 6 }}>Dismissed</div>
                    <div
                      style={{
                        height: 36,
                        borderRadius: 8,
                        border: `1px dashed ${t.border.default.default}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: t.text.tertiary.default,
                      }}
                    >
                      (empty)
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <AlertCircle size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>
                      Persistent until resolved
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Alerts stay visible until the user dismisses them or the condition that triggered them is resolved. They
                    are not auto-dismissed. If it should disappear after a few seconds, use Toast.
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 6 }}>Alert (in-page)</div>
                    <div
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: t.bg.fill.brandSubtle.default,
                        border: `1px solid ${t.border.brand.default}`,
                        fontSize: 10,
                      }}
                    >
                      Maintenance tonight
                    </div>
                  </div>
                  <div style={{ width: 120 }}>
                    <div style={{ fontSize: 9, color: t.text.tertiary.default, marginBottom: 6 }}>Toast</div>
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: 10,
                        background: t.bg.surface.primary.default,
                        border: `1px solid ${t.border.default.default}`,
                        boxShadow: t.shadow.md,
                        fontSize: 9,
                      }}
                    >
                      Saved
                      <div style={{ height: 2, background: t.border.default.default, marginTop: 6, borderRadius: 1 }} />
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <AlertTriangle size={18} color={t.text.brand.default} style={{ opacity: 0.4 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Alert vs Toast</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Alert: in-page, persistent, related to page content. Toast: floating, transient, confirms a user action.
                    When in doubt — if the user needs to read it before continuing, it&apos;s an alert.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-al" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                minHeight: 200,
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
              <div style={{ maxWidth: 440, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="B" />
                    <Info size={18} color={t.text.brand.default} aria-hidden />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AnnotationDot letter="C" />
                        <span style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>Title text</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AnnotationDot letter="F" />
                        <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: 'default', color: t.icon.tertiary.default }}>
                          <X size={16} aria-hidden />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6 }}>
                      <AnnotationDot letter="D" />
                      <span style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5 }}>
                        Description text that provides more context about the message.
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <AnnotationDot letter="E" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: t.text.brand.default }}>Learn more →</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <AnnotationDot letter="A" />
                  <span style={{ fontSize: 11, color: '#E8186D' }}>Left accent (4px solid, variant color)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <AnnotationDot letter="G" />
                  <span style={{ fontSize: 11, color: t.text.tertiary.default }}>
                    Container border (1px, variant token at full opacity)
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section id="variants-al" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {(
                [
                  {
                    key: 'info' as const,
                    token: 'color.bg.fill.brandSubtle.default',
                    desc: "Neutral information. Guidance, tips, or context that helps the user but doesn't require immediate action.",
                  },
                  {
                    key: 'success' as const,
                    token: 'color.bg.fill.success.default',
                    desc: 'Action completed or condition met. Use after a background operation finishes or a setting is confirmed.',
                  },
                  {
                    key: 'danger' as const,
                    token: 'color.bg.fill.danger.default',
                    desc: 'Something is wrong and requires immediate attention. Form errors, failed operations, destructive conditions.',
                  },
                  {
                    key: 'warning' as const,
                    token: 'color.bg.fill.warning.default',
                    desc: 'Something may go wrong if the user continues. Non-blocking — the user can proceed but should be aware.',
                  },
                ] as const
              ).map((row) => {
                const vt = buildVariantStyles(t)[row.key];
                return (
                  <div
                    key={row.key}
                    style={{
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        minHeight: 140,
                        background: t.bg.surface.secondary.default,
                        padding: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          maxWidth: 360,
                          display: 'flex',
                          gap: 12,
                          padding: '14px 16px',
                          borderRadius: 10,
                          background: vt.bg,
                          border: `1px solid ${vt.borderColor}`,
                          borderLeft: `4px solid ${vt.accent}`,
                        }}
                      >
                        <div style={{ color: vt.accent }}>{vt.icon}</div>
                        <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>
                          {VARIANT_TITLES[row.key]}
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default, textTransform: 'capitalize' }}>
                        {row.key}
                      </div>
                      <span style={chipStyleB(t, { marginBottom: 8 })}>{row.token}</span>
                      <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>{row.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-al" style={{ marginTop: 32, marginBottom: 40 }}>
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
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0A8853', marginBottom: 12, letterSpacing: '0.06em' }}>
                  DO
                </div>
                {['Form validation summary', 'Permission warnings', 'System status messages', 'Deprecation notices'].map((x) => (
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
                {['Action confirmations → Toast', 'Navigation prompts → Modal', 'Empty states → EmptyState'].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="info" title="Alert vs Toast — the persistence rule">
                If the message must stay visible while the user takes action, it&apos;s an Alert. If it can disappear after a
                few seconds without the user missing it, it&apos;s a Toast. Alerts are anchored to content; toasts float
                above it.
              </Callout>
            </div>
          </section>

          <section id="placement-al" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Placement
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {(
                [
                  {
                    title: 'Top of page',
                    body: 'System-wide notices, maintenance warnings, account issues.',
                    ill: (
                      <div style={{ width: '100%' }}>
                        <div
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            background: t.bg.fill.brandSubtle.default,
                            border: `1px solid ${t.border.brand.default}`,
                            fontSize: 10,
                            marginBottom: 8,
                          }}
                        >
                          Notice
                        </div>
                        <div style={{ height: 40, borderRadius: 6, border: `1px dashed ${t.border.default.default}` }} />
                      </div>
                    ),
                  },
                  {
                    title: 'Top of form',
                    body: 'Validation summaries, permission errors, required field groups.',
                    ill: (
                      <div style={{ width: '100%' }}>
                        <div style={{ fontSize: 9, marginBottom: 4 }}>Form title</div>
                        <div
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            background: t.bg.fill.danger.default,
                            border: `1px solid ${t.border.danger.default}`,
                            fontSize: 10,
                            marginBottom: 8,
                          }}
                        >
                          2 errors
                        </div>
                        <div style={{ height: 24, borderRadius: 4, border: `1px solid ${t.border.default.default}` }} />
                      </div>
                    ),
                  },
                  {
                    title: 'Inline',
                    body: 'Field-specific context, section-level warnings.',
                    ill: (
                      <div style={{ width: '100%' }}>
                        <div style={{ height: 20, borderRadius: 4, border: `1px solid ${t.border.default.default}`, marginBottom: 6 }} />
                        <div
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            background: t.bg.fill.warning.default,
                            border: `1px solid ${t.border.warning.default}`,
                            fontSize: 10,
                          }}
                        >
                          Section warning
                        </div>
                      </div>
                    ),
                  },
                ] as const
              ).map((p) => (
                <div
                  key={p.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ background: t.bg.surface.secondary.default, padding: 20, minHeight: 120 }}>{p.ill}</div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>{p.title}</div>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="warning" title="One alert at a time">
                Avoid showing multiple alerts simultaneously. If multiple conditions exist, either combine them into one
                alert or prioritize the most critical one. Stacked alerts compete for attention and overwhelm users.
              </Callout>
            </div>
          </section>

          <section id="dos-donts-al" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <IllustratedDoDont
                t={t}
                ok
                title="Relevant content, not generic messages"
                caption="Specific copy tells the user what is at stake and pairs with a clear action."
              >
                <div style={{ fontSize: 11, maxWidth: 260, textAlign: 'left' }}>
                  <div style={{ padding: 10, borderRadius: 8, background: t.bg.fill.brandSubtle.default, border: `1px solid ${t.border.brand.default}` }}>
                    Your trial expires in 3 days — upgrade to keep your data.{' '}
                    <span style={{ fontWeight: 700, color: t.text.brand.default }}>Upgrade plan</span>
                  </div>
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Relevant content, not generic messages"
                caption="&quot;Important notice&quot; with no specific content leaves users without a next step."
              >
                <div style={{ padding: 10, borderRadius: 8, background: t.bg.fill.brandSubtle.default, border: `1px solid ${t.border.brand.default}`, fontSize: 11 }}>
                  Important notice
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Match variant to severity"
                caption="Form validation errors should read as blocking — danger matches that urgency."
              >
                <div style={{ padding: 10, borderRadius: 8, background: t.bg.fill.danger.default, border: `1px solid ${t.border.danger.default}`, fontSize: 11 }}>
                  Fix the highlighted fields to continue.
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Match variant to severity"
                caption="Form validation error uses info variant — it undersells the urgency."
              >
                <div style={{ padding: 10, borderRadius: 8, background: t.bg.fill.brandSubtle.default, border: `1px solid ${t.border.brand.default}`, fontSize: 11 }}>
                  Required fields missing
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok
                title="Dismissible only when appropriate"
                caption="Informational tips and non-critical notices are safe to dismiss."
              >
                <div style={{ padding: 10, borderRadius: 8, background: t.bg.fill.brandSubtle.default, border: `1px solid ${t.border.brand.default}`, fontSize: 11 }}>
                  New shortcuts available ✕
                </div>
              </IllustratedDoDont>
              <IllustratedDoDont
                t={t}
                ok={false}
                title="Dismissible only when appropriate"
                caption="Critical errors and required actions should not be dismissible — the user might miss them."
              >
                <div style={{ padding: 10, borderRadius: 8, background: t.bg.fill.danger.default, border: `1px solid ${t.border.danger.default}`, fontSize: 11 }}>
                  Payment failed ✕
                </div>
              </IllustratedDoDont>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="content-title-al" style={{ marginTop: 32, marginBottom: 24 }}>
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
                <li>State the condition, not the component: &apos;Your session expired&apos;, not &apos;Alert: session issue&apos;</li>
                <li>Present tense: &apos;Your storage is full&apos;, not &apos;Your storage was full&apos;</li>
                <li>
                  No &apos;Error:&apos;, &apos;Warning:&apos;, &apos;Notice:&apos; prefixes — the icon and color already communicate that
                </li>
              </ul>
            </div>
          </section>

          <section id="content-desc-al" style={{ marginBottom: 24 }}>
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
                <li>One or two sentences max</li>
                <li>Tell the user what happened and what to do</li>
                <li>If there&apos;s an action, the description should lead naturally into it</li>
              </ul>
            </div>
          </section>

          <section id="content-action-al" style={{ marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Action text
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
                <li>Verb-noun: &apos;Upgrade plan&apos;, &apos;Retry upload&apos;, &apos;View details&apos;</li>
                <li>Never &apos;Click here&apos; or &apos;Learn more&apos; alone — be specific</li>
              </ul>
            </div>
          </section>

          <section id="content-examples-al" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Examples
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
                    <th style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>Variant</th>
                    <th style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>✓ Good title</th>
                    <th style={{ padding: 12, textAlign: 'left', color: t.text.tertiary.default, fontWeight: 700 }}>✓ Good description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['info', 'API rate limit reached', "You've used 80% of your monthly API quota. Upgrade to increase your limit."],
                    ['success', 'Export complete', 'Your report has been exported and is ready to download.'],
                    ['danger', 'Payment failed', "We couldn't process your payment. Check your card details and try again."],
                    ['warning', 'Storage almost full', "You've used 12.4 GB of your 15 GB limit. Free up space or upgrade your plan."],
                  ].map((r) => (
                    <tr key={r[0]} style={{ borderBottom: `1px solid ${t.border.default.default}` }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>{r[0]}</td>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>{r[1]}</td>
                      <td style={{ padding: 12, color: t.text.secondary.default }}>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="install-al" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-al" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock code={`import { Alert } from '@vds/react'`} filename="component.tsx" language="tsx" />
          </section>
          <section id="examples-al" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={`<Alert variant="info" title="New features available" />`} filename="Basic" language="tsx" />
              <CodeBlock
                code={`<Alert
  variant="warning"
  title="Storage almost full"
  description="You've used 12.4 GB of your 15 GB limit. Free up space or upgrade your plan."
/>`}
                filename="With description"
                language="tsx"
              />
              <CodeBlock
                code={`<Alert
  variant="info"
  title="API rate limit reached"
  description="You've used 80% of your monthly quota."
  isDismissible
  onDismiss={() => setShowAlert(false)}
/>`}
                filename="Dismissible"
                language="tsx"
              />
              <CodeBlock
                code={`<Alert
  variant="danger"
  title="Payment failed"
  description="We couldn't process your payment. Check your card details and try again."
  actions={
    <Button variant="secondary" size="sm">Update payment method</Button>
  }
/>`}
                filename="With action"
                language="tsx"
              />
              <CodeBlock
                code={`<Alert
  variant="success"
  title="Export complete"
  description="Your report is ready to download."
  actions={<Button variant="primary" size="sm">Download report</Button>}
  isDismissible
  onDismiss={() => setVisible(false)}
/>`}
                filename="Success + action"
                language="tsx"
              />
            </div>
          </section>
          <section id="props-al" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Props
            </h3>
            <PropsTable props={propsRows} />
          </section>
          <section id="a11y-al" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Accessibility
            </h3>
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <Callout variant="info" title="Built-in accessibility">
                Alert renders with role=&apos;alert&apos; which causes screen readers to announce it immediately when it
                appears. For non-urgent informational alerts, use role=&apos;status&apos; by passing roleStatus prop — this
                announces at the next opportunity rather than interrupting. isDismissible adds aria-label=&apos;Dismiss
                alert&apos; to the X button.
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
                Initial release. All variants, dismissible, actions, icon override.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
