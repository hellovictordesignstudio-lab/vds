'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Filter,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  User,
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

type DrawerPlacement = 'right' | 'left' | 'bottom';
type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type DrawerVariant = 'default' | 'filter' | 'settings' | 'cart' | 'nav';

const PANEL_SIZE: Record<Exclude<DrawerSize, 'full'>, number> = {
  sm: 260,
  md: 360,
  lg: 480,
  xl: 600,
};

const BOTTOM_HEIGHTS: Record<DrawerSize, string> = {
  sm: '40%',
  md: '55%',
  lg: '70%',
  xl: '82%',
  full: '92%',
};

const OVERLAY_BG = 'rgba(12,13,16,0.5)';

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

function DrawerCloseButton({ t, onClick }: { t: VDSTheme; onClick: () => void }) {
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
  variant: 'primary' | 'ghost';
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

  return (
    <button type="button" onClick={onClick} style={{ ...base, background: 'transparent', color: t.text.secondary.default }}>
      {children}
    </button>
  );
}

function DottedSurface({ t, height, children }: { t: VDSTheme; height: number; children: ReactNode }) {
  return (
    <div
      style={{
        height,
        background: t.bg.surface.secondary.default,
        backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ t, children }: { t: VDSTheme; children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: t.text.tertiary.default,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function FakeCheckbox({ t, label }: { t: VDSTheme; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: t.text.secondary.default }}>
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 5,
          border: `1px solid ${t.border.default.default}`,
          background: t.bg.surface.primary.default,
          flexShrink: 0,
        }}
      />
      <span>{label}</span>
    </div>
  );
}

function FakeToggle({ t, on }: { t: VDSTheme; on?: boolean }) {
  return (
    <div
      style={{
        width: 34,
        height: 20,
        borderRadius: 999,
        background: on ? t.bg.fill.primary.default : t.bg.surface.tertiary.default,
        padding: 2,
        display: 'flex',
        justifyContent: on ? 'flex-end' : 'flex-start',
        transition: 'all 150ms ease',
      }}
    >
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} />
    </div>
  );
}

function getPanelDimension(placement: DrawerPlacement, size: DrawerSize) {
  if (placement === 'bottom') {
    return { width: '100%', height: size === 'full' ? BOTTOM_HEIGHTS.full : BOTTOM_HEIGHTS[size], borderRadius: '16px 16px 0 0' };
  }
  return {
    width: size === 'full' ? '100%' : PANEL_SIZE[size],
    height: '100%',
    borderRadius: 0,
  };
}

function drawerTransform(placement: DrawerPlacement, visible: boolean) {
  if (visible) return 'translate3d(0, 0, 0)';
  if (placement === 'right') return 'translate3d(100%, 0, 0)';
  if (placement === 'left') return 'translate3d(-100%, 0, 0)';
  return 'translate3d(0, 100%, 0)';
}

function panelPlacementStyle(placement: DrawerPlacement): CSSProperties {
  if (placement === 'right') {
    return { top: 0, right: 0, bottom: 0 };
  }
  if (placement === 'left') {
    return { top: 0, left: 0, bottom: 0 };
  }
  return { left: 0, right: 0, bottom: 0 };
}

function MiniNavIcon({ icon, t }: { icon: ReactNode; t: VDSTheme }) {
  return (
    <span
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: t.bg.surface.secondary.default,
        color: t.icon.secondary.default,
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
  );
}

