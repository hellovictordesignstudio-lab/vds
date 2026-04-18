'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Info,
  LogOut,
  Settings,
  Trash2,
  Upload,
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

type ModalVariant = 'default' | 'confirm' | 'alert' | 'form';
type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const WIDTH: Record<ModalSize, number> = {
  sm: 400,
  md: 560,
  lg: 720,
  xl: 900,
};

const SIZE_USE_CASES: Record<ModalSize, { label: string; visual: string }> = {
  sm: {
    label: '400px',
    visual: 'Confirmations, simple alerts, destructive actions',
  },
  md: {
    label: '560px',
    visual: 'Default. Forms, settings, content previews',
  },
  lg: {
    label: '720px',
    visual: 'Complex forms, rich content, image previews',
  },
  xl: {
    label: '900px',
    visual: 'Data tables, multi-step flows, dashboards',
  },
};

const OVERLAY_BG = 'rgba(12,13,16,0.6)';

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

function FakeInput({ t, narrow }: { t: VDSTheme; narrow?: boolean }) {
  return (
    <div
      style={{
        height: 36,
        borderRadius: 8,
        border: `1px solid ${t.border.default.default}`,
        background: t.bg.surface.secondary.default,
        width: narrow ? '100%' : '100%',
        maxWidth: narrow ? 200 : '100%',
      }}
    />
  );
}

function ModalCloseButton({ t, onClick }: { t: VDSTheme; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: t.icon.secondary.default,
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = t.bg.surface.secondary.default;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <X size={18} strokeWidth={2} />
    </button>
  );
}

function DocButton({
  t,
  children,
  variant,
  onClick,
  small,
}: {
  t: VDSTheme;
  children: ReactNode;
  variant: 'primary' | 'ghost' | 'danger' | 'dangerBlue';
  onClick?: () => void;
  small?: boolean;
}) {
  const base: CSSProperties = {
    fontSize: small ? 11 : 13,
    fontWeight: 600,
    padding: small ? '4px 10px' : '8px 14px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
  };
  if (variant === 'primary') {
    return (
      <button type="button" onClick={onClick} style={{ ...base, background: t.bg.fill.primary.default, color: '#FFFFFF' }}>
        {children}
      </button>
    );
  }
  if (variant === 'ghost') {
    return (
      <button type="button" onClick={onClick} style={{ ...base, background: 'transparent', color: t.text.secondary.default }}>
        {children}
      </button>
    );
  }
  if (variant === 'dangerBlue') {
    return (
      <button type="button" onClick={onClick} style={{ ...base, background: t.bg.fill.primary.default, color: '#FFFFFF' }}>
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...base,
        background: t.bg.fill.danger.default,
        color: t.text.danger.default,
        border: `1px solid ${t.border.danger.default}`,
      }}
    >
      {children}
    </button>
  );
}

function DocOutlineDangerButton({ t, children, onClick, small }: { t: VDSTheme; children: ReactNode; onClick?: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: small ? 11 : 13,
        fontWeight: 600,
        padding: small ? '4px 10px' : '8px 14px',
        borderRadius: 8,
        border: `1px solid ${t.border.danger.default}`,
        background: 'transparent',
        color: t.text.danger.default,
        cursor: 'pointer',
        fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
      }}
    >
      {children}
    </button>
  );
}

function DocPrimarySafeButton({ t, children, onClick, small }: { t: VDSTheme; children: ReactNode; onClick?: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: small ? 11 : 13,
        fontWeight: 600,
        padding: small ? '4px 10px' : '8px 14px',
        borderRadius: 8,
        border: `1px solid ${t.border.default.default}`,
        background: t.bg.surface.primary.default,
        color: t.text.primary.default,
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
      }}
    >
      {children}
    </button>
  );
}

