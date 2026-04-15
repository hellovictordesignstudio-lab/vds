'use client';

import type { ReactNode } from 'react';
import type { VDSTheme } from '@/lib/theme';

/** Split segmented options into rows (max `size` per row) so each row is its own flex line. */
function chunkSegmentOptions<T>(arr: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

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
  const chunkSize = options.length === 4 ? 2 : 3;

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
          flexDirection: 'column',
          gap: 4,
          background: t.bg.surface.tertiary.default,
          borderRadius: 10,
          padding: 4,
        }}
      >
        {chunkSegmentOptions(options, chunkSize).map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', gap: 4 }}>
            {row.map((opt) => (
              <button
                key={String(opt)}
                type="button"
                onClick={() => onChange(opt)}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 7,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: value === opt ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  background: value === opt ? t.bg.surface.primary.default : 'transparent',
                  color: value === opt ? t.text.primary.default : t.text.secondary.default,
                  boxShadow: value === opt ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                  transition: 'all 150ms',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        ))}
      </div>
      {showDivider ? <div style={{ height: 1, background: t.border.default.default, marginTop: 16 }} /> : null}
    </div>
  );
}