function DrawerDemoContent({
  t,
  variant,
  showFooter,
  compact,
}: {
  t: VDSTheme;
  variant: DrawerVariant;
  showFooter: boolean;
  compact?: boolean;
}) {
  const bodyPadding = compact ? 14 : 20;
  const titleStyle: CSSProperties = { fontSize: compact ? 13 : 15, fontWeight: 700, color: t.text.primary.default };
  const navItems = [
    { label: 'Search', icon: <Search size={16} aria-hidden /> },
    { label: 'Profile', icon: <User size={16} aria-hidden /> },
    { label: 'Orders', icon: <Package size={16} aria-hidden /> },
    { label: 'Notifications', icon: <Bell size={16} aria-hidden /> },
  ];

  const renderFooter = () => {
    if (variant === 'settings' || variant === 'nav') return null;
    if (!showFooter) return null;
    return (
      <div
        style={{
          padding: compact ? '10px 14px' : '14px 20px',
          borderTop: `1px solid ${t.border.default.default}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: variant === 'cart' ? 'space-between' : 'flex-end',
          gap: 8,
          flexWrap: 'wrap',
          position: compact ? 'static' : 'sticky',
          bottom: 0,
          background: t.bg.surface.primary.default,
        }}
      >
        {variant === 'filter' ? (
          <>
            <DocButton t={t} variant="ghost">
              Clear all
            </DocButton>
            <DocButton t={t} variant="primary">
              Apply filters
            </DocButton>
          </>
        ) : null}
        {variant === 'cart' ? (
          <>
            <div>
              <div style={{ fontSize: 11, color: t.text.tertiary.default }}>Total</div>
              <div style={{ fontSize: compact ? 13 : 15, fontWeight: 700, color: t.text.primary.default }}>$184.00</div>
            </div>
            <DocButton t={t} variant="primary">
              Checkout
            </DocButton>
          </>
        ) : null}
        {variant === 'default' ? (
          <DocButton t={t} variant="primary">
            Done
          </DocButton>
        ) : null}
      </div>
    );
  };

  return (
    <>
      {variant !== 'nav' ? (
        <div
          style={{
            padding: compact ? '12px 14px' : '16px 20px',
            borderBottom: `1px solid ${t.border.default.default}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={titleStyle}>
            {variant === 'default' ? 'Panel' : variant === 'filter' ? 'Filters' : variant === 'settings' ? 'Settings' : 'Cart (3)'}
          </div>
          <DrawerCloseButton t={t} onClick={() => undefined} />
        </div>
      ) : null}

      <div style={{ padding: bodyPadding, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
        {variant === 'default' ? (
          <>
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
              Drawers keep the current page in context while revealing secondary content or tasks.
            </p>
            {['Order details', 'Billing profile', 'Team access', 'Audit log'].map((row) => (
              <div
                key={row}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 10,
                  borderBottom: `1px solid ${t.border.default.default}`,
                  gap: 8,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MiniNavIcon icon={<Package size={15} aria-hidden />} t={t} />
                  <span style={{ fontSize: 13, color: t.text.primary.default }}>{row}</span>
                </span>
                <ChevronRight size={16} color={t.icon.tertiary.default} aria-hidden />
              </div>
            ))}
          </>
        ) : null}

        {variant === 'filter' ? (
          <>
            <div>
              <SectionLabel t={t}>Status</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <FakeCheckbox t={t} label="Active" />
                <FakeCheckbox t={t} label="Pending" />
                <FakeCheckbox t={t} label="Archived" />
              </div>
            </div>
            <div style={{ height: 1, background: t.border.default.default }} />
            <div>
              <SectionLabel t={t}>Category</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <FakeCheckbox t={t} label="Design" />
                <FakeCheckbox t={t} label="Growth" />
                <FakeCheckbox t={t} label="Operations" />
              </div>
            </div>
          </>
        ) : null}

        {variant === 'settings' ? (
          <>
            {([
              ['Email updates', true],
              ['Weekly summary', true],
              ['Desktop notifications', false],
              ['Auto-archive done tasks', false],
            ] as const).map(([label, on], index) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingBottom: 12,
                  borderBottom: index < 3 ? `1px solid ${t.border.default.default}` : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default }}>{label}</div>
                  <div style={{ fontSize: 12, color: t.text.tertiary.default }}>Applies immediately</div>
                </div>
                <FakeToggle t={t} on={Boolean(on)} />
              </div>
            ))}
          </>
        ) : null}

        {variant === 'cart' ? (
          <>
            {[
              ['Starter plan', '$24.00'],
              ['Priority support', '$60.00'],
              ['Analytics add-on', '$100.00'],
            ].map(([name, price], index) => (
              <div
                key={name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  paddingBottom: 12,
                  borderBottom: index < 2 ? `1px solid ${t.border.default.default}` : 'none',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: t.bg.surface.secondary.default,
                    border: `1px solid ${t.border.default.default}`,
                  }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default }}>{name}</div>
                  <div style={{ fontSize: 12, color: t.text.tertiary.default }}>Qty 1</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>{price}</div>
              </div>
            ))}
          </>
        ) : null}

        {variant === 'nav' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12 }}>
              <MiniNavIcon icon={<Menu size={16} aria-hidden />} t={t} />
              <span style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Menu</span>
            </div>
            {navItems.map((item, index) => (
              <div key={item.label}>
                <a
                  href="#"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    color: t.text.primary.default,
                    padding: '12px 0',
                    borderBottom: `1px solid ${t.border.default.default}`,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: t.icon.secondary.default }}>{item.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                  </span>
                  <ChevronRight size={16} color={t.icon.tertiary.default} aria-hidden />
                </a>
                {index === 1 ? <div style={{ height: 16 }} /> : null}
              </div>
            ))}
          </>
        ) : null}
      </div>

      {renderFooter()}
    </>
  );
}