function PreviewModalPanel({
  t,
  width,
  variant,
  showFooter,
  onClose,
  animateIn,
  isClosing,
}: {
  t: VDSTheme;
  width: number;
  variant: ModalVariant;
  showFooter: boolean;
  onClose: () => void;
  animateIn: boolean;
  isClosing: boolean;
}) {
  const title =
    variant === 'default'
      ? 'Edit profile'
      : variant === 'confirm'
        ? 'Delete project?'
        : variant === 'alert'
          ? 'Payment failed'
          : 'Invite team member';

  const bodyDefault =
    'Update your public information. This will be visible to other members of your workspace.';
  const bodyConfirm =
    'This will permanently delete the project and all associated data. This action cannot be undone.';
  const bodyAlert = 'Your payment could not be processed. Please check your card details and try again.';
  const bodyForm = 'Send an invitation link. The recipient will be prompted to create an account or sign in.';

  const bodyText =
    variant === 'default' ? bodyDefault : variant === 'confirm' ? bodyConfirm : variant === 'alert' ? bodyAlert : bodyForm;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        width: 'min(100% - 48px, ' + width + 'px)',
        maxWidth: width,
        maxHeight: '80%',
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 16,
        boxShadow: t.shadow.lg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? 'scale(1)' : 'scale(0.96)',
        transition: isClosing
          ? 'opacity 150ms ease-out, transform 150ms ease-out'
          : 'opacity 200ms ease-out, transform 200ms ease-out',
      }}
    >
      <div
        style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${t.border.default.default}`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {variant === 'confirm' ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <Trash2 size={32} color={t.text.danger.default} aria-hidden />
            </div>
          ) : null}
          {variant === 'alert' ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <AlertCircle size={28} color="#D22232" aria-hidden />
            </div>
          ) : null}
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text.primary.default, textAlign: variant === 'confirm' || variant === 'alert' ? 'center' : 'left' }}>
            {title}
          </div>
        </div>
        <ModalCloseButton t={t} onClick={onClose} />
      </div>
      <div style={{ padding: 24, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.7, overflowY: 'auto', flex: 1 }}>
        {variant === 'default' || variant === 'form' ? (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.text.primary.default, marginBottom: 6 }}>Display name</div>
            <FakeInput t={t} />
            <div style={{ fontSize: 12, fontWeight: 600, color: t.text.primary.default, margin: '16px 0 6px' }}>Email</div>
            <FakeInput t={t} />
            {variant === 'form' ? (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.text.primary.default, margin: '16px 0 6px' }}>Role</div>
                <div
                  style={{
                    height: 36,
                    borderRadius: 8,
                    border: `1px solid ${t.border.default.default}`,
                    background: t.bg.surface.secondary.default,
                  }}
                />
              </>
            ) : null}
          </>
        ) : (
          <p style={{ margin: 0 }}>{bodyText}</p>
        )}
        {variant === 'alert' ? (
          <p style={{ margin: '12px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={16} color={t.icon.tertiary.default} aria-hidden />
            Card ending in 4242 was declined.
          </p>
        ) : null}
      </div>
      {showFooter ? (
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${t.border.default.default}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {variant === 'alert' ? (
            <DocButton t={t} variant="primary" onClick={onClose}>
              Close
            </DocButton>
          ) : (
            <>
              <DocButton t={t} variant="ghost" onClick={onClose}>
                Cancel
              </DocButton>
              {variant === 'confirm' ? (
                <DocButton t={t} variant="danger" onClick={onClose}>
                  Delete
                </DocButton>
              ) : (
                <DocButton t={t} variant="primary" onClick={onClose}>
                  {variant === 'form' ? 'Send invite' : 'Save changes'}
                </DocButton>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function MiniModalStatic({
  t,
  width,
  variant,
  compact,
}: {
  t: VDSTheme;
  width: number;
  variant: 'default' | 'confirm' | 'alert' | 'form';
  compact?: boolean;
}) {
  const pad = compact ? 8 : 12;
  const title =
    variant === 'default'
      ? 'Edit profile'
      : variant === 'confirm'
        ? 'Delete project?'
        : variant === 'alert'
          ? 'Payment failed'
          : 'Invite team member';

  const footer =
    variant === 'alert' ? (
      <span style={{ fontSize: 10, fontWeight: 600, color: t.text.brand.default }}>Close</span>
    ) : (
      <>
        <span style={{ fontSize: 10, fontWeight: 600, color: t.text.secondary.default }}>Cancel</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: variant === 'confirm' ? t.text.danger.default : t.text.brand.default,
          }}
        >
          {variant === 'confirm' ? 'Delete' : variant === 'form' ? 'Send invite' : 'Save changes'}
        </span>
      </>
    );

  return (
    <div
      style={{
        width,
        maxWidth: '100%',
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 12,
        boxShadow: t.shadow.md,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: `${pad}px ${pad + 4}px`,
          borderBottom: `1px solid ${t.border.default.default}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: compact ? 11 : 12, fontWeight: 700, color: t.text.primary.default }}>
          {variant === 'form' ? <Upload size={14} color={t.icon.secondary.default} aria-hidden /> : null}
          {variant === 'confirm' ? <span style={{ fontSize: compact ? 10 : 11, fontWeight: 600, color: t.text.tertiary.default }}>Confirm</span> : title}
        </span>
        <X size={14} color={t.icon.tertiary.default} aria-hidden />
      </div>
      <div style={{ padding: compact ? 10 : 14, fontSize: compact ? 10 : 11, color: t.text.secondary.default, lineHeight: 1.5 }}>
        {variant === 'default' ? (
          <>
            <div>Line one of placeholder content.</div>
            <div>Line two continues the thought.</div>
          </>
        ) : null}
        {variant === 'form' ? (
          <>
            <div style={{ height: 6, background: t.bg.surface.tertiary.default, borderRadius: 3, marginBottom: 6 }} />
            <div style={{ height: 6, background: t.bg.surface.tertiary.default, borderRadius: 3, marginBottom: 6 }} />
            <div style={{ height: 6, background: t.bg.surface.tertiary.default, borderRadius: 3 }} />
          </>
        ) : null}
        {variant === 'confirm' ? (
          <div style={{ textAlign: 'center' }}>
            <Trash2 size={28} color={t.text.danger.default} style={{ marginBottom: 6 }} aria-hidden />
            <div style={{ fontSize: compact ? 11 : 12, fontWeight: 700, color: t.text.primary.default }}>{title}</div>
          </div>
        ) : null}
        {variant === 'alert' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <AlertCircle size={24} color="#F07332" aria-hidden />
            </div>
            <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 4, color: t.text.primary.default }}>{title}</div>
            <div>We could not charge your default payment method.</div>
          </>
        ) : null}
      </div>
      <div
        style={{
          padding: '8px 10px',
          borderTop: `1px solid ${t.border.default.default}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 6,
        }}
      >
        {footer}
      </div>
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
          minHeight: 120,
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

export default function ModalDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [variant, setVariant] = useState<ModalVariant>('default');
  const [size, setSize] = useState<ModalSize>('md');
  const [closeOnOverlay, setCloseOnOverlay] = useState<'on' | 'off'>('on');
  const [showFooter, setShowFooter] = useState<'on' | 'off'>('on');
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

  const closeModal = useCallback(() => {
    setIsClosing(true);
    setOverlayVisible(false);
    window.setTimeout(() => {
      setModalOpen(false);
      setIsClosing(false);
    }, 150);
  }, []);

  const openModal = useCallback(() => {
    setModalOpen(true);
    setIsClosing(false);
    requestAnimationFrame(() => setOverlayVisible(true));
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, closeModal]);

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-mo', label: 'Principles' },
        { id: 'anatomy-mo', label: 'Anatomy' },
        { id: 'sizes-mo', label: 'Sizes' },
        { id: 'variants-mo', label: 'Variants' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-mo', label: 'When to use' },
        { id: 'modal-vs-mo', label: 'Modal vs. other patterns' },
        { id: 'dos-donts-mo', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'title-write-mo', label: 'Title writing' },
        { id: 'body-content-mo', label: 'Body content' },
        { id: 'action-labels-mo', label: 'Action labels' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'install-mo', label: 'Installation' },
        { id: 'import-mo', label: 'Import' },
        { id: 'examples-mo', label: 'Usage examples' },
        { id: 'props-mo', label: 'Props' },
      ];
    }
    return [];
  }, [activeTab]);

  const propsRows = [
    { name: 'isOpen', type: 'boolean', default: '—', description: 'Controls visibility (required)', required: true },
    { name: 'onClose', type: '() => void', default: '—', description: 'Called on close (required)', required: true },
    { name: 'title', type: 'string', default: '—', description: 'Modal header title' },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      default: "'md'",
      description: 'Panel width',
    },
    { name: 'closeOnOverlayClick', type: 'boolean', default: 'true', description: 'Close when clicking overlay' },
    { name: 'closeOnEsc', type: 'boolean', default: 'true', description: 'Close on Escape key' },
    { name: 'showCloseButton', type: 'boolean', default: 'true', description: 'X button in header' },
    { name: 'isCentered', type: 'boolean', default: 'true', description: 'Vertical centering' },
    { name: 'children', type: 'ReactNode', default: '—', description: 'Modal.Body content' },
    { name: 'className', type: 'string', default: '—', description: 'Additional CSS classes' },
  ];

  const handleOverlayPointer = () => {
    if (closeOnOverlay === 'on') closeModal();
  };

  const w = WIDTH[size];

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Modal
      </p>
      <h1 className="page-title">Modal</h1>
      <p className="page-lead">
        Modals interrupt the current flow to demand user attention. They&apos;re powerful and disruptive by design — use them only
        when the task cannot be completed inline, or when a decision must be made before continuing. Every modal should have a
        clear purpose, a way to dismiss, and a path forward.
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
                    options={['default', 'confirm', 'alert', 'form']}
                    value={variant}
                    onChange={setVariant}
                  />
                  <LivePreviewSegmentRow t={t} label="Size" options={['sm', 'md', 'lg', 'xl']} value={size} onChange={setSize} />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Close on overlay"
                    options={['off', 'on']}
                    value={closeOnOverlay}
                    onChange={setCloseOnOverlay}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show footer"
                    options={['off', 'on']}
                    value={showFooter}
                    onChange={setShowFooter}
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
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: 360,
                  alignSelf: 'stretch',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={openModal}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: `1px solid ${previewT.border.default.default}`,
                    background: previewT.bg.surface.primary.default,
                    color: previewT.text.primary.default,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
                  }}
                >
                  Open modal
                </button>

                {modalOpen ? (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 16,
                      pointerEvents: 'auto',
                    }}
                  >
                    <button
                      type="button"
                      aria-hidden
                      tabIndex={-1}
                      onClick={handleOverlayPointer}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        border: 'none',
                        padding: 0,
                        cursor: closeOnOverlay === 'on' ? 'pointer' : 'default',
                        background: OVERLAY_BG,
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        opacity: overlayVisible ? 1 : 0,
                        transition: 'opacity 150ms ease-out',
                      }}
                    />
                    <div
                      style={{ position: 'relative', zIndex: 11, maxHeight: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PreviewModalPanel
                        t={previewT}
                        width={w}
                        variant={variant}
                        showFooter={showFooter === 'on'}
                        onClose={closeModal}
                        animateIn={overlayVisible}
                        isClosing={isClosing}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-mo" style={{ marginBottom: 48 }}>
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
                <div style={{ background: t.bg.surface.secondary.default, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {['Page', 'Modal', 'Decide', 'Resume'].map((lab, i) => (
                      <span key={lab + i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: t.bg.surface.primary.default,
                            border: `1px solid ${t.border.default.default}`,
                            fontSize: 10,
                            fontWeight: 600,
                            color: t.text.secondary.default,
                          }}
                        >
                          {lab}
                        </div>
                        {i < 3 ? <ArrowRight size={14} color={t.text.tertiary.default} aria-hidden /> : null}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <AlertTriangle size={18} color={t.text.warning.default} style={{ opacity: 0.9 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Interruption by design</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A modal stops everything else. The user cannot interact with the page behind it. This is intentional — some
                    decisions need full attention. But the same power that makes modals effective makes them dangerous when
                    overused.
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
                    justifyContent: 'center',
                    position: 'relative',
                    minHeight: 140,
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <MiniModalStatic t={t} width={220} variant="default" compact />
                    <div style={{ position: 'absolute', right: -8, top: -4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AnnotationDot letter="1" />
                      <span style={{ fontSize: 9, color: '#E8186D', fontWeight: 700 }}>X</span>
                    </div>
                    <div style={{ position: 'absolute', left: '50%', bottom: -26, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AnnotationDot letter="2" />
                      <span style={{ fontSize: 9, color: '#E8186D', fontWeight: 700 }}>Cancel</span>
                    </div>
                    <div style={{ position: 'absolute', left: -8, top: '40%', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AnnotationDot letter="3" />
                      <span style={{ fontSize: 9, color: '#E8186D', fontWeight: 700 }}>Overlay</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <X size={18} color={t.text.secondary.default} style={{ opacity: 0.6 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Always provide an escape</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Every modal must have at least one explicit way to close without committing. An X button in the header, a
                    Cancel button in the footer, or both. Esc key always works. Never trap users with a modal they can&apos;t
                    dismiss.
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
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    minHeight: 140,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: '#0A8853', marginBottom: 6 }}>DO</div>
                    <div
                      style={{
                        background: t.bg.surface.primary.default,
                        border: `1px solid ${t.border.default.default}`,
                        borderRadius: 10,
                        padding: 8,
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6, color: t.text.primary.default }}>Delete item?</div>
                      <DocButton t={t} small variant="danger" onClick={() => undefined}>
                        Delete
                      </DocButton>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: '#E8186D', marginBottom: 6 }}>DON&apos;T</div>
                    <div
                      style={{
                        background: t.bg.surface.primary.default,
                        border: `1px solid ${t.border.default.default}`,
                        borderRadius: 10,
                        padding: 6,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        justifyContent: 'flex-end',
                      }}
                    >
                      {['A', 'B', 'C', 'D', 'E'].map((x) => (
                        <span
                          key={x}
                          style={{
                            fontSize: 8,
                            padding: '2px 6px',
                            borderRadius: 4,
                            border: `1px solid ${t.border.default.default}`,
                            color: t.text.tertiary.default,
                          }}
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircle2 size={18} color="#0A8853" style={{ opacity: 0.85 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>One decision per modal</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A modal should ask for one thing. If you need multiple decisions or complex multi-step flows, break them
                    into separate modals or use a full page. A footer with more than 2 actions is a signal the modal is doing
                    too much.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-mo" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                position: 'relative',
                height: 380,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: OVERLAY_BG,
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                }}
              />
              <div style={{ position: 'absolute', left: 12, top: 10, display: 'flex', alignItems: 'center', gap: 6, zIndex: 2 }}>
                <AnnotationDot letter="I" />
                <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Overlay · blur(4px)</span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: WIDTH.md,
                  maxWidth: 'calc(100% - 48px)',
                  zIndex: 2,
                }}
              >
                <div style={{ position: 'absolute', right: -8, bottom: -6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AnnotationDot letter="H" />
                  <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Panel</span>
                </div>
                <div
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 16,
                    boxShadow: t.shadow.lg,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border.default.default}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AnnotationDot letter="A" />
                        <AnnotationDot letter="B" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>Edit profile</span>
                        <AnnotationDot letter="C" />
                      </div>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          border: `1px dashed ${t.border.brand.default}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X size={14} />
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: '#E8186D', fontWeight: 600, marginTop: 6 }}>A Header · B Title · C Close</div>
                  </div>
                  <div style={{ fontSize: 9, color: '#E8186D', fontWeight: 700, padding: '0 16px', marginTop: 4 }}>
                    <AnnotationDot letter="D" /> Header divider
                  </div>
                  <div style={{ padding: '12px 16px 20px', fontSize: 12, color: t.text.secondary.default, lineHeight: 1.6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <AnnotationDot letter="E" />
                    </span>
                    Modal body content. Lorem ipsum dolor sit amet…
                  </div>
                  <div style={{ fontSize: 9, color: '#E8186D', fontWeight: 700, padding: '0 16px' }}>
                    <AnnotationDot letter="F" /> Footer divider
                  </div>
                  <div
                    style={{
                      padding: '10px 16px',
                      borderTop: `1px solid ${t.border.default.default}`,
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 10, color: '#E8186D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AnnotationDot letter="G" />
                      Footer actions
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: t.text.secondary.default }}>Cancel</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: t.text.brand.default }}>Save</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="sizes-mo" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => {
                const maxW = 900;
                const pct = (WIDTH[sz] / maxW) * 100;
                return (
                  <div
                    key={sz}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.secondary.default,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, minWidth: 32 }}>{sz}</span>
                      <span style={{ fontSize: 12, color: t.text.tertiary.default, fontFamily: 'var(--font-mono), monospace' }}>
                        {SIZE_USE_CASES[sz].label}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        background: t.bg.surface.tertiary.default,
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ width: `${pct}%`, height: '100%', background: t.bg.fill.primary.default, borderRadius: 4 }} />
                    </div>
                    <p style={{ fontSize: 12, color: t.text.secondary.default, margin: '8px 0 0', lineHeight: 1.45 }}>{SIZE_USE_CASES[sz].visual}</p>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="tip" title="Mobile: all sizes become full-screen">
                On viewports narrower than 640px, all modal sizes render as a bottom sheet or full-screen panel. The size prop
                controls desktop width only.
              </Callout>
            </div>
          </section>

          <section id="variants-mo" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    variant: 'default' as const,
                    title: 'Default',
                    token: 'variant: default',
                    desc: 'General-purpose modal. Use for forms, settings, content editing, and any task that needs focused space.',
                  },
                  {
                    variant: 'confirm' as const,
                    title: 'Confirmation',
                    token: 'variant: confirm',
                    desc: 'Destructive confirmation. Always shows what will be deleted and makes the destructive action the secondary button visually.',
                  },
                  {
                    variant: 'alert' as const,
                    title: 'Alert',
                    token: 'variant: alert',
                    desc: 'System alert or error state. No user input required — only an acknowledgment. Single action in the footer.',
                  },
                  {
                    variant: 'form' as const,
                    title: 'Form',
                    token: 'variant: form',
                    desc: 'Data collection modal. Keep forms short — 3–5 fields max. Long forms belong on their own page.',
                  },
                ] as const
              ).map((row) => (
                <div
                  key={row.variant}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: 180,
                      background: t.bg.surface.secondary.default,
                      backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                      backgroundSize: '20px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 16,
                    }}
                  >
                    <MiniModalStatic t={t} width={Math.min(240, WIDTH.sm)} variant={row.variant} />
                  </div>
                  <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>{row.title}</div>
                    <span style={chipStyleB(t, { marginBottom: 8 })}>{row.token}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>{row.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-mo" style={{ marginTop: 32, marginBottom: 40 }}>
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
                {[
                  'Confirm destructive actions that cannot be undone',
                  'Collect data required to proceed (invite user, create entity)',
                  'Show critical system errors that block the flow',
                  'Present short, focused tasks without extra navigation',
                ].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
                <div style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden>·</span>
                  <LogOut size={14} color={t.text.secondary.default} aria-hidden />
                  <span>Confirm signing out of sensitive sessions</span>
                </div>
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
                {[
                  'Show ignorable info (use Toast or inline callout)',
                  'Run complex multi-step flows (use a dedicated page or wizard)',
                  'Confirm reversible actions (prefer undo)',
                  'Use on mobile for long content (use full page or drawer)',
                ].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="warning" title="Modals are a last resort">
                Before reaching for a modal, ask: can this be done inline? Can the user undo the action instead of confirming
                it? Can this information be shown in context? If the answer to any of these is yes, choose a lighter pattern.
              </Callout>
            </div>
          </section>

          <section id="modal-vs-mo" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Modal vs. other patterns
            </h2>
            <div className="props-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="props-table">
                <thead>
                  <tr>
                    <th style={{ width: 140 }}>Pattern</th>
                    <th>Use when</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Modal', 'Full attention required, user must decide before continuing'],
                    ['Drawer', 'Secondary panel; task is related but not blocking'],
                    ['Toast', 'Brief confirmation; non-blocking feedback'],
                    ['Popover', 'Contextual info or mini-form anchored to a trigger'],
                    ['Inline', 'Error/success near the originating element'],
                  ].map(([a, b]) => (
                    <tr key={a}>
                      <td className="props-table__name" style={{ fontWeight: 700 }}>
                        {a === 'Modal' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Info size={14} color={t.text.brand.default} aria-hidden />
                            {a}
                          </span>
                        ) : (
                          a
                        )}
                      </td>
                      <td className="props-table__desc">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="dos-donts-mo" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — destructive action placement"
                  caption='Confirmation with "Cancel" (emphasized safe action) on the left and "Delete" as danger outline on the right.'
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <DocPrimarySafeButton t={t} onClick={() => undefined}>
                      Cancel
                    </DocPrimarySafeButton>
                    <DocOutlineDangerButton t={t} onClick={() => undefined}>
                      Delete
                    </DocOutlineDangerButton>
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — misleading primary"
                  caption="Don't use a filled brand button for Delete — color must match a destructive intent."
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <DocButton t={t} variant="ghost" onClick={() => undefined}>
                      Cancel
                    </DocButton>
                    <DocButton t={t} variant="dangerBlue" onClick={() => undefined}>
                      Delete
                    </DocButton>
                  </div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — single modal, multi-step inside"
                  caption="Use a stepper inside one modal (step 1/3, 2/3…) instead of stacking modals."
                >
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.primary.default,
                      fontSize: 11,
                      color: t.text.secondary.default,
                    }}
                  >
                    Step 2 of 3 · <Settings size={12} style={{ verticalAlign: 'middle' }} aria-hidden /> Invite members
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — modal on modal"
                  caption="Opening a second modal on top destroys spatial clarity and focus management."
                >
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        padding: '20px 24px',
                        borderRadius: 10,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        opacity: 0.85,
                        fontSize: 10,
                      }}
                    >
                      Parent modal
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        left: '20%',
                        top: '45%',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: `1px solid ${t.border.danger.default}`,
                        background: t.bg.surface.primary.default,
                        fontSize: 9,
                        boxShadow: t.shadow.md,
                      }}
                    >
                      Nested??
                    </div>
                  </div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — body scroll lock"
                  caption="While open, the page behind should not scroll — interaction stays in the dialog."
                >
                  <div style={{ fontSize: 11, color: t.text.secondary.default, textAlign: 'center' }}>
                    <code style={{ fontFamily: 'var(--font-mono)' }}>overflow: hidden</code> on html
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — background scroll"
                  caption="If the page behind still scrolls, the modal feels disconnected from the page context."
                >
                  <div style={{ fontSize: 11, color: t.text.tertiary.default, textAlign: 'center' }}>Page + modal both scrolling</div>
                </IllustratedDoDont>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="title-write-mo" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Title writing
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Verb + noun: &apos;Delete project&apos;, &apos;Invite member&apos;, &apos;Edit profile&apos;</li>
              <li>For alerts: noun phrase describing the problem: &apos;Payment failed&apos;, &apos;Session expired&apos;</li>
              <li>Never a question in the title — put the question in the body</li>
              <li>Max 5 words</li>
            </ul>
          </section>
          <section id="body-content-mo" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Body content
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>
                Lead with the consequence, not the mechanics: &apos;This will permanently delete all data in this project&apos; not
                &apos;You are about to delete a project&apos;
              </li>
              <li>For destructive confirmations: name the specific thing being deleted</li>
              <li>For forms: label every field; provide helper text for non-obvious fields</li>
            </ul>
          </section>
          <section id="action-labels-mo" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Action labels
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Primary action: specific verb that matches the title — &apos;Delete project&apos;, &apos;Send invite&apos;, &apos;Save changes&apos;</li>
              <li>Cancel action: always &apos;Cancel&apos; — never &apos;No&apos;, &apos;Go back&apos;, &apos;Dismiss&apos;</li>
              <li>Destructive primary: danger should be in the color, not the label — &apos;Delete&apos; not &apos;Yes, delete everything&apos;</li>
            </ul>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="install-mo" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Installation
            </h3>
            <CodeBlock code="pnpm add @vds/react" filename="Terminal" language="bash" />
          </section>
          <section id="import-mo" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Import
            </h3>
            <CodeBlock code={`import { Modal, Button, TextInput, Select } from '@vds/react'`} filename="component.tsx" language="tsx" />
          </section>
          <section id="examples-mo" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Usage examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock
                code={`// Basic controlled modal
const [isOpen, setIsOpen] = useState(false)

<Button onClick={() => setIsOpen(true)}>Open modal</Button>

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit profile">
  <Modal.Body>
    <p>Modal content goes here.</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="primary">Save changes</Button>
  </Modal.Footer>
</Modal>`}
                filename="Basic controlled modal"
                language="tsx"
              />
              <CodeBlock
                code={`<Modal
  isOpen={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  title="Delete project"
  size="sm"
>
  <Modal.Body>
    <p>
      This will permanently delete <strong>Acme Redesign</strong> and all its
      data. This action cannot be undone.
    </p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
    <Button variant="destructive" onClick={handleDelete}>Delete project</Button>
  </Modal.Footer>
</Modal>`}
                filename="Destructive confirmation"
                language="tsx"
              />
              <CodeBlock
                code={`<Modal
  isOpen={isInviteOpen}
  onClose={() => setIsInviteOpen(false)}
  title="Invite team member"
  size="md"
>
  <Modal.Body>
    <TextInput label="Email address" placeholder="jane@company.com" />
    <Select
      label="Role"
      options={roleOptions}
      style={{ marginTop: 16 }}
    />
  </Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
    <Button variant="primary">Send invite</Button>
  </Modal.Footer>
</Modal>`}
                filename="Form modal"
                language="tsx"
              />
              <CodeBlock
                code={`// Alert modal (no user input)
<Modal
  isOpen={isAlertOpen}
  onClose={() => setIsAlertOpen(false)}
  title="Payment failed"
  size="sm"
  closeOnOverlayClick={false}
>
  <Modal.Body>
    <p>Your payment could not be processed. Please check your card details and try again.</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="primary" onClick={() => setIsAlertOpen(false)}>Close</Button>
  </Modal.Footer>
</Modal>`}
                filename="Alert modal"
                language="tsx"
              />
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="info" title="Accessibility">
                Modal implements the ARIA dialog pattern. The panel has role=&apos;dialog&apos;, aria-modal=&apos;true&apos;, and
                aria-labelledby pointing to the title. Focus is trapped inside while open — Tab cycles through focusable elements,
                Shift+Tab reverses. Focus returns to the trigger element on close. Body scroll is locked via overflow:hidden on
                the html element while the modal is open.
              </Callout>
            </div>
          </section>
          <section id="props-mo" style={{ marginBottom: 48 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Props
            </h3>
            <p style={{ fontSize: 14, color: t.text.secondary.default, marginBottom: 12 }}>
              Sub-components: <code style={{ fontFamily: 'var(--font-mono), monospace' }}>Modal.Header</code> ·{' '}
              <code style={{ fontFamily: 'var(--font-mono), monospace' }}>Modal.Body</code> ·{' '}
              <code style={{ fontFamily: 'var(--font-mono), monospace' }}>Modal.Footer</code>
            </p>
            <PropsTable props={propsRows} />
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
                Initial release. Modal with 4 sizes, overlay blur, focus trap, body scroll lock, closeOnEsc, closeOnOverlayClick,
                sub-components Header/Body/Footer, full ARIA dialog pattern.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
