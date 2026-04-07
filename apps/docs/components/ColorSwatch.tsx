'use client';

import { useCallback, useState } from 'react';

type ColorSwatchProps = {
  name: string;
  hex: string;
  bordered?: boolean;
};

export function ColorSwatch({ name, hex, bordered }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [hex]);

  return (
    <div className="swatch">
      <div className="swatch-color-wrap">
        <div
          className={`swatch-color${bordered ? ' swatch-color--bordered' : ''}`}
          style={{ backgroundColor: hex }}
        />
        <button type="button" className="swatch-copy-btn" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <span className="swatch-name">{name}</span>
      <span className="swatch-hex">{hex}</span>
    </div>
  );
}
