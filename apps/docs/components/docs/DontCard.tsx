import type { ReactNode } from 'react';

type DontCardProps = {
  children: ReactNode;
};

export function DontCard({ children }: DontCardProps) {
  return (
    <>
      <div className="dont-card">
        <div className="dont-card-preview">{children}</div>
      </div>
      <div className="dont-label">× Don&apos;t</div>
    </>
  );
}
