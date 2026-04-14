'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { AlignHorizontalSpaceAround, Grid, Layers, MousePointerClick, Ruler } from 'lucide-react';
import { Callout } from '@/components/docs/Callout';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { buildTheme, type VDSTheme } from '@/lib/theme';

function vdsSuccessChipStyle(t: Pick<VDSTheme, 'bg' | 'text'>): CSSProperties {
  return {
    background: t.bg.fill.success.default,
    color: t.text.success.default,
    fontSize: 12,
    fontFamily: 'inherit',
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  };
}

/** Style B — CSS token chips only (--space-*, --color-*, etc.) */
function vdsTokenChipStyle(t: Pick<VDSTheme, 'bg' | 'text'>): CSSProperties {
  return {
    background: t.bg.fill.brandSubtle.default,
    color: t.text.brand.default,
    fontSize: 12,
    fontFamily: 'var(--font-mono), monospace',
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    width: 'fit-content',
  };
}

const tocItems = [
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'scale', label: 'Spacing scale' },
  { id: 'aliases', label: 'Semantic aliases' },
  { id: 'concepts', label: 'Concepts' },
  { id: 'components', label: 'Component reference' },
  { id: 'responsive', label: 'Responsive' },
  { id: 'usage', label: 'Usage' },
];

const SPACE_ROWS: {
  n: number;
  px: number;
  rem: string;
  barPx: number;
  note: string;
  isDefault?: boolean;
}[] = [
  { n: 1, px: 4, rem: '0.25rem', barPx: 8, note: 'Icon gaps, tiny nudges' },
  { n: 2, px: 8, rem: '0.5rem', barPx: 16, note: 'Tight inline spacing' },
  { n: 3, px: 12, rem: '0.75rem', barPx: 24, note: 'Compact component padding' },
  { n: 4, px: 16, rem: '1rem', barPx: 32, note: 'Default component padding', isDefault: true },
  { n: 5, px: 20, rem: '1.25rem', barPx: 40, note: 'Comfortable padding' },
  { n: 6, px: 24, rem: '1.5rem', barPx: 52, note: 'Card padding, section inner' },
  { n: 7, px: 32, rem: '2rem', barPx: 72, note: 'Card padding large, section gap' },
  { n: 8, px: 40, rem: '2.5rem', barPx: 96, note: 'Large component gaps' },
  { n: 9, px: 48, rem: '3rem', barPx: 120, note: 'Section padding, touch targets', isDefault: true },
  { n: 10, px: 64, rem: '4rem', barPx: 160, note: 'Large section separation' },
  { n: 11, px: 80, rem: '5rem', barPx: 200, note: 'Page-level spacing' },
  { n: 12, px: 96, rem: '6rem', barPx: 240, note: 'Section separation' },
  { n: 13, px: 128, rem: '8rem', barPx: 320, note: 'Maximum section gap' },
];

const SEMANTIC_ALIASES: {
  alias: string;
  resolves: string;
  px: string;
  context: string;
}[] = [
  {
    alias: '--space-component-xs',
    resolves: '--space-2',
    px: '8px',
    context: 'Tight gaps inside dense components',
  },
  {
    alias: '--space-component-sm',
    resolves: '--space-3',
    px: '12px',
    context: 'Compact padding (sm buttons, badges)',
  },
  {
    alias: '--space-component-md',
    resolves: '--space-4',
    px: '16px',
    context: 'Standard component padding (default)',
  },
  {
    alias: '--space-component-lg',
    resolves: '--space-6',
    px: '24px',
    context: 'Comfortable component padding',
  },
  {
    alias: '--space-layout-sm',
    resolves: '--space-6',
    px: '24px',
    context: 'Small layout gaps between components',
  },
  {
    alias: '--space-layout-md',
    resolves: '--space-7',
    px: '32px',
    context: 'Standard layout gaps',
  },
  {
    alias: '--space-layout-lg',
    resolves: '--space-9',
    px: '48px',
    context: 'Section padding',
  },
  {
    alias: '--space-layout-xl',
    resolves: '--space-10',
    px: '64px',
    context: 'Large section separation',
  },
  {
    alias: '--space-page',
    resolves: '--space-11',
    px: '80px',
    context: 'Page-level vertical rhythm',
  },
];

const BREAKPOINT_ROWS: {
  bp: string;
  name: string;
  min: string;
  cols: string;
  gutter: string;
  margin: string;
  max: string;
}[] = [
  { bp: 'xs', name: 'Mobile', min: '0px', cols: '4', gutter: '16px', margin: '16px', max: '100%' },
  {
    bp: 'sm',
    name: 'Large mobile',
    min: '576px',
    cols: '4',
    gutter: '16px',
    margin: '24px',
    max: '100%',
  },
  {
    bp: 'md',
    name: 'Tablet',
    min: '768px',
    cols: '8',
    gutter: '24px',
    margin: '40px',
    max: '100%',
  },
  {
    bp: 'lg',
    name: 'Desktop',
    min: '1024px',
    cols: '12',
    gutter: '24px',
    margin: '56px',
    max: '1200px',
  },
  {
    bp: 'xl',
    name: 'Wide',
    min: '1280px',
    cols: '12',
    gutter: '32px',
    margin: 'auto',
    max: '1400px',
  },
];

const ANN = '#E8186D';

function SpaceRow({
  row,
  t,
  isLast,
  copied,
  onCopy,
}: {
  row: (typeof SPACE_ROWS)[number];
  t: VDSTheme;
  isLast: boolean;
  copied: string | null;
  onCopy: (token: string) => void;
}) {
  const token = `--space-${row.n}`;
  const visualToken = `space-${row.n}`;
  const isCopied = copied === token;
  return (
    <button
      type="button"
      onClick={() => onCopy(token)}
      style={{
        display: 'grid',
        gridTemplateColumns: '148px 1fr 60px 64px 180px',
        alignItems: 'center',
        gap: 16,
        height: 44,
        padding: '0 20px',
        borderBottom: isLast ? 'none' : `1px solid ${t.border.default.default}`,
        cursor: 'pointer',
        width: '100%',
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        background: 'transparent',
        fontFamily: 'inherit',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: 13,
          fontWeight: 600,
          color: t.text.brand.default,
        }}
      >
        {isCopied ? (
          <span style={{ color: t.text.success.default, fontSize: 11, fontWeight: 700 }}>Copied var({token})</span>
        ) : (
          <span>{visualToken}</span>
        )}
        {row.isDefault ? (
          <span style={vdsSuccessChipStyle(t)}>default</span>
        ) : null}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            height: 8,
            borderRadius: 0,
            background: t.bg.fill.primary.default,
            width: row.barPx,
            maxWidth: '100%',
          }}
        />
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: 13,
          fontWeight: 700,
          color: t.text.primary.default,
          textAlign: 'right',
        }}
      >
        {row.px}px
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: 11,
          color: t.text.tertiary.default,
          textAlign: 'right',
        }}
      >
        {row.rem}
      </div>
      <div
        style={{
          paddingLeft: 16,
          fontSize: 13,
          color: t.text.secondary.default,
          lineHeight: 1.4,
        }}
      >
        {row.note}
      </div>
    </button>
  );
}

