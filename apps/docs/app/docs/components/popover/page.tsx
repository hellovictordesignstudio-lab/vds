'use client';

import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Info,
  Link,
  MapPin,
  MoreHorizontal,
  Settings,
  Smile,
  Star,
  User,
  X,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { CodeBlock } from '../../../../components/docs/CodeBlock';
import { ComponentTabs } from '../../../../components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '../../../../components/docs/PropsTable';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type PopoverVariant = 'info' | 'actions' | 'form' | 'profile' | 'calendar';
type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';
type PopoverPlacementFull =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'right';
type PopoverSize = 'sm' | 'md' | 'lg';

const PANEL_WIDTH: Record<PopoverSize, number> = {
  sm: 240,
  md: 320,
  lg: 400,
};

const PLACEMENTS: PopoverPlacementFull[] = ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'right'];

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

function FakeField({ t, placeholder, icon }: { t: VDSTheme; placeholder: string; icon?: ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>{placeholder}</div>
      <div
        style={{
          height: 36,
          borderRadius: 8,
          border: `1px solid ${t.border.default.default}`,
          background: t.bg.surface.secondary.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          gap: 8,
          fontSize: 12,
          color: t.text.tertiary.default,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>e.g. To read</span>
        {icon}
      </div>
    </div>
  );
}

function DocButton({
  t,
  children,
  variant,
  fullWidth,
}: {
  t: VDSTheme;
  children: ReactNode;
  variant: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}) {
  const base: CSSProperties = {
    height: 32,
    padding: '0 12px',
    borderRadius: 8,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    width: fullWidth ? '100%' : undefined,
    fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
  };

  if (variant === 'primary') {
    return (
      <button type="button" style={{ ...base, background: t.bg.fill.primary.default, color: '#FFFFFF' }}>
        {children}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        type="button"
        style={{
          ...base,
          background: t.bg.surface.secondary.default,
          color: t.text.primary.default,
          border: `1px solid ${t.border.default.default}`,
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <button type="button" style={{ ...base, background: 'transparent', color: t.text.secondary.default }}>
      {children}
    </button>
  );
}

function renderArrowStyle(placement: PopoverPlacement, t: VDSTheme): CSSProperties {
  const border = `1px solid ${t.border.default.default}`;
  const base: CSSProperties = {
    position: 'absolute',
    width: 16,
    height: 16,
    background: t.bg.surface.primary.default,
    transform: 'rotate(45deg)',
    boxSizing: 'border-box',
    zIndex: 0,
  };

  if (placement === 'top') {
    return { ...base, left: '50%', bottom: -8, marginLeft: -8, borderRight: border, borderBottom: border };
  }
  if (placement === 'bottom') {
    return { ...base, left: '50%', top: -8, marginLeft: -8, borderLeft: border, borderTop: border };
  }
  if (placement === 'left') {
    return { ...base, right: -8, top: '50%', marginTop: -8, borderTop: border, borderRight: border };
  }
  return { ...base, left: -8, top: '50%', marginTop: -8, borderLeft: border, borderBottom: border };
}

function resolvePreviewPlacement(basePlacement: PopoverPlacement, panelWidth: number, panelHeight: number): PopoverPlacement {
  const canvas = { width: 560, height: 360, padding: 16 };
  const trigger = { x: canvas.width / 2, y: canvas.height / 2, width: 136, height: 40 };
  const gap = 18;

  const getBounds = (placement: PopoverPlacement) => {
    if (placement === 'top') {
      return {
        left: trigger.x - panelWidth / 2,
        right: trigger.x + panelWidth / 2,
        top: trigger.y - trigger.height / 2 - gap - panelHeight,
        bottom: trigger.y - trigger.height / 2 - gap,
      };
    }
    if (placement === 'bottom') {
      return {
        left: trigger.x - panelWidth / 2,
        right: trigger.x + panelWidth / 2,
        top: trigger.y + trigger.height / 2 + gap,
        bottom: trigger.y + trigger.height / 2 + gap + panelHeight,
      };
    }
    if (placement === 'left') {
      return {
        left: trigger.x - trigger.width / 2 - gap - panelWidth,
        right: trigger.x - trigger.width / 2 - gap,
        top: trigger.y - panelHeight / 2,
        bottom: trigger.y + panelHeight / 2,
      };
    }
    return {
      left: trigger.x + trigger.width / 2 + gap,
      right: trigger.x + trigger.width / 2 + gap + panelWidth,
      top: trigger.y - panelHeight / 2,
      bottom: trigger.y + panelHeight / 2,
    };
  };

  const b = getBounds(basePlacement);
  const overflows =
    b.left < canvas.padding ||
    b.right > canvas.width - canvas.padding ||
    b.top < canvas.padding ||
    b.bottom > canvas.height - canvas.padding;

  if (!overflows) return basePlacement;
  if (basePlacement === 'top') return 'bottom';
  if (basePlacement === 'bottom') return 'top';
  if (basePlacement === 'left') return 'right';
  return 'left';
}

function getPanelMetrics(variant: PopoverVariant): { height: number; showFooter: boolean; title?: string } {
  if (variant === 'info') return { height: 138, showFooter: false, title: 'What is this?' };
  if (variant === 'actions') return { height: 188, showFooter: false };
  if (variant === 'form') return { height: 232, showFooter: true, title: 'Add to list' };
  if (variant === 'profile') return { height: 188, showFooter: false };
  return { height: 256, showFooter: true, title: 'Due date' };
}

function getPositionStyle(placement: PopoverPlacement): { wrapper: CSSProperties; panelTransform: string; origin: string } {
  if (placement === 'top') {
    return {
      wrapper: { left: '50%', top: 'calc(50% - 40px)' },
      panelTransform: 'translate(-50%, -100%)',
      origin: 'bottom center',
    };
  }
  if (placement === 'bottom') {
    return {
      wrapper: { left: '50%', top: 'calc(50% + 40px)' },
      panelTransform: 'translate(-50%, 0)',
      origin: 'top center',
    };
  }
  if (placement === 'left') {
    return {
      wrapper: { left: 'calc(50% - 76px)', top: '50%' },
      panelTransform: 'translate(-100%, -50%)',
      origin: 'center right',
    };
  }
  return {
    wrapper: { left: 'calc(50% + 76px)', top: '50%' },
    panelTransform: 'translate(0, -50%)',
    origin: 'center left',
  };
}

function ProfileStats({ t }: { t: VDSTheme }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
      {['12 projects', '4 teams'].map((item) => (
        <span
          key={item}
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            background: t.bg.surface.secondary.default,
            color: t.text.secondary.default,
            border: `1px solid ${t.border.default.default}`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function MiniCalendar({ t }: { t: VDSTheme }) {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const cells = ['', '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>April 2026</span>
        <span style={{ fontSize: 11, color: t.text.tertiary.default }}>Month view</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {days.map((day) => (
          <div key={day} style={{ fontSize: 10, fontWeight: 800, color: t.text.tertiary.default, textAlign: 'center' }}>
            {day}
          </div>
        ))}
        {cells.map((cell, index) => {
          const active = cell === '16';
          return (
            <div
              key={`${cell}-${index}`}
              style={{
                height: 28,
                borderRadius: 8,
                border: `1px solid ${active ? t.border.brand.default : 'transparent'}`,
                background: active ? t.bg.fill.brandSubtle.default : t.bg.surface.secondary.default,
                color: active ? t.text.brand.default : cell ? t.text.secondary.default : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: active ? 700 : 600,
              }}
            >
              {cell || '·'}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PopoverContent({
  t,
  variant,
  showCloseButton,
  titleOverride,
}: {
  t: VDSTheme;
  variant: PopoverVariant;
  showCloseButton: boolean;
  titleOverride?: string;
}) {
  const title = titleOverride ?? getPanelMetrics(variant).title;
  const showHeader = Boolean(title || showCloseButton);
  const showFooter = getPanelMetrics(variant).showFooter;

  return (
    <>
      {showHeader ? (
        <>
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>{title ?? ''}</div>
            {showCloseButton ? (
              <button
                type="button"
                aria-label="Close"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: 'none',
                  background: t.bg.surface.secondary.default,
                  color: t.icon.secondary.default,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={16} strokeWidth={2} />
              </button>
            ) : null}
          </div>
          <div style={{ height: 1, background: t.border.default.default }} />
        </>
      ) : null}

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {variant === 'info' ? (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: t.text.secondary.default }}>
            This surface shows extra context about a nearby action without interrupting the current workflow or navigating away.
          </p>
        ) : null}

        {variant === 'actions' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { icon: <Star size={14} aria-hidden />, label: 'Add to favorites' },
              { icon: <Link size={14} aria-hidden />, label: 'Copy link' },
              { icon: <Settings size={14} aria-hidden />, label: 'Settings' },
              { icon: <X size={14} aria-hidden />, label: 'Remove' },
            ].map((item, index) => (
              <div key={item.label}>
                {index === 2 ? <div style={{ height: 1, background: t.border.default.default, margin: '4px 0 8px' }} /> : null}
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: t.text.primary.default,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
                  }}
                >
                  <span style={{ display: 'flex', color: t.icon.secondary.default }}>{item.icon}</span>
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {variant === 'form' ? (
          <>
            <FakeField t={t} placeholder="List name" />
            <FakeField t={t} placeholder="Select a list" icon={<ChevronDown size={14} color={t.icon.secondary.default} aria-hidden />} />
          </>
        ) : null}

        {variant === 'profile' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: t.bg.fill.brandSubtle.default,
                  color: t.text.brand.default,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                }}
              >
                JL
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>Jane Lim</div>
                <div style={{ fontSize: 12, color: t.text.tertiary.default }}>Product Designer</div>
              </div>
            </div>
            <ProfileStats t={t} />
            <DocButton t={t} variant="secondary" fullWidth>
              View profile
            </DocButton>
          </>
        ) : null}

        {variant === 'calendar' ? <MiniCalendar t={t} /> : null}
      </div>

      {showFooter ? (
        <>
          <div style={{ height: 1, background: t.border.default.default }} />
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {variant === 'calendar' ? (
              <>
                <DocButton t={t} variant="ghost">
                  Clear
                </DocButton>
                <DocButton t={t} variant="primary">
                  Apply
                </DocButton>
              </>
            ) : (
              <>
                <DocButton t={t} variant="ghost">
                  Cancel
                </DocButton>
                <DocButton t={t} variant="primary">
                  Save
                </DocButton>
              </>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}

function PopoverPreview({
  t,
  variant,
  basePlacement,
  size,
  showArrow,
  showCloseButton,
  open,
}: {
  t: VDSTheme;
  variant: PopoverVariant;
  basePlacement: PopoverPlacement;
  size: PopoverSize;
  showArrow: boolean;
  showCloseButton: boolean;
  open: boolean;
}) {
  const metrics = getPanelMetrics(variant);
  const resolvedPlacement = resolvePreviewPlacement(basePlacement, PANEL_WIDTH[size], metrics.height);
  const position = getPositionStyle(resolvedPlacement);
  const popoverId = useId();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 360,
        alignSelf: 'stretch',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={popoverId}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 10,
            border: `1px solid ${t.border.default.default}`,
            background: t.bg.surface.primary.default,
            color: t.text.primary.default,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
          }}
        >
          <MoreHorizontal size={16} aria-hidden />
          Open popover
        </button>
        {resolvedPlacement !== basePlacement ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>Auto-flipped to {resolvedPlacement}</span>
        ) : null}
      </div>

      {open ? (
        <div
          style={{
            position: 'absolute',
            ...position.wrapper,
            zIndex: 2,
          }}
        >
          <div
            id={popoverId}
            role={variant === 'info' ? 'tooltip' : 'dialog'}
            aria-modal={variant === 'info' ? undefined : false}
            style={{
              width: PANEL_WIDTH[size],
              maxWidth: 'min(400px, calc(100vw - 48px))',
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 12,
              boxShadow: t.shadow.md,
              overflow: 'visible',
              transform: `${position.panelTransform} scale(1)`,
              transformOrigin: position.origin,
              opacity: 1,
              animation: 'popoverDocFadeScale 150ms ease-out',
            }}
          >
            {showArrow ? <div style={renderArrowStyle(resolvedPlacement, t)} /> : null}
            <div style={{ position: 'relative', zIndex: 1, background: t.bg.surface.primary.default, borderRadius: 12, overflow: 'hidden' }}>
              <PopoverContent t={t} variant={variant} showCloseButton={showCloseButton} />
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes popoverDocFadeScale {
          from {
            opacity: 0;
            transform: ${position.panelTransform} scale(0.95);
          }
          to {
            opacity: 1;
            transform: ${position.panelTransform} scale(1);
          }
        }
      `}</style>
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
      <div
        style={{
          minHeight: 180,
          background: t.bg.surface.secondary.default,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
      <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ display: 'flex', color: t.text.brand.default }}>{icon}</span>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>{title}</div>
        </div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: t.text.secondary.default }}>{body}</p>
      </div>
    </div>
  );
}

function MiniStaticPopover({
  t,
  width,
  placement,
  title,
  showArrow,
  footer,
  children,
}: {
  t: VDSTheme;
  width: number;
  placement: PopoverPlacementFull;
  title?: string;
  showArrow?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const isTop = placement.startsWith('top');
  const isBottom = placement.startsWith('bottom');
  const isLeft = placement === 'left';
  const arrowStyle = isTop
    ? { left: placement === 'top-start' ? 28 : placement === 'top-end' ? width - 36 : width / 2 - 8, bottom: -8 }
    : isBottom
      ? { left: placement === 'bottom-start' ? 28 : placement === 'bottom-end' ? width - 36 : width / 2 - 8, top: -8 }
      : isLeft
        ? { right: -8, top: '50%', marginTop: -8 }
        : { left: -8, top: '50%', marginTop: -8 };

  return (
    <div style={{ position: 'relative', width }}>
      {showArrow ? (
        <div
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            background: t.bg.surface.primary.default,
            transform: 'rotate(45deg)',
            borderTop: isBottom || isLeft ? `1px solid ${t.border.default.default}` : undefined,
            borderLeft: isBottom || placement === 'right' ? `1px solid ${t.border.default.default}` : undefined,
            borderRight: isTop || isLeft ? `1px solid ${t.border.default.default}` : undefined,
            borderBottom: isTop || placement === 'right' ? `1px solid ${t.border.default.default}` : undefined,
            ...arrowStyle,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'relative',
          background: t.bg.surface.primary.default,
          border: `1px solid ${t.border.default.default}`,
          borderRadius: 12,
          boxShadow: t.shadow.md,
          overflow: 'hidden',
        }}
      >
        {title ? (
          <>
            <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>{title}</div>
            <div style={{ height: 1, background: t.border.default.default }} />
          </>
        ) : null}
        <div style={{ padding: 12 }}>{children}</div>
        {footer ? (
          <>
            <div style={{ height: 1, background: t.border.default.default }} />
            <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'flex-end', gap: 6 }}>{footer}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function PlacementChip({ t, placement }: { t: VDSTheme; placement: PopoverPlacementFull }) {
  const panelStyle = (() => {
    if (placement === 'top') return { left: 10, top: 2, width: 20, height: 8 };
    if (placement === 'top-start') return { left: 4, top: 2, width: 20, height: 8 };
    if (placement === 'top-end') return { left: 16, top: 2, width: 20, height: 8 };
    if (placement === 'bottom') return { left: 10, top: 30, width: 20, height: 8 };
    if (placement === 'bottom-start') return { left: 4, top: 30, width: 20, height: 8 };
    if (placement === 'bottom-end') return { left: 16, top: 30, width: 20, height: 8 };
    if (placement === 'left') return { left: 2, top: 14, width: 14, height: 12 };
    return { left: 24, top: 14, width: 14, height: 12 };
  })();

  return (
    <div
      style={{
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 12,
        padding: '16px 12px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          margin: '0 auto 10px',
          borderRadius: 10,
          border: `1px solid ${t.border.default.default}`,
          background: t.bg.surface.secondary.default,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 17,
            top: 17,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: t.bg.fill.primary.default,
          }}
        />
        <div
          style={{
            position: 'absolute',
            borderRadius: 4,
            background: t.bg.surface.primary.default,
            border: `1px solid ${t.border.default.default}`,
            ...panelStyle,
          }}
        />
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>{placement}</div>
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
          minHeight: 132,
          padding: 24,
          background: t.bg.surface.secondary.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
      <div style={{ padding: '12px 16px 0', fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>{title}</div>
      <div style={{ height: 3, background: ok ? '#0A8853' : '#E8186D' }} />
      <p style={{ margin: 0, padding: '16px 20px', fontSize: 13, lineHeight: 1.55, color: t.text.secondary.default }}>{caption}</p>
    </div>
  );
}

export default function PopoverDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [variant, setVariant] = useState<PopoverVariant>('info');
  const [placement, setPlacement] = useState<PopoverPlacement>('bottom');
  const [size, setSize] = useState<PopoverSize>('md');
  const [showArrow, setShowArrow] = useState<'off' | 'on'>('on');
  const [showCloseButton, setShowCloseButton] = useState<'off' | 'on'>('off');
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [previewOpen, setPreviewOpen] = useState(true);

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
        { id: 'principles-po', label: 'Principles' },
        { id: 'anatomy-po', label: 'Anatomy' },
        { id: 'placement-po', label: 'Placement' },
        { id: 'variants-po', label: 'Variants' },
        { id: 'sizes-po', label: 'Sizes' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-po', label: 'When to use' },
        { id: 'popover-vs', label: 'Popover vs. other patterns' },
        { id: 'dos-donts-po', label: "Do & Don't" },
      ];
    }
    if (activeTab === 'Content') {
      return [
        { id: 'title-writing-po', label: 'Title writing' },
        { id: 'body-content-po', label: 'Body content' },
        { id: 'action-labels-po', label: 'Action labels' },
      ];
    }
    if (activeTab === 'Code') {
      return [
        { id: 'props-po', label: 'Popover props' },
        { id: 'examples-po', label: 'Code examples' },
        { id: 'a11y-po', label: 'Accessibility' },
      ];
    }
    return [];
  }, [activeTab]);

  const propsRows = [
    { name: 'trigger', type: 'ReactNode', default: '—', description: 'Trigger element (required)', required: true as const },
    { name: 'children', type: 'ReactNode', default: '—', description: 'Popover content (required)', required: true as const },
    {
      name: 'placement',
      type: "'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'",
      default: "'bottom-start'",
      description: 'Preferred placement',
    },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Panel max-width' },
    { name: 'title', type: 'string', default: '—', description: 'Optional header title' },
    { name: 'showCloseButton', type: 'boolean', default: 'false', description: 'X button in header' },
    { name: 'showArrow', type: 'boolean', default: 'true', description: 'Arrow pointing to trigger' },
    { name: 'closeOnClickOutside', type: 'boolean', default: 'true', description: 'Close on outside click' },
    { name: 'closeOnEsc', type: 'boolean', default: 'true', description: 'Close on Escape' },
    { name: 'isOpen', type: 'boolean', default: '—', description: 'Controlled open state' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: '—', description: 'Controlled handler' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const codeBasic = `// Basic info popover
<Popover
  trigger={<Button variant="ghost" size="sm"><HelpCircle size={16} /></Button>}
  size="sm"
  title="What is this?"
>
  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6 }}>
    This score is calculated based on your activity over the last 30 days.
  </p>
</Popover>`;

  const codeActions = `// Action list popover
<Popover
  trigger={<Button variant="ghost" size="sm"><MoreHorizontal size={16} /></Button>}
  size="sm"
  showArrow={false}
  placement="bottom-end"
>
  {[
    { icon: <Star size={14} />, label: 'Add to favorites' },
    { icon: <Link size={14} />,  label: 'Copy link' },
    { icon: <X size={14} />,     label: 'Remove' },
  ].map(item => (
    <button key={item.label} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      width: '100%', padding: '8px 12px', background: 'none',
      border: 'none', cursor: 'pointer', fontSize: 13,
      color: t.text.primary.default, borderRadius: 6,
    }}>
      {item.icon} {item.label}
    </button>
  ))}
</Popover>`;

  const codeForm = `// Mini form popover
<Popover
  trigger={<Button variant="secondary" size="sm">Add tag</Button>}
  title="Add to list"
  showCloseButton
  size="md"
  placement="bottom-start"
>
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <TextInput label="List name" placeholder="e.g. To read" size="sm" />
    <Select label="Category" options={categoryOptions} size="sm" />
  </div>
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
    <Button variant="ghost" size="sm">Cancel</Button>
    <Button variant="primary" size="sm">Save</Button>
  </div>
</Popover>`;

  const codeProfile = `// Profile preview popover
<Popover
  trigger={<span style={{ cursor: 'pointer', fontWeight: 600 }}>Jane Lim</span>}
  size="md"
  placement="top-start"
>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
    <Avatar src="/jane.jpg" name="Jane Lim" size="lg" />
    <div>
      <div style={{ fontWeight: 700, fontSize: 14 }}>Jane Lim</div>
      <div style={{ fontSize: 12, color: t.text.tertiary.default }}>Product Designer</div>
    </div>
  </div>
  <Button variant="secondary" size="sm" fullWidth>View profile</Button>
</Popover>`;

  const codeControlled = `// Controlled popover
const [open, setOpen] = useState(false)
<Popover
  trigger={<Button onClick={() => setOpen(true)}>Open</Button>}
  isOpen={open}
  onOpenChange={setOpen}
  title="Controlled popover"
>
  <p>Content here.</p>
</Popover>`;

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Popover
      </p>
      <h1 className="page-title">Popover</h1>
      <p className="page-lead">
        Popovers are contextual overlays anchored to a trigger element. They float above the UI to show supplementary content
        — rich tooltips, mini forms, action menus, or previews — without navigating away or blocking the page. Unlike
        tooltips, popovers are interactive and require an explicit action to open and close.
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
                    options={['info', 'actions', 'form', 'profile', 'calendar']}
                    value={variant}
                    onChange={(value) => setVariant(value as PopoverVariant)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Placement"
                    options={['top', 'bottom', 'left', 'right']}
                    value={placement}
                    onChange={(value) => setPlacement(value as PopoverPlacement)}
                  />
                  <LivePreviewSegmentRow t={t} label="Size" options={['sm', 'md', 'lg']} value={size} onChange={(value) => setSize(value as PopoverSize)} />
                  <LivePreviewSegmentRow t={t} label="Show arrow" options={['off', 'on']} value={showArrow} onChange={setShowArrow} />
                  <LivePreviewSegmentRow t={t} label="Close button" options={['off', 'on']} value={showCloseButton} onChange={setShowCloseButton} />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Appearance"
                    options={['Light', 'Dark']}
                    value={appearance === 'dark' ? 'Dark' : 'Light'}
                    onChange={(value) => setAppearance(value === 'Dark' ? 'dark' : 'light')}
                    showDivider={false}
                  />
                </>
              }
            >
              <div style={{ width: '100%', position: 'relative' }} onClick={() => previewOpen && setPreviewOpen(false)}>
                <div style={{ position: 'absolute', right: 0, top: 0 }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewOpen((value) => !value);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: previewT.text.secondary.default,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {previewOpen ? 'Close preview popover' : 'Open preview popover'}
                  </button>
                </div>
                <PopoverPreview
                  t={previewT}
                  variant={variant}
                  basePlacement={placement}
                  size={size}
                  showArrow={showArrow === 'on'}
                  showCloseButton={showCloseButton === 'on'}
                  open={previewOpen}
                />
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-po" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Principles
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <PrincipleCard
                t={t}
                icon={<Link size={18} aria-hidden />}
                title="Anchored and interactive"
                body="A popover is always anchored to a trigger element — it inherits its position from it. Unlike a tooltip, a popover contains interactive elements: buttons, inputs, links. It opens on click, not on hover, and requires an explicit action to close."
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      style={{
                        height: 34,
                        padding: '0 12px',
                        borderRadius: 8,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      Trigger
                    </button>
                    <div style={{ position: 'absolute', left: '50%', top: 44, transform: 'translateX(-50%)' }}>
                      <MiniStaticPopover t={t} width={164} placement="bottom" title="Popover" showArrow>
                        <div style={{ fontSize: 11, color: t.text.secondary.default }}>Interactive</div>
                      </MiniStaticPopover>
                    </div>
                  </div>
                  <div style={{ position: 'relative', marginTop: 28 }}>
                    <button
                      type="button"
                      style={{
                        height: 34,
                        padding: '0 12px',
                        borderRadius: 8,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      Trigger
                    </button>
                    <div
                      style={{
                        position: 'absolute',
                        left: 'calc(100% + 12px)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        fontSize: 10,
                        color: t.text.secondary.default,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Tooltip - read-only
                    </div>
                  </div>
                </div>
              </PrincipleCard>

              <PrincipleCard
                t={t}
                icon={<HelpCircle size={18} aria-hidden />}
                title="Sized by content, not convention"
                body="Choose the smallest size that fits the content comfortably. A two-line explanation needs sm. A mini form needs md. A date picker or rich preview needs lg. Never use a popover so large it covers most of the screen — use a Drawer instead."
              >
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: 8, fontSize: 10, color: t.text.tertiary.default }}>sm</div>
                    <MiniStaticPopover t={t} width={124} placement="bottom" title="Info" showArrow>
                      <div style={{ fontSize: 10, lineHeight: 1.5, color: t.text.secondary.default }}>Two lines of context.</div>
                    </MiniStaticPopover>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: 8, fontSize: 10, color: t.text.tertiary.default }}>md</div>
                    <MiniStaticPopover t={t} width={168} placement="bottom" title="Form" showArrow>
                      <div style={{ height: 10, borderRadius: 4, background: t.bg.surface.secondary.default, marginBottom: 6 }} />
                      <div style={{ height: 10, borderRadius: 4, background: t.bg.surface.secondary.default }} />
                    </MiniStaticPopover>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: 8, fontSize: 10, color: t.text.tertiary.default }}>lg</div>
                    <MiniStaticPopover t={t} width={208} placement="bottom" title="Calendar" showArrow>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                        {Array.from({ length: 14 }).map((_, i) => (
                          <div key={i} style={{ height: 16, borderRadius: 4, background: t.bg.surface.secondary.default }} />
                        ))}
                      </div>
                    </MiniStaticPopover>
                  </div>
                </div>
              </PrincipleCard>

              <PrincipleCard
                t={t}
                icon={<X size={18} aria-hidden />}
                title="Always closeable"
                body="Popovers close on click outside (overlay dismiss) and on Escape key. For popovers with forms or complex interactions, add an explicit close button. Never require the user to complete an action to dismiss a popover."
              >
                <div style={{ position: 'relative', width: 220, height: 120 }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 14,
                      border: '1px dashed rgba(232,24,109,0.45)',
                    }}
                  />
                  <div style={{ position: 'absolute', left: 76, top: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="1" />
                    <span style={{ fontSize: 10, color: '#E8186D', fontWeight: 700 }}>Outside click</span>
                  </div>
                  <div style={{ position: 'absolute', left: 46, top: 38 }}>
                    <MiniStaticPopover t={t} width={140} placement="bottom" title="Add to list" showArrow footer={<span style={{ fontSize: 10, color: t.text.brand.default }}>Save</span>}>
                      <div style={{ fontSize: 10, color: t.text.secondary.default }}>Form content</div>
                    </MiniStaticPopover>
                  </div>
                  <div style={{ position: 'absolute', right: 2, top: 34, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="2" />
                    <span style={{ fontSize: 10, color: '#E8186D', fontWeight: 700 }}>X</span>
                  </div>
                </div>
              </PrincipleCard>
            </div>
          </section>

          <section id="anatomy-po" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                position: 'relative',
                minHeight: 320,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                backgroundColor: t.bg.surface.secondary.default,
                backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                overflow: 'hidden',
                padding: 24,
              }}
            >
              <div style={{ position: 'absolute', left: '50%', top: 28, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  style={{
                    height: 36,
                    padding: '0 14px',
                    borderRadius: 8,
                    border: `1px solid ${t.border.default.default}`,
                    background: t.bg.surface.primary.default,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Trigger button
                </button>
                <AnnotationDot letter="I" />
              </div>
              <div style={{ position: 'absolute', left: '50%', top: 64, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#E8186D' }}>▲</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>H</span>
              </div>
              <div
                style={{
                  width: 360,
                  maxWidth: '100%',
                  margin: '84px auto 0',
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 12,
                  boxShadow: t.shadow.md,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AnnotationDot letter="A" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>Add to list</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AnnotationDot letter="B" />
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: t.bg.surface.secondary.default,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={16} aria-hidden />
                    </div>
                  </div>
                </div>
                <div style={{ height: 1, background: t.border.default.default, position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 12, top: -10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="C" />
                  </div>
                </div>
                <div style={{ padding: 16, position: 'relative', minHeight: 112 }}>
                  <div style={{ position: 'absolute', left: -10, top: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="D" />
                  </div>
                  <FakeField t={t} placeholder="List name" />
                  <div style={{ height: 12 }} />
                  <FakeField t={t} placeholder="Select a list" icon={<ChevronDown size={14} color={t.icon.secondary.default} aria-hidden />} />
                </div>
                <div style={{ height: 1, background: t.border.default.default, position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 12, top: -10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="E" />
                  </div>
                </div>
                <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -10, top: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="F" />
                  </div>
                  <DocButton t={t} variant="ghost">
                    Cancel
                  </DocButton>
                  <DocButton t={t} variant="primary">
                    Save
                  </DocButton>
                </div>
              </div>
              <div style={{ position: 'absolute', right: 36, bottom: 34, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AnnotationDot letter="G" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>Panel container</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.7, margin: '16px 0 0' }}>
              <strong style={{ color: t.text.primary.default }}>A</strong> → Header (optional, padding 12px 16px, flex row,
              title 14px / 700) <strong style={{ color: t.text.primary.default }}>B</strong> → Close button (X 16px, 28x28px,
              radius 6px, hover surface.secondary) <strong style={{ color: t.text.primary.default }}>C</strong> → Header divider
              (1px solid border.default, only when header exists) <strong style={{ color: t.text.primary.default }}>D</strong> →
              Body (padding 16px, main content area) <strong style={{ color: t.text.primary.default }}>E</strong> → Footer divider
              (1px solid border.default, only when footer exists) <strong style={{ color: t.text.primary.default }}>F</strong> →
              Footer (padding 12px 16px, flex row gap 8 justify-end) <strong style={{ color: t.text.primary.default }}>G</strong> →
              Panel container (surface.primary, border 1px, radius 12px, shadow.md) <strong style={{ color: t.text.primary.default }}>H</strong> →
              Arrow (8px triangle, matching panel, positioned by placement) <strong style={{ color: t.text.primary.default }}>I</strong> →
              Trigger (the element that activates the popover).
            </p>
          </section>

          <section id="placement-po" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Placement
            </h2>
            <p style={{ fontSize: 17, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 20 }}>
              Popovers support 8 placement positions. The default is bottom-start. When space is insufficient, the popover flips
              to the opposite side automatically.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {PLACEMENTS.map((item) => (
                <PlacementChip key={item} t={t} placement={item} />
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="tip" title="Auto-flip behavior">
                Always specify the preferred placement. The popover engine detects viewport boundaries and flips to the opposite
                axis if the preferred position would cause overflow. bottom → top, left → right, and so on.
              </Callout>
            </div>
          </section>

          <section id="variants-po" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {(
                [
                  {
                    key: 'info',
                    title: 'Info',
                    token: 'variant: info',
                    desc: 'Rich tooltip. Use for contextual explanations that are too long for a standard tooltip. No interactive elements required.',
                    width: 220,
                  },
                  {
                    key: 'actions',
                    title: 'Actions',
                    token: 'variant: actions',
                    desc: 'Contextual action menu. Alternative to a full DropdownMenu when actions are few and contextual. Each item is a clickable row.',
                    width: 220,
                  },
                  {
                    key: 'form',
                    title: 'Form',
                    token: 'variant: form',
                    desc: 'Mini form. For quick data entry anchored to a specific element — adding a tag, renaming an item, setting a value. Keep to 2-3 fields max.',
                    width: 260,
                  },
                  {
                    key: 'profile',
                    title: 'Profile',
                    token: 'variant: profile',
                    desc: 'User or entity preview. Shows a summary of the person or item without navigating to their full page.',
                    width: 260,
                  },
                  {
                    key: 'calendar',
                    title: 'Calendar',
                    token: 'variant: calendar',
                    desc: 'Date picker popover. A lightweight alternative to a full DatePicker when space is constrained and the date is an optional parameter.',
                    width: 300,
                  },
                ] as const
              ).map((item) => (
                <div
                  key={item.key}
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
                      backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
                      backgroundSize: '20px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 16,
                    }}
                  >
                    <MiniStaticPopover
                      t={t}
                      width={item.width}
                      placement="bottom"
                      title={item.key === 'actions' || item.key === 'profile' ? undefined : item.key === 'calendar' ? 'Due date' : item.key === 'form' ? 'Add to list' : 'What is this?'}
                      showArrow
                      footer={
                        item.key === 'form' ? (
                          <>
                            <span style={{ fontSize: 10, color: t.text.secondary.default }}>Cancel</span>
                            <span style={{ fontSize: 10, color: t.text.brand.default }}>Save</span>
                          </>
                        ) : item.key === 'calendar' ? (
                          <>
                            <span style={{ fontSize: 10, color: t.text.secondary.default }}>Clear</span>
                            <span style={{ fontSize: 10, color: t.text.brand.default }}>Apply</span>
                          </>
                        ) : undefined
                      }
                    >
                      {item.key === 'info' ? (
                        <div style={{ fontSize: 11, lineHeight: 1.55, color: t.text.secondary.default }}>
                          Rich tooltip content with a little more context than a standard tooltip.
                        </div>
                      ) : null}
                      {item.key === 'actions' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {[
                            { icon: <Star size={14} aria-hidden />, label: 'Favorite' },
                            { icon: <Link size={14} aria-hidden />, label: 'Copy link' },
                            { icon: <Settings size={14} aria-hidden />, label: 'Settings' },
                            { icon: <X size={14} aria-hidden />, label: 'Remove' },
                          ].map((row, index) => (
                            <div key={row.label}>
                              {index === 2 ? <div style={{ height: 1, background: t.border.default.default, margin: '2px 0 6px' }} /> : null}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: t.text.primary.default }}>
                                {row.icon}
                                {row.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {item.key === 'form' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ height: 28, borderRadius: 6, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.secondary.default }} />
                          <div style={{ height: 28, borderRadius: 6, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.secondary.default }} />
                        </div>
                      ) : null}
                      {item.key === 'profile' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: t.bg.fill.brandSubtle.default,
                                color: t.text.brand.default,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              JL
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>Jane Lim</div>
                              <div style={{ fontSize: 10, color: t.text.tertiary.default }}>Product Designer</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <span style={chipStyleB(t, { fontSize: 10, padding: '3px 8px' })}>12 projects</span>
                            <span style={chipStyleB(t, { fontSize: 10, padding: '3px 8px' })}>4 teams</span>
                          </div>
                          <div style={{ height: 28, borderRadius: 6, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.secondary.default }} />
                        </div>
                      ) : null}
                      {item.key === 'calendar' ? <MiniCalendar t={t} /> : null}
                    </MiniStaticPopover>
                  </div>
                  <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: t.text.primary.default }}>{item.title}</div>
                    <span style={chipStyleB(t, { marginBottom: 8 })}>{item.token}</span>
                    <p style={{ fontSize: 13, lineHeight: 1.5, color: t.text.secondary.default, margin: '8px 0 0' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="sizes-po" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {(
                [
                  ['sm', '240px', 'Info text, simple action lists'],
                  ['md', '320px', 'Default — forms, profiles, previews'],
                  ['lg', '400px', 'Date pickers, rich content, multi-column'],
                ] as const
              ).map(([label, px, desc]) => (
                <div
                  key={label}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      height: 124,
                      borderRadius: 12,
                      background: t.bg.surface.secondary.default,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: label === 'sm' ? 120 : label === 'md' ? 160 : 200,
                        height: label === 'sm' ? 64 : label === 'md' ? 78 : 92,
                        borderRadius: 12,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        boxShadow: t.shadow.md,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>
                    {label} <span style={{ color: t.text.tertiary.default, fontWeight: 600 }}>· {px}</span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.5, color: t.text.secondary.default }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-po" style={{ marginTop: 32, marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'rgba(10,136,83,0.04)', border: '1px solid rgba(10,136,83,0.2)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0A8853', letterSpacing: '0.06em', marginBottom: 12 }}>DO</div>
                {[
                  'Rich explanations anchored to a specific element',
                  'Mini contextual forms such as add tag, rename, or assign date',
                  'User or entity previews on click or hover-to-click follow-up',
                  'Contextual action menus with a small number of items',
                ].map((item) => (
                  <div key={item} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {item}
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(232,24,109,0.04)', border: '1px solid rgba(232,24,109,0.2)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#E8186D', letterSpacing: '0.06em', marginBottom: 12 }}>DON&apos;T</div>
                {[
                  'Content that requires extensive scrolling (use Drawer)',
                  'Destructive actions that require confirmation (use Modal)',
                  'Primary navigation',
                  'Content the user must keep visible while working elsewhere',
                ].map((item) => (
                  <div key={item} style={{ fontSize: 13, color: t.text.secondary.default, marginBottom: 8 }}>
                    · {item}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="warning" title="Popovers and mobile">
                Popovers anchored to hover triggers don&apos;t work on touch screens. Ensure every popover has a click or tap trigger
                as primary activation. On very small viewports, consider replacing popovers with bottom drawers.
              </Callout>
            </div>
          </section>

          <section id="popover-vs" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Popover vs. other patterns
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
                    ['Popover', 'Interactive content anchored to a trigger, opened on click'],
                    ['Tooltip', 'Read-only label or short explanation, shown on hover'],
                    ['Drawer', 'Larger panel, not anchored to a specific element, scrollable content'],
                    ['Modal', 'Full attention required, blocking interaction'],
                    ['Dropdown', 'Navigation or selection list triggered by a button'],
                  ].map(([pattern, desc]) => (
                    <tr key={pattern}>
                      <td className="props-table__name" style={{ fontWeight: 700 }}>
                        {pattern}
                      </td>
                      <td className="props-table__desc">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="dos-donts-po" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — Popover for rich context"
                  caption="Two lines of guidance plus a link is interactive contextual content. Open it on click as a popover."
                >
                  <MiniStaticPopover t={t} width={180} placement="bottom" title="Need help?" showArrow>
                    <div style={{ fontSize: 11, lineHeight: 1.5, color: t.text.secondary.default }}>
                      Read billing rules and <span style={{ color: t.text.brand.default }}>open docs</span>.
                    </div>
                  </MiniStaticPopover>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — oversized tooltip"
                  caption="The same content on hover becomes a tooltip carrying too much weight. Use a popover instead."
                >
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      border: `1px dashed ${t.border.default.default}`,
                      background: t.bg.surface.primary.default,
                      fontSize: 11,
                      color: t.text.secondary.default,
                      maxWidth: 180,
                    }}
                  >
                    Too much copy for a tooltip
                  </div>
                </IllustratedDoDont>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — keep forms tiny"
                  caption='A quick two-field flow such as "Name" plus "Color" fits comfortably inside a popover.'
                >
                  <div style={{ width: 180 }}>
                    <div style={{ height: 28, borderRadius: 6, background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, marginBottom: 8 }} />
                    <div style={{ height: 28, borderRadius: 6, background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}` }} />
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — complex forms"
                  caption="Eight fields in a floating panel create cramped layout and fragile focus management. Move to a page or modal."
                >
                  <div style={{ width: 200, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} style={{ height: 22, borderRadius: 6, background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}` }} />
                    ))}
                  </div>
                </IllustratedDoDont>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — choose placement deliberately"
                  caption="If the trigger is near the bottom edge, prefer top placement so the popover remains visible."
                >
                  <div style={{ position: 'relative', width: 180, height: 84 }}>
                    <div style={{ position: 'absolute', left: 72, bottom: 4, width: 36, height: 14, borderRadius: 999, background: t.bg.fill.primary.default }} />
                    <div style={{ position: 'absolute', left: 46, top: 0 }}>
                      <MiniStaticPopover t={t} width={88} placement="top" showArrow>
                        <div style={{ fontSize: 10, color: t.text.secondary.default }}>Fits above</div>
                      </MiniStaticPopover>
                    </div>
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON&apos;T — ignore the viewport"
                  caption="Bottom placement from a footer trigger pushes the panel out of view and breaks the anchored relationship."
                >
                  <div style={{ position: 'relative', width: 180, height: 84 }}>
                    <div style={{ position: 'absolute', left: 72, bottom: 4, width: 36, height: 14, borderRadius: 999, background: t.bg.fill.primary.default }} />
                    <div style={{ position: 'absolute', left: 46, bottom: -28, opacity: 0.65 }}>
                      <MiniStaticPopover t={t} width={88} placement="bottom" showArrow>
                        <div style={{ fontSize: 10, color: t.text.secondary.default }}>Clipped</div>
                      </MiniStaticPopover>
                    </div>
                  </div>
                </IllustratedDoDont>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <>
          <section id="title-writing-po" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Title writing
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Optional - only include if the popover contains multiple sections or needs a label</li>
              <li>Noun phrase: &apos;Add to list&apos;, &apos;User profile&apos;, &apos;Set due date&apos;</li>
              <li>Max 3 words</li>
            </ul>
          </section>

          <section id="body-content-po" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Body content
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Lead with the most important information</li>
              <li>For action lists: verb + noun per item - &apos;Edit name&apos;, &apos;Copy link&apos;, &apos;Delete&apos;</li>
              <li>For forms: label every field, omit helper text if the label is self-explanatory</li>
            </ul>
          </section>

          <section id="action-labels-po" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Action labels
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
              <li>Primary: specific verb - &apos;Save&apos;, &apos;Apply&apos;, &apos;Add&apos;</li>
              <li>Secondary: &apos;Cancel&apos; or &apos;Clear&apos; - always on the left</li>
              <li>Omit footer if popover closes automatically after an action (action list variant)</li>
            </ul>
          </section>
        </>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section id="props-po" style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Popover props
            </h3>
            <PropsTable props={propsRows} />
          </section>

          <section id="examples-po" style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Code examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={codeBasic} filename="Basic info popover" language="tsx" />
              <CodeBlock code={codeActions} filename="Action list popover" language="tsx" />
              <CodeBlock code={codeForm} filename="Mini form popover" language="tsx" />
              <CodeBlock code={codeProfile} filename="Profile preview popover" language="tsx" />
              <CodeBlock code={codeControlled} filename="Controlled popover" language="tsx" />
            </div>
          </section>

          <section id="a11y-po" style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              The trigger element receives aria-expanded and aria-controls pointing to the popover panel. The panel has role=&apos;dialog&apos;
              when it contains interactive elements, or role=&apos;tooltip&apos; for read-only content. Focus moves into the panel on open.
              Escape closes and returns focus to the trigger. Click outside closes without moving focus.
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
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: t.text.secondary.default, flex: 1 }}>
                Initial release. Popover with 8 placements, auto-flip, 3 sizes, 5 variants, arrow, controlled and uncontrolled
                modes, full ARIA dialog and tooltip pattern.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