function DrawerPreviewPanel({
  t,
  placement,
  size,
  variant,
  showFooter,
  visible,
  isClosing,
}: {
  t: VDSTheme;
  placement: DrawerPlacement;
  size: DrawerSize;
  variant: DrawerVariant;
  showFooter: boolean;
  visible: boolean;
  isClosing: boolean;
}) {
  const dimension = getPanelDimension(placement, size);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={variant === 'nav' ? undefined : 'drawer-preview-title'}
      style={{
        position: 'absolute',
        ...panelPlacementStyle(placement),
        width: dimension.width,
        height: dimension.height,
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: dimension.borderRadius,
        boxShadow: t.shadow.lg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: drawerTransform(placement, visible),
        transition: isClosing ? 'transform 180ms ease-in, opacity 180ms ease-in' : 'transform 220ms ease-out, opacity 220ms ease-out',
      }}
    >
      {placement === 'bottom' ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              background: t.bg.surface.tertiary.default,
            }}
          />
        </div>
      ) : null}
      <DrawerDemoContent t={t} variant={variant} showFooter={showFooter} />
    </div>
  );
}

function PlacementCard({
  t,
  placement,
  title,
  desc,
}: {
  t: VDSTheme;
  placement: DrawerPlacement;
  title: string;
  desc: string;
}) {
  const arrow = placement === 'right' ? '→' : placement === 'left' ? '←' : '↑';
  return (
    <div
      style={{
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <DottedSurface t={t} height={180}>
        <div
          style={{
            width: '100%',
            maxWidth: 240,
            height: 120,
            borderRadius: 14,
            border: `1px solid ${t.border.default.default}`,
            background: t.bg.surface.primary.default,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,13,16,0.12)' }} />
          {placement === 'right' ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: 88,
                background: t.bg.surface.secondary.default,
                borderLeft: `3px solid ${t.border.brand.default}`,
              }}
            />
          ) : null}
          {placement === 'left' ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: 88,
                background: t.bg.surface.secondary.default,
                borderRight: `3px solid ${t.border.brand.default}`,
              }}
            />
          ) : null}
          {placement === 'bottom' ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 52,
                background: t.bg.surface.secondary.default,
                borderTop: `3px solid ${t.border.brand.default}`,
                borderRadius: '16px 16px 0 0',
              }}
            />
          ) : null}
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: 24, color: '#E8186D', fontWeight: 700 }}>
            {arrow}
          </div>
        </div>
      </DottedSurface>
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>{title}</div>
        <span style={chipStyleB(t, { marginBottom: 8 })}>{`placement: ${placement}`}</span>
        <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>{desc}</p>
      </div>
    </div>
  );
}

