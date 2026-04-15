'use client';

import type { ReactNode } from 'react';
import type { VDSTheme } from '@/lib/theme';

/**
 * Canonical component docs live preview: dotted canvas (left) + 280px control panel (right).
 * Do not vary this layout across component doc pages.
 */
export function LivePreviewShell({
  t,
  canvasIsDark,
  children,
  controls,
}: {
  t: VDSTheme;
  canvasIsDark: boolean;
  children: ReactNode;
  controls: ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 360,
          background: canvasIsDark ? '#0F1117' : t.bg.surface.secondary.default,
          backgroundImage: `radial-gradient(circle, ${
            canvasIsDark ? 'rgba(255,255,255,0.06)' : t.border.default.default
          } 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
        }}
      >
        {canvasIsDark ? (
          <div
            data-theme="dark"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
          >
            {children}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {children}
          </div>
        )}
      </div>
      <div
        style={{
          width: 280,
          minWidth: 280,
          borderLeft: `1px solid ${t.border.default.default}`,
          background: t.bg.surface.primary.default,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          flexShrink: 0,
        }}
      >
        {controls}
      </div>
    </div>
  );
}

export function LivePreviewSegmentRow<T extends string>({
  t,
  label,
  options,
  value,
  onChange,
  showDivider = true,
}: {
  t: VDSTheme;
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  showDivider?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: t.text.tertiary.default,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          background: t.bg.surface.secondary.default,
          borderRadius: 10,
          padding: 4,
        }}
      >
        {options.map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 7,
              border: 'none',
              fontSize: 13,
              fontWeight: value === opt ? 700 : 400,
              cursor: 'pointer',
              background: value === opt ? t.bg.surface.primary.default : 'transparent',
              color: value === opt ? t.text.primary.default : t.text.secondary.default,
              boxShadow: value === opt ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 150ms',
              whiteSpace: 'nowrap',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      {showDivider ? <div style={{ height: 1, background: t.border.default.default, marginTop: 16 }} /> : null}
    </div>
  );
}
