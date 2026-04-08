'use client';

import type { ReactNode } from 'react';

type LivePreviewProps = {
  children: ReactNode;
  label?: string;
};

export function LivePreview({ children, label }: LivePreviewProps) {
  return (
    <div>
      {label ? <h3 className="component-section-title">{label}</h3> : null}
      <div
        className="preview-canvas"
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          minHeight: '120px',
          marginBottom: '24px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
