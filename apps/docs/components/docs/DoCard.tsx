import type { ReactNode } from 'react';

type DoCardProps = {
  children: ReactNode;
};

export function DoCard({ children }: DoCardProps) {
  return (
    <>
      <div className="do-card">
        <div className="do-card-preview">{children}</div>
      </div>
      <div className="do-label">✓ Do</div>
    </>
  );
}