export default function SpacingFoundationsPage() {
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const t = buildTheme(isDark);

  function copyToken(token: string) {
    const value = `var(${token})`;
    void navigator.clipboard.writeText(value);
    setCopied(token);
    setTimeout(() => setCopied(null), 1800);
  }

  const sectionLead: CSSProperties = {
    fontSize: 17,
    color: t.text.secondary.default,
    lineHeight: 1.6,
    maxWidth: 640,
    marginBottom: 24,
  };

  const sectionHeadingStyle: CSSProperties = { marginBottom: 8 };

  const dotted: CSSProperties = {
    backgroundColor: t.bg.surface.primary.default,
    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
  };
  const dottedStrong: CSSProperties = {
    backgroundColor: t.bg.surface.primary.default,
    backgroundImage: `radial-gradient(circle, ${t.border.strong.default} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
  };

  /* Grid influencers — shared mini-screen chrome (both cards) */
  const giMiniScreen: CSSProperties = {
    flex: 1,
    minWidth: 0,
    background: t.bg.surface.primary.default,
    border: `1.5px solid ${t.border.strong.default}`,
    borderRadius: 10,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  };
  const giMiniHeader: CSSProperties = {
    height: 18,
    background: t.bg.surface.tertiary.default,
    borderBottom: `1px solid ${t.border.default.default}`,
    flexShrink: 0,
  };
  const giMiniBody: CSSProperties = {
    flex: 1,
    display: 'flex',
    gap: 0,
    overflow: 'hidden',
    minHeight: 0,
  };
  const giBar: CSSProperties = {
    height: 5,
    background: t.bg.surface.tertiary.default,
    borderRadius: 2,
  };
  const giIllCaption: CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    color: t.text.secondary.default,
    textAlign: 'center',
    marginTop: 6,
  };
  const giColBadge: CSSProperties = {
    fontSize: 10,
    fontFamily: 'var(--font-mono), monospace',
    fontWeight: 700,
    color: t.text.brand.default,
    background: t.bg.fill.brandSubtle.default,
    padding: '2px 6px',
    borderRadius: 4,
    textAlign: 'center',
    width: 'fit-content',
    margin: '2px auto 0',
  };
  const giSidebarStrip: CSSProperties = {
    width: 26,
    minWidth: 26,
    background: t.bg.fill.brandSubtle.default,
    borderRight: `1.5px solid ${t.border.brand.default}`,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  };
  const giPanelStrip: CSSProperties = {
    width: 32,
    minWidth: 32,
    background: t.bg.fill.brandSubtle.default,
    borderLeft: `2px solid ${t.bg.fill.primary.default}`,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  };
  const giAnnLabel: CSSProperties = {
    fontSize: 8,
    fontFamily: 'var(--font-mono), monospace',
    color: ANN,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  };

  return (
    <>
      <p className="breadcrumb">Foundations</p>
      <h1 className="page-title">Spacing</h1>
      <p className="page-lead">
        Space is the invisible architecture of interface design. VDS uses an 8px-base scale that creates
        consistent rhythm, communicates hierarchy, and reduces decisions for designers and developers
        alike.
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <span className="page-badge">Stable</span>
        <span className="page-badge">v1.0</span>
      </div>

      <section id="philosophy" style={{ marginTop: 40, marginBottom: 64 }}>
        <div className="cards-grid-3">
          <div className="info-card">
            <div className="principle-icon" aria-hidden>
              <Ruler size={20} strokeWidth={1.5} color="var(--color-brand)" />
            </div>
            <div className="info-card-title">8px base unit</div>
            <p className="info-card-body">
              Every spacing value is a multiple of 4 or 8. This creates predictable rhythm, aligns with
              most device pixel densities, and makes developer implementation unambiguous.
            </p>
          </div>
          <div className="info-card">
            <div className="principle-icon" aria-hidden>
              <Layers size={20} strokeWidth={1.5} color="var(--color-brand)" />
            </div>
            <div className="info-card-title">Gestalt proximity</div>
            <p className="info-card-body">
              Elements near each other belong together. Elements far apart stand alone. Every spacing
              decision should reinforce — never contradict — this principle.
            </p>
          </div>
          <div className="info-card">
            <div className="principle-icon" aria-hidden>
              <Grid size={20} strokeWidth={1.5} color="var(--color-brand)" />
            </div>
            <div className="info-card-title">Scale, don&apos;t guess</div>
            <p className="info-card-body">
              Thirteen defined steps cover every use case from 4px (icon gaps) to 128px (page-level
              separation). If a value isn&apos;t on the scale, question whether it&apos;s needed.
            </p>
          </div>
        </div>
      </section>

      <section id="scale" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Spacing scale
        </h2>
        <p style={sectionLead}>
          Thirteen steps from 4px to 128px. Each step has a CSS custom property token, a rem value, and a
          named alias for semantic use where applicable.
        </p>
        <p style={{ fontSize: 13, color: t.text.tertiary.default, marginBottom: 16 }}>
          <MousePointerClick size={14} style={{ verticalAlign: 'text-bottom', marginRight: 6 }} />
          Click any row to copy <code style={{ fontSize: 12 }}>var(--space-n)</code> to the clipboard.
        </p>
        <div
          style={{
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 12,
            background: t.bg.surface.primary.default,
            overflow: 'hidden',
          }}
        >
          {SPACE_ROWS.map((row, i) => (
            <SpaceRow
              key={row.n}
              row={row}
              t={t}
              isLast={i === SPACE_ROWS.length - 1}
              copied={copied}
              onCopy={copyToken}
            />
          ))}
        </div>
      </section>

      <section id="aliases" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Semantic aliases
        </h2>
        <p style={sectionLead}>Named shortcuts for the most common spacing contexts.</p>
        <div
          style={{
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <table className="props-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Alias token</th>
                <th>Resolves to</th>
                <th>px</th>
                <th>Context</th>
              </tr>
            </thead>
            <tbody>
              {SEMANTIC_ALIASES.map((row) => (
                <tr key={row.alias}>
                  <td>
                    <code style={{ fontSize: 12, color: 'var(--color-brand-text)' }}>{row.alias}</code>
                  </td>
                  <td>
                    <code style={{ fontSize: 12 }}>{row.resolves}</code>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12 }}>{row.px}</td>
                  <td>{row.context}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="concepts" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Spacing concepts
        </h2>
        <p style={sectionLead}>Four primitives you will use in almost every layout.</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {[
            {
              title: 'Inset',
              desc: 'Equal padding on all sides. Used for card bodies, button padding, and any contained element that needs breathing room.',
              tokens: ['--space-component-md (16px)'],
              body: (
                <div
                  style={{
                    background: t.bg.surface.secondary.default,
                    height: 160,
                    padding: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="100%" height="112" viewBox="0 0 220 112" role="img" aria-label="Inset spacing">
                    <rect x="50" y="16" width="120" height="80" fill={t.bg.surface.primary.default} stroke={t.border.strong.default} strokeWidth="1.5" rx="10" />
                    <rect x="70" y="40" width="80" height="10" fill={t.bg.surface.tertiary.default} rx="3" />
                    <rect x="70" y="58" width="80" height="10" fill={t.bg.surface.tertiary.default} rx="3" />
                    <line x1="42" y1="16" x2="42" y2="96" stroke={ANN} strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1="178" y1="16" x2="178" y2="96" stroke={ANN} strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1="50" y1="8" x2="170" y2="8" stroke={ANN} strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1="50" y1="104" x2="170" y2="104" stroke={ANN} strokeWidth="1.5" strokeDasharray="4 3" />
                  </svg>
                </div>
              ),
            },
            {
              title: 'Inset squish',
              desc: 'Horizontal padding larger than vertical. Used for buttons and tags where width > height is intentional.',
              tokens: ['Vertical --space-2 (8px)', 'Horizontal --space-4 (16px)'],
              body: (
                <div
                  style={{
                    background: t.bg.surface.secondary.default,
                    height: 160,
                    padding: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="100%" height="112" viewBox="0 0 220 112" role="img" aria-label="Inset squish spacing">
                    <rect x="40" y="30" width="140" height="52" fill={t.bg.surface.primary.default} stroke={t.border.strong.default} strokeWidth="1.5" rx="10" />
                    <rect x="70" y="44" width="80" height="8" fill={t.bg.surface.tertiary.default} rx="3" />
                    <rect x="70" y="60" width="80" height="8" fill={t.bg.surface.tertiary.default} rx="3" />
                    <line x1="28" y1="30" x2="28" y2="82" stroke={ANN} strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1="192" y1="30" x2="192" y2="82" stroke={ANN} strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1="40" y1="18" x2="180" y2="18" stroke={ANN} strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1="40" y1="94" x2="180" y2="94" stroke={ANN} strokeWidth="1.5" strokeDasharray="4 3" />
                  </svg>
                </div>
              ),
            },
            {
              title: 'Stack',
              desc: 'Vertical spacing between related elements. Closer = more related.',
              tokens: ['--space-3 (12px)', '--space-4 (16px)'],
              body: (
                <div
                  style={{
                    background: t.bg.surface.secondary.default,
                    height: 160,
                    padding: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="100%" height="112" viewBox="0 0 220 164" role="img" aria-label="Stack spacing">
                    <rect x="10" y="10" width="200" height="40" fill={t.bg.surface.primary.default} stroke={t.border.strong.default} strokeWidth="1.5" rx="10" />
                    <rect x="10" y="62" width="200" height="40" fill={t.bg.surface.primary.default} stroke={t.border.strong.default} strokeWidth="1.5" rx="10" />
                    <rect x="10" y="114" width="200" height="40" fill={t.bg.surface.primary.default} stroke={t.border.strong.default} strokeWidth="1.5" rx="10" />
                    <line x1="190" y1="50" x2="190" y2="62" stroke={ANN} strokeWidth="1.5" />
                    <polygon points="190,50 186,55 194,55" fill={ANN} />
                    <polygon points="190,62 186,57 194,57" fill={ANN} />
                    <line x1="190" y1="102" x2="190" y2="114" stroke={ANN} strokeWidth="1.5" />
                    <polygon points="190,102 186,107 194,107" fill={ANN} />
                    <polygon points="190,114 186,109 194,109" fill={ANN} />
                    <text x="198" y="59" fill={ANN} fontSize="11" fontFamily="monospace">12px</text>
                    <text x="198" y="111" fill={ANN} fontSize="11" fontFamily="monospace">12px</text>
                  </svg>
                </div>
              ),
            },
            {
              title: 'Inline',
              desc: 'Horizontal spacing between elements in a row — icon + label, button group.',
              tokens: ['--space-2 (8px)'],
              body: (
                <div
                  style={{
                    background: t.bg.surface.secondary.default,
                    height: 160,
                    padding: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="100%" height="112" viewBox="0 0 220 112" role="img" aria-label="Inline spacing">
                    <rect x="8" y="30" width="52" height="52" fill={t.bg.surface.primary.default} stroke={t.border.strong.default} strokeWidth="1.5" rx="10" />
                    <rect x="84" y="30" width="52" height="52" fill={t.bg.surface.primary.default} stroke={t.border.strong.default} strokeWidth="1.5" rx="10" />
                    <rect x="160" y="30" width="52" height="52" fill={t.bg.surface.primary.default} stroke={t.border.strong.default} strokeWidth="1.5" rx="10" />
                    <line x1="60" y1="56" x2="84" y2="56" stroke={ANN} strokeWidth="1.5" />
                    <polygon points="60,56 65,53 65,59" fill={ANN} />
                    <polygon points="84,56 79,53 79,59" fill={ANN} />
                    <line x1="136" y1="56" x2="160" y2="56" stroke={ANN} strokeWidth="1.5" />
                    <polygon points="136,56 141,53 141,59" fill={ANN} />
                    <polygon points="160,56 155,53 155,59" fill={ANN} />
                    <text x="72" y="24" textAnchor="middle" fill={ANN} fontSize="11" fontFamily="monospace">8px</text>
                    <text x="148" y="24" textAnchor="middle" fill={ANN} fontSize="11" fontFamily="monospace">8px</text>
                  </svg>
                </div>
              ),
            },
          ].map((c) => (
            <div
              key={c.title}
              style={{
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 14,
                overflow: 'hidden',
                background: t.bg.surface.primary.default,
              }}
            >
              {c.body}
              <div style={{ padding: '20px 20px 24px', borderTop: `1px solid ${t.border.default.default}` }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                  {c.title}
                </div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '0 0 14px' }}>
                  {c.desc}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {c.tokens.map((token) => (
                    <span key={token} style={vdsTokenChipStyle(t)}>
                      {token}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="components" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Component spacing reference
        </h2>
        <p style={sectionLead}>How spacing tokens map to common UI patterns.</p>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, margin: '28px 0 12px' }}>
          Buttons
        </h3>
        <div
          style={{
            ...dotted,
            borderRadius: 14,
            padding: '32px 24px',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
            {[
              { label: 'SM', h: 32, px: 12, font: 13 },
              { label: 'MD', h: 40, px: 16, font: 14 },
              { label: 'LG', h: 48, px: 20, font: 15 },
            ].map((b) => (
              <div key={b.label} style={{ position: 'relative' }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: t.text.tertiary.default,
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                  }}
                >
                  {b.label}
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div
                    style={{
                      height: b.h,
                      padding: `0 ${b.px}px`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: t.bg.fill.primary.default,
                      color: t.text.inverse.default,
                      borderRadius: 8,
                      fontSize: b.font,
                      fontWeight: 700,
                    }}
                  >
                    Button
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: -14,
                      height: 10,
                      borderBottom: `2px dashed ${ANN}`,
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -30,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 10,
                      fontWeight: 700,
                      color: ANN,
                      fontFamily: 'var(--font-mono), monospace',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {b.px}px H
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="props-table-wrap">
          <table className="props-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Height</th>
                <th>H. padding</th>
                <th>Font</th>
                <th>Token</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>SM</td>
                <td>32px</td>
                <td>12px</td>
                <td>13px</td>
                <td>
                  <code>--space-3</code> / <code>--space-component-sm</code>
                </td>
              </tr>
              <tr>
                <td>MD</td>
                <td>40px</td>
                <td>16px</td>
                <td>14px</td>
                <td>
                  <code>--space-4</code> / <code>--space-component-md</code>
                </td>
              </tr>
              <tr>
                <td>LG</td>
                <td>48px</td>
                <td>20px</td>
                <td>15px</td>
                <td>
                  <code>--space-5</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, margin: '32px 0 12px' }}>
          Cards
        </h3>
        <div
          style={{
            ...dotted,
            borderRadius: 14,
            padding: '32px 24px',
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: 280,
              margin: '0 auto',
              padding: 24,
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 12,
              boxShadow: t.shadow.card,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
              Project summary
            </div>
            <p style={{ fontSize: 13, color: t.text.secondary.default, margin: 0, lineHeight: 1.5 }}>
              Padding keeps content away from edges so the card can breathe.
            </p>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                border: `2px dashed ${ANN}`,
                borderRadius: 12,
                pointerEvents: 'none',
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: -22,
                right: 0,
                fontSize: 10,
                fontWeight: 700,
                color: ANN,
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              --space-6 (24px)
            </span>
          </div>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, margin: '40px 0 12px' }}>
          Layout
        </h3>
        <div
          style={{
            background: t.bg.surface.secondary.default,
            borderRadius: 12,
            border: `1px solid ${t.border.default.default}`,
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: 44,
              background: t.bg.surface.primary.default,
              borderBottom: `1px solid ${t.border.default.default}`,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 16,
              paddingRight: 16,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: t.text.tertiary.default }}>Header</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: 600,
                color: '#FFFFFF',
                background: ANN,
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              60px
            </span>
          </div>
          <div style={{ display: 'flex', minHeight: 200 }}>
            <div
              style={{
                width: 180,
                minWidth: 180,
                background: t.bg.surface.primary.default,
                borderRight: `1px solid ${t.border.default.default}`,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 11, color: t.text.tertiary.default }}>Sidebar</div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: ANN,
                  padding: '2px 8px',
                  borderRadius: 4,
                  width: 'fit-content',
                }}
              >
                260px
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <div style={{ height: 8, background: t.bg.surface.tertiary.default, borderRadius: 3, width: '80%' }} />
                <div style={{ height: 8, background: t.bg.surface.tertiary.default, borderRadius: 3, width: '60%' }} />
                <div style={{ height: 8, background: t.bg.surface.tertiary.default, borderRadius: 3, width: '70%' }} />
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: t.bg.surface.secondary.default,
                padding: '32px 40px',
                position: 'relative',
                minWidth: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: ANN,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                48px
              </span>
              <span
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: ANN,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                56px
              </span>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 8,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ height: 8, background: t.bg.surface.tertiary.default, borderRadius: 3, width: '90%' }} />
                <div style={{ height: 8, background: t.bg.surface.tertiary.default, borderRadius: 3, width: '75%' }} />
                <div style={{ height: 8, background: t.bg.surface.tertiary.default, borderRadius: 3, width: '55%' }} />
              </div>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: t.text.tertiary.default, marginTop: 10, marginBottom: 0 }}>
          Docs shell: fixed header 60px · sidebar 260px · main padding 48px × 56px
        </p>
      </section>

      <section id="responsive" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Responsive spacing
        </h2>
        <p style={sectionLead}>Breakpoints define columns, gutters, and outer margins.</p>
        <div className="props-table-wrap">
          <table className="props-table">
            <thead>
              <tr>
                <th>Breakpoint</th>
                <th>Name</th>
                <th>Min width</th>
                <th>Columns</th>
                <th>Gutter</th>
                <th>Margin</th>
                <th>Max content</th>
              </tr>
            </thead>
            <tbody>
              {BREAKPOINT_ROWS.map((r) => (
                <tr key={r.bp}>
                  <td>
                    <code>{r.bp}</code>
                  </td>
                  <td>{r.name}</td>
                  <td>{r.min}</td>
                  <td>{r.cols}</td>
                  <td>{r.gutter}</td>
                  <td>{r.margin}</td>
                  <td>{r.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout variant="info" title="Jump one step at breakpoints">
          If a component uses <code>--space-6</code> (24px) at desktop, use <code>--space-4</code> (16px) at
          mobile. Step down the scale instead of inventing new numbers.
        </Callout>
      </section>

      <section id="usage" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Usage
        </h2>
        <p style={sectionLead}>Apply spacing to support intent, hierarchy, and responsive rhythm.</p>

        <section id="fit-for-purpose" style={{ marginBottom: 56 }}>
          <h2 className="section-title" style={sectionHeadingStyle}>Fit for purpose</h2>
          <p style={sectionLead}>
            Every layout begins with a question: what story does this page tell, and what action should the
            user take? The grid and spacing system exist to serve that story - not the other way around.
            Start with content goals, then apply the system.
          </p>
          <div className="cards-grid-3">
            <div className="info-card">
              <div className="principle-icon" aria-hidden><MousePointerClick size={20} strokeWidth={1.5} color="var(--color-brand)" /></div>
              <div className="info-card-title">Start with the goal</div>
              <p className="info-card-body">
                Define the user&apos;s task first. A checkout form, a data dashboard, and a content feed all
                require different spacing densities and column configurations. The spacing system adapts to
                purpose - not the reverse.
              </p>
            </div>
            <div className="info-card">
              <div className="principle-icon" aria-hidden><Layers size={20} strokeWidth={1.5} color="var(--color-brand)" /></div>
              <div className="info-card-title">Match density to context</div>
              <p className="info-card-body">
                Reading-heavy experiences need generous spacing and breathing room. Task-heavy interfaces can
                compress space to show more context. Use Comfortable, Default, and Compact density based on mode.
              </p>
            </div>
            <div className="info-card">
              <div className="principle-icon" aria-hidden><AlignHorizontalSpaceAround size={20} strokeWidth={1.5} color="var(--color-brand)" /></div>
              <div className="info-card-title">Reinforce, never decorate</div>
              <p className="info-card-body">
                Spacing communicates relationships. Elements close together belong together. Elements far apart
                stand alone. Add space to strengthen hierarchy, never just to &quot;make it look better&quot;.
              </p>
            </div>
          </div>
        </section>

        <section id="content-hierarchy" style={{ marginBottom: 56 }}>
          <h2 className="section-title" style={sectionHeadingStyle}>Content hierarchy</h2>
          <p style={sectionLead}>
            Thoughtful spacing is the invisible scaffolding of a good layout. Size, proximity, and alignment let
            users build a mental model without reading every label.
          </p>
          <h3 style={{ fontSize: 18, marginBottom: 12, color: t.text.primary.default }}>Gestalt proximity</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 24,
            }}
          >
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
                  height: 200,
                  background: t.bg.surface.secondary.default,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 24,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 16,
                    fontSize: 13,
                    fontWeight: 600,
                    color: t.text.success.default,
                  }}
                >
                  ✓ Related items grouped
                </span>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
                    <div
                      style={{
                        width: 56,
                        height: 36,
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 8,
                      }}
                    />
                    <div
                      style={{
                        width: 56,
                        height: 36,
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 8,
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        left: '100%',
                        marginLeft: 8,
                        top: 39,
                        transform: 'translateY(-50%)',
                        fontSize: 12,
                        fontFamily: 'monospace',
                        color: ANN,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      6px
                    </span>
                  </div>
                  <div
                    style={{
                      width: 24,
                      alignSelf: 'stretch',
                      minHeight: 78,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 24,
                      marginRight: 24,
                      position: 'relative',
                    }}
                  >
                    <div style={{ width: 0, flex: 1, borderLeft: `1.5px dashed ${ANN}`, minHeight: 40 }} />
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: 'monospace',
                        color: ANN,
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    >
                      24px
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div
                      style={{
                        width: 56,
                        height: 36,
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 8,
                      }}
                    />
                    <div
                      style={{
                        width: 56,
                        height: 36,
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 8,
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 24 }}>
                    <div
                      style={{
                        width: 56,
                        height: 36,
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 8,
                      }}
                    />
                    <div
                      style={{
                        width: 56,
                        height: 36,
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 8,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                  Tight inner, loose outer
                </div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                  Small gaps (6px) bind elements into groups. Large gaps (24px) separate those groups. The eye reads
                  structure without reading labels.
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
                  height: 200,
                  background: t.bg.surface.secondary.default,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 24,
                  position: 'relative',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 16,
                    fontSize: 13,
                    fontWeight: 600,
                    color: ANN,
                  }}
                >
                  ✗ Equal spacing, no groups
                </span>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 56,
                        height: 36,
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 8,
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: ANN, fontWeight: 600 }}>all gaps 12px</span>
              </div>
              <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                  Uniform spacing, no hierarchy
                </div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                  When every gap is equal, nothing reads as grouped. Users must read every label to understand
                  relationships between elements.
                </p>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: 18, marginBottom: 6, color: t.text.primary.default }}>Basic scaffolding</h3>
          <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 14 }}>
            These three layout patterns cover most VDS screens.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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
                  height: 240,
                  background: t.bg.surface.secondary.default,
                  padding: 16,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 8,
                    fontSize: 9,
                    color: '#E8186D',
                    fontFamily: 'monospace',
                  }}
                >
                  Header · 60px
                </span>
                <div
                  style={{
                    height: 28,
                    width: '100%',
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 6,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 8,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.bg.fill.primary.default }} />
                  <div
                    style={{
                      width: 60,
                      height: 6,
                      background: t.bg.surface.tertiary.default,
                      borderRadius: 3,
                      marginLeft: 6,
                    }}
                  />
                </div>
                <span
                  style={{
                    position: 'absolute',
                    left: 16,
                    bottom: 16,
                    fontSize: 9,
                    fontFamily: 'monospace',
                    color: '#E8186D',
                    whiteSpace: 'nowrap',
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'left bottom',
                  }}
                >
                  Sidebar · 260px
                </span>
                <div style={{ display: 'flex', gap: 8, flex: 1, minHeight: 0 }}>
                  <div
                    style={{
                      width: 52,
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 6,
                      padding: '8px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                      flexShrink: 0,
                    }}
                  >
                    {[85, 65, 75, 55, 70].map((pct, i) => (
                      <div
                        key={i}
                        style={{
                          height: 5,
                          background: t.bg.surface.tertiary.default,
                          borderRadius: 2,
                          width: `${pct}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 6,
                      padding: 10,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        height: 8,
                        width: '70%',
                        background: t.bg.fill.primary.default,
                        opacity: 0.4,
                        borderRadius: 2,
                        marginBottom: 8,
                      }}
                    />
                    {[100, 90, 95, 60].map((w, i) => (
                      <div
                        key={i}
                        style={{
                          height: 5,
                          background: t.bg.surface.tertiary.default,
                          borderRadius: 2,
                          marginBottom: 5,
                          width: `${w}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      width: 32,
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 6,
                      padding: '8px 5px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    {[90, 70, 80, 60].map((w, i) => (
                      <div
                        key={i}
                        style={{
                          height: 4,
                          background: t.bg.surface.tertiary.default,
                          borderRadius: 2,
                          width: `${w}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 16px', borderTop: `1px solid ${t.border.default.default}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>Product &amp; docs</div>
                <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 4 }}>
                  Fixed sidebar, TOC, max-width content. Used by VDS docs.
                </div>
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
                  height: 240,
                  background: t.bg.surface.secondary.default,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                }}
              >
                <div
                  style={{
                    height: 28,
                    width: '100%',
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 6,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 8,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.bg.fill.primary.default }} />
                  <div
                    style={{
                      width: 60,
                      height: 6,
                      background: t.bg.surface.tertiary.default,
                      borderRadius: 3,
                      marginLeft: 6,
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 4,
                    flex: 1,
                    marginTop: 8,
                    minHeight: 0,
                  }}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: t.bg.surface.primary.default,
                        border: `1px solid ${t.border.default.default}`,
                        borderRadius: 6,
                        padding: 7,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div
                        style={{
                          height: 20,
                          background: t.bg.surface.tertiary.default,
                          borderRadius: 3,
                          marginBottom: 5,
                        }}
                      />
                      <div style={{ height: 4, background: t.bg.surface.tertiary.default, borderRadius: 2, marginBottom: 4 }} />
                      <div style={{ height: 4, background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '14px 16px', borderTop: `1px solid ${t.border.default.default}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>High-density interface</div>
                <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 4 }}>
                  Full-width grid, no sidebar. Used for dashboards, catalogs, data-heavy screens.
                </div>
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
                  height: 240,
                  background: t.bg.surface.secondary.default,
                  padding: 16,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                }}
              >
                <div
                  style={{
                    height: 28,
                    width: '100%',
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 6,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 8,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.bg.fill.primary.default }} />
                  <div
                    style={{
                      width: 60,
                      height: 6,
                      background: t.bg.surface.tertiary.default,
                      borderRadius: 3,
                      marginLeft: 6,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flex: 1, minHeight: 0 }}>
                  <div
                    style={{
                      position: 'relative',
                      width: 20,
                      background: t.bg.surface.tertiary.default,
                      borderRadius: 4,
                      opacity: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-90deg)',
                        fontSize: 9,
                        color: '#E8186D',
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      auto margin
                    </span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 6,
                      padding: 10,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        height: 10,
                        width: '55%',
                        background: t.bg.surface.tertiary.default,
                        borderRadius: 2,
                        marginBottom: 10,
                      }}
                    />
                    <div
                      style={{
                        height: 50,
                        width: '100%',
                        background: t.bg.surface.tertiary.default,
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                    {[100, 95, 100, 88, 55].map((w, i) => (
                      <div
                        key={i}
                        style={{
                          height: 4,
                          background: t.bg.surface.tertiary.default,
                          borderRadius: 2,
                          marginBottom: 5,
                          width: `${w}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      width: 20,
                      background: t.bg.surface.tertiary.default,
                      borderRadius: 4,
                      opacity: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-90deg)',
                        fontSize: 9,
                        color: '#E8186D',
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      auto margin
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 16px', borderTop: `1px solid ${t.border.default.default}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>Centered editorial</div>
                <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 4 }}>
                  Auto margins center content. Used for marketing pages, articles, landing pages.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="layout-structure" style={{ marginBottom: 56 }}>
          <h2 className="section-title" style={sectionHeadingStyle}>Layout structure</h2>
          <p style={sectionLead}>
            Every VDS layout is built on columns, gutters, and margins. Their balance at each breakpoint creates
            predictable responsive behavior.
          </p>
          <div
            style={{
              background: t.bg.surface.secondary.default,
              borderRadius: 14,
              border: `1px solid ${t.border.default.default}`,
              padding: '32px 24px 24px',
              position: 'relative',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                paddingLeft: 24,
                paddingRight: 24,
                position: 'absolute',
                top: -22,
                left: 0,
                pointerEvents: 'none',
              }}
            >
              <div style={{ position: 'relative', fontSize: 10, fontFamily: 'monospace', color: '#E8186D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                Column
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '100%', width: 1, height: 12, background: '#E8186D', opacity: 0.5 }} />
              </div>
              <div style={{ position: 'relative', fontSize: 10, fontFamily: 'monospace', color: '#E8186D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                Gutter · 8px
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '100%', width: 1, height: 12, background: '#E8186D', opacity: 0.5 }} />
              </div>
              <div style={{ position: 'relative', fontSize: 10, fontFamily: 'monospace', color: '#E8186D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                Margin · 56px
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '100%', width: 1, height: 12, background: '#E8186D', opacity: 0.5 }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, height: 120 }}>
              <div
                style={{
                  width: 48,
                  minWidth: 48,
                  background: 'rgba(232,24,109,0.08)',
                  border: '1px solid rgba(232,24,109,0.2)',
                  borderRight: 'none',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-90deg)',
                    whiteSpace: 'nowrap',
                    fontSize: 9,
                    fontFamily: 'monospace',
                    color: '#E8186D',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                  }}
                >
                  Margin
                </span>
              </div>

              <div style={{ flex: 1, display: 'flex', gap: 0 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        flex: 1,
                        background: isDark ? 'rgba(21,101,168,0.15)' : 'rgba(0,43,73,0.10)',
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: 9,
                          color: t.text.brand.default,
                          fontFamily: 'monospace',
                          opacity: 0.7,
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    {i < 11 ? <div style={{ width: 8, minWidth: 8, background: t.bg.surface.secondary.default }} /> : null}
                  </div>
                ))}
              </div>

              <div
                style={{
                  width: 48,
                  minWidth: 48,
                  background: 'rgba(232,24,109,0.08)',
                  border: '1px solid rgba(232,24,109,0.2)',
                  borderLeft: 'none',
                  borderRight: '1px solid rgba(232,24,109,0.2)',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-90deg)',
                    whiteSpace: 'nowrap',
                    fontSize: 9,
                    fontFamily: 'monospace',
                    color: '#E8186D',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                  }}
                >
                  Margin
                </span>
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '84%', height: 1, background: 'rgba(232,24,109,0.25)' }} />
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#E8186D', fontWeight: 600 }}>
                Max content · 1200px
              </div>
              <div style={{ width: '100%', height: 1, background: 'rgba(232,24,109,0.25)' }} />
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#E8186D', fontWeight: 600, opacity: 0.6 }}>
                Viewport
              </div>
            </div>
          </div>
          <div className="props-table-wrap" style={{ marginBottom: 14 }}>
            <table className="props-table">
              <thead>
                <tr><th>BREAKPOINT</th><th>NAME</th><th>MIN WIDTH</th><th>COLUMNS</th><th>GUTTER</th><th>MARGIN</th><th>MAX CONTENT</th></tr>
              </thead>
              <tbody>
                {BREAKPOINT_ROWS.map((r) => (
                  <tr key={r.bp}>
                    <td><code>{r.bp}</code></td>
                    <td>
                      {r.name}
                      {r.bp === 'lg' ? (
                        <span style={{ marginLeft: 8, ...vdsSuccessChipStyle(t) }}>Default</span>
                      ) : null}
                    </td>
                    <td>{r.min}</td><td>{r.cols}</td><td>{r.gutter}</td><td>{r.margin}</td><td>{r.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: 'flex',
              borderRadius: 12,
              border: `1px solid ${t.border.default.default}`,
              overflow: 'hidden',
              height: 72,
              width: '100%',
            }}
          >
            {(
              [
                {
                  key: 'xs',
                  flex: 0.8,
                  bg: t.bg.surface.secondary.default,
                  narrow: true,
                  name: 'xs',
                  range: '0–575px',
                  col: '4col',
                },
                {
                  key: 'sm',
                  flex: 0.9,
                  bg: t.bg.surface.secondary.default,
                  narrow: true,
                  name: 'sm',
                  range: '576–767px',
                  col: '4col',
                },
                {
                  key: 'md',
                  flex: 1.4,
                  bg: t.bg.surface.tertiary.default,
                  narrow: false,
                  name: 'md',
                  range: '768–1023px',
                  col: '8col',
                },
                {
                  key: 'lg',
                  flex: 2.4,
                  bg: isDark ? 'rgba(21,101,168,0.12)' : 'rgba(0,43,73,0.08)',
                  narrow: false,
                  name: 'lg',
                  range: '1024–1279px',
                  col: '12col',
                },
                {
                  key: 'xl',
                  flex: 2.5,
                  bg: isDark ? 'rgba(21,101,168,0.18)' : 'rgba(0,43,73,0.13)',
                  narrow: false,
                  name: 'xl',
                  range: '1280px+',
                  col: '12col',
                },
              ] as const
            ).map((s, i, arr) => (
              <div
                key={s.key}
                style={{
                  flex: s.flex,
                  minWidth: 0,
                  background: s.bg,
                  borderRight: i < arr.length - 1 ? `1px solid ${t.border.default.default}` : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '0 14px',
                  height: '100%',
                  gap: 5,
                }}
              >
                {s.narrow ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default, fontFamily: 'inherit' }}>
                      {s.name}
                    </span>
                    <span style={{ fontSize: 11, color: t.text.secondary.default, fontFamily: 'inherit' }}>{s.range}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default, fontFamily: 'inherit' }}>
                      {s.name}
                    </span>
                    <span style={{ fontSize: 11, color: t.text.secondary.default, fontFamily: 'inherit' }}>{s.range}</span>
                  </div>
                )}
                <span style={vdsSuccessChipStyle(t)}>{s.col}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="gutter-modes" style={{ marginBottom: 56 }}>
          <h2 className="section-title" style={sectionHeadingStyle}>Gutter modes</h2>
          <p style={sectionLead}>
            VDS supports three gutter modes. The mode determines how containers relate to the grid and whether
            components hang into gutters.
          </p>
          <Callout variant="info" title="Default is Wide">
            Use Wide mode for all new layouts unless you have a specific reason to switch. It is the safest choice
            for form-heavy interfaces and text-heavy content.
          </Callout>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
              <div
                style={{
                  height: 200,
                  background: t.bg.surface.secondary.default,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0 }}>
                  {[0, 1, 2].map((k) => (
                    <div
                      key={k}
                      style={{
                        flex: 1,
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 10,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        minWidth: 0,
                      }}
                    >
                      <div style={{ height: 6, width: '100%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                      <div style={{ height: 6, width: '80%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                      <div style={{ height: 6, width: '60%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(232,24,109,0.25)' }} />
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#E8186D', fontWeight: 700 }}>gutter · 24px</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(232,24,109,0.25)' }} />
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Wide · default</div>
                <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 4, marginBottom: 12 }}>
                  24px gutters · content stays within columns
                </div>
                <div style={{ height: 1, background: t.border.default.default, marginBottom: 12 }} />
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: t.text.tertiary.default,
                    marginBottom: 6,
                  }}
                >
                  When to use
                </div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '0 0 12px' }}>
                  Text-heavy pages, forms, and navigation. Fixed components like inputs and dropdowns must always use Wide
                  mode.
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['✓ Text content', '✓ Form fields', '✓ Nav lists'].map((c) => (
                    <span key={c} style={vdsSuccessChipStyle(t)}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
              <div
                style={{
                  height: 200,
                  background: t.bg.surface.secondary.default,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  position: 'relative',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0, position: 'relative' }}>
                  <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                    <div
                      style={{
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 10,
                        padding: 10,
                        marginRight: -8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <div style={{ height: 6, width: '100%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                      <div style={{ height: 6, width: '80%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                      <div style={{ height: 6, width: '60%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                    </div>
                    <span
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: -1,
                        transform: 'translate(50%, -50%)',
                        fontSize: 9,
                        fontFamily: 'monospace',
                        color: '#E8186D',
                        fontWeight: 700,
                        background: t.bg.surface.secondary.default,
                        padding: '1px 4px',
                        borderRadius: 3,
                        border: '1px solid rgba(232,24,109,0.3)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      −8px
                    </span>
                  </div>
                  {[0, 1].map((k) => (
                    <div
                      key={k}
                      style={{
                        flex: 1,
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 10,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        minWidth: 0,
                      }}
                    >
                      <div style={{ height: 6, width: '100%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                      <div style={{ height: 6, width: '80%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                      <div style={{ height: 6, width: '60%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(232,24,109,0.25)' }} />
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#E8186D', fontWeight: 700 }}>gutter · 16px</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(232,24,109,0.25)' }} />
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Narrow</div>
                <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 4, marginBottom: 12 }}>
                  16px gutters · container hangs into gutter
                </div>
                <div style={{ height: 1, background: t.border.default.default, marginBottom: 12 }} />
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '0 0 12px' }}>
                  Product interfaces and data tables where tighter alignment is needed. Headings outside containers align
                  with text inside components.
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['✓ Product UI', '✓ Data tables', '✓ Card grids'].map((c) => (
                    <span key={c} style={vdsSuccessChipStyle(t)}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
              <div
                style={{
                  height: 200,
                  background: t.bg.surface.secondary.default,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 1,
                    flex: 1,
                    minHeight: 0,
                    background: t.border.strong.default,
                  }}
                >
                  {[0, 1, 2].map((k) => (
                    <div
                      key={k}
                      style={{
                        flex: 1,
                        background: t.bg.surface.primary.default,
                        border: `1px solid ${t.border.default.default}`,
                        borderRadius: 0,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          height: 32,
                          background: t.bg.surface.tertiary.default,
                          borderRadius: 4,
                          marginBottom: 4,
                        }}
                      />
                      <div style={{ height: 5, width: '100%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                      <div style={{ height: 5, width: '70%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(232,24,109,0.25)' }} />
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#E8186D', fontWeight: 700 }}>gutter · 1px</span>
                  <span style={{ fontSize: 9, color: t.text.tertiary.default }}>border required on tiles</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(232,24,109,0.25)' }} />
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Condensed</div>
                <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 4, marginBottom: 12 }}>
                  1px gutters · tiles require explicit border
                </div>
                <div style={{ height: 1, background: t.border.default.default, marginBottom: 12 }} />
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '0 0 12px' }}>
                  Dashboards, catalogs, and overview pages where tiles form a unified whole. Never use with form fields or
                  labeled inputs.
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['✓ Dashboards', '✓ Catalogs', '✓ Feature grids'].map((c) => (
                    <span key={c} style={vdsSuccessChipStyle(t)}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <h3 style={{ fontSize: 18, margin: '24px 0 8px', color: t.text.primary.default }}>Mixing gutter modes</h3>
          <p style={{ fontSize: 14, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 10 }}>
            A page can use Wide for forms and Narrow for card grids. The rule: type never hangs into the gutter.
          </p>
          <div
            style={{
              background: t.bg.surface.secondary.default,
              borderRadius: 14,
              border: `1px solid ${t.border.default.default}`,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 10,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: t.text.tertiary.default }}>
                  Wide zone
                </span>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#E8186D', fontWeight: 700 }}>gutter · 24px</span>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 36,
                      background: t.bg.surface.secondary.default,
                      border: `1.5px solid ${t.border.strong.default}`,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 10,
                      gap: 6,
                    }}
                  >
                    <div style={{ width: '40%', height: 6, background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, borderTop: `1px dashed ${t.border.default.default}` }} />
              <span style={vdsSuccessChipStyle(t)}>zone boundary</span>
              <div style={{ flex: 1, height: 1, borderTop: `1px dashed ${t.border.default.default}` }} />
            </div>
            <div
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 10,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: t.text.tertiary.default }}>
                  Narrow zone
                </span>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#E8186D', fontWeight: 700 }}>gutter · 16px</span>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      background: t.bg.surface.secondary.default,
                      border: `1.5px solid ${t.border.strong.default}`,
                      borderRadius: 10,
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ height: 28, background: t.bg.surface.tertiary.default, borderRadius: 4, marginBottom: 2 }} />
                    <div style={{ height: 5, width: '100%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                    <div style={{ height: 5, width: '65%', background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 12, color: t.text.tertiary.default, margin: '8px 0 0', textAlign: 'center' }}>
              Same page · two gutter modes · type never hangs into the gutter
            </p>
          </div>
        </section>

        <section id="responsive" style={{ marginBottom: 56 }}>
          <h2 className="section-title" style={sectionHeadingStyle}>Responsive behavior</h2>
          <p style={sectionLead}>
            Layouts shift at breakpoints by stepping spacing down one level and reducing active columns as screens narrow.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
              <div
                style={{
                  height: 160,
                  background: t.bg.surface.secondary.default,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 16,
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 4, width: '44%' }}>
                    <div style={{ width: 6, background: 'rgba(232,24,109,0.15)', borderRadius: 2 }} />
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} style={{ flex: 1, height: 52, background: t.bg.surface.primary.default, border: `1.5px solid ${t.border.strong.default}`, borderRadius: 6 }} />
                    ))}
                    <div style={{ width: 6, background: 'rgba(232,24,109,0.15)', borderRadius: 2 }} />
                  </div>
                  <span style={{ color: '#E8186D', fontSize: 14, fontWeight: 700 }}>→</span>
                  <div style={{ display: 'flex', gap: 4, width: '44%' }}>
                    <div style={{ width: 6, background: 'rgba(232,24,109,0.15)', borderRadius: 2 }} />
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} style={{ flex: 1, height: 52, background: t.bg.surface.primary.default, border: `1.5px solid ${t.border.strong.default}`, borderRadius: 6 }} />
                    ))}
                    <div style={{ width: 6, background: 'rgba(232,24,109,0.15)', borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#E8186D', textAlign: 'center' }}>margins · fixed</div>
              </div>
              <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 13, color: t.text.secondary.default }}>Columns scale with viewport. Margins stay fixed.</div>
                <div style={{ height: 1, background: t.border.default.default, margin: '4px 0' }} />
                <span style={vdsSuccessChipStyle(t)}>VDS uses fluid</span>
              </div>
            </div>
            <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
              <div
                style={{
                  height: 160,
                  background: t.bg.surface.secondary.default,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 16,
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 4, width: '44%' }}>
                    <div style={{ width: 6, background: 'rgba(232,24,109,0.15)', borderRadius: 2 }} />
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} style={{ flex: 1, height: 52, background: t.bg.surface.primary.default, border: `1.5px solid ${t.border.strong.default}`, borderRadius: 6 }} />
                    ))}
                    <div style={{ width: 6, background: 'rgba(232,24,109,0.15)', borderRadius: 2 }} />
                  </div>
                  <span style={{ color: '#E8186D', fontSize: 14, fontWeight: 700 }}>→</span>
                  <div style={{ display: 'flex', gap: 4, width: '44%' }}>
                    <div style={{ width: 18, background: 'rgba(232,24,109,0.25)', borderRadius: 2 }} />
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} style={{ width: 26, height: 52, background: t.bg.surface.primary.default, border: `1.5px solid ${t.border.strong.default}`, borderRadius: 6 }} />
                    ))}
                    <div style={{ width: 18, background: 'rgba(232,24,109,0.25)', borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#E8186D', textAlign: 'center' }}>columns · fixed</div>
              </div>
              <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 13, color: t.text.secondary.default }}>Columns keep px widths. Margins absorb viewport changes.</div>
                <div style={{ height: 1, background: t.border.default.default, margin: '4px 0' }} />
                <span style={vdsSuccessChipStyle(t)}>Use for modals / overlays</span>
              </div>
            </div>
          </div>
          <h3 style={{ fontSize: 18, marginBottom: 8, color: t.text.primary.default }}>Column reduction</h3>
          <p style={{ fontSize: 14, color: t.text.secondary.default, marginBottom: 10 }}>As viewport narrows, columns halve to preserve readability.</p>
          <div
            role="img"
            aria-label="Column reduction across breakpoints: xl and lg twelve columns, md eight, sm and xs four"
            style={{
              background: t.bg.surface.secondary.default,
              borderRadius: 14,
              border: `1px solid ${t.border.default.default}`,
              padding: '32px 40px',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              marginBottom: 18,
              width: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {(() => {
              const colFill = isDark ? 'rgba(21,101,168,0.12)' : 'rgba(0,43,73,0.08)';
              const badgeBrandMuted = isDark ? 'rgba(21,101,168,0.12)' : 'rgba(0,43,73,0.08)';
              const badgeBase: CSSProperties = {
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'var(--font-mono), monospace',
                padding: '3px 8px',
                borderRadius: 4,
              };
              const badgeLgMd: CSSProperties = {
                ...badgeBase,
                background: badgeBrandMuted,
                color: t.text.brand.default,
              };
              const badgeSmXs: CSSProperties = {
                ...badgeBase,
                background: t.bg.surface.tertiary.default,
                color: t.text.secondary.default,
              };
              const frameBase: CSSProperties = {
                background: t.bg.surface.primary.default,
                border: `1.5px solid ${t.border.strong.default}`,
                borderRadius: 10,
                overflow: 'hidden',
                position: 'relative',
                height: 140,
                minWidth: 0,
              };
              const labelName: CSSProperties = {
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'var(--font-mono), monospace',
                color: t.text.primary.default,
              };
              const arrowCell: CSSProperties = {
                width: 40,
                minWidth: 40,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                color: ANN,
                fontWeight: 700,
              };
              const labelCol: CSSProperties = {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                textAlign: 'center',
              };
              const frames: {
                key: string;
                flex: number;
                cols: number;
                title: string;
                badge: string;
                badgeStyle: CSSProperties;
              }[] = [
                { key: 'xl-lg', flex: 2.8, cols: 12, title: 'xl / lg', badge: '12 col', badgeStyle: badgeLgMd },
                { key: 'md', flex: 2.2, cols: 8, title: 'md', badge: '8 col', badgeStyle: badgeLgMd },
                { key: 'sm', flex: 1.6, cols: 4, title: 'sm', badge: '4 col', badgeStyle: badgeSmXs },
                { key: 'xs', flex: 1.2, cols: 4, title: 'xs', badge: '4 col', badgeStyle: badgeSmXs },
              ];
              const framesRow: CSSProperties = {
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                width: '100%',
              };
              const labelsRow: CSSProperties = {
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0,
                width: '100%',
              };
              return (
                <>
                  <div style={framesRow}>
                    {frames.flatMap((f, i) => [
                      <div key={f.key} style={{ ...frameBase, flex: f.flex }}>
                        <div style={{ display: 'flex', height: '100%', gap: 3, padding: 8 }}>
                          {Array.from({ length: f.cols }).map((_, j) => (
                            <div
                              key={j}
                              style={{
                                flex: 1,
                                background: colFill,
                                borderRadius: 3,
                                minWidth: 0,
                              }}
                            />
                          ))}
                        </div>
                      </div>,
                      ...(i < frames.length - 1 ? [<div key={`${f.key}-arrow`} style={arrowCell}>→</div>] : []),
                    ])}
                  </div>
                  <div style={labelsRow}>
                    {frames.flatMap((f, i) => [
                      <div key={`${f.key}-label`} style={{ ...labelCol, flex: f.flex, minWidth: 0 }}>
                        <span style={labelName}>{f.title}</span>
                        <span style={f.badgeStyle}>{f.badge}</span>
                      </div>,
                      ...(i < frames.length - 1 ? [
                        <div key={`${f.key}-labsp`} style={{ width: 40, minWidth: 40, flexShrink: 0 }} aria-hidden />,
                      ] : []),
                    ])}
                  </div>
                </>
              );
            })()}
            <p
              style={{
                fontSize: 12,
                color: t.text.tertiary.default,
                textAlign: 'center',
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              The grid halves at each major breakpoint. 12 → 8 → 4 columns.
            </p>
          </div>
          <h3 style={{ fontSize: 18, marginBottom: 8, color: t.text.primary.default }}>Jump one step</h3>
          <Callout variant="info" title="The one-step rule">
            When a component uses <code>--space-6</code> at desktop, it drops one step to <code>--space-4</code> on tablet
            and <code>--space-3</code> on mobile. Do not skip multiple steps.
          </Callout>
          <div className="props-table-wrap">
            <table className="props-table">
              <thead><tr><th>COMPONENT</th><th>lg/xl desktop</th><th>md tablet</th><th>xs/sm mobile</th></tr></thead>
              <tbody>
                <tr><td>Page horizontal padding</td><td>--space-layout-xl (56px)</td><td>--space-layout-md (40px)</td><td>--space-4 (16px)</td></tr>
                <tr><td>Section vertical gap</td><td>--space-layout-lg (48px)</td><td>--space-layout-md (32px)</td><td>--space-layout-sm (24px)</td></tr>
                <tr><td>Card padding</td><td>--space-component-lg (24px)</td><td>--space-component-md (16px)</td><td>--space-component-sm (12px)</td></tr>
                <tr><td>Button padding (H)</td><td>--space-5 (20px)</td><td>--space-4 (16px)</td><td>--space-3 (12px)</td></tr>
                <tr><td>Grid gutter</td><td>32px (xl) / 24px (lg)</td><td>24px</td><td>16px</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="grid-influencers" style={{ marginBottom: 56 }}>
          <h2 className="section-title" style={sectionHeadingStyle}>Grid influencers</h2>
          <p style={sectionLead}>
            Grid influencers reshape the underlying grid when they appear. In VDS these are sidebar navigation and
            slide-in panels.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Card 1 — Sidebar navigation */}
            <div
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 14,
                overflow: 'hidden',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  height: 200,
                  background: t.bg.surface.secondary.default,
                  padding: 20,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'stretch',
                }}
              >
                {/* Collapsed */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', minWidth: 0 }}>
                  <div style={giMiniScreen}>
                    <div style={giMiniHeader} />
                    <div style={giMiniBody}>
                      <div
                        style={{
                          flex: 1,
                          padding: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 5,
                          minWidth: 0,
                        }}
                      >
                        {(['100%', '80%', '90%', '65%'] as const).map((w, i) => (
                          <div key={i} style={{ ...giBar, width: w }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={giIllCaption}>Collapsed</div>
                  <span style={giColBadge}>12 col</span>
                </div>
                <div
                  style={{
                    alignSelf: 'center',
                    flexShrink: 0,
                    fontSize: 14,
                    color: ANN,
                    fontWeight: 700,
                  }}
                >
                  →
                </div>
                {/* Open */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', minWidth: 0 }}>
                  <div style={giMiniScreen}>
                    <div style={giMiniHeader} />
                    <div style={giMiniBody}>
                      <div style={giSidebarStrip}>
                        <span style={{ ...giAnnLabel, transform: 'rotate(-90deg)' }}>260px</span>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          padding: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 5,
                          minWidth: 0,
                        }}
                      >
                        {(['100%', '72%', '78%', '58%'] as const).map((w, i) => (
                          <div key={i} style={{ ...giBar, width: w }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={giIllCaption}>Open</div>
                  <span style={giColBadge}>9 col</span>
                </div>
              </div>
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: `1px solid ${t.border.default.default}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>Sidebar navigation</div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                  Opening the sidebar compresses the content grid. Column count stays the same but each column narrows
                  to fit the remaining space.
                </p>
              </div>
            </div>

            {/* Card 2 — Slide-in panels */}
            <div
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 14,
                overflow: 'hidden',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  height: 200,
                  background: t.bg.surface.secondary.default,
                  padding: 20,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'stretch',
                }}
              >
                {/* No panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', minWidth: 0 }}>
                  <div style={giMiniScreen}>
                    <div style={giMiniHeader} />
                    <div style={giMiniBody}>
                      <div
                        style={{
                          flex: 1,
                          padding: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 5,
                          minWidth: 0,
                        }}
                      >
                        {(['100%', '85%', '90%', '70%'] as const).map((w, i) => (
                          <div key={i} style={{ ...giBar, width: w }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={giIllCaption}>No panel</div>
                  <span style={giColBadge}>12 col</span>
                </div>
                <div
                  style={{
                    alignSelf: 'center',
                    flexShrink: 0,
                    fontSize: 14,
                    color: ANN,
                    fontWeight: 700,
                  }}
                >
                  →
                </div>
                {/* Panel open */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', minWidth: 0 }}>
                  <div style={giMiniScreen}>
                    <div style={giMiniHeader} />
                    <div style={giMiniBody}>
                      <div
                        style={{
                          flex: 1,
                          padding: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 5,
                          minWidth: 0,
                        }}
                      >
                        {(['100%', '75%', '85%', '60%'] as const).map((w, i) => (
                          <div key={i} style={{ ...giBar, width: w }} />
                        ))}
                      </div>
                      <div style={giPanelStrip}>
                        <span style={{ ...giAnnLabel, transform: 'rotate(90deg)' }}>360px</span>
                      </div>
                    </div>
                  </div>
                  <div style={giIllCaption}>Panel open</div>
                  <span style={giColBadge}>9 col</span>
                </div>
              </div>
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: `1px solid ${t.border.default.default}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>Slide-in panels</div>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                  Slide-in panels push the content grid — they don&apos;t overlay it. Use when users need to reference
                  both the main content and the panel simultaneously.
                </p>
              </div>
            </div>
          </div>
          <Callout variant="warning" title="Grid influencers are not modals">
            Modals, overlay drawers, and tooltips do not affect the grid. Only components that push and reshape
            the content area are grid influencers.
          </Callout>
        </section>

        <section id="continuity-contrast" style={{ marginBottom: 20 }}>
          <h2 className="section-title" style={sectionHeadingStyle}>Continuity &amp; contrast</h2>
          <p style={sectionLead}>
            Spacing creates rhythm across products. Consistency builds orientation; contrast prevents monotony
            and strengthens hierarchy.
          </p>
          <h3 style={{ fontSize: 18, marginBottom: 8, color: t.text.primary.default }}>Consistency across screens</h3>
          <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6 }}>
            The same spacing token should produce the same result across pages, creating a continuous visual anchor.
          </p>
          <div
            style={{
              background: t.bg.surface.secondary.default,
              borderRadius: 14,
              border: `1px solid ${t.border.default.default}`,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div style={{ flex: 1, height: 1, background: 'rgba(232,24,109,0.2)' }} />
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono), monospace',
                  color: ANN,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                Consistent anchor across screens
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(232,24,109,0.2)' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {(['Dashboard', 'Settings', 'Profile'] as const).map((label) => (
                <div
                  key={label}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <div
                    style={{
                      background: t.bg.surface.primary.default,
                      border: `1.5px solid ${t.border.strong.default}`,
                      borderRadius: 10,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        height: 18,
                        background: t.bg.surface.tertiary.default,
                        borderBottom: `1px solid ${t.border.default.default}`,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div
                        style={{
                          height: 2,
                          background: ANN,
                          opacity: 0.6,
                          borderRadius: 1,
                          marginBottom: 4,
                        }}
                      />
                      {(['90%', '70%', '80%'] as const).map((w, i) => (
                        <div
                          key={i}
                          style={{
                            height: 6,
                            background: t.bg.surface.tertiary.default,
                            borderRadius: 2,
                            width: w,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: t.text.secondary.default,
                      textAlign: 'center',
                      marginTop: 8,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: 18, marginBottom: 8, color: t.text.primary.default }}>Contrast creates hierarchy</h3>
          <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 12 }}>
            Uniform spacing flattens hierarchy. Vary spacing to reveal information importance.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Do */}
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
                  height: 240,
                  background: t.bg.surface.secondary.default,
                  padding: 24,
                  position: 'relative',
                  boxSizing: 'border-box',
                  overflow: 'auto',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div
                    style={{
                      height: 10,
                      width: '35%',
                      background: t.text.primary.default,
                      opacity: 0.7,
                      borderRadius: 2,
                      marginBottom: 12,
                    }}
                  />
                  <div
                    style={{
                      height: 7,
                      width: '85%',
                      background: t.bg.surface.tertiary.default,
                      borderRadius: 2,
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 7,
                      width: '70%',
                      background: t.bg.surface.tertiary.default,
                      borderRadius: 2,
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: 'var(--font-mono), monospace',
                        color: ANN,
                        fontWeight: 700,
                      }}
                    >
                      32px
                    </span>
                  </div>
                  <div
                    style={{
                      height: 10,
                      width: '35%',
                      background: t.text.primary.default,
                      opacity: 0.7,
                      borderRadius: 2,
                      marginBottom: 12,
                    }}
                  />
                  <div
                    style={{
                      height: 7,
                      width: '85%',
                      background: t.bg.surface.tertiary.default,
                      borderRadius: 2,
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 7,
                      width: '70%',
                      background: t.bg.surface.tertiary.default,
                      borderRadius: 2,
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 7,
                      width: '75%',
                      background: t.bg.surface.tertiary.default,
                      borderRadius: 2,
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: 'var(--font-mono), monospace',
                        color: ANN,
                        fontWeight: 700,
                      }}
                    >
                      32px
                    </span>
                  </div>
                  <div
                    style={{
                      height: 10,
                      width: '35%',
                      background: t.text.primary.default,
                      opacity: 0.7,
                      borderRadius: 2,
                      marginBottom: 12,
                    }}
                  />
                  <div
                    style={{
                      height: 7,
                      width: '85%',
                      background: t.bg.surface.tertiary.default,
                      borderRadius: 2,
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 7,
                      width: '70%',
                      background: t.bg.surface.tertiary.default,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
              <div style={{ height: 3, width: '100%', background: '#0A8853' }} />
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    width: 'fit-content',
                    border: 'none',
                    background: 'rgba(10,136,83,0.10)',
                    color: '#0A8853',
                  }}
                >
                  ✓ Do
                </span>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                  Generous section spacing makes structure instantly scannable without reading labels.
                </p>
              </div>
            </div>

            {/* Don't */}
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
                  height: 240,
                  background: t.bg.surface.secondary.default,
                  padding: 24,
                  position: 'relative',
                  boxSizing: 'border-box',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontSize: 9,
                    fontFamily: 'var(--font-mono), monospace',
                    color: ANN,
                    fontWeight: 700,
                  }}
                >
                  all gaps 10px
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(['85%', '70%', '75%', '65%', '80%', '60%'] as const).map((w, i) => (
                    <div
                      key={i}
                      style={{
                        height: 7,
                        width: w,
                        background: t.bg.surface.tertiary.default,
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ height: 3, width: '100%', background: ANN }} />
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    width: 'fit-content',
                    border: 'none',
                    background: 'rgba(232,24,109,0.10)',
                    color: ANN,
                  }}
                >
                  × Don&apos;t
                </span>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                  Uniform spacing flattens hierarchy. Users must read every label to understand structure.
                </p>
              </div>
            </div>
          </div>

          <Callout variant="tip" title="Rhythm over rules">
            You do not need to memorize every token. Aim for rhythm: when something feels off, move one spacing
            step up or down.
          </Callout>
        </section>
      </section>

      {copied ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: isDark ? '#5B9FD4' : '#002b49',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            zIndex: 999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          var({copied}) copied
        </div>
      ) : null}

      <TableOfContents items={tocItems} />
    </>
  );
}