function VariantCard({
  t,
  variant,
  title,
  desc,
  placement = 'right',
  icon,
}: {
  t: VDSTheme;
  variant: DrawerVariant;
  title: string;
  desc: string;
  placement?: DrawerPlacement;
  icon: ReactNode;
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
      <DottedSurface t={t} height={160}>
        <div
          style={{
            width: '100%',
            maxWidth: 230,
            height: 132,
            borderRadius: 12,
            border: `1px solid ${t.border.default.default}`,
            background: t.bg.surface.primary.default,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,13,16,0.10)' }} />
          <div
            style={{
              position: 'absolute',
              ...(placement === 'bottom' ? { left: 0, right: 0, bottom: 0, height: 88, borderRadius: '16px 16px 0 0' } : placement === 'left' ? { top: 0, left: 0, bottom: 0, width: 92 } : { top: 0, right: 0, bottom: 0, width: 92 }),
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              boxShadow: t.shadow.md,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <DrawerDemoContent t={t} variant={variant} showFooter compact />
          </div>
        </div>
      </DottedSurface>
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>
          <span style={{ color: t.icon.secondary.default, display: 'inline-flex' }}>{icon}</span>
          {title}
        </div>
        <span style={chipStyleB(t, { marginBottom: 8 })}>{`variant: ${variant}`}</span>
        <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: '8px 0 0' }}>{desc}</p>
      </div>
    </div>
  );
}

function PrincipleCard({
  t,
  icon,
  title,
  body,
  children,
}: {
  t: VDSTheme;
  icon: ReactNode;
  title: string;
  body: string;
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
      <div style={{ background: t.bg.surface.secondary.default, padding: 16, minHeight: 180 }}>{children}</div>
      <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ color: t.text.brand.default, opacity: 0.65 }}>{icon}</span>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>{title}</div>
        </div>
        <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>{body}</p>
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

export default function DrawerDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [placement, setPlacement] = useState<DrawerPlacement>('right');
  const [size, setSize] = useState<Exclude<DrawerSize, 'full'>>('md');
  const [variant, setVariant] = useState<DrawerVariant>('default');
  const [closeOnOverlay, setCloseOnOverlay] = useState<'off' | 'on'>('on');
  const [showFooter, setShowFooter] = useState<'off' | 'on'>('on');
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

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    setIsClosing(false);
    requestAnimationFrame(() => setOverlayVisible(true));
  }, []);

  const closeDrawer = useCallback(() => {
    setIsClosing(true);
    setOverlayVisible(false);
    window.setTimeout(() => {
      setDrawerOpen(false);
      setIsClosing(false);
    }, 180);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen, closeDrawer]);

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-dr', label: 'Principles' },
        { id: 'anatomy-dr', label: 'Anatomy' },
        { id: 'placement-dr', label: 'Placement' },
        { id: 'sizes-dr', label: 'Sizes' },
        { id: 'variants-dr', label: 'Variants' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-dr', label: 'When to use' },
        { id: 'drawer-vs', label: 'Drawer vs. other patterns' },
        { id: 'dos-donts-dr', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'title-writing-dr', label: 'Title writing' },
        { id: 'body-content-dr', label: 'Body content' },
        { id: 'footer-actions-dr', label: 'Footer actions' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'props-dr', label: 'Drawer props' },
        { id: 'examples-dr', label: 'Code examples' },
        { id: 'a11y-dr', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const drawerPropsRows = [
    { name: 'isOpen', type: 'boolean', default: '—', description: 'Controls visibility (required)', required: true as const },
    { name: 'onClose', type: '() => void', default: '—', description: 'Called on close (required)', required: true as const },
    { name: 'title', type: 'string', default: '—', description: 'Header title' },
    { name: 'placement', type: "'right' | 'left' | 'bottom'", default: "'right'", description: 'Entry direction' },
    { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'md'", description: 'Panel width or bottom-sheet height' },
    { name: 'closeOnOverlayClick', type: 'boolean', default: 'true', description: 'Close on overlay click' },
    { name: 'closeOnEsc', type: 'boolean', default: 'true', description: 'Close on Escape key' },
    { name: 'showCloseButton', type: 'boolean', default: 'true', description: 'X button in header' },
    { name: 'children', type: 'ReactNode', default: '—', description: 'Drawer.Body content' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const codeBasic = `// Basic right drawer
const [isOpen, setIsOpen] = useState(false)

<Button onClick={() => setIsOpen(true)}>Open settings</Button>

<Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Settings">
  <Drawer.Body>
    <p>Settings content here.</p>
  </Drawer.Body>
</Drawer>`;

  const codeFilter = `// Filter drawer with footer
<Drawer
  isOpen={isFilterOpen}
  onClose={() => setIsFilterOpen(false)}
  title="Filters"
  size="md"
>
  <Drawer.Body>
    <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: t.text.tertiary.default, marginBottom: 12 }}>
      Status
    </p>
    <Checkbox label="Active" />
    <Checkbox label="Pending" />
    <Checkbox label="Archived" />
  </Drawer.Body>
  <Drawer.Footer>
    <Button variant="ghost" onClick={clearFilters}>Clear all</Button>
    <Button variant="primary" onClick={applyFilters}>Apply filters</Button>
  </Drawer.Footer>
</Drawer>`;

  const codeNav = `// Left navigation drawer (mobile)
<Drawer
  isOpen={isNavOpen}
  onClose={() => setIsNavOpen(false)}
  placement="left"
  size="sm"
>
  <Drawer.Body>
    {navItems.map(item => (
      <a key={item.href} href={item.href} style={{ display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 0', borderBottom: \`1px solid \${t.border.default.default}\` }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {item.icon}
          <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
        </span>
        <ChevronRight size={16} />
      </a>
    ))}
  </Drawer.Body>
</Drawer>`;

  const codeBottom = `// Bottom drawer — action sheet
<Drawer
  isOpen={isActionOpen}
  onClose={() => setIsActionOpen(false)}
  placement="bottom"
  size="sm"
  title="Share"
>
  <Drawer.Body>
    <p>Choose how to share this item.</p>
  </Drawer.Body>
  <Drawer.Footer>
    <Button variant="ghost" onClick={() => setIsActionOpen(false)}>Cancel</Button>
    <Button variant="primary">Share</Button>
  </Drawer.Footer>
</Drawer>`;

  const handleOverlayPointer = () => {
    if (closeOnOverlay === 'on') closeDrawer();
  };

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Drawer
      </p>
      <h1 className="page-title">Drawer</h1>
      <p className="page-lead">
        Drawers slide in from the edge of the screen to reveal secondary content or tasks without navigating away. Unlike modals,
        drawers feel spatial - they slide in from a direction, preserving context of the page behind. Use them for settings
        panels, filters, detail views, and navigation on mobile.
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
                  <LivePreviewSegmentRow t={t} label="Placement" options={['right', 'left', 'bottom']} value={placement} onChange={setPlacement} />
                  <LivePreviewSegmentRow t={t} label="Size" options={['sm', 'md', 'lg', 'xl']} value={size} onChange={(v) => setSize(v as Exclude<DrawerSize, 'full'>)} />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Variant"
                    options={['default', 'filter', 'settings', 'cart', 'nav']}
                    value={variant}
                    onChange={(v) => setVariant(v as DrawerVariant)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Close on overlay"
                    options={['off', 'on']}
                    value={closeOnOverlay}
                    onChange={(v) => setCloseOnOverlay(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show footer"
                    options={['off', 'on']}
                    value={showFooter}
                    onChange={(v) => setShowFooter(v as 'off' | 'on')}
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
                  background: previewT.bg.surface.secondary.default,
                  backgroundImage: `radial-gradient(circle, ${previewT.border.default.default} 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={openDrawer}
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
                  Open drawer
                </button>

                {drawerOpen ? (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
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
                        backdropFilter: 'blur(2px)',
                        WebkitBackdropFilter: 'blur(2px)',
                        opacity: overlayVisible ? 1 : 0,
                        transition: 'opacity 180ms ease-out',
                      }}
                    />
                    <DrawerPreviewPanel
                      t={previewT}
                      placement={variant === 'nav' ? 'left' : placement}
                      size={size}
                      variant={variant}
                      showFooter={showFooter === 'on' && variant !== 'settings' && variant !== 'nav'}
                      visible={overlayVisible}
                      isClosing={isClosing}
                    />
                  </div>
                ) : null}
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-dr" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Principles
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <PrincipleCard
                t={t}
                icon={<ArrowLeft size={18} aria-hidden />}
                title="Spatial, not disruptive"
                body="A drawer slides in from an edge - this direction implies a spatial relationship with the page. Unlike a modal, the drawer doesn't completely sever the user's sense of place. The page behind is still visible, just temporarily inaccessible."
              >
                <div
                  style={{
                    borderRadius: 14,
                    border: `1px solid ${t.border.default.default}`,
                    background: t.bg.surface.primary.default,
                    height: 140,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, padding: 16, color: t.text.tertiary.default, fontSize: 11 }}>
                    page content
                  </div>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,13,16,0.22)' }} />
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      width: 96,
                      background: t.bg.surface.primary.default,
                      borderLeft: `1px solid ${t.border.default.default}`,
                      boxShadow: t.shadow.md,
                    }}
                  />
                  <div style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="A" />
                    <span style={{ fontSize: 10, color: '#E8186D', fontWeight: 700 }}>Context preserved</span>
                  </div>
                </div>
              </PrincipleCard>

              <PrincipleCard
                t={t}
                icon={<SlidersHorizontal size={18} aria-hidden />}
                title="Secondary, not primary"
                body="Drawers are for secondary tasks - filtering, settings, detail views, navigation. If the user must complete a task before continuing with the main flow, use a modal. Drawers are for tasks that enrich the experience without demanding it."
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ borderRadius: 12, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 10 }}>
                    <div style={{ fontSize: 9, color: '#0A8853', fontWeight: 800, marginBottom: 6 }}>DRAWER</div>
                    <div style={{ fontSize: 10, color: t.text.secondary.default, marginBottom: 6 }}>Secondary task</div>
                    <div style={{ height: 68, borderRadius: 10, background: t.bg.surface.secondary.default, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 54, background: t.bg.surface.primary.default, borderLeft: `1px solid ${t.border.default.default}` }} />
                    </div>
                  </div>
                  <div style={{ borderRadius: 12, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 10 }}>
                    <div style={{ fontSize: 9, color: '#E8186D', fontWeight: 800, marginBottom: 6 }}>MODAL</div>
                    <div style={{ fontSize: 10, color: t.text.secondary.default, marginBottom: 6 }}>Primary decision</div>
                    <div style={{ height: 68, borderRadius: 10, background: t.bg.surface.secondary.default, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 64, height: 42, transform: 'translate(-50%, -50%)', background: t.bg.surface.primary.default, borderRadius: 10, border: `1px solid ${t.border.default.default}` }} />
                    </div>
                  </div>
                </div>
              </PrincipleCard>

              <PrincipleCard
                t={t}
                icon={<Menu size={18} aria-hidden />}
                title="Navigation on mobile"
                body="On mobile, drawers are the primary pattern for navigation that would be a sidebar on desktop. The bottom drawer is ideal for action sheets and quick selections - it maps to thumb reach on touch screens."
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 90,
                        height: 132,
                        margin: '0 auto',
                        borderRadius: 16,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 54, background: t.bg.surface.secondary.default, borderRight: `1px solid ${t.border.default.default}` }} />
                    </div>
                    <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 6 }}>mobile drawer</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 120,
                        height: 92,
                        margin: '0 auto',
                        borderRadius: 14,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 34, background: t.bg.surface.secondary.default, borderRight: `1px solid ${t.border.default.default}` }} />
                    </div>
                    <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 6 }}>desktop sidebar</div>
                  </div>
                </div>
              </PrincipleCard>
            </div>
          </section>

          <section id="anatomy-dr" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                position: 'relative',
                height: 360,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                backgroundColor: t.bg.surface.secondary.default,
                backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: OVERLAY_BG, backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }} />
              <div style={{ position: 'absolute', left: 12, top: 10, display: 'flex', alignItems: 'center', gap: 6, zIndex: 2 }}>
                <AnnotationDot letter="I" />
                <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Overlay · rgba(12,13,16,0.5) + blur(2px)</span>
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: PANEL_SIZE.md,
                  maxWidth: '60%',
                  background: t.bg.surface.primary.default,
                  borderLeft: `1px solid ${t.border.default.default}`,
                  boxShadow: t.shadow.lg,
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 2,
                }}
              >
                <div style={{ position: 'absolute', left: -30, bottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AnnotationDot letter="H" />
                  <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Panel edge / shadow</span>
                </div>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border.default.default}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="A" />
                    <span id="drawer-preview-title" style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>
                      Filters
                    </span>
                    <AnnotationDot letter="B" />
                    <AnnotationDot letter="C" />
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, border: `1px dashed ${t.border.brand.default}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={18} aria-hidden />
                  </div>
                </div>
                <div style={{ position: 'absolute', right: 150, top: 57, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AnnotationDot letter="D" />
                  <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Header divider</span>
                </div>
                <div style={{ padding: 20, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <AnnotationDot letter="E" />
                    <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Drawer.Body</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <FakeCheckbox t={t} label="Active" />
                    <FakeCheckbox t={t} label="Pending" />
                    <FakeCheckbox t={t} label="Archived" />
                  </div>
                </div>
                <div style={{ position: 'absolute', right: 154, bottom: 56, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AnnotationDot letter="F" />
                  <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Footer divider</span>
                </div>
                <div style={{ padding: '14px 20px', borderTop: `1px solid ${t.border.default.default}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 'auto' }}>
                    <AnnotationDot letter="G" />
                    <span style={{ fontSize: 11, color: '#E8186D', fontWeight: 700 }}>Drawer.Footer</span>
                  </span>
                  <DocButton t={t} variant="ghost" small>
                    Clear
                  </DocButton>
                  <DocButton t={t} variant="primary" small>
                    Apply
                  </DocButton>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.65, marginTop: 16, marginBottom: 0 }}>
              <strong style={{ color: t.text.primary.default }}>A</strong> → Drawer.Header (padding 16px 20px, flex row space-between){' '}
              <strong style={{ color: t.text.primary.default }}>B</strong> → Title (fontSize 15px, fontWeight 700, color text.primary){' '}
              <strong style={{ color: t.text.primary.default }}>C</strong> → Close button (X 18px, 32x32px, radius 8px, hover surface.secondary){' '}
              <strong style={{ color: t.text.primary.default }}>D</strong> → Header divider (1px solid border.default){' '}
              <strong style={{ color: t.text.primary.default }}>E</strong> → Drawer.Body (padding 20px, flex 1, overflow-y auto){' '}
              <strong style={{ color: t.text.primary.default }}>F</strong> → Footer divider (1px solid border.default){' '}
              <strong style={{ color: t.text.primary.default }}>G</strong> → Drawer.Footer (padding 14px 20px, gap 8, justify-end){' '}
              <strong style={{ color: t.text.primary.default }}>H</strong> → Panel container (surface.primary, border, shadow.lg){' '}
              <strong style={{ color: t.text.primary.default }}>I</strong> → Overlay (rgba(12,13,16,0.5) + blur(2px), full canvas).
            </p>
          </section>

          <section id="placement-dr" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Placement
            </h2>
            <p style={{ fontSize: 17, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              The drawer can enter from three edges. Choose based on the content type and the spatial relationship with the trigger.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <PlacementCard
                t={t}
                placement="right"
                title="Right"
                desc="Default. Detail panels, settings, filters. Reads naturally left-to-right in LTR languages."
              />
              <PlacementCard
                t={t}
                placement="left"
                title="Left"
                desc="Navigation drawers, sidebars on mobile. Mirrors the position of permanent sidebars on desktop."
              />
              <PlacementCard
                t={t}
                placement="bottom"
                title="Bottom"
                desc="Action sheets on mobile. Quick selections, share menus, contextual options. Thumb-reachable on touch devices."
              />
            </div>
          </section>

          <section id="sizes-dr" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(
                [
                  ['sm', '260px', 'Narrow panels, simple nav, notifications'],
                  ['md', '360px', 'Default - filters, settings, detail'],
                  ['lg', '480px', 'Rich content, forms, cart'],
                  ['xl', '600px', 'Complex panels, multi-column content'],
                  ['full', '100%', 'Full-screen overlay, mobile navigation'],
                ] as const
              ).map(([sz, px, use]) => {
                const pct = sz === 'full' ? 100 : (Number.parseInt(px, 10) / 600) * 100;
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
                      <span style={{ fontSize: 12, color: t.text.tertiary.default, fontFamily: 'var(--font-mono), monospace' }}>{px}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: t.bg.surface.tertiary.default, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: t.bg.fill.primary.default, borderRadius: 4 }} />
                    </div>
                    <p style={{ fontSize: 12, color: t.text.secondary.default, margin: '8px 0 0', lineHeight: 1.45 }}>{use}</p>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="tip" title="Bottom drawer sizes">
                For placement=&apos;bottom&apos;, size controls height instead of width. sm=40vh, md=55vh, lg=70vh, full=92vh. Always show
                a drag handle at the top of bottom drawers on mobile.
              </Callout>
            </div>
          </section>

          <section id="variants-dr" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              <VariantCard
                t={t}
                variant="default"
                title="Default"
                desc="General-purpose panel. Use for detail views, entity previews, or any secondary content."
                icon={<Package size={16} aria-hidden />}
              />
              <VariantCard
                t={t}
                variant="filter"
                title="Filter"
                desc="Filter panel for data tables or listings. Always include a 'Clear all' action and an 'Apply' CTA in the footer."
                icon={<Filter size={16} aria-hidden />}
              />
              <VariantCard
                t={t}
                variant="settings"
                title="Settings"
                desc="Settings and preferences panel. Changes can apply immediately (no footer needed) or on confirmation."
                icon={<Settings size={16} aria-hidden />}
              />
              <VariantCard
                t={t}
                variant="cart"
                title="Cart"
                desc="Shopping cart or order summary. Shows items, subtotal, and a primary CTA in the footer."
                icon={<ShoppingCart size={16} aria-hidden />}
              />
              <VariantCard
                t={t}
                variant="nav"
                title="Navigation"
                desc="Mobile navigation. Full-height, no header - the nav links are the content. Use placement='left'."
                placement="left"
                icon={<Menu size={16} aria-hidden />}
              />
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-dr" style={{ marginTop: 32, marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'rgba(10,136,83,0.04)', border: '1px solid rgba(10,136,83,0.2)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0A8853', marginBottom: 12, letterSpacing: '0.06em' }}>DO</div>
                {[
                  'Filter panels for tables and lists',
                  'Settings and preferences without leaving the page',
                  'Entity detail views without navigation',
                  'Navigation on mobile, carts, and notifications',
                ].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(232,24,109,0.04)', border: '1px solid rgba(232,24,109,0.2)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#E8186D', marginBottom: 12, letterSpacing: '0.06em' }}>DON&apos;T</div>
                {[
                  'Destructive confirmations that need a clear decision (use Modal)',
                  'Complex multi-step flows (use a dedicated page)',
                  'Content users must compare side-by-side with the page behind',
                  'System alerts that block the flow (use Modal)',
                ].map((x) => (
                  <div key={x} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {x}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="info" title="Drawer vs. Modal - the key distinction">
                Use a Modal when the user must make a decision before continuing. Use a Drawer when the task is supplementary - the
                user can close it and continue where they left off without consequence.
              </Callout>
            </div>
          </section>

          <section id="drawer-vs" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Drawer vs. other patterns
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
                    ['Drawer', 'Secondary panel, task is supplementary, spatial context matters'],
                    ['Modal', 'Blocking decision required, full attention needed'],
                    ['Sidebar', 'Permanent navigation, always visible on desktop'],
                    ['Popover', 'Small contextual info anchored to a trigger, no scrollable content'],
                    ['Bottom sheet', 'Mobile action sheet, quick options, thumb-reachable actions'],
                  ].map(([a, b]) => (
                    <tr key={a}>
                      <td className="props-table__name" style={{ fontWeight: 700 }}>
                        {a}
                      </td>
                      <td className="props-table__desc">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="dos-donts-dr" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO - placement matches trigger position"
                  caption="A filter trigger in the top-right should open a right drawer. Motion should reinforce the source of the action."
                >
                  <div style={{ width: 220, height: 92, borderRadius: 12, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: 8, top: 8, fontSize: 10, color: t.text.secondary.default }}>Filters</div>
                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 78, background: t.bg.surface.secondary.default, borderLeft: `2px solid ${t.border.brand.default}` }} />
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T - contradictory motion"
                  caption="A trigger on the right that opens from the left breaks the expected spatial relationship."
                >
                  <div style={{ width: 220, height: 92, borderRadius: 12, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: 8, top: 8, fontSize: 10, color: t.text.secondary.default }}>Filters</div>
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 78, background: t.bg.surface.secondary.default, borderRight: `2px solid ${t.border.danger.default}` }} />
                  </div>
                </IllustratedDoDont>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO - footer for actions, not inline"
                  caption="Sticky footer actions stay visible even when long filter content scrolls."
                >
                  <div style={{ width: 200, height: 110, borderRadius: 12, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: 10, color: t.text.tertiary.default, fontSize: 10 }}>long filter list...</div>
                    <div style={{ borderTop: `1px solid ${t.border.default.default}`, padding: 8, display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <DocButton t={t} variant="ghost" small>
                        Clear all
                      </DocButton>
                      <DocButton t={t} variant="primary" small>
                        Apply
                      </DocButton>
                    </div>
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T - actions buried in the body"
                  caption="Buttons inside a scrollable body disappear once the user moves down the list."
                >
                  <div style={{ width: 200, height: 110, borderRadius: 12, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, padding: 10, position: 'relative' }}>
                    <div style={{ color: t.text.tertiary.default, fontSize: 10 }}>scrolling body...</div>
                    <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, color: t.text.secondary.default }}>Clear</span>
                      <span style={{ fontSize: 10, color: t.text.brand.default }}>Apply</span>
                    </div>
                  </div>
                </IllustratedDoDont>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO - trigger from the main page"
                  caption="Open drawers from page-level controls and preserve one clear layer of context."
                >
                  <div style={{ fontSize: 12, color: t.text.secondary.default }}>Page trigger -&gt; drawer</div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T - nest a drawer inside a modal"
                  caption="Modal plus drawer creates competing layers, breaks focus expectations, and muddies spatial hierarchy."
                >
                  <div style={{ position: 'relative', width: 160, height: 90 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 10, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, opacity: 0.85 }} />
                    <div style={{ position: 'absolute', top: 10, right: 0, bottom: 10, width: 48, borderRadius: 8, border: `1px solid ${t.border.danger.default}`, background: t.bg.surface.primary.default, boxShadow: t.shadow.md }} />
                  </div>
                </IllustratedDoDont>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="title-writing-dr" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Title writing
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Noun phrase describing the panel content: &apos;Filters&apos;, &apos;Notifications&apos;, &apos;Order details&apos;</li>
              <li>Include count when relevant: &apos;Cart (3)&apos;, &apos;Filters (2 active)&apos;</li>
              <li>Max 3 words</li>
              <li>No verbs in the title - verbs belong in the CTAs</li>
            </ul>
          </section>
          <section id="body-content-dr" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Body content
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Group related items with section headers (11px uppercase, tracking, tertiary color)</li>
              <li>Use dividers sparingly - between logical groups, not between every item</li>
              <li>If body content can scroll, footer must be sticky (position: sticky; bottom: 0)</li>
            </ul>
          </section>
          <section id="footer-actions-dr" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Footer actions
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Primary CTA: specific verb - &apos;Apply filters&apos;, &apos;Checkout&apos;, &apos;Save settings&apos;</li>
              <li>Secondary action: &apos;Cancel&apos; or &apos;Clear all&apos; - left-aligned or ghost style</li>
              <li>Omit footer entirely if changes apply immediately (toggles, immediate selections)</li>
            </ul>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="props-dr" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Drawer props
            </h3>
            <p style={{ fontSize: 14, color: t.text.secondary.default, marginBottom: 12 }}>
              Sub-components: <code style={{ fontFamily: 'var(--font-mono), monospace' }}>Drawer.Header</code> ·{' '}
              <code style={{ fontFamily: 'var(--font-mono), monospace' }}>Drawer.Body</code> ·{' '}
              <code style={{ fontFamily: 'var(--font-mono), monospace' }}>Drawer.Footer</code>
            </p>
            <PropsTable props={drawerPropsRows} />
          </section>
          <section id="examples-dr" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Code examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={codeBasic} filename="Basic right drawer" language="tsx" />
              <CodeBlock code={codeFilter} filename="Filter drawer with footer" language="tsx" />
              <CodeBlock code={codeNav} filename="Left navigation drawer" language="tsx" />
              <CodeBlock code={codeBottom} filename="Bottom drawer action sheet" language="tsx" />
            </div>
          </section>
          <section id="a11y-dr" style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              Drawer implements the ARIA dialog pattern identically to Modal. The panel has role=&apos;dialog&apos;,
              aria-modal=&apos;true&apos;, aria-labelledby pointing to the title. Focus is trapped inside while open. Escape always
              closes. Focus returns to the trigger on close. Body scroll is locked while the drawer is open.
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
                Initial release. Drawer with right/left/bottom placement, 5 sizes, slide animations per direction, focus trap, body
                scroll lock, sub-components Header/Body/Footer, full ARIA dialog pattern.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
